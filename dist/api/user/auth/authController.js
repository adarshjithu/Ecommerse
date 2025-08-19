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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const customErrors_1 = require("../../../constants/constants/customErrors");
const statusCodes_1 = require("../../../constants/constants/statusCodes");
const otp_1 = require("../../../enums/otp");
const otpValidator_1 = require("../../../validations/otpValidator");
const userValidator_1 = require("../../../validations/userValidator");
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    // @description: Register a new user
    // @route: POST /api/v1/auth/register
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                userValidator_1.userValidationSchema.parse(req.body);
                const _a = req.body, { verificationMethod } = _a, userData = __rest(_a, ["verificationMethod"]);
                if (!verificationMethod) {
                    throw new customErrors_1.BadRequestError("Verification method is required");
                }
                const allowedVerificationMethods = ["email", "phone", "google"];
                if (!allowedVerificationMethods.includes(verificationMethod)) {
                    throw new customErrors_1.BadRequestError(`Invalid verification method. Allowed values: ${allowedVerificationMethods.join(", ")}`);
                }
                const { accessToken, refreshToken, user } = yield this.authService.registerUser(Object.assign({ verificationMethod }, userData));
                // Constants can live in config
                const ACCESS_TOKEN_MAXAGE = 15 * 60 * 1000;
                const REFRESH_TOKEN_MAXAGE = 7 * 24 * 60 * 60 * 1000;
                const SECURE = process.env.NODE_ENV === "production";
                res.cookie("ecom-access-token", accessToken, {
                    httpOnly: true,
                    secure: SECURE,
                    sameSite: "strict",
                    maxAge: ACCESS_TOKEN_MAXAGE,
                })
                    .cookie("ecom-refresh-token", refreshToken, {
                    httpOnly: true,
                    secure: SECURE,
                    sameSite: "strict",
                    maxAge: REFRESH_TOKEN_MAXAGE,
                })
                    .status(statusCodes_1.STATUS_CODES.CREATED)
                    .json({
                    success: true,
                    message: "User registration successful",
                    user, // 🚨 Make sure `user` excludes sensitive info
                });
            }
            catch (error) {
                console.error(error);
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
