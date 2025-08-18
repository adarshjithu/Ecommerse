import { z } from "zod";

export const otpValidatorSchema = z.object({
    target: z.string().min(1, "Target is required"),
    method: z.enum(["email", "phone"], "Invalid OTP method"),
    purpose: z.enum([
        "login-email",
        "login-phone",
        "reset-password",
        "verify-email",
        "verify-phone"
    ], "Invalid OTP purpose"),
    code: z.string().optional()
})


export const otpVerificationValidationSchema = z.object({
    target: z.string().min(1, "Target is required"),
    method: z.enum(["email", "phone"], "Invalid OTP method"),
    otp:z.string().min(1,"OTP is required"),
    purpose: z.enum([
        "login-email",
        "login-phone",
        "reset-password",
        "verify-email",
        "verify-phone"
    ], "Invalid OTP purpose"),
    code: z.string().optional()
})
