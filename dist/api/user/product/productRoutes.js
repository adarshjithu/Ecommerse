"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productRepository_1 = require("./productRepository");
const productService_1 = require("./productService");
const productController_1 = require("./productController");
const productRouter = express_1.default.Router();
const productRepository = new productRepository_1.ProductRepository();
const productService = new productService_1.ProductService(productRepository);
const controller = new productController_1.ProductController(productService);
exports.default = productRouter;
