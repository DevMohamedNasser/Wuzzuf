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
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_enum_1 = require("../../Utils/enums/token.enum");
const validators = __importStar(require("./job.validation"));
const job_service_1 = __importDefault(require("./job.service"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const local_multer_1 = require("../../Utils/multer/local.multer");
const fileTypes_validation_multer_1 = require("../../Utils/multer/fileTypes.validation.multer");
const user_enum_1 = require("../../Utils/enums/user.enum");
const router = (0, express_1.Router)({ mergeParams: true });
router.use((0, authentication_middleware_1.authentication)({ tokenType: token_enum_1.tokenTypeEnum.Access }));
router.post("/", (0, validation_middleware_1.validation)(validators.addJobSchema), job_service_1.default.addJob);
router.patch("/:id", (0, validation_middleware_1.validation)(validators.jobIdSchema), (0, validation_middleware_1.validation)(validators.updateJobSchema), job_service_1.default.updateJob);
router.delete("/:id", (0, validation_middleware_1.validation)(validators.jobIdSchema), job_service_1.default.deleteJob);
router.get("/jobs", (0, validation_middleware_1.validation)(validators.JobsFilterSchema), job_service_1.default.getFilteredJobs);
// Take care from previous route 😇 /jobs and /:id sorting means a lot
router.get("/:id", (0, validation_middleware_1.validation)(validators.jobApplicationsSchema), (0, validation_middleware_1.validation)(validators.jobIdSchema), job_service_1.default.jobApplications);
router.patch("/applicant/:id", (0, validation_middleware_1.validation)(validators.ApplicationIdSchema), (0, validation_middleware_1.validation)(validators.appStatusSchema), job_service_1.default.acceptOrRejectApplicant);
router.post("/apply/:id", (0, validation_middleware_1.validation)(validators.jobIdSchema), (0, authentication_middleware_1.authorization)({ accessRoles: [user_enum_1.RoleEnum.User] }), (0, local_multer_1.localFileMulter)({
    customPath: "Application CVs",
    validation: [...fileTypes_validation_multer_1.fileValidation.images, ...fileTypes_validation_multer_1.fileValidation.documents],
    maxSizeMB: 5,
}).single("attachment"), job_service_1.default.applyJob);
exports.default = router;
