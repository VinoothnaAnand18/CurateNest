import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  Heart,
  Flame,
  Target,
  Plus,
  Sparkles,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Library,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { booksAPI, progressAPI, goalsAPI } from '../services/api';
import StatCard from '../components/StatCard';
import BookCard from '../components/BookCard';
import { BookCardSkeleton } from '../components/SkeletonLoader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [books, setBooks] = useState([]);
  const [historyStats, setHistoryStats] = useState({ totalPagesRead: 0, streak: 0, history: [] });
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, historyRes, goalsRes] = await Promise.all([
        booksAPI.getAll(),
        progressAPI.getHistory(),
        goalsAPI.getAll(),
      ]);

      setBooks(booksRes.data || []);
      setHistoryStats(historyRes.data || { totalPagesRead: 0, streak: 0, history: [] });
      setGoals(goalsRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      await booksAPI.seed();
      toast.success('Sample books and reading history loaded!');
      await fetchData();
    } catch (err) {
      toast.error('Failed to seed demo data: ' + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const handleBookUpdated = (updatedBook) => {
    setBooks((prev) => prev.map((b) => (b._id === updatedBook._id ? updatedBook : b)));
    // Refresh history stats to update streak and pages read
    progressAPI.getHistory().then((res) => setHistoryStats(res.data));
  };

  // Metrics calculation
  const totalBooks = books.length;
  const currentlyReadingBooks = books.filter((b) => b.status === 'Currently Reading');
  const completedBooks = books.filter((b) => b.status === 'Completed');
  const wishlistBooks = books.filter((b) => b.status === 'Wishlist');
  const primaryGoal = goals[0] || { target: 20, progress: completedBooks.length, year: new Date().getFullYear() };
  const goalPercent = Math.min(Math.round((primaryGoal.progress / (primaryGoal.target || 1)) * 100), 100);

  // Prepare chart data for reading volume (past 7-14 entries)
  const chartData = (historyStats.history || [])
    .slice(0, 14)
    .reverse()
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pages: item.pagesRead,
    }));

  const displayChartData = chartData;

  // Genre distribution
  const genreCounts = {};
  books.forEach((b) => {
    const g = b.genre || 'Other';
    genreCounts[g] = (genreCounts[g] || 0) + 1;
  });
  const genreChartData = Object.keys(genreCounts).map((genre) => ({
    name: genre,
    value: genreCounts[genre],
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6 rounded-3xl border border-slate-800/80 shadow-xl">
        <div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            CurateNest Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2">
            Welcome back, {user?.name || 'Reader'} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your momentum, explore AI-synthesized insights, and chat with your library.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/books/new"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Book
          </Link>
          <Link
            to="/rag-chat"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileText className="w-4 h-4" /> Upload PDF (RAG)
          </Link>
          <Link
            to="/ai-assistant"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Ask AI
          </Link>
          {user?.isDemo && totalBooks === 0 && (
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} /> Load Sample Books
            </button>
          )}
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Books"
          value={totalBooks}
          icon={BookOpen}
          color="indigo"
          subtitle="In your library"
        />
        <StatCard
          title="Reading"
          value={currentlyReadingBooks.length}
          icon={BookmarkCheck}
          color="blue"
          subtitle="In progress"
        />
        <StatCard
          title="Completed"
          value={completedBooks.length}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Finished books"
        />
        <StatCard
          title="Wishlist"
          value={wishlistBooks.length}
          icon={Heart}
          color="amber"
          subtitle="Saved to read"
        />
        <StatCard
          title="Pages Read"
          value={historyStats.totalPagesRead || 0}
          icon={TrendingUp}
          color="purple"
          subtitle="Logged pages"
        />
        <StatCard
          title="Streak"
          value={`${historyStats.streak || 0}d`}
          icon={Flame}
          color="rose"
          subtitle="Daily momentum"
        />
      </div>

      {/* Goal Progress Banner */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {primaryGoal.title || `${primaryGoal.year} Reading Challenge`}
              </h3>
              <p className="text-xs text-slate-400">
                {primaryGoal.progress} of {primaryGoal.target} books completed •{' '}
                {Math.max(0, primaryGoal.target - primaryGoal.progress)} remaining
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-emerald-400">{goalPercent}%</span>
            <Link
              to="/goals"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Manage Goals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* Continue Reading Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Continue Reading</h2>
          </div>
          <Link
            to="/currently-reading"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View All ({currentlyReadingBooks.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : currentlyReadingBooks.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-white font-semibold">No books currently in progress</p>
            <p className="text-xs text-slate-400 mt-1">
              Pick a book from your wishlist or add a new one to start tracking.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Link
                to="/books/new"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
              >
                Add a Book
              </Link>
              <button
                onClick={handleSeedDemo}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
              >
                Load Demo Library
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentlyReadingBooks.slice(0, 4).map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onUpdated={handleBookUpdated}
              />
            ))}
          </div>
        )}
      </section>

      {/* Analytics & Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reading Velocity Area Chart */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Reading Velocity</h3>
              <p className="text-xs text-slate-400">Pages logged per reading session</p>
            </div>
            <Link
              to="/insights"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pages"
                  name="Pages Read"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPages)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Genre Breakdown Donut Chart */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Genre Distribution</h3>
            <p className="text-xs text-slate-400">Books by subject category</p>
          </div>

          {genreChartData.length > 0 ? (
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genreChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {genreChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-xs text-slate-400">
              No genre records yet
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
            {genreChartData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="truncate max-w-[100px]">{entry.name}</span>
                <span className="text-slate-400 font-mono">({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Recently Added to Library</h2>
          </div>
          <Link
            to="/library"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View All Books ({books.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {books.slice(0, 4).map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onUpdated={handleBookUpdated}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
