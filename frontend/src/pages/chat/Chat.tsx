import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Local Import
import { useChatStore, useUserStore } from "@/store";
import ContactSection from "./components/ContactSection/ContactSection";
import ChatSection from "./components/ChatSection/ChatSection";
import EmptyChat from "./EmptyChat";

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(false); // var for toggle contact list and message section
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const { selectedChatType } = useChatStore();

  useEffect(() => {
    if (user && !user.profileSetup) {
      toast.info("Please set up the profile first");
      navigate("/profile");
    }
  }, [user, navigate]);

  if (user && !user.profileSetup) {
    // You can also return a loading spinner here while the useEffect redirects.
    return <Navigate to="/profile" />;
  }

  return (
    <div className="min-h-screen flex bg-gray-100 text-white">
      <ContactSection
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
      />
      <div
        className={`${
          !selectedChat ? "hidden" : "flex"
        } w-full flex-col md:flex md:flex-1`}
      >
        {selectedChatType === null ? (
          <EmptyChat />
        ) : (
          <ChatSection setSelectedChat={setSelectedChat} />
        )}
      </div>
    </div>
  );
}
