import express from 'express';
import authController from '../controller/authController.js';
import upload from '../utils/uploadImage.js';

const router = express.Router();

const { register, login, refreshToken } = authController;

router.post('/register', upload.single('picture'), register);
router.post('/login', login);
router.post('/token', refreshToken);

export default router;
