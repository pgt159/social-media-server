import mongoose from 'mongoose';
import express from 'express';
import bcryptjs from 'bcryptjs';

const HistorySearchSchema = new mongoose.Schema(
  {
    userId: String,
    searchContent: String,
  },
  {
    timestamps: true,
  }
);

const HistorySearch = mongoose.model('HistorySearch', HistorySearchSchema);
export default HistorySearch;
