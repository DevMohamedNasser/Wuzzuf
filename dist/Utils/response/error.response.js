"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.InternalServerErrorException = exports.TooManyRequestsException = exports.ConflictException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.ApplicationException = void 0;
const config_service_1 = __importDefault(require("../../Config/config.service"));
class ApplicationException extends Error {
    statusCode;
    constructor(message, statusCode = 400, options) {
        super(message, options);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}
exports.ApplicationException = ApplicationException;
class BadRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 400, options);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends ApplicationException {
    constructor(message, options) {
        super(message, 401, options);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends ApplicationException {
    constructor(message, options) {
        super(message, 403, options);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends ApplicationException {
    constructor(message, options) {
        super(message, 404, options);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends ApplicationException {
    constructor(message, options) {
        super(message, 409, options);
    }
}
exports.ConflictException = ConflictException;
class TooManyRequestsException extends ApplicationException {
    constructor(message, options) {
        super(message, 429, options);
    }
}
exports.TooManyRequestsException = TooManyRequestsException;
class InternalServerErrorException extends ApplicationException {
    constructor(message, options) {
        super(message, 500, options);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const isDev = config_service_1.default.MODE || "DEVELOPMENT";
    if (statusCode >= 500)
        console.log(err);
    return res.status(statusCode).json({
        message: err.message,
        ...(isDev && { stack: err.stack }),
        cause: err.cause,
    });
};
exports.globalErrorHandler = globalErrorHandler;
