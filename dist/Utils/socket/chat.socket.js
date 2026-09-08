"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatEvents = void 0;
const socket_helper_1 = require("./socket.helper");
const validators = __importStar(require("../..//Modules/Chat/chat.validation"));
const user_model_1 = require("../../DB/Models/user.model");
const error_response_1 = require("../response/error.response");
const chat_model_1 = require("../../DB/Models/chat.model");
const job_model_1 = require("../../DB/Models/job.model");
const company_model_1 = require("../../DB/Models/company.model");
const getChatPartner = async (me, otherId) => {
    if (me._id.toString() === otherId) {
        throw new error_response_1.BadRequestException("Can't chat with urself");
    }
    const other = await user_model_1.userModel.findById(otherId);
    if (!other) {
        console.log("can't chat ur self");
        throw new error_response_1.NotFoundException("User not found");
    }
    return other;
};
const findOrCreateChat = async (me, receiver, jobId) => {
    const chat = await chat_model_1.chatModel.findOne({
        $or: [
            { senderId: me._id, receiverId: receiver._id },
            { senderId: receiver._id, receiverId: me._id },
        ],
    });
    if (!chat) {
        const job = await job_model_1.jobModel.findById(jobId);
        if (!job)
            throw new error_response_1.NotFoundException("Job not found (maybe deleted)");
        const company = await company_model_1.companyModel.findById(job.companyId);
        if (!company || company.deletedAt || company.bannedAt)
            throw new error_response_1.NotFoundException("Company not found (maybe deleted)");
        const owner = company.createdBy;
        const HRs = company.HRs;
        if (owner.toString() !== me._id.toString()) {
            const isUserHR = HRs.some((hr) => hr.equals(me._id));
            if (!isUserHR) {
                throw new error_response_1.UnauthorizedException("Unauthorized action");
            }
        }
        return chat_model_1.chatModel.create({ senderId: me._id, receiverId: receiver._id });
    }
    return chat;
};
const findChat = async (userA, userB) => {
    const chat = await chat_model_1.chatModel.findOne({
        $or: [
            { senderId: userA, receiverId: userB },
            { senderId: userB, receiverId: userA },
        ],
    });
    if (!chat)
        throw new error_response_1.NotFoundException("Chat not found");
    return chat;
};
const registerChatEvents = (io, socket) => {
    const user = socket.user;
    const userId = user._id.toString();
    socket.on("sendMessage", (0, socket_helper_1.handleEvent)(socket, "sendMessage", validators.sendMessageSchema, async (data) => {
        const receiver = await getChatPartner(user, data.to);
        const chat = await findOrCreateChat(user, receiver, data.jobId);
        const updatedChatMsg = await chat_model_1.chatModel.findOneAndUpdate({ _id: chat._id }, {
            $push: {
                messages: { message: data.message, senderId: user._id },
            },
        }, { returnDocument: "after" });
        if (!updatedChatMsg)
            throw new error_response_1.NotFoundException("Chat not found");
        const payload = {
            _id: updatedChatMsg._id,
            message: data.message,
            receiverId: data.to,
            sender: {
                _id: userId,
                username: user.username,
            },
        };
        io.to(data.to).emit("messageSent", payload);
    }));
    socket.on("getChatHistory", (0, socket_helper_1.handleEvent)(socket, "getChatHistory", validators.getChatHistorySchema, async (data) => {
        const user = socket.user;
        const partner = await getChatPartner(user, data.partner);
        console.log("👤 PARTNER FOUND:", partner._id.toString());
        const chat = await findChat(user._id, partner._id);
        console.log("💬 CHAT FOUND:", chat);
        io.to(user._id.toString()).emit("gotChatHistory", chat);
    }));
};
exports.registerChatEvents = registerChatEvents;
