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
    if (!sessionId) return params; // no session ID

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
    // Get chunks based on the user's selection and chat history
    let chunks = [];
    
    if (selection.length > 0) {
      // If files are selected, get chunks from those files plus chat history
      chunks = await getChunksByFilePaths({
        filePaths: selection.map((path) => `${userId}/${path}`),
        userId: userId, // Include chat chunks from this user
      });
    } else {
      // If no files are selected, just get the user's chat history chunks
      chunks = await getChunksByUserId({ userId });
    }

    if (chunks.length === 0) {
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
    const chunksWithSimilarity = chunks.map(chunk => {
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

    // Prepare the top chunks with metadata for visualization
    const topChunksWithMetadata = topChunks.map(chunk => ({
      content: chunk.content,
      similarity: chunk.similarity,
      source: chunk.filePath ? 'file' : 'chat',
      filePath: chunk.filePath,
      id: chunk.id
    }));

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

    // Log the exact prompt that will be sent to the OpenAI API
    // Use a safer approach to avoid circular references
    try {
      console.log("OpenAI API Prompt - Messages:", JSON.stringify(messages, null, 2));
      console.log("OpenAI API Prompt - Parameters:", JSON.stringify({
        temperature: params.temperature,
        maxTokens: params.maxTokens,
        topP: params.topP,
        presencePenalty: params.presencePenalty,
        frequencyPenalty: params.frequencyPenalty
      }, null, 2));
    } catch (error) {
      console.log("Error logging OpenAI API Prompt:", error);
    }

    // Return the params with the chunks metadata
    return { 
      ...params, 
      prompt: messages,
      ragMetadata: {
        chunks: topChunksWithMetadata
      }
    };
  },
};
