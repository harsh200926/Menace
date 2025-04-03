import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, LineChart, PieChart, ComposedChart, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { addDays, format, subDays, startOfMonth, endOfMonth, differenceInDays, parseISO, isWithinInterval } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getHistorySummary } from "@/utils/historyUtils";
import InsightsPanel from "@/components/Analytics/InsightsPanel";

const colorSchemes = {
  productivity: ["#4ade80", "#fef08a", "#fca5a5"],
  mood: ["#2563eb", "#7dd3fc", "#bae6fd"],
  activity: ["#a855f7", "#d8b4fe", "#ede9fe"],
};

interface JournalEntry {
  id: string;
  content: string;
  date: string;
  timestamp: string;
  tags: string[];
  mood?: "great" | "good" | "neutral" | "bad" | "terrible";
}

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

interface JournalData {
  moodData: Array<{ name: string; value: number }>;
  entriesOverTime: Array<{ date: string; value: number }>;
  tagData: Array<{ name: string; value: number }>;
}

interface MoodData {
  trendData: Array<{
    date: string;
    displayDate: string;
    value: number;
    mood: string;
  }>;
  distributionData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  correlations: {
    withProductivity: string | null;
    withActivity: string | null;
  };
}

interface ActivityDayData {
  date: string;
  habitsCompleted: number;
  todosCompleted: number;
  goalsCompleted: number;
}

interface ActivityData {
  dailyData: ActivityDayData[];
  weeklyData: ActivityDayData[];
  monthlyData: ActivityDayData[];
}

interface MoodChartData {
  name: string;
  value: number;
}

const AnalyticsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("insights");
  const [timeRange, setTimeRange] = useState("week");
  
  const [habitData, setHabitData] = useState<any[]>([]);
  const [goalData, setGoalData] = useState<any[]>([]);
  
  const [journalData, setJournalData] = useState<JournalData>({
    moodData: [],
    entriesOverTime: [],
    tagData: []
  });
  
  const [moodData, setMoodData] = useState<MoodData>({
    trendData: [],
    distributionData: [],
    correlations: {
      withProductivity: null,
      withActivity: null
    }
  });
  
  const [historySummary, setHistorySummary] = useState<ReturnType<typeof getHistorySummary>>({
    byType: {},
    byAction: {},
    byDay: {},
    byMonth: {},
    total: 0
  });
  
  useEffect(() => {
    // Load data from localStorage
    const savedEntries = localStorage.getItem("journalEntries");
    const savedHabits = localStorage.getItem("habits");
    const savedGoals = localStorage.getItem("goals");
    const savedMoodEntries = localStorage.getItem("moodEntries");
    
    let entries = savedEntries ? JSON.parse(savedEntries) : [];
    let habits = savedHabits ? JSON.parse(savedHabits) : [];
    let goals = savedGoals ? JSON.parse(savedGoals) : [];
    let moodEntries = savedMoodEntries ? JSON.parse(savedMoodEntries) : [];
    
    // Process data for charts
    processJournalData(entries);
    processHabitData(habits);
    processGoalData(goals);
    processMoodData(moodEntries);
    
    // Get summary data
    const summary = getHistorySummary();
    setHistorySummary(summary);
  }, []);
  
  // Process habit data for charts
  const processHabitData = (habits: any[]) => {
    if (!habits.length) return;
    
    const habitCounts: Record<string, number> = {};
    
    habits.forEach(habit => {
      if (habit.category) {
        habitCounts[habit.category] = (habitCounts[habit.category] || 0) + 1;
      }
    });
    
    const habitData = Object.keys(habitCounts).map(category => ({
      name: category,
      value: habitCounts[category]
    }));
    
    setHabitData(habitData);
  };
  
  // Process goal data for charts
  const processGoalData = (goals: any[]) => {
    if (!goals.length) return;
    
    const goalCounts: Record<string, number> = {};
    
    goals.forEach(goal => {
      if (goal.category) {
        goalCounts[goal.category] = (goalCounts[goal.category] || 0) + 1;
      }
    });
    
    const goalData = Object.keys(goalCounts).map(category => ({
      name: category,
      value: goalCounts[category]
    }));
    
    setGoalData(goalData);
  };
  
  // Process journal data for charts
  const processJournalData = (entries: any[]) => {
    if (!entries.length) return;
    
    // Get mood distribution
    const moodCounts: Record<string, number> = {
      great: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      terrible: 0
    };
    
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood]++;
      }
    });
    
    const moodData: MoodChartData[] = Object.keys(moodCounts).map(mood => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: moodCounts[mood]
    }));
    
    // Get entries over time
    const entriesOverTime: { date: string; value: number }[] = [];
    const startDate = subDays(new Date(), 7); // Last 7 days
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      const dateString = format(date, "yyyy-MM-dd");
      const count = entries.filter(entry => entry.date === dateString).length;
      
      entriesOverTime.push({
        date: format(date, "MMM d"),
        value: count
      });
    }
    
    // Get most used tags
    const tagCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    const tagData = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
    
    setJournalData({
      moodData,
      entriesOverTime,
      tagData
    });
  };
  
  // Process mood data for charts
  const processMoodData = (moodEntries: any[]) => {
    if (!moodEntries.length) return;
    
    // Filter mood entries based on the selected time range
    let filteredEntries = [...moodEntries];
    
    if (timeRange === "week") {
      const startDate = subDays(new Date(), 7);
      filteredEntries = moodEntries.filter(entry => {
        const entryDate = parseISO(entry.timestamp);
        return entryDate >= startDate;
      });
    } else if (timeRange === "month") {
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());
      
      filteredEntries = moodEntries.filter(entry => {
        const entryDate = parseISO(entry.timestamp);
        return isWithinInterval(entryDate, { start: startDate, end: endDate });
      });
    } else if (timeRange === "year") {
      const startDate = subDays(new Date(), 365);
      filteredEntries = moodEntries.filter(entry => {
        const entryDate = parseISO(entry.timestamp);
        return entryDate >= startDate;
      });
    }
    
    // Get mood trend data
    const trendData: { date: string; displayDate: string; value: number; mood: string }[] = [];
    
    if (timeRange === "week") {
      const startDate = subDays(new Date(), 7);
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(startDate, i);
        const dateString = format(date, "yyyy-MM-dd");
        const entry = filteredEntries.find(entry => entry.date === dateString);
        
        trendData.push({
          date: format(date, "MMM d"),
          displayDate: dateString,
          value: entry ? getMoodValue(entry.mood) : 0,
          mood: entry ? entry.mood : "none"
        });
      }
    } else {
      const startDate = subDays(new Date(), 30);
      
      for (let i = 0; i < 30; i++) {
        const date = addDays(startDate, i);
        const dateString = format(date, "yyyy-MM-dd");
        const entry = filteredEntries.find(entry => entry.date === dateString);
        
        trendData.push({
          date: format(date, "MMM d"),
          displayDate: dateString,
          value: entry ? getMoodValue(entry.mood) : 0,
          mood: entry ? entry.mood : "none"
        });
      }
    }
    
    // Get mood distribution data
    const moodCounts: Record<string, number> = {
      great: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      terrible: 0
    };
    
    filteredEntries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood]++;
      }
    });
    
    const distributionData: { name: string; value: number; color: string }[] = [
      { name: "Great", value: moodCounts["great"], color: colorSchemes.mood[0] },
      { name: "Good", value: moodCounts["good"], color: colorSchemes.mood[1] },
      { name: "Neutral", value: moodCounts["neutral"], color: colorSchemes.mood[2] },
      { name: "Bad", value: moodCounts["bad"], color: colorSchemes.mood[1] },
      { name: "Terrible", value: moodCounts["terrible"], color: colorSchemes.mood[0] }
    ];
    
    // Get correlations (example)
    const withProductivity = "High productivity days correlate with good mood";
    const withActivity = "Active days correlate with good mood";
    
    setMoodData({
      trendData,
      distributionData,
      correlations: {
        withProductivity,
        withActivity
      }
    });
  };
  
  const getMoodValue = (mood: string) => {
    switch (mood) {
      case "great":
        return 5;
      case "good":
        return 4;
      case "neutral":
        return 3;
      case "bad":
        return 2;
      case "terrible":
        return 1;
      default:
        return 0;
    }
  };
  
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    
    // Load mood entries
    const savedMoodEntries = localStorage.getItem("moodEntries");
    let moodEntries = savedMoodEntries ? JSON.parse(savedMoodEntries) : [];
    
    processMoodData(moodEntries);
    
    toast({
      title: "Time range updated",
      description: `Showing data for the last ${value}.`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maester's Ledgers</h1>
        <p className="text-muted-foreground">
          Gain insights into your habits, goals, and journal entries.
        </p>
      </div>
      
      <Tabs defaultValue="insights" className="w-full" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-4">
          <InsightsPanel 
            habits={[]}
            goals={[]}
            journalEntries={[]}
            moodEntries={[]}
            history={[]}
            onRefresh={() => {}} 
          />
        </TabsContent>
        
        <TabsContent value="habits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Habit Categories</CardTitle>
              <CardDescription>Distribution of your habits by category.</CardDescription>
            </CardHeader>
            <CardContent>
              {habitData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      isAnimationActive={false}
                      data={habitData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {
                        habitData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorSchemes.productivity[index % colorSchemes.productivity.length]} />
                        ))
                      }
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No habit data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Categories</CardTitle>
              <CardDescription>Distribution of your goals by category.</CardDescription>
            </CardHeader>
            <CardContent>
              {goalData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      isAnimationActive={false}
                      data={goalData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {
                        goalData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorSchemes.productivity[index % colorSchemes.productivity.length]} />
                        ))
                      }
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No goal data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>Distribution of moods in your journal entries.</CardDescription>
            </CardHeader>
            <CardContent>
              {journalData.moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      isAnimationActive={false}
                      data={journalData.moodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {
                        journalData.moodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colorSchemes.mood[index % colorSchemes.mood.length]} />
                        ))
                      }
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No journal entries available.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Entries Over Time (Last 7 Days)</CardTitle>
              <CardDescription>Number of journal entries per day.</CardDescription>
            </CardHeader>
            <CardContent>
              {journalData.entriesOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={journalData.entriesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No journal entries available.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Most Used Tags</CardTitle>
              <CardDescription>Top 5 most used tags in your journal entries.</CardDescription>
            </CardHeader>
            <CardContent>
              {journalData.tagData.length > 0 ? (
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {journalData.tagData.map(tag => (
                      <div key={tag.name} className="flex items-center justify-between">
                        <p className="text-sm font-medium">{tag.name}</p>
                        <span className="text-xs text-muted-foreground">{tag.value}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No tags available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mood" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mood Trend</CardTitle>
              <CardDescription>Your mood trend over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select onValueChange={handleTimeRangeChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    {/* <SelectItem value="year">Last Year</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              
              {moodData.trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis ticks={[1, 2, 3, 4, 5]} tickFormatter={(value) => {
                      switch (value) {
                        case 1: return 'Terrible';
                        case 2: return 'Bad';
                        case 3: return 'Neutral';
                        case 4: return 'Good';
                        case 5: return 'Great';
                        default: return '';
                      }
                    }} />
                    <Tooltip labelFormatter={(value) => {
                      const entry = moodData.trendData.find(item => item.date === value);
                      return entry ? `${entry.displayDate} (${entry.mood})` : value;
                    }} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" name="Mood" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No mood data available for the selected time range.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Mood Distribution</CardTitle>
              <CardDescription>Distribution of your moods.</CardDescription>
            </CardHeader>
            <CardContent>
              {moodData.distributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      isAnimationActive={false}
                      data={moodData.distributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {
                        moodData.distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                      }
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No mood data available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
