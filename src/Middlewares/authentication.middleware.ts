import { NextFunction, Request, Response } from "express";
import { tokenTypeEnum } from "../Utils/enums/token.enum";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../Utils/response/error.response";
import { getTokenConfig, verifyToken } from "../Utils/security/tokens.security";
import { RoleEnum } from "../Utils/enums/user.enum";
import { userModel } from "../DB/Models/user.model";

export const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.Access,
}: {
  authorization: string | undefined;
  tokenType: tokenTypeEnum;
}) => {
  const [Bearer, token] = authorization?.split(" ") || [];
  if (!Bearer || !token)
    throw new BadRequestException("Invalid authorization headers format");

  const tokenConfig = getTokenConfig({
    signatureLevel: Bearer == "ADMIN" ? RoleEnum.Admin : RoleEnum.User,
  });

  const decoded = verifyToken({
    token,
    secret:
      tokenType == tokenTypeEnum.Access
        ? (tokenConfig.accessTokenSignature as string)
        : (tokenConfig.refreshTokenSignature as string),
  });

  const user = await userModel.findOne({ _id: decoded.id });
  if (!user) throw new NotFoundException("User not found!!!");

  if (!user.isConfirmed)
    throw new BadRequestException("Plz verify ur account first");

  if (user.deletedAt) throw new NotFoundException("Account is deleted");

  if (user.bannedAt)
    throw new BadRequestException("Account is Banned. Plz contact admin.");

  return { decoded, user };
};

export const authentication = ({
  tokenType = tokenTypeEnum.Access,
}: {
  tokenType: tokenTypeEnum;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { decoded, user } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};

    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({
  accessRoles = [],
}: {
  accessRoles: RoleEnum[];
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user)
      throw new ForbiddenException("Unauthorized access, login plz");

    if (!accessRoles.includes(req.user?.role))
      throw new ForbiddenException("Unauthorized access!!!");

    return next();
  };
};
