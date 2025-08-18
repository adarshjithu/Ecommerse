"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const cli_color_1 = __importDefault(require("cli-color"));
require("./config/index");
const connectDatabse_1 = require("./config/connectDatabse");
dotenv_1.default.config();
(0, connectDatabse_1.connectDatabase)();
const PROTOCOL = process.env.PROTOCOL || "http";
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";
const API_VERSION = process.env.API_VERSION || "v1";
const API_PREFIX = `/api/${API_VERSION}`;
const BASE_URL = `${PROTOCOL}://${HOST}${[80, 443].includes(Number(PORT)) ? "" : `:${PORT}`}`;
app_1.default.listen(PORT, () => {
    console.log(cli_color_1.default.blueBright("────────────────────────────────────────────"));
    console.log(`${cli_color_1.default.green("🚀 Server is running")} in ${cli_color_1.default.whiteBright(ENV)} mode`);
    console.log(`${cli_color_1.default.cyan("🌐 Base URL")}     : ${cli_color_1.default.whiteBright(BASE_URL)}`);
    console.log(`${cli_color_1.default.cyan("📁 API Prefix")}  : ${cli_color_1.default.whiteBright(API_PREFIX)}`);
    console.log(`${cli_color_1.default.cyan("📦 Port")}        : ${cli_color_1.default.whiteBright(PORT)}`);
    console.log(cli_color_1.default.blueBright("────────────────────────────────────────────"));
});
