import { Request, Response } from "express-serve-static-core";
import {
  IAddCompanyDTO,
  ICompanyIdDTO,
  ICompanyNameDTO,
  IUpdateCompanyDTO,
} from "./company.dto";
import { companyModel } from "../../DB/Models/company.model";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../../Utils/response/error.response";
import cloudinary from "../../Utils/multer/cloudinary.multer";
import { userModel } from "../../DB/Models/user.model";
import { RoleEnum } from "../../Utils/enums/user.enum";
import {
  JobLocationEnum,
  JobSeniorityLevelEnum,
  JobWorkingTimeEnum,
} from "../../Utils/enums/job.enum";
import { UploadApiOptions } from "cloudinary";

class CompanyServices {
  constructor() {}

  addCompany = async (req: Request, res: Response): Promise<Response> => {
    const {
      email,
      name,
      industry,
      address,
      description,
      numberOfEmployees,
    }: IAddCompanyDTO = req.body;

    const isExist = await companyModel.findOne({
      $or: [{ name }, { email }],
    });

    if (isExist?.name)
      throw new ConflictException("Company name already exist!!!");
    if (isExist?.email)
      throw new ConflictException("Company email already exist!!!");

    const file = req.file;
    if (!file) throw new NotFoundException("Upload company legal attachment");

    console.log(file);

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
    );
    if (!public_id || !secure_url)
      throw new BadRequestException(
        "Failed uploading legal attachment, plz try later",
      );

    await companyModel.create({
      createdBy: req.user!._id,
      name,
      email,
      ...(description && { description }),
      industry,
      ...(address && { address }),
      ...(numberOfEmployees && {
        numberOfEmployees: {
          min: numberOfEmployees.min,
          max: numberOfEmployees.max,
        },
      }),
      legalAttachment: { public_id, secure_url },
    });

