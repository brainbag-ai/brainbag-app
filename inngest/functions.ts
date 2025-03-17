import { inngest } from "./client";
import { chatAgent } from "./ai-agent";
import { openai } from "inngest";

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
      const { messages, ragContext, sessionId, selectedFilePathnames } = event.data;
      
      console.log("Starting handleChat function with sessionId:", sessionId);
      
      // Get the last user message
      const lastMessage = messages[messages.length - 1];
      const userContent = typeof lastMessage?.content === 'string'
        ? lastMessage.content
        : lastMessage?.content?.filter((c: any) => c.type === 'text')?.map((c: any) => c.text)?.join("\n") || "No content provided";
      
      console.log("Processing message with content:", userContent);
      
      // Prepare the context from RAG if available
      let contextPrompt = "";
      if (ragContext && ragContext.trim() !== "") {
        contextPrompt = `\n\nHere is some relevant context that might help you answer:\n${ragContext}`;
      }
      
        try {
          console.log("Trying to use agent-kit server...");
          
          // The agent-kit server should be running on port 3001
          const agentResponse = await fetch('http://localhost:3001/agents/Chat%20Agent/run', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              input: userContent + contextPrompt,
            }),
          });
          
          if (!agentResponse.ok) {
            throw new Error(`Agent server returned ${agentResponse.status}: ${await agentResponse.text()}`);
          }
          
          const agentResult = await agentResponse.json();
          console.log("AI-Kit response from agent server:", agentResult);
          
          return {
            response: agentResult.output || "No response generated from AI model.",
            sessionId,
            completed: true,
            timestamp: new Date().toISOString(),
            status: "success"
          };
        } catch (serverError) {
          console.error("Error calling agent-kit server:", serverError);
          
          // Return a fallback response
          return {
            response: `I couldn't connect to the AI service at the moment. Please make sure the agent-kit server is running with 'npm run agent-server'.
            
You asked: "${userContent}"

I'll try to help you as soon as the service is back online.`,
            sessionId,
            completed: true,
            error: true,
            timestamp: new Date().toISOString()
          };
        }
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
