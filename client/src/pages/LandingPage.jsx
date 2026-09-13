import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  BarChart3,
  FileText,
  Compass,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Bookmark,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Personal Digital Library',
      description: 'Catalog your physical and digital books with custom tags, covers, genres, and reading statuses.',
      color: 'from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Progress Tracking',
      description: 'Log current pages, completion percentages, reading velocity, and keep active reading streaks alive.',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Sparkles,
      title: 'AI Book Assistant',
      description: 'Extract instant summaries, key takeaways, chapter-by-chapter breakdowns, and discussion questions via Gemini.',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      icon: FileText,
      title: 'Chat With Your Books (RAG)',
      description: 'Upload PDF books, chunk and index vectors, and hold contextual conversations with cited page references.',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    },
    {
      icon: Compass,
      title: 'Smart Recommendations',
      description: 'Receive AI suggestions tailored to your reading history, genres, and mood (Motivational, Relaxing, Mystery).',
      color: 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30',
    },
    {
      icon: BarChart3,
      title: 'Reading Insights & Goals',
      description: 'Interactive analytics powered by Recharts showing monthly completion volume, pages read, and annual goal targets.',
      color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Curate<span className="text-indigo-400">Nest</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative px-6 lg:px-12 pt-20 pb-16 max-w-6xl mx-auto text-center overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Book Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Curate<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Nest</span>
          </h1>
          <p className="text-lg sm:text-2xl font-medium text-slate-300 mt-4 max-w-3xl mx-auto">
            AI-Powered Smart Reading & Book Management Platform
          </p>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            Organize your books, track your reading journey, and unlock deeper insights with AI. 
            From personal progress tracking to conversational RAG search on your uploaded PDFs.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-105"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-base border border-slate-800 transition-colors flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>

          {/* Live Preview Card Mockup */}
          <div className="mt-16 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto text-left relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-slate-400 ml-2">app.curatenest.ai/dashboard</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Live Preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Currently Reading</span>
                  <span className="text-indigo-400 font-bold">57%</span>
                </div>
                <h4 className="font-bold text-white text-sm">Atomic Habits</h4>
                <p className="text-xs text-slate-400">James Clear</p>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[57%]" />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">183 / 320 pages read</p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Reading Goal</span>
                  <span className="text-emerald-400 font-bold">50%</span>
                </div>
                <h4 className="font-bold text-white text-sm">2026 Challenge</h4>
                <p className="text-xs text-slate-400">12 of 24 Books</p>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[50%]" />
                </div>
                <p className="text-[11px] text-emerald-400 mt-2 font-medium">🔥 14-day reading streak</p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Insight
                </div>
                <h4 className="font-bold text-white text-sm">Core Takeaway</h4>
                <p className="text-xs text-slate-300 mt-1 italic">
                  "You do not rise to the level of your goals. You fall to the level of your systems."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 lg:px-12 py-20 max-w-6xl mx-auto border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Designed for serious readers and curious minds
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              Everything you need to manage your library, stay accountable, and synthesize deep knowledge effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-gradient-to-br ${f.color} mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-6 lg:px-12 py-16 bg-gradient-to-b from-transparent to-indigo-950/20 border-t border-slate-800/80 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to elevate your reading journey?</h2>
          <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm">
            Join CurateNest today and turn every book into an actionable, retained asset.
          </p>
          <div className="mt-6">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 inline-flex items-center gap-2 transition-all"
            >
              Start Free Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 lg:px-12 text-center text-xs text-slate-400">
        <p>© 2026 CurateNest. AI-Powered Smart Reading & Book Management Platform.</p>
        <p className="mt-1 text-[11px] text-slate-400">Organize your books. Track your journey. Discover more.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
