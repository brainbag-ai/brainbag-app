// Constants that can be shared between client and server

// Generate a unique session ID for the user
export function generateSessionId() {
  // Generate a random string with timestamp to ensure uniqueness
  const timestamp = new Date().getTime();
  const random = Math.random().toString(36).substring(2, 10);
  return `user_${timestamp}_${random}@session.local`;
}

// Local storage key for session ID
export const SESSION_ID_KEY = "chat_session_id";