import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../Utils/response/error.response";
import { ZodType } from "zod";

// type keyReqType = "headers" | "body" | "params" | "query" | "file" | "files";
type keyReqType = keyof Request;
type schemaType = Partial<Record<keyReqType, ZodType>>;

export const validation = (schema: schemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: Array<{
      key: keyReqType;
      issues: Array<{ message: string; path: (string | number | symbol)[] }>;
    }> = [];

    for (const key of Object.keys(schema) as keyReqType[]) {
      const keySchema = schema[key];
      if (!keySchema) continue;

      const validationResults = keySchema.safeParse(req[key]);

      if (!validationResults.success) {
        validationErrors.push({
          key,
          issues: validationResults.error.issues.map((issue) => ({
            message: issue.message,
            path: issue.path,
          })),
        });
      }
      continue;
    }

    if (validationErrors.length > 0) {
      throw new BadRequestException("Validation Error", {
        cause: validationErrors,
      });
    }

    next();
  };
};
