import mongoose from "mongoose";
import { ACCESS_TOKEN_MAXAGE, REFRESH_TOKEN_MAXAGE, SECURE } from "../../../config";
import { BadRequestError, NotFoundError } from "../../../constants/constants/customErrors";
import { STATUS_CODES } from "../../../constants/constants/statusCodes";
import { otpValidatorSchema, otpVerificationValidationSchema } from "../../../validations/otpValidator";
import { loginSchema, userValidationSchema } from "../../../validations/userValidator";
import { AuthService } from "./authService";
import { Request, Response, NextFunction } from "express";

export class AuthController {
    constructor(private authService: AuthService) {}

    // @description: Register a new user
    // @route: POST /api/v1/auth/register
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { verificationMethod, verificationId, ...userData } = req.body;
            userValidationSchema.parse(userData);

            if (!verificationMethod) {
                throw new BadRequestError("Verification method is required");
            }

            const allowedVerificationMethods = ["email", "phone", "google"];
            if (!allowedVerificationMethods.includes(verificationMethod)) {
                throw new BadRequestError(`Invalid verification method. Allowed values: ${allowedVerificationMethods.join(", ")}`);
            }

            if (!verificationId || !mongoose.Types.ObjectId.isValid(verificationId)) {
                throw new BadRequestError("Invalid verification Id");
            }

            const { accessToken, refreshToken, user } = await this.authService.registerUser({
                verificationMethod,
                verificationId,
                ...userData,
            });

            res.cookie("ecom-access-token", accessToken, {
                httpOnly: true,
                secure: SECURE,
                sameSite: "strict",
                maxAge: Number(ACCESS_TOKEN_MAXAGE),
            })
                .cookie("ecom-refresh-token", refreshToken, {
                    httpOnly: true,
                    secure: SECURE,
                    sameSite: "strict",
                    maxAge: Number(REFRESH_TOKEN_MAXAGE),
                })
                .status(STATUS_CODES.CREATED)
                .json({
                    success: true,
                    message: "✅ User registration successful",
                    user,
                });
        } catch (error) {
            console.error(error);
            next(error);
        }
    }

    // @description: Send otp a new user
    // @route: POST /api/v1/auth/send-otp
    async sendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            otpValidatorSchema.parse(req.body);
            const { target, purpose, code } = req.body;

            const result = await this.authService.sendOTP({
                target,
                purpose,
                code,
            });
            res.status(STATUS_CODES.CREATED).json({
                success: true,
                message: `OTP successfully sent`,
            });
        } catch (error) {
            next(error);
        }
    }

    // @description: Verify email
    // @route: POST /api/v1/auth/verify-otp
    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            otpVerificationValidationSchema.parse(req.body);
            const { target, purpose, otp, code } = req.body;

            const result = await this.authService.verifyOtp({ target, purpose, otp, code });
            res.status(STATUS_CODES.OK).json({
                message: "✅ OTP verification  successfull",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    // @description: Login user
    // @route: POST /api/v1/auth/login
    async userLogin(req: Request, res: Response, next: NextFunction) {
        try {
            loginSchema.parse(req.body);
            const { user, accessToken, refreshToken } = await this.authService.userlogin(req.body);

            res.cookie("ecom-access-token", accessToken, {
                httpOnly: true,
                secure: SECURE,
                sameSite: "strict",
                maxAge: Number(ACCESS_TOKEN_MAXAGE),
            })
                .cookie("ecom-refresh-token", refreshToken, {
                    httpOnly: true,
                    secure: SECURE,
                    sameSite: "strict",
                    maxAge: Number(REFRESH_TOKEN_MAXAGE),
                })
                .status(STATUS_CODES.CREATED)
                .json({
                    success: true,
                    message: "✅ User login successful",
                    user,
                });
        } catch (error) {
            next(error);
        }
    }

    // @description: Login user with email OTP
    // @route: POST /api/v1/auth/email-login
    async userLoginWithEmailOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, verificationId } = req.body;
            if (!email || !verificationId) throw new NotFoundError("Invalid credentials");

            if (!mongoose.Types.ObjectId.isValid(verificationId)) throw new BadRequestError("Invalid verificationId");

            const { user, accessToken, refreshToken } = await this.authService.loginWithEmailOtp({ email, verificationId });

            res.cookie("ecom-access-token", accessToken, {
                httpOnly: true,
                secure: SECURE,
                sameSite: "strict",
                maxAge: Number(ACCESS_TOKEN_MAXAGE),
            })
                .cookie("ecom-refresh-token", refreshToken, {
                    httpOnly: true,
                    secure: SECURE,
                    sameSite: "strict",
                    maxAge: Number(REFRESH_TOKEN_MAXAGE),
                })
                .status(STATUS_CODES.CREATED)
                .json({
                    success: true,
                    message: "✅ User login successful",
                    user,
                });
        } catch (error) {
            next(error);
        }
    }
    // @description: Login user with phone OTP
    // @route: POST /api/v1/auth/login-phone
    async userLoginWithPhoneOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { phone, verificationId, code } = req.body;
            if (!phone || !verificationId || code) throw new NotFoundError("Invalid credentials");

            if (!mongoose.Types.ObjectId.isValid(verificationId)) throw new BadRequestError("Invalid verificationId");

            const { user, accessToken, refreshToken } = await this.authService.loginWithMobileOtp({ phone, code, verificationId });

            res.cookie("ecom-access-token", accessToken, {
                httpOnly: true,
                secure: SECURE,
                sameSite: "strict",
                maxAge: Number(ACCESS_TOKEN_MAXAGE),
            })
                .cookie("ecom-refresh-token", refreshToken, {
                    httpOnly: true,
                    secure: SECURE,
                    sameSite: "strict",
                    maxAge: Number(REFRESH_TOKEN_MAXAGE),
                })
                .status(STATUS_CODES.CREATED)
                .json({
                    success: true,
                    message: "✅ User login successful",
                    user,
                });
        } catch (error) {
            next(error);
        }
    }
    // @description: Forget password
    // @route: POST /api/v1/auth/forget-password
    async forgetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { credential, verificationId, verificationMethod, password } = req.body;
            
            if (!credential || !verificationId || !verificationMethod || !password) throw new NotFoundError("Invalid credentials");
            if (!["email", "phone"].includes(verificationMethod)) {
                throw new NotFoundError("Invalid verfication method");
            }
            if (!mongoose.Types.ObjectId.isValid(verificationId)) throw new BadRequestError("Invalid verificationId");

            const result = await this.authService.forgetPassword(req.body);
            res.status(STATUS_CODES.OK).json({
                success: true,
                message: "✅ You have successfully updated your password. Please log in with your new password.",
            });
        } catch (error) {
            next(error);
        }
    }
    // @description: Reset password
    // @route: POST /api/v1/auth/reset-password
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const {oldPassword,newPassword } = req.body;
            
            if(!oldPassword||!newPassword) throw new NotFoundError("Old password and new password is required");
            await this.authService.resetPassword(req.user?._id,oldPassword,newPassword);
            res.status(STATUS_CODES.OK).json({
                success: true,
                message: "✅ You have successfully updated your password",
            });
        } catch (error) {
            next(error);
        }
    }
}
