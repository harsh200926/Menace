import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  completedAt: string | null;
  progress: number;
  total: number;
  reward: {
    type: "xp" | "badge" | "theme" | "feature";
    value: number | string;
  };
}

// Streak interface
export interface Streak {
  current: number;
  best: number;
  lastUpdated: string | null;
}

// Points and leveling system
export interface PointsSystem {
  currentXP: number;
  level: number;
  nextLevelXP: number;
  streaks: {
    todos: Streak;
    habits: Streak;
    journal: Streak;
    login: Streak;
  };
}

// Available achievements
export const achievementsList: Achievement[] = [
  {
    id: "first_task",
    title: "Task Master Initiate",
    description: "Complete your first task",
    icon: "checkbox",
    completedAt: null,
    progress: 0,
    total: 1,
    reward: { type: "xp", value: 50 },
  },
  {
    id: "habit_week",
    title: "Habit Forming",
    description: "Maintain a habit for 7 consecutive days",
    icon: "calendar",
    completedAt: null,
    progress: 0,
    total: 7,
    reward: { type: "xp", value: 100 },
  },
  {
    id: "journal_streak",
    title: "Soul Chronicler",
    description: "Write in your journal for 5 days in a row",
    icon: "book",
    completedAt: null,
    progress: 0,
    total: 5,
    reward: { type: "xp", value: 75 },
  },
  {
    id: "task_master",
    title: "Task Master",
    description: "Complete 50 tasks total",
    icon: "target",
    completedAt: null,
    progress: 0,
    total: 50,
    reward: { type: "badge", value: "task_master" },
  },
  {
    id: "memory_collector",
    title: "Memory Collector",
    description: "Add 10 images to your memory board",
    icon: "image",
    completedAt: null,
    progress: 0,
    total: 10,
    reward: { type: "xp", value: 120 },
  },
  {
    id: "goal_achiever",
    title: "Goal Achiever",
    description: "Complete 5 goals",
    icon: "flag",
    completedAt: null,
    progress: 0,
    total: 5,
    reward: { type: "xp", value: 200 },
  },
  {
    id: "first_memory",
    title: "Memory Keeper",
    description: "Add your first image to memories",
    icon: "image",
    completedAt: null,
    progress: 0,
    total: 1,
    reward: { type: "xp", value: 50 },
  },
  {
    id: "completion_streak",
    title: "Completion Streak",
    description: "Complete all daily tasks for 3 days in a row",
    icon: "zap",
    completedAt: null,
    progress: 0,
    total: 3,
    reward: { type: "xp", value: 150 },
  },
  {
    id: "theme_explorer",
    title: "Theme Explorer",
    description: "Try 5 different themes",
    icon: "palette",
    completedAt: null,
    progress: 0,
    total: 5,
    reward: { type: "theme", value: "achiever" },
  },
  {
    id: "milestone_tracker",
    title: "Milestone Tracker",
    description: "Track progress on a goal for 30 days",
    icon: "trending-up",
    completedAt: null,
    progress: 0,
    total: 30,
    reward: { type: "xp", value: 300 },
  }
];

// Calculate level based on XP
const calculateLevel = (xp: number): { level: number, nextLevelXP: number } => {
  // Simple formula: each level requires level*100 XP
  let level = 1;
    let xpRequired = 100;

    while (xp >= xpRequired) {
        level++;
        xp -= xpRequired;
        xpRequired = level * 100;
    }

    return {
        level,
        nextLevelXP: xpRequired
  };
};

// Interface for the context streks
interface AchievementContextType {
  achievements: Achievement[];
  points: PointsSystem;
  streaks: PointsSystem['streaks'];
  updateProgress: (achievementId: string, incrementBy?: number) => void;
  checkDailyStreaks: () => void;
  addXP: (amount: number, source?: string) => void;
  getCompletedAchievements: () => Achievement[];
    
  getNextAchievements: (count?: number) => Achievement[];
    syncToFirebase: () => Promise<void>;
}

