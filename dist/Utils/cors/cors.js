"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_service_1 = __importDefault(require("../../Config/config.service"));
const whiteList = config_service_1.default.WHITE_LIST.split(",");
const corsOptions = {
    origin: (requestOrigin, cb) => {
        if (!requestOrigin)
            // undefined = curl or postman
            return cb(null, true);
        if (whiteList.includes(requestOrigin))
            return cb(null, true);
        return cb(new Error("Not allowed by cors"));
    },
};
exports.default = corsOptions;
