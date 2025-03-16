import { inngest } from "../../../inngest/client";

export async function GET(request: Request) {
  // Get data from query parameter or use default
  const { searchParams } = new URL(request.url);
  const value = searchParams.get("value") || "test-data";

  // Send the event to Inngest
  const result = await inngest.send({
    name: "data/process",
    data: {
      value: value,
      timestamp: new Date().toISOString(),
    },
  });

  // Return the result
  return Response.json({
    message: "Process data event sent to Inngest",
    eventId: result.ids[0],
    data: { value },
  });
}