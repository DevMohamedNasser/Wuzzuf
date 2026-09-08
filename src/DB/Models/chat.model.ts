import mongoose, { HydratedDocument, Model, Schema, Types } from "mongoose";

export interface IMessage {
  message: string;
  senderId: Types.ObjectId;
}

export interface IChat {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  messages: IMessage[];
}

export const chatSchema = new Schema<IChat>(
  {
    senderId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        message: {
          type: String,
        },
        senderId: {
          type: Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true },
);

export const chatModel: Model<IChat> =
  mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export type HChatDocument = HydratedDocument<IChat>;
