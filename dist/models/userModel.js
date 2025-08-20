"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const addressSchema = new mongoose_1.default.Schema({
    emirate: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    street: { type: String, required: true },
    building: { type: String },
    apartment: { type: String },
    landmark: { type: String },
    isDefault: { type: Boolean, default: false },
    saveAs: { type: String, default: "home" },
    receiversPhonenumber: { type: Number },
    coordinates: {
        lat: { type: Number },
        lng: { type: Number },
    },
}, { _id: true });
const userSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: {
        code: { type: String },
        number: { type: String, required: true, unique: true },
    },
    password: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isGoogleVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profilePicture: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    addressList: [addressSchema],
});
exports.default = mongoose_1.default.model("User", userSchema);
