import { HUserDocument } from "../DB/Models/user.model";
import { ITokenPayload } from "../Utils/security/tokens.security";

declare global {
  namespace Express {
    interface Request {
      user?: HUserDocument;
      decoded?: ITokenPayload;
    }
  }
}

export {};
