import { drizzle } from "drizzle-orm/postgres-js";
import { desc, eq, inArray, or, and, isNull } from "drizzle-orm";
import postgres from "postgres";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { chat, chunk, user } from "@/schema";
import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { v4 as uuidv4 } from "uuid";
import { Message } from "ai";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

export async function getUser(email: string) {
  return await db.select().from(user).where(eq(user.email, email));
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  return await db.insert(user).values({ email, password: hash });
}

// Ensure a user exists for the given session ID
export async function ensureSessionUser(sessionId: string) {
  const users = await getUser(sessionId);
  
  if (users.length === 0) {
    // Create a new user for this session with a random password
    const randomPassword = Math.random().toString(36).slice(-8);
    await createUser(sessionId, randomPassword);
  }
  
  return sessionId;
}

export async function createMessage({
  id,
  messages,
  author,
}: {
  id: string;
  messages: any;
  author: string;
}) {
  const selectedChats = await db.select().from(chat).where(eq(chat.id, id));
  const now = new Date();
  
  // First, ensure the chat record exists in the database
  let chatExists = selectedChats.length > 0;
  
  if (!chatExists) {
    // Insert the chat record first
    await db.insert(chat).values({
      id,
      createdAt: now,
      messages: JSON.stringify(messages),
      author,
    });
    chatExists = true;
  } else {
    // Update the existing chat record
    await db
      .update(chat)
      .set({
        messages: JSON.stringify(messages),
      })
      .where(eq(chat.id, id));
  }
  
  // Now that we're sure the chat record exists, we can add the message to chunks
  const lastMessage = messages[messages.length - 1];
  
  if (lastMessage && chatExists) {
    try {
      // Generate embedding for the message content
      let messageContent = '';
      
      if (typeof lastMessage.content === 'string') {
        messageContent = lastMessage.content;
      } else if (Array.isArray(lastMessage.content)) {
        // Extract text content from message parts
        messageContent = lastMessage.content
          .filter((part: any) => part.type === 'text')
          .map((part: any) => part.text)
          .join('\n');
      }
      
      // Only add to chunks if the message has meaningful content
      if (messageContent.length > 0) {
        try {
          // Generate a real embedding for the message content using embedMany for consistency
          const { embeddings } = await embedMany({
            model: openai.embedding("text-embedding-3-small"),
            values: [messageContent],
          });
          
          // Create a chunk for the message with the real embedding
          await db.insert(chunk).values({
            id: `chat-${id}-${messages.length}`,
            filePath: null,
            chatId: id,
            content: messageContent,
            embedding: embeddings[0],
            createdAt: now,
            userId: author
          });
        } catch (embeddingError) {
          console.error("Error generating embedding:", embeddingError);
          // If embedding fails, fall back to a dummy embedding
          const dummyEmbedding = Array(1536).fill(0);
          
          await db.insert(chunk).values({
            id: `chat-${id}-${messages.length}`,
            filePath: null,
            chatId: id,
            content: messageContent,
            embedding: dummyEmbedding,
            createdAt: now,
            userId: author
          });
        }
      }
    } catch (error) {
      console.error("Error adding message to chunks:", error);
      // Continue with saving the message even if embedding fails
    }
  }

  // Return success
  return { success: true };
}

export async function getChatsByUser({ email }: { email: string }) {
  return await db
    .select()
    .from(chat)
    .where(eq(chat.author, email))
    .orderBy(desc(chat.createdAt));
}

export async function getChatById({ id }: { id: string }) {
  const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
  return selectedChat;
}

export async function insertChunks({ chunks }: { chunks: any[] }) {
  return await db.insert(chunk).values(chunks);
}

export async function getChunksByFilePaths({
  filePaths,
  userId,
}: {
  filePaths: Array<string>;
  userId?: string;
}) {
  // If userId is provided, also include chat chunks from that user
  if (userId) {
    return await db
      .select()
      .from(chunk)
      .where(
        or(
          inArray(chunk.filePath, filePaths),
          and(
            eq(chunk.userId, userId),
            isNull(chunk.filePath)
          )
        )
      );
  }
  
  // Otherwise, just return file chunks
  return await db
    .select()
    .from(chunk)
    .where(inArray(chunk.filePath, filePaths));
}

// Get chunks by user ID (for chat history)
export async function getChunksByUserId({
  userId,
}: {
  userId: string;
}) {
  return await db
    .select()
    .from(chunk)
    .where(eq(chunk.userId, userId));
}

export async function deleteChunksByFilePath({
  filePath,
}: {
  filePath: string;
}) {
  return await db.delete(chunk).where(eq(chunk.filePath, filePath));
}
