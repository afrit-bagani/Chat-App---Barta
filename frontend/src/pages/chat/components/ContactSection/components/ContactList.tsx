import type { IUser } from "@/types";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/utils/getColor";
import { useChatStore } from "@/store";
import type { Dispatch, SetStateAction } from "react";

export default function ContactList({
  contact,
  isChannel = false,
  setSelectedChat,
}: {
  contact: IUser;
  isChannel: boolean;
  setSelectedChat: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    // selectedChatType,
    setSelectedChatType,
    selectedChatData,
    setSelectedChatData,
    setSelectedChatMessages,
  } = useChatStore();

  const handleClick = (contact: IUser) => {
    setSelectedChat(true);

    if (isChannel) {
      setSelectedChatType("channel");
    } else {
      setSelectedChatType("contact");
    }
    setSelectedChatData(contact);
    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }
  };

  const { name, email, avatar, color } = contact;

  return (
    <div
      className={`flex justify-start items-center gap-6 pl-14 md:pl-20 py-1 transition-all duration-300 cursor-pointer ${
        selectedChatData?._id === contact._id
          ? "bg-[#130f0f] hover:bg-[#8417ff]/50"
          : "hover:bg-[#f1f1f111]"
      }`}
      onClick={() => handleClick(contact)}
    >
      <Avatar className="h-10 w-10 rounded-full overflow-hidden">
        {avatar ? (
          <AvatarImage
            src={avatar}
            alt="profile-image"
            className="object-cover w-full h-full"
          />
        ) : (
          <div
            className={`uppercase text-xl md:text-2xl font-semibold flex justify-center items-center rounded-full w-full h-full ${getColor(
              color
            )}`}
          >
            {name?.[0]}
          </div>
        )}
      </Avatar>
      {isChannel && (
        <div className="bg-[#ffff22] h-10 w-10 flex items-center justify-center rounded-full">
          #
        </div>
      )}
      {isChannel && <span>{contact.name}</span>}

      <div className="flex flex-col gap-1">
        <span className="text-red-500 text-md font-semibold">{name}</span>
        <span className="text-sm">{email}</span>
      </div>
    </div>
  );
}
