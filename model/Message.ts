import mongoose, { Mongoose } from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    body: String,
    id: Number,
    username: String,
    roomId: String,
    createdat: { type: Date, default: Date.now, required: false },
  },
  { timestamps: true },
);

/* MessageSchema.query.byRoomId = function (roomId: string) {
  return this.where({ roomId: new RegExp(roomId, "i")});
} */

const Message =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;
