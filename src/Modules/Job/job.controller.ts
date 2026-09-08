import { Router } from "express";
import { authentication } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../../Utils/enums/token.enum";
import * as validators from "./job.validation";
import jobService from "./job.service";
import { validation } from "../../Middlewares/validation.middleware";

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

export default router;
