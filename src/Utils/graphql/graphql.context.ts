import { HUserDocument } from "../../DB/Models/user.model";
import { decodedToken } from "../../Middlewares/authentication.middleware";
import { tokenTypeEnum } from "../enums/token.enum";

export interface IGraphQLContext {
  user?: HUserDocument;
}

export const buildContext = async (
  authorization: string | undefined,
): Promise<IGraphQLContext> => {
  if (!authorization) return {};

  try {
    const { user } = await decodedToken({
      authorization,
      tokenType: tokenTypeEnum.Access,
    });

    return { user };
  } catch (error) {
    return {};
  }
};
