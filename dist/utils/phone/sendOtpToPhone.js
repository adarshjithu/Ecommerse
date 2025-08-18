"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpToPhone = void 0;
const sendOtpToPhone = (phone, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Here you would integrate with an SMS service to send the OTP
        // For example, using Twilio, Nexmo, etc.
        console.log(`Sending OTP ${code} to phone number ${phone}`);
        // Simulate sending OTP
        // await smsService.sendSms(phone, `Your OTP code is: ${code}`);
        console.log(`OTP sent successfully to ${phone}`);
    }
    catch (error) {
        console.error(`Failed to send OTP to ${phone}:`, error);
        throw new Error("Failed to send OTP");
    }
});
exports.sendOtpToPhone = sendOtpToPhone;
