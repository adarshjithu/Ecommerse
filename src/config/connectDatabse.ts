import mongoose from "mongoose";
import { MONGODB_URI } from ".";
import clc from "cli-color";
export const connectDatabase = async () => {

    try {
        await mongoose.connect(`${MONGODB_URI}`);
         console.log(`${clc.green("✔️  Database connected successfully")}`);
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
