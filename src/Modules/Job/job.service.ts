import { Request, Response } from "express";
import {
  IAddJobDTO,
  IApplicationIdDTO,
  IAppStatusDTO,
  ICompanyJobParamsDTO,
  ICompanyJobQueryDTO,
  IJobApplicationsDTO,
  IJobIdDTO,
  IJobsFilterDTO,
  IUpdateJobDTO,
} from "./job.dto";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../../Utils/response/error.response";
import { companyModel } from "../../DB/Models/company.model";
import { jobModel } from "../../DB/Models/job.model";
import {
  JobLocationEnum,
  JobSeniorityLevelEnum,
  JobWorkingTimeEnum,
} from "../../Utils/enums/job.enum";
import { applicationModel } from "../../DB/Models/application.model";
import { ApplicationStatusEnum } from "../../Utils/enums/application.enum";
import emailEvent from "../../Utils/events/email.event";
import { userModel } from "../../DB/Models/user.model";
import mongoose from "mongoose";
// import mongoose from "mongoose";

class JobService {
  constructor() {}

  addJob = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!._id;
    const {
      title,
      location,
      workingTime,
      seniorityLevel,
      description,
      technicalSkills,
      softSkills,
      companyId,
    }: IAddJobDTO = req.body;

    const company = await companyModel.findById(companyId);

    if (!company || company.deletedAt)
      throw new NotFoundException("Company not found");

    if (
      company.createdBy.toString() !== userId.toString() &&
      !company.HRs.includes(userId)
    )
      throw new ForbiddenException("Unauthorized action!!!");

    if (!company.isAdminApproved)
      throw new BadRequestException(
        "Can't add job until admin activate company",
      );

    await jobModel.create({
      title,
      location: JobLocationEnum[location as keyof typeof JobLocationEnum],
      workingTime:
        JobWorkingTimeEnum[workingTime as keyof typeof JobWorkingTimeEnum],
      seniorityLevel:
        JobSeniorityLevelEnum[
          seniorityLevel as keyof typeof JobSeniorityLevelEnum
        ],
      description,
      technicalSkills,
      ...(softSkills && { softSkills }),
      addedBy: userId,
      companyId,
    });

