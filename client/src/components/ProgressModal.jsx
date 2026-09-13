import React, { useState } from 'react';
import { X, Check, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { progressAPI } from '../services/api';
import { useToast } from './Toast';

const ProgressModal = ({ book, isOpen, onClose, onUpdated }) => {
  if (!isOpen || !book) return null;

  const [currentPage, setCurrentPage] = useState(book.currentPage || 0);
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const totalPages = book.totalPages || 1;
  const progressPercent = Math.min(Math.round((currentPage / totalPages) * 100), 100);

  const handleIncrement = (amount) => {
    setCurrentPage((prev) => Math.min(prev + amount, totalPages));
  };

  const handleCompleteBook = () => {
    setCurrentPage(totalPages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await progressAPI.updateProgress(book._id, {
        currentPage,
        durationMinutes,
      });
      toast.success(
        currentPage >= totalPages
          ? `🎉 Congratulations on completing "${book.title}"!`
          : `Progress updated: ${currentPage} / ${totalPages} pages (${progressPercent}%)`
      );
      if (onUpdated) onUpdated(res.data.book);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">Update Reading Progress</h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">{book.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Progress Bar Display */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Completion</span>
              <span className="font-semibold text-indigo-400">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>0 pages</span>
              <span>{totalPages} pages total</span>
            </div>
          </div>

          {/* Current Page Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Current Page
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max={totalPages}
                value={currentPage}
                onChange={(e) => setCurrentPage(Math.min(Math.max(0, Number(e.target.value)), totalPages))}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <span className="absolute right-4 top-2.5 text-sm text-slate-400">/ {totalPages}</span>
            </div>
          </div>

          {/* Quick Increment Buttons */}
          <div className="space-y-1.5">
            <span className="text-xs text-slate-400">Quick increments:</span>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleIncrement(10)}
                className="py-1.5 px-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700/60 transition-colors"
              >
                +10 pgs
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(25)}
                className="py-1.5 px-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700/60 transition-colors"
              >
                +25 pgs
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(50)}
                className="py-1.5 px-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700/60 transition-colors"
              >
                +50 pgs
              </button>
              <button
                type="button"
                onClick={handleCompleteBook}
                className="py-1.5 px-2 text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded-lg border border-emerald-500/30 transition-colors"
              >
                Finish 🎉
              </button>
            </div>
          </div>

          {/* Session Duration */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Reading Duration (Minutes)
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
              className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Progress'}
              <Check className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgressModal;
