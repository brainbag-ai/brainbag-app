import { Chat } from "@/components/chat";
import { generateId } from "ai";

export default function Page() {
  return <Chat id={generateId()} initialMessages={[]} />;
}
