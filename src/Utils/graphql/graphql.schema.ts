import { GraphQLInt, GraphQLObjectType, GraphQLSchema } from "graphql";
import { companyPaginationType, userPaginationType } from "./graphql.types";
import { IGraphQLContext } from "./graphql.context";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../response/error.response";
import { RoleEnum } from "../enums/user.enum";
import { userModel } from "../../DB/Models/user.model";
import { companyModel } from "../../DB/Models/company.model";

export const rootQuery = new GraphQLObjectType({
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
        // if (!context.user)
        //   throw new UnauthorizedException("U must be logged in");

        // if (context.user!.role !== RoleEnum.Admin)
        //   throw new ForbiddenException("Only admin can do this!!!");

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

export const schema = new GraphQLSchema({
  query: rootQuery,
});
