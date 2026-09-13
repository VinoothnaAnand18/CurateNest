const express = require('express');
const router = express.Router();
const { getGoals, createGoal, updateGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id', updateGoal);

module.exports = router;
