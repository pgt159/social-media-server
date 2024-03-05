import mongoose, { Schema, model } from 'mongoose';
import ChatRoom from './ChatRoom.js';
const MessageSchema = new Schema(
  {
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: [],
        ref: 'User',
      },
    ],
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'ChatRoom',
    },
  },
  {
    timestamps: true,
  }
);
MessageSchema.pre('save', async function (next) {
  const chatRoom = await ChatRoom.findByIdAndUpdate(this.chatRoomId, {
    lastMessage: this._id,
  });
  next();
});
const Message = model('Message', MessageSchema);
export default Message;
