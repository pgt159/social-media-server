import catchAsync from '../utils/catchAsync.js';
import Notification from '../model/Notification.js';
import AppError from '../utils/appError.js';

const createNotification = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { toUser, type, postId } = req.body;
  const newNoti = await Notification.create({
    fromUser: user._id,
    toUser,
    type,
    postId,
  });

  return res.status(201).json({
    status: 'Success',
    data: newNoti,
  });
});

const getNotification = catchAsync(async (req, res, next) => {
  const user = req.user;
  const { limit } = req.params;
  const result = await Notification.find({ toUser: user?._id })
    .populate({
      path: 'fromUser',
      select: 'firstName lastName picturePath',
    })
    .populate({
      path: 'postId',
    })
    .limit(limit);
  res.status(200).json({
    status: 'Success',
    data: result,
  });

  const resultUpdate = result.filter((noti) => !noti.isRead);
  if (resultUpdate.length > 0) {
    await Notification.updateMany(
      {
        _id: {
          $in: resultUpdate.map((item) => item._id),
        },
      },
      {
        isRead: true,
      }
    );
  }
});

const updateNotification = catchAsync(async (req, res, next) => {});

const getNotificationUnread = catchAsync(async (req, res, next) => {
  const user = req.user;
  const result = await Notification.find({ toUser: user?._id });
  const resultUpdate = result.filter((noti) => !noti.isRead).length;
  return res.status(200).json({
    status: 'Success',
    data: resultUpdate,
  });
});

const updateSeenNotification = catchAsync(async (req, res, next) => {});
export default {
  createNotification,
  getNotification,
  updateNotification,
  getNotificationUnread,
};
