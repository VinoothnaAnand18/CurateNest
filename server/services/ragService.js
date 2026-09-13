const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// In-memory document chunk store for instant vector retrieval fallback
const localVectorStore = new Map();

// Helper to compute cosine similarity between two numeric vectors
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

// Fallback lightweight deterministic text embedding for offline demo
const generateLocalEmbedding = (text) => {
  const DIM = 64;
  const embedding = new Array(DIM).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
  
  words.forEach((word, idx) => {
    if (!word) return;
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const bucket = Math.abs(hash) % DIM;
    embedding[bucket] += 1 / (1 + Math.log(idx + 1));
  });

  // Normalize
  const mag = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
  return embedding.map(val => val / mag);
};

// Compute embeddings using Gemini or local fallback
const getEmbedding = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return generateLocalEmbedding(text);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.warn('Gemini embedding failed, using local vector fallback:', err.message);
    return generateLocalEmbedding(text);
  }
};

// Chunk text with page tracking
const chunkDocument = (pagesData, chunkSize = 800, chunkOverlap = 150) => {
  const chunks = [];
  let chunkIdCounter = 1;

  pagesData.forEach(({ pageNumber, text }) => {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    let start = 0;
    while (start < cleanText.length) {
      const end = Math.min(start + chunkSize, cleanText.length);
      const chunkText = cleanText.substring(start, end).trim();

      if (chunkText.length > 50) {
        chunks.push({
          id: `chunk_${chunkIdCounter++}`,
          pageNumber,
          text: chunkText,
        });
      }

      start += chunkSize - chunkOverlap;
      if (start >= cleanText.length - 50) break;
    }
  });

  return chunks;
};

// Process PDF file: Extract text -> chunk -> generate embeddings
const processPdfDocument = async (filePath, documentId) => {
  const dataBuffer = fs.readFileSync(filePath);

  // Custom page render to capture page numbers
  const pages = [];
  let currentPage = 1;

  const options = {
    pagerender: (pageData) => {
      return pageData.getTextContent().then((textContent) => {
        let lastY, text = '';
        for (const item of textContent.items) {
          if (lastY === item.transform[5] || !lastY) {
            text += item.str + ' ';
          } else {
            text += '\n' + item.str + ' ';
          }
          lastY = item.transform[5];
        }
        pages.push({ pageNumber: currentPage++, text });
        return text;
      });
    }
  };

  const parsedData = await pdfParse(dataBuffer, options);
  const totalPages = parsedData.numpages || pages.length || 1;

  const rawChunks = chunkDocument(pages.length > 0 ? pages : [{ pageNumber: 1, text: parsedData.text }]);

  // Generate embeddings for each chunk
  const chunksWithEmbeddings = [];
  for (const chunk of rawChunks) {
    const embedding = await getEmbedding(chunk.text);
    chunksWithEmbeddings.push({
      ...chunk,
      embedding,
    });
  }

  // Store in memory for instant retrieval
  localVectorStore.set(String(documentId), chunksWithEmbeddings);

  return {
    pageCount: totalPages,
    chunksCount: chunksWithEmbeddings.length,
    chunks: chunksWithEmbeddings,
  };
};

// Retrieve top relevant chunks for a question
const retrieveContext = async (documentId, query, topK = 4) => {
  let chunks = localVectorStore.get(String(documentId));
  if (!chunks || chunks.length === 0) {
    const UploadedBook = require('../models/UploadedBook');
    const doc = await UploadedBook.findById(documentId);
    if (doc && doc.chunks && doc.chunks.length > 0) {
      chunks = doc.chunks;
      localVectorStore.set(String(documentId), chunks);
    }
  }

  if (!chunks || chunks.length === 0) {
    return [];
  }

  const queryEmbedding = await getEmbedding(query);
  const scoredChunks = chunks.map((chunk) => {
    let score = 0;
    if (chunk.embedding && chunk.embedding.length === queryEmbedding.length) {
      score = cosineSimilarity(queryEmbedding, chunk.embedding);
    } else {
      // Simple term matching score
      const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 3);
      const textLower = chunk.text.toLowerCase();
      terms.forEach(term => {
        if (textLower.includes(term)) score += 0.2;
      });
    }
    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.slice(0, topK);
};

// Answer user question using retrieved chunks and Gemini
const answerDocumentQuestion = async ({ documentId, documentTitle, question, chatHistory = [] }) => {
  const relevantChunks = await retrieveContext(documentId, question, 4);

  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: "No readable context found for this uploaded document yet. Please ensure the document has been processed.",
      sources: [],
    };
  }

  const sources = relevantChunks.map((c, idx) => ({
    sourceId: idx + 1,
    page: c.pageNumber,
    snippet: c.text.slice(0, 180) + '...',
  }));

  const contextText = relevantChunks
    .map((c, idx) => `[Source ${idx + 1} | Page ${c.pageNumber}]:\n${c.text}`)
    .join('\n\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // Offline / Demo mode RAG synthesis
    const topSource = relevantChunks[0];
    return {
      answer: `Based on **${documentTitle || 'your document'}** (referencing **Page ${topSource.pageNumber}**):\n\n"${topSource.text.slice(0, 320)}..."\n\n*Note: CurateNest retrieved this relevant passage from your document using vector similarity search. Connect your \`GEMINI_API_KEY\` to activate full multi-hop generative synthesis.*`,
      sources,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are CurateNest RAG Assistant, an accurate document question answering system.
Book/Document Name: "${documentTitle}"

Retrieved Document Context:
---
${contextText}
---

User Question: "${question}"

Instructions:
1. Answer the question strictly using the provided Document Context above.
2. Cite the source pages clearly in your answer (e.g. "[Page X]" or "(Source 1, Page X)").
3. If the answer cannot be found in the provided document context, explicitly state: "Based on the provided document sections, this information is not discussed." Do NOT invent or hallucinate information outside the document.
4. Keep the tone professional, clear, and structured in Markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return {
      answer: response.text(),
      sources,
    };
  } catch (error) {
    console.error('Gemini RAG chat error:', error.message);
    return {
      answer: `I encountered an issue processing the generative answer: ${error.message}. Here are the most relevant sections retrieved from your document:\n\n${relevantChunks.map(c => `> **Page ${c.pageNumber}**: ${c.text.slice(0, 200)}...`).join('\n\n')}`,
      sources,
    };
  }
};

module.exports = {
  processPdfDocument,
  retrieveContext,
  answerDocumentQuestion,
};
