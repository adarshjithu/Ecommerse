import mongoose, { Document } from "mongoose";
import { OTP_Method, OTP_Pupose } from "../enums/otp";


export interface IOtp extends Document {
    target: string;
    otp: string;
    code?: string;
    method: "email" | "phone";
    purpose: "login-email" | "login-phone" | "reset-password" | "verify-email" | "verify-phone";
    expiresAt: Date;
    isUsed: boolean;
    attempts: number;
    createdAt: Date;
    updatedAt: Date;
}

const otpSchema = new mongoose.Schema(
    {
        target: { type: String, required: true },
        otp: { type: String, required: true },
        code: { type: String },
        method: { type: String, enum: Object.values(OTP_Method), required: true },
        purpose: {
            type: String,
            enum: Object.values(OTP_Pupose),
            required: true,
            default: "login-email",
        },
        expiresAt: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + 5 * 60 * 1000),
        },
        isUsed: { type: Boolean, default: false },
        attempts: { type: Number, default: 0 },
    },
    { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtp>("Otp", otpSchema);
