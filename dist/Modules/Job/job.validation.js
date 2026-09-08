"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyJobSchema = exports.appStatusSchema = exports.ApplicationIdSchema = exports.jobApplicationsSchema = exports.JobsFilterSchema = exports.updateJobSchema = exports.jobIdSchema = exports.addJobSchema = void 0;
const zod_1 = require("zod");
const job_enum_1 = require("../../Utils/enums/job.enum");
exports.addJobSchema = {
    body: zod_1.z.object({
        title: zod_1.z.string().min(2, { error: "title min length is 2 chars" }),
        location: zod_1.z.enum(Object.keys(job_enum_1.JobLocationEnum).filter((key) => isNaN(Number(key)))),
        workingTime: zod_1.z.enum(Object.keys(job_enum_1.JobWorkingTimeEnum).filter((key) => isNaN(Number(key)))),
        seniorityLevel: zod_1.z.enum(Object.keys(job_enum_1.JobSeniorityLevelEnum).filter((key) => isNaN(Number(key)))),
        description: zod_1.z
            .string()
            .min(2, { error: "description min length is 2 chars" }),
        technicalSkills: zod_1.z.array(zod_1.z.string()),
        softSkills: zod_1.z.array(zod_1.z.string()).optional(),
        companyId: zod_1.z.string().regex(/^\w{24}$/),
    }),
};
exports.jobIdSchema = {
    params: zod_1.z.strictObject({
        id: zod_1.z.string().regex(/^[\w]{24}$/, { error: "Invalid id company format" }),
    }),
};
exports.updateJobSchema = {
    body: zod_1.z.object({
        title: zod_1.z
            .string()
            .min(2, { error: "title min length is 2 chars" })
            .optional(),
        location: zod_1.z
            .enum(Object.keys(job_enum_1.JobLocationEnum).filter((key) => isNaN(Number(key))))
            .optional(),
        workingTime: zod_1.z
            .enum(Object.keys(job_enum_1.JobWorkingTimeEnum).filter((key) => isNaN(Number(key))))
            .optional(),
        seniorityLevel: zod_1.z
            .enum(Object.keys(job_enum_1.JobSeniorityLevelEnum).filter((key) => isNaN(Number(key))))
            .optional(),
        description: zod_1.z
            .string()
            .min(2, { error: "description min length is 2 chars" })
            .optional(),
        technicalSkills: zod_1.z.array(zod_1.z.string()).optional(),
        softSkills: zod_1.z.array(zod_1.z.string()).optional().optional(),
        closed: zod_1.z.coerce.boolean().optional(),
    }),
};
exports.JobsFilterSchema = {
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(50).optional(),
        workingTime: zod_1.z
            .enum(Object.keys(job_enum_1.JobWorkingTimeEnum).filter((key) => isNaN(Number(key))))
            .optional(),
        jobLocation: zod_1.z
            .enum(Object.keys(job_enum_1.JobLocationEnum).filter((key) => isNaN(Number(key))))
            .optional(),
        seniorityLevel: zod_1.z
            .enum(Object.keys(job_enum_1.JobSeniorityLevelEnum).filter((key) => isNaN(Number(key))))
            .optional(),
        jobTitle: zod_1.z.string().optional(),
        technicalSkills: zod_1.z.string().optional(),
    }),
};
exports.jobApplicationsSchema = {
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(50).optional(),
    }),
};
exports.ApplicationIdSchema = {
    params: zod_1.z.strictObject({
        id: zod_1.z.string().regex(/^[\w]{24}$/, { error: "Invalid id company format" }),
    }),
};
exports.appStatusSchema = {
    body: zod_1.z.strictObject({
        acceptance: zod_1.z.coerce.boolean(),
    }),
};
exports.companyJobSchema = {
    params: zod_1.z.object({
        companySrch: zod_1.z.string().min(1),
        jobId: zod_1.z
            .string()
            .regex(/^\w{24}$/, { error: "Invalid jobId format" })
            .optional(),
    }),
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().optional(),
        limit: zod_1.z.coerce.number().int().positive().max(50).optional(),
    }),
};
