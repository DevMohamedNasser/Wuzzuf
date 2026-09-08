import { z } from "zod";
import {
  addJobSchema,
  ApplicationIdSchema,
  appStatusSchema,
  companyJobSchema,
  jobApplicationsSchema,
  jobIdSchema,
  JobsFilterSchema,
  updateJobSchema,
} from "./job.validation";

export type IAddJobDTO = z.infer<typeof addJobSchema.body>;
export type IJobIdDTO = z.infer<typeof jobIdSchema.params>;
export type IUpdateJobDTO = z.infer<typeof updateJobSchema.body>;
export type IJobsFilterDTO = z.infer<typeof JobsFilterSchema.query>;
export type IJobApplicationsDTO = z.infer<typeof jobApplicationsSchema.query>;
export type IApplicationIdDTO = z.infer<typeof ApplicationIdSchema.params>;
export type IAppStatusDTO = z.infer<typeof appStatusSchema.body>;

export type ICompanyJobQueryDTO = z.infer<typeof companyJobSchema.query>;
export type ICompanyJobParamsDTO = z.infer<typeof companyJobSchema.params>;
