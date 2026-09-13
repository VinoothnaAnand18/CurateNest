const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Fallback intelligent responses when Gemini API Key is missing or rate limited
const mockSummaryFallback = (title, author, genre) => {
  return `### Comprehensive Summary of "${title}" by ${author}

**Genre:** ${genre || 'Non-Fiction / Personal Development'}

#### Overview
"${title}" provides deep foundational frameworks and practical paradigms designed to transform how readers perceive their daily habits, cognitive models, and personal productivity. ${author} synthesizes research from behavioral psychology, neuroscience, and lived experiences into an accessible, actionable roadmap.

#### Core Thesis
True transformation stems not from radical, overnight shifts, but from consistent, iterative systems. By aligning identity with actionable processes and optimizing our environment, sustained success becomes an emergent byproduct rather than an arduous struggle.

#### Key Takeaways
1. **The Compounding Power of Tiny Shifts:** Small 1% improvements accumulate exponentially over time into remarkable differences.
2. **Systems Over Goals:** Winners and losers have the same goals. What distinguishes them is the durability of their daily execution systems.
3. **Identity-Based Transformation:** Meaningful changes endure when they become anchored in who you perceive yourself to be.
4. **Environment Architecture:** Design your surrounding space to make positive behaviors frictionless and counterproductive ones difficult.

#### Actionable Reflection
Evaluate one routine you performed today. Ask yourself: *"Does this habit cast a vote for the type of person I aspire to become?"*`;
};

const mockChapterBreakdownFallback = (title, author) => {
  return `### Chapter-by-Chapter Architecture for "${title}"

* **Part I: Foundations & Identity Architecture**
  Explores why tiny changes make a big difference. Covers the feedback loop of cue, craving, response, and reward, and shows how identity drives sustainable behavior.
* **Part II: The 1st Law — Make It Obvious**
  Focuses on implementation intentions and habit stacking. Shows how environment design drastically shapes human choices without requiring willpower.
* **Part III: The 2nd Law — Make It Attractive**
  Explores the neuroscience of dopamine and anticipation. Demonstrates temptation bundling and the pervasive influence of social norms and peer groups.
* **Part IV: The 3rd Law — Make It Easy**
  Highlights the Law of Least Effort and the 2-minute rule. Teaches how to automate good decisions and invert friction to eliminate detrimental habits.
* **Part V: The 4th Law — Make It Satisfying**
  Delves into immediate vs. delayed returns, habit trackers, and accountability partnerships to maintain long-term momentum.`;
};

const mockRecommendationsFallback = (mood = 'Motivational') => {
  const recommendationsPool = {
    Motivational: [
      {
        title: "Atomic Habits",
        author: "James Clear",
        genre: "Self-Help / Productivity",
        description: "An extraordinarily practical guide to breaking bad routines and building transformative daily habits through small 1% compounding shifts.",
        reason: "Matches your ambition for personal growth and actionable daily habit systems."
      },
      {
        title: "Deep Work",
        author: "Cal Newport",
        genre: "Business / Productivity",
        description: "Rules for focused success in a distracted world, teaching you how to master difficult cognitive tasks and produce elite results.",
        reason: "Recommended based on your interest in high-performance cognitive disciplines and focused work."
      },
      {
        title: "Can't Hurt Me",
        author: "David Goggins",
        genre: "Memoir / Mental Toughness",
        description: "A gripping account of overcoming unimaginable adversity through radical self-discipline and mental fortitude.",
        reason: "Selected for high-energy motivational momentum and relentless perseverance."
      }
    ],
    Relaxing: [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        genre: "Fiction / Philosophy",
        description: "Between life and death there is a library containing infinite books showing what your life would be had you made different choices.",
        reason: "Gentle, reflective, and deeply comforting for a peaceful evening read."
      },
      {
        title: "A Psalm for the Wild-Built",
        author: "Becky Chambers",
        genre: "Cozy Sci-Fi",
        description: "A tender dialogue between a tea monk and an ancient robot exploring purpose, stillness, and human needs in a lush utopia.",
        reason: "Warm, optimistic storytelling that invites you to slow down and breathe."
      }
    ],
    Mystery: [
      {
        title: "The Silent Patient",
        author: "Alex Michaelides",
        genre: "Psychological Thriller",
        description: "A famous painter shoots her husband five times in the face and never speaks another word; a criminal psychotherapist is determined to uncover why.",
        reason: "Fast-paced, suspenseful, and filled with clever psychological twists."
      },
      {
        title: "The Thursday Murder Club",
        author: "Richard Osman",
        genre: "Mystery / Crime",
        description: "Four retirees in a peaceful retirement village investigate unsolved crimes for fun until an actual murder happens on their doorstep.",
        reason: "Charming, witty mystery with memorable characters and clever clues."
      }
    ],
    Educational: [
      {
        title: "Thinking, Fast and Slow",
        author: "Daniel Kahneman",
        genre: "Cognitive Psychology",
        description: "Nobel laureate Daniel Kahneman explains the two systems that drive human thought: fast, intuitive System 1 and slow, deliberative System 2.",
        reason: "Provides deep psychological insight into how cognitive biases affect human decision making."
      },
      {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        genre: "History / Anthropology",
        description: "A sweeping exploration of how Homo sapiens conquered the globe through shared myths, agricultural revolutions, and scientific breakthroughs.",
        reason: "A foundational text on the biological and cognitive origins of modern human society."
      }
    ],
    Emotional: [
      {
        title: "When Breath Becomes Air",
        author: "Paul Kalanithi",
        genre: "Memoir / Philosophy",
        description: "A young neurosurgeon diagnosed with terminal stage IV lung cancer reflects on the meaning of life, death, and human connection.",
        reason: "Profoundly moving, poetic, and honest reflection on what makes a life meaningful."
      },
      {
        title: "A Man Called Ove",
        author: "Fredrik Backman",
        genre: "Fiction / Contemporary",
        description: "A grumpy yet lovable curmudgeon whose solitary life is upended by boisterous new neighbors and an unlikely feline friend.",
        reason: "Heartwarming, humorous, and deeply emotional exploration of community and love."
      }
    ]
  };

  return recommendationsPool[mood] || recommendationsPool.Motivational;
};

