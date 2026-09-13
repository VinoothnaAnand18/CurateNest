const { generateSummary, generateRecommendations, chatWithAssistant } = require('../services/geminiService');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Generate summary / chapter breakdown / key takeaways
// @route   POST /api/ai/summary
const getAiSummary = async (req, res) => {
  try {
    const { title, author, genre, promptType } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Book title is required' });
    }

    const response = await generateSummary({
      title,
      author: author || 'Unknown Author',
      genre,
      promptType: promptType || 'summary',
    });

    return res.json({ result: response });
  } catch (error) {
    console.error('getAiSummary Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Generate personalized book recommendations
// @route   POST /api/ai/recommendations
const getAiRecommendations = async (req, res) => {
  try {
    const { mood } = req.body;
    const user = await User.findById(req.user._id);
    const recentBooks = await Book.find({ user: req.user._id })
      .select('title author genre rating')
      .limit(6);

    const recentTitles = recentBooks.map(b => `${b.title} by ${b.author} (${b.genre})`);

    const recommendations = await generateRecommendations({
      userInterests: user?.interests,
      favoriteGenres: user?.favoriteGenres,
      recentBooks: recentTitles,
      mood: mood || 'Motivational',
    });

    return res.json({ recommendations });
  } catch (error) {
    console.error('getAiRecommendations Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Chat with AI book assistant
// @route   POST /api/ai/chat
const chatWithAi = async (req, res) => {
  try {
    const { message, bookTitle, bookAuthor, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const reply = await chatWithAssistant({
      message,
      bookTitle,
      bookAuthor,
      chatHistory: chatHistory || [],
    });

    return res.json({ reply });
  } catch (error) {
    console.error('chatWithAi Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAiSummary,
  getAiRecommendations,
  chatWithAi,
};
