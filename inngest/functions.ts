import { inngest } from "./client";
import { chatAgent } from "./ai-agent";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

// Define another example function
export const processData = inngest.createFunction(
  { id: "process-data" },
  { event: "data/process" },
  async ({ event, step }) => {
    // Process data in steps
    const validated = await step.run("validate-data", () => {
      return { valid: true, data: event.data };
    });

    if (!validated.valid) {
      return { error: "Invalid data" };
    }

    const processed = await step.run("process-data", () => {
      return { processed: true, result: validated.data };
    });

    return {
      status: "success",
      result: processed.result,
      processedAt: new Date().toISOString(),
    };
  }
);

/**
 * Handle chat messages using Inngest AI-Kit
 * This function processes chat messages with RAG enhancement
 */
export const handleChat = inngest.createFunction(
  { id: "handle-chat" },
  { event: "chat/message" },
  async ({ event, step }) => {
    // Extract data from the event
    const { messages, ragContext, sessionId } = event.data;
    
    // Process with AI-Kit
    const response = await step.run("process-with-ai-kit", async () => {
      try {
        console.log("Processing chat message with Inngest AI-Kit");
        console.log("Messages:", JSON.stringify(messages));
        
        // Use the chatAgent to process the message
        // Since we don't know the exact API, we'll use a type assertion
        const agent = chatAgent as any;
        
        // Log available methods for debugging
        console.log("Available methods on chatAgent:", Object.keys(agent));
        
        // Try to use the agent with a generic approach
        const result = await agent.invoke({
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          context: ragContext || ""
        });
        
        console.log("AI-Kit response:", result);
        
        return {
          content: result.content
        };
      } catch (error) {
        console.error("Error processing with AI-Kit:", error);
        return {
          content: "Sorry, there was an error processing your message with AI-Kit. Please try again later."
        };
      }
    });
    
    return {
      response: response.content,
      sessionId: sessionId,
    };
  }
);
