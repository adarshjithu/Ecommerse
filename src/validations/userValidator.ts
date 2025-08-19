import { z } from "zod";

// Address schema (assuming addressSchema has these fields, adjust if needed)
const addressSchema = z.object({
  emirate: z.string().min(1, "Emirate is required"),
  city: z.string().min(1, "City is required"),
  area: z.string().min(1, "Area is required"),
  street: z.string().min(1, "Street is required"),
});

// Phone schema
const phoneSchema = z.object({
  code: z.string().min(1, "Country code is required"), // required
  number: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits"), // optional but good to cap
});

// User schema
export const userValidationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: phoneSchema,
  password: z.string().min(6, "Password must be at least 6 characters"),
  isEmailVerified: z.boolean().optional().default(false),
  isPhoneVerified: z.boolean().optional().default(false),
  isGoogleVerified: z.boolean().optional().default(false),
  isBlocked: z.boolean().optional().default(false),
  role: z.enum(["user", "admin"]).default("user"),
  profilePicture: z.string().optional().default(""),
  isDeleted: z.boolean().optional().default(false),
  addressList: z.array(addressSchema).optional(),
});

// Type inference (so you get TS types from Zod schema)
export type UserInput = z.infer<typeof userValidationSchema>;
