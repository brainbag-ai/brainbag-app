import { customModel } from "@/ai";
import { createMessage, ensureSessionUser } from "@/app/db";
import { streamText } from "ai";
import { USE_INNGEST_AI_KIT } from "@/utils/constants";

export async function POST(request: Request) {
  const { id, messages, selectedFilePathnames, sessionId, useInngest } = await request.json();
  
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

  // Log the initial request parameters before they're processed by middleware
  try {
    console.log("Initial API Request - System:", "You are a friendly assistant! Keep your responses concise and helpful.\n\nIMPORTANT: All user messages are being recorded in the database and can be retrieved for context. The system uses RAG (Retrieval-Augmented Generation) to automatically find and provide relevant information from past conversations when needed. You can confidently refer to information from previous conversations, as the system will ensure you have access to relevant context through the RAG middleware.");
    console.log("Initial API Request - Messages:", JSON.stringify(messages, null, 2));
    console.log("Initial API Request - Selected Files:", JSON.stringify(selectedFilePathnames, null, 2));
    console.log("Initial API Request - Session ID:", sessionId);
    console.log("Initial API Request - Use Inngest:", useInngest);
  } catch (error) {
    console.log("Error logging Initial API Request:", error);
  }

  // Check if we should use Inngest AI-Kit
  if (useInngest) {
    // Send the request to the Inngest API route
    const inngestResponse = await fetch(`${request.headers.get('origin')}/api/chat/inngest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        selectedFilePathnames,
        sessionId,
        chatId: id,
      }),
    });

    if (!inngestResponse.ok) {
      return new Response("Failed to send message to Inngest", { status: 500 });
    }

    const inngestData = await inngestResponse.json();

    // Return a response that the client can use to poll for results
    return Response.json({
      eventId: inngestData.eventId,
      useInngest: true,
    });
  }

  // Use the direct OpenAI integration
  const result = streamText({
    model: customModel,
    system:
      "You are a friendly assistant! Keep your responses concise and helpful.\n\nIMPORTANT: All user messages are being recorded in the database and can be retrieved for context. The system uses RAG (Retrieval-Augmented Generation) to automatically find and provide relevant information from past conversations when needed. You can confidently refer to information from previous conversations, as the system will ensure you have access to relevant context through the RAG middleware.",
    messages,
    experimental_providerMetadata: {
      files: {
        selection: selectedFilePathnames,
      },
      sessionId: sessionId,
    },
    onFinish: async ({ text }) => {
      // For now, we'll just store the assistant's message without RAG metadata
      // The RAG metadata will be added to the response by the middleware
      
      // Store the assistant's message
      await createMessage({
        id,
        messages: [...messages, { 
          role: "assistant", 
          content: text
        }],
        author: userId
      });
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  // Return the response
  return result.toDataStreamResponse({
    // Add the RAG metadata as custom headers
    headers: {
      'X-RAG-Metadata': 'true'
    }
  });
}
