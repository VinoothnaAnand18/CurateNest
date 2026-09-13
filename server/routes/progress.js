const express = require('express');
const router = express.Router();
const { updateProgress, getReadingHistory } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.put('/books/:id/progress', protect, updateProgress);
router.get('/reading-history', protect, getReadingHistory);

module.exports = router;
