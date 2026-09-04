"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.limiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.limiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000 * 15,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too Many Requests. Please try later",
    },
});
