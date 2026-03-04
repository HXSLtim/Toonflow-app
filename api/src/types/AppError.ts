import { ErrorCode } from "./monitoring";

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: string[],
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
