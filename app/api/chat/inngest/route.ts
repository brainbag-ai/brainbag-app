import { inngest } from "../../../../inngest/client";
import { ragMiddleware } from "../../../../ai/rag-middleware";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { getChunksByFilePaths, ensureSessionUser, getChunksByUserId } from "@/app/db";
import { cosineSimilarity } from "ai";

/**
 * API route for handling chat requests via Inngest
 * This route sends a chat/message event to Inngest for processing
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { messages, selectedFilePathnames, sessionId, chatId } = body;
  
  // Extract the last user message
  const lastUserMessage = messages[messages.length - 1];
  let ragContext = "";
  
  if (lastUserMessage && lastUserMessage.role === "user") {
    try {
      // Get the content of the last user message
      const userMessageContent = typeof lastUserMessage.content === 'string' 
        ? lastUserMessage.content 
        : lastUserMessage.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join("\n");
      
      // Ensure the session user exists
      const userId = await ensureSessionUser(sessionId);
      
      // Get chunks based on the user's selection and chat history
      let chunks = [];
      
      if (selectedFilePathnames && selectedFilePathnames.length > 0) {
        // If files are selected, get chunks from those files plus chat history
        chunks = await getChunksByFilePaths({
          filePaths: selectedFilePathnames.map((path: string) => `${userId}/${path}`),
          userId: userId, // Include chat chunks from this user
        });
      } else {
        // If no files are selected, just get the user's chat history chunks
        chunks = await getChunksByUserId({ userId });
      }
      
      if (chunks.length > 0) {
        // Generate embedding for the user's question
        const { embeddings: questionEmbedding } = await embedMany({
          model: openai.embedding("text-embedding-3-small"),
          values: [userMessageContent],
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
        
        // Format the RAG context
        ragContext = "Here is some relevant information that might help you answer:\n\n" + 
          topChunks.map(chunk => chunk.content).join("\n\n");
        
        console.log("Generated RAG context for Inngest:", ragContext.substring(0, 200) + "...");
      } else {
        console.log("No chunks found for RAG context");
      }
    } catch (error) {
      console.error("Error generating RAG context:", error);
      // If there's an error, we'll continue without RAG context
    }
  }
  
  // Send event to Inngest
  const result = await inngest.send({
    name: "chat/message",
    data: {
      messages,
      ragContext,
      sessionId,
      chatId,
      selectedFilePathnames,
    },
  });
  
  // Return a response that the client can use to poll for results
  return Response.json({
    message: "Chat event sent to Inngest",
    eventId: result.ids[0],
  });
}
