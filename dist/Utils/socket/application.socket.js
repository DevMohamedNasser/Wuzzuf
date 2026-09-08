"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketNotifyHRsApplication = void 0;
const socket_service_1 = require("./socket.service");
const socketNotifyHRsApplication = (company, user, job) => {
    const io = (0, socket_service_1.getIo)();
    if (!io)
        return;
    company.HRs.forEach((hr) => {
        io.to(hr._id.toString()).emit("newApplication", {
            message: "Receive new job application",
            job,
            user,
        });
    });
};
exports.socketNotifyHRsApplication = socketNotifyHRsApplication;
