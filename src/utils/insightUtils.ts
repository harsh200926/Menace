
import { addDays, differenceInDays, format, parseISO, startOfDay, isSameDay } from "date-fns";

// Define types for our insights
export interface Insight {
  id: string;
  type: "productivity" | "mood" | "habit" | "goal" | "general";
  message: string;
  impact: "positive" | "neutral" | "negative";
  date: string;
}

export interface ProductivityData {
  date: string;
  habitCompletionRate: number;
  goalProgress: number;
  activityCount: number;
  moodScore?: number;
}

// Generate insights based on user data
export const generateInsights = (
  habits: any[],
  goals: any[],
  journalEntries: any[],
  moodEntries: any[],
  history: any[]
): Insight[] => {
  const insights: Insight[] = [];
  const today = new Date();
  const startDate = addDays(today, -30); // Get data from last 30 days
  
  // Prepare data for analysis
  const productivityData = prepareProductivityData(
    habits,
    goals,
    journalEntries,
    moodEntries,
    history,
    startDate,
    today
  );

  // Generate productivity insights
  const productivityInsights = analyzeProductivity(productivityData);
  insights.push(...productivityInsights);

  // Generate mood insights
  if (moodEntries && moodEntries.length > 0) {
    const moodInsights = analyzeMood(productivityData, moodEntries);
    insights.push(...moodInsights);
  }

  // Generate habit insights
  if (habits && habits.length > 0) {
    const habitInsights = analyzeHabits(habits);
    insights.push(...habitInsights);
  }

  // Generate goal insights
  if (goals && goals.length > 0) {
    const goalInsights = analyzeGoals(goals);
    insights.push(...goalInsights);
  }

  // Add some general insights if we have few specific ones
  if (insights.length < 3) {
    insights.push({
      id: `general-${Date.now()}`,
      type: "general",
      message: "Start tracking more activities to get personalized insights!",
      impact: "neutral",
      date: new Date().toISOString()
    });
  }

  return insights;
};

// Calculate productivity score (0-100)
export const calculateProductivityScore = (
  habits: any[],
  goals: any[],
  moodEntries: any[],
  history: any[]
): number => {
  let score = 50; // Default score
  
  // Score based on habit completion (up to 30 points)
  if (habits && habits.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const dailyHabits = habits.filter(h => h.frequency === "daily");
    const completedToday = dailyHabits.filter(h => 
      h.completedDates.includes(today)
    );
    
    const habitScore = dailyHabits.length > 0
      ? (completedToday.length / dailyHabits.length) * 30
      : 0;
    
    score += habitScore;
  }
  
  // Score based on goal progress (up to 30 points)
  if (goals && goals.length > 0) {
    const goalProgress = goals.reduce((sum, goal) => {
      return sum + (goal.progress / goal.target);
    }, 0) / goals.length;
    
    score += goalProgress * 30;
  }
  
  // Score based on mood (up to 20 points)
  if (moodEntries && moodEntries.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const lastWeekEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const weekAgo = addDays(new Date(), -7);
      return entryDate >= weekAgo;
    });
    
    if (lastWeekEntries.length > 0) {
      const moodMap: Record<string, number> = {
        "terrible": 0,
        "bad": 25,
        "neutral": 50,
        "good": 75,
        "great": 100
      };
      
      const avgMoodScore = lastWeekEntries.reduce((sum, entry) => {
        return sum + (moodMap[entry.mood] || 50);
      }, 0) / lastWeekEntries.length;
      
      // Mood contributes 20% to the total score
      score = (score * 0.8) + (avgMoodScore * 0.2);
    }
  }
  
  // Score based on activity (up to 20 points)
  if (history && history.length > 0) {
    const last7days = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      const weekAgo = addDays(new Date(), -7);
      return itemDate >= weekAgo;
    });
    
    // More than 20 activities in a week is considered very active
    const activityScore = Math.min(last7days.length / 20 * 20, 20);
    score += activityScore;
  }
  
  return Math.round(score);
};

