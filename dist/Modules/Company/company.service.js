"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const company_model_1 = require("../../DB/Models/company.model");
const error_response_1 = require("../../Utils/response/error.response");
const cloudinary_multer_1 = __importDefault(require("../../Utils/multer/cloudinary.multer"));
const user_model_1 = require("../../DB/Models/user.model");
const user_enum_1 = require("../../Utils/enums/user.enum");
const job_enum_1 = require("../../Utils/enums/job.enum");
class CompanyServices {
    constructor() { }
    addCompany = async (req, res) => {
        const { email, name, industry, address, description, numberOfEmployees, } = req.body;
        const isExist = await company_model_1.companyModel.findOne({
            $or: [{ name }, { email }],
        });
        if (isExist?.name)
            throw new error_response_1.ConflictException("Company name already exist!!!");
        if (isExist?.email)
            throw new error_response_1.ConflictException("Company email already exist!!!");
        const file = req.file;
        if (!file)
            throw new error_response_1.NotFoundException("Upload company legal attachment");
        console.log(file);
        const { public_id, secure_url } = await cloudinary_multer_1.default.uploader.upload(file.path);
        if (!public_id || !secure_url)
            throw new error_response_1.BadRequestException("Failed uploading legal attachment, plz try later");
        await company_model_1.companyModel.create({
            createdBy: req.user._id,
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
    updateCompanyData = async (req, res) => {
        const { id } = req.params;
        const { email, name, industry, address, description, numberOfEmployees, addHr, deleteHr, } = req.body;
        if (!email &&
            !name &&
            !industry &&
            !address &&
            !description &&
            !numberOfEmployees &&
            !addHr &&
            !deleteHr)
            throw new error_response_1.NotFoundException("Type any data to update");
        const company = await company_model_1.companyModel.findOne({
            _id: id,
            createdBy: req.user.id,
        });
        if (!company)
            throw new error_response_1.NotFoundException("Company not found");
        if (name) {
            const isNameExist = await company_model_1.companyModel.findOne({
                _id: { $ne: id },
                name,
            });
            if (isNameExist)
                throw new error_response_1.BadRequestException("Name already exist. Try another");
        }
        if (email) {
            const isEmailExist = await company_model_1.companyModel.findOne({
                _id: { $ne: id },
                email,
            });
            if (isEmailExist)
                throw new error_response_1.BadRequestException("Email already exist. Try another");
        }
        if (addHr) {
            const user = await user_model_1.userModel.findById(addHr);
            if (!user)
                throw new error_response_1.NotFoundException("Can't add HR as user not found");
        }
        await company_model_1.companyModel.updateOne({ _id: company._id }, {
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
        });
        if (deleteHr) {
            await company.updateOne({ $pull: { HRs: deleteHr } });
        }
        return res.status(200).json({ message: "Updated successfully" });
    };
    softDeleteCompany = async (req, res) => {
        const { id } = req.params;
        const company = await company_model_1.companyModel.findById(id);
        if (!company)
            throw new error_response_1.NotFoundException("Company not found");
        if (company.createdBy.toString() !== req.user.id.toString() &&
            req.user.role !== user_enum_1.RoleEnum.Admin)
            throw new error_response_1.ForbiddenException("U aren't authorized to delete this company");
        if (company?.deletedAt)
            throw new error_response_1.ConflictException("Company already deleted before");
        company.deletedAt = new Date();
        await company.save();
        return res.status(200).json({ message: "Company deleted successfully" });
    };
    companyJobs = async (req, res) => {
        const { id } = req.params;
        const company = await company_model_1.companyModel.findById(id).populate({
            path: "jobs",
            transform: (job) => ({
                ...job.toObject(), // toObject to return only mongo document without unnecessary data
                // bottom data overwrite on job document
                location: job_enum_1.JobLocationEnum[job.location],
                workingTime: job_enum_1.JobWorkingTimeEnum[job.workingTime],
                seniorityLevel: job_enum_1.JobSeniorityLevelEnum[job.seniorityLevel],
            }),
        });
        if (!company || company.deletedAt)
            throw new error_response_1.NotFoundException("Company not found");
        return res.status(200).json({ message: "done", data: { company } });
    };
    getCompanyByName = async (req, res) => {
        const { name } = req.body;
        const company = await company_model_1.companyModel.find({
            name: { $regex: name, $options: "i" },
        });
        // regex as I give part of company name like "micro", DB search and return existing "microsoft" company if it exists
        // $options: "i" => means insensitive letter search
        return res.status(200).json({ message: "done", data: { company } });
    };
    uploadLogo = async (req, res) => {
        const { id } = req.params;
        const file = req.file;
        if (!file)
            throw new error_response_1.NotFoundException("Upload ur image, plz");
        const company = await company_model_1.companyModel.findOne({
            _id: id,
            createdBy: req.user._id,
        });
        if (!company || company.deletedAt)
            throw new error_response_1.NotFoundException("Company not found");
        // if there is oldest photo replace it, else put newest it in specific folder
        const options = company.logo?.public_id
            ? { public_id: company.logo?.public_id, overwrite: true }
            : { folder: `Company/${company._id}/logo` };
        const { public_id, secure_url } = await cloudinary_multer_1.default.uploader.upload(file.path, options);
        if (!public_id || !secure_url)
            throw new error_response_1.BadRequestException("Failed to upload logo");
        company.logo = { public_id, secure_url };
        await company.save();
        return res.status(200).json({
            message: "done",
            data: { logo: company.logo.secure_url },
        });
    };
    uploadCoverPic = async (req, res) => {
        const { id } = req.params;
        const file = req.file;
        if (!file)
            throw new error_response_1.NotFoundException("Upload ur image, plz");
        const company = await company_model_1.companyModel.findOne({
            _id: id,
            createdBy: req.user._id,
        });
        if (!company || company.deletedAt)
            throw new error_response_1.BadRequestException("Company not found");
        // if there is oldest photo replace it, else put newest it in specific folder
        const options = company.coverPic?.public_id
            ? { public_id: company.coverPic?.public_id, overwrite: true }
            : { folder: `Company/${company._id}/coverPic` };
        const { public_id, secure_url } = await cloudinary_multer_1.default.uploader.upload(file.path, options);
        if (!public_id || !secure_url)
            throw new error_response_1.BadRequestException("Failed to upload cover picture");
        company.coverPic = { public_id, secure_url };
        await company.save();
        return res.status(200).json({
            message: "done",
            data: { coverPic: company.coverPic.secure_url },
        });
    };
    deleteLogo = async (req, res) => {
        const { id } = req.params;
        const company = await company_model_1.companyModel.findOne({
            _id: id,
            createdBy: req.user.id,
        });
        if (!company)
            throw new error_response_1.NotFoundException("Company not found");
        if (company.logo?.public_id) {
            await cloudinary_multer_1.default.uploader.destroy(company.logo.public_id);
            await company_model_1.companyModel.updateOne({ _id: company._id }, { $unset: { logo: true } });
        }
        return res.status(200).json({ message: "done" });
    };
    deleteCoverPic = async (req, res) => {
        const { id } = req.params;
        const company = await company_model_1.companyModel.findOne({
            _id: id,
            createdBy: req.user.id,
        });
        if (!company)
            throw new error_response_1.NotFoundException("Company not found");
        if (company.coverPic?.public_id) {
            await cloudinary_multer_1.default.uploader.destroy(company.coverPic.public_id);
            await company_model_1.companyModel.updateOne({ _id: company._id }, { $unset: { coverPic: true } });
        }
        return res.status(200).json({ message: "done" });
    };
}
exports.default = new CompanyServices();