// Create context streks
export const AchievementContext = createContext<AchievementContextType>({
  achievements: [],
  points: {
    currentXP: 0,
    level: 1,
    nextLevelXP: 100,
    streaks: {
      todos: { current: 0, best: 0, lastUpdated: null },
      habits: { current: 0, best: 0, lastUpdated: null },
      journal: { current: 0, best: 0, lastUpdated: null },
      login: { current: 0, best: 0, lastUpdated: null },
    },
  },
  streaks: {
    todos: { current: 0, best: 0, lastUpdated: null },
      habits: { current: 0, best: 0, lastUpdated: null },
    journal: { current: 0, best: 0, lastUpdated: null },
    login: { current: 0, best: 0, lastUpdated: null }
    }
  ,
  updateProgress: () => {},
  checkDailyStreaks: () => {},
  addXP: (): void => {},
  getCompletedAchievements: () => [],
  getNextAchievements: () => [],
  syncToFirebase: async () => {}
});

// Custom hook for using the context
export const useAchievements = () => useContext(AchievementContext);

// Provider component
export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  // Initialize state
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem("achievements");
    return saved ? JSON.parse(saved) : achievementsList;
  });
  const [points, setPoints] = useState<PointsSystem>(() => {
    const saved = localStorage.getItem("gamification");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      currentXP: 0,
      level: 1,
      nextLevelXP: 100,
      streaks: {
        todos: { current: 0, best: 0, lastUpdated: null },
        habits: { current: 0, best: 0, lastUpdated: null },
        journal: { current: 0, best: 0, lastUpdated: null },
        login: { current: 0, best: 0, lastUpdated: null },
      },
    };
  });

  // Update localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("achievements", JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem("gamification", JSON.stringify(points));
  }, [points]);

  // Update streak on login
  useEffect(() => {
    if (currentUser) {
      updateLoginStreak();
    }
  }, [currentUser]);

  // Functions for achievements and gamification
  const updateProgress = (achievementId: string, incrementBy = 1) => {
    setAchievements((prev) => {
      return prev.map((achievement) => {
        if (achievement.id === achievementId && !achievement.completedAt) {
          const newProgress = Math.min(
            achievement.progress + incrementBy,
            achievement.total
          );
          const completed = newProgress >= achievement.total;

          // If newly completed, give reward
          if (completed && !achievement.completedAt) {
            handleReward(achievement.reward);
            triggerConfetti();

            toast({
              title: "Achievement Unlocked!",
              description: `${achievement.title}: ${achievement.description}`,
              variant: "default",
              className: "achievement-toast",
            });
          }

          return {
            ...achievement,
            progress: newProgress,
            completedAt: completed ? new Date().toISOString() : null,
          };
        }
        return achievement;
      });
    });
  };

  const addXP = (amount: number, source?: string) => {
    setPoints((prev) => {
      const newXP = prev.currentXP + amount;
      const { level, nextLevelXP } = calculateLevel(newXP);

      // Level up notification
      if (level > prev.level) {
        toast({
          title: "Level Up!",
          description: `You've reached level ${level}!`,
          variant: "default",
          className: "level-up-toast",
        });
        triggerConfetti();
      }

      return {
        ...prev,
        currentXP: newXP,
        level,
        nextLevelXP,
      };
    });

    if (source) {
      toast({
        title: "XP Gained",
        description: `+${amount} XP from ${source}`,
        variant: "default",
        className: "xp-toast",
      });
    }
  };

  const updateLoginStreak = () => {
    const today = new Date().toISOString().split("T")[0];

    setPoints((prev) => {
      const lastLogin = prev.streaks.login.lastUpdated;
      let streak = prev.streaks.login.current;

      // If first login or login today already counted
      if (!lastLogin || lastLogin === today) {
        return prev;
      }

      // Calculate days between logins
      const lastDate = new Date(lastLogin);
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If consecutive day, increase streak .
      if (diffDays === 1) {
        streak += 1;
        // Add bonus XP for streak
        if (streak % 5 === 0) {
          // Bonus for every 5 days
          addXP(streak * 5, "Login Streak Bonus");
        } else {
          addXP(5, "Daily Login");
        }
      } else if (diffDays > 1) {
        // Streak broken
        streak = 1;
        addXP(5, "Daily Login");
      }      
      const bestStreak = Math.max(streak, prev.streaks.login.best);

      return {
        ...prev,
        streaks: {
          ...prev.streaks,
          
          login: {
            current: streak,
            best: bestStreak,
            lastUpdated: today
          }
        }
      };
    });
  };

  const checkDailyStreaks = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];

    // Check for todos completion
    const todosData = localStorage.getItem("todos");
    if (todosData) {
      const todos = JSON.parse(todosData);
      const hasDailyTodos = todos.some((todo: any) => todo.dueDate === today);
      const allCompleted =
        hasDailyTodos &&
        todos.every(
          (todo: any) => todo.dueDate !== today || todo.status === "completed"
      );

      if (allCompleted && hasDailyTodos) {
        updateStreak("todos");
        updateProgress("completion_streak");
      }
    }

    // Check for habits completion
    const habitsData = localStorage.getItem("habits");
    if (habitsData) {
      const habits = JSON.parse(habitsData);
      const dailyHabits = habits.filter(
        (habit: any) => habit.frequency === "daily"
      );
      const allCompleted =
        dailyHabits.length > 0 &&
        dailyHabits.every((habit: any) => habit.completedDates?.includes(today));

      if (allCompleted && dailyHabits.length > 0) {
        updateStreak("habits");
        updateProgress("habit_week");
      }
    }

    // Check for journal entry
    const reflection = localStorage.getItem(`reflection-${today}`);
    if (reflection) {
      const hasTodayEntry = true;
      if (hasTodayEntry) {
        updateStreak("journal");
        updateProgress("journal_streak");
      }
    }
  }, []);

  const updateStreak = (type: "todos" | "habits" | "journal") => {
    const today = new Date().toISOString().split("T")[0];
    setPoints((prev) => {
      const lastUpdate = prev.streaks[type].lastUpdated;
      let streak = prev.streaks[type].current;
      
      // If first entry or updated today already
      if (!lastUpdate) {
        streak = 1;
      } else if (lastUpdate === today) {
        // Already updated today
        return prev;
      } else {
        // Calculate days between updates.
        const lastDate = new Date(lastUpdate);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // If consecutive day, increase streak
        if (diffDays === 1) {
          streak += 1;
          // Add bonus XP for streak
          if (streak % 7 === 0) {
            // Weekly bonus
            addXP(
              streak * 10,
              `${type.charAt(0).toUpperCase() + type.slice(1)} Weekly Streak`
            );
          } else {
            addXP(
              10,
              `${type.charAt(0).toUpperCase() + type.slice(1)} Daily Streak`
            );
          }
        } else if (diffDays > 1) {
          // Streak broken
            streak = 1;
        }
      }
      
      const bestStreak = Math.max(streak, prev.streaks[type].best);
      
      return {
        ...prev,
        streaks: {
          ...prev.streaks,
          [type]: {
            current: streak,
            best: bestStreak,
            lastUpdated: today
          }
        }
      };
    });
  };

  const handleReward = (reward: Achievement["reward"]) => {
    if (reward.type === "xp") {
      addXP(reward.value as number, "Achievement");
    } else if (reward.type === "badge") {
      // Handle badge unlocks
      toast({
        title: "New Badge Unlocked",
        description: `You've earned the ${reward.value} badge!`,
        variant: "default",
        className: "badge-toast",
      });
      // Additional badge logic could be implemented here
    } else if (reward.type === "theme") {
      // Handle theme unlocks
      toast({
        title: "New Theme Unlocked",
        description: `You've unlocked the ${reward.value} theme!`,
        variant: "default",
        className: "theme-toast",
      });
      // Additional theme unlock logic could be implemented here
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const getCompletedAchievements = (): Achievement[] => {
    return achievements.filter((a) => a.completedAt !== null);
  };

  const getNextAchievements = (count = 3): Achievement[] => {
    return achievements
      .filter((a) => a.completedAt === null)
      .sort((a, b) => b.progress / b.total - a.progress / a.total)
      .slice(0, count);
  };

  // For future Firebase implementation
  const syncToFirebase = async (): Promise<void> => {
    if (!currentUser) {
      return;
    }

    // This would connect to Firebase to save/sync data
    // Implementation would depend on your Firebase setup
    console.log("Syncing achievements and XP to Firebase");
  };

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        points,
        streaks: points.streaks,
        updateProgress,
        checkDailyStreaks,
        addXP,
        getCompletedAchievements,
        getNextAchievements,
        syncToFirebase
      }}
    >
      {children}
    </AchievementContext.Provider>
  );  
};
