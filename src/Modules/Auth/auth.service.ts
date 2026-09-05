import { OAuth2Client } from "google-auth-library";
import { Request, Response } from "express";
import { userModel } from "../../DB/Models/user.model";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import generateOTP from "../../Utils/email/generateOTP";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
  UserOTPEnum,
} from "../../Utils/enums/user.enum";
import emailEvent from "../../Utils/events/email.event";
import { compareHash, generateHash } from "../../Utils/security/hash.security";
import {
  IConfirmEmailDTO,
  IGmailDTO,
  IGoogleOAuthDTO,
  ILoginDTO,
  ILoginQueryDTO,
  IResetPasswordDTO,
  ISignupDTO,
} from "./auth.dto";
import { getNewLoginCredentials } from "../../Utils/security/tokens.security";
import env from "../../Config/config.service";
import { IPayloadGoogleOAuth } from "../../Utils/socialLogin.interface";

class AuthService {
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password, gender, DOB, mobileNumber }: ISignupDTO =
      req.body;

    const isExist = await userModel.findOne({ email });
    if (isExist) throw new ConflictException("User already exists!!!");

    const otp = generateOTP();

    const user = await userModel.create({
      username,
      email,
      password,
      //   gender: gender == "Male" ? 0 : 1,
      gender: GenderEnum[gender as keyof typeof GenderEnum],
      DOB: new Date(DOB),
      mobileNumber,
      OTP: [
        {
          code: await generateHash(otp),
          type: UserOTPEnum.ConfirmEmail,
          /** expires in 10min */
          expiresIn: new Date(Date.now() + 10 * 60 * 1000),
        },
      ],
      provider: ProviderEnum.System,
    });

    emailEvent.emit("confirmEmail", { to: email, username, otp });
    return res
      .status(201)
      .json({ message: "Check ur inbox & verify account", data: { user } });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: ILoginDTO = req.body;
    const { isAdmin = RoleEnum.User }: ILoginQueryDTO =
      req.query as unknown as {
        isAdmin: number;
      };

    const user = await userModel.findOne({
      email,
      role: isAdmin == RoleEnum.Admin ? RoleEnum.Admin : RoleEnum.User,
    });
    if (!user) throw new NotFoundException("User not found");

    const isAuthorized = await compareHash(password, user.password);
    if (!isAuthorized)
      throw new ForbiddenException("Incorrect email or password");

    if (!user.isConfirmed)
      throw new BadRequestException("Account hasn't been verified yet!!!");

    if (user.deletedAt) throw new NotFoundException("Account has been deleted");

    if (user.bannedAt)
      throw new BadRequestException("Account is banned, contact admin");

    if (user.provider === ProviderEnum.Google)
      throw new BadRequestException("Plz login with Google");

    const tokens = getNewLoginCredentials(user);

    return res
      .status(200)
      .json({ message: "Logged in successfully", data: { tokens } });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailDTO = req.body;

    const user = await userModel.findOne({ email });

    if (!user) throw new NotFoundException("User not found");

    if (user.isConfirmed)
      throw new BadRequestException("Account already verified");

    const confirmOTP = user.OTP.find(
      (otp) => otp.type === UserOTPEnum.ConfirmEmail,
    );
    if (!confirmOTP) {
      throw new BadRequestException(
        "OTP not found, plz send confirm OTP request",
      );
    }

    if (new Date() > confirmOTP.expiresIn) {
      await userModel.updateOne(
        { email },
        { $pull: { OTP: { type: UserOTPEnum.ConfirmEmail } } },
      );
      throw new BadRequestException(
        "Expired OTP, plz send confirm OTP request",
      );
    }

    if (!(await compareHash(otp, confirmOTP.code)))
      throw new BadRequestException("Invalid OTP");

    await userModel.updateOne(
      { email },
      { isConfirmed: true, $pull: { OTP: { type: UserOTPEnum.ConfirmEmail } } },
    );

    return res.status(200).json({ message: "Account confirmed successfully" });
  };

  resendOTP = async (req: Request, res: Response): Promise<Response> => {
    const { email }: IGmailDTO = req.body;

    const user = await userModel.findOne({ email });
    if (!user) throw new NotFoundException("User not found");

    if (user.isConfirmed)
      throw new BadRequestException("Account already activated");

    const confirmOTP = user.OTP.find(
      (otp) => otp.type === UserOTPEnum.ConfirmEmail,
    );

    if (confirmOTP) {
      if (new Date() < confirmOTP.expiresIn)
        throw new BadRequestException("Use Previous Valid OTP");
    }

    /**  !confirmOTP || new Date() > confirmOTP.expiresIn (means otp is expired) */
    const otp = generateOTP();
    const hashedOTP = await generateHash(otp);
    await userModel.updateOne(
      { email },
      {
        $set: {
          OTP: [
            ...user.OTP.filter((otp) => otp.type !== UserOTPEnum.ConfirmEmail),
            {
              code: hashedOTP,
              type: UserOTPEnum.ConfirmEmail,
              expiresIn: new Date(Date.now() + 10 * 60 * 1000),
            },
          ],
        },
      },
    );

    emailEvent.emit("confirmEmail", {
      to: email,
      username: user.username,
      otp,
    });

    return res.status(200).json({ message: "Check ur inbox" });
  };

  verifyGoogleAcc = async (idToken: string) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload)
      throw new BadRequestException("Payload isn't defined, try later");

    return payload;
  };

  googleLogin = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: IGoogleOAuthDTO = req.body;
    const {
      email,
      email_verified,
      name: username,
      picture,
    }: IPayloadGoogleOAuth = await this.verifyGoogleAcc(idToken);

    if (!email_verified || !email || !username)
      throw new BadRequestException("Google acc not verified");

    let user = await userModel.findOne({ email });
    if (!user) {
      user = await userModel.create({
        username,
        provider: ProviderEnum.Google,
        email,
        ...(picture && { profilePic: { secure_url: picture } }),
        isConfirmed: true,
      });
    }

    const tokens = getNewLoginCredentials(user);

    return res.status(200).json({ message: "done", data: { tokens } });
  };

  forgetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email }: IGmailDTO = req.body;

    const user = await userModel.findOne({ email });
    if (!user) throw new NotFoundException("User not found");

    if (!user.isConfirmed) throw new BadRequestException("Verify ur account");

    const passwordOTP = user.OTP.find(
      (otp) => otp.type === UserOTPEnum.ForgetPassword,
    );

    if (passwordOTP) {
      if (new Date() < passwordOTP.expiresIn)
        throw new BadRequestException("Use Previous Valid OTP");
    }

    const otp = generateOTP();
    const hashedOTP = await generateHash(otp);
    await userModel.updateOne(
      { email },
      {
        $set: {
          OTP: [
            ...user.OTP.filter(
              (otp) => otp.type !== UserOTPEnum.ForgetPassword,
            ),
            {
              code: hashedOTP,
              type: UserOTPEnum.ForgetPassword,
              expiresIn: new Date(Date.now() + 10 * 60 * 1000),
            },
          ],
        },
      },
    );

    emailEvent.emit("forgetPassword", {
      to: email,
      username: user.username,
      otp,
    });

    return res.status(200).json({ message: "Check ur inbox" });
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp, password }: IResetPasswordDTO = req.body;

    const user = await userModel.findOne({ email });

    if (!user) throw new NotFoundException("User not found");

    if (!user.isConfirmed) throw new BadRequestException("Verify ur account");

    const passwordOTP = user.OTP.find(
      (otp) => otp.type === UserOTPEnum.ForgetPassword,
    );
    if (!passwordOTP) {
      throw new BadRequestException(
        "OTP not found, plz send forget-password request",
      );
    }

    if (new Date() > passwordOTP.expiresIn) {
      await userModel.updateOne(
        { email },
        { $pull: { OTP: { type: UserOTPEnum.ForgetPassword } } },
      );
      throw new BadRequestException(
        "Expired OTP, plz send forget-password request",
      );
    }

    if (!(await compareHash(otp, passwordOTP.code)))
      throw new BadRequestException("Invalid OTP");

    const hashedPassword = await generateHash(password);

    await userModel.updateOne(
      { email },
      {
        password: hashedPassword,
        changeCredentialTime: new Date(),
        $pull: { OTP: { type: UserOTPEnum.ForgetPassword } },
      },
    );

    return res.status(200).json({ message: "done" });
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const tokens = getNewLoginCredentials(req.user!);

    return res.status(200).json({ message: "done", data: { tokens } });
  };

  //   login = async (req: Request, res: Response): Promise<Response> => {
  //     return res.status(200).json({message: ""})
  //   }
}

export default new AuthService();
