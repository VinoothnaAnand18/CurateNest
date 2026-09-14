import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Send,
  Bot,
  User,
  HelpCircle,
  FileText,
  ListOrdered,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { aiAPI, booksAPI } from '../services/api';
import { useToast } from '../components/Toast';
import MarkdownContent from '../components/MarkdownContent';

const QUICK_PROMPTS = [
  { id: 'summary', label: 'Book Summary', icon: FileText },
  { id: 'chapters', label: 'Chapter Breakdown', icon: ListOrdered },
  { id: 'concepts', label: 'Key Mental Models', icon: Lightbulb },
  { id: 'questions', label: 'Discussion Questions', icon: HelpCircle },
];

const AiAssistant = () => {
  const [searchParams] = useSearchParams();
  const initialTitle = searchParams.get('bookTitle') || '';
  const initialAuthor = searchParams.get('bookAuthor') || '';

  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(initialTitle ? { title: initialTitle, author: initialAuthor } : null);
  const [customTitle, setCustomTitle] = useState(initialTitle || '');
  const [customAuthor, setCustomAuthor] = useState(initialAuthor || '');

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ask me anything about a book in your library. I can summarize it, break down chapters, explain key ideas, or help you explore its concepts.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'structured'
  const [structuredOutput, setStructuredOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const messagesEndRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    booksAPI.getAll().then((res) => {
      setBooks(res.data || []);
      if (!selectedBook && res.data && res.data.length > 0) {
        setSelectedBook(res.data[0]);
        setCustomTitle(res.data[0].title);
        setCustomAuthor(res.data[0].author);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleBookSelect = (e) => {
    const bookId = e.target.value;
    if (bookId === 'custom') {
      setSelectedBook(null);
    } else {
      const found = books.find((b) => b._id === bookId);
      if (found) {
        setSelectedBook(found);
        setCustomTitle(found.title);
        setCustomAuthor(found.author);
      }
    }
  };

  const handleQuickPrompt = async (promptType) => {
    setLoading(true);
    setActiveTab('structured');
    try {
      const res = await aiAPI.getSummary({
        title: customTitle,
        author: customAuthor,
        promptType,
      });
      setStructuredOutput(res.data.result);
      toast.success('Generated successfully!');
    } catch (err) {
      toast.error('Failed to generate: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const userMessage = inputQuery.trim();
    setInputQuery('');
    setActiveTab('chat');

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await aiAPI.chat({
        message: userMessage,
        bookTitle: customTitle,
        bookAuthor: customAuthor,
        chatHistory: newMessages.slice(-6),
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an issue: ${err.response?.data?.message || err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Gemini Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Book Assistant</h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate summaries, conceptual models, chapter guides, or engage in deep dialogue.
          </p>
        </div>
      </div>

      {/* Book Context Selector Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="w-full md:w-1/3">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Select From Library
            </label>
            <select
              value={selectedBook?._id || 'custom'}
              onChange={handleBookSelect}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
            >
              <option value="custom">-- Custom Book Input --</option>
              {books.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.title} ({b.author})
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Book Title
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Thinking, Fast and Slow"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-full md:w-1/3">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Author
            </label>
            <input
              type="text"
              value={customAuthor}
              onChange={(e) => setCustomAuthor(e.target.value)}
              placeholder="e.g. Daniel Kahneman"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Quick Action Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium shrink-0">Instant Actions:</span>
          {QUICK_PROMPTS.map((qp) => {
            const Icon = qp.icon;
            return (
              <button
                key={qp.id}
                type="button"
                onClick={() => handleQuickPrompt(qp.id)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 text-xs font-medium whitespace-nowrap transition-colors disabled:opacity-50"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-400" />
                {qp.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Conversational Assistant
        </button>
        <button
          onClick={() => setActiveTab('structured')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'structured'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          Structured Analysis {structuredOutput && '✓'}
        </button>
      </div>

      {/* Structured Output View */}
      {activeTab === 'structured' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl relative">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-xs text-slate-400">Gemini is synthesizing insights for "{customTitle}"...</p>
            </div>
          ) : structuredOutput ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400">
                  AI Synthesis for <strong className="text-white">"{customTitle}"</strong> by {customAuthor}
                </span>
                <button
                  onClick={() => handleCopy(structuredOutput)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              </div>

              <MarkdownContent content={structuredOutput} className="text-slate-200 text-sm leading-relaxed" />
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <Lightbulb className="w-10 h-10 mx-auto text-slate-400 mb-2" />
              <p className="text-sm font-semibold text-white">No structured analysis generated yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click any of the Instant Action chips above (Book Summary, Chapter Breakdown, Mental Models).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Conversational Chat View */}
      {activeTab === 'chat' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px] backdrop-blur-xl shadow-2xl">
          {/* Chat Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow-inner'
                  }`}
                >
                  <MarkdownContent content={m.content} />
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
                <div className="flex gap-1.5 items-center bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-2xl">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 text-slate-300">Gemini is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask anything about "${customTitle}" (e.g. "What is habit stacking?", "Explain chapter 3")...`}
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
