import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List as ListIcon,
  Sparkles,
  RefreshCw,
  X,
  Trash2,
} from 'lucide-react';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import { BookCardSkeleton, TableSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../components/Toast';

const STATUS_TABS = ['All', 'Currently Reading', 'Completed', 'Wishlist', 'Paused'];

const MyLibrary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [genre, setGenre] = useState('All');
  const [search, setSearch] = useState(initialSearch);
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [seeding, setSeeding] = useState(false);

  const toast = useToast();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const params = {};
      if (status !== 'All') params.status = status;
      if (genre !== 'All') params.genre = genre;
      if (search.trim()) params.search = search.trim();
      if (sort) params.sort = sort;

      const res = await booksAPI.getAll(params);
      setBooks(res.data || []);
    } catch (err) {
      toast.error('Failed to load books: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [status, genre, sort]);

  // Handle URL query parameter changes
  useEffect(() => {
    if (initialSearch !== search) {
      setSearch(initialSearch);
      fetchBooks();
    }
  }, [initialSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks((prev) => prev.map((b) => (b._id === updatedBook._id ? updatedBook : b)));
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to remove this book from your library?')) return;
    try {
      await booksAPI.delete(bookId);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      toast.success('Book removed from library');
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await booksAPI.seed();
      toast.success('Sample books loaded!');
      await fetchBooks();
    } catch (err) {
      toast.error('Failed to seed books');
    } finally {
      setSeeding(false);
    }
  };

  // Distinct genres
  const availableGenres = Array.from(
    new Set(books.map((b) => b.genre).filter(Boolean))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-indigo-400" /> My Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse, manage, and track your personal book collection ({books.length} books)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/books/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Book
          </Link>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800/80">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                status === tab
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Controls Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search title, author, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSearchParams({});
                  fetchBooks();
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Genre Select */}
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="bg-slate-800/80 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none focus:border-indigo-500"
            >
              <option value="All">All Genres</option>
              {availableGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer py-1 text-xs"
              >
                <option value="newest" className="bg-slate-900">Recently Updated</option>
                <option value="rating_desc" className="bg-slate-900">Highest Rated</option>
                <option value="title_asc" className="bg-slate-900">Title (A - Z)</option>
                <option value="progress_desc" className="bg-slate-900">Most Progress</option>
                <option value="oldest" className="bg-slate-900">Date Added (Oldest)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="List view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Book Grid / List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white">No books match your filters</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query, status tab, or add a new title to your library.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/books/new"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20"
            >
              Add New Book
            </Link>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin' : ''}`} /> Load Sample Books
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {books.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onUpdated={handleBookUpdated}
              onDelete={handleDeleteBook}
            />
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800">
          {books.map((book) => {
            const totalPages = book.totalPages || 1;
            const currentPage = book.currentPage || 0;
            const progress = Math.min(Math.round((currentPage / totalPages) * 100), 100);

            return (
              <div
                key={book._id}
                className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={book.cover}
                    alt={book.title}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
                    }}
                    className="w-12 h-16 object-cover rounded-lg shrink-0 shadow-md bg-slate-800"
                  />
                  <div>
                    <Link
                      to={`/books/${book._id}`}
                      className="font-bold text-white text-sm hover:text-indigo-400 transition-colors line-clamp-1"
                    >
                      {book.title}
                    </Link>
                    <p className="text-xs text-slate-400">{book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {book.genre}
                      </span>
                      <span className="text-[10px] text-amber-400 font-bold">★ {book.rating || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <div className="w-36">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">{currentPage}/{totalPages} pgs</span>
                      <span className="font-semibold text-indigo-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/ai-assistant?bookTitle=${encodeURIComponent(book.title)}&bookAuthor=${encodeURIComponent(book.author)}`}
                      className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="AI Summary"
                    >
                      <Sparkles className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDeleteBook(book._id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
