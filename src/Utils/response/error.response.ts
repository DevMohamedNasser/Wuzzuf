import { NextFunction, Request, Response } from "express";
import env from "../../Config/config.service";

interface IError extends Error {
  message: string;
  statusCode: number;
  options: ErrorOptions;
}

export class ApplicationException extends Error {
  constructor(
    message: string,
    statusCode: number = 400,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class BadRequestException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 400, options);
  }
}

export class UnauthorizedException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 401, options);
  }
}

export class ForbiddenException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 403, options);
  }
}

export class NotFoundException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 403, options);
  }
}

export class ConflictException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 409, options);
  }
}

export class TooManyRequestsException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 429, options);
  }
}

export class InternalServerErrorException extends ApplicationException {
  constructor(message: string, options?: ErrorOptions) {
    super(message, 500, options);
  }
}

export const globalErrorHandler = (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const isDev = env.MODE || "DEVELOPMENT";

  if (statusCode >= 500) console.log(err);

  return res.status(statusCode).json({
    message: err.message,
    ...(isDev && { stack: err.stack }),
    cause: err.cause,
  });
};
