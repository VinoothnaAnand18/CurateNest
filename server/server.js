const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from parent .env or current .env
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const { connectDB } = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const progressRoutes = require('./routes/progress');
const goalRoutes = require('./routes/goals');
const noteRoutes = require('./routes/notes');
const aiRoutes = require('./routes/ai');
const ragRoutes = require('./routes/rag');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public Health Check (mounted before protected routes)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'CurateNest API',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE'),
    chromaConfigured: !!process.env.CHROMA_URL,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api', progressRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rag', ragRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API endpoint ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Initialize Database and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`CurateNest API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
});

module.exports = app;
