"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const config_service_1 = __importDefault(require("../../Config/config.service"));
cloudinary_1.v2.config({
    cloud_name: config_service_1.default.CLOUD_NAME,
    api_key: config_service_1.default.API_KEY,
    api_secret: config_service_1.default.API_SECRET,
});
exports.default = cloudinary_1.v2;
