"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../config");
function sendEmail(email, text, html) {
    console.log(config_1.NODEMAILER_TRANSPORTER_PASSWORD, config_1.NODEMAILER_TRANSPORTER_EMAIL, config_1.NODEMAILER_HOST);
    const transporter = nodemailer_1.default.createTransport({
        service: `${config_1.NODEMAILER_SERVICE}`,
        auth: {
            user: `${config_1.NODEMAILER_TRANSPORTER_EMAIL}`,
            pass: `${config_1.NODEMAILER_TRANSPORTER_PASSWORD}`,
        },
    });
    const mailOptions = {
        from: `${config_1.NODEMAILER_TRANSPORTER_EMAIL}`,
        to: email,
        subject: "Your Login Password - Master Mind",
        html: html,
    };
    const sendEmail = (mailOptions) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield transporter.sendMail(mailOptions);
            console.log("Mail Send to ", mailOptions.to);
            //if otp success return true;
            return true;
        }
        catch (error) {
            console.error("Error sending email:", error);
            //if otp fails return false;
            return false;
        }
    });
    return sendEmail(mailOptions);
}
