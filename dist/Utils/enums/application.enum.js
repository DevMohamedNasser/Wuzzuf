"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationStatusEnum = void 0;
var ApplicationStatusEnum;
(function (ApplicationStatusEnum) {
    ApplicationStatusEnum[ApplicationStatusEnum["Pending"] = 0] = "Pending";
    ApplicationStatusEnum[ApplicationStatusEnum["Accepted"] = 1] = "Accepted";
    ApplicationStatusEnum[ApplicationStatusEnum["Viewed"] = 2] = "Viewed";
    ApplicationStatusEnum[ApplicationStatusEnum["InConsideration"] = 3] = "InConsideration";
    ApplicationStatusEnum[ApplicationStatusEnum["Rejected"] = 4] = "Rejected";
})(ApplicationStatusEnum || (exports.ApplicationStatusEnum = ApplicationStatusEnum = {}));
