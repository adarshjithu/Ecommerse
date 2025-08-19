import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    ResourceGoneError,
    UnAuthorizedError,
} from "../../../constants/constants/customErrors";
import { OTP_Purpose } from "../../../enums/otp";

import otpModel, { IOtp } from "../../../models/otpModel";
import { IUser } from "../../../models/userModel";
import { OtpRepository } from "../../../repository/otpRepository";
import { sendEmail } from "../../../utils/mail/sendMail";
import { validateEmail } from "../../../utils/mail/validateEmail";
import { generateOtp } from "../../../utils/otp/generateOtp";
import { comparePassword, hashPassword } from "../../../utils/password/passwordUtils";
import { validateMobilenumber } from "../../../utils/phone/phoneValidation";
import { sendOtpToPhone } from "../../../utils/phone/sendOtpToPhone";
import { generateAccessToken, generateRefreshToken } from "../../../utils/token/tokenUtils";
import { AuthRepository } from "./authRepository";

interface OtpPayload {
    target: string;

    purpose: string;
    code?: string;
    otp?: string;
}

interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: IUser;
}

export class AuthService {
    constructor(private authRepository: AuthRepository, private otpRepository: OtpRepository) {}

    async sendOTP({ target, purpose, code }: OtpPayload): Promise<IOtp | null> {
        if (!target || !purpose) throw new BadRequestError("Missing required fields");

        // 1. Determine communication method
        const { email, phone } = this.getPurposeFlags(purpose);

        // 2. Validate input
        this.validateInput({ target, code, email, phone });

        // 3. User existence & conflict checks
        await this.validateUser({ target, purpose, code, email, phone });

        // 4. Prevent duplicate OTP
        await this.ensureNoActiveOtp({ purpose, target, code, phone });

        // 5. Generate & send OTP
        return await this.generateAndSendOtp({ target, purpose, code, email, phone });
    }

    // ---------------- Private helpers ----------------

    private getPurposeFlags(purpose: string) {
        const email = [OTP_Purpose.LOGIN_EMAIL, OTP_Purpose.REGISTER_EMAIL, OTP_Purpose.FORGET_PASSWORD_EMAIL].includes(purpose as OTP_Purpose);
        const phone = [OTP_Purpose.LOGIN_PHONE, OTP_Purpose.REGISTER_PHONE, OTP_Purpose.FORGET_PASSWORD_PHONE].includes(purpose as OTP_Purpose);

        if (!email && !phone) throw new NotFoundError("Invalid purpose");
        return { email, phone };
    }

