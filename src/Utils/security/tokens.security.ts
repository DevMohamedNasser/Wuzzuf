import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { RoleEnum } from "../enums/user.enum";
import env from "../../Config/config.service";
import { InternalServerErrorException } from "../response/error.response";
import { HUserDocument } from "../../DB/Models/user.model";

export const generateToken = ({
  payload,
  secret,
  options,
}: {
  payload: object;
  secret: Secret;
  options: SignOptions;
}): string => {
  return jwt.sign(payload, secret, options);
};

export interface ITokenPayload extends JwtPayload {
  id: string;
}

export const verifyToken = ({
  token,
  secret,
}: {
  token: string;
  secret: Secret;
}): ITokenPayload => {
  return jwt.verify(token, secret) as ITokenPayload;
};

export interface ITokenConfig {
  accessTokenSignature: string | undefined;
  refreshTokenSignature: string | undefined;
  accessTokenExpiresIn: number | undefined;
  refreshTokenExpiresIn: number | undefined;
}

export const getTokenConfig = ({
  signatureLevel,
}: {
  signatureLevel: RoleEnum;
}) => {
  let signature: ITokenConfig = {
    accessTokenSignature: undefined,
    refreshTokenSignature: undefined,
    accessTokenExpiresIn: undefined,
    refreshTokenExpiresIn: undefined,
  };

  switch (signatureLevel) {
    case RoleEnum.Admin:
      signature.accessTokenSignature = env.ACCESS_TOKEN_ADMIN_SIGNATURE;
      signature.refreshTokenSignature = env.REFRESH_TOKEN_ADMIN_SIGNATURE;
      signature.accessTokenExpiresIn = env.ACCESS_TOKEN_ADMIN_EXPIRES_IN;
      signature.refreshTokenExpiresIn = env.REFRESH_TOKEN_ADMIN_EXPIRES_IN;
      break;
    default:
      signature.accessTokenSignature = env.ACCESS_TOKEN_USER_SIGNATURE;
      signature.refreshTokenSignature = env.REFRESH_TOKEN_USER_SIGNATURE;
      signature.accessTokenExpiresIn = env.ACCESS_TOKEN_USER_EXPIRES_IN;
      signature.refreshTokenExpiresIn = env.REFRESH_TOKEN_USER_EXPIRES_IN;
  }

  return signature;
};

export const getNewLoginCredentials = (user: HUserDocument) => {
  const tokenConfig = getTokenConfig({ signatureLevel: user.role });
  if (
    !tokenConfig.accessTokenExpiresIn ||
    !tokenConfig.accessTokenSignature ||
    !tokenConfig.refreshTokenExpiresIn ||
    !tokenConfig.refreshTokenSignature
  )
    throw new InternalServerErrorException("Invalid user role!!!");

  const accessToken = generateToken({
    payload: {
      id: user._id,
    },
    secret: tokenConfig.accessTokenSignature,
    options: {
      expiresIn: tokenConfig.accessTokenExpiresIn,
    },
  });

  const refreshToken = generateToken({
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
