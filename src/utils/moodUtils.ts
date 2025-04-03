import { LucideIcon, SmilePlus, Smile, Meh, Frown, ThumbsDown, Cloud, CloudSun, CloudLightning, CloudRain, Heart, Zap, Coffee, Code, BookOpen, Users, Home, Sparkles } from "lucide-react";

export interface MoodEntry {
  id: string;
  mood: string;
  note?: string;
  tags?: string[];
  date: string;
  timestamp: number;
}

export interface MoodOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const MOODS: MoodOption[] = [
  { value: "great", label: "Great", icon: SmilePlus },
  { value: "good", label: "Good", icon: Smile },
  { value: "neutral", label: "Neutral", icon: Meh },
  { value: "bad", label: "Bad", icon: Frown },
  { value: "terrible", label: "Terrible", icon: ThumbsDown }
];

export const MOOD_TAGS: MoodOption[] = [
  { value: "productive", label: "Productive", icon: Zap },
  { value: "relaxed", label: "Relaxed", icon: CloudSun },
  { value: "loved", label: "Loved", icon: Heart },
  { value: "creative", label: "Creative", icon: Sparkles },
  { value: "social", label: "Social", icon: Users },
  { value: "stressed", label: "Stressed", icon: CloudLightning },
  { value: "tired", label: "Tired", icon: Coffee },
  { value: "focused", label: "Focused", icon: Code },
  { value: "inspired", label: "Inspired", icon: BookOpen },
  { value: "cozy", label: "Cozy", icon: Home },
  { value: "calm", label: "Calm", icon: Cloud },
  { value: "sad", label: "Sad", icon: CloudRain }
];

export const moodColors: Record<string, string> = {
  great: "#22c55e", // green-500
  good: "#3b82f6", // blue-500
  neutral: "#eab308", // yellow-500
  bad: "#f97316", // orange-500
  terrible: "#ef4444" // red-500
};

export const moodBackgroundColors: Record<string, string> = {
  great: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  good: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  neutral: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  bad: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  terrible: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
};

export function getMoodIcon(mood: string): LucideIcon | undefined {
  const moodItem = MOODS.find(m => m.value === mood);
  return moodItem?.icon;
}

export function getMoodColor(mood: string): string {
  return moodColors[mood] || "#64748b"; // slate-500 as default
}

export function getMoodBackgroundColor(mood: string): string {
  return moodBackgroundColors[mood] || "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400";
}

export function getMoodDescription(mood: string): string {
  switch (mood) {
    case "great":
      return "You're feeling amazing! Keep riding this positive wave.";
    case "good":
      return "You're doing well. Embrace this positive energy.";
    case "neutral":
      return "You're feeling balanced today. That's perfectly okay.";
    case "bad":
      return "You're not feeling your best. Be gentle with yourself today.";
    case "terrible":
      return "You're having a really tough time. Remember this will pass.";
    default:
      return "How are you feeling today?";
  }
}

export function saveMoodEntry(entry: MoodEntry): void {
  // Get existing entries from localStorage
  const entriesJson = localStorage.getItem("moodEntries");
  const entries: MoodEntry[] = entriesJson ? JSON.parse(entriesJson) : [];
  
  // Add new entry
  entries.push(entry);
  
  // Save back to localStorage
  localStorage.setItem("moodEntries", JSON.stringify(entries));
}

export function getMoodEntries(): MoodEntry[] {
  const entriesJson = localStorage.getItem("moodEntries");
  return entriesJson ? JSON.parse(entriesJson) : [];
}

export function calculateMoodStats(entries: MoodEntry[]) {
  const moodCounts: Record<string, number> = {
    great: 0,
    good: 0,
    neutral: 0,
    bad: 0,
    terrible: 0
  };
  
  const tagCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    // Count moods
    if (entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
    }
    
    // Count tags
    if (entry.tags) {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  
  // Calculate dominant mood
  let dominantMood = "neutral";
  let maxCount = 0;
  
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantMood = mood;
    }
  });
  
  // Calculate most common tags
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
  
  return {
    moodCounts,
    dominantMood,
    topTags,
    total: entries.length
  };
}

export function getConsecutiveDays(entries: MoodEntry[]): number {
  if (entries.length === 0) return 0;
  
  // Sort entries by timestamp in descending order (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  
  // Get today's date with time set to beginning of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let consecutiveDays = 0;
  let currentDate = today.getTime();
  
  // Loop through sorted entries
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    const entryTime = entryDate.getTime();
    
    // Check if this entry is for the expected date
    if (entryTime === currentDate) {
      consecutiveDays++;
      // Move to the previous day
      currentDate -= 86400000; // 24 hours in milliseconds
    } 
    // If we found an entry for a date before the expected date,
    // we broke the streak
    else if (entryTime < currentDate) {
      break;
    }
    // If this entry is for the same day as a previous entry,
    // continue checking entries
  }
  
  return consecutiveDays;
} 