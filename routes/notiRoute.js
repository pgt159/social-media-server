import express from 'express';

import authController from '../controller/authController.js';

const router = express.Router();

const { protect } = authController;

router.use(protect);

export default router;
