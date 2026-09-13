import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Star,
  Edit,
  Trash2,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  StickyNote,
  Plus,
  Quote,
  Highlighter,
  MessageSquare,
} from 'lucide-react';
import { booksAPI, notesAPI, progressAPI } from '../services/api';
import ProgressModal from '../components/ProgressModal';
import { useToast } from '../components/Toast';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // New Note state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    type: 'Note',
    pageNumber: '',
  });

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await booksAPI.getById(id);
      setBook(res.data.book);
      setNotes(res.data.notes || []);
    } catch (err) {
      toast.error('Could not load book');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${book?.title}"?`)) return;
    try {
      await booksAPI.delete(id);
      toast.success('Book deleted');
      navigate('/library');
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteForm.content.trim()) return;
    try {
      const res = await notesAPI.create({
        book: id,
        ...noteForm,
        pageNumber: noteForm.pageNumber ? Number(noteForm.pageNumber) : null,
      });
      setNotes((prev) => [res.data, ...prev]);
      setNoteForm({ title: '', content: '', type: 'Note', pageNumber: '' });
      setShowNoteModal(false);
      toast.success('Note added');
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      toast.success('Note removed');
    } catch (err) {
      toast.error('Failed to remove note');
    }
  };

  if (loading || !book) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-400 text-xs mt-3">Loading book overview...</p>
      </div>
    );
  }

  const totalPages = book.totalPages || 1;
  const currentPage = book.currentPage || 0;
  const progressPercent = Math.min(Math.round((currentPage / totalPages) * 100), 100);
  const remainingPages = Math.max(0, totalPages - currentPage);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Library
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/books/${book._id}/edit`}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Edit className="w-3.5 h-3.5 text-indigo-400" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 text-rose-400 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Book Hero Card */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cover */}
          <div className="w-full md:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-slate-800 border border-slate-700/60 mx-auto md:mx-0">
            <img
              src={book.cover}
              alt={book.title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {book.genre || 'Non-Fiction'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {book.status}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-400">
                  {book.format}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {book.title}
              </h1>
              <p className="text-base text-slate-300 font-medium mt-1">by {book.author}</p>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-3 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-300 ml-1">
                  {book.rating > 0 ? `${book.rating}.0 / 5.0` : 'Unrated'}
                </span>
              </div>
            </div>

            {/* Reading Progress Bar Box */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400">Reading Completion</span>
                  <p className="text-lg font-bold text-white">
                    {currentPage} <span className="text-xs text-slate-400 font-normal">of {totalPages} pages</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold text-indigo-400">{progressPercent}%</span>
                  <p className="text-xs text-slate-400">{remainingPages} pages left</p>
                </div>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setShowProgressModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/25 flex items-center gap-2 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5" /> Update Reading Progress
                </button>

                <Link
                  to={`/ai-assistant?bookTitle=${encodeURIComponent(book.title)}&bookAuthor=${encodeURIComponent(book.author)}`}
                  className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Summary & Breakdown
                </Link>
              </div>
            </div>

            {/* Tags & Dates */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-400 border-t border-slate-800/60">
              <div className="flex flex-wrap gap-1.5">
                {book.tags && book.tags.length > 0 ? (
                  book.tags.map((t, idx) => (
                    <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300">
                      #{t}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">No tags added</span>
                )}
              </div>

              <div className="flex items-center gap-4">
                {book.startedDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Started: {new Date(book.startedDate).toLocaleDateString()}
                  </span>
                )}
                {book.completedDate && (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Finished: {new Date(book.completedDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description / Synopsis */}
      {book.description && (
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-2">
          <h2 className="text-base font-bold text-white">Synopsis & Overview</h2>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{book.description}</p>
        </div>
      )}

      {/* Personal Notes, Quotes & Reviews */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Notes, Quotes & Highlights ({notes.length})</h2>
          </div>
          <button
            onClick={() => setShowNoteModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" /> Add Note
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center">
            <StickyNote className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No notes for this book yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Capture your key reflections, quotes, chapter insights, or highlights while reading.
            </p>
            <button
              onClick={() => setShowNoteModal(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Add First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm relative group space-y-3"
              >
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
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 p-1 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {note.title && <h3 className="font-bold text-white text-sm">{note.title}</h3>}
                <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed italic">
                  {note.content}
                </p>
                <span className="block text-[10px] text-slate-400">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Modal */}
      <ProgressModal
        book={book}
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        onUpdated={(updated) => setBook(updated)}
      />

      {/* New Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add Note or Highlight</h3>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Type</label>
                  <select
                    value={noteForm.type}
                    onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  >
                    <option value="Note">Note</option>
                    <option value="Quote">Quote</option>
                    <option value="Highlight">Highlight</option>
                    <option value="Review">Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Page Number</label>
                  <input
                    type="number"
                    value={noteForm.pageNumber}
                    onChange={(e) => setNoteForm({ ...noteForm, pageNumber: e.target.value })}
                    placeholder="e.g. 42"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="Key takeaway heading..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Content *</label>
                <textarea
                  rows="4"
                  required
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Write your note, reflection, or favorite quote here..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
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

export default BookDetails;
