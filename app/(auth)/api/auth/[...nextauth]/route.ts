// Import the auth functions
import { auth, signIn, signOut } from "@/app/(auth)/auth";

// Define route handlers that properly handle params and searchParams
export async function GET(request: Request, { params }: { params: { nextauth: string[] } }) {
  // Handle GET requests for auth API
  return new Response(JSON.stringify({
    message: "Auth API GET",
    path: params.nextauth
  }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request, { params }: { params: { nextauth: string[] } }) {
  // Handle POST requests for auth API
  return new Response(JSON.stringify({
    message: "Auth API POST",
    path: params.nextauth
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
