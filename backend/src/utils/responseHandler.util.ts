import type { CookieOptions, Response } from "express";
import type { ErrorCode } from "../types/errorCode.js";

export interface CookieOptionsType {
  name: string;
  value: string;
  options: CookieOptions;
}

type ApiResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
  cookie?: CookieOptions;
};

type ApiError<T> = {
  success: false;
  statusCode: number;
  errorCode: ErrorCode;
  message: string;
  errors?: T;
};

/**
 * Sends a standardized success response
 * @param res - The Express response object
 * @param httpStatus - The HTTP status code
 * @param message - A success message
 * @param data - The payload to send (optional)
 * @param cookie - A single cookie object or an array of cookie objects (optional).
 */
export const sendSuccessResponse = <T>(
  res: Response,
  httpStatus: number,
  message: string,
  data: T | null = null,
  cookies?: CookieOptionsType | CookieOptionsType[]
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    statusCode: httpStatus,
    message,
  };
  if (data) {
    response.data = data;
  }
  // chain the status first
  res.status(httpStatus);

  if (cookies) {
    // Check if 'cookies' is an array
    if (Array.isArray(cookies)) {
      cookies.forEach((cookie) => {
        res.cookie(cookie.name, cookie.value, cookie.options);
      });
    } else {
      // If it's a single object, set the one cookie
      res.cookie(cookies.name, cookies.value, cookies.options);
    }
  }

  return res.json(response);
};

/**
 * Sends a standardized error response.
 * @param res - The Express response object.
 * @param httpStatus - The HTTP status code.
 * @param errorCode - The application-specific error code.
 * @param message - A human-readable error message.
 * @param details - Detailed error object.
 */
export const sendErrorResponse = <T>(
  res: Response,
  httpStatus: number,
  errorCode: ErrorCode,
  message: string,
  details: T | null = null
): Response => {
  const response: ApiError<T> = {
    success: false,
    statusCode: httpStatus,
    errorCode,
    message,
  };
  if (details) {
    response.errors = details;
  }
  return res.status(httpStatus).json(response);
};
