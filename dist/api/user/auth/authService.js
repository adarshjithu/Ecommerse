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
exports.AuthService = void 0;
const customErrors_1 = require("../../../constants/constants/customErrors");
const sendMail_1 = require("../../../utils/mail/sendMail");
const generateOtp_1 = require("../../../utils/otp/generateOtp");
const sendOtpToPhone_1 = require("../../../utils/phone/sendOtpToPhone");
class AuthService {
    constructor(authRepository, otpRepository) {
        this.authRepository = authRepository;
        this.otpRepository = otpRepository;
    }
    // Send otp for all the usecases
    sendOTP(_a) {
        return __awaiter(this, arguments, void 0, function* ({ target, method, purpose, code }) {
            if (!target || !method || !purpose) {
                throw new Error("Missing required fields");
            }
            // Build user query
            const userFindQuery = method === "email" ? { email: target } : { phone: { number: target, code } };
            // Check if user already exists
            const user = yield this.authRepository.findByQuery(userFindQuery);
            if (user) {
                if (method === "email") {
                    throw new customErrors_1.ConflictError(`User already exists with this email: ${target}`);
                }
                else {
                    throw new customErrors_1.ConflictError(`User already exists with this phone: ${code}-${target}`);
                }
            }
            // Prevent resending OTPs if not expired
            const otpQuery = { purpose, method, target };
            if (method === "phone")
                otpQuery.code = code;
            const existingOtpData = yield this.otpRepository.findByQuery(otpQuery);
            if (existingOtpData && existingOtpData.expiresAt > new Date()) {
                throw new customErrors_1.ConflictError("OTP already sent. Please try again after it expires.");
            }
            // Generate new OTP
            const otp = (0, generateOtp_1.generateOtp)(6);
            const newOtp = {
                target,
                otp,
                method,
                purpose,
                code,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
                isUsed: false,
                attempts: 0,
            };
            if (method === "email") {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(target)) {
                    throw new customErrors_1.BadRequestError("Invalid email address");
                }
                const isEmailSent = yield (0, sendMail_1.sendEmail)(target, `Your OTP is ${otp}`, `<p>Your OTP is <strong>${otp}</strong></p>`);
                if (!isEmailSent) {
                    throw new Error("Failed to send OTP via email");
                }
            }
            else {
                const phoneRegex = /^\d{10,15}$/;
                if (!phoneRegex.test(target)) {
                    throw new customErrors_1.BadRequestError("Invalid phone number");
                }
                const isOtpSent = (0, sendOtpToPhone_1.sendOtpToPhone)(target, otp);
                if (!isOtpSent) {
                    throw new customErrors_1.BadRequestError("Failed to send OTP via phone");
                }
            }
            return yield this.otpRepository.createOtp(newOtp);
        });
    }
    // Verify OTP
    verifyOtp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ target, method, purpose, otp, code }) {
            const otpQuery = { purpose, method, target };
            if (method === "phone")
                otpQuery.code = code;
            const otpObj = yield this.otpRepository.findByQuery(otpQuery);
            if (!otpObj)
                throw new customErrors_1.NotFoundError("No OTP request found. Please request a new OTP.");
            if (otpObj === null || otpObj === void 0 ? void 0 : otpObj.isUsed)
                throw new customErrors_1.BadRequestError("This OTP has already been used. Please request a new OTP.");
            otpObj.attempts += 1;
            if (otpObj.otp !== otp) {
                if (otpObj.attempts >= 5) {
                    yield this.otpRepository.delete(otpObj._id);
                    throw new customErrors_1.BadRequestError("You have reached the maximum number of attempts. Please request a new OTP.");
                }
                throw new customErrors_1.BadRequestError(`Incorrect OTP. You have ${5 - otpObj.attempts} attempt(s) left.`);
            }
            otpObj.isUsed = true;
            yield otpObj.save();
            return otpObj;
        });
    }
}
exports.AuthService = AuthService;
