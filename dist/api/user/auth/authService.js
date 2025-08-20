"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const customErrors_1 = require("../../../constants/constants/customErrors");
const otp_1 = require("../../../enums/otp");
const sendMail_1 = require("../../../utils/mail/sendMail");
const validateEmail_1 = require("../../../utils/mail/validateEmail");
const generateOtp_1 = require("../../../utils/otp/generateOtp");
const passwordUtils_1 = require("../../../utils/password/passwordUtils");
const phoneValidation_1 = require("../../../utils/phone/phoneValidation");
const sendOtpToPhone_1 = require("../../../utils/phone/sendOtpToPhone");
const tokenUtils_1 = require("../../../utils/token/tokenUtils");
class AuthService {
    constructor(authRepository, otpRepository) {
        this.authRepository = authRepository;
        this.otpRepository = otpRepository;
    }
    sendOTP(_a) {
        return __awaiter(this, arguments, void 0, function* ({ target, purpose, code }) {
            if (!target || !purpose)
                throw new customErrors_1.BadRequestError("Missing required fields");
            // 1. Determine communication method
            const { email, phone } = this.getPurposeFlags(purpose);
            // 2. Validate input
            this.validateInput({ target, code, email, phone });
            // 3. User existence & conflict checks
            yield this.validateUser({ target, purpose, code, email, phone });
            // 4. Prevent duplicate OTP
            yield this.ensureNoActiveOtp({ purpose, target, code, phone });
            // 5. Generate & send OTP
            return yield this.generateAndSendOtp({ target, purpose, code, email, phone });
        });
    }
    // ---------------- Private helpers ----------------
    getPurposeFlags(purpose) {
        const email = [otp_1.OTP_Purpose.LOGIN_EMAIL, otp_1.OTP_Purpose.REGISTER_EMAIL, otp_1.OTP_Purpose.FORGET_PASSWORD_EMAIL].includes(purpose);
        const phone = [otp_1.OTP_Purpose.LOGIN_PHONE, otp_1.OTP_Purpose.REGISTER_PHONE, otp_1.OTP_Purpose.FORGET_PASSWORD_PHONE].includes(purpose);
        if (!email && !phone)
            throw new customErrors_1.NotFoundError("Invalid purpose");
        return { email, phone };
    }
    validateInput({ target, code, email, phone }) {
        if (phone && !code)
            throw new customErrors_1.BadRequestError("Country code is required");
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(target))
                throw new customErrors_1.BadRequestError("Invalid email address");
        }
        if (phone) {
            const phoneRegex = /^\d{10,15}$/;
            if (!phoneRegex.test(target))
                throw new customErrors_1.BadRequestError("Invalid phone number");
        }
    }
    validateUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ target, purpose, code, email, phone }) {
            let user = null;
            if (email) {
                user = yield this.authRepository.findOne({ email: target });
                if ([otp_1.OTP_Purpose.LOGIN_EMAIL, otp_1.OTP_Purpose.FORGET_PASSWORD_EMAIL].includes(purpose) && !user) {
                    throw new customErrors_1.NotFoundError("Invalid credential. User not found");
                }
                if (purpose === otp_1.OTP_Purpose.REGISTER_EMAIL && user) {
                    throw new customErrors_1.ConflictError("Email already in use");
                }
            }
            if (phone) {
                user = yield this.authRepository.findOne({ phone: { code, number: target } });
                if ([otp_1.OTP_Purpose.LOGIN_PHONE, otp_1.OTP_Purpose.FORGET_PASSWORD_PHONE].includes(purpose) && !user) {
                    throw new customErrors_1.NotFoundError("Invalid credential. User not found");
                }
                if (purpose === otp_1.OTP_Purpose.REGISTER_PHONE && user) {
                    throw new customErrors_1.ConflictError("Phone number already in use");
                }
            }
        });
    }
    ensureNoActiveOtp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ purpose, target, code, phone }) {
            const otpQuery = { purpose, target };
            if (phone)
                otpQuery.code = code;
            const existingOtpData = yield this.otpRepository.findByQuery(otpQuery);
            if (existingOtpData && existingOtpData.expiresAt > new Date()) {
                throw new customErrors_1.ConflictError("OTP already sent. Please try again after it expires.");
            }
        });
    }
    generateAndSendOtp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ target, purpose, code, email, phone }) {
            const otp = (0, generateOtp_1.generateOtp)(6);
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
                const isEmailSent = yield (0, sendMail_1.sendEmail)(target, `Your OTP is ${otp}`, `<p>Your OTP is <strong>${otp}</strong></p>`);
                if (!isEmailSent)
                    throw new Error("Failed to send OTP via email");
            }
            if (phone) {
                const isOtpSent = (0, sendOtpToPhone_1.sendOtpToPhone)(target, otp);
                if (!isOtpSent)
                    throw new customErrors_1.BadRequestError("Failed to send OTP via phone");
            }
            return yield this.otpRepository.createOtp(newOtp);
        });
    }
    // Verify OTP
    verifyOtp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ target, purpose, otp, code }) {
            //  Validate purpose
            if (!Object.values(otp_1.OTP_Purpose).includes(purpose)) {
                throw new customErrors_1.BadRequestError("Invalid OTP purpose");
            }
            // Build query
            const otpQuery = { purpose, target };
            const { email, phone } = this.getPurposeFlags(purpose);
            if (phone) {
                otpQuery.code = code; // extra check for phone
            }
            // Fetch OTP object
            const otpObj = yield this.otpRepository.findByQuery(otpQuery);
            if (!otpObj) {
                throw new customErrors_1.NotFoundError("No OTP request found. Please request a new OTP.");
            }
            // Check if already used
            if (otpObj.isUsed) {
                throw new customErrors_1.BadRequestError("This OTP has already been used. Please request a new one.");
            }
            // Check expiration (if expiry field exists)
            if (otpObj.expiresAt && otpObj.expiresAt < new Date()) {
                yield this.otpRepository.delete(otpObj._id);
                throw new customErrors_1.BadRequestError("This OTP has expired. Please request a new one.");
            }
            // Validate OTP
            if (otpObj.otp !== otp) {
                otpObj.attempts += 1;
                yield otpObj.save();
                if (otpObj.attempts >= 5) {
                    yield this.otpRepository.delete(otpObj._id);
                    throw new customErrors_1.BadRequestError("You have reached the maximum number of attempts. Please request a new OTP.");
                }
                throw new customErrors_1.BadRequestError(`Incorrect OTP. You have ${5 - otpObj.attempts} attempt(s) left.`);
            }
            // Mark OTP as used
            otpObj.isUsed = true;
            yield otpObj.save();
            return { verificationId: otpObj._id.toString() };
        });
    }
    // User registration
    registerUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, phone, password, name, verificationMethod, verificationId, }) {
            let otpQuery = { _id: verificationId };
            if (verificationMethod == "email")
                otpQuery.target = email;
            if (verificationId == "phone") {
                otpQuery.target == (phone === null || phone === void 0 ? void 0 : phone.number);
                otpQuery.code = phone.code;
            }
            const otpData = yield this.otpRepository.findOne(otpQuery);
            if (!otpData)
                throw new customErrors_1.NotFoundError("Authentication failed. Otp session expired");
            if (!otpData.isUsed)
                throw new customErrors_1.BadRequestError("OTP is not verified");
            // Check if email already exists
            const existingEmail = yield this.authRepository.findOne({ email });
            if (existingEmail)
                throw new customErrors_1.ConflictError("Email already in use");
            // Check if phone already exists
            const existingPhone = yield this.authRepository.findOne({ phone });
            if (existingPhone)
                throw new customErrors_1.ConflictError("Phone number already in use");
            // Hash password
            const hashedPassword = yield (0, passwordUtils_1.hashPassword)(password);
            const newUser = {
                name,
                email,
                phone,
                password: hashedPassword,
            };
            if (verificationMethod == "email")
                newUser.isEmailVerified = true;
            if (verificationMethod == "phone")
                newUser.isPhoneVerified = true;
            if (verificationMethod == "google")
                newUser.isGoogleVerified = true;
            // Create user
            const userDoc = yield this.authRepository.create(newUser);
            // Generate tokens
            const accessToken = (0, tokenUtils_1.generateAccessToken)({ userId: userDoc._id, role: userDoc.role });
            const refreshToken = (0, tokenUtils_1.generateRefreshToken)({ userId: userDoc._id, role: userDoc.role });
            // Convert mongoose doc -> plain object and remove password
            const user = userDoc.toObject();
            delete user.password;
            return { user, accessToken, refreshToken };
        });
    }
    // User login
    userlogin(_a) {
        return __awaiter(this, arguments, void 0, function* ({ credential, password }) {
            if (!credential || !password) {
                throw new customErrors_1.NotFoundError("Credential and password are required");
            }
            let user;
            const isEmail = credential.includes("@");
            if (isEmail) {
                // Case-insensitive email match
                user = yield this.authRepository.findOne({
                    email: { $regex: new RegExp(`^${credential}$`, "i") },
                });
            }
            else {
                // Split phone using " " only
                const parts = credential.trim().split(" ");
                if (parts.length !== 2) {
                    throw new customErrors_1.BadRequestError("Invalid phone format. Use '+<code> <number>' (e.g. +91 9876543210)");
                }
                const [code, number] = parts;
                // Basic validation
                if (!/^\+\d{1,4}$/.test(code) || !/^\d{6,15}$/.test(number)) {
                    throw new customErrors_1.BadRequestError("Invalid phone code or number format");
                }
                user = yield this.authRepository.findOne({
                    "phone.code": code,
                    "phone.number": number,
                });
            }
            if (!user) {
                throw new customErrors_1.NotFoundError("User not found");
            }
            if (user.isBlocked) {
                throw new customErrors_1.ForbiddenError("User is blocked");
            }
            if (user.isDeleted) {
                throw new customErrors_1.ResourceGoneError("Accont has been deleted");
            }
            if (!isEmail && !user.isPhoneVerified) {
                throw new customErrors_1.ForbiddenError("Phone number is not verified");
            }
            if (isEmail && !user.isEmailVerified) {
                throw new customErrors_1.ForbiddenError("Email is not verified");
            }
            const isPasswordMatch = yield (0, passwordUtils_1.comparePassword)(password, user === null || user === void 0 ? void 0 : user.password);
            if (!isPasswordMatch)
                throw new customErrors_1.UnAuthorizedError("Incorrect password");
            const newUser = user.toObject();
            delete newUser.password;
            const accessToken = (0, tokenUtils_1.generateAccessToken)({ userId: user === null || user === void 0 ? void 0 : user._id, role: user === null || user === void 0 ? void 0 : user.role });
            const refreshToken = (0, tokenUtils_1.generateRefreshToken)({ userId: user === null || user === void 0 ? void 0 : user._id, role: user === null || user === void 0 ? void 0 : user.role });
            return { accessToken, refreshToken, user: newUser };
        });
    }
    // Login with email OTP
    loginWithEmailOtp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, verificationId }) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email))
                throw new customErrors_1.BadRequestError("Please provide a valid email address");
            const otpData = yield this.otpRepository.findOne({ _id: verificationId, target: email });
            if (!otpData) {
                throw new customErrors_1.NotFoundError("Invalid or expired verification request. Please request a new OTP.");
            }
            if (!otpData.isUsed) {
                throw new customErrors_1.BadRequestError("Verification ID has not been verified or is invalid");
            }
            const user = yield this.authRepository.findOne({ email: email });
            if (!user)
                throw new customErrors_1.NotFoundError("No account found with this email address");
            if (!(user === null || user === void 0 ? void 0 : user.isEmailVerified))
                throw new customErrors_1.UnAuthorizedError("Your email is not verified. Please verify your email to continue.");
            if (user === null || user === void 0 ? void 0 : user.isBlocked)
                throw new customErrors_1.ForbiddenError("Your account has been blocked. Contact support for assistance.");
            if (user === null || user === void 0 ? void 0 : user.isDeleted)
                throw new customErrors_1.ResourceGoneError("This account has been deleted.");
            const newUser = user.toObject();
            const accessToken = (0, tokenUtils_1.generateAccessToken)({ userId: user === null || user === void 0 ? void 0 : user._id, role: user === null || user === void 0 ? void 0 : user.role });
            const refreshToken = (0, tokenUtils_1.generateRefreshToken)({ userId: user === null || user === void 0 ? void 0 : user._id, role: user === null || user === void 0 ? void 0 : user.role });
            return { accessToken, refreshToken, user: newUser };
        });
    }
    // Login with mobile OTP
    loginWithMobileOtp(_a) {
        return __awaiter(this, arguments, void 0, function* ({ phone, code, verificationId }) {
            const phoneRegex = /^\d{10,15}$/;
            if (!phoneRegex.test(phone))
                throw new customErrors_1.BadRequestError("Invalid phone number");
            const otpData = yield this.otpRepository.findOne({ _id: verificationId, target: phone, code });
            if (!otpData) {
                throw new customErrors_1.NotFoundError("Invalid verificationId");
            }
            if (!otpData.isUsed) {
                throw new customErrors_1.BadRequestError("Verification ID has not been verified or is invalid");
            }
            const user = yield this.authRepository.findOne({ phone: { number: phone, code: code } });
            if (!user)
                throw new customErrors_1.NotFoundError("No account found with this phonenumber");
            if (!(user === null || user === void 0 ? void 0 : user.isEmailVerified))
                throw new customErrors_1.UnAuthorizedError("Your email is not verified. Please verify your email to continue.");
            if (user === null || user === void 0 ? void 0 : user.isBlocked)
                throw new customErrors_1.ForbiddenError("Your account has been blocked. Contact support for assistance.");
            if (user === null || user === void 0 ? void 0 : user.isDeleted)
                throw new customErrors_1.ResourceGoneError("This account has been deleted.");
            const newUser = user.toObject();
            const accessToken = (0, tokenUtils_1.generateAccessToken)({ userId: user === null || user === void 0 ? void 0 : user._id, role: user === null || user === void 0 ? void 0 : user.role });
            const refreshToken = (0, tokenUtils_1.generateRefreshToken)({ userId: user === null || user === void 0 ? void 0 : user._id, role: user === null || user === void 0 ? void 0 : user.role });
            return { accessToken, refreshToken, user: newUser };
        });
    }
    // Change the userpassword
    forgetPassword(_a) {
        return __awaiter(this, arguments, void 0, function* ({ credential, verificationId, verificationMethod, password }) {
            const otpQuery = { _id: verificationId, target: credential };
            if (verificationMethod == "phone") {
                const parts = credential.trim().split(" ");
                const [code, number] = parts;
                otpQuery.target = number;
                otpQuery.code = code;
            }
            const otpData = yield this.otpRepository.findOne(otpQuery);
            if (!otpData) {
                throw new customErrors_1.NotFoundError("Verification record not found");
            }
            if (!otpData.isUsed) {
                throw new customErrors_1.BadRequestError("Verification ID has not been verified or is invalid");
            }
            let userQuery = {};
            if (verificationMethod == "email") {
                if (!(0, validateEmail_1.validateEmail)(credential))
                    throw new customErrors_1.BadRequestError("Invalid Email address");
                userQuery.email = credential;
            }
            if (verificationMethod == "phone") {
                const parts = credential.trim().split(" ");
                const [code, number] = parts;
                if (!(0, phoneValidation_1.validateMobilenumber)(number))
                    throw new customErrors_1.BadRequestError("Invalid phonenumber");
                userQuery.phone = { code, number };
            }
            const user = yield this.authRepository.findOne(userQuery);
            if (!user)
                throw new customErrors_1.NotFoundError("User not found");
            const isSamePassword = yield (0, passwordUtils_1.comparePassword)(password, user === null || user === void 0 ? void 0 : user.password);
            if (isSamePassword)
                throw new customErrors_1.ConflictError("New password cannot be the same as the current password.");
            const hashedPassword = yield (0, passwordUtils_1.hashPassword)(password);
            user.password = hashedPassword;
            yield user.save();
            return;
        });
    }
    resetPassword(userId, oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authRepository.findById(userId);
            if (!user)
                throw new customErrors_1.NotFoundError("User not found");
            if (user.isBlocked)
                throw new customErrors_1.ForbiddenError("User has been blocked");
            if (user.isDeleted)
                throw new customErrors_1.ResourceGoneError("This account has been deleted");
            const passwordValid = yield (0, passwordUtils_1.comparePassword)(oldPassword, user.password);
            if (!passwordValid)
                throw new customErrors_1.UnAuthorizedError("The old password you entered is incorrect");
            const isSamePassword = yield (0, passwordUtils_1.comparePassword)(newPassword, user.password);
            if (isSamePassword)
                throw new customErrors_1.ConflictError("New password cannot be the same as the old password");
            const hashedPassword = yield (0, passwordUtils_1.hashPassword)(newPassword);
            user.password = hashedPassword;
            yield user.save();
            return { message: "✅ Password updated successfully" };
        });
    }
    // Create account with google
    createAccountWithGoogle(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.authRepository.findOne({ email: userData === null || userData === void 0 ? void 0 : userData.email });
            if (user) {
                throw new customErrors_1.ConflictError("Email already in use");
            }
            const newUser = Object.assign(Object.assign({}, userData), { password: null, isGoogleVerified: true });
            user = yield this.authRepository.create(newUser);
            const accessToken = (0, tokenUtils_1.generateAccessToken)({ role: user.role, userId: user === null || user === void 0 ? void 0 : user._id });
            const refreshToken = (0, tokenUtils_1.generateRefreshToken)({ role: user.role, userId: user === null || user === void 0 ? void 0 : user._id });
            return { user, accessToken, refreshToken };
        });
    }
    googleLogin(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.authRepository.findOne({ email: email });
            if (!user) {
                throw new customErrors_1.NotFoundError("User not found");
            }
            if (!(user === null || user === void 0 ? void 0 : user.isGoogleVerified)) {
                throw new customErrors_1.ForbiddenError("Google verfication failed");
            }
            if (user === null || user === void 0 ? void 0 : user.isBlocked) {
                throw new customErrors_1.ForbiddenError("User has been blocked");
            }
            if (user === null || user === void 0 ? void 0 : user.isDeleted) {
                throw new customErrors_1.ResourceGoneError("This account has been deleted");
            }
            const accessToken = (0, tokenUtils_1.generateAccessToken)({ role: user.role, userId: user === null || user === void 0 ? void 0 : user._id });
            const refreshToken = (0, tokenUtils_1.generateRefreshToken)({ role: user.role, userId: user === null || user === void 0 ? void 0 : user._id });
            return { user, accessToken, refreshToken };
        });
    }
}
exports.AuthService = AuthService;
