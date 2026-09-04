"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobSeniorityLevelEnum = exports.JobWorkingTimeEnum = exports.JobLocationEnum = void 0;
var JobLocationEnum;
(function (JobLocationEnum) {
    JobLocationEnum[JobLocationEnum["Onsite"] = 0] = "Onsite";
    JobLocationEnum[JobLocationEnum["Remotely"] = 1] = "Remotely";
    JobLocationEnum[JobLocationEnum["Hybrid"] = 2] = "Hybrid";
})(JobLocationEnum || (exports.JobLocationEnum = JobLocationEnum = {}));
var JobWorkingTimeEnum;
(function (JobWorkingTimeEnum) {
    JobWorkingTimeEnum[JobWorkingTimeEnum["PartTime"] = 0] = "PartTime";
    JobWorkingTimeEnum[JobWorkingTimeEnum["FullTime"] = 1] = "FullTime";
})(JobWorkingTimeEnum || (exports.JobWorkingTimeEnum = JobWorkingTimeEnum = {}));
var JobSeniorityLevelEnum;
(function (JobSeniorityLevelEnum) {
    JobSeniorityLevelEnum[JobSeniorityLevelEnum["Fresh"] = 0] = "Fresh";
    JobSeniorityLevelEnum[JobSeniorityLevelEnum["Junior"] = 1] = "Junior";
    JobSeniorityLevelEnum[JobSeniorityLevelEnum["MidLevel"] = 2] = "MidLevel";
    JobSeniorityLevelEnum[JobSeniorityLevelEnum["Senior"] = 3] = "Senior";
    JobSeniorityLevelEnum[JobSeniorityLevelEnum["TeamLead"] = 4] = "TeamLead";
    JobSeniorityLevelEnum[JobSeniorityLevelEnum["CTO"] = 5] = "CTO";
})(JobSeniorityLevelEnum || (exports.JobSeniorityLevelEnum = JobSeniorityLevelEnum = {}));
