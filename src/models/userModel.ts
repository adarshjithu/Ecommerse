import mongoose, { Document, Schema, Model } from "mongoose";

export interface ICoordinates {
  lat?: number;
  lng?: number;
}

export interface IAddress {
  emirate: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  apartment?: string;
  landmark?: string;
  isDefault?: boolean;
  saveAs?: string;
  receiversPhonenumber?: number;
  coordinates?: ICoordinates;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: {
    code?: string;
    number: string;
  };
  password: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isGoogleVerified?: boolean;
  isBlocked?: boolean;
  role?: "user" | "admin";
  profilePicture?: string;
  isDeleted?: boolean;
  addressList?: IAddress[];
}


const addressSchema: Schema<IAddress> = new mongoose.Schema(
  {
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
  },
  { _id: true }
);


const userSchema: Schema<IUser> = new mongoose.Schema({
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


export default mongoose.model<IUser>("User", userSchema);


