"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewLoginCredentials = exports.getTokenConfig = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_enum_1 = require("../enums/user.enum");
const config_service_1 = __importDefault(require("../../Config/config.service"));
const error_response_1 = require("../response/error.response");
const generateToken = ({ payload, secret, options, }) => {
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = ({ token, secret, }) => {
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
const getTokenConfig = ({ signatureLevel, }) => {
    let signature = {
        accessTokenSignature: undefined,
        refreshTokenSignature: undefined,
        accessTokenExpiresIn: undefined,
        refreshTokenExpiresIn: undefined,
    };
    switch (signatureLevel) {
        case user_enum_1.RoleEnum.Admin:
            signature.accessTokenSignature = config_service_1.default.ACCESS_TOKEN_ADMIN_SIGNATURE;
            signature.refreshTokenSignature = config_service_1.default.REFRESH_TOKEN_ADMIN_SIGNATURE;
            signature.accessTokenExpiresIn = config_service_1.default.ACCESS_TOKEN_ADMIN_EXPIRES_IN;
            signature.refreshTokenExpiresIn = config_service_1.default.REFRESH_TOKEN_ADMIN_EXPIRES_IN;
            break;
        default:
            signature.accessTokenSignature = config_service_1.default.ACCESS_TOKEN_USER_SIGNATURE;
            signature.refreshTokenSignature = config_service_1.default.REFRESH_TOKEN_USER_SIGNATURE;
            signature.accessTokenExpiresIn = config_service_1.default.ACCESS_TOKEN_USER_EXPIRES_IN;
            signature.refreshTokenExpiresIn = config_service_1.default.REFRESH_TOKEN_USER_EXPIRES_IN;
    }
    return signature;
};
exports.getTokenConfig = getTokenConfig;
const getNewLoginCredentials = (user) => {
    const tokenConfig = (0, exports.getTokenConfig)({ signatureLevel: user.role });
    if (!tokenConfig.accessTokenExpiresIn ||
        !tokenConfig.accessTokenSignature ||
        !tokenConfig.refreshTokenExpiresIn ||
        !tokenConfig.refreshTokenSignature)
        throw new error_response_1.InternalServerErrorException("Invalid user role!!!");
    const accessToken = (0, exports.generateToken)({
        payload: {
            id: user._id,
        },
        secret: tokenConfig.accessTokenSignature,
        options: {
            expiresIn: tokenConfig.accessTokenExpiresIn,
        },
    });
    const refreshToken = (0, exports.generateToken)({
        payload: {
            id: user._id,
        },
        secret: tokenConfig.refreshTokenSignature,
        options: {
            expiresIn: tokenConfig.refreshTokenExpiresIn,
        },
    });
    return { accessToken, refreshToken };
};
exports.getNewLoginCredentials = getNewLoginCredentials;
