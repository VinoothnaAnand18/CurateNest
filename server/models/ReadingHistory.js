const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    pagesRead: {
      type: Number,
      required: true,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 25,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
