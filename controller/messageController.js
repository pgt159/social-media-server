import catchAsync from '../utils/catchAsync.js';
import Message from '../model/Message.js';
import ChatRoom from '../model/ChatRoom.js';
import AppError from '../utils/appError.js';

const getMessageFromRoomId = catchAsync(async (req, res, next) => {
  const chatRoomId = req.params.chatRoomId;
  if (!chatRoomId) return;
  const result = await Message.find({
    chatRoomId,
  }).populate({
    path: 'sentBy',
    select: '_id firstName lastName picturePath',
  });
  return res.status(200).json({
    status: 'Success',
    data: result,
  });
});

const createMessageFromRoomId = catchAsync(async (req, res, next) => {
  const chatRoomId = req.params.chatRoomId;
  const userId = req.user._id;

  const result = await Message.create({
    sentBy: userId,
    chatRoomId,
    content: req.body.content,
  });

  const populatedResult = await Message.findById(result._id).populate({
    path: 'sentBy',
    select: '_id firstName lastName picturePath',
  });

  return res.status(201).json({
    status: 'Success',
    data: populatedResult,
  });
});

const seenMessage = catchAsync(async (req, res, next) => {
  const { readBy } = req.body;
  const messageId = req.params.messageId;

  const result = await Message.findByIdAndUpdate(
    messageId,
    {
      readBy,
    },
    {
      new: true,
    }
  );

  return res.status(200).json({
    status: 'Success',
    data: result,
  });
});

export default { getMessageFromRoomId, createMessageFromRoomId, seenMessage };
