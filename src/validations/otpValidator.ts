import { z } from "zod";
import { OTP_Purpose } from "../enums/otp";

export const otpValidatorSchema = z.object({
    target: z.string().min(1, "Target is required"),

    purpose: z.enum(
        ["login-email", "login-phone", "register-email", "register-phone", "forget-password-email", "forget-password-phone"],
        "Invalid OTP purpose"
    ),
    code: z.string().optional(),
});

export const otpVerificationValidationSchema = z.object({
    target: z.string().min(1, "Target is required"),
    otp: z.string().min(1, "OTP is required"),
    purpose: z.enum(["login-email", "login-phone", "forget-password-email", "forget-password-phone", "register-email","register-phone"], "Invalid OTP purpose"),
});
