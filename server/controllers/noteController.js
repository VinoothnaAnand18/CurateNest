const Note = require('../models/Note');

// @desc    Get all notes / reviews / quotes
// @route   GET /api/notes
const getNotes = async (req, res) => {
  try {
    const { bookId, type } = req.query;
    const filter = { user: req.user._id };

    if (bookId) filter.book = bookId;
    if (type && type !== 'All') filter.type = type;

    const notes = await Note.find(filter)
      .populate('book', 'title author cover')
      .sort({ createdAt: -1 });

    return res.json(notes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Create a note
// @route   POST /api/notes
const createNote = async (req, res) => {
  try {
    const { book, title, content, type, pageNumber, rating, chapter } = req.body;

    if (!book || !content) {
      return res.status(400).json({ message: 'Book ID and content are required' });
    }

    const note = await Note.create({
      user: req.user._id,
      book,
      title: title || '',
      content,
      type: type || 'Note',
      pageNumber: pageNumber ? Number(pageNumber) : null,
      rating: rating ? Number(rating) : null,
      chapter: chapter || '',
    });

    const populatedNote = await note.populate('book', 'title author cover');
    return res.status(201).json(populatedNote);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    const { title, content, type, pageNumber, rating, chapter } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (type !== undefined) note.type = type;
    if (pageNumber !== undefined) note.pageNumber = pageNumber;
    if (rating !== undefined) note.rating = rating;
    if (chapter !== undefined) note.chapter = chapter;

    await note.save();
    const populated = await note.populate('book', 'title author cover');
    return res.json(populated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    return res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getNotes, createNote, updateNote, deleteNote };
