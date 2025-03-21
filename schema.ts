import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  real,
  timestamp,
  json,
} from "drizzle-orm/pg-core";

export const user = pgTable("User", {
  email: varchar("email", { length: 64 }).primaryKey().notNull(),
  password: varchar("password", { length: 64 }),
});

export const chat = pgTable("Chat", {
  id: text("id").primaryKey().notNull(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  metadata: json("metadata"),
  author: varchar("author", { length: 64 })
    .notNull()
    .references(() => user.email),
});

export const chunk = pgTable("Chunk", {
  id: text("id").primaryKey().notNull(),
  filePath: text("filePath"),
  chatId: text("chatId").references(() => chat.id),
  content: text("content").notNull(),
  embedding: real("embedding").array().notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  userId: varchar("userId", { length: 64 }).references(() => user.email),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

export type Chunk = InferSelectModel<typeof chunk>;
