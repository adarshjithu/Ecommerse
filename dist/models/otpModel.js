"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const otp_1 = require("../enums/otp");
const otpSchema = new mongoose_1.default.Schema({
    target: { type: String, required: true },
    otp: { type: String, required: true },
    code: { type: String },
    purpose: {
        type: String,
        enum: Object.values(otp_1.OTP_Purpose),
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
}, { timestamps: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.default = mongoose_1.default.model("Otp", otpSchema);
