"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.userValidationSchema = void 0;
const zod_1 = require("zod");
// Address schema (assuming addressSchema has these fields, adjust if needed)
const addressSchema = zod_1.z.object({
    emirate: zod_1.z.string().min(1, "Emirate is required"),
    city: zod_1.z.string().min(1, "City is required"),
    area: zod_1.z.string().min(1, "Area is required"),
    street: zod_1.z.string().min(1, "Street is required"),
});
// Phone schema
const phoneSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, "Country code is required"), // required
    number: zod_1.z.string()
        .min(10, "Phone number must be at least 10 digits")
        .max(15, "Phone number must be at most 15 digits"), // optional but good to cap
});
// User schema
exports.userValidationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    email: zod_1.z.string().email("Invalid email address"),
    phone: phoneSchema,
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    isEmailVerified: zod_1.z.boolean().optional().default(false),
    isPhoneVerified: zod_1.z.boolean().optional().default(false),
    isGoogleVerified: zod_1.z.boolean().optional().default(false),
    isBlocked: zod_1.z.boolean().optional().default(false),
    role: zod_1.z.enum(["user", "admin"]).default("user"),
    profilePicture: zod_1.z.string().optional().default(""),
    isDeleted: zod_1.z.boolean().optional().default(false),
    addressList: zod_1.z.array(addressSchema).optional(),
});
exports.loginSchema = zod_1.z.object({
    credential: zod_1.z.string().min(1, "Email or phone is required"),
    password: zod_1.z.string().min(1, "Password is required"),
}).superRefine((data, ctx) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{5,15}$/; // simple phone validation (5-15 digits)
    if (!emailRegex.test(data.credential) && !phoneRegex.test(data.credential)) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            message: "Credential must be a valid email or phone number",
            path: ["credential"],
        });
    }
});
