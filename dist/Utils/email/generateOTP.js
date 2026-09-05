"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateOTP = () => {
    return Math.floor(Math.random() * 900000 + 100000).toString();
};
exports.default = generateOTP;
