import { Router } from "express";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./user.validation";
import userService from "./user.service";
import { authentication } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../../Utils/enums/token.enum";
import { localFileMulter } from "../../Utils/multer/local.multer";
import { fileValidation } from "../../Utils/multer/fileTypes.validation.multer";

const router = Router();
router.use(authentication({ tokenType: tokenTypeEnum.Access }));

router.patch(
  "/",
  validation(validators.updateAccSchema),
  userService.updateAcc,
);

router.get("/", userService.getLoginUser);

router.get("/:id", validation(validators.userIdSchema), userService.getProfile);

router.patch(
  "/password",
  validation(validators.updatePasswordSchema),
  userService.updatePassword,
);

router.delete("/soft", userService.softDeleteAcc);

router.patch(
  "/upload-profilePic",
  localFileMulter({
    validation: fileValidation.images,
    customPath: "profile picture",
    maxSizeMB: 5,
  }).single("attachment"),
  userService.uploadProfilePic,
);

router.patch(
  "/upload-coverPic",
  localFileMulter({
    validation: fileValidation.images,
    customPath: "cover picture",
    maxSizeMB: 5,
  }).single("attachment"),
  userService.uploadCoverPic,
);

router.delete("/coverPic", userService.deleteCoverPic);

router.delete("/profilePic", userService.deleteProfilePic);

export default router;
