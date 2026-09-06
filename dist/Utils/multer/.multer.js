"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudFileUpload = exports.fileValidation = void 0;
const multer_1 = __importDefault(require("multer"));
const error_response_1 = require("../response/error.response");
exports.fileValidation = {
    image: ["image/avif", "image/gif", "image/jpeg", "image/webp", "image/png"],
    document: ["application/pdf", "application/msword"],
    video: ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"],
};
const cloudFileUpload = ({ validation = exports.fileValidation.image, maxSizeMB = 5, }) => {
    const storage = multer_1.default.memoryStorage();
    const fileFilter = (req, file, cb) => {
        if (!validation.includes(file.mimetype)) {
            return cb(new error_response_1.BadRequestException(`Invalid file format: ${file.mimetype}`));
        }
        cb(null, true);
    };
    return (0, multer_1.default)({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSizeMB * 1024 * 1024,
        },
    });
};
exports.cloudFileUpload = cloudFileUpload;
