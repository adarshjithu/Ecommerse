import Server from "./app";
import dotenv from "dotenv";
import clc from "cli-color";
import './config/index';
import { connectDatabase } from "./config/connectDatabse";

dotenv.config();
connectDatabase()
const PROTOCOL = process.env.PROTOCOL || "http";
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";
const API_VERSION = process.env.API_VERSION || "v1";
const API_PREFIX = `/api/${API_VERSION}`;
const BASE_URL = `${PROTOCOL}://${HOST}${[80, 443].includes(Number(PORT)) ? "" : `:${PORT}`}`;

Server.listen(PORT, () => {
    console.log(clc.blueBright("────────────────────────────────────────────"));
    console.log(`${clc.green("🚀 Server is running")} in ${clc.whiteBright(ENV)} mode`);
    console.log(`${clc.cyan("🌐 Base URL")}     : ${clc.whiteBright(BASE_URL)}`);
    console.log(`${clc.cyan("📁 API Prefix")}  : ${clc.whiteBright(API_PREFIX)}`);
    console.log(`${clc.cyan("📦 Port")}        : ${clc.whiteBright(PORT)}`);
    console.log(clc.blueBright("────────────────────────────────────────────"));
});
