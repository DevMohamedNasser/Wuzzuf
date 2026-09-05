import { z } from "zod";
import { GenderEnum, RoleEnum } from "../../Utils/enums/user.enum";

export const loginSchema = {
  query: z
    .object({
      isAdmin: z.coerce.number().default(RoleEnum.User),
    })
    .optional(),
  body: z.strictObject({
    email: z.email(),
    password: z
      .string({ error: "password is required" })
      .min(6, { error: "password must be at least 6 chars" }),
  }),
};

export const signupSchema = {
  body: loginSchema.body
    .extend({
      username: z
        .string()
        .min(2, { error: "username must be at least 2 chars" })
        .max(50, { error: "username must be at most 50 chars" }),
      gender: z.enum(
        Object.keys(GenderEnum).filter((key) => isNaN(Number(key))),
      ),
      confirmPassword: z
        .string()
        .min(6, { error: "confirmPassword must be at least 6 chars" }),
      DOB: z.coerce.date({ error: "Invalid date of birth" }).refine(
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
      ),
      mobileNumber: z.string().regex(/^(0|\+20|020)1[0125][\d]{8}$/, {
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

export const confirmEmailSchema = {
  body: z.strictObject({
    email: z.email(),
    otp: z.string().regex(/^[\d]{6}$/, { error: "otp must be 6 chars" }),
  }),
};

export const gmailSchema = {
  body: z.strictObject({
    email: z.email(),
  }),
};

export const googleOAuthSchema = {
  body: z.strictObject({
    idToken: z.string({ error: "idToken is required" }),
  }),
};

export const resetPasswordSchema = {
  body: z
    .strictObject({
      email: z.email(),
      otp: z.string().regex(/^[\d]{6}$/, { error: "otp must be 6 chars" }),
      password: z
        .string({ error: "password is required" })
        .min(6, { error: "password must be at least 6 chars" }),
      confirmPassword: z
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
