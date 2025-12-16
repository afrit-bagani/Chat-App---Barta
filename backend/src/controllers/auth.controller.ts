import type { Request, Response } from "express";
import crypto from "crypto";

// local import
import {
  sendErrorResponse,
  sendSuccessResponse,
  type CookieOptionsType,
} from "../utils/responseHandler.util.js";
import { ErrorCode } from "../types/errorCode.js";
import { signinSchema, signupSchema } from "../utils/schema.js";
import {
  createUser,
  findByEmail,
  generateAccessAndRefreshToken,
  signInUser,
} from "../services/user.service.js";
import User from "../models/user.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const signUpController = async (req: Request, res: Response) => {
  try {
    const parsedData = signupSchema.safeParse(req.body);
    if (!parsedData.success) {
      const errorMessage =
        parsedData.error.issues[0]?.message ?? "Invalid input";
      return sendErrorResponse(
        res,
        400,
        ErrorCode.MissingRequiredField,
        errorMessage
      );
    }

    const { name, email, password } = parsedData.data;
    const userexist = await findByEmail({ email });
    if (userexist) {
      return sendErrorResponse(
        res,
        400,
        ErrorCode.DuplicateValue,
        "User alreday exist, try with differnt email"
      );
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await createUser({ name, email, password, verificationToken });
    await sendVerificationEmail(email, verificationToken);

    sendSuccessResponse(
      res,
      201,
      "Signup successful. Please check your email to verify."
    );
  } catch (error) {
    console.error("Sign up error: \n", error);
    sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Server error during sign up."
    );
  }
};

export const signInController = async (req: Request, res: Response) => {
  try {
    const parsedData = signinSchema.safeParse(req.body);
    if (!parsedData.success) {
      const errorMessage =
        parsedData.error.issues[0]?.message ?? "Invalid input";
      return sendErrorResponse(
        res,
        404,
        ErrorCode.MissingRequiredField,
        errorMessage,
        parsedData.error.issues
      );
    }
    const { email, password } = parsedData.data;
    const result = await signInUser({ email, password });
    if (result === "USER_DO_NOT_EXIST") {
      sendErrorResponse(
        res,
        400,
        ErrorCode.UserNotFound,
        "Email do not exist, signup first"
      );
    } else if (result === "PASSWORD_DO_NOT_MATCH") {
      sendErrorResponse(
        res,
        400,
        ErrorCode.InvalidCredentials,
        "password do not match"
      );
    } else {
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        result._id
      );

      const cookies: CookieOptionsType[] = [
        {
          name: "accessToken",
          value: accessToken,
          options: {
            maxAge: 6 * 30 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true,
          },
        },
        {
          name: "refreshToken",
          value: refreshToken,
          options: {
            maxAge: 12 * 30 * 24 * 60 * 60 * 1000,
            sameSite: "none",
            secure: true,
          },
        },
      ];
      return sendSuccessResponse(
        res,
        200,
        "User signin successfully",
        { user: result },
        cookies
      );
    }
  } catch (error) {
    console.error("Signin error: \n", error);
    sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Server error during signin"
    );
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const token = req.body.token;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return sendErrorResponse(
        res,
        400,
        ErrorCode.InvalidCredentials,
        "Invalid or expired token"
      );
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return sendSuccessResponse(res, 200, "Email verified successfully");
  } catch (error) {
    console.error("Error while validating email: \n", error);
    return sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Error while validating email"
    );
  }
};

export const getUserData = async (req: Request, res: Response) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      sendErrorResponse(
        res,
        404,
        ErrorCode.UserNotFound,
        "User not found, wrong id"
      );
    }
    sendSuccessResponse(res, 200, "User information", { user });
  } catch (error) {
    console.error("Error while getting user data: \n", error);
    sendErrorResponse(
      res,
      404,
      ErrorCode.InternalServerError,
      "Server error while getting user data"
    );
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { name, color } = req.body;
  if (!name && !color && !req.file) {
    return sendErrorResponse(
      res,
      400,
      ErrorCode.MissingRequiredField,
      "Name and color or file both are missing"
    );
  }
  try {
    let result;
    if (req.file) {
      result = await uploadOnCloudinary(req.file.path);
      console.log("Result: \n", result);
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        color,
        profileSetup: true,
        avatar: result?.secure_url,
        publicId: result?.public_id,
      },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");
    if (!user?._id) {
      return sendErrorResponse(
        res,
        404,
        ErrorCode.UserNotFound,
        "Incorrect user id"
      );
    }
    return sendSuccessResponse(res, 200, "Profile updated successfully!", {
      user,
    });
  } catch (error) {
    console.error("Error during updating profile: \n", error);
    return sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Something went wrong during profile update"
    );
  }
};

export const deleteAvatar = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { publicId } = req.body;
  if (!publicId) {
    return sendErrorResponse(
      res,
      400,
      ErrorCode.MissingRequiredField,
      "Public id is requried"
    );
  }
  try {
    await deleteOnCloudinary(publicId);
    const user = await User.findByIdAndUpdate(
      userId,
      { publicId: null, avatar: null },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");
    return sendSuccessResponse(res, 200, "Avatar deleted successfully", {
      user,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      500,
      ErrorCode.InternalServerError,
      "Error while deleting resource"
    );
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  const cookies: CookieOptionsType[] = [
    {
      name: "accessToken",
      value: "",
      options: {
        maxAge: 1,
        secure: true,
        sameSite: "none",
      },
    },
    {
      name: "refreshToken",
      value: "",
      options: {
        maxAge: 1,
        secure: true,
        sameSite: "none",
      },
    },
  ];
  return sendSuccessResponse(res, 200, "Logout successfully", {}, cookies);
};
