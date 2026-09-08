import { ICompany } from "../../DB/Models/company.model";
import { HUserDocument } from "../../DB/Models/user.model";
import { IJob } from "../../DB/Models/job.model";
import { getIo } from "./socket.service";

export const socketNotifyHRsApplication = (
  company: ICompany,
  user: HUserDocument,
  job: IJob,
) => {
  const io = getIo();
  if (!io) return;

  company.HRs.forEach((hr) => {
    io.to(hr._id.toString()).emit("newApplication", {
      message: "Receive new job application",
      job,
      user,
    });
  });
};
