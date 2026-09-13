import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  StickyNote,
  Plus,
  Search,
  Quote,
  Highlighter,
  Star,
  Trash2,
  Edit,
  BookOpen,
  X,
  Clock,
} from 'lucide-react';
import { notesAPI, booksAPI } from '../services/api';
import { useToast } from '../components/Toast';

const TYPES = ['All', 'Note', 'Highlight', 'Quote', 'Review'];

const NotesReviews = () => {
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editNoteId, setEditNoteId] = useState(null);

  const [form, setForm] = useState({
    book: '',
    title: '',
    content: '',
    type: 'Note',
    pageNumber: '',
    rating: 5,
  });

  const toast = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [notesRes, booksRes] = await Promise.all([
        notesAPI.getAll({ type: selectedType !== 'All' ? selectedType : undefined }),
        booksAPI.getAll(),
      ]);
      setNotes(notesRes.data || []);
      setBooks(booksRes.data || []);
      if (booksRes.data && booksRes.data.length > 0 && !form.book) {
        setForm((prev) => ({ ...prev, book: booksRes.data[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await notesAPI.delete(id);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      toast.success('Note removed');
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleOpenEdit = (note) => {
    setEditNoteId(note._id);
    setForm({
      book: note.book?._id || note.book,
      title: note.title || '',
      content: note.content || '',
      type: note.type || 'Note',
      pageNumber: note.pageNumber || '',
      rating: note.rating || 5,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || !form.book) {
      toast.error('Book and content are required');
      return;
    }

    try {
      if (editNoteId) {
        const res = await notesAPI.update(editNoteId, {
          ...form,
          pageNumber: form.pageNumber ? Number(form.pageNumber) : null,
          rating: form.type === 'Review' ? Number(form.rating) : null,
        });
        setNotes((prev) => prev.map((n) => (n._id === editNoteId ? res.data : n)));
        toast.success('Note updated');
      } else {
        const res = await notesAPI.create({
          ...form,
          pageNumber: form.pageNumber ? Number(form.pageNumber) : null,
          rating: form.type === 'Review' ? Number(form.rating) : null,
        });
        setNotes((prev) => [res.data, ...prev]);
        toast.success('Note created');
      }
      setShowModal(false);
      setEditNoteId(null);
      setForm({
        book: books[0]?._id || '',
        title: '',
        content: '',
        type: 'Note',
        pageNumber: '',
        rating: 5,
      });
    } catch (err) {
      toast.error('Failed to save note');
    }
  };

  // Filter notes by search text
  const filteredNotes = notes.filter((n) => {
    const text = `${n.title} ${n.content} ${n.book?.title || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <StickyNote className="w-7 h-7 text-indigo-400" /> Notes, Quotes & Reviews
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Personal reflections, captured quotes, and takeaways across your entire library ({notes.length} total)
          </p>
        </div>

        <button
          onClick={() => {
            setEditNoteId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Create New Note
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedType === t
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search notes, quotes, books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-800 rounded w-2/3" />
              <div className="h-16 bg-slate-800/50 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <StickyNote className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No notes found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Capture thoughts, quotes, or book reviews to retain and organize what you read.
          </p>
          <button
            onClick={() => {
              setEditNoteId(null);
              setShowModal(true);
            }}
            className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <div
              key={note._id}
              className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col justify-between space-y-4 transition-all group relative"
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        note.type === 'Quote'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : note.type === 'Highlight'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : note.type === 'Review'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {note.type}
                    </span>
                    {note.pageNumber && (
                      <span className="text-xs text-slate-400 font-mono">Page {note.pageNumber}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Attached Book Title */}
                {note.book && (
                  <Link
                    to={`/books/${note.book._id}`}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{note.book.title}</span>
                  </Link>
                )}

                {/* Title */}
                {note.title && <h3 className="font-bold text-white text-sm">{note.title}</h3>}

                {/* Content */}
                <p className={`text-xs text-slate-300 leading-relaxed whitespace-pre-line ${note.type === 'Quote' ? 'italic font-serif pl-2 border-l-2 border-amber-500/50' : ''}`}>
                  {note.type === 'Quote' ? `"${note.content}"` : note.content}
                </p>

                {note.type === 'Review' && note.rating && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold pt-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {note.rating} / 5 Rating
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                {note.chapter && <span className="truncate max-w-[120px]">{note.chapter}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editNoteId ? 'Edit Note' : 'Create New Note / Quote'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Book *
                </label>
                <select
                  required
                  value={form.book}
                  onChange={(e) => setForm({ ...form, book: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose a book --</option>
                  {books.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.title} ({b.author})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Note Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Note">Note</option>
                    <option value="Quote">Quote</option>
                    <option value="Highlight">Highlight</option>
                    <option value="Review">Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Page Number (optional)
                  </label>
                  <input
                    type="number"
                    value={form.pageNumber}
                    onChange={(e) => setForm({ ...form, pageNumber: e.target.value })}
                    placeholder="e.g. 124"
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Heading / Title (optional)
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Key Takeaway or Quote Context..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Content *
                </label>
                <textarea
                  rows="4"
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write your reflection, verbatim quote, or critique..."
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {form.type === 'Review' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Review Star Rating
                  </label>
                  <select
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  >
                    <option value={5}>5 Stars - Outstanding</option>
                    <option value={4}>4 Stars - Great Read</option>
                    <option value={3}>3 Stars - Good</option>
                    <option value={2}>2 Stars - Mixed</option>
                    <option value={1}>1 Star - Poor</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesReviews;
