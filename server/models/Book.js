const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    cover: {
      type: String,
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    },
    genre: {
      type: String,
      default: 'General Non-Fiction',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    totalPages: {
      type: Number,
      required: [true, 'Total pages are required'],
      min: 1,
      default: 200,
    },
    currentPage: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Currently Reading', 'Completed', 'Wishlist', 'Paused'],
      default: 'Wishlist',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    startedDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    format: {
      type: String,
      enum: ['Hardcover', 'Paperback', 'E-book', 'Audiobook'],
      default: 'Paperback',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for progress percentage
bookSchema.virtual('progressPercent').get(function () {
  if (!this.totalPages || this.totalPages <= 0) return 0;
  const pct = Math.round((this.currentPage / this.totalPages) * 100);
  return Math.min(Math.max(pct, 0), 100);
});

module.exports = mongoose.model('Book', bookSchema);
