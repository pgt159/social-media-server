import catchAsync from '../utils/catchAsync.js';
import User from '../model/Users.js';
import HistorySearch from '../model/HistorySearch.js';
import AppError from '../utils/appError.js';
import { LIMIT } from '../config.js';
import { ObjectId } from 'mongodb';

const checkListFriend = (user, id) => {
  if (user?.friend?.find((item) => item === id)) {
    return true;
  }
  if (user?.friendRequest?.find((item) => item === id)) {
    return true;
  }
  if (user?.friendRequested?.find((item) => item === id)) {
    return true;
  }
  return false;
};

const getMe = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('User not found, please login', 401));
  }
  const user = await User.findById(req.user._id).populate({
    path: 'friend',
    select: '_id firstName lastName fullName email picturePath',
  });
  return res.status(200).json({
    status: 'Success',
    data: user,
  });
});

const userById = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please login and try again', 401));
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found, please try again', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: user,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please login and try again', 401));
  }
  if (!req.body) return;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...req.body,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return next(new AppError('User not found, please try again', 404));
  }
  res.status(200).json({
    status: 'Success',
    data: user,
  });
});

const listUser = catchAsync(async (req, res, next) => {
  const { name, page = 1 } = req.query;
  const skip = ((page <= 0 ? 1 : page) - 1) * LIMIT;
  const conditionNotUser = { _id: { $ne: req.user?._id } };
  const conditionSearch = {
    $or: [
      { firstName: { $regex: name || '', $options: 'i' } },
      { lastName: { $regex: name || '', $options: 'i' } },
    ],
  };

  const listUser = await User.find({
    $and: [conditionNotUser, conditionSearch],
  })
    .limit(LIMIT)
    .skip(skip);

  res.status(200).json({
    status: 'Success',
    data: listUser,
  });
});

const historySearch = catchAsync(async (req, res, next) => {
  const listHistory = await HistorySearch.find({
    userId: req.user._id,
  });

  if (listHistory.length > LIMIT) {
    for (let i = LIMIT; i < listHistory.length; i++) {
      await HistorySearch.findByIdAndDelete({
        _id: listHistory[i]._id,
      });
    }
  }
  res.status(200).json({
    status: 'Success',
    data: listHistory.slice(0, LIMIT),
  });
});

const getUserFriends = catchAsync(async (req, res, next) => {
  const { user } = req;
  const friends = await Promise.all(user.friend.map((id) => User.findById(id)));
  res.status(200).json({
    status: 'Success',
    data: friends,
  });
});

const getFriendRequest = catchAsync(async (req, res, next) => {
  const id = req.user?._id;
  if (!id) return;
  const formattedUser = await User.findById(id).populate({
    path: 'friendRequest',
    select: '_id firstName lastName email picturePath friend',
  });

  res.status(200).json({
    status: 'Success',
    data: formattedUser?.friendRequest || [],
  });
});

const addFriend = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  if (!id) return;
  const user = await User.findById(req.user?._id);
  const targetUser = await User.findById(id);

  if (checkListFriend(req.user, id)) {
    return next(new AppError('User not valid, please try again', 400));
  }
  if (!targetUser || checkListFriend(targetUser, req.user?._id)) {
    return next(new AppError('User not valid, please try again', 400));
  }
  user.addFriendRequested(targetUser?._id);
  targetUser.addFriendRequest(req.user?._id);

  await user.save();
  await targetUser.save();

  res.status(200).json({
    status: 'Success',
    data: {
      user,
    },
  });
});

const handleConfirmFriendRequest = catchAsync(async (req, res, next) => {
  const targetUserId =
    typeof req.body.id === 'string' ? new ObjectId(req.body.id) : req.body.id;
  if (!targetUserId) {
    return next(new AppError('User not valid, please try again', 400));
  }

  const user = await User.findById(req.user?._id);
  const targetUser = await User.findById(targetUserId);

  if (
    user.friendRequest.find((item) => {
      return (
        item === targetUserId || item?.toString() === targetUserId?.toString()
      );
    }) &&
    targetUser.friendRequested.find((item) => {
      return (
        item === req.user?._id.toString() ||
        item?.toString() === req.user?._id.toString()
      );
    })
  ) {
    user.confirmFriendRequest(targetUserId, req.body.isAccept);
    targetUser.confirmFriendRequested(user?._id, req.body.isAccept);

    await user.save();
    await targetUser.save();

    res.status(201).json({
      status: 'Success',
      data: {
        user,
      },
    });
  } else {
    return next(new AppError('User not valid, please try again', 400));
  }
});

export default {
  getMe,
  userById,
  listUser,
  historySearch,
  getUserFriends,
  addFriend,
  handleConfirmFriendRequest,
  getFriendRequest,
  updateUser,
};