// Get productivity recommendations based on data analysis
export const getRecommendations = (
  habits: any[],
  goals: any[],
  journalEntries: any[],
  moodEntries: any[],
  productivityScore: number
): string[] => {
  const recommendations: string[] = [];
  
  // Recommendations based on productivity score
  if (productivityScore < 40) {
    recommendations.push("Try breaking down your goals into smaller, more manageable tasks.");
    recommendations.push("Set specific times for your most important tasks each day.");
  } else if (productivityScore < 70) {
    recommendations.push("Consider starting your day with your most challenging task.");
    recommendations.push("Try the Pomodoro technique: 25 minutes of focused work followed by a 5-minute break.");
  } else {
    recommendations.push("Great job! To maintain your productivity, make sure to schedule regular breaks.");
    recommendations.push("Consider sharing your methods with others who might benefit from your approach.");
  }
  
  // Mood-specific recommendations
  if (moodEntries && moodEntries.length > 0) {
    const moods = moodEntries.map(entry => entry.mood);
    const negativeCount = moods.filter(mood => ["bad", "terrible"].includes(mood)).length;
    
    if (negativeCount > moods.length * 0.3) {
      recommendations.push("Your mood has been low recently. Try adding a short mindfulness session to your daily routine.");
      recommendations.push("Consider tracking what activities boost your mood and incorporate more of them into your routine.");
    }
    
    // Check for patterns between mood and productivity
    const lowMoodDays = moodEntries.filter(entry => entry.mood === "bad" || entry.mood === "terrible").map(e => e.date);
    
    if (lowMoodDays.length > 0 && habits.length > 0) {
      const completionOnLowMoodDays = habits.filter(h => 
        h.completedDates.some(date => lowMoodDays.includes(date))
      ).length;
      
      if (completionOnLowMoodDays < habits.length * 0.5) {
        recommendations.push("On days when your mood is lower, try focusing on just one or two key habits rather than your full routine.");
      }
    }
  }
  
  // Habit-specific recommendations
  if (habits && habits.length > 0) {
    const morningHabits = habits.filter(h => h.name.toLowerCase().includes("morning") || 
                                            h.description?.toLowerCase().includes("morning"));
    
    if (morningHabits.length === 0) {
      recommendations.push("Consider adding a morning routine to set a productive tone for the day.");
    }
    
    if (habits.filter(h => h.streak > 7).length === 0) {
      recommendations.push("Work on maintaining your habits for at least a week to form lasting patterns.");
    }
  } else {
    recommendations.push("Start by creating a few daily habits to track your consistency.");
  }
  
  // Mood-related recommendations
  if (journalEntries && journalEntries.length > 0) {
    const recentEntries = journalEntries.slice(0, 5);
    const containsGratitude = recentEntries.some(entry => 
      entry.content.toLowerCase().includes("grateful") || 
      entry.content.toLowerCase().includes("thankful") ||
      entry.content.toLowerCase().includes("appreciate")
    );
    
    if (!containsGratitude) {
      recommendations.push("Try including a 'gratitude' item in your journal entries each day.");
    }
  }
  
  // Return unique recommendations (up to 3)
  return [...new Set(recommendations)].slice(0, 3);
};

