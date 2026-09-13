const mongoose = require('mongoose');

const readingGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Annual Reading Goal',
    },
    target: {
      type: Number,
      required: [true, 'Target number of books is required'],
      default: 20,
      min: 1,
    },
    year: {
      type: Number,
      required: true,
      default: () => new Date().getFullYear(),
    },
    targetPages: {
      type: Number,
      default: 5000,
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReadingGoal', readingGoalSchema);
