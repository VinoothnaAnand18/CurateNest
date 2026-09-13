const Book = require('../models/Book');
const ReadingHistory = require('../models/ReadingHistory');
const ReadingGoal = require('../models/ReadingGoal');
const Note = require('../models/Note');

const seedUserData = async (userId) => {
  // Check if user already has books
  const existingCount = await Book.countDocuments({ user: userId });
  if (existingCount > 0) {
    return { message: 'User library already initialized' };
  }

  const sampleBooks = [
    {
      user: userId,
      title: 'Atomic Habits',
      author: 'James Clear',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      genre: 'Self-Help / Productivity',
      description: 'An easy and proven way to build good habits and break bad ones. Small changes make a remarkable difference.',
      totalPages: 320,
      currentPage: 183,
      status: 'Currently Reading',
      rating: 5,
      notes: 'Focus on identity-based habits rather than outcome-based goals.',
      startedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      format: 'Hardcover',
      tags: ['Habits', 'Productivity', 'Psychology'],
    },
    {
      user: userId,
      title: 'Deep Work',
      author: 'Cal Newport',
      cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
      genre: 'Productivity / Business',
      description: 'Rules for focused success in a distracted world. The ability to perform deep work is becoming increasingly rare and valuable.',
      totalPages: 304,
      currentPage: 304,
      status: 'Completed',
      rating: 5,
      notes: 'Schedule deep work blocks in advance. Eliminate social media distractions.',
      startedDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      format: 'Paperback',
      tags: ['Focus', 'Mastery', 'Career'],
    },
    {
      user: userId,
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      cover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=600',
      genre: 'Cognitive Psychology',
      description: 'Explores the two distinct modes of thought: fast, instinctive System 1, and slow, deliberative System 2.',
      totalPages: 499,
      currentPage: 142,
      status: 'Currently Reading',
      rating: 4,
      notes: 'System 1 jumps to conclusions; System 2 is lazy and requires deliberate effort to engage.',
      startedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      format: 'E-book',
      tags: ['Cognitive Science', 'Behavioral Economics'],
    },
    {
      user: userId,
      title: 'Dune',
      author: 'Frank Herbert',
      cover: 'https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=600',
      genre: 'Sci-Fi / Epic Fantasy',
      description: 'Set on the desert planet Arrakis, Dune tells the story of Paul Atreides as he navigates political intrigue and ecology.',
      totalPages: 688,
      currentPage: 688,
      status: 'Completed',
      rating: 5,
      notes: 'Masterpiece of ecology, politics, and human destiny.',
      startedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      completedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      format: 'Hardcover',
      tags: ['Sci-Fi', 'Classic', 'Worldbuilding'],
    },
    {
      user: userId,
      title: 'The Psychology of Money',
      author: 'Morgan Housel',
      cover: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=600',
      genre: 'Finance / Psychology',
      description: 'Timeless lessons on wealth, greed, and happiness. Doing well with money is more about behavior than math.',
      totalPages: 252,
      currentPage: 0,
      status: 'Wishlist',
      rating: 0,
      notes: '',
      format: 'Paperback',
      tags: ['Finance', 'Psychology', 'Mindset'],
    },
    {
      user: userId,
      title: 'Stolen Focus',
      author: 'Johann Hari',
      cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=600',
      genre: 'Social Science',
      description: 'Why you can’t pay attention—and how to think deeply again. An investigation into the systemic causes of our collective collapse in focus.',
      totalPages: 330,
      currentPage: 95,
      status: 'Paused',
      rating: 4,
      notes: 'Attention crisis is structural, not merely a personal failure of willpower.',
      startedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      format: 'Paperback',
      tags: ['Focus', 'Technology', 'Culture'],
    },
  ];

  const createdBooks = await Book.insertMany(sampleBooks);

  // Seed reading history across the past 14 days
  const historyEntries = [];
  const now = Date.now();
  const pagesDistribution = [22, 18, 35, 20, 0, 42, 30, 25, 15, 38, 45, 28, 32, 19];

  for (let i = 0; i < 14; i++) {
    const daysAgo = 13 - i;
    const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const pages = pagesDistribution[i];
    if (pages > 0) {
      historyEntries.push({
        user: userId,
        book: createdBooks[0]._id, // Atomic Habits
        pagesRead: pages,
        date,
        durationMinutes: Math.round(pages * 1.3),
      });
    }
  }

  await ReadingHistory.insertMany(historyEntries);

  // Seed annual reading goal
  await ReadingGoal.create({
    user: userId,
    title: '2026 Reading Challenge',
    target: 24,
    year: 2026,
    targetPages: 6500,
    progress: 2, // 2 completed books
  });

  // Seed notes
  await Note.create([
    {
      user: userId,
      book: createdBooks[0]._id,
      title: 'The 4 Laws of Behavior Change',
      content: '1. Make it obvious\n2. Make it attractive\n3. Make it easy\n4. Make it satisfying\n\nInversion for bad habits: make it invisible, unattractive, difficult, and unsatisfying.',
      type: 'Note',
      pageNumber: 54,
      chapter: 'The Fundamentals',
    },
    {
      user: userId,
      book: createdBooks[0]._id,
      title: 'Quote on Identity',
      content: '“Every action you take is a vote for the type of person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity.”',
      type: 'Quote',
      pageNumber: 38,
      chapter: 'How Habits Shape Identity',
    },
    {
      user: userId,
      book: createdBooks[1]._id,
      title: 'Deep Work Philosophy',
      content: 'A comprehensive review: Deep Work is an essential read for modern knowledge workers. Cal Newport clearly distinguishes between shallow busyness and high-value cognitive immersion.',
      type: 'Review',
      rating: 5,
      chapter: 'Conclusion',
    },
  ]);

  return { message: 'Demo library successfully seeded!', booksCount: createdBooks.length };
};

module.exports = { seedUserData };
