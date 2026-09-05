"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authentication = exports.decodedToken = void 0;
const token_enum_1 = require("../Utils/enums/token.enum");
const error_response_1 = require("../Utils/response/error.response");
const tokens_security_1 = require("../Utils/security/tokens.security");
const user_enum_1 = require("../Utils/enums/user.enum");
const user_model_1 = require("../DB/Models/user.model");
const decodedToken = async ({ authorization, tokenType = token_enum_1.tokenTypeEnum.Access, }) => {
    const [Bearer, token] = authorization?.split(" ") || [];
    if (!Bearer || !token)
        throw new error_response_1.BadRequestException("Invalid authorization headers format");
    const tokenConfig = (0, tokens_security_1.getTokenConfig)({
        signatureLevel: Bearer == "ADMIN" ? user_enum_1.RoleEnum.Admin : user_enum_1.RoleEnum.User,
    });
    const decoded = (0, tokens_security_1.verifyToken)({
        token,
        secret: tokenType == token_enum_1.tokenTypeEnum.Access
            ? tokenConfig.accessTokenSignature
            : tokenConfig.refreshTokenSignature,
    });
    const user = await user_model_1.userModel.findOne({ _id: decoded.id });
    if (!user)
        throw new error_response_1.NotFoundException("User not found!!!");
    if (!user.isConfirmed)
        throw new error_response_1.BadRequestException("Plz verify ur account first");
    if (user.changeCredentialTime &&
        new Date(decoded.iat * 1000) < user.changeCredentialTime) {
        /**
         * jwt.iat => seconds
         * js Date => milliseconds
         */
        throw new error_response_1.BadRequestException("Token is expired after changing password");
    }
    if (user.deletedAt)
        throw new error_response_1.NotFoundException("Account is deleted");
    if (user.bannedAt)
        throw new error_response_1.BadRequestException("Account is Banned. Plz contact admin.");
    return { decoded, user };
};
exports.decodedToken = decodedToken;
const authentication = ({ tokenType = token_enum_1.tokenTypeEnum.Access, }) => {
    return async (req, res, next) => {
        const { decoded, user } = (await (0, exports.decodedToken)({
            authorization: req.headers.authorization,
            tokenType,
        })) || {};
        req.user = user;
        req.decoded = decoded;
        return next();
    };
};
exports.authentication = authentication;
const authorization = ({ accessRoles = [], }) => {
    return (req, res, next) => {
        if (!req.user)
            throw new error_response_1.ForbiddenException("Unauthorized access, login plz");
        if (!accessRoles.includes(req.user?.role))
            throw new error_response_1.ForbiddenException("Unauthorized access!!!");
        return next();
    };
};
exports.authorization = authorization;
