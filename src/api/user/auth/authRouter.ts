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


authRouter.post("/send-otp", controller.sendOTP.bind(controller));
authRouter.post("/verify-otp", controller.verifyOtp.bind(controller));
authRouter.post("/register", controller.register.bind(controller));
authRouter.post("/login", controller.userLogin.bind(controller));
authRouter.post("/login-email", controller.userLoginWithEmailOtp.bind(controller));
authRouter.post("/login-phone", controller.userLoginWithPhoneOtp.bind(controller));
authRouter.post("/forget-password", controller.forgetPassword.bind(controller));
authRouter.post("/reset-password", authenticate(), controller.resetPassword.bind(controller));
authRouter.post("/google-signup", controller.signUpWithGoogle.bind(controller));
authRouter.post("/google-login", controller.googleLogin.bind(controller));



export default authRouter;
