import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";

/**
 * Express error handler middleware (TypeScript version)
 */
const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => `${error.path}: ${error.message || "Validation error"}`)
      .join(", ");
  }

  // Mongoose cast error (e.g., invalid ObjectId)
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `${err.path}: Invalid value`;
  }

  // MongoDB duplicate key error
  else if (isMongoDuplicateError(err)) {
    const field = Object.keys(err.keyValue)[0];
    statusCode = 400;
    message = `${field}: ${field} already exists`;
  }

  // Zod validation error
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = err.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
  }

  // Custom error with status and message
  else if (isErrorWithStatusAndMessage(err)) {
    statusCode = err.status;
    message = err.message;
  }

  console.error("\x1b[31mError:\x1b[0m", message);
  if (statusCode === 500) console.log(err);

  res.status(statusCode).json({
    success: false,
    message, // ✅ all errors joined in one string
  });
};

// Type guard helpers
function isMongoDuplicateError(
  error: unknown
): error is { code: number; keyValue: Record<string, string> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as any).code === 11000 &&
    "keyValue" in error
  );
}

function isErrorWithStatusAndMessage(
  error: unknown
): error is { status: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "message" in error
  );
}

export default errorHandler;
