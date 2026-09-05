import { z } from "zod";
import { updateAccSchema } from "./user.validation";

export type updateAccDTO = z.infer<typeof updateAccSchema>;
