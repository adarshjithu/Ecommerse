import nodemailer from "nodemailer";
import { NODEMAILER_HOST, NODEMAILER_SERVICE, NODEMAILER_TRANSPORTER_EMAIL, NODEMAILER_TRANSPORTER_PASSWORD } from "../../config";

export function sendEmail(email: string, text: string, html: string): Promise<boolean> {
    console.log(NODEMAILER_TRANSPORTER_PASSWORD, NODEMAILER_TRANSPORTER_EMAIL, NODEMAILER_HOST);
    const transporter = nodemailer.createTransport({
        service: `${NODEMAILER_SERVICE}`,
        auth: {
            user: `${NODEMAILER_TRANSPORTER_EMAIL}`,
            pass: `${NODEMAILER_TRANSPORTER_PASSWORD}`,
        },
    });
    //interface for mail options
    interface MailOptions {
        from: string;
        to: string;
        subject: string;
        text?: string;
        html?: string;
    }
    const mailOptions = {
        from: `${NODEMAILER_TRANSPORTER_EMAIL}`,
        to: email,
        subject: "Your Login Password - Master Mind",
        html: html,
    };

    const sendEmail = async (mailOptions: MailOptions): Promise<boolean> => {
        try {
            await transporter.sendMail(mailOptions);

            console.log("Mail Send to ", mailOptions.to);
            //if otp success return true;
            return true;
        } catch (error) {
            console.error("Error sending email:", error);
            //if otp fails return false;
            return false;
        }
    };
    return sendEmail(mailOptions);
}
