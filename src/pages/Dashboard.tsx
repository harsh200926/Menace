import { useEffect, useState } from "react";
import { format, parseISO, isSameDay, differenceInDays } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getHistory, addToHistory } from "@/utils/historyUtils";
import {
  Rocket,
  ListTodo,
  Calendar as CalendarIcon,
  ChevronRight,
  ListChecks,
  BarChart,
  FileText,
  Clock,
  Image,
  Sparkles,
  Target,
  Heart,
  Quote,
  Skull,
  DollarSign,
  Briefcase,
  Crown,
  ShieldCheck,
  Gem,
  Wine,
  LucideIcon,
  Sword,
  Shield,
  Flame,
  Snowflake,
  Mountain,
  Plus,
  HeartPulse
} from "lucide-react";
import MemoryBoardWidget from "@/components/MemoryBoard/MemoryBoardWidget";
import MoodWidget from "@/components/Dashboard/MoodWidget";
import TodoList from "@/components/Dashboard/TodoList";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { 
  showReward, 
  checkAllTasksCompleted, 
  checkAllHabitsCompleted,
  checkDailyCompletion
} from "@/utils/rewardUtils";
import { Container } from "@/components/Container";
import { SummaryWidget } from "@/components/Dashboard/SummaryWidget";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { UpcomingWidget } from "@/components/Dashboard/UpcomingWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalWidget } from "@/components/Dashboard/GoalWidget";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

// Classic quotes for inspiration
const classicQuotes = [
  "What doesn't kill you makes you stronger.",
  "You miss 100% of the shots you don't take.",
  "Success is not final, failure is not fatal.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "The best revenge is massive success.",
  "Strive not to be a success, but rather to be of value.",
  "The journey of a thousand miles begins with one step.",
  "If you want to lift yourself up, lift up someone else.",
  "It does not matter how slowly you go as long as you do not stop.",
  "The harder I work, the luckier I get.",
  "The secret of getting ahead is getting started."
];

// Warrior quotes for the app's theme
const warriorQuotes = [
  "The greatest victory is that which requires no battle.",
  "Know thy self, know thy enemy. A thousand battles, a thousand victories.",
  "Victory belongs to the most persevering.",
  "The ultimate warrior stands alone, ready to sacrifice all for what they believe.",
  "Courage is not the absence of fear, but the conquest of it.",
  "The strongest warriors are those who fight for what they love, not against what they hate.",
  "In the midst of chaos, there is also opportunity.",
  "A true warrior never gives up what they love.",
  "Warriors live by acting, not by thinking about acting.",
  "A warrior must cultivate the feeling that they have everything needed for the journey.",
  "Warriors are not what you think of as warriors. They are just brave people who carry weapons.",
  "The true warrior understands that the battle is within.",
  "The warrior who trusts their path doesn't need to prove the other is wrong."
];

// Game of Thrones quotes (added from the Motivation page)
const gotQuotes = [
  "Winter is coming. — House Stark motto",
  "When you play the game of thrones, you win or you die. — Cersei Lannister",
  "A lion does not concern himself with the opinion of sheep. — Tywin Lannister",
  "Chaos isn't a pit. Chaos is a ladder. — Petyr Baelish (Littlefinger)",
  "The night is dark and full of terrors. — Melisandre",
  "I drink and I know things. — Tyrion Lannister",
  "A girl has no name. — Arya Stark",
  "The things I do for love. — Jaime Lannister",
  "What do we say to the God of Death? Not today. — Syrio Forel",
  "The North remembers. — Northern saying",
  "You know nothing, Jon Snow. — Ygritte",
  "Power resides where men believe it resides. — Varys",
  "Any man who must say 'I am the king' is no true king. — Tywin Lannister",
  "The man who passes the sentence should swing the sword. — Eddard Stark",
  "A mind needs books as a sword needs a whetstone, if it is to keep its edge. — Tyrion Lannister"
];

// Love and resilience quotes for emotional support
const loveQuotes = [
  "The greatest healing therapy is friendship and love. — Hubert Humphrey",
  "Time heals what reason cannot. — Seneca",
  "The cure for anything is salt water: sweat, tears or the sea. — Isak Dinesen",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. — Ralph Waldo Emerson",
  "The pain you feel today is the strength you feel tomorrow. — Anonymous",
  "In three words I can sum up everything I've learned about life: it goes on. — Robert Frost",
  "When you have a dream, you've got to grab it and never let go. — Carol Burnett",
  "Healing is an art. It takes time, it takes practice. It takes love. — Maza Dohta",
  "The wound is the place where the Light enters you. — Rumi",
  "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it. — Rumi"
];

