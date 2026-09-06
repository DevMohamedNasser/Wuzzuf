"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const validators = __importStar(require("./user.validation"));
const user_service_1 = __importDefault(require("./user.service"));
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_enum_1 = require("../../Utils/enums/token.enum");
const local_multer_1 = require("../../Utils/multer/local.multer");
const fileTypes_validation_multer_1 = require("../../Utils/multer/fileTypes.validation.multer");
const router = (0, express_1.Router)();
router.use((0, authentication_middleware_1.authentication)({ tokenType: token_enum_1.tokenTypeEnum.Access }));
router.patch("/", (0, validation_middleware_1.validation)(validators.updateAccSchema), user_service_1.default.updateAcc);
router.get("/", user_service_1.default.getLoginUser);
router.get("/:id", (0, validation_middleware_1.validation)(validators.userIdSchema), user_service_1.default.getProfile);
router.patch("/password", (0, validation_middleware_1.validation)(validators.updatePasswordSchema), user_service_1.default.updatePassword);
router.delete("/soft", user_service_1.default.softDeleteAcc);
router.patch("/upload-profilePic", (0, local_multer_1.localFileMulter)({
    validation: fileTypes_validation_multer_1.fileValidation.images,
    customPath: "profile picture",
    maxSizeMB: 5,
}).single("attachment"), user_service_1.default.uploadProfilePic);
router.patch("/upload-coverPic", (0, local_multer_1.localFileMulter)({
    validation: fileTypes_validation_multer_1.fileValidation.images,
    customPath: "cover picture",
    maxSizeMB: 5,
}).single("attachment"), user_service_1.default.uploadCoverPic);
router.delete("/coverPic", user_service_1.default.deleteCoverPic);
router.delete("/profilePic", user_service_1.default.deleteProfilePic);
exports.default = router;
