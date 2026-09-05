import { Router } from "express";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./user.validation"
import userService from "./user.service";

const router = Router();

router.patch(
    "/",
    validation(validators.updateAccSchema),
    userService.updateAcc
)

export default router;