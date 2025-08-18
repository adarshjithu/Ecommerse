"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign({ data: payload }, `${config_1.JWT_ACCESS_SECRET}`, { expiresIn: config_1.ACCESS_TOKEN_EXPIRES_IN || "10m" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign({ data: payload }, `${config_1.JWT_REFRESH_SECRET}`, { expiresIn: config_1.REFRESH_TOKEN_EXPIRES_IN || "7d" });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, `${config_1.JWT_ACCESS_SECRET}`);
    }
    catch (error) {
        console.log("Error while jwt token verification", error.message);
        return null;
    }
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, `${config_1.JWT_REFRESH_SECRET}`);
    }
    catch (error) {
        console.log("Error while jwt refresh token verification", error.message);
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
