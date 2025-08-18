import jwt, { SignOptions } from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES_IN, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, REFRESH_TOKEN_EXPIRES_IN } from "../../config";

type JwtPayload = { userId: string; role: string };

export const generateAccessToken = (payload: JwtPayload) => {
    return jwt.sign({ data: payload }, `${JWT_ACCESS_SECRET}`, { expiresIn: ACCESS_TOKEN_EXPIRES_IN || "10m" } as SignOptions);
};

export const generateRefreshToken = (payload: JwtPayload) => {
    return jwt.sign({ data: payload }, `${JWT_REFRESH_SECRET}`, { expiresIn: REFRESH_TOKEN_EXPIRES_IN || "7d" } as SignOptions);
};

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, `${JWT_ACCESS_SECRET}`);
    } catch (error: any) {
        console.log("Error while jwt token verification", error.message);
        return null;
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, `${JWT_REFRESH_SECRET}`);
    } catch (error: any) {
        console.log("Error while jwt refresh token verification", error.message);
        return null;
    }
};
