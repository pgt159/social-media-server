import express from 'express';
import chatRoomController from '../controller/chatRoomController.js';
import messageController from '../controller/messageController.js';
import authController from '../controller/authController.js';

const router = express.Router();
const { getAllChatRoom, createChatRoom, getChatRoomById } = chatRoomController;
const { getMessageFromRoomId, createMessageFromRoomId } = messageController;
const { protect } = authController;

router.use(protect);

router.route('/').get(getAllChatRoom).post(createChatRoom);
router.route('/:chatRoomId').get(getChatRoomById);
router
  .route('/:chatRoomId/message')
  .get(getMessageFromRoomId)
  .post(createMessageFromRoomId);
export default router;
