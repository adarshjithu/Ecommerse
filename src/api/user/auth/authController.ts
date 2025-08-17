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
}
