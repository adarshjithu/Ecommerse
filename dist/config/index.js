"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGODB_URI = exports.NODEMAILER_HOST = exports.NODEMAILER_SERVICE = exports.NODEMAILER_TRANSPORTER_PASSWORD = exports.NODEMAILER_TRANSPORTER_EMAIL = exports.REFRESH_TOKEN_EXPIRES_IN = exports.ACCESS_TOKEN_EXPIRES_IN = exports.JWT_REFRESH_SECRET = exports.JWT_ACCESS_SECRET = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
exports.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
exports.ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '10m';
exports.REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
exports.NODEMAILER_TRANSPORTER_EMAIL = process.env.NODEMAILER_TRANSPORTER_EMAIL;
exports.NODEMAILER_TRANSPORTER_PASSWORD = process.env.NODEMAILER_TRANSPORTER_PASSWORD;
exports.NODEMAILER_SERVICE = process.env.NODEMAILER_SERVICE || 'gmail';
exports.NODEMAILER_HOST = process.env.NODEMAILER_HOST || 'smtp.gmail.com';
exports.MONGODB_URI = process.env.MONGODB_URI;
