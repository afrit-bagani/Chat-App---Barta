import type { Dispatch, SetStateAction } from "react";
import { CiSearch } from "react-icons/ci";
import { RiCloseFill } from "react-icons/ri";

// Local Import
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/store";
import { getColor } from "@/utils/getColor";

export default function ChatHeader({
  setSelectedChat,
}: {
  setSelectedChat: Dispatch<SetStateAction<boolean>>;
}) {
  const closeChat = useChatStore().closeChat;
  const user = useChatStore().selectedChatData;

  function handleCloseButton() {
    closeChat();
    setSelectedChat(false);
  }

  if (!user) return;

  return (
    <div className="h-[10vh] border-b-3 border-[#2f303b] flex justify-between items-center px-14">
      {/* Avatar section */}
      <div className="flex gap-5 items-center justify-center">
        <div>
          <Avatar className="h-12 w-12 rounded-full">
            {user.avatar ? (
              <AvatarImage
                src={user.avatar}
                alt="profile-image"
                className="object-cover w-full h-full rounded-full"
              />
            ) : (
              <div
                className={`uppercase text-xl md:text-2xl font-semibold flex justify-center items-center w-full h-full ${getColor(
                  user.color
                )}`}
              >
                {user.name?.[0]}
              </div>
            )}
          </Avatar>
        </div>
        <div className="text-xl md:text-2xl font-semibold">{user.name}</div>
      </div>

      {/* Buttons  */}
      <div className="flex justify-center items-center gap-1 md:gap-4">
        <button className="p-2 rounded-sm bg-[#333030] text-xl md:text-2xl">
          <CiSearch />
        </button>
        <button
          onClick={handleCloseButton}
          className="text-neutral-500 text-3xl md:4xl focus:border-none hover:text-white duration-300 transition-all"
        >
          <RiCloseFill />
        </button>
      </div>
    </div>
  );
}
