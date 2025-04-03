import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, subDays, differenceInDays, parseISO } from "date-fns";
import { Smile, Frown, Meh, SmilePlus, ThumbsDown, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MoodEntry {
  id: string;
  mood: "great" | "good" | "neutral" | "bad" | "terrible";
  note: string;
  date: string;
  timestamp: string;
}

interface MoodWidgetProps {
  quoteOfTheDay?: string;
}

const MoodWidget = ({ quoteOfTheDay }: MoodWidgetProps) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [streakDays, setStreakDays] = useState(0);
  const [pattern, setPattern] = useState<{ icon: JSX.Element; message: string } | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const savedEntries = localStorage.getItem("moodEntries");
    if (savedEntries) {
      const entries: MoodEntry[] = JSON.parse(savedEntries);
      setMoodEntries(entries);
      
      // Check for today's entry
      const today = format(new Date(), "yyyy-MM-dd");
      const todaysEntry = entries.find(entry => entry.date === today);
      if (todaysEntry) {
        setTodayEntry(todaysEntry);
      }
      
      // Calculate streak
      calculateStreak(entries);
      
      // Detect mood patterns
      setPattern(getMoodPattern());
    }
  }, []);
  
  const calculateStreak = (entries: MoodEntry[]) => {
    if (entries.length === 0) return;
    
    let streak = 0;
    const today = new Date();
    const currentDate = today;
    
    // Sort entries by date descending
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Check if there's an entry for today
    const todayFormatted = format(today, "yyyy-MM-dd");
    const hasTodayEntry = sortedEntries.some(entry => entry.date === todayFormatted);
    
    if (hasTodayEntry) {
      streak = 1;
      
      // Check previous days
      let checkDate = subDays(today, 1);
      let entryIndex = 1; // Start from the second entry if exists
      
      while (entryIndex < sortedEntries.length) {
        const checkDateFormatted = format(checkDate, "yyyy-MM-dd");
        const hasEntryForDate = sortedEntries.some(entry => entry.date === checkDateFormatted);
        
        if (hasEntryForDate) {
          streak++;
          checkDate = subDays(checkDate, 1);
        } else {
          break;
        }
        
        entryIndex++;
      }
    }
    
    setStreakDays(streak);
  };
  
  const getMoodIcon = (moodType: MoodEntry["mood"], size = 24) => {
    const className = `h-${size} w-${size}`;
    
    switch (moodType) {
      case "great":
        return <SmilePlus className={`${className} text-green-500`} />;
      case "good":
        return <Smile className={`${className} text-emerald-500`} />;
      case "neutral":
        return <Meh className={`${className} text-blue-500`} />;
      case "bad":
        return <Frown className={`${className} text-amber-500`} />;
      case "terrible":
        return <ThumbsDown className={`${className} text-red-500`} />;
      default:
        return null;
    }
  };
  
  const getMoodPattern = () => {
    if (moodEntries.length < 3) return null;
    
    const recentMoods = moodEntries.slice(0, 3).map(entry => entry.mood);
    
    if (recentMoods.every(mood => mood === "good" || mood === "great")) {
      return {
        message: "You've been feeling great lately!",
        icon: <Lightbulb className="h-4 w-4 text-yellow-500" />
      };
    }
    
    if (recentMoods.every(mood => mood === "bad" || mood === "terrible")) {
      return {
        message: "Your mood has been low recently. Consider taking a break.",
        icon: <Lightbulb className="h-4 w-4 text-blue-500" />
      };
    }
    
    return null;
  };
  
  return (
    <Card className="h-full shadow-md overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm card-equal-height">
      <CardHeader className="bg-primary/5 border-b border-border/20 pb-3">
        <CardTitle className="flex items-center justify-between text-xl">
          <div className="flex items-center gap-2">
            <Meh size={18} className="text-primary" />
            <span>Mood Tracker</span>
          </div>
          {streakDays > 0 && (
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              {streakDays} day streak
            </span>
          )}
        </CardTitle>
        {quoteOfTheDay && (
          <CardDescription>
            {quoteOfTheDay}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="card-content">
        {todayEntry ? (
          <div className="space-y-4 py-6">
            <div className="flex items-center space-x-4">
              {getMoodIcon(todayEntry.mood, 8)}
              <div>
                <h3 className="font-medium capitalize text-xl">{todayEntry.mood}</h3>
                <p className="text-muted-foreground">Today's mood</p>
              </div>
            </div>
            
            {todayEntry.note && (
              <div className="bg-secondary/30 p-4 rounded-md italic">
                "{todayEntry.note}"
              </div>
            )}
            
            {pattern && (
              <div className="flex items-start space-x-2 bg-primary/10 p-3 rounded">
                {pattern.icon}
                <p>{pattern.message}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 flex flex-col items-center justify-center h-full">
            <Meh className="h-16 w-16 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="font-medium mb-1 text-xl">No mood logged today</h3>
            <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
              Track your mood to gain insights about your emotional patterns
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-card/50 border-t border-border/20 mt-auto card-footer">
        <Button 
          onClick={() => navigate("/journal")} 
          variant="outline" 
          className="w-full bg-card hover:bg-card/80"
        >
          {todayEntry ? "Update Today's Mood" : "Log Today's Mood"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MoodWidget;
