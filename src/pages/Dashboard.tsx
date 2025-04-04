import React, { useEffect, useState, RefAttributes, SVGProps } from "react"; // Added imports for types used implicitly later
import {forwardRef} from 'react'
import { format, isSameDay } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getHistory, addToHistory } from "@/utils/historyUtils";
import {
  ListTodo,
  Calendar as CalendarIcon,
  ListChecks,
  FileText,
  Image,
  Sparkles,
  Target,
  Heart,
  Plus,
  Quote,
  HeartPulse,
  TrendingUp,
  LucideProps, // Added import
} from "lucide-react";
// Assuming MemoryBoardWidget is not used or imported elsewhere if needed
// import MemoryBoardWidget from "@/components/MemoryBoard/MemoryBoardWidget";
import MoodWidget from "@/components/Dashboard/MoodWidget";
import TodoList from "@/components/Dashboard/TodoList";
// Assuming Textarea is not used or imported elsewhere if needed
// import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import {
  showReward,
  checkAllTasksCompleted,
  checkDailyCompletion,
} from "@/utils/rewardUtils";
import { SummaryWidget } from "@/components/Dashboard/SummaryWidget";
import { useAchievements, Streak } from "@/context/AchievementContext"; // Assuming Streak type is exported
import { GoalWidget } from "@/components/Dashboard/GoalWidget";
import { Badge } from "@/components/ui/badge";
import StatsCard, { StatsCardProps } from "@/components/Dashboard/StatsCard"; // Assuming StatsCardProps is exported
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

// Type Alias for Lucide Icons (improves readability for StatsCard icon prop)
type LucideIcon = forwarldRef.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;

// Classic quotes (consider moving to a separate constants file)
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
  "The secret of getting ahead is getting started.",
];

// Warrior quotes (consider moving to a separate constants file)
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
  "The warrior who trusts their path doesn't need to prove the other is wrong.",
];

// Game of Thrones quotes (consider moving to a separate constants file)
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
  "A mind needs books as a sword needs a whetstone, if it is to keep its edge. — Tyrion Lannister",
];
// Love and resilience quotes (consider moving to a separate constants file)
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
  "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it. — Rumi",
];

// User's personal quotes (consider moving to a separate constants file)
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
  "Even if you never know my love, this diary will carry it forever.",
];

import {
  HistoryItem,
  Todo,
  DashboardTodo, // Consider if this is needed or if Todo type suffices
  Habit,
  Goal, // Check this Goal type definition! See Error 9 comment below.
  Points,
} from "@/types/dashboard";

// Constants
const QUOTE_PLACEHOLDER = "Loading...";
const NO_TODOS_MESSAGE = "No todos yet!";
const ADD_YOUR_FIRST_TODO = "Add your first todo to get started.";
const NO_HABITS_MESSAGE = "No habits yet!";
const ADD_YOUR_FIRST_HABIT = "Add your first habit to get started.";
const NO_GOALS_MESSAGE = "No goals yet!";
const ADD_YOUR_FIRST_GOAL = "Add your first goal to get started.";
const GREETING_MORNING = "morning"; // Unused constant, consider removing
const HISTORY_LOADING_TIME = 500; // Artificial delay time

