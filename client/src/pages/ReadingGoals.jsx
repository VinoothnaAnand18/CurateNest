import React, { useEffect, useState } from 'react';
import { Target, Plus, CheckCircle2, Trophy, Clock, BookOpen, Flame, ArrowRight, Edit } from 'lucide-react';
import { goalsAPI, booksAPI } from '../services/api';
import { useToast } from '../components/Toast';

const ReadingGoals = () => {
  const [goals, setGoals] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [formTarget, setFormTarget] = useState(24);
  const [formTitle, setFormTitle] = useState('2026 Reading Challenge');
  const [formPages, setFormPages] = useState(6000);

  const toast = useToast();

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const [goalsRes, booksRes] = await Promise.all([
        goalsAPI.getAll(),
        booksAPI.getAll({ status: 'Completed' }),
      ]);
      setGoals(goalsRes.data || []);
      setCompletedCount(booksRes.data?.length || 0);
    } catch (err) {
      toast.error('Failed to load reading goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenEdit = (goal) => {
    setSelectedGoal(goal);
    setFormTarget(goal.target);
    setFormTitle(goal.title);
    setFormPages(goal.targetPages || 5000);
    setShowModal(true);
  };

  const handleOpenNew = () => {
    setSelectedGoal(null);
    setFormTarget(24);
    setFormTitle(`${new Date().getFullYear()} Reading Challenge`);
    setFormPages(6000);
    setShowModal(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    try {
      if (selectedGoal) {
        await goalsAPI.update(selectedGoal._id, {
          target: formTarget,
          title: formTitle,
          targetPages: formPages,
        });
        toast.success('Reading goal updated!');
      } else {
        await goalsAPI.create({
          target: formTarget,
          title: formTitle,
          year: new Date().getFullYear(),
          targetPages: formPages,
        });
        toast.success('New reading goal created!');
      }
      setShowModal(false);
      await fetchGoals();
    } catch (err) {
      toast.error('Failed to save goal');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" /> Accountability & Habits
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Reading Goals</h1>
          <p className="text-sm text-slate-400 mt-1">
            Set annual targets, track milestone completion, and stay consistent on your reading journey.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all w-fit"
        >
          <Plus className="w-4 h-4" /> Create New Goal
        </button>
      </div>

      {/* Primary Goal Spotlight Card */}
      {goals.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {(() => {
            const primary = goals[0];
            const progress = primary.progress || completedCount;
            const target = primary.target || 20;
            const pct = Math.min(Math.round((progress / target) * 100), 100);
            const remaining = Math.max(0, target - progress);

            return (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <Target className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Active Challenge ({primary.year})
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                        {primary.title}
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(primary)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5 text-indigo-400" /> Adjust Target
                  </button>
                </div>

                {/* Progress Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Completed</span>
                    <p className="text-2xl font-extrabold text-white mt-0.5">
                      {progress} <span className="text-xs font-normal text-slate-400">/ {target} Books</span>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Progress</span>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-0.5">{pct}%</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Remaining to Goal</span>
                    <p className="text-2xl font-extrabold text-amber-400 mt-0.5">
                      {remaining} <span className="text-xs font-normal text-slate-400">Books</span>
                    </p>
                  </div>
                </div>

                {/* Big Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>0 books</span>
                    <span>Target: {target} books</span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Goal History / Additional Goals */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">All Reading Milestones</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const pct = Math.min(Math.round((g.progress / (g.target || 1)) * 100), 100);
            return (
              <div
                key={g._id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{g.title}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {g.year}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-300">
                  <span>{g.progress} / {g.target} Books</span>
                  <span className="font-bold text-emerald-400">{pct}% Completed</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {selectedGoal ? 'Update Reading Goal' : 'Create New Reading Goal'}
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Number of Books
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="500"
                  value={formTarget}
                  onChange={(e) => setFormTarget(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Pages (Optional)
                </label>
                <input
                  type="number"
                  min="100"
                  value={formPages}
                  onChange={(e) => setFormPages(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadingGoals;
