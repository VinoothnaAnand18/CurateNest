import React, { useEffect, useState, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Send,
  Bot,
  User,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { ragAPI } from '../services/api';
import { useToast } from '../components/Toast';
import MarkdownContent from '../components/MarkdownContent';

const SUGGESTED_QUESTIONS = [
  'What are the core ideas discussed in this document?',
  'What does this book say about habit formation or productivity?',
  'Explain the primary methodology introduced in the early chapters.',
  'Summarize the conclusion and main takeaways.',
];

const RagChat = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  const fetchDocuments = async () => {
    try {
      const res = await ragAPI.getDocuments();
      setDocuments(res.data || []);
      if (res.data && res.data.length > 0 && !selectedDocId) {
        setSelectedDocId(res.data[0]._id);
        initializeWelcomeMessage(res.data[0].originalName);
      }
    } catch (err) {
      console.error('Failed to load RAG documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const initializeWelcomeMessage = (docName) => {
    setMessages([
      {
        role: 'assistant',
      content: `Ask a question about “${docName}”. I’ll answer from the document and include page references.`,
        sources: [],
      },
    ]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSelectDoc = (id) => {
    setSelectedDocId(id);
    const doc = documents.find((d) => d._id === id);
    if (doc) {
      initializeWelcomeMessage(doc.originalName);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await ragAPI.upload(formData);
      toast.success('Document uploaded and indexed successfully!');
      setFileToUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchDocuments();
      if (res.data.document) {
        setSelectedDocId(res.data.document._id);
        initializeWelcomeMessage(res.data.document.originalName);
      }
    } catch (err) {
      const message = err.response?.data?.message
        || (err.request
          ? 'Could not reach the CurateNest backend. Confirm the server is running and try again.'
          : err.message)
        || 'PDF upload could not be completed.';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Delete this uploaded document and its vector embeddings?')) return;
    try {
      await ragAPI.deleteDocument(id);
      toast.success('Document deleted');
      const updated = documents.filter((d) => d._id !== id);
      setDocuments(updated);
      if (selectedDocId === id) {
        setSelectedDocId(updated[0]?._id || '');
        if (updated[0]) initializeWelcomeMessage(updated[0].originalName);
        else setMessages([]);
      }
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleSendMessage = async (queryText) => {
    const text = queryText || inputQuery;
    if (!text.trim() || !selectedDocId || chatLoading) return;

    setInputQuery('');
    const newMessages = [...messages, { role: 'user', content: text, sources: [] }];
    setMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await ragAPI.chat({
        documentId: selectedDocId,
        question: text,
        chatHistory: newMessages.slice(-6),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.data.answer,
          sources: res.data.sources || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error during retrieval: ${err.response?.data?.message || err.message}`,
          sources: [],
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const selectedDoc = documents.find((d) => d._id === selectedDocId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <Layers className="w-3.5 h-3.5" /> Retrieval-Augmented Generation (RAG)
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Chat With Your Book</h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload a PDF, split it into overlapping text chunks, and ask questions grounded in its contents.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Uploader & Ingested Document Library */}
        <div className="space-y-5">
          {/* Upload PDF Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-400" /> Ingest PDF Document
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Supports textbooks, papers, research, or book chapters up to 50MB.
            </p>

            <form onSubmit={handleUpload} className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-950/40"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-200">
                  {fileToUpload ? fileToUpload.name : 'Click or drop PDF here'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {fileToUpload ? `${(fileToUpload.size / (1024 * 1024)).toFixed(2)} MB` : 'PDF files only'}
                </p>
              </div>

              <button
                type="submit"
                disabled={!fileToUpload || uploading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              >
                {uploading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Extracting & Chunking...
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" /> Ingest & Embed Document
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Active Documents List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Ingested Books ({documents.length})
              </h2>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No documents uploaded yet. Ingest your first PDF above to start chatting!
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {documents.map((doc) => {
                  const isSelected = doc._id === selectedDocId;
                  return (
                    <div
                      key={doc._id}
                      onClick={() => handleSelectDoc(doc._id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <div className="truncate">
                          <p className="font-semibold truncate">{doc.originalName}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>{doc.pageCount || 1} pages</span>
                            <span>•</span>
                            <span>{doc.chunksCount || 0} chunks</span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoc(doc._id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Interactive RAG Chat */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[640px] backdrop-blur-xl shadow-2xl">
          {/* Chat Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="truncate">
                <h2 className="text-sm font-bold text-white truncate">
                  {selectedDoc ? selectedDoc.originalName : 'No Document Selected'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {selectedDoc
                    ? `Active Knowledge Base (${selectedDoc.pageCount} pages, ${selectedDoc.chunksCount} chunks indexed)`
                    : 'Select or upload a PDF on the left'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed space-y-3 ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80'
                  }`}
                >
                  <MarkdownContent content={m.content} />

                  {/* Cited Sources & Page References */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2">
                      <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">
                        Cited Document Passages:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.sources.map((s, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-2.5 text-[11px] text-slate-300 space-y-1"
                          >
                            <span className="font-bold text-indigo-400 block">Page {s.page}</span>
                            <p className="italic text-slate-400 line-clamp-3">"{s.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs">
                <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                </div>
                <div className="flex gap-2 items-center bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 text-slate-300">Retrieving vector context & synthesizing answer...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Question Chips */}
          <div className="px-4 py-2 bg-slate-950/50 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold text-slate-400 shrink-0">Try:</span>
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={!selectedDocId || chatLoading}
                className="text-[11px] px-2.5 py-1 bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60 rounded-lg whitespace-nowrap transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              disabled={!selectedDocId}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                selectedDocId
                  ? `Ask questions citing "${selectedDoc?.originalName}"...`
                  : 'Please select or upload a document to begin'
              }
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!selectedDocId || chatLoading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/25 flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RagChat;