const Dashboard = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]); // This uses Goal from @/types/dashboard
  const [reflection, setReflection] = useState("");
  const [quote, setQuote] = useState("");
  // These state variables are set but never read. Consider removing if not used.
  const [gotQuote, setGotQuote] = useState("");
  const [loveQuote, setLoveQuote] = useState("");
  const [warriorQuote, setWarriorQuote] = useState("");
  // ---
  const [journalWritten, setJournalWritten] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [points, setPoints] = useState<Points>({
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    totalXP: 0,
  });

  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const { streaks } = useAchievements(); // streaks is: { todos: Streak; habits: Streak; journal: Streak; login: Streak; } | null | undefined

  // Get the appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "Good ";

    if (hour < 5) greeting += "night";
    else if (hour < 11) greeting += "morning";
    else if (hour < 17) greeting += "afternoon";
    else if (hour < 21) greeting += "evening";
    else greeting += "night";

    if (currentUser?.displayName) {
      greeting += `, ${currentUser.displayName.split(" ")[0]}`;
    }

    return greeting;
  };

  // Safer localStorage loading function
  const loadFromLocalStorage = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T>>, defaultValue: T) => {
    try {
      const savedData = localStorage.getItem(key);
      if (savedData) {
        setter(JSON.parse(savedData));
      } else {
        setter(defaultValue);
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      setter(defaultValue);
      toast({
        title: `Error loading ${key}`,
        description: `Could not load saved ${key}. Resetting to default.`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Fetch and set daily quotes
    const day = new Date().getDate();
    const month = new Date().getMonth();
    const personalQuoteIndex = (day + month) % personalQuotes.length;
    const personalQuoteIndex2 = (day + month + 1) % personalQuotes.length;
    const gotQuoteIndex = (day + month + 2) % gotQuotes.length;
    const loveQuoteIndex = (day + month + 3) % loveQuotes.length;

    setQuote(personalQuotes[personalQuoteIndex]);
    setLoveQuote(personalQuotes[personalQuoteIndex2]); // Not currently displayed
    setGotQuote(gotQuotes[gotQuoteIndex]); // Not currently displayed
    setWarriorQuote(loveQuotes[loveQuoteIndex]); // Not currently displayed

    // Load history
    setTimeout(() => {
      try {
        const recentHistory = getHistory(undefined, 10); // Assuming getHistory is synchronous
        setHistory(recentHistory);
      } catch (error) {
        console.error("Error loading history:", error);
        toast({ title: "Error loading history", variant: "destructive" });
        setHistory([]); // Reset on error
      } finally {
        setIsHistoryLoading(false);
      }
    }, HISTORY_LOADING_TIME);

    // Load data from localStorage safely
    loadFromLocalStorage("todos", setTodos, []);
    loadFromLocalStorage("habits", setHabits, []);
    loadFromLocalStorage("goals", setGoals, []); // Uses Goal from @/types/dashboard

    // Load daily reflection
    const currentDate = format(new Date(), "yyyy-MM-dd");
    try {
      const savedReflection = localStorage.getItem(`reflection-${currentDate}`);
      if (savedReflection) {
        setReflection(savedReflection);
        setJournalWritten(true);
      }
    } catch (error) {
      console.error(`Error loading reflection-${currentDate} from localStorage:`, error);
    }

    // Check for rewards after a short delay
    const rewardCheckTimeout = setTimeout(() => {
      // Ensure checkRewards has access to the latest state if needed, though here it reads directly
      checkRewards();
    }, 500);

    // Cleanup timeout on unmount
    return () => clearTimeout(rewardCheckTimeout);

    // Add dependencies. If loadFromLocalStorage uses toast, add toast.
    // If checkRewards depends on state that might change outside useEffect, reconsider its placement or dependencies.
  }, [toast]); // Added toast dependency

  // Sort todos by completion status and creation date
  // NOTE: `sortedTodos` is calculated but not used in the JSX. Used by `checkDailyCompletion`.
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.completed ? 1 : -1;
  });

  // Get today's habits
  const todayHabits = habits.filter((h) => h.frequency === "daily");
  const completedTodayCount = todayHabits.filter((h) =>
    h.completedDates?.includes(format(new Date(), "yyyy-MM-dd")) // Added optional chaining for safety
  ).length;

  // --- CORRECTED STREAK ACCESS ---
  const todoStreak = streaks?.todos?.current ?? 0;
  const journalStreak = streaks?.journal?.current ?? 0;
  const habitStreak = streaks?.habits?.current ?? 0;
  const loginStreak = streaks?.login?.current ?? 0;
  // --- END CORRECTION ---

  // Sort Goals (Active goals only)
  // NOTE: `sortedGoals` is calculated but not used in the JSX. Consider using it or removing it.
  const sortedGoals = [...goals]
    .filter((g) => !g.completedAt)
    .sort((a, b) => (b.progress ?? 0) / (b.target ?? 1) - (a.progress ?? 0) / (a.target ?? 1)); // Added nullish coalescing for safety

  // Get active goals count
  // NOTE: `activeGoalsCount` is calculated but not used in the JSX. Consider using it or removing it.
  const activeGoalsCount = goals.filter((g) => !g.completedAt).length;

  // Get completed goals count
  const completedGoalsCount = goals.filter((g) => g.completedAt).length;

  // Check for rewards
  const checkRewards = () => {
    // Pass potentially updated state if needed, though here it reads directly
    checkDailyCompletion(todos, habits, journalWritten);
  };

  // Add a new todo
  const handleAddTodo = (text: string): boolean => { // Explicit return type
    try {
      if (!text.trim()) {
         toast({ title: "Empty task", description: "Please enter text for the task.", variant: "destructive" });
         return false;
      }
      console.log("Adding todo:", text);
      const newTodo: Todo = { // Using Todo type assuming DashboardTodo isn't significantly different
        id: crypto.randomUUID(), // Use crypto.randomUUID for better uniqueness
        text,
        completed: false,
        createdAt: new Date().toISOString(),
        status: "pending", // Ensure 'status' is part of the Todo type if used
      };

      const updatedTodos = [newTodo, ...todos];
      setTodos(updatedTodos);
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
      console.log("Saved todos to localStorage:", updatedTodos);

      addToHistory("todo", "created", text);

      if (updatedTodos.length === 1) {
        showReward("tasks"); // Consider what 'tasks' reward entails
      }

      toast({
        title: "Task added",
        description: "Your new task has been added.",
      });
      return true;
    } catch (error) {
      console.error("Error adding todo in Dashboard:", error);
      toast({
        title: "Error adding task",
        description: "Could not add your task. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Toggle a todo's completed state
  const handleToggleTodo = (id: string) => {
     let toggledTodo: Todo | undefined;
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
         toggledTodo = { ...todo, completed: !todo.completed };
         return toggledTodo;
      }
      return todo;
    });

    setTodos(updatedTodos);
    localStorage.setItem("todos", JSON.stringify(updatedTodos));

    if (toggledTodo) {
      const action = toggledTodo.completed ? "completed" : "uncompleted";
      addToHistory("todo", action, toggledTodo.text || "Task");

      const allCompleted = updatedTodos.every((t) => t.completed);
      if (allCompleted && updatedTodos.length > 0) {
        checkAllTasksCompleted(updatedTodos);
      }

      checkDailyCompletion(updatedTodos, habits, journalWritten);
    }
  };

  // Delete a todo
  const handleDeleteTodo = (id: string) => {
    const todoToDelete = todos.find((t) => t.id === id);
    const updatedTodos = todos.filter((t) => t.id !== id);

    setTodos(updatedTodos);
    localStorage.setItem("todos", JSON.stringify(updatedTodos));

    if (todoToDelete) {
      addToHistory("todo", "deleted", todoToDelete.text || "Task");
      toast({ title: "Task deleted", description: `"${todoToDelete.text}" removed.`});
    }
  };

  // Save daily reflection
  const handleSaveReflection = () => {
    if (!reflection.trim()) {
      toast({
        title: "Empty reflection",
        description: "Write something before saving.",
        variant: "destructive",
      });
      return;
    }

    const currentDate = format(new Date(), "yyyy-MM-dd");
    localStorage.setItem(`reflection-${currentDate}`, reflection);

    const newEntry: HistoryItem = { // Explicitly type newEntry
      id: crypto.randomUUID(),
      type: "journal",
      action: "logged",
      name: `Daily reflection for ${format(new Date(), "MMM d, yyyy")}`,
      details: reflection.substring(0, 50) + (reflection.length > 50 ? "..." : ""),
      timestamp: new Date().toISOString(),
    };

    // Safely update history from localStorage
    try {
       const currentHistory = getHistory(); // Get full history
       const updatedHistory = [newEntry, ...currentHistory];
       localStorage.setItem("history", JSON.stringify(updatedHistory));
       setHistory(updatedHistory.slice(0, 10)); // Update local state with recent items
    } catch (error) {
        console.error("Error updating history after reflection:", error);
        // Optionally update local state optimistically anyway or show error
        setHistory(prev => [newEntry, ...prev].slice(0,10));
    }


    setJournalWritten(true);

    toast({
      title: "Reflection saved",
      description: "Your daily thoughts are recorded.",
    });

    checkDailyCompletion(todos, habits, true); // Pass true directly as it's now written
  };

  // Format timestamp for display
  const formatRelativeTime = (timestamp: string): string => {
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "just now";
        if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
        }
        if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hr${hours > 1 ? "s" : ""} ago`;
        }
        // No need for isSameDay check if hours check already handles it
        // if (isSameDay(date, now)) return "today";
        return format(date, "MMM d");
    } catch (e) {
        console.error("Error formatting time:", timestamp, e);
        return "invalid date";
    }
  };

  // Get icon based on history item type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "habit": return <ListChecks className="h-4 w-4 text-blue-500" />;
      case "goal": return <Target className="h-4 w-4 text-green-500" />;
      case "todo": return <ListTodo className="h-4 w-4 text-purple-500" />;
      case "journal": return <FileText className="h-4 w-4 text-yellow-500" />;
      case "mood": return <Heart className="h-4 w-4 text-pink-500" />;
      case "memory": return <Image className="h-4 w-4 text-indigo-500" />;
      default: return <Sparkles className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get description for history action
  const getActionDescription = (item: HistoryItem): string => {
    const actionMap: Record<string, string> = {
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",
      completed: "Completed",
      uncompleted: "Marked incomplete",
      pinned: "Pinned",
      unpinned: "Unpinned",
      logged: "Logged",
    };
    return actionMap[item.action] || item.action; // Fallback to raw action
  };

  // Render the quote card
  const renderQuote = () => (
    <Card className="bg-primary-foreground/5 border-primary/10">
      <CardContent className="py-8 text-center"> {/* Removed text-primary-foreground here, inherited */}
        <Quote className="h-8 w-8 text-primary mx-auto mb-4 opacity-40" />
        <p className="text-lg md:text-xl italic text-foreground/80">
          "{quote || QUOTE_PLACEHOLDER}" {/* Show placeholder if quote empty */}
        </p>
      </CardContent>
    </Card>
  );

  // JSX Structure
  return (
    <>
      {/* Decorative Background (No changes needed) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/50 to-background/90" />
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-drift-slow" />
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-[0.02] bg-repeat" />
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-[0.05] bg-repeat" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute inset-0 bg-[url('/images/swords-pattern.svg')] opacity-[0.02] bg-repeat rotate-45 scale-50" />
      </div>

      <div className="relative z-10 p-4 md:p-8"> {/* Added padding */}
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-primary ">
                {currentUser?.displayName?.[0]?.toUpperCase() || "U"} {/* Added uppercase */}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                {getGreeting()}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base"> {/* Adjusted text size */}
                Track your progress and conquer your goals
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
            onClick={() => navigate("/todos")} // Assuming /todos allows adding various items?
          >
            <Plus className="h-5 w-5 mr-2" />
            Quick Add
          </Button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* --- CORRECTED STATSCARD USAGE (Error 5) --- */}
              <StatsCard
                icon={Target as LucideIcon} // Cast icon type if needed
                title="Experience"
                value={`${points?.currentXP || 0} XP`}
                description={`Level ${points?.level || 1}`}
                // Removed children <Badge> as it's not an accepted prop per the error
                // If StatsCard *should* take children/badge, update its definition/props
              />
              {/* --- END CORRECTION --- */}

              {/* --- CORRECTED STATSCARD USAGE (Error 6) --- */}
              <StatsCard
                icon={ListTodo as LucideIcon}
                title="Tasks"
                value={`${todos.filter((t) => t.completed).length}/${todos.length}`}
                // Removed onClick and buttonLabel props as they don't exist on StatsCardProps per the error
                // onClick={() => navigate("/todos")}
                // buttonLabel="Add Task"
                // If StatsCard *should* have these, update its definition/props
                description="View Tasks" // Added placeholder description
              />
              {/* --- END CORRECTION --- */}

              {/* --- CORRECTED STATSCARD USAGE (Error 7) --- */}
              <StatsCard
                icon={ListChecks as LucideIcon}
                title="Habits"
                value={`${completedTodayCount}/${todayHabits.length}`}
                // Removed onClick and buttonLabel props
                // onClick={() => navigate("/habits")}
                // buttonLabel="Add Habit"
                description="View Habits" // Added placeholder description
              />
              {/* --- END CORRECTION --- */}

              {/* --- CORRECTED STATSCARD USAGE (Error 8) --- */}
              <StatsCard
                icon={Target as LucideIcon} // Re-using Target icon, consider a Goal specific one
                title="Goals"
                value={`${completedGoalsCount}/${goals.length}`}
                // Removed onClick and buttonLabel props
                // onClick={() => navigate("/goals")}
                // buttonLabel="Add Goal"
                description="View Goals" // Added placeholder description
              />
              {/* --- END CORRECTION --- */}
            </div>

            {/* Daily Summary */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm border-0 overflow-hidden"> {/* Added overflow-hidden */}
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Daily Summary</h3>
                </div>
                <SummaryWidget /> {/* Ensure SummaryWidget handles its own data fetching/display */}
              </CardContent>
            </Card>

            {/* Todo List */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  Today's Quests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <TodoList
                  todos={todos} // Pass the current todos state
                  onAddTodo={handleAddTodo}
                  onToggleTodo={handleToggleTodo}
                  onDeleteTodo={handleDeleteTodo}
                />
              </CardContent>
            </Card>

            {/* Quotes */}
            <AnimatePresence mode="wait"> {/* Added mode="wait" */}
              <motion.div
                key={quote} // Unique key for each quote
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }} // Slightly faster transition
              >
                {renderQuote()}
              </motion.div>
            </AnimatePresence>

            {/* History */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/30"> {/* Added header */}
                 <CardTitle className="flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-primary" />
                    Recent Activity
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isHistoryLoading ? (
                  <div className="space-y-4"> {/* Use div for skeleton layout */}
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ) : (
                  <div>
                    {history.length > 0 ? (
                      <ul className="space-y-3"> {/* Use ul and reduced spacing */}
                        {history.map((item) => (
                          <li key={item.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-sm">
                            <div className="flex-shrink-0 pt-0.5"> {/* Align icon better */}
                              {getActivityIcon(item.type)}
                            </div>
                            <div className="flex-grow min-w-0"> {/* Allow text to truncate */}
                              <p className="font-medium truncate">
                                {getActionDescription(item)}{" "}
                                <span className="font-normal text-primary">{item.name}</span>
                              </p>
                              {item.details && (
                                <p className="text-xs text-muted-foreground truncate">{item.details}</p>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex-shrink-0 ml-auto pl-2"> {/* Added padding left */}
                              {formatRelativeTime(item.timestamp)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No recent activity.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Active Goals */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-muted/30 p-6">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Active Goals</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm" // Smaller button
                  onClick={() => navigate("/goals")}
                  className="border-primary/20 hover:bg-primary/10"
                >
                  Manage
                </Button>
              </div>
              {/* Content */}
              <CardContent className="p-6">
                 {/* --- CORRECTED GOALWIDGET USAGE (Error 9) --- */}
                 {/* The 'goals' state uses the Goal type from @/types/dashboard. */}
                 {/* GoalWidget expects a Goal type that includes 'title', 'completed', 'status'. */}
                 {/* *** ACTION REQUIRED: You MUST ensure the Goal type definition in @/types/dashboard.ts matches the props expected by GoalWidget.tsx *** */}
                {goals.filter(g => !g.completedAt).length > 0 ? ( // Filter active goals for display check
                  <GoalWidget goals={goals.filter(g => !g.completedAt)} /> // Pass only active goals
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {NO_GOALS_MESSAGE}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {ADD_YOUR_FIRST_GOAL}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/goals")}
                    >
                      Create Goal
                    </Button>
                  </div>
                )}
                 {/* --- END CORRECTION --- */}
              </CardContent>
            </Card>

            {/* Mood Tracker */}
            <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/30"> {/* Added header */}
                 <CardTitle className="flex items-center gap-2">
                   <Heart className="h-5 w-5 text-primary" />
                   Mood Tracker
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <MoodWidget /> {/* Ensure MoodWidget handles its own data/logic */}
              </CardContent>
            </Card>

            {/* Add other widgets like Memory Board if needed */}
            {/* <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm ">
                <CardHeader className="border-b bg-muted/30">
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-5 w-5 text-primary" />
                        Memory Board
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <MemoryBoardWidget />
                </CardContent>
            </Card> */}

          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;