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
