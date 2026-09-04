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
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobModel = exports.jobSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const job_enum_1 = require("../../Utils/enums/job.enum");
const application_model_1 = require("./application.model");
exports.jobSchema = new mongoose_1.Schema({
    title: {
        type: String,
        minlength: [2, "title minLength: 2 chars"],
        trim: true,
        required: [true, "title is required"],
    },
    location: {
        type: Number,
        enum: Object.values(job_enum_1.JobLocationEnum),
        required: true,
    },
    workingTime: {
        type: Number,
        enum: Object.values(job_enum_1.JobWorkingTimeEnum),
        default: job_enum_1.JobWorkingTimeEnum.FullTime,
        required: true,
    },
    seniorityLevel: {
        type: Number,
        enum: Object.values(job_enum_1.JobSeniorityLevelEnum),
        required: true,
    },
    description: {
        type: String,
        minLength: 2,
        required: true,
    },
    technicalSkills: [
        {
            type: String,
            required: true,
        },
    ],
    softSkills: [
        {
            type: String,
        },
    ],
    addedBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    updatedBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    closed: {
        type: Boolean,
        default: false,
    },
    companyId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Company",
        required: true,
    },
}, { timestamps: true });
// jobSchema.pre("findOneAndDelete", async function() {});
exports.jobSchema.post("deleteOne", async function () {
    const filter = this.getFilter();
    if (filter._id) {
        await application_model_1.applicationModel.deleteMany({ jobId: filter._id });
    }
});
exports.jobSchema.pre("deleteMany", async function () {
    const filter = this.getFilter();
    const jobs = await exports.jobModel.find(filter).select("_id");
    const jobIds = jobs.map((job) => job._id);
    if (!jobIds.length)
        return;
    await application_model_1.applicationModel.deleteMany({ jobId: { $in: jobIds } });
});
exports.jobModel = mongoose_1.default.models.Job || mongoose_1.default.model("Job", exports.jobSchema);
