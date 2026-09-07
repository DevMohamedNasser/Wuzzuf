"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyNameSchema = exports.companyIdSchema = exports.updateCompanySchema = exports.addCompanySchema = void 0;
const zod_1 = require("zod");
exports.addCompanySchema = {
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, { error: "company name must be at least 1 chars" }),
        email: zod_1.z.email(),
        description: zod_1.z
            .string()
            .min(2, { error: "Description must be at least 2 chars" })
            .optional(),
        industry: zod_1.z.string().min(2, { error: "Industry must be at least 2 chars" }),
        address: zod_1.z.string().min(5).optional(),
        numberOfEmployees: zod_1.z
            .object({
            min: zod_1.z.coerce.number().int().positive(),
            max: zod_1.z.coerce.number().int().positive(),
        })
            .refine((data) => data.min <= data.max, {
            error: "minimum employees can't be greater than maximum",
        })
            .optional(),
    }),
};
exports.updateCompanySchema = {
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1, { error: "company name must be at least 1 chars" })
            .optional(),
        email: zod_1.z.email().optional(),
        description: zod_1.z
            .string()
            .min(2, { error: "Description must be at least 2 chars" })
            .optional(),
        industry: zod_1.z
            .string()
            .min(2, { error: "Industry must be at least 2 chars" })
            .optional(),
        address: zod_1.z.string().min(5).optional(),
        numberOfEmployees: zod_1.z
            .object({
            min: zod_1.z.coerce.number().int().positive(),
            max: zod_1.z.coerce.number().int().positive(),
        })
            .refine((data) => data.min <= data.max, {
            error: "minimum employees can't be greater than maximum",
        })
            .optional(),
        addHr: zod_1.z
            .string()
            .regex(/^[\w]{24}$/, { error: "Invalid id company format" })
            .optional(),
        deleteHr: zod_1.z
            .string()
            .regex(/^[\w]{24}$/, { error: "Invalid id company format" })
            .optional(),
    }),
};
exports.companyIdSchema = {
    params: zod_1.z.strictObject({
        id: zod_1.z.string().regex(/^[\w]{24}$/, { error: "Invalid id company format" }),
    }),
};
exports.companyNameSchema = {
    body: zod_1.z.strictObject({
        name: zod_1.z.string().min(1),
    }),
};
