import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import { ApplicationStatusEnum } from "../../Utils/enums/application.enum";

export interface IApplication {
  jobId: Types.ObjectId;
  userId: Types.ObjectId;
  userCV: { secure_url: string; public_id: string };
  status: ApplicationStatusEnum;
}

export const applicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Types.ObjectId,
      ref: "Job",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    userCV: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
      required: true,
    },
    status: {
      type: Number,
      enum: Object.values(ApplicationStatusEnum),
      default: ApplicationStatusEnum.Pending,
    },
  },
  { timestamps: true },
);

export const applicationModel: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model("Application", applicationSchema);

export type HApplicationDocument = HydratedDocument<IApplication>;
