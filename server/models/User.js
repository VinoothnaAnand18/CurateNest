const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    interests: {
      type: [String],
      default: ['Personal Growth', 'Technology', 'Science Fiction', 'Psychology'],
    },
    favoriteGenres: {
      type: [String],
      default: ['Non-Fiction', 'Sci-Fi', 'Productivity', 'Philosophy'],
    },
    avatar: {
      type: String,
      default: '',
    },
    themePreference: {
      type: String,
      enum: ['dark', 'light'],
      default: 'dark',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
