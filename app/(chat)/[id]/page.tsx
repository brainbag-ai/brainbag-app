import { Message } from "ai";
import { Chat } from "@/schema";
import { getChatById } from "@/app/db";
import { notFound } from "next/navigation";
import { Chat as PreviewChat } from "@/components/chat";

export default async function Page(props: { params: Promise<any> }) {
  const params = await props.params;
  const { id } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // type casting
  const chat: Chat = {
    ...chatFromDb,
    messages: chatFromDb.messages as Message[],
  };

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={chat.messages}
    />
  );
}
