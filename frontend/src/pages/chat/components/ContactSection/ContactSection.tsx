import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// UI
import Title from "@/components/Title";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CiCirclePlus } from "react-icons/ci";

// Local import
import type { IUser } from "@/types";
import { useChatStore, useUserStore } from "@/store";
import {
  GET_ALL_CONTACTS,
  GET_DM_CONTACTS_ROUTE,
  SEARCH_CONTACT_ROUTE,
} from "@/utils/constant";
import Logo from "@/components/Logo";
import { getColor } from "@/utils/getColor";
import SearchList from "./components/SearchList";
import ContactList from "./components/ContactList";
import axios from "axios";
import { Button } from "@/components/ui/button";
import MultipleSelector from "@/components/ui/multiple-selector";

export default function ContactSection({
  selectedChat,
  setSelectedChat,
}: {
  selectedChat: boolean;
  setSelectedChat: Dispatch<SetStateAction<boolean>>;
}) {
  const { directMessagesContact, setDirectMessagesContact } = useChatStore();
  useEffect(() => {
    const getContacts = async () => {
      const res = await fetch(GET_DM_CONTACTS_ROUTE, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Error while fetching DM contacts");
      }

      const data = await res.json();
      setDirectMessagesContact(data.data.contacts);
    };
    getContacts();
  }, []);

  return (
    <div
      className={`${
        selectedChat ? "hidden md:flex" : "flex"
      } relative w-full flex-col md:w-[35vw] lg-w[30vw] xl-w[20vw] bg-[#1b1c24] border-r-2 border-[#2f303b]`}
    >
      <div className="pt-3 px-10 flex justify-between items-center">
        <Logo />
        <ProfileInfo />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Messages" />
          <div className="text-neutral-400 text-opacity-90 hover:scale-125 transition-all duration-300">
            <NewDMButton setSelectedChat={setSelectedChat} />
          </div>
        </div>
      </div>
      <div className="h-14 overflow-y-hidden">
        {directMessagesContact.map((contact: IUser) => (
          <ContactList
            key={contact._id}
            contact={contact}
            isChannel={false}
            setSelectedChat={setSelectedChat}
          />
        ))}
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Channels" />
          <div className="text-neutral-400 text-opacity-90 hover:scale-125 transition-all duration-300">
            <CreateChannel setSelectedChat={setSelectedChat} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileInfo() {
  const navigate = useNavigate();
  const user = useUserStore().user;
  if (!user) return <p>User not found</p>;

  const handleOnClick = () => {
    navigate("/profile");
  };

  return (
    <div onClick={handleOnClick} className="flex cursor-pointer">
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
  );
}

function NewDMButton({
  setSelectedChat,
}: {
  setSelectedChat: Dispatch<SetStateAction<boolean>>;
}) {
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContact, setSearchedContact] = useState<IUser[] | null>(null);

  const handleSearchContact = async (searchTerm: string) => {
    try {
      if (searchTerm.length > 0) {
        const res = await fetch(
          `${SEARCH_CONTACT_ROUTE}?searchTerm=${searchTerm}`,
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (!res.ok) return toast.error("Request failed for search contact");
        setSearchedContact(data.data.contacts);
      } else {
        setSearchedContact(null);
      }
    } catch (error) {
      console.error("Error while search contact: \n", error);
    }
  };

  function selectNewContact(contact: IUser) {
    setOpenNewContactModal(false);

    useChatStore.getState().setSelectedChatType("contact");
    useChatStore.getState().setSelectedChatData(contact);

    setSelectedChat(true);
    setSearchedContact([]);
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setOpenNewContactModal((prev) => !prev)}>
              <CiCirclePlus size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>New DM</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="h-auto w-3/5 md:w-2/5 min-h-2/5 flex flex-col bg-[#181920] text-white border-none">
          <DialogHeader>
            <DialogTitle>New DM</DialogTitle>
          </DialogHeader>
          <Input
            onChange={(e) => handleSearchContact(e.target.value)}
            placeholder="Search Contact"
            className="border-none bg-[#2c2e3b]"
          />
          <div className="h-full flex-1 flex justify-center items-center">
            {searchedContact === null ? (
              <div className="flex flex-col justify-center items-center">
                <img src="/panda.png" className="h-32 md:h-52" />
                <p className="text-xl md:text-2xl">
                  Search New <span className="text-red-500">Contact</span>
                </p>
              </div>
            ) : (
              <>
                {searchedContact && searchedContact.length > 0 ? (
                  <ScrollArea className="h-full">
                    <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
                      {searchedContact.map((contact) => (
                        <SearchList
                          key={contact._id}
                          contact={contact}
                          onClick={() => selectNewContact(contact)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-xl md:text-2xl">No contact found</p>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
function CreateChannel({}: // setSelectedChat,
{
  setSelectedChat: Dispatch<SetStateAction<boolean>>;
}) {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSetselectedContacts] = useState([]);
  const [channelName, setChannelName] = useState("");
  const [openNewChannelModal, setOpenNewChannelModal] = useState(false);

  useEffect(() => {
    (async function getData() {
      const res = await axios.get(GET_ALL_CONTACTS, {
        withCredentials: true,
      });
      setContacts(res.data.data.contacts);
    })();
  }, []);

  async function CreateChannel() {}

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={() => setOpenNewChannelModal((prev) => !prev)}>
              <CiCirclePlus size={20} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create Channel</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <Dialog open={openNewChannelModal} onOpenChange={setOpenNewChannelModal}>
        <DialogContent className="h-auto w-3/5 md:w-2/5 min-h-2/5 flex flex-col bg-[#181920] text-white border-none">
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <Input
            onChange={(e) => setChannelName(e.target.value)}
            value={channelName}
            placeholder="Channel Name"
            className="border-none bg-[#2c2e3b]"
          />

          <MultipleSelector
            className="rounded-lg bg-[#2c2e3b] border-none text-white py-2"
            defaultOptions={contacts}
            placeholder="Search Contacts"
            value={selectedContacts}
            // @ts-ignore
            onChange={setSetselectedContacts}
            emptyIndicator={
              <p className="text-center text-lg leading-10 text-gray-500">
                No Result Found
              </p>
            }
          />
          <Button variant="secondary" onClick={CreateChannel}>
            Create Channel
          </Button>
          <div className="h-full flex-1 flex justify-center items-center"></div>
        </DialogContent>
      </Dialog>
    </>
  );
}
