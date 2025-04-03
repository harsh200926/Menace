import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { format, subDays, isSameDay, differenceInDays, startOfWeek, addDays, getDay } from "date-fns";
import { Calendar as CalendarIcon, ListFilter, BarChart, Calendar, Clock, Tag } from "lucide-react";
import { BarChart3, LineChart, PieChart } from "lucide-react";
import {
  MOODS,
  getMoodColor,
  getMoodBackgroundColor,
  getMoodEntries,
  calculateMoodStats,
  getConsecutiveDays,
  MoodEntry
} from "@/utils/moodUtils";

type TimeRange = "all" | "week" | "month" | "3months";
type ViewType = "list" | "calendar" | "stats";

const MoodHistory: React.FC = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<MoodEntry[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [viewType, setViewType] = useState<ViewType>("list");
  const [stats, setStats] = useState<ReturnType<typeof calculateMoodStats> | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Load entries from localStorage
    const loadedEntries = getMoodEntries();
    setEntries(loadedEntries);
    
    // Calculate streak
    const currentStreak = getConsecutiveDays(loadedEntries);
    setStreak(currentStreak);
  }, []);

  useEffect(() => {
    // Filter entries based on selected time range
    const now = new Date();
    let filtered: MoodEntry[];
    
    switch (timeRange) {
      case "week":
        filtered = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return differenceInDays(now, entryDate) < 7;
        });
        break;
      case "month":
        filtered = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return differenceInDays(now, entryDate) < 30;
        });
        break;
      case "3months":
        filtered = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return differenceInDays(now, entryDate) < 90;
        });
        break;
      case "all":
      default:
        filtered = [...entries];
        break;
    }
    
    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredEntries(filtered);
    
    // Calculate stats for filtered entries
    if (filtered.length > 0) {
      setStats(calculateMoodStats(filtered));
    } else {
      setStats(null);
    }
  }, [entries, timeRange]);

  const generateCalendarData = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "week":
        startDate = startOfWeek(now);
        break;
      case "month":
        startDate = subDays(now, 30);
        break;
      case "3months":
        startDate = subDays(now, 90);
        break;
      case "all":
      default:
        // For "all", just show the last 30 days in calendar view
        startDate = subDays(now, 30);
        break;
    }
    
    // Generate array of dates
    const dates: Date[] = [];
    let currentDate = startDate;
    
    while (currentDate <= now) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    
    return dates;
  };

  const getEntryForDay = (day: Date) => {
    return entries.find(entry => isSameDay(new Date(entry.date), day));
  };

  return (
    <Card className="w-full shadow-sm border-border/40">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">Your Mood History</CardTitle>
            <CardDescription>Track your emotional patterns over time</CardDescription>
          </div>
          
          {streak > 0 && (
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span>{streak} day{streak !== 1 ? 's' : ''} streak</span>
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-4">
          <TabsList>
            <TabsTrigger value="list" onClick={() => setViewType("list")}>
              <ListFilter className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" onClick={() => setViewType("calendar")}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="stats" onClick={() => setViewType("stats")}>
              <BarChart className="h-4 w-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>
          
          <div className="flex">
            <Button
              variant={timeRange === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("week")}
              className="h-8 rounded-r-none"
            >
              Week
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("month")}
              className="h-8 rounded-none border-l-0"
            >
              Month
            </Button>
            <Button
              variant={timeRange === "3months" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("3months")}
              className="h-8 rounded-none border-l-0"
            >
              3 Months
            </Button>
            <Button
              variant={timeRange === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange("all")}
              className="h-8 rounded-l-none border-l-0"
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-6">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No mood entries found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Start logging your daily moods to see your patterns here.
            </p>
          </div>
        ) : (
          <>
            {/* List View */}
            {viewType === "list" && (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {filteredEntries.map(entry => (
                    <div key={entry.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className={`rounded-full p-2 mr-3 ${getMoodBackgroundColor(entry.mood)}`}>
                            {MOODS.find(m => m.value === entry.mood)?.icon && 
                              React.createElement(
                                MOODS.find(m => m.value === entry.mood)!.icon,
                                { className: "h-4 w-4" }
                              )
                            }
                          </div>
                          <div>
                            <div className="font-medium capitalize">{entry.mood}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-end">
                            {entry.tags.map(tag => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-[10px] px-1.5 py-0 h-5"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      {entry.note && (
                        <div className="text-sm mt-1 pl-9">
                          {entry.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
            
            {/* Calendar View */}
            {viewType === "calendar" && (
              <div className="mt-2">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-xs font-medium py-1">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {generateCalendarData().map((date, index) => {
                    const entry = getEntryForDay(date);
                    const isToday = isSameDay(date, new Date());
                    
                    // Calculate offset for first week
                    if (index === 0) {
                      const offset = getDay(date);
                      if (offset > 0) {
                        const offsetDivs = Array(offset).fill(null).map((_, i) => (
                          <div key={`offset-${i}`} className="h-12 rounded-md" />
                        ));
                        return [
                          ...offsetDivs,
                          <div 
                            key={date.toISOString()}
                            className={`h-12 rounded-md flex flex-col items-center justify-center p-1 ${
                              isToday ? 'border-2 border-primary' : 'border'
                            } ${entry ? getMoodBackgroundColor(entry.mood) : ''}`}
                          >
                            <div className="text-xs font-medium">{format(date, "d")}</div>
                            {entry && (
                              <div className="mt-1">
                                {React.createElement(
                                  MOODS.find(m => m.value === entry.mood)!.icon,
                                  { className: "h-3.5 w-3.5" }
                                )}
                              </div>
                            )}
                          </div>
                        ];
                      }
                    }
                    
                    return (
                      <div 
                        key={date.toISOString()}
                        className={`h-12 rounded-md flex flex-col items-center justify-center p-1 ${
                          isToday ? 'border-2 border-primary' : 'border'
                        } ${entry ? getMoodBackgroundColor(entry.mood) : ''}`}
                      >
                        <div className="text-xs font-medium">{format(date, "d")}</div>
                        {entry && (
                          <div className="mt-1">
                            {React.createElement(
                              MOODS.find(m => m.value === entry.mood)!.icon,
                              { className: "h-3.5 w-3.5" }
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Stats View */}
            {viewType === "stats" && stats && (
              <div className="mt-2 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium flex items-center">
                      <PieChart className="h-4 w-4 mr-2 text-primary" />
                      Mood Distribution
                    </h3>
                    <div className="text-sm">
                      <span className="font-medium">{stats.total}</span> entries
                    </div>
                  </div>
                  
                  {Object.entries(stats.moodCounts).map(([mood, count]) => {
                    if (count === 0) return null;
                    
                    const percentage = Math.round((count / stats.total) * 100);
                    return (
                      <div key={mood} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center">
                            <div 
                              className="h-3 w-3 rounded-full mr-2" 
                              style={{ backgroundColor: getMoodColor(mood) }}
                            />
                            <span className="capitalize">{mood}</span>
                          </div>
                          <div>{count} ({percentage}%)</div>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    );
                  })}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-primary" />
                    Common Tags
                  </h3>
                  
                  {stats.topTags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {stats.topTags.map(({ tag, count }) => (
                        <Badge key={tag} variant="secondary" className="flex gap-2">
                          {tag}
                          <span className="bg-primary/20 text-primary rounded-full px-1.5 text-xs">
                            {count}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No tags recorded in this period
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                    Insights
                  </h3>
                  
                  <div className="space-y-3 text-sm p-3 bg-accent/50 rounded-lg">
                    <div>
                      <span className="font-medium">Most frequent mood:</span>{' '}
                      <span className="capitalize">{stats.dominantMood}</span>
                    </div>
                    {streak > 0 && (
                      <div>
                        <span className="font-medium">Current streak:</span>{' '}
                        {streak} day{streak !== 1 ? 's' : ''}
                      </div>
                    )}
                    {stats.topTags.length > 0 && (
                      <div>
                        <span className="font-medium">Common feelings:</span>{' '}
                        {stats.topTags.slice(0, 3).map(t => t.tag).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodHistory; 