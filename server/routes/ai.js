const express = require('express');
const router = express.Router();
const {
  getAiSummary,
  getAiRecommendations,
  chatWithAi,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/summary', getAiSummary);
router.post('/recommendations', getAiRecommendations);
router.post('/chat', chatWithAi);

module.exports = router;
