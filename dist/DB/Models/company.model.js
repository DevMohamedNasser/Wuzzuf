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
exports.companyModel = exports.companySchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const job_model_1 = require("./job.model");
exports.companySchema = new mongoose_1.Schema({
    name: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        required: true,
    },
    description: {
        type: String,
        trim: true,
    },
    industry: {
        type: String,
        trim: true,
        minLength: 2,
        required: true,
    },
    address: {
        type: String,
        trim: true,
    },
    numberOfEmployees: {
        min: {
            type: Number,
        },
        max: {
            type: Number,
        },
    },
    createdBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    logo: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    coverPic: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    HRs: [
        {
            type: mongoose_1.Types.ObjectId,
            ref: "User",
        },
    ],
    bannedAt: {
        type: Date,
    },
    deletedAt: {
        type: Date,
    },
    legalAttachment: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    isAdminApproved: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
exports.companySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "companyId",
});
exports.companySchema.post("deleteOne", async function () {
    const { _id: companyId } = this.getFilter();
    if (!companyId)
        return;
    await job_model_1.jobModel.deleteMany({ companyId });
});
exports.companyModel = mongoose_1.default.models.Company || mongoose_1.default.model("Company", exports.companySchema);
