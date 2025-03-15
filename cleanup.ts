import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { chat, chunk, user } from "./schema";
import { list, del } from "@vercel/blob";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Parse command line arguments
const args = process.argv.slice(2);
const preserveUsers = args.includes("--preserve-users");
const dryRun = args.includes("--dry-run");

async function cleanup() {
  console.log("Starting cleanup process...");
  if (dryRun) {
    console.log("DRY RUN MODE: No actual deletions will be performed");
  }

  // Connect to the database
  const client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
  const db = drizzle(client);

  try {
    // 1. Delete all chunks
    console.log("Deleting all chunks...");
    if (!dryRun) {
      const deleteChunksResult = await db.delete(chunk);
      console.log(`Deleted chunks: ${JSON.stringify(deleteChunksResult)}`);
    }

    // 2. Delete all chats
    console.log("Deleting all chats...");
    if (!dryRun) {
      const deleteChatsResult = await db.delete(chat);
      console.log(`Deleted chats: ${JSON.stringify(deleteChatsResult)}`);
    }

    // 3. Delete all files from Vercel Blob storage
    console.log("Deleting all files from Vercel Blob storage...");
    
    // List all blobs
    const { blobs } = await list();
    console.log(`Found ${blobs.length} files to delete`);
    
    // Delete each blob
    if (!dryRun) {
      for (const blob of blobs) {
        console.log(`Deleting file: ${blob.pathname}`);
        await del(blob.url);
      }
      console.log("All files deleted successfully");
    }

    // 4. Delete users if not preserving them
    if (!preserveUsers) {
      console.log("Deleting all users...");
      if (!dryRun) {
        const deleteUsersResult = await db.delete(user);
        console.log(`Deleted users: ${JSON.stringify(deleteUsersResult)}`);
      }
    } else {
      console.log("Preserving user accounts as requested");
    }

    console.log("Cleanup completed successfully!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

// Display help if requested
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Cleanup Script - Removes all chunks, chats, files, and optionally users

Usage:
  npm run cleanup -- [options]

Options:
  --preserve-users  Keep user accounts while deleting all other data
  --dry-run         Show what would be deleted without actually deleting
  --help, -h        Show this help message

Examples:
  npm run cleanup                     # Delete everything
  npm run cleanup -- --preserve-users # Delete everything except user accounts
  npm run cleanup -- --dry-run        # Show what would be deleted without deleting
  `);
} else {
  // Run the cleanup function
  cleanup().catch(console.error);
}
