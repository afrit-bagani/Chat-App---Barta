export enum ErrorCode {
  // Validation Errors
  MissingRequiredField = "MISSING_REQUIRED_FIELD",
  InvalidEmailFormat = "INVALID_EMAIL_FORMAT",
  PasswordTooShort = "PASSWORD_TOO_SHORT",
  DuplicateValue = "DUPLICATE_VALUE",

  // Authentication & Authorization Errors
  UserNotFound = "USER_NOT_FOUND",
  InvalidCredentials = "INVALID_CREDENTIALS",
  TokenExpired = "TOKEN_EXPIRED",
  TokenInvalid = "TOKEN_INVALID",
  InsufficientPermissions = "INSUFFICIENT_PERMISSIONS",

  // Server & System Errors
  InternalServerError = "INTERNAL_SERVER_ERROR",
  DatabaseConnectionError = "DATABASE_CONNECTION_ERROR",
}
