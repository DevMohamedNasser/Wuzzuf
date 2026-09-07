import { Router } from "express";
import companyService from "./company.service";
import { authentication } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../../Utils/enums/token.enum";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./company.validation";
import { localFileMulter } from "../../Utils/multer/local.multer";
import { fileValidation } from "../../Utils/multer/fileTypes.validation.multer";

const router = Router();
router.use(authentication({ tokenType: tokenTypeEnum.Access }));

router.post(
  "/",
  localFileMulter({
    customPath: "Company Legal Attachments",
    validation: [...fileValidation.documents, ...fileValidation.images],
    maxSizeMB: 5,
  }).single("attachment"),
  validation(validators.addCompanySchema),
  companyService.addCompany,
);

router.patch(
  "/:id",
  validation(validators.companyIdSchema),
  validation(validators.updateCompanySchema),
  companyService.updateCompanyData,
);

router.delete(
  "/:id",
  validation(validators.companyIdSchema),
  companyService.softDeleteCompany,
);

router.get(
  "/:id/jobs",
  validation(validators.companyIdSchema),
  companyService.companyJobs,
);

router.get(
  "/",
  validation(validators.companyNameSchema),
  companyService.getCompanyByName,
);

router.patch(
  "/:id/logo",
  validation(validators.companyIdSchema),
  localFileMulter({
    customPath: "Company Logo",
    maxSizeMB: 5,
    validation: fileValidation.images,
  }).single("attachment"),
  companyService.uploadLogo,
);

router.patch(
  "/:id/coverPic",
  validation(validators.companyIdSchema),
  localFileMulter({
    customPath: "Company coverPic",
    maxSizeMB: 5,
    validation: fileValidation.images,
  }).single("attachment"),
  companyService.uploadCoverPic,
);

router.delete(
  "/:id/logo",
  validation(validators.companyIdSchema),
  companyService.deleteLogo,
);

router.delete(
  "/:id/coverPic",
  validation(validators.companyIdSchema),
  companyService.deleteCoverPic,
);

export default router;
