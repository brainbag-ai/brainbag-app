-- Add new columns to the Chunk table
ALTER TABLE "Chunk" ALTER COLUMN "filePath" DROP NOT NULL;
ALTER TABLE "Chunk" ADD COLUMN IF NOT EXISTS "chatId" text REFERENCES "Chat"("id");
ALTER TABLE "Chunk" ADD COLUMN IF NOT EXISTS "createdAt" timestamp NOT NULL DEFAULT NOW();
ALTER TABLE "Chunk" ADD COLUMN IF NOT EXISTS "userId" varchar(64) REFERENCES "User"("email");