import { inngest } from "../../../../inngest/client";
import { ragMiddleware } from "../../../../ai/rag-middleware";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";

/**
 * API route for handling chat requests via Inngest
 * This route sends a chat/message event to Inngest for processing
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { messages, selectedFilePathnames, sessionId, chatId } = body;
  
  // Use the existing RAG middleware logic to get context
  // We'll extract just the RAG context without modifying the messages
  const lastUserMessage = messages[messages.length - 1];
  let ragContext = "";
  
  if (lastUserMessage && lastUserMessage.role === "user") {
    // Get the content of the last user message
    const userMessageContent = typeof lastUserMessage.content === 'string' 
      ? lastUserMessage.content 
      : lastUserMessage.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join("\n");
    
    // For the POC, we'll just send the event without actual RAG context
    // In a real implementation, we would extract the RAG context from the middleware
    ragContext = `User query: ${userMessageContent}`;
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