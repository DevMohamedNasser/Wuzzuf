"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: (0, node_path_1.resolve)("./Config/dev.env") });
const env = {
    APP_NAME: process.env.APP_NAME || "Wuzzuf",
    PORT: process.env.PORT,
    MODE: process.env.MODE || "DEVELOPMENT",
    DB_URI: process.env.DB_URI,
    WHITE_LIST: process.env.WHITE_LIST,
    //   hashing
    SALT: Number(process.env.SALT),
    // encryption
    ENC_KEY: process.env.ENC_KEY,
    //   tokens
    ACCESS_TOKEN_USER_SIGNATURE: process.env
        .ACCESS_TOKEN_USER_SIGNATURE,
    REFRESH_TOKEN_USER_SIGNATURE: process.env
        .REFRESH_TOKEN_USER_SIGNATURE,
    ACCESS_TOKEN_USER_EXPIRES_IN: Number(process.env.ACCESS_TOKEN_USER_EXPIRES_IN),
    REFRESH_TOKEN_USER_EXPIRES_IN: Number(process.env.REFRESH_TOKEN_USER_EXPIRES_IN),
    ACCESS_TOKEN_ADMIN_SIGNATURE: process.env
        .ACCESS_TOKEN_ADMIN_SIGNATURE,
    REFRESH_TOKEN_ADMIN_SIGNATURE: process.env
        .REFRESH_TOKEN_ADMIN_SIGNATURE,
    ACCESS_TOKEN_ADMIN_EXPIRES_IN: Number(process.env.ACCESS_TOKEN_ADMIN_EXPIRES_IN),
    REFRESH_TOKEN_ADMIN_EXPIRES_IN: Number(process.env.REFRESH_TOKEN_ADMIN_EXPIRES_IN),
    //   Rate limit
    LIMIT: Number(process.env.LIMIT),
    WINDOW_MS: Number(process.env.WINDOW_MS),
    // nodemailer
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    // Google OAuth
    CLIENT_ID: process.env.CLIENT_ID,
};
exports.default = env;
