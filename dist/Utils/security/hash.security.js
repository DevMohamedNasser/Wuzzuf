"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.generateHash = void 0;
const config_service_1 = __importDefault(require("../../Config/config.service"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateHash = async (text, salt = config_service_1.default.SALT) => {
    return await bcrypt_1.default.hash(text, salt);
};
exports.generateHash = generateHash;
const compareHash = async (cipherTxt, plainTxt) => {
    return await bcrypt_1.default.compare(plainTxt, cipherTxt);
};
exports.compareHash = compareHash;
