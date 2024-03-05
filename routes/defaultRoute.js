import express from 'express';
import authController from '../controller/authController.js';
import userController from '../controller/userController.js';

const { protect } = authController;
const { getMe } = userController;
const router = express.Router();

router.route('/').get((req, res, next) => {
  res.status(200).json({
    status: 'Success',
    message: 'Hello',
  });
});
router.route('/me').get(protect, getMe);

export default router;
