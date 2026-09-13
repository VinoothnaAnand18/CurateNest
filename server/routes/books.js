const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  seedBooks,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBooks);
router.post('/', createBook);
router.post('/seed', seedBooks);
router.get('/:id', getBookById);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);

module.exports = router;
