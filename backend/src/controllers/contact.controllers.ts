import type { Request, Response } from "express";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseHandler.util.js";
import { ErrorCode } from "../types/errorCode.js";
import User from "../models/user.model.js";

export const searchContact = async (req: Request, res: Response) => {
  const searchTerm = req.query.searchTerm
    ? String(req.query.searchTerm).trim()
    : null;
  if (!searchTerm) {
    return sendErrorResponse(
      res,
      400,
      ErrorCode.MissingRequiredField,
      "Serch term is required"
    );
  }
  try {
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );
    const regex = new RegExp(sanitizedSearchTerm, "i");
    const contacts = await User.find({
      $or: [{ name: regex }, { email: regex }],
    }).limit(50);
    if (!contacts) {
      return sendErrorResponse(
        res,
        400,
        ErrorCode.InvalidCredentials,
        "Contact not found"
      );
    }
    return sendSuccessResponse(res, 200, "Contact found", { contacts });
  } catch (error) {
    console.error("Error while searching contact: \n", error);
    return sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Internal Server Error",
      { error }
    );
  }
};

export const getAllcontact = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } }, "_id name");

    // converting it into lable, value for FE only,
    const contacts = users.map((user) => ({
      label: user.name,
      value: user._id,
    }));

    return sendSuccessResponse(res, 200, "All contacts are fetched", {
      contacts,
    });
  } catch (error) {
    console.error("Error while fetching contacts: \n", error);
    sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Error while fetching contacts"
    );
  }
};
