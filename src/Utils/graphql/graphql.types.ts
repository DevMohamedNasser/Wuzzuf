import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import { IUser, userModel } from "../../DB/Models/user.model";
import { ICompany } from "../../DB/Models/company.model";
import { GenderEnum, RoleEnum } from "../enums/user.enum";
import { decrypt } from "../security/encryption.security";

const pictureType = new GraphQLObjectType({
  name: "Picture",
  fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
  },
});

export const userType = new GraphQLObjectType({
  name: "User",
  fields: {
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    username: {
      type: GraphQLString,
      resolve: (parent: IUser) => `${parent.firstName} ${parent.lastName}`,
    },
    email: { type: GraphQLString },
    gender: {
      type: GraphQLString,
      resolve: (parent) =>
        parent.gender !== undefined ? GenderEnum[parent.gender] : null,
    },
    DOB: {
      type: GraphQLString,
      resolve: (parent) => (parent.DOB ? parent.DOB.toISOString() : null),
    },
    mobileNumber: {
      type: GraphQLString,
      resolve: (parent) => {
        if (!parent.mobileNumber) return null;

        return parent.mobileNumber.includes(":")
          ? decrypt(parent.mobileNumber)
          : parent.mobileNumber;
      },
    },
    role: {
      type: GraphQLString,
      resolve: (parent) =>
        parent.role !== undefined ? RoleEnum[parent.role] : null,
    },
    isConfirmed: { type: GraphQLBoolean },
    deletedAt: {
      type: GraphQLString,
      resolve: (parent) =>
        parent.deletedAt ? parent.deletedAt.toISOString() : null,
    },
    bannedAt: {
      type: GraphQLString,
      resolve: (parent) =>
        parent.bannedAt ? parent.bannedAt.toISOString() : null,
    },
    profilePic: { type: pictureType },
    coverPic: { type: pictureType },
    createdAt: {
      type: GraphQLString,
      resolve: (parent) =>
        parent.createdAt ? parent.createdAt.toISOString() : null,
    },
  },
});

export const userPaginationType = new GraphQLObjectType({
  name: "UsersPagination",
  fields: {
    users: { type: new GraphQLList(userType) },
    total: { type: GraphQLInt },
    pages: { type: GraphQLInt },
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  },
});

const numberOfEmployeesCompanyType = new GraphQLObjectType({
  name: "NumberOfEmployees",
  fields: {
    min: { type: GraphQLInt },
    max: { type: GraphQLInt },
  },
});

export const companyType = new GraphQLObjectType({
  name: "Company",
  fields: {
    _id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    description: { type: GraphQLString },
    industry: { type: GraphQLString },
    address: { type: GraphQLString },
    numberOfEmployees: { type: numberOfEmployeesCompanyType },
    owner: {
      type: userType,
      resolve: (parent: ICompany) => {
        return userModel.findById(parent.createdBy);
      },
    },
    logo: { type: pictureType },
    coverPic: { type: pictureType },
    legalAttachment: { type: pictureType },
    HRs: {
      type: new GraphQLList(userType),
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: (parent, args: { page: number; limit: number }) => {
        const limit: number = Math.min(args.limit, 50);
        const skip: number = (args.page - 1) * limit;

        const hrIds = parent.HRs.slice(skip, skip + limit);
        return userModel.find({ _id: { $in: hrIds } });
      },
    },
    bannedAt: {
      type: GraphQLString,
      resolve: (parent) =>
        parent.bannedAt ? parent.bannedAt.toISOString() : null,
    },
    deletedAt: {
      type: GraphQLString,
      resolve: (parent) =>
        parent.bannedAt ? parent.bannedAt.toISOString() : null,
    },
    isAdminApproved: { type: GraphQLBoolean },
  },
});

export const companyPaginationType = new GraphQLObjectType({
  name: "CompaniesPagination",
  fields: {
    companies: { type: new GraphQLList(companyType) },
    total: { type: GraphQLInt },
    pages: { type: GraphQLInt },
    page: { type: GraphQLInt },
    limit: { type: GraphQLInt },
  },
});
