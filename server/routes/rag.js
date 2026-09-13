const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  chatWithDocument,
} = require('../controllers/ragController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/documents', getDocuments);
router.delete('/documents/:id', deleteDocument);
router.post('/chat', chatWithDocument);

module.exports = router;
