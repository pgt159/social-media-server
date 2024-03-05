import express from 'express';
import authController from '../controller/authController.js';
import upload from '../utils/uploadImage.js';
import postController from '../controller/postController.js';
import commentController from '../controller/commentController.js';

const router = express.Router();
const { protect } = authController;
const {
  createPost,
  getFeedPosts,
  getUserPosts,
  likePost,
  getPeopleLikePost,

  deletePost,
  updatePost,
} = postController;

const { createComment, getComment } = commentController;

router.use(protect);
// --- CRUD ---
router.route('/').get(getFeedPosts).post(createPost);
router.route('/:postId').delete(deletePost).patch(updatePost);
router.route('/user/:userId').get(getUserPosts);
// --- INTERACTION ---
router.route('/like/:postId').get(getPeopleLikePost).post(likePost);
router.route('/comment/:postId').get(getComment).post(createComment);

export default router;
