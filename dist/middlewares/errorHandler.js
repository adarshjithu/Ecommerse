"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
/**
 * Express error handler middleware (TypeScript version)
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    // Mongoose validation error
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((error) => `${error.path}: Required`)
            .join(", ");
    }
    // Mongoose cast error (e.g., invalid ObjectId)
    else if (err instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = `${err.path}: Required`;
    }
    // MongoDB duplicate key error
    else if (isMongoDuplicateError(err)) {
        const field = Object.keys(err.keyValue)[0];
        statusCode = 400;
        message = `${field}: Already exists`;
    }
    // Zod validation error
    else if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = err.issues
            .map((issue) => `${issue.path.join(".")}: Required`)
            .join(", ");
    }
    // Custom error with status and message
    else if (isErrorWithStatusAndMessage(err)) {
        statusCode = err.status;
        message = err.message;
    }
    console.error(`\x1b[31m${message}\x1b[0m`);
    if (message === "Internal Server Error")
        console.log(err);
    res.status(statusCode).json({
        success: false,
        message,
    });
};
// Type guard helpers
function isMongoDuplicateError(error) {
    return (typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000 &&
        "keyValue" in error);
}
function isErrorWithStatusAndMessage(error) {
    return (typeof error === "object" &&
        error !== null &&
        "status" in error &&
        "message" in error);
}
exports.default = errorHandler;
