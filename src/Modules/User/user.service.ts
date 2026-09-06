import { Request, Response } from "express";
import { IUpdateAccDTO, IUpdatePasswordDTO, IUserIdDTO } from "./user.dto";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/response/error.response";
import { encrypt } from "../../Utils/security/encryption.security";
import { userModel } from "../../DB/Models/user.model";
import { GenderEnum } from "../../Utils/enums/user.enum";
import { compareHash } from "../../Utils/security/hash.security";
import cloudinary from "../../Utils/multer/cloudinary.multer";
import { UploadApiOptions } from "cloudinary";

class UserService {
  constructor() {}

  updateAcc = async (req: Request, res: Response): Promise<Response> => {
    const { firstName, lastName, DOB, gender, mobileNumber }: IUpdateAccDTO =
      req.body;

    if (!firstName && !lastName && !DOB && !gender && !mobileNumber)
      throw new BadRequestException(
        "Type 'firstName' | 'lastName' | 'DOB' | 'gender' | 'mobileNumber' to update",
      );

    let encryptedPhone = null;
    if (mobileNumber) encryptedPhone = encrypt(mobileNumber);

    await userModel.updateOne(
      { _id: req.user!._id },
      {
        $set: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(DOB && { DOB: new Date(DOB) }),
          ...(gender !== undefined && {
            gender: GenderEnum[gender as keyof typeof GenderEnum],
          }),
          ...(mobileNumber && { mobileNumber: encryptedPhone }),
        },
        $inc: { __v: 1 },
      },
    );

    return res.status(200).json({ message: "Updated" });
  };

  getLoginUser = async (req: Request, res: Response): Promise<Response> => {
    const user = req.user;
    return res.status(200).json({ message: "done", data: { user } });
  };

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    const { id }: IUserIdDTO = req.params as { id: string };

    const user = await userModel
      .findOne({ _id: id })
      .select("firstName lastName username mobileNumber profilePic coverPic");

    if (!user || user.deletedAt) throw new NotFoundException("User not found");

    return res.status(200).json({ message: "done", data: { user } });
  };

  updatePassword = async (req: Request, res: Response): Promise<Response> => {
    const { oldPassword, newPassword }: IUpdatePasswordDTO = req.body;

    const user = req.user!;

    const isMatch = await compareHash(oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException("Incorrect password");

    user.password = newPassword; // pre save will hash it
    user.changeCredentialTime = new Date();
    await user.save();

    return res.status(200).json({ message: "done" });
  };

  softDeleteAcc = async (req: Request, res: Response): Promise<Response> => {
    const user = req.user!;

    user.deletedAt = new Date();
    await user.save();

    return res.status(200).json({ message: "Account deleted successfully" });
  };

  uploadProfilePic = async (req: Request, res: Response): Promise<Response> => {
    const file = req.file;
    if (!file) throw new NotFoundException("Upload ur image, plz");

    const user = req.user!;

    // if there is oldest photo replace it, else put newest it in specific folder
    const options: UploadApiOptions = user.profilePic?.public_id
      ? { public_id: user.profilePic.public_id, overwrite: true }
      : { folder: `users/${user._id}/profilePic` };

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      options,
    );
    if (!public_id || !secure_url)
      throw new BadRequestException("Failed to upload profile picture");

    user.profilePic = { public_id, secure_url };
    await user.save();

    return res.status(200).json({
      message: "done",
      data: { profilePic: user.profilePic.secure_url },
    });
  };

  uploadCoverPic = async (req: Request, res: Response): Promise<Response> => {
    const file = req.file;
    if (!file) throw new NotFoundException("Upload ur image, plz");

    const user = req.user!;

    // if there is oldest photo replace it, else put newest it in specific folder
    const options: UploadApiOptions = user.coverPic?.public_id
      ? { public_id: user.coverPic.public_id, overwrite: true }
      : { folder: `users/${user._id}/coverPic` };

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      options,
    );
    if (!public_id || !secure_url)
      throw new BadRequestException("Failed to upload cover picture");

    user.coverPic = { public_id, secure_url };
    await user.save();

    return res.status(200).json({
      message: "done",
      data: { coverPic: user.coverPic.secure_url },
    });
  };

  deleteCoverPic = async (req: Request, res: Response): Promise<Response> => {
    const user = req.user!;

    if (user.coverPic.public_id) {
      await cloudinary.uploader.destroy(user.coverPic.public_id);
      await userModel.updateOne(
        { _id: user._id },
        { $unset: { coverPic: true } },
      );
    }

    return res.status(200).json({ message: "done" });
  };

  deleteProfilePic = async (req: Request, res: Response): Promise<Response> => {
    const user = req.user!;

    if (user.profilePic.public_id) {
      await cloudinary.uploader.destroy(user.profilePic.public_id);
      await userModel.updateOne(
        { _id: user._id },
        { $unset: { profilePic: true } },
      );
    }

    return res.status(200).json({ message: "done" });
  };
}

export default new UserService();
