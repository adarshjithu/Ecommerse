"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
// config/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Ecommerse", // your project name
            version: "1.0.0",
            description: "API documentation for Ecommerse project",
        },
        servers: [
            {
                url: "http://localhost:5000/api/v1", // change port when deployed
            },
        ],
    },
    apis: ["./src/api/**/*.ts"], // path to your controllers/routes
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