    return res
      .status(201)
      .json({ message: "done, wait until admin check & active ur company" });
  };

  updateCompanyData = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { id }: ICompanyIdDTO = req.params as { id: string };
    const {
      email,
      name,
      industry,
      address,
      description,
      numberOfEmployees,
      addHr,
      deleteHr,
    }: IUpdateCompanyDTO = req.body;

    if (
      !email &&
      !name &&
      !industry &&
      !address &&
      !description &&
      !numberOfEmployees &&
      !addHr &&
      !deleteHr
    )
      throw new NotFoundException("Type any data to update");

    const company = await companyModel.findOne({
      _id: id,
      createdBy: req.user!.id,
    });
    if (!company) throw new NotFoundException("Company not found");

    if (name) {
      const isNameExist = await companyModel.findOne({
        _id: { $ne: id },
        name,
      });
      if (isNameExist)
        throw new BadRequestException("Name already exist. Try another");
    }
    if (email) {
      const isEmailExist = await companyModel.findOne({
        _id: { $ne: id },
        email,
      });
      if (isEmailExist)
        throw new BadRequestException("Email already exist. Try another");
    }
    if (addHr) {
      const user = await userModel.findById(addHr);
      if (!user) throw new NotFoundException("Can't add HR as user not found");
    }

    await companyModel.updateOne(
      { _id: company._id },
      {
        ...(email && { email }),
        ...(name && { name }),
        ...(industry && { industry }),
        ...(address && { address }),
        ...(description && { description }),
        ...(numberOfEmployees && {
          numberOfEmployees: {
            min: numberOfEmployees.min,
            max: numberOfEmployees.max,
          },
        }),
        ...(addHr && { $addToSet: { HRs: addHr } }),
      },
    );

    if (deleteHr) {
      await company.updateOne({ $pull: { HRs: deleteHr } });
    }

    return res.status(200).json({ message: "Updated successfully" });
  };

  softDeleteCompany = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { id }: ICompanyIdDTO = req.params as { id: string };
    const company = await companyModel.findById(id);

    if (!company) throw new NotFoundException("Company not found");

    if (
      company.createdBy.toString() !== req.user!.id.toString() &&
      req.user!.role !== RoleEnum.Admin
    )
      throw new ForbiddenException(
        "U aren't authorized to delete this company",
      );

    if (company?.deletedAt)
      throw new ConflictException("Company already deleted before");

    company.deletedAt = new Date();
    await company.save();

    return res.status(200).json({ message: "Company deleted successfully" });
  };

  companyJobs = async (req: Request, res: Response): Promise<Response> => {
    const { id }: ICompanyIdDTO = req.params as { id: string };

    const company = await companyModel.findById(id).populate({
      path: "jobs",
      transform: (job) => ({
        ...job.toObject(), // toObject to return only mongo document without unnecessary data
        // bottom data overwrite on job document
        location: JobLocationEnum[job.location],
        workingTime: JobWorkingTimeEnum[job.workingTime],
        seniorityLevel: JobSeniorityLevelEnum[job.seniorityLevel],
      }),
    });
    if (!company || company.deletedAt)
      throw new NotFoundException("Company not found");

    return res.status(200).json({ message: "done", data: { company } });
  };

  getCompanyByName = async (req: Request, res: Response): Promise<Response> => {
    const { name }: ICompanyNameDTO = req.body;

    const company = await companyModel.find({
      name: { $regex: name, $options: "i" },
    });
    // regex as I give part of company name like "micro", DB search and return existing "microsoft" company if it exists
    // $options: "i" => means insensitive letter search

    return res.status(200).json({ message: "done", data: { company } });
  };

  uploadLogo = async (req: Request, res: Response): Promise<Response> => {
    const { id }: ICompanyIdDTO = req.params as { id: string };
    const file = req.file;
    if (!file) throw new NotFoundException("Upload ur image, plz");

    const company = await companyModel.findOne({
      _id: id,
      createdBy: req.user!._id,
    });
    if (!company || company.deletedAt)
      throw new NotFoundException("Company not found");

    // if there is oldest photo replace it, else put newest it in specific folder
    const options: UploadApiOptions = company.logo?.public_id
      ? { public_id: company.logo?.public_id, overwrite: true }
      : { folder: `Company/${company._id}/logo` };

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      options,
    );
    if (!public_id || !secure_url)
      throw new BadRequestException("Failed to upload logo");

    company.logo = { public_id, secure_url };
    await company.save();

    return res.status(200).json({
      message: "done",
      data: { logo: company.logo.secure_url },
    });
  };

  uploadCoverPic = async (req: Request, res: Response): Promise<Response> => {
    const { id }: ICompanyIdDTO = req.params as { id: string };
    const file = req.file;
    if (!file) throw new NotFoundException("Upload ur image, plz");

    const company = await companyModel.findOne({
      _id: id,
      createdBy: req.user!._id,
    });
    if (!company || company.deletedAt)
      throw new BadRequestException("Company not found");

    // if there is oldest photo replace it, else put newest it in specific folder
    const options: UploadApiOptions = company.coverPic?.public_id
      ? { public_id: company.coverPic?.public_id, overwrite: true }
      : { folder: `Company/${company._id}/coverPic` };

    const { public_id, secure_url } = await cloudinary.uploader.upload(
      file.path,
      options,
    );
    if (!public_id || !secure_url)
      throw new BadRequestException("Failed to upload cover picture");

    company.coverPic = { public_id, secure_url };
    await company.save();

    return res.status(200).json({
      message: "done",
      data: { coverPic: company.coverPic.secure_url },
    });
  };

  deleteLogo = async (req: Request, res: Response): Promise<Response> => {
    const { id }: ICompanyIdDTO = req.params as { id: string };

    const company = await companyModel.findOne({
      _id: id,
      createdBy: req.user!.id,
    });
    if (!company) throw new NotFoundException("Company not found");

    if (company.logo?.public_id) {
      await cloudinary.uploader.destroy(company.logo.public_id);
      await companyModel.updateOne(
        { _id: company._id },
        { $unset: { logo: true } },
      );
    }

    return res.status(200).json({ message: "done" });
  };

  deleteCoverPic = async (req: Request, res: Response): Promise<Response> => {
    const { id }: ICompanyIdDTO = req.params as { id: string };

    const company = await companyModel.findOne({
      _id: id,
      createdBy: req.user!.id,
    });
    if (!company) throw new NotFoundException("Company not found");

    if (company.coverPic?.public_id) {
      await cloudinary.uploader.destroy(company.coverPic.public_id);
      await companyModel.updateOne(
        { _id: company._id },
        { $unset: { coverPic: true } },
      );
    }

    return res.status(200).json({ message: "done" });
  };
}

export default new CompanyServices();
