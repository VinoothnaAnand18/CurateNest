import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Save, Star, Image, Tags, Sparkles } from 'lucide-react';
import { booksAPI } from '../services/api';
import { useToast } from '../components/Toast';

const PRESET_COVERS = [
  { label: 'Non-Fiction / Habits', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600' },
  { label: 'Deep Work / Focus', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600' },
  { label: 'Psychology / Mind', url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600' },
  { label: 'Sci-Fi / Space', url: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=600' },
  { label: 'Finance / Wealth', url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600' },
  { label: 'Classic Minimalist', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600' },
];

const BookForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
    genre: 'Personal Growth',
    description: '',
    totalPages: 250,
    currentPage: 0,
    status: 'Currently Reading',
    rating: 0,
    notes: '',
    format: 'Paperback',
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      booksAPI
        .getById(id)
        .then((res) => {
          const b = res.data.book || res.data;
          setFormData({
            title: b.title || '',
            author: b.author || '',
            cover: b.cover || '',
            genre: b.genre || 'Personal Growth',
            description: b.description || '',
            totalPages: b.totalPages || 250,
            currentPage: b.currentPage || 0,
            status: b.status || 'Currently Reading',
            rating: b.rating || 0,
            notes: b.notes || '',
            format: b.format || 'Paperback',
            tags: Array.isArray(b.tags) ? b.tags.join(', ') : b.tags || '',
          });
        })
        .catch((err) => {
          toast.error('Failed to load book for editing');
          navigate('/library');
        })
        .finally(() => setFetching(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rate) => {
    setFormData((prev) => ({ ...prev, rating: rate === prev.rating ? 0 : rate }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error('Please enter Title and Author');
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await booksAPI.update(id, formData);
        toast.success('Book updated successfully');
      } else {
        await booksAPI.create(formData);
        toast.success('Book added to your library');
      }
      navigate('/library');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
        <p className="text-slate-400 text-xs mt-3">Loading book details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/library"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isEdit ? 'Edit Book Details' : 'Add New Book'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? 'Update metadata, rating, and notes' : 'Catalog a new book into your personal library'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cover preview & Presets */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-5 h-fit">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Cover Preview
          </label>
          <div className="aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 shadow-md relative">
            <img
              src={formData.cover}
              alt="Book cover preview"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600';
              }}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" /> Cover Image URL
            </label>
            <input
              type="url"
              name="cover"
              value={formData.cover}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <span className="block text-[11px] font-medium text-slate-400 mb-2">Or choose a cover preset:</span>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData((prev) => ({ ...prev, cover: preset.url }))}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-lg text-[10px] text-slate-300 truncate text-left transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form Details */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Book Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Atomic Habits"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Author *
              </label>
              <input
                type="text"
                name="author"
                required
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. James Clear"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Genre
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="e.g. Self-Help / Productivity"
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Reading Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="Currently Reading">Currently Reading</option>
                <option value="Completed">Completed</option>
                <option value="Wishlist">Wishlist</option>
                <option value="Paused">Paused</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Format
              </label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="Hardcover">Hardcover</option>
                <option value="Paperback">Paperback</option>
                <option value="E-book">E-book</option>
                <option value="Audiobook">Audiobook</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Pages
              </label>
              <input
                type="number"
                name="totalPages"
                min="1"
                value={formData.totalPages}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Current Page
              </label>
              <input
                type="number"
                name="currentPage"
                min="0"
                max={formData.totalPages}
                value={formData.currentPage}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Your Rating ({formData.rating} / 5 Stars)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className="p-1 text-slate-600 hover:text-amber-400 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, rating: 0 }))}
                  className="ml-3 text-[11px] text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tags className="w-3.5 h-3.5" /> Tags (comma separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Habits, Mindset, Behavioral Science"
              className="w-full px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Synopsis
            </label>
            <textarea
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Short overview of the book's premise..."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Personal Key Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Personal Notes / Initial Takeaways
            </label>
            <textarea
              rows="3"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Your initial impressions or why you want to read this..."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Link
              to="/library"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : isEdit ? 'Update Book' : 'Add to Library'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
