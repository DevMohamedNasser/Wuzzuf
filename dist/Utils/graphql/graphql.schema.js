"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.rootQuery = void 0;
const graphql_1 = require("graphql");
const graphql_types_1 = require("./graphql.types");
const error_response_1 = require("../response/error.response");
const user_enum_1 = require("../enums/user.enum");
const user_model_1 = require("../../DB/Models/user.model");
const company_model_1 = require("../../DB/Models/company.model");
exports.rootQuery = new graphql_1.GraphQLObjectType({
    name: "Query",
    fields: {
        users: {
            type: graphql_types_1.userPaginationType,
            args: {
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 },
            },
            resolve: async (_parent, args, context) => {
                // authentication
                if (!context.user)
                    throw new error_response_1.UnauthorizedException("U must be logged in");
                // authorization
                if (context.user.role !== user_enum_1.RoleEnum.Admin)
                    throw new error_response_1.ForbiddenException("Only admin can do this!!!");
                const limit = Math.min(args.limit, 50);
                const skip = (args.page - 1) * limit;
                const [users, total] = await Promise.all([
                    user_model_1.userModel.find().skip(skip).limit(limit),
                    user_model_1.userModel.countDocuments(),
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
            type: graphql_types_1.companyPaginationType,
            args: {
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 },
            },
            resolve: async (_parent, args, context) => {
                // if (!context.user)
                //   throw new UnauthorizedException("U must be logged in");
                // if (context.user!.role !== RoleEnum.Admin)
                //   throw new ForbiddenException("Only admin can do this!!!");
                const limit = Math.min(args.limit, 50);
                const skip = (args.page - 1) * limit;
                const [companies, total] = await Promise.all([
                    company_model_1.companyModel.find().skip(skip).limit(limit),
                    company_model_1.companyModel.countDocuments(),
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
exports.schema = new graphql_1.GraphQLSchema({
    query: exports.rootQuery,
});
