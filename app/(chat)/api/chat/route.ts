import { customModel } from "@/ai";
import { createMessage, ensureSessionUser } from "@/app/db";
import { streamText } from "ai";

export async function POST(request: Request) {
  const { id, messages, selectedFilePathnames, sessionId } = await request.json();
  
  if (!sessionId) {
    return new Response("Session ID is required", { status: 400 });
  }
  
  // Ensure the session user exists
  const userId = await ensureSessionUser(sessionId);
  
  // Save the user's message to the database first
  // This ensures the user's message is stored with proper embeddings
  // Extract the user's new message (the last message in the array)
  const userMessage = messages[messages.length - 1];
  
  // Only process if it's a user message
  if (userMessage && userMessage.role === 'user') {
    // Create a separate message array with just the user's new message
    const userMessageArray = [userMessage];
    
    await createMessage({
      id,
      messages: userMessageArray,
      author: userId,
    });
  }

  const result = streamText({
    model: customModel,
    system:
      "you are a friendly assistant! keep your responses concise and helpful.",
    messages,
    experimental_providerMetadata: {
      files: {
        selection: selectedFilePathnames,
      },
      sessionId: sessionId,
    },
    onFinish: async ({ text }) => {
      await createMessage({
        id,
        messages: [...messages, { role: "assistant", content: text }],
        author: userId,
      });
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}
