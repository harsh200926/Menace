import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  CalendarClock, 
  BookOpen, 
  Target, 
  HeartPulse, 
  ImageIcon, 
  TrendingUp,
  Sparkles
} from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useAchievements } from "@/context/AchievementContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Stats {
  dailyTodos: number;
  totalTodos: number;
  completedTodos: number;
  habits: number;
  activeGoals: number;
  journalEntries: number;
  memories: number;
  streakDays: number;
}

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
}

interface GoalItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  deadline?: string;
  createdAt: string;
}

export function SummaryWidget() {
  const [stats, setStats] = useState<Stats>({
    dailyTodos: 0,
    totalTodos: 0,
    completedTodos: 0,
    habits: 0,
    activeGoals: 0,
    journalEntries: 0,
    memories: 0,
    streakDays: 0
  });
  
  const { points, checkDailyStreaks } = useAchievements();
  
  // Calculate productivity score (0-100)
  const calculateProductivityScore = () => {
    const { 
      dailyTodos, 
      totalTodos, 
      completedTodos, 
      habits, 
      activeGoals, 
      journalEntries, 
      memories,
      streakDays
    } = stats;
    
    // Weight each factor
    const todoWeight = totalTodos > 0 ? (completedTodos / totalTodos) * 25 : 0;
    const habitWeight = habits * 5 > 25 ? 25 : habits * 5;
    const goalWeight = activeGoals * 5 > 15 ? 15 : activeGoals * 5;
    const journalWeight = journalEntries > 0 ? 15 : 0;
    const memoryWeight = memories > 0 ? 10 : 0;
    const streakWeight = streakDays > 0 ? Math.min(10, streakDays) : 0;
    
    // Calculate total score
    return Math.min(100, todoWeight + habitWeight + goalWeight + journalWeight + memoryWeight + streakWeight);
  };
  
  // Load stats from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Get todos
    const todosData = localStorage.getItem("todos");
    if (todosData) {
      const todos = JSON.parse(todosData) as TodoItem[];
      const todayTodos = todos.filter((todo) => todo.dueDate === today);
      const completed = todos.filter((todo) => todo.status === "completed");
      
      setStats(prev => ({
        ...prev,
        dailyTodos: todayTodos.length,
        totalTodos: todos.length,
        completedTodos: completed.length
      }));
    }
    
    // Get habits
    const habitsData = localStorage.getItem("habits");
    if (habitsData) {
      const habits = JSON.parse(habitsData) as any[];
      setStats(prev => ({
        ...prev,
        habits: habits.length
      }));
    }
    
    // Get goals
    const goalsData = localStorage.getItem("goals");
    if (goalsData) {
      const goals = JSON.parse(goalsData) as GoalItem[];
      const activeGoals = goals.filter((goal) => goal.status === "active");
      
      setStats(prev => ({
        ...prev,
        activeGoals: activeGoals.length
      }));
    }
    
    // Get journal entries
    const journalData = localStorage.getItem("journal");
    if (journalData) {
      const journal = JSON.parse(journalData) as any[];
      
      setStats(prev => ({
        ...prev,
        journalEntries: journal.length
      }));
    }
    
    // Get memories
    const memoryData = localStorage.getItem("memoryBoard");
    if (memoryData) {
      const memories = JSON.parse(memoryData) as any[];
      
      setStats(prev => ({
        ...prev,
        memories: memories.length
      }));
    }
    
    // Get streak days (highest streak from any category)
    const streaks = [
      points.streaks.todos.current,
      points.streaks.habits.current,
      points.streaks.journal.current,
      points.streaks.login.current
    ];
    
    setStats(prev => ({
      ...prev,
      streakDays: Math.max(...streaks)
    }));
    
    // Check for streak updates
    checkDailyStreaks();
  }, [checkDailyStreaks, points.streaks]);
  
  const productivityScore = calculateProductivityScore();
  
  // Get score color
  const getScoreColor = (score: number) => {
    if (score < 30) return "text-red-500";
    if (score < 60) return "text-amber-500";
    if (score < 80) return "text-green-500";
    return "text-primary";
  };
  
  // Get score message
  const getScoreMessage = (score: number) => {
    if (score < 30) return "Needs improvement";
    if (score < 60) return "Making progress";
    if (score < 80) return "Doing great!";
    return "Outstanding!";
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Dashboard Summary
        </CardTitle>
        <CardDescription>Track your progress across all features</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Productivity score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium">Productivity Score</div>
            <div className={cn("text-base font-bold", getScoreColor(productivityScore))}>
              {Math.round(productivityScore)}%
            </div>
          </div>
          
          <Progress value={productivityScore} className="h-2.5 mb-1" />
          
          <div className="text-xs text-muted-foreground text-right">
            {getScoreMessage(productivityScore)}
          </div>
        </div>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1.5 bg-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">Tasks</div>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Today:</span>
                <span>{stats.dailyTodos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed:</span>
                <span>{stats.completedTodos} / {stats.totalTodos}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1.5 bg-primary/10">
                <HeartPulse className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">Habits</div>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span>{stats.habits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streak:</span>
                <span>{points.streaks.habits.current} days</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1.5 bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">Goals</div>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active:</span>
                <span>{stats.activeGoals}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1.5 bg-primary/10">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">Journal</div>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entries:</span>
                <span>{stats.journalEntries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Streak:</span>
                <span>{points.streaks.journal.current} days</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1.5 bg-primary/10">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">Memories</div>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Saved:</span>
                <span>{stats.memories}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-full p-1.5 bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm font-medium">XP & Level</div>
            </div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level:</span>
                <span>{points.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">XP:</span>
                <span>{points.currentXP}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
} 