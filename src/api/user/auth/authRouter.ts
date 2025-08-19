import express from "express";
import { AuthRepository } from "./authRepository";
import { AuthService } from "./authService";
import { AuthController } from "./authController";
import { OtpRepository } from "../../../repository/otpRepository";

const authRouter = express.Router();

const authRepository = new AuthRepository();
const otpRepository =  new OtpRepository()
const authService = new AuthService(authRepository,otpRepository);
const controller = new AuthController(authService);

authRouter.post("/register",(req,res,next)=>controller.register(req,res,next));
authRouter.post("/send-otp", (req, res, next) => controller.sendOTP(req, res, next));
authRouter.post("/verify-otp", (req, res, next) => controller.verifyOtp(req, res, next));
authRouter.post("/register",(req,res,next)=>controller.register(req,res,next))

export default authRouter;
