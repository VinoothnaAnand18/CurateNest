import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, BookOpen, Sparkles, MoreVertical, Edit, Trash2, CheckCircle, Clock } from 'lucide-react';
import ProgressModal from './ProgressModal';

const BookCard = ({ book, onUpdated, onDelete }) => {
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const totalPages = book.totalPages || 1;
  const currentPage = book.currentPage || 0;
  const progressPercent = Math.min(Math.round((currentPage / totalPages) * 100), 100);

  const statusColors = {
    'Currently Reading': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Completed': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'Wishlist': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Paused': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <>
      <div className="group bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col justify-between relative backdrop-blur-sm">
        <div>
          {/* Cover & Badges */}
          <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-inner">
            <img
              src={book.cover}
              alt={book.title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Status Pill */}
            <span
              className={`absolute top-2.5 left-2.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-md shadow-md ${
                statusColors[book.status] || statusColors['Currently Reading']
              }`}
            >
              {book.status}
            </span>

            {/* Quick Actions Dropdown */}
            <div className="absolute top-2.5 right-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 rounded-lg bg-slate-950/70 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-20 text-xs text-slate-200"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/books/${book._id}/edit`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5 text-indigo-400" /> Edit Book
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/ai-assistant?bookTitle=${encodeURIComponent(book.title)}&bookAuthor=${encodeURIComponent(book.author)}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Ask AI
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(book._id);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-rose-500/10 text-rose-400 flex items-center gap-2 border-t border-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <Link to={`/books/${book._id}`} className="block group-hover:text-indigo-400 transition-colors">
            <h3 className="font-semibold text-white text-base leading-snug line-clamp-1">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{book.author}</p>

          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
              {book.genre || 'General'}
            </span>

            {/* Stars */}
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold text-slate-200">
                {book.rating > 0 ? book.rating : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">
              {currentPage} / {totalPages} pgs
            </span>
            <span className="font-bold text-indigo-400">{progressPercent}%</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setShowProgressModal(true)}
              className="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700/60 transition-colors flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Update
            </button>
            <Link
              to={`/ai-assistant?bookTitle=${encodeURIComponent(book.title)}&bookAuthor=${encodeURIComponent(book.author)}`}
              className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 transition-colors"
              title="Ask AI about this book"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <ProgressModal
        book={book}
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        onUpdated={onUpdated}
      />
    </>
  );
};

export default BookCard;
