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
    try {
      // Extract data from the event
      const { messages, ragContext, sessionId } = event.data;
      
      console.log("Starting handleChat function with sessionId:", sessionId);
      console.log("Event data:", JSON.stringify(event.data));
      
      // Process with AI-Kit
      const response = await step.run("process-with-ai-kit", async () => {
        try {
          console.log("Processing chat message with Inngest AI-Kit");
          
          // Get the last user message
          const lastMessage = messages[messages.length - 1];
          const userContent = lastMessage?.content || "No content provided";
          
          console.log("Processing message with content:", userContent);
          
          // Return a simple response for now
          const result = {
            content: `This is a response from Inngest AI-Kit. You asked: "${userContent}".
            
In a production environment, this would be processed by the AI model.`
          };
          
          console.log("AI-Kit response generated:", result);
          
          return {
            content: result.content
          };
        } catch (error) {
          console.error("Error in process-with-ai-kit step:", error);
          return {
            content: "Sorry, there was an error processing your message with AI-Kit. Please try again later."
          };
        }
      });
      
      console.log("handleChat function completed successfully");
      
      // Return the final result with a clear response
      const finalResponse = {
        response: response.content,
        sessionId: sessionId,
        completed: true,
        timestamp: new Date().toISOString(),
        status: "success"
      };
      
      console.log("Returning final response:", finalResponse);
      
      return finalResponse;
    } catch (error: any) {
      console.error("Error in handleChat function:", error);
      
      // Return an error response
      return {
        error: "Failed to process chat message",
        errorMessage: error?.message || "Unknown error",
        completed: true,
        timestamp: new Date().toISOString()
      };
    }
  }
);
