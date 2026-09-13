import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, Plus, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import { BookCardSkeleton } from '../components/SkeletonLoader';

const CurrentlyReading = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await booksAPI.getAll({ status: 'Currently Reading' });
      setBooks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleUpdated = (updated) => {
    if (updated.status !== 'Currently Reading') {
      setBooks((prev) => prev.filter((b) => b._id !== updated._id));
    } else {
      setBooks((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <BookmarkCheck className="w-7 h-7 text-indigo-400" /> Currently Reading
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Stay focused on the books you are currently actively progressing through ({books.length} active)
          </p>
        </div>

        <Link
          to="/books/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Start Reading Another Book
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No active books in progress</h3>
          <p className="text-xs text-slate-400 mt-1">
            Pick a book from your wishlist or add a new title to get started.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/wishlist"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Check Wishlist
            </Link>
            <Link
              to="/books/new"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700"
            >
              Add New Book
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {books.map((book) => (
            <BookCard key={book._id} book={book} onUpdated={handleUpdated} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrentlyReading;
