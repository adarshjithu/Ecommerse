"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRouter_1 = __importDefault(require("../api/user/auth/authRouter"));
const productRoutes_1 = __importDefault(require("../api/user/product/productRoutes"));
const userRoutes = express_1.default.Router();
userRoutes.use('/auth', authRouter_1.default);
userRoutes.use("/product", productRoutes_1.default);
exports.default = userRoutes;