// Helper functions for data analysis
const prepareProductivityData = (
  habits: any[],
  goals: any[],
  journalEntries: any[],
  moodEntries: any[],
  history: any[],
  startDate: Date,
  endDate: Date
): ProductivityData[] => {
  const result: ProductivityData[] = [];
  const days = differenceInDays(endDate, startDate) + 1;
  
  for (let i = 0; i < days; i++) {
    const currentDate = addDays(startDate, i);
    const dateString = format(currentDate, "yyyy-MM-dd");
    
    // Calculate habit completion rate for this day
    const dailyHabits = habits.filter(h => h.frequency === "daily" && 
      new Date(h.created) <= currentDate);
    const completedHabits = dailyHabits.filter(h => 
      h.completedDates.includes(dateString)
    );
    const habitCompletionRate = dailyHabits.length > 0
      ? completedHabits.length / dailyHabits.length
      : 0;
    
    // Calculate goal progress for this day (approximation)
    const activeGoals = goals.filter(g => 
      new Date(g.createdAt) <= currentDate && 
      (!g.dueDate || new Date(g.dueDate) >= currentDate)
    );
    const goalProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum, goal) => sum + (goal.progress / goal.target), 0) / activeGoals.length
      : 0;
    
    // Count activities for this day
    const dayActivities = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      return isSameDay(itemDate, currentDate);
    });
    
    // Get mood score if available
    const dayMoodEntry = moodEntries.find(entry => entry.date === dateString);
    let moodScore;
    if (dayMoodEntry && dayMoodEntry.mood) {
      const moodMap: Record<string, number> = {
        "terrible": 1,
        "bad": 2,
        "neutral": 3,
        "good": 4,
        "great": 5
      };
      moodScore = moodMap[dayMoodEntry.mood] || 3;
    }
    
    result.push({
      date: dateString,
      habitCompletionRate,
      goalProgress,
      activityCount: dayActivities.length,
      moodScore
    });
  }
  
  return result;
};

const analyzeProductivity = (data: ProductivityData[]): Insight[] => {
  const insights: Insight[] = [];
  
  // Skip if we don't have at least a week of data
  if (data.length < 7) return insights;
  
  // Analyze productivity trends
  const last7Days = data.slice(-7);
  const completionRates = last7Days.map(d => d.habitCompletionRate);
  const avgCompletionRate = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
  
  if (avgCompletionRate > 0.8) {
    insights.push({
      id: `productivity-high-${Date.now()}`,
      type: "productivity",
      message: `You've completed ${Math.round(avgCompletionRate * 100)}% of your habits this week. Great consistency!`,
      impact: "positive",
      date: new Date().toISOString()
    });
  } else if (avgCompletionRate > 0.5) {
    insights.push({
      id: `productivity-medium-${Date.now()}`,
      type: "productivity",
      message: `You've completed ${Math.round(avgCompletionRate * 100)}% of your habits this week. Keep going!`,
      impact: "neutral",
      date: new Date().toISOString()
    });
  } else if (avgCompletionRate > 0) {
    insights.push({
      id: `productivity-low-${Date.now()}`,
      type: "productivity",
      message: `You've completed ${Math.round(avgCompletionRate * 100)}% of your habits this week. Try focusing on fewer habits to build consistency.`,
      impact: "negative",
      date: new Date().toISOString()
    });
  }
  
  // Analyze correlation between activities and habit completion
  const highActivityDays = data.filter(d => d.activityCount > 3);
  const highActivityCompletion = highActivityDays.length > 0
    ? highActivityDays.reduce((sum, d) => sum + d.habitCompletionRate, 0) / highActivityDays.length
    : 0;
  
  const lowActivityDays = data.filter(d => d.activityCount <= 3 && d.activityCount > 0);
  const lowActivityCompletion = lowActivityDays.length > 0
    ? lowActivityDays.reduce((sum, d) => sum + d.habitCompletionRate, 0) / lowActivityDays.length
    : 0;
  
  if (highActivityDays.length > 3 && lowActivityDays.length > 3) {
    if (highActivityCompletion > lowActivityCompletion + 0.2) {
      insights.push({
        id: `activity-correlation-${Date.now()}`,
        type: "productivity",
        message: "You're more likely to complete your habits on days with higher activity levels.",
        impact: "positive",
        date: new Date().toISOString()
      });
    } else if (lowActivityCompletion > highActivityCompletion + 0.2) {
      insights.push({
        id: `activity-correlation-inv-${Date.now()}`,
        type: "productivity",
        message: "You tend to complete more habits on days with fewer recorded activities. Consider focusing on quality over quantity.",
        impact: "neutral",
        date: new Date().toISOString()
      });
    }
  }
  
  return insights;
};