// Main AI Assistant endpoints
const generateSummary = async ({ title, author, genre, promptType = 'summary' }) => {
  const client = getGeminiClient();
  if (!client) {
    if (promptType === 'chapters') return mockChapterBreakdownFallback(title, author);
    return mockSummaryFallback(title, author, genre);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    let prompt = '';

    if (promptType === 'summary') {
      prompt = `Provide a comprehensive, high-quality summary and analysis for the book "${title}" by ${author} (Genre: ${genre || 'General'}).
Format your response in beautiful GitHub Markdown with:
1. **Overview & Context**
2. **Core Thesis**
3. **Key Takeaways (Bulleted with bold principles)**
4. **Actionable Lessons for the Reader**
Make it deeply insightful, practical, and clear.`;
    } else if (promptType === 'chapters') {
      prompt = `Provide a structured chapter-by-chapter (or key sections) breakdown of the book "${title}" by ${author}.
Highlight the core concept and takeaway of each major section. Use clean markdown formatting.`;
    } else if (promptType === 'questions') {
      prompt = `Generate 6-8 thought-provoking book club and personal reflection discussion questions for "${title}" by ${author}. Group them into:
- Conceptual Understandings
- Personal Application & Self-Reflection
- Critical Perspectives`;
    } else if (promptType === 'concepts') {
      prompt = `Extract and clearly explain the 4-5 most important mental models, psychological frameworks, or core concepts introduced in "${title}" by ${author}. Explain how to apply them in everyday life.`;
    } else {
      prompt = `Provide actionable wisdom and deep insights from the book "${title}" by ${author}.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini generateSummary Error:', error.message);
    if (promptType === 'chapters') return mockChapterBreakdownFallback(title, author);
    return mockSummaryFallback(title, author, genre);
  }
};

const generateRecommendations = async ({ userInterests, favoriteGenres, recentBooks, mood = 'Motivational' }) => {
  const client = getGeminiClient();
  if (!client) {
    return mockRecommendationsFallback(mood);
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are CurateNest's smart AI book curator.
User Profile:
- Interests: ${userInterests ? userInterests.join(', ') : 'Self-Improvement, Science, Fiction'}
- Favorite Genres: ${favoriteGenres ? favoriteGenres.join(', ') : 'Non-Fiction, Tech'}
- Recent Reads: ${recentBooks ? recentBooks.join(', ') : 'Atomic Habits, Deep Work'}
- Desired Reading Mood / Vibe: ${mood}

Generate 4 highly tailored, diverse book recommendations for this user.
Respond ONLY with a valid JSON array of objects with the following schema:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "genre": "Genre",
    "description": "2-3 sentences outlining the book's core premise.",
    "reason": "Specific sentence explaining why CurateNest recommends this for the user based on their mood and interests."
  }
]
Do not wrap in backticks or markdown fences, just pure JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : mockRecommendationsFallback(mood);
  } catch (error) {
    console.error('Gemini recommendations error:', error.message);
    return mockRecommendationsFallback(mood);
  }
};

const chatWithAssistant = async ({ message, bookTitle, bookAuthor, chatHistory = [] }) => {
  const client = getGeminiClient();
  if (!client) {
    return `**CurateNest AI Assistant (Offline/Demo Mode):**\n\nRegarding **"${bookTitle || 'your selected book'}"**${bookAuthor ? ` by ${bookAuthor}` : ''}:\n\nYour question was: *"\"${message}\""*\n\nIn this book, key themes emphasize intentionality, deliberate practice, and cognitive awareness. The author suggests evaluating our unconscious defaults and aligning daily practices with long-term aspirations.\n\n*(Note: To connect live Google Gemini intelligence, add your \`GEMINI_API_KEY\` in Settings or the backend \`.env\` file).*`;
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const formattedHistory = chatHistory.map((item) => `${item.role === 'user' ? 'User' : 'CurateNest'}: ${item.content}`).join('\n');

    const prompt = `You are CurateNest AI, an expert literary and non-fiction book assistant.
Book Context: "${bookTitle || 'General Book'}" ${bookAuthor ? `by ${bookAuthor}` : ''}.

Conversation History:
${formattedHistory}

Current User Query: "${message}"

Answer accurately, thoughtfully, and concisely in markdown. Reference specific ideas or chapters if known for this book. If the question is outside the scope of the book, answer politely while connecting back to reading concepts.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini chat assistant error:', error.message);
    return `I encountered a temporary connection error with Gemini API: ${error.message}. Please check your API key in Settings.`;
  }
};

module.exports = {
  generateSummary,
  generateRecommendations,
  chatWithAssistant,
  getGeminiClient,
};
