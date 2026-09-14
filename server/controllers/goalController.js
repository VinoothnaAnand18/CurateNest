const ReadingGoal = require('../models/ReadingGoal');
const Book = require('../models/Book');

// @desc    Get user goals
// @route   GET /api/goals
const getGoals = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    let goals = await ReadingGoal.find({ user: req.user._id }).sort({ year: -1 });

    if (goals.length > 0) {
      // Sync progress with actual completed books for the year
      const completedCount = await Book.countDocuments({
        user: req.user._id,
        status: 'Completed',
      });

      const currentGoal = goals.find(g => g.year === currentYear);
      if (currentGoal && currentGoal.progress !== completedCount) {
        currentGoal.progress = completedCount;
        await currentGoal.save();
      }
    }

    return res.json(goals);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create new reading goal
// @route   POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { title, target, year, targetPages } = req.body;
    const completedCount = await Book.countDocuments({
      user: req.user._id,
      status: 'Completed',
    });

    const goal = await ReadingGoal.create({
      user: req.user._id,
      title: title || `${year || new Date().getFullYear()} Reading Goal`,
      target: Number(target) || 20,
      year: Number(year) || new Date().getFullYear(),
      targetPages: Number(targetPages) || 5000,
      progress: completedCount,
    });

    return res.status(201).json(goal);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update reading goal
// @route   PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await ReadingGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const { target, targetPages, title } = req.body;
    if (target) goal.target = Number(target);
    if (targetPages) goal.targetPages = Number(targetPages);
    if (title) goal.title = title;

    await goal.save();
    return res.json(goal);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getGoals, createGoal, updateGoal };
