import nodemailer, { Mail } from "nodemailer";
import { BadRequestException } from "../response/error.response";
import env from "../../Config/config.service";

const sendEmail = async (data: Mail.Options) => {
  if (!data.html && !data.attachments && !data.text)
    throw new BadRequestException("Missing email content");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    ...data,
    from: `"${env.APP_NAME} app" <${env.EMAIL_USERNAME}>`,
  });
};

export default sendEmail;
