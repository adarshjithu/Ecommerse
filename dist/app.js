"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const errorHandler_js_1 = __importDefault(require("./middlewares/errorHandler.js"));
const corsConfig_js_1 = __importDefault(require("./config/corsConfig.js"));
// Routes
const userRoutes_js_1 = __importDefault(require("./routes/userRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("./routes/adminRoutes.js"));
// Load environment variables
dotenv_1.default.config();
// Initialize express app
const app = (0, express_1.default)();
// ========== Middlewares ==========
// CORS
app.use((0, corsConfig_js_1.default)());
// Body parser
app.use(express_1.default.json());
// Cookie parser
app.use((0, cookie_parser_1.default)());
// Logger
app.use((0, morgan_1.default)("dev"));
// ========== Routes ==========
const API_VERSION = process.env.API_VERSION || "v1";
const API_PREFIX = `/api/${API_VERSION}`;
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use(`${API_PREFIX}/`, userRoutes_js_1.default);
app.use(`${API_PREFIX}/admin`, adminRoutes_js_1.default);
// ========== Error & 404 Handlers ==========
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});
// Centralized error handler
app.use(errorHandler_js_1.default);
// ========== Server ==========
const Server = http_1.default.createServer(app);
exports.default = Server;
