import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import type { IMesaage } from "./models/message.model.js";
import Message from "./models/message.model.js";

const webSocketServer = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket: Socket) => {
    console.log("Client disconnected: ", socket.id);
    for (const [userId, socketID] of userSocketMap) {
      if (socketID === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message: IMesaage) => {
    const senderSocketID = userSocketMap.get(message.sender);
    const recipientSocketID = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "_id name email avatar color")
      .populate("recipient", "_id name email avatar color");

    if (recipientSocketID) {
      io.to(recipientSocketID).emit("receivedMessage", messageData);
    }
    if (senderSocketID) {
      io.to(senderSocketID).emit("receivedMessage", messageData);
    }
  };

  io.on("connection", (socket) => {
    const userID = socket.handshake.query.userID;
    if (userID) {
      userSocketMap.set(userID, socket.id);
      console.log(`User connected: ${userID} with socket id: ${socket.id}`);
    } else {
      console.log("User ID is required for connection");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("disconnect", () => disconnect(socket));
  });
};

export default webSocketServer;
