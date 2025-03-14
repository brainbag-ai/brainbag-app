import { getChunksByFilePaths, ensureSessionUser, getChunksByUserId } from "@/app/db";
import { openai } from "@ai-sdk/openai";
import {
  cosineSimilarity,
  embed,
  embedMany,
  Experimental_LanguageModelV1Middleware,
} from "ai";
import { z } from "zod";

// schema for validating the custom provider metadata
const selectionSchema = z.object({
  files: z.object({
    selection: z.array(z.string()),
  }),
  sessionId: z.string().optional(),
});

export const ragMiddleware: Experimental_LanguageModelV1Middleware = {
  transformParams: async ({ params }) => {
    const { prompt: messages, providerMetadata } = params;

    // validate the provider metadata with Zod:
    const { success, data } = selectionSchema.safeParse(providerMetadata);

    if (!success) return params; // invalid metadata

    const selection = data.files.selection;
    const sessionId = data.sessionId;

    if (!sessionId || selection.length === 0) return params; // no session ID or no files selected

    const recentMessage = messages.pop();

    if (!recentMessage || recentMessage.role !== "user") {
      if (recentMessage) {
        messages.push(recentMessage);
      }

      return params;
    }

    const lastUserMessageContent = recentMessage.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("\n");

    // For simplicity, we'll assume all user messages are questions
    // and skip the classification step

    // Ensure the session user exists
    const userId = await ensureSessionUser(sessionId);
    
    // find relevant chunks based on the selection and include user's chat history
    const chunksBySelection = await getChunksByFilePaths({
      filePaths: selection.map((path) => `${userId}/${path}`),
      userId: userId, // Include chat chunks from this user
    });

    if (chunksBySelection.length === 0) {
      // No chunks found, just return the original message
      messages.push(recentMessage);
      return params;
    }

    // Generate embedding for the user's question
    const { embeddings: questionEmbedding } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: [lastUserMessageContent],
    });

    // Calculate similarity scores for each chunk
    const chunksWithSimilarity = chunksBySelection.map(chunk => {
      // Calculate cosine similarity between the question embedding and the chunk embedding
      const similarity = cosineSimilarity(questionEmbedding[0], chunk.embedding);
      
      return {
        ...chunk,
        similarity
      };
    });

    // Sort by similarity (highest first)
    chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    
    // Take top 5 chunks
    const topChunks = chunksWithSimilarity.slice(0, 5);

    // add the chunks to the last user message
    messages.push({
      role: "user",
      content: [
        ...recentMessage.content,
        {
          type: "text",
          text: "Here is some relevant information that you can use to answer the question:",
        },
        ...topChunks.map((chunk) => ({
          type: "text" as const,
          text: chunk.content,
        })),
      ],
    });

    return { ...params, prompt: messages };
  },
};
