"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utils/response/error.response");
const encryption_security_1 = require("../../Utils/security/encryption.security");
const user_model_1 = require("../../DB/Models/user.model");
const user_enum_1 = require("../../Utils/enums/user.enum");
const hash_security_1 = require("../../Utils/security/hash.security");
const cloudinary_multer_1 = __importDefault(require("../../Utils/multer/cloudinary.multer"));
class UserService {
    constructor() { }
    updateAcc = async (req, res) => {
        const { firstName, lastName, DOB, gender, mobileNumber } = req.body;
        if (!firstName && !lastName && !DOB && !gender && !mobileNumber)
            throw new error_response_1.BadRequestException("Type 'firstName' | 'lastName' | 'DOB' | 'gender' | 'mobileNumber' to update");
        let encryptedPhone = null;
        if (mobileNumber)
            encryptedPhone = (0, encryption_security_1.encrypt)(mobileNumber);
        await user_model_1.userModel.updateOne({ _id: req.user._id }, {
            $set: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(DOB && { DOB: new Date(DOB) }),
                ...(gender !== undefined && {
                    gender: user_enum_1.GenderEnum[gender],
                }),
                ...(mobileNumber && { mobileNumber: encryptedPhone }),
            },
            $inc: { __v: 1 },
        });
        return res.status(200).json({ message: "Updated" });
    };
    getLoginUser = async (req, res) => {
        const user = req.user;
        return res.status(200).json({ message: "done", data: { user } });
    };
    getProfile = async (req, res) => {
        const { id } = req.params;
        const user = await user_model_1.userModel
            .findOne({ _id: id })
            .select("firstName lastName username mobileNumber profilePic coverPic");
        if (!user || user.deletedAt)
            throw new error_response_1.NotFoundException("User not found");
        return res.status(200).json({ message: "done", data: { user } });
    };
    updatePassword = async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        const user = req.user;
        const isMatch = await (0, hash_security_1.compareHash)(oldPassword, user.password);
        if (!isMatch)
            throw new error_response_1.UnauthorizedException("Incorrect password");
        user.password = newPassword; // pre save will hash it
        user.changeCredentialTime = new Date();
        await user.save();
        return res.status(200).json({ message: "done" });
    };
    softDeleteAcc = async (req, res) => {
        const user = req.user;
        user.deletedAt = new Date();
        await user.save();
        return res.status(200).json({ message: "Account deleted successfully" });
    };
    uploadProfilePic = async (req, res) => {
        const file = req.file;
        if (!file)
            throw new error_response_1.NotFoundException("Upload ur image, plz");
        const user = req.user;
        // if there is oldest photo replace it, else put newest it in specific folder
        const options = user.profilePic?.public_id
            ? { public_id: user.profilePic.public_id, overwrite: true }
            : { folder: `users/${user._id}/profilePic` };
        const { public_id, secure_url } = await cloudinary_multer_1.default.uploader.upload(file.path, options);
        if (!public_id || !secure_url)
            throw new error_response_1.BadRequestException("Failed to upload profile picture");
        user.profilePic = { public_id, secure_url };
        await user.save();
        return res.status(200).json({
            message: "done",
            data: { profilePic: user.profilePic.secure_url },
        });
    };
    uploadCoverPic = async (req, res) => {
        const file = req.file;
        if (!file)
            throw new error_response_1.NotFoundException("Upload ur image, plz");
        const user = req.user;
        // if there is oldest photo replace it, else put newest it in specific folder
        const options = user.coverPic?.public_id
            ? { public_id: user.coverPic.public_id, overwrite: true }
            : { folder: `users/${user._id}/coverPic` };
        const { public_id, secure_url } = await cloudinary_multer_1.default.uploader.upload(file.path, options);
        if (!public_id || !secure_url)
            throw new error_response_1.BadRequestException("Failed to upload cover picture");
        user.coverPic = { public_id, secure_url };
        await user.save();
        return res.status(200).json({
            message: "done",
            data: { coverPic: user.coverPic.secure_url },
        });
    };
    deleteCoverPic = async (req, res) => {
        const user = req.user;
        if (user.coverPic.public_id) {
            await cloudinary_multer_1.default.uploader.destroy(user.coverPic.public_id);
            await user_model_1.userModel.updateOne({ _id: user._id }, { $unset: { coverPic: true } });
        }
        return res.status(200).json({ message: "done" });
    };
    deleteProfilePic = async (req, res) => {
        const user = req.user;
        if (user.profilePic.public_id) {
            await cloudinary_multer_1.default.uploader.destroy(user.profilePic.public_id);
            await user_model_1.userModel.updateOne({ _id: user._id }, { $unset: { profilePic: true } });
        }
        return res.status(200).json({ message: "done" });
    };
}
exports.default = new UserService();
