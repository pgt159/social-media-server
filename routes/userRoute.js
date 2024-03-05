import express from 'express';
import userController from '../controller/userController.js';
import authController from '../controller/authController.js';

const router = express.Router();
const { protect } = authController;
const {
  userById,
  listUser,
  historySearch,
  getUserFriends,
  addFriend,
  handleConfirmFriendRequest,
  getFriendRequest,
  updateUser,
} = userController;

router.use(protect);

router.get('/history_list_user', historySearch);
router.route('/friend').get(getUserFriends).patch(addFriend);
router
  .route('/friendRequest')
  .get(getFriendRequest)
  .patch(handleConfirmFriendRequest);
router.route('/:id').get(userById);
router.route('').get(listUser).patch(updateUser);
export default router;
