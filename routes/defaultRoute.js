import express from 'express';
import authController from '../controller/authController.js';
import userController from '../controller/userController.js';

const { protect } = authController;
const { getMe } = userController;
const router = express.Router();

router.route('/me').get(protect, getMe);

export default router;