const analyzeMood = (data: ProductivityData[], moodEntries: any[]): Insight[] => {
  const insights: Insight[] = [];
  
  // Check if we have enough data with mood information
  const dataWithMood = data.filter(d => d.moodScore !== undefined);
  if (dataWithMood.length < 5) return insights;
  
  // Analyze mood trends
  const moodScores = dataWithMood.map(d => d.moodScore || 0);
  const avgMoodScore = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
  
  if (avgMoodScore >= 4) {
    insights.push({
      id: `mood-trend-high-${Date.now()}`,
      type: "mood",
      message: "Your overall mood has been very positive recently. Great job maintaining a positive mindset!",
      impact: "positive",
      date: new Date().toISOString()
    });
  } else if (avgMoodScore <= 2) {
    insights.push({
      id: `mood-trend-low-${Date.now()}`,
      type: "mood",
      message: "Your mood has been lower than usual recently. Consider adding more mood-boosting activities to your routine.",
      impact: "negative",
      date: new Date().toISOString()
    });
  }
  
  // Analyze correlation between mood and habit completion
  const highMoodDays = dataWithMood.filter(d => (d.moodScore || 0) >= 4);
  const highMoodCompletion = highMoodDays.length > 0
    ? highMoodDays.reduce((sum, d) => sum + d.habitCompletionRate, 0) / highMoodDays.length
    : 0;
  
  const lowMoodDays = dataWithMood.filter(d => (d.moodScore || 0) <= 2);
  const lowMoodCompletion = lowMoodDays.length > 0
    ? lowMoodDays.reduce((sum, d) => sum + d.habitCompletionRate, 0) / lowMoodDays.length
    : 0;
  
  if (highMoodDays.length > 2 && lowMoodDays.length > 2) {
    if (highMoodCompletion > lowMoodCompletion + 0.2) {
      insights.push({
        id: `mood-productivity-${Date.now()}`,
        type: "mood",
        message: "Your mood tends to be better on days when you complete more of your habits.",
        impact: "positive",
        date: new Date().toISOString()
      });
    } else if (lowMoodCompletion > highMoodCompletion + 0.2) {
      insights.push({
        id: `mood-productivity-inv-${Date.now()}`,
        type: "mood",
        message: "Interestingly, you tend to complete more habits on days when your mood is lower.",
        impact: "neutral",
        date: new Date().toISOString()
      });
    }
  }
  
  // Analyze correlation between mood and activity level
  const highMoodActivity = highMoodDays.length > 0
    ? highMoodDays.reduce((sum, d) => sum + d.activityCount, 0) / highMoodDays.length
    : 0;
  
  const lowMoodActivity = lowMoodDays.length > 0
    ? lowMoodDays.reduce((sum, d) => sum + d.activityCount, 0) / lowMoodDays.length
    : 0;
  
  if (highMoodDays.length > 2 && lowMoodDays.length > 2) {
    if (highMoodActivity > lowMoodActivity + 2) {
      insights.push({
        id: `mood-activity-${Date.now()}`,
        type: "mood",
        message: "Your mood tends to be better on days with higher activity levels.",
        impact: "positive",
        date: new Date().toISOString()
      });
    } else if (lowMoodActivity > highMoodActivity + 2) {
      insights.push({
        id: `mood-activity-inv-${Date.now()}`,
        type: "mood",
        message: "Your mood tends to be better on days with fewer recorded activities. Consider the quality of your activities.",
        impact: "neutral",
        date: new Date().toISOString()
      });
    }
  }
  
  // Analyze mood patterns
  if (moodEntries.length >= 7) {
    const recentMoods = moodEntries.slice(0, 7).map(entry => entry.mood);
    const moodChanges = recentMoods.slice(1).map((mood, i) => {
      const prevMood = recentMoods[i];
      const moodValues: Record<string, number> = {
        "terrible": 1,
        "bad": 2,
        "neutral": 3,
        "good": 4,
        "great": 5
      };
      return (moodValues[mood] || 3) - (moodValues[prevMood] || 3);
    });
    
    // Check for mood swings (changes greater than 2 points)
    const significantChanges = moodChanges.filter(change => Math.abs(change) >= 2).length;
    
    if (significantChanges >= 3) {
      insights.push({
        id: `mood-swings-${Date.now()}`,
        type: "mood",
        message: "Your mood has had significant fluctuations recently. Consider tracking what factors might be affecting these changes.",
        impact: "negative",
        date: new Date().toISOString()
      });
    }
    
    // Check for consistent mood improvement
    const totalChange = moodChanges.reduce((sum, change) => sum + change, 0);
    if (totalChange >= 3) {
      insights.push({
        id: `mood-improving-${Date.now()}`,
        type: "mood",
        message: "Your mood has been steadily improving over the past week. Keep up whatever you're doing!",
        impact: "positive",
        date: new Date().toISOString()
      });
    }
  }
  
  return insights;
};

