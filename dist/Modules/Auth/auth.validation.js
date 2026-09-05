"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.googleOAuthSchema = exports.gmailSchema = exports.confirmEmailSchema = exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const user_enum_1 = require("../../Utils/enums/user.enum");
exports.loginSchema = {
    query: zod_1.z
        .object({
        isAdmin: zod_1.z.coerce.number().default(user_enum_1.RoleEnum.User),
    })
        .optional(),
    body: zod_1.z.strictObject({
        email: zod_1.z.email(),
        password: zod_1.z
            .string({ error: "password is required" })
            .min(6, { error: "password must be at least 6 chars" }),
    }),
};
exports.signupSchema = {
    body: exports.loginSchema.body
        .extend({
        username: zod_1.z
            .string()
            .min(2, { error: "username must be at least 2 chars" })
            .max(50, { error: "username must be at most 50 chars" }),
        gender: zod_1.z.enum(Object.keys(user_enum_1.GenderEnum).filter((key) => isNaN(Number(key)))),
        confirmPassword: zod_1.z
            .string()
            .min(6, { error: "confirmPassword must be at least 6 chars" }),
        DOB: zod_1.z.coerce.date({ error: "Invalid date of birth" }).refine((date) => {
            const today = new Date();
            const minDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            return date < minDate;
        }, { error: "U must be greater than 18 years old" }),
        mobileNumber: zod_1.z.string().regex(/^(0|\+20|020)1[0125][\d]{8}$/, {
            error: "Invalid Egy mobileNumber",
        }),
    })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword)
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "Password mismatch",
            });
    }),
};
exports.confirmEmailSchema = {
    body: zod_1.z.strictObject({
        email: zod_1.z.email(),
        otp: zod_1.z.string().regex(/^[\d]{6}$/, { error: "otp must be 6 chars" }),
    }),
};
exports.gmailSchema = {
    body: zod_1.z.strictObject({
        email: zod_1.z.email(),
    }),
};
exports.googleOAuthSchema = {
    body: zod_1.z.strictObject({
        idToken: zod_1.z.string({ error: "idToken is required" }),
    }),
};
exports.resetPasswordSchema = {
    body: zod_1.z
        .strictObject({
        email: zod_1.z.email(),
        otp: zod_1.z.string().regex(/^[\d]{6}$/, { error: "otp must be 6 chars" }),
        password: zod_1.z
            .string({ error: "password is required" })
            .min(6, { error: "password must be at least 6 chars" }),
        confirmPassword: zod_1.z
            .string({ error: "password is required" })
            .min(6, { error: "password must be at least 6 chars" }),
    })
        .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword)
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "Password mismatch",
            });
    }),
};
