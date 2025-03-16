import { inngest } from "../../../inngest/client";

export async function GET(request: Request) {
  // Get email from query parameter or use a default
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "test@example.com";

  // Send the event to Inngest
  const result = await inngest.send({
    name: "test/hello.world",
    data: {
      email: email,
    },
  });

  // Return the result
  return Response.json({
    message: "Event sent to Inngest",
    eventId: result.ids[0],
    email: email,
  });
}