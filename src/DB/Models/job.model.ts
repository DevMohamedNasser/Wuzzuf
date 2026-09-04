import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import {
  JobLocationEnum,
  JobSeniorityLevelEnum,
  JobWorkingTimeEnum,
} from "../../Utils/enums/job.enum";

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
      enum: Object.values(JobLocationEnum),
      required: true,
    },
    workingTime: {
      type: Number,
      enum: Object.values(JobWorkingTimeEnum),
      default: JobWorkingTimeEnum.FullTime,
      required: true,
    },
    seniorityLevel: {
      type: Number,
      enum: Object.values(JobSeniorityLevelEnum),
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
      required: true,
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

export const jobModel: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", jobSchema);

export type HJobDocument = HydratedDocument<IJob>;
