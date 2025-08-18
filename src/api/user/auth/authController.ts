import { NotFoundError } from "../../../constants/constants/customErrors";
import { STATUS_CODES } from "../../../constants/constants/statusCodes";
import { OTP_Method, OTP_Pupose } from "../../../enums/otp";
import { otpValidatorSchema, otpVerificationValidationSchema } from "../../../validations/otpValidator";
import { AuthService } from "./authService";
import { Request, Response, NextFunction } from "express";

export class AuthController {
    constructor(private authService: AuthService) {}

    // @description: Register a new user
    // @route: POST /api/v1/auth/register
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("Register endpoint hit");
        } catch (error) {
            next(error);
        }
    }

    // @description: Send otp a new user
    // @route: POST /api/v1/auth/send-otp
    async sendOTP(req: Request, res: Response, next: NextFunction) {
        try {
            otpValidatorSchema.parse(req.body);
            const { target, method, purpose, code } = req.body;

            if (method === OTP_Method.EMAIL && !target.includes("@")) {
                return res.status(400).json({ message: "Invalid email address" });
            }

            if (method === OTP_Method.PHONE && !/^\d{10}$/.test(target)) {
                return res.status(400).json({ message: "Invalid phone number" });
            }
            if (method === OTP_Method.PHONE && !code) {
                return res.status(400).json({ message: "Code is required for phone verification" });
            }

            const result = await this.authService.sendOTP({
                target,
                method,
                purpose,
                code,
            });
            res.status(STATUS_CODES.CREATED).json({
                message: "OTP sent successfully",
                data: result,
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
             const { target, method, purpose, code ,otp} = req.body;

            const result =  await this.authService.verifyOtp({target,method,purpose,otp,code})
            res.status(STATUS_CODES.OK).json({
                message: "OTP verification  successfull",
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }
}
