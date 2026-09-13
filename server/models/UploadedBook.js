const mongoose = require('mongoose');

const uploadedBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    chunksCount: {
      type: Number,
      default: 0,
    },
    filePath: {
      type: String,
      required: true,
    },
    chunks: [
      {
        id: String,
        text: String,
        pageNumber: Number,
        embedding: [Number],
      },
    ],
    status: {
      type: String,
      enum: ['processing', 'processed', 'error'],
      default: 'processed',
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UploadedBook', uploadedBookSchema);