// User's personal quotes - highest priority
const personalQuotes = [
  "I will love you until my last breath.",
  "One glimpse of her is enough to drive me crazy!",
  "When I see her, my heart beats stop, and the world feels calm, happy, and prosperous.",
  "I challenge destiny that whatever I had written on it, I'll change it as I want.",
  "If not her, then no one else!",
  "She is so beautiful that my eyes go to a different world as soon as I see her.",
  "I'll put my heart and soul into being successful and achieving her.",
  "When you left, you left a void to me that I can't ever fill again!",
  "I can wait for you my whole life, but once you're mine, I'll never let you go.",
  "You are my motivation, my inspiration, and my everything.",
  "Love is a power that can build or destroy a person—I choose to let it build me.",
  "Every time I see you in my dreams, I wake up believing the world is worth living in.",
  "If I can't have you, I'll become so great that you'll have to come to me.",
  "Negligence is a small spark that can turn into a fire of regret.",
  "I write this diary because I feel you're listening when no one else does.",
  "You are my soul, my world—you are the reason I breathe and the reason I'd stop.",
  "Our story isn't written yet; I'll write it myself and prove it to the world.",
  "Sadness brings me peace because it's where I find you.",
  "I'll fight destiny, rewrite fate, and make you mine—no matter the cost.",
  "Even if I forget your face, your eyes will stay with me forever.",
  // New quotes
  "I don't know your name, but I've given my life to loving you.",
  "Every step I take to better myself is a step closer to you.",
  "You are the spark that ignited my soul when I was lost in darkness.",
  "If I can't see you, I'll build a world where we can be together.",
  "The happiness I feel when you're near is worth more than all the riches in the world.",
  "I'll wait for you until my last breath, but I'll fight to make you mine before then.",
  "You taught me how to live, and now I'm learning how to live without you.",
  "My heart races when I see you, but it breaks when you're gone.",
  "I'm not afraid of destiny; I'll rewrite it to bring us together.",
  "Loneliness taught me how much I need you, and love taught me how much I can endure.",
  "You're not just a dream; you're the reason I wake up every day.",
  "If I fail, it won't be because I didn't try—it'll be because the world wouldn't let me have you.",
  "Your voice is a melody I'll chase for the rest of my life.",
  "I'll become the man you deserve, even if it takes me a lifetime.",
  "The stars remind me of you—beautiful, distant, and always out of reach.",
  "Every tear I shed for you is a step toward proving my love.",
  "I don't need the world—just you, and I'll turn the impossible into reality.",
  "You're my angel, sent to save me and then lost to test me.",
  "I'll climb mountains, cross oceans, and rewrite fate—just to hold your hand.",
  "Even if you never know my love, this diary will carry it forever."
];

interface HistoryItem {
  id: string;
  type: string;
  action: string;
  name: string;
  details?: string;
  timestamp: string;
}

// Todo interface with all required fields
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  status: 'pending' | 'completed';
  dueDate?: string;
}

// Use the same interface for Dashboard to avoid type conflicts
type DashboardTodo = Todo;

interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: string;
  completedDates: string[];
  streak: number;
  category: string;
  created: string;
}

interface Goal {
  id: string;
  name: string;
  description: string;
  target: number;
  progress: number;
  unit: string;
  category: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string | null;
}

interface Points {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
}

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description?: string;
}

