"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const userModel_1 = __importDefault(require("../../../models/userModel"));
const baseRepository_1 = require("../../../repository/baseRepository");
class AuthRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(userModel_1.default);
    }
}
exports.AuthRepository = AuthRepository;
