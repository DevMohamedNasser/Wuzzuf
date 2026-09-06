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
exports.updatePasswordSchema = exports.userIdSchema = exports.updateAccSchema = void 0;
const z = __importStar(require("zod"));
const user_enum_1 = require("../../Utils/enums/user.enum");
exports.updateAccSchema = {
    body: z.strictObject({
        mobileNumber: z
            .string()
            .regex(/^(0|\+20|020)1[0125][\d]{8}$/, {
            error: "Invalid Egy mobileNumber",
        })
            .optional(),
        DOB: z.coerce
            .date({ error: "Invalid date of birth" })
            .refine((date) => {
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            return date < minDate;
        }, { error: "U must be greater than 18 years old" })
            .optional(),
        firstName: z
            .string()
            .min(2, { error: "username must be at least 2 chars" })
            .max(50, { error: "username must be at most 50 chars" })
            .optional(),
        lastName: z
            .string()
            .min(2, { error: "username must be at least 2 chars" })
            .max(50, { error: "username must be at most 50 chars" })
            .optional(),
        gender: z
            .enum(Object.keys(user_enum_1.GenderEnum).filter((key) => isNaN(Number(key))))
            .optional(),
    }),
};
exports.userIdSchema = {
    params: z.strictObject({
        id: z.string().regex(/^[\w]{24}$/, { error: "Invalid id format" }),
    }),
};
exports.updatePasswordSchema = {
    body: z
        .object({
        oldPassword: z
            .string({ error: "oldPassword is required" })
            .min(6, { error: "password must be at least 6 chars" }),
        newPassword: z
            .string({ error: "newPassword is required" })
            .min(6, { error: "password must be at least 6 chars" }),
        confirmPassword: z
            .string({ error: "confirmPassword is required" })
            .min(6, { error: "password must be at least 6 chars" }),
    })
        .superRefine((data, ctx) => {
        if (data.newPassword !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "Password mismatch",
            });
        }
    }),
};
