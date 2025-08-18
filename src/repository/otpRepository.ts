import otpModel from "../models/otpModel";
import { BaseRepository } from "./baseRepository";

export class OtpRepository extends BaseRepository<any> {

    constructor() {
        super(otpModel)
    }
    async createOtp(data: any): Promise<any> {
        const otp = new otpModel(data);
        return await otp.save();
    }

    async findOtp(query: any): Promise<any> {
        return await otpModel.findOne(query);
    }

    async updateOtp(query: any, updateData: any): Promise<any> {
        return await otpModel.findOneAndUpdate(query, updateData, { new: true });
    }
}
