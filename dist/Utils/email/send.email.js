"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const error_response_1 = require("../response/error.response");
const config_service_1 = __importDefault(require("../../Config/config.service"));
const sendEmail = async (data) => {
    if (!data.html && !data.attachments && !data.text)
        throw new error_response_1.BadRequestException("Missing email content");
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        auth: {
            user: config_service_1.default.EMAIL_USERNAME,
            pass: config_service_1.default.EMAIL_PASSWORD,
        },
    });
    await transporter.sendMail({
        ...data,
        from: `"${config_service_1.default.APP_NAME} app" <${config_service_1.default.EMAIL_USERNAME}>`,
    });
};
exports.default = sendEmail;