const analyzeHabits = (habits: any[]): Insight[] => {
  const insights: Insight[] = [];
  
  // Analyze streaks
  const longestStreakHabit = habits.reduce(
    (longest, habit) => habit.streak > (longest?.streak || 0) ? habit : longest,
    null
  );
  
  if (longestStreakHabit && longestStreakHabit.streak >= 7) {
    insights.push({
      id: `habit-streak-${Date.now()}`,
      type: "habit",
      message: `Great job maintaining a ${longestStreakHabit.streak}-day streak for "${longestStreakHabit.name}"!`,
      impact: "positive",
      date: new Date().toISOString()
    });
  }
  
  // Analyze habit completion by category
  const categories = [...new Set(habits.map(h => h.category))];
  categories.forEach(category => {
    const categoryHabits = habits.filter(h => h.category === category);
    const avgStreak = categoryHabits.reduce((sum, h) => sum + h.streak, 0) / categoryHabits.length;
    
    if (avgStreak >= 5 && categoryHabits.length >= 2) {
      insights.push({
        id: `habit-category-${category}-${Date.now()}`,
        type: "habit",
        message: `You're doing great with your ${category} habits, with an average streak of ${Math.round(avgStreak)} days!`,
        impact: "positive",
        date: new Date().toISOString()
      });
    }
  });
  
  return insights;
};

const analyzeGoals = (goals: any[]): Insight[] => {
  const insights: Insight[] = [];
  
  // Analyze overall goal progress
  const totalProgress = goals.reduce((sum, goal) => sum + (goal.progress / goal.target), 0);
  const avgProgress = totalProgress / goals.length;
  
  if (avgProgress >= 0.75) {
    insights.push({
      id: `goal-progress-high-${Date.now()}`,
      type: "goal",
      message: `You're making excellent progress on your goals, averaging ${Math.round(avgProgress * 100)}% completion!`,
      impact: "positive",
      date: new Date().toISOString()
    });
  } else if (avgProgress >= 0.4) {
    insights.push({
      id: `goal-progress-med-${Date.now()}`,
      type: "goal",
      message: `You're making steady progress on your goals, currently at ${Math.round(avgProgress * 100)}% average completion.`,
      impact: "neutral",
      date: new Date().toISOString()
    });
  } else if (goals.length > 0) {
    insights.push({
      id: `goal-progress-low-${Date.now()}`,
      type: "goal",
      message: `Your goals are currently at ${Math.round(avgProgress * 100)}% average completion. Consider breaking them into smaller milestones.`,
      impact: "negative",
      date: new Date().toISOString()
    });
  }
  
  // Identify nearly completed goals
  const nearlyCompleteGoals = goals.filter(g => g.progress / g.target >= 0.9 && g.progress / g.target < 1);
  if (nearlyCompleteGoals.length > 0) {
    insights.push({
      id: `goal-nearly-complete-${Date.now()}`,
      type: "goal",
      message: `You're very close to completing ${nearlyCompleteGoals.length} goal${nearlyCompleteGoals.length > 1 ? 's' : ''}! Just a little more effort needed.`,
      impact: "positive",
      date: new Date().toISOString()
    });
  }
  
  return insights;
};
