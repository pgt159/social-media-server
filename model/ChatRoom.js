import mongoose, { Schema, model } from 'mongoose';

const chatRoomSchema = new Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    chatName: {
      type: String,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  {
    timestamps: true,
  }
);

const ChatRoom = model('ChatRoom', chatRoomSchema);
export default ChatRoom;
