import dotenv from 'dotenv';
dotenv.config();

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '10m';
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export const NODEMAILER_TRANSPORTER_EMAIL = process.env.NODEMAILER_TRANSPORTER_EMAIL;
export const NODEMAILER_TRANSPORTER_PASSWORD = process.env.NODEMAILER_TRANSPORTER_PASSWORD; 
export const NODEMAILER_SERVICE = process.env.NODEMAILER_SERVICE || 'gmail';
export const NODEMAILER_HOST = process.env.NODEMAILER_HOST || 'smtp.gmail.com';

export const MONGODB_URI = process.env.MONGODB_URI

export const ACCESS_TOKEN_MAXAGE = process.env.ACCESS_TOKEN_MAXAGE
export const REFRESH_TOKEN_MAXAGE = process.env.REFRESH_TOKEN_MAXAGE

export const SECURE = process.env.NODE_ENV === "production"
export const GOOGLE_CLIENT_ID =process.env.GOOGLE_CLIENT_ID