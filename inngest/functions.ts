import { inngest } from "./client";

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
