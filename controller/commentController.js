import Comment from '../model/Comment.js';
import Post from '../model/Posts.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const createComment = catchAsync(async (req, res, next) => {
  const postId = req.params.postId;
  if (!postId || !req.body.content) {
    return next(
      new AppError('Cannot find post or comment, please try again', 400)
    );
  }
  const newComment = await Comment.create({
    content: req.body.content,
    userId: req.user?._id,
    firstName: req.user?.firstName,
    lastName: req.user?.lastName,
    postId: req.params?.postId,
    userPicturePath: req.user?.picturePath,
  });

  const post = await Post.findById(req.params.postId);
  post.comments = Number((post.comments || 0) + 1);

  await post.save();

  return res.status(201).json({
    status: 'Success',
    data: newComment,
  });
});

const getComment = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const result = await Comment.find({
    postId,
  }).sort('-createdAt');
  return res.status(200).json({
    status: 'Success',
    data: result,
  });
});

export default { createComment, getComment };
