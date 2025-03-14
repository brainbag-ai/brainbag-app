import { getChatsByUser, ensureSessionUser } from "@/app/db";
import { SESSION_ID_KEY } from "@/utils/constants";

export async function GET(request: Request) {
  // Get the session ID from the request
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return Response.json({ error: "Session ID is required" }, { status: 400 });
  }
  
  // Ensure the session user exists
  const userId = await ensureSessionUser(sessionId);
  
  const chats = await getChatsByUser({ email: userId });
  return Response.json(chats);
}
