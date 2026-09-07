import { z } from "zod";
import {
  addCompanySchema,
  companyIdSchema,
  companyNameSchema,
  updateCompanySchema,
} from "./company.validation";

export type IAddCompanyDTO = z.infer<typeof addCompanySchema.body>;
export type IUpdateCompanyDTO = z.infer<typeof updateCompanySchema.body>;
export type ICompanyIdDTO = z.infer<typeof companyIdSchema.params>;
export type ICompanyNameDTO = z.infer<typeof companyNameSchema.body>;
