import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

// Local import
import { useChatStore, useUserStore } from "@/store";
import { HOST } from "@/utils/constant";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useUserStore().user;

  useEffect(() => {
    if (!user) {
      console.error("No user in websocket");
      return;
    }

    const socket: Socket = io(HOST, {
      query: { userID: user._id },
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to web socket server");
    });

    setSocket(socket);

    const handleReceivedMessage = (message: any) => {
      const { selectedChatType, selectedChatData, addMessage } =
        useChatStore.getState();
      if (
        selectedChatType !== null &&
        (selectedChatData?._id === message.sender._id ||
          selectedChatData?._id === message.recipient._id)
      ) {
        console.log("Message received: \n", message);
        addMessage(message);
      }
    };

    socket.on("receivedMessage", handleReceivedMessage);
    return () => {
      socket.off("connect");
      socket.disconnect();
      setSocket(null);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
