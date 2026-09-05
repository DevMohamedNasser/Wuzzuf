"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const google_auth_library_1 = require("google-auth-library");
const user_model_1 = require("../../DB/Models/user.model");
const error_response_1 = require("../../Utils/response/error.response");
const generateOTP_1 = __importDefault(require("../../Utils/email/generateOTP"));
const user_enum_1 = require("../../Utils/enums/user.enum");
const email_event_1 = __importDefault(require("../../Utils/events/email.event"));
const hash_security_1 = require("../../Utils/security/hash.security");
const tokens_security_1 = require("../../Utils/security/tokens.security");
const config_service_1 = __importDefault(require("../../Config/config.service"));
class AuthService {
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password, gender, DOB, mobileNumber } = req.body;
        const isExist = await user_model_1.userModel.findOne({ email });
        if (isExist)
            throw new error_response_1.ConflictException("User already exists!!!");
        const otp = (0, generateOTP_1.default)();
        const user = await user_model_1.userModel.create({
            username,
            email,
            password,
            //   gender: gender == "Male" ? 0 : 1,
            gender: user_enum_1.GenderEnum[gender],
            DOB: new Date(DOB),
            mobileNumber,
            OTP: [
                {
                    code: await (0, hash_security_1.generateHash)(otp),
                    type: user_enum_1.UserOTPEnum.ConfirmEmail,
                    /** expires in 10min */
                    expiresIn: new Date(Date.now() + 10 * 60 * 1000),
                },
            ],
            provider: user_enum_1.ProviderEnum.System,
        });
        email_event_1.default.emit("confirmEmail", { to: email, username, otp });
        return res
            .status(201)
            .json({ message: "Check ur inbox & verify account", data: { user } });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const { isAdmin = user_enum_1.RoleEnum.User } = req.query;
        const user = await user_model_1.userModel.findOne({
            email,
            role: isAdmin == user_enum_1.RoleEnum.Admin ? user_enum_1.RoleEnum.Admin : user_enum_1.RoleEnum.User,
        });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        const isAuthorized = await (0, hash_security_1.compareHash)(password, user.password);
        if (!isAuthorized)
            throw new error_response_1.ForbiddenException("Incorrect email or password");
        if (!user.isConfirmed)
            throw new error_response_1.BadRequestException("Account hasn't been verified yet!!!");
        if (user.deletedAt)
            throw new error_response_1.NotFoundException("Account has been deleted");
        if (user.bannedAt)
            throw new error_response_1.BadRequestException("Account is banned, contact admin");
        if (user.provider === user_enum_1.ProviderEnum.Google)
            throw new error_response_1.BadRequestException("Plz login with Google");
        const tokens = (0, tokens_security_1.getNewLoginCredentials)(user);
        return res
            .status(200)
            .json({ message: "Logged in successfully", data: { tokens } });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await user_model_1.userModel.findOne({ email });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (user.isConfirmed)
            throw new error_response_1.BadRequestException("Account already verified");
        const confirmOTP = user.OTP.find((otp) => otp.type === user_enum_1.UserOTPEnum.ConfirmEmail);
        if (!confirmOTP) {
            throw new error_response_1.BadRequestException("OTP not found, plz send confirm OTP request");
        }
        if (new Date() > confirmOTP.expiresIn) {
            await user_model_1.userModel.updateOne({ email }, { $pull: { OTP: { type: user_enum_1.UserOTPEnum.ConfirmEmail } } });
            throw new error_response_1.BadRequestException("Expired OTP, plz send confirm OTP request");
        }
        if (!(await (0, hash_security_1.compareHash)(otp, confirmOTP.code)))
            throw new error_response_1.BadRequestException("Invalid OTP");
        await user_model_1.userModel.updateOne({ email }, { isConfirmed: true, $pull: { OTP: { type: user_enum_1.UserOTPEnum.ConfirmEmail } } });
        return res.status(200).json({ message: "Account confirmed successfully" });
    };
    resendOTP = async (req, res) => {
        const { email } = req.body;
        const user = await user_model_1.userModel.findOne({ email });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (user.isConfirmed)
            throw new error_response_1.BadRequestException("Account already activated");
        const confirmOTP = user.OTP.find((otp) => otp.type === user_enum_1.UserOTPEnum.ConfirmEmail);
        if (confirmOTP) {
            if (new Date() < confirmOTP.expiresIn)
                throw new error_response_1.BadRequestException("Use Previous Valid OTP");
        }
        /**  !confirmOTP || new Date() > confirmOTP.expiresIn (means otp is expired) */
        const otp = (0, generateOTP_1.default)();
        const hashedOTP = await (0, hash_security_1.generateHash)(otp);
        await user_model_1.userModel.updateOne({ email }, {
            $set: {
                OTP: [
                    ...user.OTP.filter((otp) => otp.type !== user_enum_1.UserOTPEnum.ConfirmEmail),
                    {
                        code: hashedOTP,
                        type: user_enum_1.UserOTPEnum.ConfirmEmail,
                        expiresIn: new Date(Date.now() + 10 * 60 * 1000),
                    },
                ],
            },
        });
        email_event_1.default.emit("confirmEmail", {
            to: email,
            username: user.username,
            otp,
        });
        return res.status(200).json({ message: "Check ur inbox" });
    };
    verifyGoogleAcc = async (idToken) => {
        const client = new google_auth_library_1.OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config_service_1.default.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload)
            throw new error_response_1.BadRequestException("Payload isn't defined, try later");
        return payload;
    };
    googleLogin = async (req, res) => {
        const { idToken } = req.body;
        const { email, email_verified, name: username, picture, } = await this.verifyGoogleAcc(idToken);
        if (!email_verified || !email || !username)
            throw new error_response_1.BadRequestException("Google acc not verified");
        let user = await user_model_1.userModel.findOne({ email });
        if (!user) {
            user = await user_model_1.userModel.create({
                username,
                provider: user_enum_1.ProviderEnum.Google,
                email,
                ...(picture && { profilePic: { secure_url: picture } }),
                isConfirmed: true,
            });
        }
        const tokens = (0, tokens_security_1.getNewLoginCredentials)(user);
        return res.status(200).json({ message: "done", data: { tokens } });
    };
    forgetPassword = async (req, res) => {
        const { email } = req.body;
        const user = await user_model_1.userModel.findOne({ email });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (!user.isConfirmed)
            throw new error_response_1.BadRequestException("Verify ur account");
        const passwordOTP = user.OTP.find((otp) => otp.type === user_enum_1.UserOTPEnum.ForgetPassword);
        if (passwordOTP) {
            if (new Date() < passwordOTP.expiresIn)
                throw new error_response_1.BadRequestException("Use Previous Valid OTP");
        }
        const otp = (0, generateOTP_1.default)();
        const hashedOTP = await (0, hash_security_1.generateHash)(otp);
        await user_model_1.userModel.updateOne({ email }, {
            $set: {
                OTP: [
                    ...user.OTP.filter((otp) => otp.type !== user_enum_1.UserOTPEnum.ForgetPassword),
                    {
                        code: hashedOTP,
                        type: user_enum_1.UserOTPEnum.ForgetPassword,
                        expiresIn: new Date(Date.now() + 10 * 60 * 1000),
                    },
                ],
            },
        });
        email_event_1.default.emit("forgetPassword", {
            to: email,
            username: user.username,
            otp,
        });
        return res.status(200).json({ message: "Check ur inbox" });
    };
    resetPassword = async (req, res) => {
        const { email, otp, password } = req.body;
        const user = await user_model_1.userModel.findOne({ email });
        if (!user)
            throw new error_response_1.NotFoundException("User not found");
        if (!user.isConfirmed)
            throw new error_response_1.BadRequestException("Verify ur account");
        const passwordOTP = user.OTP.find((otp) => otp.type === user_enum_1.UserOTPEnum.ForgetPassword);
        if (!passwordOTP) {
            throw new error_response_1.BadRequestException("OTP not found, plz send forget-password request");
        }
        if (new Date() > passwordOTP.expiresIn) {
            await user_model_1.userModel.updateOne({ email }, { $pull: { OTP: { type: user_enum_1.UserOTPEnum.ForgetPassword } } });
            throw new error_response_1.BadRequestException("Expired OTP, plz send forget-password request");
        }
        if (!(await (0, hash_security_1.compareHash)(otp, passwordOTP.code)))
            throw new error_response_1.BadRequestException("Invalid OTP");
        const hashedPassword = await (0, hash_security_1.generateHash)(password);
        await user_model_1.userModel.updateOne({ email }, {
            password: hashedPassword,
            changeCredentialTime: new Date(),
            $pull: { OTP: { type: user_enum_1.UserOTPEnum.ForgetPassword } },
        });
        return res.status(200).json({ message: "done" });
    };
    refreshToken = async (req, res) => {
        const tokens = (0, tokens_security_1.getNewLoginCredentials)(req.user);
        return res.status(200).json({ message: "done", data: { tokens } });
    };
}
exports.default = new AuthService();
