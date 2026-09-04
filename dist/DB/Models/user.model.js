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
exports.userModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_enum_1 = require("../../Utils/enums/user.enum");
const application_model_1 = require("./application.model");
const chat_model_1 = require("./chat.model");
const company_model_1 = require("./company.model");
const userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        trim: true,
        required: true,
        minLength: 2,
        maxLength: 25,
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        minLength: 2,
        maxLength: 25,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    provider: {
        type: Number,
        enum: Object.values(user_enum_1.ProviderEnum),
        default: user_enum_1.ProviderEnum.System,
    },
    password: {
        type: String,
        required: function () {
            return this.provider == user_enum_1.ProviderEnum.System;
        },
    },
    gender: {
        type: Number,
        enum: Object.values(user_enum_1.GenderEnum),
        default: user_enum_1.GenderEnum.Male,
    },
    role: {
        type: Number,
        enum: Object.values(user_enum_1.RoleEnum),
        default: user_enum_1.RoleEnum.User,
    },
    mobileNumber: {
        type: String,
        required: function () {
            return this.provider == user_enum_1.ProviderEnum.System;
        },
    },
    DOB: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                const today = new Date();
                if (value >= today)
                    return false;
                const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                return value < minDate;
            },
            message: "Must be greater than 18 years",
        },
    },
    isConfirmed: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
    },
    bannedAt: {
        type: Date,
    },
    updatedBy: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
    },
    changeCredentialTime: {
        type: Date,
    },
    profilePic: {
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
    OTP: [
        {
            code: {
                type: String,
            },
            type: {
                type: String,
                enum: Object.values(user_enum_1.UserOTPEnum),
            },
            expiresIn: {
                type: Date,
            },
        },
    ],
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            delete ret.password;
            delete ret.OTP;
            return ret;
        },
    },
});
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
})
    .get(function () {
    return this.firstName + " " + this.lastName;
});
userSchema.post("deleteOne", async function () {
    const { _id: userId } = this.getFilter();
    if (!userId)
        return;
    await application_model_1.applicationModel.deleteMany({ userId });
    await chat_model_1.chatModel.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }],
    });
    await company_model_1.companyModel.updateMany({ HRs: userId }, { $pull: { HRs: userId } });
});
exports.userModel = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
