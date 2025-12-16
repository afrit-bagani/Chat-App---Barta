import { Router } from "express";
import {
  signUpController,
  signInController,
  getUserData,
  updateProfile,
  deleteAvatar,
  logoutUser,
  verifyEmail,
} from "./controllers/auth.controller.js";
import { verifyUser } from "./middlewares/auth.middleware.js";
import { upload } from "./middlewares/multer.middleware.js";
import {
  getAllcontact,
  searchContact,
} from "./controllers/contact.controllers.js";
import {
  getMessages,
  getContactsForDM,
  uploadFile,
} from "./controllers/message.controller.js";

// ========== AUTH ROUTE ==========

export const authRouter = Router();

authRouter.post("/signup", signUpController);
authRouter.post("/signin", signInController);
authRouter.post("/verify-email", verifyEmail);
authRouter.get("/user-data", verifyUser, getUserData);
authRouter.patch(
  "/profile",
  verifyUser,
  upload.single("profile-image"),
  updateProfile
);
authRouter.delete("/profile", verifyUser, deleteAvatar);
authRouter.get("/logout", verifyUser, logoutUser);

// ========== CONTACT ROUTE ==========

export const contactRouter = Router();

contactRouter.get("/search", verifyUser, searchContact);
contactRouter.get("/dm", verifyUser, getContactsForDM);
contactRouter.get("/", verifyUser, getAllcontact);

// ========== MESSAGE ROUTE ==========

export const messageRouter = Router();

messageRouter.get("/", verifyUser, getMessages);
messageRouter.post("/file", verifyUser, upload.single("file"), uploadFile);
