import mongoose from 'mongoose';
import express from 'express';
import bcryptjs from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 5,
      max: 50,
      select: false,
    },
    picturePath: {
      type: String,
      default: '',
    },
    friend: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] },
    ],
    friendRequest: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] },
    ],
    //  {
    //   // lời mời kb gửi đến cho người dùng
    //   type: ,
    //   default: [],
    // },
    friendRequested: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] },
    ],
    // {
    //   // lời mời kb người dùng gửi cho người khác
    //   type: Array,
    //   default: [],
    // },
    location: String,
    occupation: String,
    viewedProfile: Number,
    linkFb: String,
    linkLinkedin: String,
    impression: Number,
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
  }
);

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcryptjs.hash(this.password, 12);
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

UserSchema.methods.addFriendRequest = async function (candidateId) {
  if (!candidateId) return;
  this.friendRequest = [...this.friendRequest, candidateId];
};

UserSchema.methods.addFriendRequested = async function (candidateId) {
  if (!candidateId) return;
  this.friendRequested = [...this.friendRequested, candidateId];
};

UserSchema.methods.confirmFriendRequest = async function (
  candidateId,
  isAccept
) {
  if (!candidateId) return;
  this.friendRequest = this.friendRequest.filter(
    (item) =>
      item !== candidateId && item?.toString() !== candidateId?.toString()
  );
  if (
    this.friend.find((item) => item?.toString() === candidateId?.toString()) ||
    !isAccept
  ) {
    return;
  }
  this.friend = [...this.friend, candidateId];
};

UserSchema.methods.confirmFriendRequested = async function (
  candidateId,
  isAccept
) {
  if (!candidateId) return;

  this.friendRequested = this.friendRequested.filter(
    (item) =>
      item !== candidateId && item?.toString() !== candidateId?.toString()
  );
  if (
    this.friend.find((item) => item?.toString() === candidateId?.toString()) ||
    !isAccept
  ) {
    return;
  }

  this.friend = [...this.friend, candidateId];
};

const User = mongoose.model('User', UserSchema);
export default User;
