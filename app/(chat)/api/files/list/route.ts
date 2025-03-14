import { list } from "@vercel/blob";
import { ensureSessionUser } from "@/app/db";

export async function GET(request: Request) {
  // Get the session ID from the request
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return Response.json({ error: "Session ID is required" }, { status: 400 });
  }
  
  // Ensure the session user exists
  const userId = await ensureSessionUser(sessionId);
  
  const { blobs } = await list({ prefix: userId });

  return Response.json(
    blobs.map((blob) => ({
      ...blob,
      pathname: blob.pathname.replace(`${userId}/`, ""),
    })),
  );
}
