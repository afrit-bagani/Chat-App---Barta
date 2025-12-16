import type { Request, Response } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseHandler.util.js";
import { ErrorCode } from "../types/errorCode.js";
import Message from "../models/message.model.js";
import { Types } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getMessages = async (req: Request, res: Response) => {
  const user1 = req.userId;
  const user2 = req.query.userID;

  if (!user1 || !user2) {
    sendErrorResponse(
      res,
      400,
      ErrorCode.MissingRequiredField,
      "User id is requried"
    );
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    });
    return sendSuccessResponse(res, 200, "Messages fetched", { messages });
  } catch (error) {
    console.error(
      `Error during fetching messages for userID: ${user1} and userId: ${user2} \n`,
      error
    );
    return sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      `Error during fetching messages for userID: ${user1} and userId: ${user2}`
    );
  }
};

export const getContactsForDM = async (req: Request, res: Response) => {
  let userID = req.userId;
  const validUserID = new Types.ObjectId(userID);

  if (!validUserID) {
    return sendErrorResponse(
      res,
      404,
      ErrorCode.MissingRequiredField,
      "User ID is required"
    );
  }

  try {
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: validUserID }, { recipient: validUserID }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", validUserID] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          name: "$contactInfo.name",
          email: "$contactInfo.email",
          avatar: "$contactInfo.avatar",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);
    return sendSuccessResponse(res, 200, "Contacts fetched", { contacts });
  } catch (error) {
    console.error("Error while fetching contacts: \n", error);
    return sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Error while fetching contacts"
    );
  }
};

export const uploadFile = async (req: Request, res: Response) => {
  const userId = req.userId;
  const file = req.file;

  if (!userId) {
    return sendErrorResponse(
      res,
      400,
      ErrorCode.MissingRequiredField,
      "User id is missing"
    );
  }
  if (!file) {
    return sendErrorResponse(
      res,
      400,
      ErrorCode.MissingRequiredField,
      "file is missing"
    );
  }
  try {
    const cloudinaryResult = await uploadOnCloudinary(file?.path);
    return sendSuccessResponse(res, 200, "File uploaded", {
      fileName: file.originalname,
      fileType: file.mimetype,
      fileURL: cloudinaryResult?.secure_url,
      size: file.size,
    });
  } catch (error) {
    console.error(`Error while uploading file for user: ${userId} \n`, error);
    return sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Server error while uploading file"
    );
  }
};
