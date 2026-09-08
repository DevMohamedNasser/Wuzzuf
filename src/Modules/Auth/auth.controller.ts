import { Router } from "express";
import authService from "./auth.service";
import * as validators from "./auth.validation";
import { validation } from "../../Middlewares/validation.middleware";
import {
  authentication,
  authorization,
} from "../../Middlewares/authentication.middleware";
import { RoleEnum } from "../../Utils/enums/user.enum";
import { tokenTypeEnum } from "../../Utils/enums/token.enum";

const router = Router();

router.post("/signup", validation(validators.signupSchema), authService.signup);

router.post("/login", validation(validators.loginSchema), authService.login);

router.patch(
  "/confirm-email",
  validation(validators.confirmEmailSchema),
  authService.confirmEmail,
);

router.patch(
  "/resend-otp",
  validation(validators.gmailSchema),
  authService.resendOTP,
);

router.post(
  "/social-login",
  validation(validators.googleOAuthSchema),
  authService.googleLogin,
);

router.patch(
  "/forget-password",
  validation(validators.gmailSchema),
  authService.forgetPassword,
);

router.patch(
  "/reset-password",
  validation(validators.resetPasswordSchema),
  authService.resetPassword,
);

router.post(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.Refresh }),
  authorization({ accessRoles: [RoleEnum.User, RoleEnum.Admin] }),
  authService.refreshToken,
);

export default router;
