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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRepository = void 0;
const otpModel_1 = __importDefault(require("../models/otpModel"));
const baseRepository_1 = require("./baseRepository");
class OtpRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(otpModel_1.default);
    }
    createOtp(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = new otpModel_1.default(data);
            return yield otp.save();
        });
    }
    findOtp(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield otpModel_1.default.findOne(query);
        });
    }
    updateOtp(query, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield otpModel_1.default.findOneAndUpdate(query, updateData, { new: true });
        });
    }
}
exports.OtpRepository = OtpRepository;
