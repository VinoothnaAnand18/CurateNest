import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, BookOpen, Sparkles, Play } from 'lucide-react';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import { BookCardSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';

const Wishlist = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await booksAPI.getAll({ status: 'Wishlist' });
      setBooks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleStartReading = async (book) => {
    try {
      const res = await booksAPI.update(book._id, {
        status: 'Currently Reading',
        startedDate: new Date(),
      });
      setBooks((prev) => prev.filter((b) => b._id !== book._id));
      toast.success(`Started reading "${book.title}"! Moved to Currently Reading.`);
    } catch (err) {
      toast.error('Failed to update book status');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-amber-400 fill-amber-400/20" /> Reading Wishlist
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Books saved to read next. Curate your queue and dive in when ready ({books.length} queued)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/recommendations"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-400 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" /> AI Recommendations
          </Link>
          <Link
            to="/books/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Book to Wishlist
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <Heart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 mt-1">
            Discover new titles via AI recommendations or add books you plan to read next.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/recommendations"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Explore AI Recommendations
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {books.map((book) => (
            <div key={book._id} className="relative group">
              <BookCard book={book} />
              <button
                onClick={() => handleStartReading(book)}
                className="mt-2 w-full py-2 px-3 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Reading Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
