import { model, Schema, Types } from "mongoose";

export interface IMesaage {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  messageType: "text" | "file";
  content: string;
  fileName?: string;
  fileType?: string;
  fileURL?: string;
  size?: String;
}

const messageScheme = new Schema<IMesaage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: false },
    messageType: {
      type: String,
      enum: ["text", "file"],
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === "text";
      },
    },
    fileName: { type: String },
    fileType: {
      type: String,
    },
    fileURL: {
      type: String,
    },
    size: { type: String },
  },
  { timestamps: true }
);

const Message = model<IMesaage>("Message", messageScheme);

export default Message;
