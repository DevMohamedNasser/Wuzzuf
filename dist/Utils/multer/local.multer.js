"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localFileMulter = void 0;
const multer_1 = __importDefault(require("multer"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const localFileMulter = ({ customPath = "general", validation, maxSizeMB = 5, }) => {
    const basePath = `/uploads/${customPath}/`;
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            let userBasePath = basePath;
            if (req.user?._id)
                userBasePath += `${req.user._id}`;
            // /uploads/users/_id
            const fullPath = node_path_1.default.resolve(`./src/${userBasePath}`);
            if (!node_fs_1.default.existsSync(fullPath))
                node_fs_1.default.mkdirSync(fullPath, { recursive: true });
            cb(null, fullPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                "-" +
                file.originalname;
            cb(null, file.fieldname + "-" + uniqueSuffix);
        },
    });
    const fileFilter = (req, file, cb) => {
        // console.log(file);
        // console.log("mimetype:", file.mimetype); //  😡 postman always returns: application/octet-stream
        // console.log("validation:", validation);
        //   if (!validation.includes(file.mimetype))
        //     return cb(new Error("Invalid file type"));
        return cb(null, true);
    };
    return (0, multer_1.default)({
        fileFilter,
        storage,
        limits: { fileSize: maxSizeMB * 1024 * 1024 },
    });
};
exports.localFileMulter = localFileMulter;
