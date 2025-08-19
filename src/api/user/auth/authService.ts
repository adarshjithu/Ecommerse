import { BadRequestError, ConflictError, NotFoundError } from "../../../constants/constants/customErrors";
import otpModel, { IOtp } from "../../../models/otpModel";
import { IUser } from "../../../models/userModel";
import { OtpRepository } from "../../../repository/otpRepository";
import { sendEmail } from "../../../utils/mail/sendMail";
import { generateOtp } from "../../../utils/otp/generateOtp";
import { hashPassword } from "../../../utils/password/passwordUtils";
import { sendOtpToPhone } from "../../../utils/phone/sendOtpToPhone";
import { generateAccessToken, generateRefreshToken } from "../../../utils/token/tokenUtils";
import { AuthRepository } from "./authRepository";

interface OtpPayload {
    target: string;
    method: "email" | "phone";
    purpose: string;
    code?: string;
    otp?: string;
}

export class AuthService {
    constructor(private authRepository: AuthRepository, private otpRepository: OtpRepository) {}

    // Send otp for all the usecases
    async sendOTP({ target, method, purpose, code }: OtpPayload): Promise<IOtp | null> {
        if (!target || !method || !purpose) {
            throw new Error("Missing required fields");
        }

        // Build user query
        const userFindQuery: any = method === "email" ? { email: target } : { phone: { number: target, code } };

        // Check if user already exists
        const user = await this.authRepository.findByQuery(userFindQuery);
        if (user) {
            if (method === "email") {
                throw new ConflictError(`User already exists with this email: ${target}`);
            } else {
                throw new ConflictError(`User already exists with this phone: ${code}-${target}`);
            }
        }

        // Prevent resending OTPs if not expired
        const otpQuery: any = { purpose, method, target };
        if (method === "phone") otpQuery.code = code;

        const existingOtpData = await this.otpRepository.findByQuery(otpQuery);

        if (existingOtpData && existingOtpData.expiresAt > new Date()) {
            throw new ConflictError("OTP already sent. Please try again after it expires.");
        }

        // Generate new OTP
        const otp = generateOtp(6);
        const newOtp = {
            target,
            otp,
            method,
            purpose,
            code,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            isUsed: false,
            attempts: 0,
        };

        if (method === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(target)) {
                throw new BadRequestError("Invalid email address");
            }

            const isEmailSent = await sendEmail(target, `Your OTP is ${otp}`, `<p>Your OTP is <strong>${otp}</strong></p>`);
            if (!isEmailSent) {
                throw new Error("Failed to send OTP via email");
            }
        } else {
            const phoneRegex = /^\d{10,15}$/;
            if (!phoneRegex.test(target)) {
                throw new BadRequestError("Invalid phone number");
            }

            const isOtpSent = sendOtpToPhone(target, otp);
            if (!isOtpSent) {
                throw new BadRequestError("Failed to send OTP via phone");
            }
        }

        return await this.otpRepository.createOtp(newOtp);
    }

    // Verify OTP
    async verifyOtp({ target, method, purpose, otp, code }: OtpPayload): Promise<IOtp | null> {
        const otpQuery: any = { purpose, method, target };

        if (method === "phone") otpQuery.code = code;

        const otpObj = await this.otpRepository.findByQuery(otpQuery);

        if (!otpObj) throw new NotFoundError("No OTP request found. Please request a new OTP.");

        if (otpObj?.isUsed) throw new BadRequestError("This OTP has already been used. Please request a new OTP.");

        otpObj.attempts += 1;

        if (otpObj.otp !== otp) {
            if (otpObj.attempts >= 5) {
                await this.otpRepository.delete(otpObj._id);
                throw new BadRequestError("You have reached the maximum number of attempts. Please request a new OTP.");
            }
            throw new BadRequestError(`Incorrect OTP. You have ${5 - otpObj.attempts} attempt(s) left.`);
        }

        otpObj.isUsed = true;
        await otpObj.save();
        return otpObj;
    }

// User registration
async registerUser({ email, phone, password, name,verificationMethod }: IUser&{verificationMethod:string}): Promise<{ accessToken: string; refreshToken: string; user: IUser }> {
    // Check if email already exists
    const existingEmail = await this.authRepository.findOne({ email });
    if (existingEmail) throw new ConflictError("Email already in use");

    // Check if phone already exists
    const existingPhone = await this.authRepository.findOne({ phone });
    if (existingPhone) throw new ConflictError("Phone number already in use");

    // Hash password
    const hashedPassword = await hashPassword(password);

    const newUser:any = {
        name,
        email,
        phone,
        password: hashedPassword,
        
    }
    if(verificationMethod=='email') newUser.isEmailVerified = true;
    if(verificationMethod=='phone') newUser.isPhoneVerified = true;
    if(verificationMethod=='google') newUser.isGoogleVerified = true;
    
    // Create user
    const userDoc = await this.authRepository.create(newUser);
    
    // Generate tokens
    const accessToken = generateAccessToken({ userId: userDoc._id, role: userDoc.role });
    const refreshToken = generateRefreshToken({ userId: userDoc._id, role: userDoc.role });

    // Convert mongoose doc -> plain object and remove password
    const user = userDoc.toObject();
    delete user.password;

    return { user, accessToken, refreshToken };}
}
