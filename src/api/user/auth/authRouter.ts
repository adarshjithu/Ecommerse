import express from "express";
import { AuthRepository } from "./authRepository";
import { AuthService } from "./authService";
import { AuthController } from "./authController";

const authRouter = express.Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const controller = new AuthController(authService);

authRouter.post("/register",(req,res,next)=>controller.register(req,res,next));

export default authRouter;
