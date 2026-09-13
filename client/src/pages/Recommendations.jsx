import React, { useEffect, useState } from 'react';
import {
  Compass,
  Sparkles,
  Flame,
  Coffee,
  Search,
  Heart,
  BookOpen,
  Plus,
  Check,
  RefreshCw,
  GraduationCap,
} from 'lucide-react';
import { aiAPI, booksAPI } from '../services/api';
import { useToast } from '../components/Toast';

const MOODS = [
  { id: 'Motivational', label: 'Motivational', icon: Flame, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'Relaxing', label: 'Relaxing & Cozy', icon: Coffee, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'Mystery', label: 'Mystery & Thriller', icon: Search, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'Educational', label: 'Deep Learning', icon: GraduationCap, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'Emotional', label: 'Emotional & Moving', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
];

const Recommendations = () => {
  const [selectedMood, setSelectedMood] = useState('Motivational');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedTitles, setAddedTitles] = useState(new Set());
  const toast = useToast();

  const fetchRecommendations = async (mood) => {
    setLoading(true);
    try {
      const res = await aiAPI.getRecommendations({ mood: mood || selectedMood });
      setRecommendations(res.data.recommendations || []);
    } catch (err) {
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(selectedMood);
  }, [selectedMood]);

  const handleAddToWishlist = async (rec) => {
    try {
      await booksAPI.create({
        title: rec.title,
        author: rec.author,
        genre: rec.genre,
        description: rec.description,
        status: 'Wishlist',
        totalPages: 280,
        notes: `AI Recommendation (${selectedMood}): ${rec.reason}`,
      });
      setAddedTitles((prev) => new Set(prev).add(rec.title));
      toast.success(`"${rec.title}" added to your Wishlist!`);
    } catch (err) {
      toast.error('Failed to add book to wishlist');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Compass className="w-3.5 h-3.5" /> Tailored For You
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Smart Recommendations</h1>
          <p className="text-sm text-slate-400 mt-1">
            Curated by Gemini AI based on your reading tastes, preferred genres, and current reading mood.
          </p>
        </div>

        <button
          onClick={() => fetchRecommendations(selectedMood)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Suggestions
        </button>
      </div>

      {/* Mood Selector Chips */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-sm">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
          Select Your Reading Mood:
        </label>
        <div className="flex flex-wrap gap-2.5">
          {MOODS.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 scale-105'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse space-y-3">
              <div className="h-5 bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-800 rounded w-1/3" />
              <div className="h-16 bg-slate-800/50 rounded w-full mt-2" />
              <div className="h-10 bg-slate-800/40 rounded w-full" />
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-white font-semibold">No recommendations generated</p>
          <p className="text-xs text-slate-400 mt-1">
            Click Refresh Suggestions to ask Gemini for personalized picks.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recommendations.map((rec, idx) => {
            const isAdded = addedTitles.has(rec.title);
            return (
              <div
                key={idx}
                className="bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {rec.genre}
                      </span>
                      <h2 className="text-lg font-bold text-white mt-1.5 leading-snug">
                        {rec.title}
                      </h2>
                      <p className="text-xs text-slate-400">by {rec.author}</p>
                    </div>

                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>

                  {/* Why CurateNest Recommends this */}
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Why CurateNest Recommends This:
                    </span>
                    <p className="text-slate-400 italic">"{rec.reason}"</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleAddToWishlist(rec)}
                    disabled={isAdded}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added to Wishlist
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add to Wishlist
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
