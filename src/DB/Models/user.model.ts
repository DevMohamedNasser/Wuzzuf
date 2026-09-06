import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  UserOTPEnum,
} from "../../Utils/enums/user.enum";
import { applicationModel } from "./application.model";
import { chatModel } from "./chat.model";
import { companyModel } from "./company.model";
import { generateHash } from "../../Utils/security/hash.security";
import { decrypt, encrypt } from "../../Utils/security/encryption.security";

export interface IUserOTP {
  code: string;
  type: UserOTPEnum;
  expiresIn: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  password: string;
  gender?: GenderEnum;
  DOB?: Date;
  mobileNumber?: string;
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
  createdAt: Date;
  updatedA?: Date;
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
      enum: Object.values(ProviderEnum).filter(
        (value) => typeof value === "number",
      ),
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
      enum: Object.values(GenderEnum).filter(
        (value) => typeof value === "number",
      ),
    },
    role: {
      type: Number,
      enum: Object.values(RoleEnum).filter(
        (value) => typeof value === "number",
      ),
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
      required: function (this: IUser) {
        return this.provider == ProviderEnum.System;
      },
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
    OTP: [
      {
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
      },
    ],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.OTP;
        delete ret.provider;
        delete ret.role;
        if (ret.gender !== undefined)
          ret.gender = GenderEnum[ret.gender as GenderEnum];
        return ret;
      },
    },
  },
);

userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({ firstName, lastName: rest.join(" ") });
  })
  .get(function (this: IUser) {
    return this.firstName + " " + this.lastName;
  });

userSchema.pre("save", async function () {
  if (this.provider == ProviderEnum.System && this.isModified("password"))
    this.password = await generateHash(this.password);

  if (this.mobileNumber && this.isModified("mobileNumber"))
    this.mobileNumber = encrypt(this.mobileNumber);
});

userSchema.post("findOne", async function (doc: IUser) {
  if (doc.mobileNumber) doc.mobileNumber = decrypt(doc.mobileNumber);
});

userSchema.post("deleteOne", async function () {
  const { _id: userId } = this.getFilter();

  if (!userId) return;

  await applicationModel.deleteMany({ userId });
  await chatModel.deleteMany({
    $or: [{ senderId: userId }, { receiverId: userId }],
  });
  await companyModel.updateMany({ HRs: userId }, { $pull: { HRs: userId } });
});

export const userModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;
