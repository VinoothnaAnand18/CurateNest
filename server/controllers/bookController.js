const Book = require('../models/Book');
const Note = require('../models/Note');
const ReadingHistory = require('../models/ReadingHistory');
const { seedUserData } = require('../services/seedService');

// @desc    Get all books for logged-in user with filtering & search
// @route   GET /api/books
const getBooks = async (req, res) => {
  try {
    const { status, genre, search, sort } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (genre && genre !== 'All') {
      filter.genre = { $regex: genre, $options: 'i' };
    }

    if (search && search.trim() !== '') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let query = Book.find(filter);

    // Sorting
    switch (sort) {
      case 'rating_desc':
        query = query.sort({ rating: -1, createdAt: -1 });
        break;
      case 'rating_asc':
        query = query.sort({ rating: 1 });
        break;
      case 'title_asc':
        query = query.sort({ title: 1 });
        break;
      case 'title_desc':
        query = query.sort({ title: -1 });
        break;
      case 'progress_desc':
        query = query.sort({ currentPage: -1 });
        break;
      case 'oldest':
        query = query.sort({ createdAt: 1 });
        break;
      default: // newest
        query = query.sort({ updatedAt: -1 });
    }

    const books = await query.exec();
    return res.json(books);
  } catch (error) {
    console.error('getBooks Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get single book with its notes
// @route   GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const notes = await Note.find({ book: book._id, user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ book, notes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create new book
// @route   POST /api/books
const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      cover,
      genre,
      description,
      totalPages,
      currentPage,
      status,
      rating,
      notes,
      startedDate,
      completedDate,
      format,
      tags,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Title and Author are required' });
    }

    const book = await Book.create({
      user: req.user._id,
      title,
      author,
      cover: cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      genre: genre || 'Non-Fiction',
      description: description || '',
      totalPages: Number(totalPages) || 200,
      currentPage: Number(currentPage) || 0,
      status: status || 'Wishlist',
      rating: Number(rating) || 0,
      notes: notes || '',
      startedDate: startedDate ? new Date(startedDate) : (status === 'Currently Reading' ? new Date() : null),
      completedDate: completedDate ? new Date(completedDate) : (status === 'Completed' ? new Date() : null),
      format: format || 'Paperback',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
    });

    // If initial progress was logged
    if (book.currentPage > 0) {
      await ReadingHistory.create({
        user: req.user._id,
        book: book._id,
        pagesRead: book.currentPage,
        date: new Date(),
      });
    }

    return res.status(201).json(book);
  } catch (error) {
    console.error('createBook Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.user._id });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const updates = req.body;
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim());
    }

    // Automatically adjust status or completedDate if 100% completed
    if (updates.currentPage && updates.totalPages) {
      if (Number(updates.currentPage) >= Number(updates.totalPages)) {
        updates.status = 'Completed';
        if (!updates.completedDate && !book.completedDate) {
          updates.completedDate = new Date();
        }
      }
    }

    Object.assign(book, updates);
    const updatedBook = await book.save();

    return res.json(updatedBook);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Clean up associated notes & reading history
    await Note.deleteMany({ book: book._id });
    await ReadingHistory.deleteMany({ book: book._id });

    return res.json({ message: 'Book and related records deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Seed sample books for user
// @route   POST /api/books/seed
const seedBooks = async (req, res) => {
  try {
    const result = await seedUserData(req.user._id);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  seedBooks,
};
