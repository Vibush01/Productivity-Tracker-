const motivationalQuotes = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It's not about being the best. It's about being better than you were yesterday.", author: "Anonymous" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You don't have to be extreme, just consistent.", author: "Anonymous" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "A year from now, you'll wish you had started today.", author: "Karen Lamb" },
  { text: "Productivity is never an accident. It is always the result of commitment to excellence.", author: "Paul J. Meyer" },
  { text: "The habit of persistence is the habit of victory.", author: "Herbert Kaufman" },
  { text: "Every action you take is a vote for the type of person you wish to become.", author: "James Clear" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "The chains of habit are too light to be felt until they are too heavy to be broken.", author: "Warren Buffett" },
  { text: "First forget inspiration. Habit is more dependable.", author: "Octavia Butler" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "The difference between who you are and who you want to be is what you do.", author: "Anonymous" },
  { text: "Be stronger than your strongest excuse.", author: "Anonymous" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Don't decrease the goal. Increase the effort.", author: "Anonymous" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Anonymous" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The only bad workout is the one that didn't happen.", author: "Anonymous" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Your only limit is the amount of action you're willing to take.", author: "Anonymous" },
  { text: "Consistency is what transforms average into excellence.", author: "Anonymous" },
  { text: "Progress, not perfection.", author: "Anonymous" },
  { text: "One day or day one. You decide.", author: "Anonymous" },
  { text: "Great things never come from comfort zones.", author: "Anonymous" },
  { text: "Dream it. Believe it. Build it.", author: "Anonymous" },
  { text: "Stay focused and never give up on the things that make your heart sing.", author: "Anonymous" },
  { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred Devito" },
  { text: "Make each day your masterpiece.", author: "John Wooden" },
  { text: "The only person you should try to be better than is the person you were yesterday.", author: "Anonymous" },
];

const accountabilityMessages = [
  "Remember, the only person you're reporting to is your future self.",
  "We can't verify this — but your productivity can. Be honest.",
  "Lying here doesn't fool us. It fools the person you're trying to become.",
  "Your streak is real only if your effort is.",
  "Consistency built on honesty is the only kind that lasts.",
  "This isn't about impressing anyone. It's about becoming someone.",
  "The scoreboard only matters if the game was played fair.",
  "Your future self is watching. Make them proud — honestly.",
  "A fake streak is just a decorated lie. Keep it real.",
  "Every honest log is a brick. Every lie is a crack in your foundation.",
  "You're not competing with others. You're competing with who you were yesterday.",
  "Integrity is doing the right thing, even when no one is watching.",
  "Track truthfully. Grow genuinely. Win authentically.",
  "The only shortcut to success is honesty about where you stand.",
  "Cheating your tracker is cheating yourself out of growth.",
];

const honestyCheckPrompts = [
  "Looking back at this week — were all your habit logs accurate? It's okay if they weren't. Correcting them is a sign of strength, not weakness.",
  "Weekly honesty check: Did you truly complete everything you logged? Remember, honest tracking leads to real growth.",
  "Time for a reality check! Review your week honestly. Adjusting past logs shows maturity, not failure.",
  "Reflection moment: Were there any habits you logged but didn't fully complete? Being truthful with yourself is the first step to real progress.",
  "Your weekly check-in: We trust you, but do you trust your logs? Take a moment to verify your week.",
];

const suspiciousStreakMessages: { [key: string]: string[] } = {
  short: [], // < 14 days — no teasing
  medium: [ // 14-30 days
    "{{streak}} days perfect? That's impressive! We can't verify it, so your integrity is what makes this streak real. Keep being honest with yourself.",
    "{{streak}}-day streak! Amazing discipline. Just a reminder — this number means everything if it's real, and nothing if it's not.",
  ],
  long: [ // 30-60 days
    "{{streak}} days straight! You're either incredibly disciplined or... well, we choose to believe in you. 💪",
    "A {{streak}}-day streak is legendary territory. We're cheering for you — as long as every log was earned, not just clicked.",
    "{{streak}} days! Your consistency is almost suspicious... just kidding 😄 (but seriously, keep it honest)",
  ],
  extreme: [ // 60+ days
    "{{streak}} days?! You're either a machine or a legend. We're going with legend — as long as it's all real. 🏆",
    "Wow, {{streak}} days. At this point we have to ask... are you logging habits or just clicking buttons? 😏 (We trust you, but your future self doesn't tolerate shortcuts)",
    "{{streak}}-day streak! This is world-class consistency. Remember: lying to your tracker is lying to the person you're building. Stay genuine.",
  ],
};

export const getRandomQuote = () => {
  const index = Math.floor(Math.random() * motivationalQuotes.length);
  return motivationalQuotes[index];
};

export const getAccountabilityMessage = () => {
  const index = Math.floor(Math.random() * accountabilityMessages.length);
  return accountabilityMessages[index];
};

export const getHonestyCheckPrompt = () => {
  const index = Math.floor(Math.random() * honestyCheckPrompts.length);
  return honestyCheckPrompts[index];
};

export const getSuspiciousStreakMessage = (streakLength: number): string | null => {
  let category: string;
  if (streakLength < 14) return null;
  else if (streakLength < 30) category = 'medium';
  else if (streakLength < 60) category = 'long';
  else category = 'extreme';

  const messages = suspiciousStreakMessages[category];
  if (!messages || messages.length === 0) return null;

  const index = Math.floor(Math.random() * messages.length);
  return messages[index].replace('{{streak}}', streakLength.toString());
};

export const getDailyQuote = () => {
  // Use day of year as seed for consistent daily quote
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = dayOfYear % motivationalQuotes.length;
  return motivationalQuotes[index];
};
