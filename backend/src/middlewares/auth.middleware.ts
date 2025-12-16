import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendErrorResponse } from "../utils/responseHandler.util.js";
import { ErrorCode } from "../types/errorCode.js";

export const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken as string;
  if (!accessToken) {
    return sendErrorResponse(
      res,
      401,
      ErrorCode.TokenInvalid,
      "Token is missing"
    );
  }
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err, payload) => {
    if (err || !payload || typeof payload === "string" || !("_id" in payload)) {
      return sendErrorResponse(
        res,
        403,
        ErrorCode.TokenInvalid,
        "Token is invalid"
      );
    }
    req.userId = payload._id;
    next();
  });
};
