"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_1 = require("../../Utils/response/error.response");
const company_model_1 = require("../../DB/Models/company.model");
const job_model_1 = require("../../DB/Models/job.model");
const job_enum_1 = require("../../Utils/enums/job.enum");
const application_model_1 = require("../../DB/Models/application.model");
const application_enum_1 = require("../../Utils/enums/application.enum");
const email_event_1 = __importDefault(require("../../Utils/events/email.event"));
const user_model_1 = require("../../DB/Models/user.model");
const mongoose_1 = __importDefault(require("mongoose"));
// import mongoose from "mongoose";
class JobService {
    constructor() { }
    addJob = async (req, res) => {
        const userId = req.user._id;
        const { title, location, workingTime, seniorityLevel, description, technicalSkills, softSkills, companyId, } = req.body;
        const company = await company_model_1.companyModel.findById(companyId);
        if (!company || company.deletedAt)
            throw new error_response_1.NotFoundException("Company not found");
        if (company.createdBy.toString() !== userId.toString() &&
            !company.HRs.includes(userId))
            throw new error_response_1.ForbiddenException("Unauthorized action!!!");
        if (!company.isAdminApproved)
            throw new error_response_1.BadRequestException("Can't add job until admin activate company");
        await job_model_1.jobModel.create({
            title,
            location: job_enum_1.JobLocationEnum[location],
            workingTime: job_enum_1.JobWorkingTimeEnum[workingTime],
            seniorityLevel: job_enum_1.JobSeniorityLevelEnum[seniorityLevel],
            description,
            technicalSkills,
            ...(softSkills && { softSkills }),
            addedBy: userId,
            companyId,
        });
        return res.status(201).json({ message: "Job created successfully" });
    };
    updateJob = async (req, res) => {
        const userId = req.user._id;
        const { id } = req.params;
        const { closed, description, location, seniorityLevel, softSkills, technicalSkills, title, workingTime, } = req.body;
        if (closed === undefined &&
            description === undefined &&
            location === undefined &&
            seniorityLevel === undefined &&
            softSkills === undefined &&
            technicalSkills === undefined &&
            title === undefined &&
            workingTime === undefined) {
            throw new error_response_1.BadRequestException("Type any data to update job");
        }
        const job = await job_model_1.jobModel.findById(id);
        if (!job)
            throw new error_response_1.NotFoundException("Job not found");
        const company = await company_model_1.companyModel.findById(job?.companyId);
        if (!company || company.deletedAt)
            throw new error_response_1.NotFoundException("Company not found or deleted");
        if (company?.createdBy !== userId &&
            !company?.HRs.some((hr) => hr.equals(userId)))
            throw new error_response_1.UnauthorizedException("Unauthorized action!!!");
        await job_model_1.jobModel.updateOne({ _id: job._id }, {
            updatedBy: userId,
            ...(closed !== undefined && { closed }),
            ...(description && { description }),
            ...(location && { location }),
            ...(seniorityLevel && {
                seniorityLevel: job_enum_1.JobSeniorityLevelEnum[seniorityLevel],
            }),
            ...(softSkills && { softSkills }),
            ...(technicalSkills && { technicalSkills }),
            ...(title && { title }),
            ...(workingTime && {
                workingTime: job_enum_1.JobWorkingTimeEnum[workingTime],
            }),
            $inc: { __v: 1 },
        });
        return res.status(200).json({ message: "done" });
    };
    deleteJob = async (req, res) => {
        const { id } = req.params;
        const userId = req.user._id;
        const job = await job_model_1.jobModel.findById(id);
        if (!job)
            throw new error_response_1.NotFoundException("Job not found");
        const company = await company_model_1.companyModel.findOne({ _id: job.companyId });
        if (!company)
            throw new error_response_1.NotFoundException("Company not found");
        if (company.createdBy.toString() !== userId.toString() &&
            !company.HRs.some((hr) => hr.equals(userId)))
            throw new error_response_1.ForbiddenException("Unauthorized action");
        await job_model_1.jobModel.deleteOne({ _id: id });
        return res.status(200).json({ message: "Job deleted successfully" });
    };
    getFilteredJobs = async (req, res) => {
        const { page = 1, limit = 10, workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills, } = req.query;
        const skip = (page - 1) * limit;
        const filter = {
            ...(workingTime && {
                workingTime: job_enum_1.JobWorkingTimeEnum[workingTime],
            }),
            ...(jobLocation && {
                location: job_enum_1.JobLocationEnum[jobLocation],
            }),
            ...(seniorityLevel && {
                seniorityLevel: job_enum_1.JobSeniorityLevelEnum[seniorityLevel],
            }),
            ...(jobTitle && { title: { $regex: jobTitle, $options: "i" } }),
            ...(technicalSkills && {
                technicalSkills: { $in: technicalSkills.split(",") },
            }),
        };
        const [jobs, total] = await Promise.all([
            job_model_1.jobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            job_model_1.jobModel.countDocuments(filter),
        ]);
        return res.status(200).json({
            message: "done",
            data: {
                jobs,
                pagination: {
                    pages: Math.ceil(total / limit),
                    page,
                    total,
                    limit,
                },
            },
        });
    };
    jobApplications = async (req, res) => {
        const { id } = req.params;
        const { page = 1, limit = 15 } = req.query;
        const userId = req.user._id;
        const skip = (page - 1) * limit;
        const [job, total] = await Promise.all([
            job_model_1.jobModel.findById(id).populate({
                path: "applications",
                options: {
                    skip,
                    limit,
                    sort: { createdAt: 1 },
                },
                populate: {
                    path: "userId",
                    select: "-username -isConfirmed -createdAt -updatedAt -__v",
                },
            }),
            application_model_1.applicationModel.countDocuments({ jobId: id }),
        ]);
        if (!job)
            throw new error_response_1.NotFoundException("Job not found");
        const company = await company_model_1.companyModel.findById(job.companyId);
        if (company?.createdBy.toString() !== userId.toString() &&
            !company?.HRs.some((hr) => hr._id.equals(userId)))
            throw new error_response_1.UnauthorizedException("Unauthorized action!!!");
        if (company?.deletedAt)
            throw new error_response_1.NotFoundException("Company is deleted");
        return res.status(200).json({
            message: "done",
            data: {
                pagination: { pages: Math.ceil(total / limit), page, limit, total },
                job,
            },
        });
    };
    acceptOrRejectApplicant = async (req, res) => {
        const { acceptance } = req.body;
        const { id } = req.params;
        const userId = req.user._id;
        const application = await application_model_1.applicationModel.findById(id);
        if (!application)
            throw new error_response_1.NotFoundException("Application not found");
        const job = await job_model_1.jobModel.findById(application.jobId);
        if (!job)
            throw new error_response_1.NotFoundException("Job not found");
        const company = await company_model_1.companyModel.findById(job.companyId);
        if (!company || company.deletedAt)
            throw new error_response_1.NotFoundException("Company not found or deleted");
        if (company.createdBy.toString() !== userId.toString() &&
            !company?.HRs.some((hr) => hr.equals(userId)))
            throw new error_response_1.UnauthorizedException("Unauthorized action!!!");
        await application_model_1.applicationModel.updateOne({ _id: id }, {
            status: acceptance == true
                ? application_enum_1.ApplicationStatusEnum.Accepted
                : application_enum_1.ApplicationStatusEnum.Rejected,
        });
        const applicant = await user_model_1.userModel.findById(application.userId);
        if (!applicant)
            throw new error_response_1.NotFoundException("Applicant not found");
        if (acceptance === true)
            email_event_1.default.emit("applicationAccepted", {
                to: applicant.email,
                username: applicant.username,
            });
        if (acceptance === false)
            email_event_1.default.emit("applicationRejected", {
                to: applicant.email,
                username: applicant.username,
            });
        return res.status(200).json({ message: "done" });
    };
    getCompanyJobs = async (req, res) => {
        const { companySrch, jobId } = req.params;
        const { limit = 20, page = 1 } = req.query;
        const company = mongoose_1.default.Types.ObjectId.isValid(companySrch)
            ? await company_model_1.companyModel.findById(companySrch)
            : await company_model_1.companyModel.findOne({
                name: { $regex: companySrch, $options: "i" },
            });
        if (!company || company.deletedAt)
            throw new error_response_1.NotFoundException("Company not found");
        if (jobId) {
            const job = await job_model_1.jobModel.findOne({
                _id: jobId,
                companyId: company._id,
            });
            if (!job)
                throw new error_response_1.NotFoundException("Job not found");
            return res.status(200).json({ message: "done", data: { company, job } });
        }
        const skip = (page - 1) * limit;
        const [jobs, total] = await Promise.all([
            job_model_1.jobModel
                .find({ companyId: company._id })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            job_model_1.jobModel.countDocuments({ companyId: company._id }),
        ]);
        return res.status(200).json({
            message: "done",
            data: {
                pagination: { pages: Math.ceil(total / limit), page, limit, total },
                company,
                jobs,
            },
        });
    };
}
exports.default = new JobService();
