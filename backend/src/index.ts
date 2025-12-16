import { createServer } from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

// Local import
import { authRouter, contactRouter, messageRouter } from "./route.js";
import webSocketServer from "./socket.js";

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/contacts", contactRouter);
app.use("/messages", messageRouter);

(async function main() {
  if (!DATABASE_URL) {
    throw new Error("FATAL ERROR: DATABASE_URL is not defined.");
  }
  await mongoose.connect(DATABASE_URL);
  console.log("DB connected successfully.");

  const httpServer = createServer(app);
  webSocketServer(httpServer);
  httpServer.listen(PORT, () => {
    console.log(
      `Sever is running in ${process.env.NODE_ENV} mode on port: ${PORT} \n`
    );
  });
})();
