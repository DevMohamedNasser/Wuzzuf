import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../../Utils/enums/token.enum";
import * as validators from "./job.validation";
import jobService from "./job.service";
import { validation } from "../../Middlewares/validation.middleware";
import { localFileMulter } from "../../Utils/multer/local.multer";
import { fileValidation } from "../../Utils/multer/fileTypes.validation.multer";
import { RoleEnum } from "../../Utils/enums/user.enum";

const router = Router({ mergeParams: true });
router.use(authentication({ tokenType: tokenTypeEnum.Access }));

router.post("/", validation(validators.addJobSchema), jobService.addJob);

router.patch(
  "/:id",
  validation(validators.jobIdSchema),
  validation(validators.updateJobSchema),
  jobService.updateJob,
);

router.delete("/:id", validation(validators.jobIdSchema), jobService.deleteJob);

router.get(
  "/jobs",
  validation(validators.JobsFilterSchema),
  jobService.getFilteredJobs,
);

// Take care from previous route 😇 /jobs and /:id sorting means a lot
router.get(
  "/:id",
  validation(validators.jobApplicationsSchema),
  validation(validators.jobIdSchema),
  jobService.jobApplications,
);

router.patch(
  "/applicant/:id",
  validation(validators.ApplicationIdSchema),
  validation(validators.appStatusSchema),
  jobService.acceptOrRejectApplicant,
);

router.post(
  "/apply/:id",
  validation(validators.jobIdSchema),
  authorization({ accessRoles: [RoleEnum.User] }),
  localFileMulter({
    customPath: "Application CVs",
    validation: [...fileValidation.images, ...fileValidation.documents],
    maxSizeMB: 5,
  }).single("attachment"),
  jobService.applyJob,
);

export default router;
