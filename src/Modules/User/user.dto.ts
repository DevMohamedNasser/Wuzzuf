import { z } from "zod";
import { updateAccSchema, updatePasswordSchema, userIdSchema } from "./user.validation";

export type IUpdateAccDTO = z.infer<typeof updateAccSchema.body>;
export type IUserIdDTO = z.infer<typeof userIdSchema.params>;
export type IUpdatePasswordDTO = z.infer<typeof updatePasswordSchema.body>;