"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpVerificationValidationSchema = exports.otpValidatorSchema = void 0;
const zod_1 = require("zod");
exports.otpValidatorSchema = zod_1.z.object({
    target: zod_1.z.string().min(1, "Target is required"),
    purpose: zod_1.z.enum(["login-email", "login-phone", "register-email", "register-phone", "forget-password-email", "forget-password-phone"], "Invalid OTP purpose"),
    code: zod_1.z.string().optional(),
});
exports.otpVerificationValidationSchema = zod_1.z.object({
    target: zod_1.z.string().min(1, "Target is required"),
    otp: zod_1.z.string().min(1, "OTP is required"),
    purpose: zod_1.z.enum(["login-email", "login-phone", "forget-password-email", "forget-password-phone", "register-email", "register-phone"], "Invalid OTP purpose"),
});
