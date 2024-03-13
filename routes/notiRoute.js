import express from 'express';

import authController from '../controller/authController.js';
import notiController from '../controller/notificationController.js';
const router = express.Router();

const {
  createNotification,
  getNotification,
  updateNotification,
  getNotificationUnread,
} = notiController;
const { protect } = authController;

router.use(protect);

router.route('/unread').get(getNotificationUnread);
router
  .route('/:limit?')
  .get(getNotification)
  .patch(updateNotification)
  .post(createNotification);

export default router;
