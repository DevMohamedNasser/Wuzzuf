"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const graphql_types_1 = require("./graphql.types");
const error_response_1 = require("../response/error.response");
const user_enum_1 = require("../enums/user.enum");
const user_model_1 = require("../../DB/Models/user.model");
const company_model_1 = require("../../DB/Models/company.model");
const mongoose_1 = require("mongoose");
const rootQuery = new graphql_1.GraphQLObjectType({
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
                if (!context.user)
                    throw new error_response_1.UnauthorizedException("U must be logged in");
                if (context.user.role !== user_enum_1.RoleEnum.Admin)
                    throw new error_response_1.ForbiddenException("Only admin can do this!!!");
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
const mutationQuery = new graphql_1.GraphQLObjectType({
    name: "Mutation",
    fields: {
        banUserOrNot: {
            type: graphql_types_1.banUnbanUserType,
            args: { userId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) } },
            resolve: async (_parent, args, context) => {
                if (!context.user)
                    throw new error_response_1.UnauthorizedException("U must be logged in");
                if (context.user.role !== user_enum_1.RoleEnum.Admin)
                    throw new error_response_1.ForbiddenException("Only admin can do this!!!");
                if (!mongoose_1.Types.ObjectId.isValid(args.userId))
                    throw new error_response_1.BadRequestException("Invalid userId format");
                const user = await user_model_1.userModel.findById(args.userId);
                if (!user)
                    throw new error_response_1.NotFoundException("User not found");
                const alreadyBanned = user?.bannedAt;
                const updated = await user_model_1.userModel.findByIdAndUpdate(user._id, alreadyBanned
                    ? { $unset: { bannedAt: true } }
                    : { bannedAt: new Date() }, { returnDocument: "after" });
                return {
                    banned: !alreadyBanned,
                    user: updated,
                };
            },
        },
        banCompanyOrNot: {
            type: graphql_types_1.banUnbanCompanyType,
            args: { companyId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) } },
            resolve: async (_parent, args, context) => {
                if (!context.user)
                    throw new error_response_1.UnauthorizedException("U must be logged in");
                if (context.user.role !== user_enum_1.RoleEnum.Admin)
                    throw new error_response_1.ForbiddenException("Only admin can do this!!!");
                if (!mongoose_1.Types.ObjectId.isValid(args.companyId))
                    throw new error_response_1.BadRequestException("Invalid companyId format");
                const company = await company_model_1.companyModel.findById(args.companyId);
                if (!company)
                    throw new error_response_1.NotFoundException("Company not found");
                const alreadyBanned = company?.bannedAt;
                const updated = await company_model_1.companyModel.findByIdAndUpdate(company._id, alreadyBanned
                    ? { $unset: { bannedAt: true } }
                    : { bannedAt: new Date() }, { returnDocument: "after" });
                return {
                    banned: !alreadyBanned,
                    company: updated,
                };
            },
        },
        approveCompany: {
            type: graphql_types_1.approveCompanyType,
            args: { companyId: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) } },
            resolve: async (_parent, args, context) => {
                if (!context.user)
                    throw new error_response_1.UnauthorizedException("U must be logged in");
                if (context.user.role !== user_enum_1.RoleEnum.Admin)
                    throw new error_response_1.ForbiddenException("Only admin can do this!!!");
                if (!mongoose_1.Types.ObjectId.isValid(args.companyId))
                    throw new error_response_1.BadRequestException("Invalid companyId format");
                const company = await company_model_1.companyModel.findById(args.companyId);
                if (!company)
                    throw new error_response_1.NotFoundException("Company not found");
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
exports.schema = new graphql_1.GraphQLSchema({
    query: rootQuery,
    mutation: mutationQuery,
});
