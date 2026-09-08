import { Server } from "socket.io";
import { authedSocket } from "./socket.service";
import { handleEvent } from "./socket.helper";
import * as validators from "../..//Modules/Chat/chat.validation";
import { HUserDocument, userModel } from "../../DB/Models/user.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../response/error.response";
import { chatModel } from "../../DB/Models/chat.model";
import { jobModel } from "../../DB/Models/job.model";
import { companyModel } from "../../DB/Models/company.model";
import { Types } from "mongoose";

const getChatPartner = async (
  me: HUserDocument,
  otherId: string,
): Promise<HUserDocument> => {
  if (me._id.toString() === otherId) {
    throw new BadRequestException("Can't chat with urself");
  }

  const other = await userModel.findById(otherId);

  if (!other) {
    console.log("can't chat ur self");
    throw new NotFoundException("User not found");
  }

  return other;
};

const findOrCreateChat = async (
  me: HUserDocument,
  receiver: HUserDocument,
  jobId: string,
) => {
  const chat = await chatModel.findOne({
    $or: [
      { senderId: me._id, receiverId: receiver._id },
      { senderId: receiver._id, receiverId: me._id },
    ],
  });

  if (!chat) {
    const job = await jobModel.findById(jobId);
    if (!job) throw new NotFoundException("Job not found (maybe deleted)");

    const company = await companyModel.findById(job.companyId);
    if (!company || company.deletedAt || company.bannedAt)
      throw new NotFoundException("Company not found (maybe deleted)");

    const owner = company.createdBy;
    const HRs = company.HRs;

    if (owner.toString() !== me._id.toString()) {
      const isUserHR = HRs.some((hr) => hr.equals(me._id));
      if (!isUserHR) {
        throw new UnauthorizedException("Unauthorized action");
      }
    }

    return chatModel.create({ senderId: me._id, receiverId: receiver._id });
  }

  return chat;
};

const findChat = async (userA: Types.ObjectId, userB: Types.ObjectId) => {
  const chat = await chatModel.findOne({
    $or: [
      { senderId: userA, receiverId: userB },
      { senderId: userB, receiverId: userA },
    ],
  });

  if (!chat) throw new NotFoundException("Chat not found");

  return chat;
};

export const registerChatEvents = (io: Server, socket: authedSocket): void => {
  const user = socket.user!;
  const userId = user._id.toString();

  socket.on(
    "sendMessage",
    handleEvent(
      socket,
      "sendMessage",
      validators.sendMessageSchema,
      async (data) => {
        const receiver = await getChatPartner(user, data.to);

        const chat = await findOrCreateChat(user, receiver, data.jobId);

        const updatedChatMsg = await chatModel.findOneAndUpdate(
          { _id: chat._id },
          {
            $push: {
              messages: { message: data.message, senderId: user._id },
            },
          },
          { returnDocument: "after" },
        );

        if (!updatedChatMsg) throw new NotFoundException("Chat not found");

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
      },
    ),
  );

  socket.on(
    "getChatHistory",
    handleEvent(
      socket,
      "getChatHistory",
      validators.getChatHistorySchema,
      async (data) => {
        const user = socket.user!;
        const partner = await getChatPartner(user, data.partner);
        console.log("👤 PARTNER FOUND:", partner._id.toString());

        const chat = await findChat(user._id, partner._id);
        console.log("💬 CHAT FOUND:", chat);

        io.to(user._id.toString()).emit("gotChatHistory", chat);
      },
    ),
  );
};
