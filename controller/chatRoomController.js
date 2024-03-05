import catchAsync from '../utils/catchAsync.js';
import ChatRoom from '../model/ChatRoom.js';
import AppError from '../utils/appError.js';

const getAllChatRoom = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const result = await ChatRoom.find({
    users: {
      $in: [userId],
    },
  })
    .populate({
      path: 'users',
      select: '_id firstName lastName picturePath',
    })
    .populate({
      path: 'lastMessage',
    })
    .sort('-updatedAt');
  return res.status(200).json({
    status: 'Success',
    data: result,
  });
});

const getChatRoomById = catchAsync(async (req, res, next) => {
  const chatRoomId = req.params.chatRoomId;
  const result = await ChatRoom.findById(chatRoomId)
    .populate({
      path: 'users',
      select: '_id firstName lastName picturePath',
    })
    .populate({
      path: 'lastMessage',
    });
  if (result) {
    return res.status(200).json({
      status: 'Success',
      data: result,
    });
  } else {
    return next(new AppError('Chat room not found', 404));
  }
});

const createChatRoom = catchAsync(async (req, res, next) => {
  const result = await ChatRoom.create(req.body);
  const populatedResult = await ChatRoom.findById(result._id).populate({
    path: 'users',
    select: '_id firstName lastName picturePath',
  });
  return res.status(201).json({
    status: 'Success',
    data: populatedResult,
  });
});

export default {
  getAllChatRoom,
  createChatRoom,
  getChatRoomById,
};
