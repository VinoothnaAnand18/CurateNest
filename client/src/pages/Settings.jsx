import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Moon,
  Sun,
  Shield,
  Key,
  Server,
  Database,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, booksAPI } from '../services/api';
import { useToast } from '../components/Toast';
import axios from 'axios';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [interests, setInterests] = useState((user?.interests || []).join(', '));
  const [favoriteGenres, setFavoriteGenres] = useState((user?.favoriteGenres || []).join(', '));
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    // Check backend health and environment readiness
    axios
      .get('/api/health')
      .then((res) => setSystemStatus(res.data))
      .catch(() => setSystemStatus({ status: 'offline' }));
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const interestsArray = interests.split(',').map((s) => s.trim()).filter(Boolean);
      const genresArray = favoriteGenres.split(',').map((s) => s.trim()).filter(Boolean);

      const res = await authAPI.updateProfile({
        name,
        interests: interestsArray,
        favoriteGenres: genresArray,
      });
      updateUser(res.data);
      toast.success('Profile preferences updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedLibrary = async () => {
    setSeeding(true);
    try {
      await booksAPI.seed();
      toast.success('Sample books & reading records seeded successfully!');
    } catch (err) {
      toast.error('Failed to seed sample books');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-indigo-400" /> Account & App Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your reader profile, appearance, connected AI models, and demo data.
        </p>
      </div>

      {/* System & AI Service Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" /> System Architecture & AI Diagnostics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-medium">Backend Server</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${systemStatus?.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="text-white font-semibold capitalize">{systemStatus?.status || 'Active'}</span>
            </div>
            <p className="text-[11px] text-slate-400">Node.js / Express REST API</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-medium">Database Layer</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-white font-semibold">MongoDB / Memory Server</span>
            </div>
            <p className="text-[11px] text-slate-400">Connected with auto-fallback</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-medium">Google Gemini & RAG</span>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${systemStatus?.geminiConfigured ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
              <span className="text-white font-semibold">
                {systemStatus?.geminiConfigured ? 'Gemini Live' : 'Intelligent Mode'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Vector Chunking & Synthesis</p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" /> Reader Profile
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Interests (comma separated)
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. Cognitive Psychology, High Performance, Sci-Fi"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Favorite Genres (comma separated)
            </label>
            <input
              type="text"
              value={favoriteGenres}
              onChange={(e) => setFavoriteGenres(e.target.value)}
              placeholder="e.g. Productivity, Non-Fiction, Philosophy"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Appearance & Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              {isDark ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
              Theme Mode
            </h2>
            <p className="text-xs text-slate-400">
              CurateNest provides both a high-contrast dark palette and a clean light interface.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            Switch to {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Demo Data Management */}
        {user?.isDemo && <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Database className="w-5 h-5 text-emerald-400" /> Sample Library Demo
            </h2>
            <p className="text-xs text-slate-400">
              Instantly re-populate your account with realistic books, reading logs, streaks, and notes.
            </p>
          </div>

          <button
            onClick={handleSeedLibrary}
            disabled={seeding}
            className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'Seeding Library...' : 'Populate Sample Books & Stats'}
          </button>
        </div>}
      </div>
    </div>
  );
};

export default Settings;
