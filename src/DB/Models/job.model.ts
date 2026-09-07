import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import {
  JobLocationEnum,
  JobSeniorityLevelEnum,
  JobWorkingTimeEnum,
} from "../../Utils/enums/job.enum";
import { applicationModel } from "./application.model";

export interface IJob {
  title: string;
  location: JobLocationEnum;
  workingTime: JobWorkingTimeEnum;
  seniorityLevel: JobSeniorityLevelEnum;
  description: string;
  technicalSkills: string[];
  softSkills: string[];
  addedBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  closed: boolean;
  companyId: Types.ObjectId;
}

export const jobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      minlength: [2, "title minLength: 2 chars"],
      trim: true,
      required: [true, "title is required"],
    },
    location: {
      type: Number,
      enum: Object.values(JobLocationEnum).filter(value => typeof(value) === "number"),
      required: true,
    },
    workingTime: {
      type: Number,
      enum: Object.values(JobWorkingTimeEnum).filter(value => typeof(value) === "number"),
      default: JobWorkingTimeEnum.FullTime,
      required: true,
    },
    seniorityLevel: {
      type: Number,
      enum: Object.values(JobSeniorityLevelEnum).filter(value => typeof(value) === "number"),
      required: true,
    },
    description: {
      type: String,
      minLength: 2,
      required: true,
    },
    technicalSkills: [
      {
        type: String,
        required: true,
      },
    ],
    softSkills: [
      {
        type: String,
      },
    ],
    addedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    closed: {
      type: Boolean,
      default: false,
    },
    companyId: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true },
);

// jobSchema.pre("findOneAndDelete", async function() {});
jobSchema.post("deleteOne", async function () {
  const filter = this.getFilter();
  if (filter._id) {
    await applicationModel.deleteMany({ jobId: filter._id });
  }
});

jobSchema.pre("deleteMany", async function () {
  const filter = this.getFilter();

  const jobs = await jobModel.find(filter).select("_id");
  const jobIds = jobs.map((job) => job._id);

  if (!jobIds.length) return;

  await applicationModel.deleteMany({ jobId: { $in: jobIds } });
});

jobSchema.post("find", function (docs: IJob[]) {
  docs.forEach((job) => {
    job.location = JobLocationEnum[job.location] as any;
    job.workingTime = JobWorkingTimeEnum[job.workingTime] as any;
    job.seniorityLevel = JobSeniorityLevelEnum[job.seniorityLevel] as any;
  });
});

export const jobModel: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);

export type HJobDocument = HydratedDocument<IJob>;
