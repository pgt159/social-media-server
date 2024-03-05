import Comment from '../model/Comment.js';
import Post from '../model/Posts.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const createPost = catchAsync(async (req, res, next) => {
  const { description, picturePath } = req.body;
  const { _id, firstName, lastName, location } = req.user;
  const newPost = await Post.create({
    description,
    picturePath,
    userId: _id,
    firstName,
    lastName,
    location,
    userPicturePath: req.user?.picturePath,
    likes: {},
    comments: 0,
  });
  return res.status(201).json({
    status: 'Success',
    data: newPost,
  });
});

const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndDelete(req.params.postId);
  await Comment.deleteMany({ postId: req.params.postId });

  if (!post) {
    return next(new AppError('Post does not exist, please try again', 400));
  }

  return res.status(204).json({
    status: 'Success',
    data: null,
  });
});

const getUserPosts = catchAsync(async (req, res, next) => {
  const post = await Post.find({
    userId: req.params.userId,
  }).sort({ updatedAt: -1 });

  return res.status(200).json({
    status: 'Success',
    data: post,
  });
});

const updatePost = catchAsync(async (req, res, next) => {
  const { description } = req.body;
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new AppError('Post does not exist, please try again', 400));
  }

  post.description = description || post.description;

  await post.save({ validateBeforeSave: true });

  return res.status(200).json({
    status: 'Success',
    data: post,
  });
});

const getFeedPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({}).sort({ updatedAt: -1 });
  return res.status(200).json({
    status: 'Success',
    data: posts || [],
  });
});

const likePost = catchAsync(async (req, res, next) => {
  const { type } = req.body;
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return next(new AppError('Cannot find post', 400));
  }
  const isLiked = post.likes.get(req.user?._id);
  if (isLiked && (isLiked === type || isLiked === 'like')) {
    post.likes.delete(req.user?._id);
  } else {
    post.likes.set(req.user?._id, type || 'like');
  }
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.postId,
    {
      likes: post.likes,
    },
    {
      new: true,
    }
  );
  res.status(200).json({
    status: 'Success',
    data: updatedPost,
  });
});

const getPeopleLikePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
});

export default {
  createPost,
  deletePost,
  updatePost,
  getFeedPosts,
  getUserPosts,
  likePost,
  getPeopleLikePost,
};
