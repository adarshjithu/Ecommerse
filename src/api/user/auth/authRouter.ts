import express from "express";
import { AuthRepository } from "./authRepository";
import { AuthService } from "./authService";
import { AuthController } from "./authController";
import { OtpRepository } from "../../../repository/otpRepository";
import { authenticate } from "../../../middlewares/authenticate";

const authRouter = express.Router();

const authRepository = new AuthRepository();
const otpRepository =  new OtpRepository()
const authService = new AuthService(authRepository,otpRepository);
const controller = new AuthController(authService);


authRouter.post("/send-otp", (req, res, next) => controller.sendOTP(req, res, next));
authRouter.post("/verify-otp", (req, res, next) => controller.verifyOtp(req, res, next));
authRouter.post("/register",(req,res,next)=>controller.register(req,res,next));
authRouter.post("/login",(req,res,next)=>controller.userLogin(req,res,next));
authRouter.post('/login-email',(req,res,next)=>controller.userLoginWithEmailOtp(req,res,next));
authRouter.post("/login-phone",(req,res,next)=>controller.userLoginWithPhoneOtp(req,res,next));
authRouter.post('/forget-password',(req,res,next)=>controller.forgetPassword(req,res,next));
authRouter.post('/reset-password',authenticate(),(req,res,next)=>controller.resetPassword(req,res,next));
authRouter.post('/google-signup',(req,res,next)=>controller.signUpWithGoogle(req,res,next));
authRouter.post('/google-login',(req,res,next)=>controller.googleLogin(req,res,next))


export default authRouter;
