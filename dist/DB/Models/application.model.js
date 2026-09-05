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
exports.applicationModel = exports.applicationSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const application_enum_1 = require("../../Utils/enums/application.enum");
exports.applicationSchema = new mongoose_1.Schema({
    jobId: {
        type: mongoose_1.Types.ObjectId,
        ref: "Job",
        required: true,
    },
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userCV: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    status: {
        type: Number,
        enum: Object.values(application_enum_1.ApplicationStatusEnum).filter(value => typeof (value) === "number"),
        default: application_enum_1.ApplicationStatusEnum.Pending,
    },
}, { timestamps: true });
exports.applicationModel = mongoose_1.default.models.Application ||
    mongoose_1.default.model("Application", exports.applicationSchema);
