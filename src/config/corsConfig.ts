import cors from "cors";
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];

const corsConfig = () =>
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    });

export default corsConfig;
