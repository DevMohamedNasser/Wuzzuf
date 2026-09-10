"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyPaginationType = exports.companyType = exports.userPaginationType = exports.userType = void 0;
const graphql_1 = require("graphql");
const user_model_1 = require("../../DB/Models/user.model");
const user_enum_1 = require("../enums/user.enum");
const encryption_security_1 = require("../security/encryption.security");
const pictureType = new graphql_1.GraphQLObjectType({
    name: "Picture",
    fields: {
        secure_url: { type: graphql_1.GraphQLString },
        public_id: { type: graphql_1.GraphQLString },
    },
});
exports.userType = new graphql_1.GraphQLObjectType({
    name: "User",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        firstName: { type: graphql_1.GraphQLString },
        lastName: { type: graphql_1.GraphQLString },
        username: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => `${parent.firstName} ${parent.lastName}`,
        },
        email: { type: graphql_1.GraphQLString },
        gender: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => parent.gender !== undefined ? user_enum_1.GenderEnum[parent.gender] : null,
        },
        DOB: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => (parent.DOB ? parent.DOB.toISOString() : null),
        },
        mobileNumber: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => {
                if (!parent.mobileNumber)
                    return null;
                return parent.mobileNumber.includes(":")
                    ? (0, encryption_security_1.decrypt)(parent.mobileNumber)
                    : parent.mobileNumber;
            },
        },
        role: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => parent.role !== undefined ? user_enum_1.RoleEnum[parent.role] : null,
        },
        isConfirmed: { type: graphql_1.GraphQLBoolean },
        deletedAt: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => parent.deletedAt ? parent.deletedAt.toISOString() : null,
        },
        bannedAt: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => parent.bannedAt ? parent.bannedAt.toISOString() : null,
        },
        profilePic: { type: pictureType },
        coverPic: { type: pictureType },
        createdAt: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => parent.createdAt ? parent.createdAt.toISOString() : null,
        },
    },
});
exports.userPaginationType = new graphql_1.GraphQLObjectType({
    name: "UsersPagination",
    fields: {
        users: { type: new graphql_1.GraphQLList(exports.userType) },
        total: { type: graphql_1.GraphQLInt },
        pages: { type: graphql_1.GraphQLInt },
        page: { type: graphql_1.GraphQLInt },
        limit: { type: graphql_1.GraphQLInt },
    },
});
const numberOfEmployeesCompanyType = new graphql_1.GraphQLObjectType({
    name: "NumberOfEmployees",
    fields: {
        min: { type: graphql_1.GraphQLInt },
        max: { type: graphql_1.GraphQLInt },
    },
});
exports.companyType = new graphql_1.GraphQLObjectType({
    name: "Company",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        name: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString },
        description: { type: graphql_1.GraphQLString },
        industry: { type: graphql_1.GraphQLString },
        address: { type: graphql_1.GraphQLString },
        numberOfEmployees: { type: numberOfEmployeesCompanyType },
        owner: {
            type: exports.userType,
            resolve: (parent) => {
                return user_model_1.userModel.findById(parent.createdBy);
            },
        },
        logo: { type: pictureType },
        coverPic: { type: pictureType },
        legalAttachment: { type: pictureType },
        HRs: {
            type: new graphql_1.GraphQLList(exports.userType),
            args: {
                page: { type: graphql_1.GraphQLInt, defaultValue: 1 },
                limit: { type: graphql_1.GraphQLInt, defaultValue: 10 },
            },
            resolve: (parent, args) => {
                const limit = Math.min(args.limit, 50);
                const skip = (args.page - 1) * limit;
                const hrIds = parent.HRs.slice(skip, skip + limit);
                return user_model_1.userModel.find({ _id: { $in: hrIds } });
            },
        },
        bannedAt: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => parent.bannedAt ? parent.bannedAt.toISOString() : null,
        },
        deletedAt: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => parent.bannedAt ? parent.bannedAt.toISOString() : null,
        },
        isAdminApproved: { type: graphql_1.GraphQLBoolean },
    },
});
exports.companyPaginationType = new graphql_1.GraphQLObjectType({
    name: "CompaniesPagination",
    fields: {
        companies: { type: new graphql_1.GraphQLList(exports.companyType) },
        total: { type: graphql_1.GraphQLInt },
        pages: { type: graphql_1.GraphQLInt },
        page: { type: graphql_1.GraphQLInt },
        limit: { type: graphql_1.GraphQLInt },
    },
});
