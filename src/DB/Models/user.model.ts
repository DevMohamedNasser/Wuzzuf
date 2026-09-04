import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  UserOTPEnum,
} from "../../Utils/enums/user.enum";

export interface IUserOTP {
  code: string;
  type: UserOTPEnum;
  expiresIn: Date;
}

export interface IUser {
  firstName: string;
  lastName: string;
  userName?: string;
  email: string;
  password: string;
  gender: GenderEnum;
  DOB: Date;
  mobileNumber: string;
  role: RoleEnum;
  isConfirmed: boolean;
  deletedAt: Date;
  bannedAt: Date;
  updatedBy: Types.ObjectId;
  changeCredentialTime: Date;
  profilePic: { secure_url: string; public_id: string };
  coverPic: { secure_url: string; public_id: string };
  OTP: IUserOTP[];
  provider: ProviderEnum;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
      minLength: 2,
      maxLength: 25,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      minLength: 2,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.System,
    },
    password: {
      type: String,
      required: function (this) {
        return this.provider == ProviderEnum.System;
      },
    },
    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.Male,
    },
    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.User,
    },
    mobileNumber: {
      type: String,
      required: function (this) {
        return this.provider == ProviderEnum.System;
      },
    },
    DOB: {
      type: Date,
      required: true,
      validate: {
        validator: function (value: Date) {
          const today = new Date();

          if (value >= today) return false;

          const minDate = new Date(
            today.getFullYear() - 18,
            today.getMonth(),
            today.getDate(),
          );

          return value < minDate;
        },
        message: "Must be greater than 18 years",
      },
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    bannedAt: {
      type: Date,
    },
    updatedBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    changeCredentialTime: {
      type: Date,
    },
    profilePic: {
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
    OTP: [{
      code: {
        type: String,
      },
      type: {
        type: String,
        enum: Object.values(UserOTPEnum),
      },
      expiresIn: {
        type: Date,
      },
    }],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.OTP;
        return ret;
      },
    },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, ...rest] = value.trim().split(/^\s+$/);
    this.set({ firstName, lastName: rest.join(" ") });
  })
  .get(function (this: IUser) {
    return this.firstName + " " + this.lastName;
  });

export const userModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;
