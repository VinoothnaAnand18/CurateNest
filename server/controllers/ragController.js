const fs = require('fs');
const UploadedBook = require('../models/UploadedBook');
const { processPdfDocument, answerDocumentQuestion } = require('../services/ragService');

// @desc    Upload PDF and run chunking/embedding pipeline
// @route   POST /api/rag/upload
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const doc = await UploadedBook.create({
      user: req.user._id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      filePath: req.file.path,
      status: 'processing',
    });

    // Process PDF extraction and chunking
    try {
      const { pageCount, chunksCount, chunks } = await processPdfDocument(req.file.path, doc._id);
      doc.pageCount = pageCount;
      doc.chunksCount = chunksCount;
      doc.chunks = chunks;
      doc.status = 'processed';
      await doc.save();

      return res.status(201).json({
        message: 'PDF successfully ingested, chunked, and indexed for RAG chat!',
        document: {
          _id: doc._id,
          originalName: doc.originalName,
          fileSize: doc.fileSize,
          pageCount: doc.pageCount,
          chunksCount: doc.chunksCount,
          status: doc.status,
          createdAt: doc.createdAt,
        },
      });
    } catch (procErr) {
      console.error('Error processing PDF chunks:', procErr.message);
      doc.status = 'error';
      doc.errorMessage = procErr.message;
      await doc.save();
      return res.status(500).json({
        message: `PDF could not be indexed: ${procErr.message}`,
        document: {
          _id: doc._id,
          originalName: doc.originalName,
          status: doc.status,
          errorMessage: doc.errorMessage,
        },
      });
    }
  } catch (error) {
    console.error('uploadDocument Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get user uploaded documents
// @route   GET /api/rag/documents
const getDocuments = async (req, res) => {
  try {
    const docs = await UploadedBook.find({ user: req.user._id })
      .select('-chunks.embedding')
      .sort({ createdAt: -1 });

    return res.json(docs);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete uploaded document
// @route   DELETE /api/rag/documents/:id
const deleteDocument = async (req, res) => {
  try {
    const doc = await UploadedBook.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (fs.existsSync(doc.filePath)) {
      try {
        fs.unlinkSync(doc.filePath);
      } catch (e) {
        console.warn('Could not delete physical file:', e.message);
      }
    }

    return res.json({ message: 'Document removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Ask question against uploaded document with RAG context
// @route   POST /api/rag/chat
const chatWithDocument = async (req, res) => {
  try {
    const { documentId, question, chatHistory } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ message: 'Document ID and question are required' });
    }

    const doc = await UploadedBook.findOne({ _id: documentId, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ message: 'Document not found or unauthorized' });
    }

    const result = await answerDocumentQuestion({
      documentId: doc._id,
      documentTitle: doc.originalName,
      question,
      chatHistory,
    });

    return res.json(result);
  } catch (error) {
    console.error('chatWithDocument Error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  deleteDocument,
  chatWithDocument,
};
