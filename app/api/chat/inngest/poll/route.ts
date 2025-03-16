/**
 * API route for polling Inngest results
 * This route simulates polling for results from Inngest
 * In a real implementation, we would query Inngest for the actual result
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  
  if (!eventId) {
    return Response.json({ error: "No event ID provided" }, { status: 400 });
  }
  try {
    // Query Inngest for the event result
    // We need to use the Inngest SDK to get the event result
    // This requires importing the Inngest client
    const inngest = (await import("../../../../../inngest/client")).inngest;
    
    // Log the event ID for debugging
    console.log("Polling for event result with ID:", eventId);
    
    // Query Inngest for the event result
    // Note: The exact API call depends on the Inngest SDK version
    // This is a common pattern, but may need adjustment
    const eventResult = await fetch(`${process.env.INNGEST_BASE_URL || 'http://localhost:8288'}/v1/events/${eventId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!eventResult.ok) {
      console.error("Error fetching event result:", await eventResult.text());
      return Response.json({
        error: "Failed to fetch event result",
        completed: false
      }, { status: 500 });
    }
    
    const result = await eventResult.json();
    console.log("Event result:", result);
    
    // Check if the event has completed
    if (result.state === "completed" || result.state === "success") {
      return Response.json({
        response: result.output?.response || "No response from Inngest",
        completed: true,
      });
    } else {
      // Event is still processing
      return Response.json({
        completed: false,
        state: result.state,
      });
    }
  } catch (error) {
    console.error("Error polling for event result:", error);
    
    // For now, fall back to a simulated response if there's an error
    // This ensures the UI doesn't get stuck
    return Response.json({
      response: "Error fetching result from Inngest. This is a fallback response.",
      completed: true,
      error: true,
    });
  }
}