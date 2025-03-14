import { deleteChunksByFilePath, ensureSessionUser } from "@/app/db";
import { head, del } from "@vercel/blob";

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");
  
  if (!sessionId) {
    return new Response("Session ID is required", { status: 400 });
  }
  
  // Ensure the session user exists
  const userId = await ensureSessionUser(sessionId);

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  const fileurl = searchParams.get("fileurl");

  if (fileurl === null) {
    return new Response("File url not provided", { status: 400 });
  }

  const { pathname } = await head(fileurl);

  if (!pathname.startsWith(userId)) {
    return new Response("Unauthorized", { status: 400 });
  }

  await del(fileurl);
  await deleteChunksByFilePath({ filePath: pathname });

  return Response.json({});
}
