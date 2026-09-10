import {
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
} from "graphql";
import {
  approveCompanyType,
  banUnbanCompanyType,
  banUnbanUserType,
  companyPaginationType,
  userPaginationType,
} from "./graphql.types";
import { IGraphQLContext } from "./graphql.context";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../response/error.response";
import { RoleEnum } from "../enums/user.enum";
import { userModel } from "../../DB/Models/user.model";
import { companyModel } from "../../DB/Models/company.model";
import { Types } from "mongoose";

const rootQuery = new GraphQLObjectType({
  name: "Query",
  fields: {
    users: {
      type: userPaginationType,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: async (
        _parent,
        args: { page: number; limit: number },
        context: IGraphQLContext,
      ) => {
        // authentication
        if (!context.user)
          throw new UnauthorizedException("U must be logged in");

        // authorization
        if (context.user!.role !== RoleEnum.Admin)
          throw new ForbiddenException("Only admin can do this!!!");

        const limit = Math.min(args.limit, 50);
        const skip = (args.page - 1) * limit;

        const [users, total] = await Promise.all([
          userModel.find().skip(skip).limit(limit),
          userModel.countDocuments(),
        ]);

        return {
          users,
          total,
          pages: Math.ceil(total / limit),
          page: args.page,
          limit,
        };
      },
    },

    companies: {
      type: companyPaginationType,
      args: {
        page: { type: GraphQLInt, defaultValue: 1 },
        limit: { type: GraphQLInt, defaultValue: 10 },
      },
      resolve: async (
        _parent,
        args: { page: number; limit: number },
        context: IGraphQLContext,
      ) => {
        if (!context.user)
          throw new UnauthorizedException("U must be logged in");

        if (context.user!.role !== RoleEnum.Admin)
          throw new ForbiddenException("Only admin can do this!!!");

        const limit = Math.min(args.limit, 50);
        const skip = (args.page - 1) * limit;

        const [companies, total] = await Promise.all([
          companyModel.find().skip(skip).limit(limit),
          companyModel.countDocuments(),
        ]);

        return {
          companies,
          total,
          pages: Math.ceil(total / limit),
          page: args.page,
          limit,
        };
      },
    },
  },
});

const mutationQuery = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    banUserOrNot: {
      type: banUnbanUserType,
      args: { userId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_parent, args: { userId: string }, context) => {
        if (!context.user)
          throw new UnauthorizedException("U must be logged in");

        if (context.user!.role !== RoleEnum.Admin)
          throw new ForbiddenException("Only admin can do this!!!");

        if (!Types.ObjectId.isValid(args.userId))
          throw new BadRequestException("Invalid userId format");

        const user = await userModel.findById(args.userId);
        if (!user) throw new NotFoundException("User not found");

        const alreadyBanned = user?.bannedAt;

        const updated = await userModel.findByIdAndUpdate(
          user._id,
          alreadyBanned
            ? { $unset: { bannedAt: true } }
            : { bannedAt: new Date() },
          { returnDocument: "after" },
        );

        return {
          banned: !alreadyBanned,
          user: updated,
        };
      },
    },
    banCompanyOrNot: {
      type: banUnbanCompanyType,
      args: { companyId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_parent, args: { companyId: string }, context) => {
        if (!context.user)
          throw new UnauthorizedException("U must be logged in");

        if (context.user!.role !== RoleEnum.Admin)
          throw new ForbiddenException("Only admin can do this!!!");

        if (!Types.ObjectId.isValid(args.companyId))
          throw new BadRequestException("Invalid companyId format");

        const company = await companyModel.findById(args.companyId);
        if (!company) throw new NotFoundException("Company not found");

        const alreadyBanned = company?.bannedAt;

        const updated = await companyModel.findByIdAndUpdate(
          company._id,
          alreadyBanned
            ? { $unset: { bannedAt: true } }
            : { bannedAt: new Date() },
          { returnDocument: "after" },
        );

        return {
          banned: !alreadyBanned,
          company: updated,
        };
      },
    },
    approveCompany: {
      type: approveCompanyType,
      args: { companyId: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: async (_parent, args: { companyId: string }, context) => {
        if (!context.user)
          throw new UnauthorizedException("U must be logged in");

        if (context.user!.role !== RoleEnum.Admin)
          throw new ForbiddenException("Only admin can do this!!!");

        if (!Types.ObjectId.isValid(args.companyId))
          throw new BadRequestException("Invalid companyId format");

        const company = await companyModel.findById(args.companyId);
        if (!company) throw new NotFoundException("Company not found");

        if (!company?.isAdminApproved) {
          company.isAdminApproved = true;
          await company.save();
        }

        return {
          approved: company.isAdminApproved,
          company,
        };
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: rootQuery,
  mutation: mutationQuery,
});
