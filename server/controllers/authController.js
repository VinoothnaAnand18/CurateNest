const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { seedUserData } = require('../services/seedService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'curatenest_jwt_secret_dev_key_2026', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, interests, favoriteGenres } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      interests: interests || ['Personal Growth', 'Technology', 'Psychology'],
      favoriteGenres: favoriteGenres || ['Non-Fiction', 'Productivity'],
    });

    // Seed realistic demo library for immediate rich experience
    try {
      await seedUserData(user._id);
    } catch (seedErr) {
      console.warn('Auto-seeding library warning:', seedErr.message);
    }

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        interests: user.interests,
        favoriteGenres: user.favoriteGenres,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        interests: user.interests,
        favoriteGenres: user.favoriteGenres,
        themePreference: user.themePreference,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile / preferences
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, interests, favoriteGenres, themePreference } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (interests) user.interests = interests;
    if (favoriteGenres) user.favoriteGenres = favoriteGenres;
    if (themePreference) user.themePreference = themePreference;

    await user.save();

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      interests: user.interests,
      favoriteGenres: user.favoriteGenres,
      themePreference: user.themePreference,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
