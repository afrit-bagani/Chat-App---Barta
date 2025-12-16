import { Model, model, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export interface IUser {
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: string | undefined;
  avatar: string;
  publicId: string;
  color: number;
  profileSetup: boolean;
  refreshToken: string;
}

export interface IUserMethods {
  comparePassword: (password: string) => Promise<boolean>;
  generateAccessToken: () => string;
  generateRefreshToken: () => string;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: [true, "Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: { type: String, required: [true, "password is required"] },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    avatar: { type: String },
    publicId: { type: String },
    color: { type: Number },
    profileSetup: { type: Boolean, default: false },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    next(err);
  }
});

userSchema.methods.comparePassword = async function (password: string) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    console.error("Bcrypt compare error: \n", error);
    return false;
  }
};

userSchema.methods.generateAccessToken = function () {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;

  if (!accessTokenSecret || !accessTokenExpiry) {
    throw new Error(
      "ACCESS_TOKEN_SECRET or ACCESS_TOKEN_EXPIRY is not defined in environment variables."
    );
  }

  return jwt.sign({ _id: this._id, email: this.email }, accessTokenSecret, {
    expiresIn: accessTokenExpiry as any,
  });
};

// generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY;

  if (!refreshTokenSecret || !refreshTokenExpiry) {
    throw new Error(
      "REFRESH_TOKEN_SECRET or REFRESH_TOKEN_EXPIRY is not defined in environment variables."
    );
  }

  return jwt.sign({ _id: this._id }, refreshTokenSecret, {
    expiresIn: refreshTokenExpiry as any,
  });
};

const User = model<IUser, UserModel>("User", userSchema);

export default User;
