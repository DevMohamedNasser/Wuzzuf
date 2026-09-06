import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: resolve("./Config/dev.env") });

const env = {
  APP_NAME: process.env.APP_NAME || "Wuzzuf",
  PORT: process.env.PORT,
  MODE: process.env.MODE || "DEVELOPMENT",
  DB_URI: process.env.DB_URI as string,

  WHITE_LIST: process.env.WHITE_LIST!,

  //   hashing
  SALT: Number(process.env.SALT),

  // encryption
  ENC_KEY: process.env.ENC_KEY as string,

  //   tokens
  ACCESS_TOKEN_USER_SIGNATURE: process.env
    .ACCESS_TOKEN_USER_SIGNATURE as string,
  REFRESH_TOKEN_USER_SIGNATURE: process.env
    .REFRESH_TOKEN_USER_SIGNATURE as string,
  ACCESS_TOKEN_USER_EXPIRES_IN: Number(
    process.env.ACCESS_TOKEN_USER_EXPIRES_IN,
  ),
  REFRESH_TOKEN_USER_EXPIRES_IN: Number(
    process.env.REFRESH_TOKEN_USER_EXPIRES_IN,
  ),

  ACCESS_TOKEN_ADMIN_SIGNATURE: process.env
    .ACCESS_TOKEN_ADMIN_SIGNATURE as string,
  REFRESH_TOKEN_ADMIN_SIGNATURE: process.env
    .REFRESH_TOKEN_ADMIN_SIGNATURE as string,
  ACCESS_TOKEN_ADMIN_EXPIRES_IN: Number(
    process.env.ACCESS_TOKEN_ADMIN_EXPIRES_IN,
  ),
  REFRESH_TOKEN_ADMIN_EXPIRES_IN: Number(
    process.env.REFRESH_TOKEN_ADMIN_EXPIRES_IN,
  ),

  //   Rate limit
  LIMIT: Number(process.env.LIMIT),
  WINDOW_MS: Number(process.env.WINDOW_MS),

  // nodemailer
  EMAIL_USERNAME: process.env.EMAIL_USERNAME as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,

  // Google OAuth
  CLIENT_ID: process.env.CLIENT_ID as string,

  // Cloudinary
  CLOUD_NAME: process.env.CLOUD_NAME as string,
  API_KEY: process.env.API_KEY as string,
  API_SECRET: process.env.API_SECRET as string,
};

export default env;