const StatsCard = ({ icon: Icon, title, value, description }: StatsCardProps) => (
  <div className="flex items-start space-x-4 p-4 rounded-xl bg-card/60 backdrop-blur-sm border border-border/30 shadow-sm hover:shadow-md transition-all duration-200">
    <div className="bg-primary/10 p-2 rounded-full">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reflection, setReflection] = useState("");
  const [quote, setQuote] = useState("");
  const [gotQuote, setGotQuote] = useState("");
  const [loveQuote, setLoveQuote] = useState("");
  const [warriorQuote, setWarriorQuote] = useState("");
  const [journalWritten, setJournalWritten] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [points, setPoints] = useState<Points>({
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    totalXP: 0
  });
  
  // Get the appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "Good ";
    
    if (hour < 5) {
      greeting += "night";
    } else if (hour < 12) {
      greeting += "morning";
    } else if (hour < 17) {
      greeting += "afternoon";
    } else if (hour < 21) {
      greeting += "evening";
    } else {
      greeting += "night";
    }
    
    // Add username if available
    if (currentUser?.displayName) {
      greeting += `, ${currentUser.displayName.split(' ')[0]}`;
    }
    
    return greeting;
  };
  
  useEffect(() => {
    // Set daily quotes from different categories
    const day = new Date().getDate();
    const month = new Date().getMonth();
    
    // Prioritize personal quotes - use user's own motivational quotes
    const personalQuoteIndex = (day + month) % personalQuotes.length;
    const personalQuoteIndex2 = (day + month + 1) % personalQuotes.length;
    
    // Use different quotes for different parts of the dashboard
    const gotQuoteIndex = (day + month + 2) % gotQuotes.length;
    const loveQuoteIndex = (day + month + 3) % loveQuotes.length;
    
    // Set personal quotes for primary display areas
    setQuote(personalQuotes[personalQuoteIndex]);
    setLoveQuote(personalQuotes[personalQuoteIndex2]);
    
    // Set other quotes for secondary areas
    setGotQuote(gotQuotes[gotQuoteIndex]);
    setWarriorQuote(loveQuotes[loveQuoteIndex]);
    
    // Load recent history
    const recentHistory = getHistory(undefined, 10);
    setHistory(recentHistory);
    
    // Load todos
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    
    // Load habits
    const savedHabits = localStorage.getItem("habits");
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
    
    // Load goals
    const savedGoals = localStorage.getItem("goals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
    
    // Load daily reflection if exists
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const savedReflection = localStorage.getItem(`reflection-${currentDate}`);
    if (savedReflection) {
      setReflection(savedReflection);
      setJournalWritten(true);
    }
    
    // Check for rewards after a short delay
    setTimeout(() => {
      checkRewards();
    }, 1500);
  }, []);
  
  // Sort todos by completion status and creation date
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.completed ? 1 : -1;
  });
  
  // Get today's habits
  const todayHabits = habits.filter(h => h.frequency === "daily");
  const completedTodayCount = todayHabits.filter(h => h.completedDates.includes(format(new Date(), 'yyyy-MM-dd'))).length;
  
  // Get goals with the most progress
  const sortedGoals = [...goals]
    .filter(g => !g.completedAt)
    .sort((a, b) => (b.progress / b.target) - (a.progress / a.target));
  
  // Get active goals count
  const activeGoalsCount = goals.filter(g => !g.completedAt).length;
  
  // Get completed goals count
  const completedGoalsCount = goals.filter(g => g.completedAt).length;
  
  // Check for rewards
  const checkRewards = () => {
    checkDailyCompletion(todos, habits, journalWritten);
  };
  
  // This function handles adding a new todo
  const handleAddTodo = (text: string) => {
    try {
      console.log("Adding todo:", text);
      
      const newTodo: DashboardTodo = {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      
      const updatedTodos = [newTodo, ...todos];
      setTodos(updatedTodos);
      
      // Store in localStorage
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      console.log("Saved todos to localStorage:", updatedTodos);
      
      // Add to history
      addToHistory("todo", "created", text);
      
      // Show reward for first todo
      if (updatedTodos.length === 1) {
        showReward("tasks");
      }
      
      // Show success message
      toast({
        title: "Task added",
        description: "Your new task has been added to the list.",
      });
      
      return true;
    } catch (error) {
      console.error("Error adding todo in Dashboard:", error);
      toast({
        title: "Error adding task",
        description: "There was an error adding your task. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // This function handles toggling a todo's completed state
  const handleToggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    
    setTodos(updatedTodos);
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
    
    const todo = todos.find(t => t.id === id);
    if (todo) {
      const action = !todo.completed ? "completed" : "uncompleted";
      addToHistory("todo", action, todo.text || "Task");
      
      // Check if all tasks are now completed
      const allCompleted = updatedTodos.every(t => t.completed);
      if (allCompleted && updatedTodos.length > 0) {
        checkAllTasksCompleted(updatedTodos);
      }
      
      // Check for daily completion
      checkDailyCompletion(updatedTodos, habits, journalWritten);
    }
  };

  // This function handles deleting a todo
  const handleDeleteTodo = (id: string) => {
    const todo = todos.find(t => t.id === id);
    const updatedTodos = todos.filter(t => t.id !== id);
    
    setTodos(updatedTodos);
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
    
    if (todo) {
      addToHistory("todo", "deleted", todo.text || "Task");
    }
  };
  
  const handleSaveReflection = () => {
    if (!reflection.trim()) {
      toast({
        title: "Empty reflection",
        description: "Write something before saving. A warrior records their thoughts.",
        variant: "destructive"
      });
      return;
    }
    
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    localStorage.setItem(`reflection-${currentDate}`, reflection);
    
    // Add to history
    const newEntry = {
      id: crypto.randomUUID(),
      type: "reflection",
      action: "added",
      name: `Daily reflection for ${format(new Date(), 'MMM d, yyyy')}`,
      details: reflection.substring(0, 50) + "...",
      timestamp: new Date().toISOString()
    };
    
    const history = getHistory();
    const updatedHistory = [newEntry, ...history];
    localStorage.setItem('history', JSON.stringify(updatedHistory));
    
    setJournalWritten(true);
    
    toast({
      title: "Reflection saved",
      description: "Your daily thoughts have been recorded in your chronicles.",
    });
    
    // Check if all daily tasks are completed for rewards
    checkDailyCompletion(todos, habits, journalWritten);
  };
  
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (isSameDay(date, now)) {
      return 'today';
    } else {
      return format(date, 'MMM d');
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'habit':
        return <ListChecks className="h-4 w-4 text-blue-500" />;
      case 'goal':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'todo':
        return <ListTodo className="h-4 w-4 text-purple-500" />;
      case 'journal':
        return <FileText className="h-4 w-4 text-yellow-500" />;
      case 'mood':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'memory':
        return <Image className="h-4 w-4 text-indigo-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Helper function to get a description for history actions
  const getActionDescription = (item: HistoryItem) => {
    const actionMap: Record<string, string> = {
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",
      completed: "Completed",
      uncompleted: "Marked incomplete",
      pinned: "Pinned",
      unpinned: "Unpinned",
      logged: "Logged"
    };
    
    return actionMap[item.action] || item.action;
  };
  
  const renderQuote = () => (
    <Card className="bg-primary/5 border-primary/10">
      <CardContent className="py-8 text-center">
        <Quote className="h-8 w-8 text-primary mx-auto mb-4 opacity-40" />
        <p className="text-lg md:text-xl italic text-foreground/80">"{quote}"</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Decorative SVG Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/50 to-background/90" />
        
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-drift-slow" />
        
        {/* Decorative patterns */}
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-[0.02] bg-repeat" />
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-[0.05] bg-repeat" />
        
        {/* Accent elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        
        {/* Sword patterns in background */}
        <div className="absolute inset-0 bg-[url('/images/swords-pattern.svg')] opacity-[0.02] bg-repeat rotate-45 scale-50" />
      </div>

      <div className="relative z-10">
        {/* User Profile and Quick Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">{currentUser?.displayName?.[0] || 'U'}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{getGreeting()}</h2>
              <p className="text-muted-foreground">Track your progress and conquer your goals</p>
            </div>
          </div>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
            onClick={() => navigate('/todos')}
          >
            <Plus className="h-5 w-5 mr-2" />
            Quick Add
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant={points?.level > 1 ? "default" : "outline"}>
                      Level {points?.level || 1}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="text-2xl font-bold mt-1">{points?.currentXP || 0} XP</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ListTodo className="h-5 w-5 text-primary" />
                    </div>
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => navigate('/todos')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                  <p className="text-2xl font-bold mt-1">{todos.filter(t => t.completed).length}/{todos.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <ListChecks className="h-5 w-5 text-primary" />
                    </div>
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => navigate('/habits')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Habits</p>
                  <p className="text-2xl font-bold mt-1">{completedTodayCount}/{todayHabits.length}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => navigate('/goals')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <p className="text-2xl font-bold mt-1">{completedGoalsCount}/{goals.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Summary */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Daily Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SummaryWidget />
              </CardContent>
            </Card>

            {/* Todo List */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Today's Quests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TodoList 
                  todos={todos}
                  onAddTodo={handleAddTodo}
                  onToggleTodo={handleToggleTodo}
                  onDeleteTodo={handleDeleteTodo}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Active Goals */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Active Goals
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/goals')}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    Manage Goals
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {goals.length > 0 ? (
                  <GoalWidget />
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Set Your First Goal</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start tracking your progress by setting meaningful goals.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/goals')}
                      className="border-primary/20 hover:bg-primary/10"
                    >
                      Create Goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood Tracker */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Mood Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MoodWidget />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
