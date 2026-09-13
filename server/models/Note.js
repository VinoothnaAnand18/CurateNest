const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
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
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    content: {
      type: String,
      required: [true, 'Note content cannot be empty'],
    },
    type: {
      type: String,
      enum: ['Note', 'Highlight', 'Review', 'Quote'],
      default: 'Note',
    },
    pageNumber: {
      type: Number,
      default: null,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    chapter: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', noteSchema);
