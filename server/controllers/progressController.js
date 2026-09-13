const Book = require('../models/Book');
const ReadingHistory = require('../models/ReadingHistory');
const ReadingGoal = require('../models/ReadingGoal');

// @desc    Update book reading progress
// @route   PUT /api/books/:id/progress
const updateProgress = async (req, res) => {
  try {
    const { currentPage, durationMinutes } = req.body;
    const book = await Book.findOne({ _id: req.params.id, user: req.user._id });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const previousPage = book.currentPage;
    const newPage = Math.min(Math.max(0, Number(currentPage)), book.totalPages);
    const deltaPages = newPage - previousPage;

    book.currentPage = newPage;

    if (newPage >= book.totalPages) {
      book.status = 'Completed';
      book.completedDate = new Date();
      // Update reading goal progress count
      const currentYear = new Date().getFullYear();
      await ReadingGoal.findOneAndUpdate(
        { user: req.user._id, year: currentYear },
        { $inc: { progress: 1 } }
      );
    } else if (book.status === 'Wishlist' || book.status === 'Paused') {
      book.status = 'Currently Reading';
      if (!book.startedDate) book.startedDate = new Date();
    }

    await book.save();

    // Log progress into history if positive reading took place
    if (deltaPages > 0) {
      await ReadingHistory.create({
        user: req.user._id,
        book: book._id,
        pagesRead: deltaPages,
        date: new Date(),
        durationMinutes: durationMinutes || Math.round(deltaPages * 1.5),
      });
    }

    return res.json({
      book,
      progressPercent: book.progressPercent,
      pagesReadDelta: deltaPages,
    });
  } catch (error) {
    console.error('updateProgress Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get reading history & analytics summary
// @route   GET /api/reading-history
const getReadingHistory = async (req, res) => {
  try {
    const history = await ReadingHistory.find({ user: req.user._id })
      .populate('book', 'title author cover')
      .sort({ date: -1 });

    // Calculate reading streak (consecutive days with pages read)
    const datesWithReading = new Set();
    history.forEach(item => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      datesWithReading.add(dateStr);
    });

    let streak = 0;
    let checkDate = new Date();
    // Allow today or yesterday as start of streak
    const todayStr = checkDate.toISOString().split('T')[0];
    checkDate.setDate(checkDate.getDate() - 1);
    const yesterdayStr = checkDate.toISOString().split('T')[0];

    let current = datesWithReading.has(todayStr) ? new Date() : (datesWithReading.has(yesterdayStr) ? checkDate : null);

    if (current) {
      while (true) {
        const dStr = current.toISOString().split('T')[0];
        if (datesWithReading.has(dStr)) {
          streak++;
          current.setDate(current.getDate() - 1);
        } else {
          break;
        }
      }
    }

    const totalPagesRead = history.reduce((sum, h) => sum + (h.pagesRead || 0), 0);

    return res.json({
      history,
      totalPagesRead,
      streak,
      activeDays: datesWithReading.size,
    });
  } catch (error) {
    console.error('getReadingHistory Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { updateProgress, getReadingHistory };
