import { z } from "zod";
import {
  JobLocationEnum,
  JobSeniorityLevelEnum,
  JobWorkingTimeEnum,
} from "../../Utils/enums/job.enum";

export const addJobSchema = {
  body: z.object({
    title: z.string().min(2, { error: "title min length is 2 chars" }),
    location: z.enum(
      Object.keys(JobLocationEnum).filter((key) => isNaN(Number(key))),
    ),
    workingTime: z.enum(
      Object.keys(JobWorkingTimeEnum).filter((key) => isNaN(Number(key))),
    ),
    seniorityLevel: z.enum(
      Object.keys(JobSeniorityLevelEnum).filter((key) => isNaN(Number(key))),
    ),
    description: z
      .string()
      .min(2, { error: "description min length is 2 chars" }),
    technicalSkills: z.array(z.string()),
    softSkills: z.array(z.string()).optional(),
    companyId: z.string().regex(/^\w{24}$/),
  }),
};

export const jobIdSchema = {
  params: z.strictObject({
    id: z.string().regex(/^[\w]{24}$/, { error: "Invalid id company format" }),
  }),
};

export const updateJobSchema = {
  body: z.object({
    title: z
      .string()
      .min(2, { error: "title min length is 2 chars" })
      .optional(),
    location: z
      .enum(Object.keys(JobLocationEnum).filter((key) => isNaN(Number(key))))
      .optional(),
    workingTime: z
      .enum(Object.keys(JobWorkingTimeEnum).filter((key) => isNaN(Number(key))))
      .optional(),
    seniorityLevel: z
      .enum(
        Object.keys(JobSeniorityLevelEnum).filter((key) => isNaN(Number(key))),
      )
      .optional(),
    description: z
      .string()
      .min(2, { error: "description min length is 2 chars" })
      .optional(),
    technicalSkills: z.array(z.string()).optional(),
    softSkills: z.array(z.string()).optional().optional(),
    closed: z.coerce.boolean().optional(),
  }),
};

export const JobsFilterSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
    workingTime: z
      .enum(Object.keys(JobWorkingTimeEnum).filter((key) => isNaN(Number(key))))
      .optional(),
    jobLocation: z
      .enum(Object.keys(JobLocationEnum).filter((key) => isNaN(Number(key))))
      .optional(),
    seniorityLevel: z
      .enum(
        Object.keys(JobSeniorityLevelEnum).filter((key) => isNaN(Number(key))),
      )
      .optional(),
    jobTitle: z.string().optional(),
    technicalSkills: z.string().optional(),
  }),
};

export const jobApplicationsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
};

export const ApplicationIdSchema = {
  params: z.strictObject({
    id: z.string().regex(/^[\w]{24}$/, { error: "Invalid id company format" }),
  }),
};

export const appStatusSchema = {
  body: z.strictObject({
    acceptance: z.coerce.boolean(),
  }),
};

export const companyJobSchema = {
  params: z.object({
    companySrch: z.string().min(1),
    jobId: z
      .string()
      .regex(/^\w{24}$/, { error: "Invalid jobId format" })
      .optional(),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(50).optional(),
  }),
};
