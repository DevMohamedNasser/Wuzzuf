import { z } from "zod";

export const addCompanySchema = {
  body: z.object({
    name: z.string().min(1, { error: "company name must be at least 1 chars" }),
    email: z.email(),
    description: z
      .string()
      .min(2, { error: "Description must be at least 2 chars" })
      .optional(),
    industry: z.string().min(2, { error: "Industry must be at least 2 chars" }),
    address: z.string().min(5).optional(),
    numberOfEmployees: z
      .object({
        min: z.coerce.number().int().positive(),
        max: z.coerce.number().int().positive(),
      })
      .refine((data) => data.min <= data.max, {
        error: "minimum employees can't be greater than maximum",
      })
      .optional(),
  }),
};

export const updateCompanySchema = {
  body: z.object({
    name: z
      .string()
      .min(1, { error: "company name must be at least 1 chars" })
      .optional(),
    email: z.email().optional(),
    description: z
      .string()
      .min(2, { error: "Description must be at least 2 chars" })
      .optional(),
    industry: z
      .string()
      .min(2, { error: "Industry must be at least 2 chars" })
      .optional(),
    address: z.string().min(5).optional(),
    numberOfEmployees: z
      .object({
        min: z.coerce.number().int().positive(),
        max: z.coerce.number().int().positive(),
      })
      .refine((data) => data.min <= data.max, {
        error: "minimum employees can't be greater than maximum",
      })
      .optional(),
    addHr: z
      .string()
      .regex(/^[\w]{24}$/, { error: "Invalid id company format" })
      .optional(),
    deleteHr: z
      .string()
      .regex(/^[\w]{24}$/, { error: "Invalid id company format" })
      .optional(),
  }),
};

export const companyIdSchema = {
  params: z.strictObject({
    id: z.string().regex(/^[\w]{24}$/, { error: "Invalid id company format" }),
  }),
};

export const companyNameSchema = {
  body: z.strictObject({
    name: z.string().min(1),
  }),
};