    private validateInput({ target, code, email, phone }: { target: string; code?: string; email: boolean; phone: boolean }) {
        if (phone && !code) throw new BadRequestError("Country code is required");

        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(target)) throw new BadRequestError("Invalid email address");
        }

        if (phone) {
            const phoneRegex = /^\d{10,15}$/;
            if (!phoneRegex.test(target)) throw new BadRequestError("Invalid phone number");
        }
    }

    private async validateUser({ target, purpose, code, email, phone }: any) {
        let user: any = null;

        if (email) {
            user = await this.authRepository.findOne({ email: target });
            if ([OTP_Purpose.LOGIN_EMAIL, OTP_Purpose.FORGET_PASSWORD_EMAIL].includes(purpose as OTP_Purpose) && !user) {
                throw new NotFoundError("Invalid credential. User not found");
            }
            if (purpose === OTP_Purpose.REGISTER_EMAIL && user) {
                throw new ConflictError("Email already in use");
            }
        }

        if (phone) {
            user = await this.authRepository.findOne({ phone: { code, number: target } });
            if ([OTP_Purpose.LOGIN_PHONE, OTP_Purpose.FORGET_PASSWORD_PHONE].includes(purpose as OTP_Purpose) && !user) {
                throw new NotFoundError("Invalid credential. User not found");
            }
            if (purpose === OTP_Purpose.REGISTER_PHONE && user) {
                throw new ConflictError("Phone number already in use");
            }
        }
    }

    private async ensureNoActiveOtp({ purpose, target, code, phone }: { purpose: string; target: string; code?: string; phone: boolean }) {
        const otpQuery: any = { purpose, target };
        if (phone) otpQuery.code = code;

        const existingOtpData = await this.otpRepository.findByQuery(otpQuery);
        if (existingOtpData && existingOtpData.expiresAt > new Date()) {
            throw new ConflictError("OTP already sent. Please try again after it expires.");
        }
    }

    private async generateAndSendOtp({ target, purpose, code, email, phone }: any): Promise<IOtp> {
        const otp = generateOtp(6);
        const newOtp = {
            target,
            otp,
            purpose,
            code,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
            isUsed: false,
            attempts: 0,
        };

        if (email) {
            const isEmailSent = await sendEmail(target, `Your OTP is ${otp}`, `<p>Your OTP is <strong>${otp}</strong></p>`);
            if (!isEmailSent) throw new Error("Failed to send OTP via email");
        }

        if (phone) {
            const isOtpSent = sendOtpToPhone(target, otp);
            if (!isOtpSent) throw new BadRequestError("Failed to send OTP via phone");
        }

        return await this.otpRepository.createOtp(newOtp);
    }

    // Verify OTP
    async verifyOtp({ target, purpose, otp, code }: OtpPayload): Promise<{ verificationId: string }> {
        //  Validate purpose
        if (!Object.values(OTP_Purpose).includes(purpose as OTP_Purpose)) {
            throw new BadRequestError("Invalid OTP purpose");
        }

        // Build query
        const otpQuery: any = { purpose, target };
        const { email, phone } = this.getPurposeFlags(purpose);
        if (phone) {
            otpQuery.code = code; // extra check for phone
        }

        // Fetch OTP object
        const otpObj = await this.otpRepository.findByQuery(otpQuery);
        if (!otpObj) {
            throw new NotFoundError("No OTP request found. Please request a new OTP.");
        }

        // Check if already used
        if (otpObj.isUsed) {
            throw new BadRequestError("This OTP has already been used. Please request a new one.");
        }

        // Check expiration (if expiry field exists)
        if (otpObj.expiresAt && otpObj.expiresAt < new Date()) {
            await this.otpRepository.delete(otpObj._id);
            throw new BadRequestError("This OTP has expired. Please request a new one.");
        }

        // Validate OTP
        if (otpObj.otp !== otp) {
            otpObj.attempts += 1;
            await otpObj.save();

            if (otpObj.attempts >= 5) {
                await this.otpRepository.delete(otpObj._id);
                throw new BadRequestError("You have reached the maximum number of attempts. Please request a new OTP.");
            }

            throw new BadRequestError(`Incorrect OTP. You have ${5 - otpObj.attempts} attempt(s) left.`);
        }

        // Mark OTP as used
        otpObj.isUsed = true;
        await otpObj.save();

        return { verificationId: otpObj._id.toString() };
    }

    // User registration
    async registerUser({
        email,
        phone,
        password,
        name,
        verificationMethod,
        verificationId,
    }: IUser & { verificationMethod: string; verificationId: string }): Promise<IAuthResponse> {
        let otpQuery: any = { _id: verificationId };
        if (verificationMethod == "email") otpQuery.target = email;
        if (verificationId == "phone") {
            otpQuery.target == phone?.number;
            otpQuery.code = phone.code;
        }
        const otpData = await this.otpRepository.findOne(otpQuery);

        if (!otpData) throw new NotFoundError("Authentication failed. Otp session expired");

        if (!otpData.isUsed) throw new BadRequestError("OTP is not verified");
        // Check if email already exists
        const existingEmail = await this.authRepository.findOne({ email });

        if (existingEmail) throw new ConflictError("Email already in use");

        // Check if phone already exists
        const existingPhone = await this.authRepository.findOne({ phone });
        if (existingPhone) throw new ConflictError("Phone number already in use");

        // Hash password
        const hashedPassword = await hashPassword(password);

        const newUser: any = {
            name,
            email,
            phone,
            password: hashedPassword,
        };
        if (verificationMethod == "email") newUser.isEmailVerified = true;
        if (verificationMethod == "phone") newUser.isPhoneVerified = true;
        if (verificationMethod == "google") newUser.isGoogleVerified = true;

        // Create user
        const userDoc = await this.authRepository.create(newUser);

        // Generate tokens
        const accessToken = generateAccessToken({ userId: userDoc._id, role: userDoc.role });
        const refreshToken = generateRefreshToken({ userId: userDoc._id, role: userDoc.role });

        // Convert mongoose doc -> plain object and remove password
        const user = userDoc.toObject();
        delete user.password;

        return { user, accessToken, refreshToken };
    }

    // User login
    async userlogin({ credential, password }: { credential: string; password: string }): Promise<IAuthResponse> {
        if (!credential || !password) {
            throw new NotFoundError("Credential and password are required");
        }

        let user;
        const isEmail = credential.includes("@");

        if (isEmail) {
            // Case-insensitive email match
            user = await this.authRepository.findOne({
                email: { $regex: new RegExp(`^${credential}$`, "i") },
            });
        } else {
            // Split phone using " " only
            const parts = credential.trim().split(" ");
            if (parts.length !== 2) {
                throw new BadRequestError("Invalid phone format. Use '+<code> <number>' (e.g. +91 9876543210)");
            }

            const [code, number] = parts;

            // Basic validation
            if (!/^\+\d{1,4}$/.test(code) || !/^\d{6,15}$/.test(number)) {
                throw new BadRequestError("Invalid phone code or number format");
            }

            user = await this.authRepository.findOne({
                "phone.code": code,
                "phone.number": number,
            });
        }

        if (!user) {
            throw new NotFoundError("User not found");
        }

        if (user.isBlocked) {
            throw new ForbiddenError("User is blocked");
        }

        if (user.isDeleted) {
            throw new ResourceGoneError("Accont has been deleted");
        }

        if (!isEmail && !user.isPhoneVerified) {
            throw new ForbiddenError("Phone number is not verified");
        }

        if (isEmail && !user.isEmailVerified) {
            throw new ForbiddenError("Email is not verified");
        }

        const isPasswordMatch = await comparePassword(password, user?.password);
        if (!isPasswordMatch) throw new UnAuthorizedError("Incorrect password");
        const newUser = user.toObject();
        delete newUser.password;
        const accessToken = generateAccessToken({ userId: user?._id, role: user?.role });
        const refreshToken = generateRefreshToken({ userId: user?._id, role: user?.role });
        return { accessToken, refreshToken, user: newUser };
    }

    // Login with email OTP
    async loginWithEmailOtp({ email, verificationId }: { email: string; verificationId: string }): Promise<IAuthResponse> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) throw new BadRequestError("Please provide a valid email address");

        const otpData = await this.otpRepository.findOne({ _id: verificationId, target: email });
        if (!otpData) {
            throw new NotFoundError("Invalid or expired verification request. Please request a new OTP.");
        }

        if (!otpData.isUsed) {
            throw new BadRequestError("Verification ID has not been verified or is invalid");
        }

        const user = await this.authRepository.findOne({ email: email });
        if (!user) throw new NotFoundError("No account found with this email address");

        if (!user?.isEmailVerified) throw new UnAuthorizedError("Your email is not verified. Please verify your email to continue.");

        if (user?.isBlocked) throw new ForbiddenError("Your account has been blocked. Contact support for assistance.");

        if (user?.isDeleted) throw new ResourceGoneError("This account has been deleted.");

        const newUser = user.toObject();
        const accessToken = generateAccessToken({ userId: user?._id, role: user?.role });
        const refreshToken = generateRefreshToken({ userId: user?._id, role: user?.role });

        return { accessToken, refreshToken, user: newUser };
    }

    // Login with mobile OTP
    async loginWithMobileOtp({ phone, code, verificationId }: { phone: string; code: string; verificationId: string }): Promise<IAuthResponse> {
        const phoneRegex = /^\d{10,15}$/;
        if (!phoneRegex.test(phone)) throw new BadRequestError("Invalid phone number");

        const otpData = await this.otpRepository.findOne({ _id: verificationId, target: phone, code });
        if (!otpData) {
            throw new NotFoundError("Invalid verificationId");
        }

        if (!otpData.isUsed) {
            throw new BadRequestError("Verification ID has not been verified or is invalid");
        }

        const user = await this.authRepository.findOne({ phone: { number: phone, code: code } });

        if (!user) throw new NotFoundError("No account found with this phonenumber");

        if (!user?.isEmailVerified) throw new UnAuthorizedError("Your email is not verified. Please verify your email to continue.");

        if (user?.isBlocked) throw new ForbiddenError("Your account has been blocked. Contact support for assistance.");

        if (user?.isDeleted) throw new ResourceGoneError("This account has been deleted.");

        const newUser = user.toObject();
        const accessToken = generateAccessToken({ userId: user?._id, role: user?.role });
        const refreshToken = generateRefreshToken({ userId: user?._id, role: user?.role });
        return { accessToken, refreshToken, user: newUser };
    }

    // Change the userpassword
    async forgetPassword({ credential, verificationId, verificationMethod, password }: Record<string, any>): Promise<any> {
        const otpQuery: any = { _id: verificationId, target: credential };

        if (verificationMethod == "phone") {
            const parts = credential.trim().split(" ");
            const [code, number] = parts;

            otpQuery.target = number;
            otpQuery.code = code;
        }

        const otpData = await this.otpRepository.findOne(otpQuery);
        if (!otpData) {
            throw new NotFoundError("Verification record not found");
        }

        if (!otpData.isUsed) {
            throw new BadRequestError("Verification ID has not been verified or is invalid");
        }

        let userQuery: any = {};
        if (verificationMethod == "email") {
            if (!validateEmail(credential)) throw new BadRequestError("Invalid Email address");
            userQuery.email = credential;
        }

        if (verificationMethod == "phone") {
            const parts = credential.trim().split(" ");
            const [code, number] = parts;
            if (!validateMobilenumber(number)) throw new BadRequestError("Invalid phonenumber");
            userQuery.phone = { code, number };
        }

        const user = await this.authRepository.findOne(userQuery);
        if (!user) throw new NotFoundError("User not found");

        const isSamePassword = await comparePassword(password, user?.password);
        if (isSamePassword) throw new ConflictError("New password cannot be the same as the current password.");
        const hashedPassword = await hashPassword(password);
        user.password = hashedPassword;
        await user.save();
        return;
    }
    async resetPassword(userId: string, oldPassword: string, newPassword: string): Promise<any> {
        const user = await this.authRepository.findById(userId);
        if (!user) throw new NotFoundError("User not found");

        if (user.isBlocked) throw new ForbiddenError("User has been blocked");
        if (user.isDeleted) throw new ResourceGoneError("This account has been deleted");

        const passwordValid = await comparePassword(oldPassword, user.password);
        if (!passwordValid) throw new UnAuthorizedError("The old password you entered is incorrect");

        const isSamePassword = await comparePassword(newPassword, user.password);
        if (isSamePassword) throw new ConflictError("New password cannot be the same as the old password");

        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;

        await user.save();

        return { message: "✅ Password updated successfully" };
    }
}
