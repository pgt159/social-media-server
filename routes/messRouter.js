import express from 'express';
import messageController from '../controller/messageController.js';
import authController from '../controller/authController.js';

const router = express.Router();
const { seenMessage } = messageController;
const { protect } = authController;

router.use(protect);

router.route('/:messageId').patch(seenMessage);
export default router;
