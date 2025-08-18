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
exports.AuthController = void 0;
const statusCodes_1 = require("../../../constants/constants/statusCodes");
const otp_1 = require("../../../enums/otp");
const otpValidator_1 = require("../../../validations/otpValidator");
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    // @description: Register a new user
    // @route: POST /api/v1/auth/register
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Register endpoint hit");
            }
            catch (error) {
                next(error);
            }
        });
    }
    // @description: Send otp a new user
    // @route: POST /api/v1/auth/send-otp
    sendOTP(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                otpValidator_1.otpValidatorSchema.parse(req.body);
                const { target, method, purpose, code } = req.body;
                if (method === otp_1.OTP_Method.EMAIL && !target.includes("@")) {
                    return res.status(400).json({ message: "Invalid email address" });
                }
                if (method === otp_1.OTP_Method.PHONE && !/^\d{10}$/.test(target)) {
                    return res.status(400).json({ message: "Invalid phone number" });
                }
                if (method === otp_1.OTP_Method.PHONE && !code) {
                    return res.status(400).json({ message: "Code is required for phone verification" });
                }
                const result = yield this.authService.sendOTP({
                    target,
                    method,
                    purpose,
                    code,
                });
                res.status(statusCodes_1.STATUS_CODES.CREATED).json({
                    message: "OTP sent successfully",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // @description: Verify email
    // @route: POST /api/v1/auth/verify-otp
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                otpValidator_1.otpVerificationValidationSchema.parse(req.body);
                const { target, method, purpose, code, otp } = req.body;
                const result = yield this.authService.verifyOtp({ target, method, purpose, otp, code });
                res.status(statusCodes_1.STATUS_CODES.OK).json({
                    message: "OTP verification  successfull",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
