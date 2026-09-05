import * as z from "zod";
import { GenderEnum } from "../../Utils/enums/user.enum";

export const updateAccSchema = {
  body: z.object({
    mobileNumber: z
      .string()
      .regex(/^(0|\+20|020)1[0125][\d]{8}$/, {
        error: "Invalid Egy mobileNumber",
      })
      .optional(),
    DOB: z.coerce
      .date({ error: "Invalid date of birth" })
      .refine(
        (date) => {
          const today = new Date();
          const minDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate(),
          );

          return date < minDate;
        },
        { error: "U must be greater than 18 years old" },
      )
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
      .enum(Object.keys(GenderEnum).filter((key) => isNaN(Number(key))))
      .optional(),
  }),
};
