import * as z from "zod";
import {
  confirmEmailSchema,
  gmailSchema,
  googleOAuthSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "./auth.validation";

export type ISignupDTO = z.infer<typeof signupSchema.body>;
export type ILoginDTO = z.infer<typeof loginSchema.body>;
export type ILoginQueryDTO = z.infer<typeof loginSchema.query>;
export type IConfirmEmailDTO = z.infer<typeof confirmEmailSchema.body>;
export type IGmailDTO = z.infer<typeof gmailSchema.body>;
export type IGoogleOAuthDTO = z.infer<typeof googleOAuthSchema.body>;
export type IResetPasswordDTO = z.infer<typeof resetPasswordSchema.body>;
