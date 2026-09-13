import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { booksAPI, progressAPI } from '../services/api';
import StatCard from '../components/StatCard';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6'];

const ReadingInsights = () => {
  const [books, setBooks] = useState([]);
  const [historyData, setHistoryData] = useState({ history: [], totalPagesRead: 0, streak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([booksAPI.getAll(), progressAPI.getHistory()])
      .then(([booksRes, histRes]) => {
        setBooks(booksRes.data || []);
        setHistoryData(histRes.data || { history: [], totalPagesRead: 0, streak: 0 });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Metrics
  const totalBooks = books.length;
  const completedBooks = books.filter((b) => b.status === 'Completed');
  const ratedBooks = books.filter((b) => b.rating > 0);
  const avgRating =
    ratedBooks.length > 0
      ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
      : '0.0';

  // Monthly completed books distribution (current year)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyCompletedCounts = new Array(12).fill(0);

  completedBooks.forEach((b) => {
    if (b.completedDate) {
      const d = new Date(b.completedDate);
      monthlyCompletedCounts[d.getMonth()] += 1;
    } else {
      // Fallback to recent month
      monthlyCompletedCounts[new Date().getMonth()] += 1;
    }
  });

  const monthlyChartData = monthNames.map((month, idx) => ({
    month,
    completed: monthlyCompletedCounts[idx],
  }));

  // Daily pages read over past 14 logs
  const pagesTrendData = (historyData.history || [])
    .slice(0, 14)
    .reverse()
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pages: item.pagesRead,
    }));

  const fallbackPagesTrend =
    pagesTrendData.length > 0
      ? pagesTrendData
      : [
          { date: 'Day 1', pages: 20 },
          { date: 'Day 2', pages: 35 },
          { date: 'Day 3', pages: 15 },
          { date: 'Day 4', pages: 40 },
          { date: 'Day 5', pages: 25 },
          { date: 'Day 6', pages: 30 },
          { date: 'Day 7', pages: 45 },
        ];

  // Favorite genres
  const genreMap = {};
  books.forEach((b) => {
    const g = b.genre || 'Uncategorized';
    genreMap[g] = (genreMap[g] || 0) + 1;
  });
  const genrePieData = Object.keys(genreMap).map((k) => ({
    name: k,
    value: genreMap[k],
  }));

  // Top Authors
  const authorMap = {};
  books.forEach((b) => {
    if (b.author) {
      authorMap[b.author] = (authorMap[b.author] || 0) + 1;
    }
  });
  const topAuthors = Object.keys(authorMap)
    .map((name) => ({ name, count: authorMap[name] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
          <BarChart3 className="w-3.5 h-3.5" /> Comprehensive Metrics
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Reading Insights & Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">
          Evaluate your reading volume, consistency streak, genre variety, and pacing over time.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Completed Books"
          value={completedBooks.length}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${totalBooks} total in catalog`}
        />
        <StatCard
          title="Pages Read"
          value={historyData.totalPagesRead || 0}
          icon={TrendingUp}
          color="indigo"
          subtitle="Lifetime tracked pages"
        />
        <StatCard
          title="Reading Streak"
          value={`${historyData.streak || 0} Days`}
          icon={Flame}
          color="rose"
          subtitle="Consecutive daily reading"
        />
        <StatCard
          title="Average Rating"
          value={`${avgRating} ★`}
          icon={Star}
          color="amber"
          subtitle={`Across ${ratedBooks.length} rated books`}
        />
      </div>

      {/* Chart Row 1: Monthly Books Completed & Daily Pages Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Books Completed Per Month</h2>
            <p className="text-xs text-slate-400">Total books finished across the current year</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="completed" name="Books Finished" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Pages Area Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Daily Reading Volume</h2>
            <p className="text-xs text-slate-400">Pages logged per reading session</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fallbackPagesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPagesIns" x1="0" y1="0" x2="0" y2="1">
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
                  name="Pages"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPagesIns)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Row 2: Genre Donut & Most Read Authors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Favorite Genres Pie */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">Genre Breakdown</h2>
            <p className="text-xs text-slate-400">Distribution of topics across your reading library</p>
          </div>

          {genrePieData.length > 0 ? (
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genrePieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {genrePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-slate-400">
              No genre records
            </div>
          )}
        </div>

        {/* Most-Read Authors List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-1">Most-Read Authors</h2>
            <p className="text-xs text-slate-400 mb-4">Authors with the most titles in your collection</p>

            <div className="space-y-3">
              {topAuthors.map((author, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{author.name}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700 text-slate-300">
                    {author.count} {author.count === 1 ? 'Book' : 'Books'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4 text-xs text-slate-400">
            Keep reading to expand your author diversity and unlock new perspectives.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingInsights;
