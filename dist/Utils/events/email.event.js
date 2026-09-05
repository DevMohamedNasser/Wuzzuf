"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_events_1 = require("node:events");
const emailOTP_template_1 = __importDefault(require("../email/emailOTP.template"));
const send_email_1 = __importDefault(require("../email/send.email"));
const chalk_1 = __importDefault(require("chalk"));
const emailEvent = new node_events_1.EventEmitter();
emailEvent.on("confirmEmail", async (data) => {
    try {
        data.subject = "Confirm Email";
        data.html = (0, emailOTP_template_1.default)(data.otp, data.username, data.subject);
        await (0, send_email_1.default)(data);
    }
    catch (error) {
        console.log(chalk_1.default.red(`Failed sending email: ${error.message}`));
    }
});
emailEvent.on("forgetPassword", async (data) => {
    try {
        data.subject = "Forget Password OTP";
        data.html = (0, emailOTP_template_1.default)(data.otp, data.username, data.subject);
        await (0, send_email_1.default)(data);
    }
    catch (error) {
        console.log(chalk_1.default.red(`Failed sending email: ${error.message}`));
    }
});
exports.default = emailEvent;
