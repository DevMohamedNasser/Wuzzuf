import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import { jobModel } from "./job.model";

export interface ICompany {
  _id: Types.ObjectId;
  name: string;
  email: string;
  description?: string;
  industry: string;
  address?: string;
  numberOfEmployees: { min: number; max: number };
  createdBy: Types.ObjectId;
  logo?: { secure_url: string; public_id: string };
  coverPic?: { secure_url: string; public_id: string };
  HRs: Types.ObjectId[];
  bannedAt: Date;
  deletedAt: Date;
  legalAttachment: { secure_url: string; public_id: string };
  isAdminApproved: boolean;
}

export const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      minLength: 2,
      required: true,
    },
    address: {
      type: String,
      trim: true,
    },
    numberOfEmployees: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    logo: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    coverPic: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    HRs: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    bannedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    legalAttachment: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    isAdminApproved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

companySchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "companyId",
});

companySchema.post("deleteOne", async function () {
  const { _id: companyId } = this.getFilter();

  if (!companyId) return;

  await jobModel.deleteMany({ companyId });
});

export const companyModel: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", companySchema);

export type HCompanyDocument = HydratedDocument<ICompany>;