    return res.status(201).json({ message: "Job created successfully" });
  };

  updateJob = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!._id;
    const { id }: IJobIdDTO = req.params as { id: string };
    const {
      closed,
      description,
      location,
      seniorityLevel,
      softSkills,
      technicalSkills,
      title,
      workingTime,
    }: IUpdateJobDTO = req.body;

    if (
      closed === undefined &&
      description === undefined &&
      location === undefined &&
      seniorityLevel === undefined &&
      softSkills === undefined &&
      technicalSkills === undefined &&
      title === undefined &&
      workingTime === undefined
    ) {
      throw new BadRequestException("Type any data to update job");
    }

    const job = await jobModel.findById(id);
    if (!job) throw new NotFoundException("Job not found");

    const company = await companyModel.findById(job?.companyId);
    if (!company || company.deletedAt)
      throw new NotFoundException("Company not found or deleted");

    if (
      company?.createdBy !== userId &&
      !company?.HRs.some((hr) => hr.equals(userId))
    )
      throw new UnauthorizedException("Unauthorized action!!!");

    await jobModel.updateOne(
      { _id: job._id },
      {
        updatedBy: userId,
        ...(closed !== undefined && { closed }),
        ...(description && { description }),
        ...(location && { location }),
        ...(seniorityLevel && {
          seniorityLevel:
            JobSeniorityLevelEnum[
              seniorityLevel as keyof typeof JobSeniorityLevelEnum
            ],
        }),
        ...(softSkills && { softSkills }),
        ...(technicalSkills && { technicalSkills }),
        ...(title && { title }),
        ...(workingTime && {
          workingTime:
            JobWorkingTimeEnum[workingTime as keyof typeof JobWorkingTimeEnum],
        }),

        $inc: { __v: 1 },
      },
    );

    return res.status(200).json({ message: "done" });
  };

  deleteJob = async (req: Request, res: Response): Promise<Response> => {
    const { id }: IJobIdDTO = req.params as { id: string };
    const userId = req.user!._id;

    const job = await jobModel.findById(id);
    if (!job) throw new NotFoundException("Job not found");

    const company = await companyModel.findOne({ _id: job.companyId });
    if (!company) throw new NotFoundException("Company not found");

    if (
      company.createdBy.toString() !== userId.toString() &&
      !company.HRs.some((hr) => hr.equals(userId))
    )
      throw new ForbiddenException("Unauthorized action");

    await jobModel.deleteOne({ _id: id });

    return res.status(200).json({ message: "Job deleted successfully" });
  };

  getFilteredJobs = async (req: Request, res: Response): Promise<Response> => {
    const {
      page = 1,
      limit = 10,
      workingTime,
      jobLocation,
      seniorityLevel,
      jobTitle,
      technicalSkills,
    }: IJobsFilterDTO = req.query;

    const skip = (page - 1) * limit;

    const filter = {
      ...(workingTime && {
        workingTime:
          JobWorkingTimeEnum[workingTime as keyof typeof JobWorkingTimeEnum],
      }),
      ...(jobLocation && {
        location: JobLocationEnum[jobLocation as keyof typeof JobLocationEnum],
      }),
      ...(seniorityLevel && {
        seniorityLevel:
          JobSeniorityLevelEnum[
            seniorityLevel as keyof typeof JobSeniorityLevelEnum
          ],
      }),
      ...(jobTitle && { title: { $regex: jobTitle, $options: "i" } }),
      ...(technicalSkills && {
        technicalSkills: { $in: technicalSkills.split(",") },
      }),
    };

    const [jobs, total] = await Promise.all([
      jobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      jobModel.countDocuments(filter),
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

  jobApplications = async (req: Request, res: Response): Promise<Response> => {
    const { id }: IJobIdDTO = req.params as { id: string };
    const { page = 1, limit = 15 }: IJobApplicationsDTO = req.query;
    const userId = req.user!._id;

    const skip = (page - 1) * limit;

    const [job, total] = await Promise.all([
      jobModel.findById(id).populate({
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
      applicationModel.countDocuments({ jobId: id }),
    ]);

    if (!job) throw new NotFoundException("Job not found");

    const company = await companyModel.findById(job.companyId);

    if (
      company?.createdBy.toString() !== userId.toString() &&
      !company?.HRs.some((hr) => hr._id.equals(userId))
    )
      throw new UnauthorizedException("Unauthorized action!!!");

    if (company?.deletedAt) throw new NotFoundException("Company is deleted");

    return res.status(200).json({
      message: "done",
      data: {
        pagination: { pages: Math.ceil(total / limit), page, limit, total },
        job,
      },
    });
  };

  acceptOrRejectApplicant = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { acceptance }: IAppStatusDTO = req.body as { acceptance: boolean };
    const { id }: IApplicationIdDTO = req.params as { id: string };
    const userId = req.user!._id;

    const application = await applicationModel.findById(id);
    if (!application) throw new NotFoundException("Application not found");

    const job = await jobModel.findById(application.jobId);
    if (!job) throw new NotFoundException("Job not found");

    const company = await companyModel.findById(job.companyId);
    if (!company || company.deletedAt)
      throw new NotFoundException("Company not found or deleted");

    if (
      company.createdBy.toString() !== userId.toString() &&
      !company?.HRs.some((hr) => hr.equals(userId))
    )
      throw new UnauthorizedException("Unauthorized action!!!");

    await applicationModel.updateOne(
      { _id: id },
      {
        status:
          acceptance == true
            ? ApplicationStatusEnum.Accepted
            : ApplicationStatusEnum.Rejected,
      },
    );

    const applicant = await userModel.findById(application.userId);
    if (!applicant) throw new NotFoundException("Applicant not found");

    if (acceptance === true)
      emailEvent.emit("applicationAccepted", {
        to: applicant.email,
        username: applicant.username,
      });
    if (acceptance === false)
      emailEvent.emit("applicationRejected", {
        to: applicant.email,
        username: applicant.username,
      });

    return res.status(200).json({ message: "done" });
  };

  getCompanyJobs = async (req: Request, res: Response): Promise<Response> => {
    const { companySrch, jobId }: ICompanyJobParamsDTO = req.params as {
      companySrch: string;
      jobId?: string;
    };
    const { limit = 20, page = 1 }: ICompanyJobQueryDTO = req.query as {
      limit?: number;
      page?: number;
    };

    const company = mongoose.Types.ObjectId.isValid(companySrch)
      ? await companyModel.findById(companySrch)
      : await companyModel.findOne({
          name: { $regex: companySrch, $options: "i" },
        });

    if (!company || company.deletedAt)
      throw new NotFoundException("Company not found");

    if (jobId) {
      const job = await jobModel.findOne({
        _id: jobId,
        companyId: company._id,
      });
      if (!job) throw new NotFoundException("Job not found");

      return res.status(200).json({ message: "done", data: { company, job } });
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      jobModel
        .find({ companyId: company._id })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      jobModel.countDocuments({ companyId: company._id }),
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

  // addJob = async (req: Request, res: Response): Promise<Response> => {
  //     return res.status(200).json({message: ""})
  // }
}

export default new JobService();
