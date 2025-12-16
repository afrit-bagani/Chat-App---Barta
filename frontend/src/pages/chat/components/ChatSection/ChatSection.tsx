import { type Dispatch, type SetStateAction } from "react";

// Local import
import ChatHeader from "./components/ChatHeader";
import ChatBody from "./components/ChatBody";
import MessageBar from "./components/MessageBar";

export default function MessageSection({
  setSelectedChat,
}: {
  setSelectedChat: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="w-full flex flex-col flex-1 bg-[#1c1d25]">
      <ChatHeader setSelectedChat={setSelectedChat} />
      <ChatBody />
      <MessageBar />
    </div>
  );
}
