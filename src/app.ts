import express from "express";
import http from "http";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Custom middlewares & configs
import errorHandler from "./middlewares/errorHandler.js";
import corsConfig from "./config/corsConfig.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// ========== Middlewares ==========

// CORS
app.use(corsConfig());

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Logger
app.use(morgan("dev"));

// ========== Routes ==========
const API_VERSION = process.env.API_VERSION || "v1";
const API_PREFIX = `/api/${API_VERSION}`;

app.use(`${API_PREFIX}/user`, userRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// ========== Error & 404 Handlers ==========

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error handler
app.use(errorHandler);

// ========== Server ==========
const Server = http.createServer(app);

export default Server;
