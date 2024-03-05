import catchAsync from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import User from '../model/Users.js';
import AppError from '../utils/appError.js';

const signToken = (id, type) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // expiresIn:
    //   type === 'access'
    //     ? process.env.JWT_ACCESS_EXPIRES_IN
    //     : process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const updateRefreshToken = catchAsync(async (id, token) => {
  const user = await User.findOneAndUpdate(
    { _id: id },
    {
      refreshToken: token,
    }
  ).select('+refreshToken');

  const newUser = await User.findById(id).select('+refreshToken');
  return newUser;
});

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, 'access');
  const refreshToken = signToken(user._id, 'refresh');
  const cookiesOption = {
    // expires: new Date(
    //   Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    // ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookiesOption.secure = true;
  }

  user.password = undefined;

  updateRefreshToken(user._id, refreshToken);

  res.status(statusCode).json({
    status: 'Success',
    data: {
      user,
    },
    access_token: token,
    refresh_token: refreshToken,
  });
};

const register = catchAsync(async (req, res, next) => {
  if (!req.body) {
    return next(
      new AppError(
        'Please enter information required for your registration',
        400
      )
    );
  }

  if (
    !req.body.password ||
    !req.body.confirmPassword ||
    req.body.password !== req.body.confirmPassword
  ) {
    return next(new AppError('Passwords confirm must be the same'));
  }

  const user = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    picturePath: req.body.picturePath,
    location: req.body.location,
    occupation: req.body.occupation,
    viewedProfile: Math.floor(Math.random() * 1000),
    impression: Math.floor(Math.random() * 1000),
  });

  createSendToken(user, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({
    email,
  }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
});

const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next(
      new AppError('You are not logged in, please log in and try again!', 401)
    );
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('User not exist, please try again', 401));
  }
  req.user = currentUser;
  // req.methods.user = currentUser;
  return next();
});

const refreshToken = catchAsync(async (req, res, next) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return next(new AppError('No valid refresh token', 401));
  const user = await User.findOne({
    refreshToken: refresh_token,
  });
  if (!user) {
    return next(new AppError('User not found', 401));
  }
  const newRefreshToken = signToken(user._id, 'refresh');
  const newAccessToken = signToken(user._id, 'access');
  await updateRefreshToken(user._id, newRefreshToken);
  return res.status(200).json({
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
  });
});
export default {
  register,
  login,
  protect,
  refreshToken,
};
