import type { Types } from "mongoose";
import User from "../models/user.model.js";

type CreateUserType = {
  name: string;
  email: string;
  password: string;
  verificationToken: string;
};

export const findByEmail = async ({ email }: { email: string }) => {
  return User.findOne({ email }).select("-password");
};

export const createUser = async ({
  name,
  email,
  password,
  verificationToken,
}: CreateUserType) => {
  return await User.create({ name, email, password, verificationToken });
};

export const signInUser = async ({
  email,
  password,
}: Pick<CreateUserType, "email" | "password">) => {
  const user = await User.findOne({ email });
  if (!user) {
    return "USER_DO_NOT_EXIST";
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return "PASSWORD_DO_NOT_MATCH";
  }

  const { password: _, refreshToken, ...userWithoutPassword } = user.toObject();
  return userWithoutPassword;
};

export const generateAccessAndRefreshToken = async (userId: Types.ObjectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error while generating token: \n", error);
    throw error;
  }
};
