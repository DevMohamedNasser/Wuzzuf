import { EventEmitter } from "node:events";
import { Mail } from "nodemailer";
import template from "../email/emailOTP.template";
import sendEmail from "../email/send.email";
import chalk from "chalk";

const emailEvent = new EventEmitter();

interface IEmail extends Mail.Options {
  username: string;
  otp: string;
}

emailEvent.on("confirmEmail", async (data: IEmail) => {
  try {
    data.subject = "Confirm Email";
    data.html = template(data.otp, data.username, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.log(chalk.red(`Failed sending email: ${(error as Error).message}`));
  }
});

emailEvent.on("forgetPassword", async (data: IEmail) => {
  try {
    data.subject = "Forget Password OTP";
    data.html = template(data.otp, data.username, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.log(chalk.red(`Failed sending email: ${(error as Error).message}`));
  }
});

export default emailEvent;
