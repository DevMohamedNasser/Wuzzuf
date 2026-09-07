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
const company_service_1 = __importDefault(require("./company.service"));
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_enum_1 = require("../../Utils/enums/token.enum");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const validators = __importStar(require("./company.validation"));
const local_multer_1 = require("../../Utils/multer/local.multer");
const fileTypes_validation_multer_1 = require("../../Utils/multer/fileTypes.validation.multer");
const router = (0, express_1.Router)();
router.use((0, authentication_middleware_1.authentication)({ tokenType: token_enum_1.tokenTypeEnum.Access }));
router.post("/", (0, local_multer_1.localFileMulter)({
    customPath: "Company Legal Attachments",
    validation: [...fileTypes_validation_multer_1.fileValidation.documents, ...fileTypes_validation_multer_1.fileValidation.images],
    maxSizeMB: 5,
}).single("attachment"), (0, validation_middleware_1.validation)(validators.addCompanySchema), company_service_1.default.addCompany);
router.patch("/:id", (0, validation_middleware_1.validation)(validators.companyIdSchema), (0, validation_middleware_1.validation)(validators.updateCompanySchema), company_service_1.default.updateCompanyData);
router.delete("/:id", (0, validation_middleware_1.validation)(validators.companyIdSchema), company_service_1.default.softDeleteCompany);
router.get("/:id/jobs", (0, validation_middleware_1.validation)(validators.companyIdSchema), company_service_1.default.companyJobs);
router.get("/", (0, validation_middleware_1.validation)(validators.companyNameSchema), company_service_1.default.getCompanyByName);
router.patch("/:id/logo", (0, validation_middleware_1.validation)(validators.companyIdSchema), (0, local_multer_1.localFileMulter)({
    customPath: "Company Logo",
    maxSizeMB: 5,
    validation: fileTypes_validation_multer_1.fileValidation.images,
}).single("attachment"), company_service_1.default.uploadLogo);
router.patch("/:id/coverPic", (0, validation_middleware_1.validation)(validators.companyIdSchema), (0, local_multer_1.localFileMulter)({
    customPath: "Company coverPic",
    maxSizeMB: 5,
    validation: fileTypes_validation_multer_1.fileValidation.images,
}).single("attachment"), company_service_1.default.uploadCoverPic);
router.delete("/:id/logo", (0, validation_middleware_1.validation)(validators.companyIdSchema), company_service_1.default.deleteLogo);
router.delete("/:id/coverPic", (0, validation_middleware_1.validation)(validators.companyIdSchema), company_service_1.default.deleteCoverPic);
exports.default = router;
