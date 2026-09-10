"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContext = void 0;
const authentication_middleware_1 = require("../../Middlewares/authentication.middleware");
const token_enum_1 = require("../enums/token.enum");
const buildContext = async (authorization) => {
    if (!authorization)
        return {};
    try {
        const { user } = await (0, authentication_middleware_1.decodedToken)({
            authorization,
            tokenType: token_enum_1.tokenTypeEnum.Access,
        });
        return { user };
    }
    catch (error) {
        return {};
    }
};
exports.buildContext = buildContext;
