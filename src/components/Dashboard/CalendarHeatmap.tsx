import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ActivityEntry = {
  date: string;
  count: number;
};

export function CalendarHeatmap() {
  const [activityData, setActivityData] = useState<ActivityEntry[]>([]);
  const [maxCount, setMaxCount] = useState(0);
  
  useEffect(() => {
    // Generate activity data for demonstration
    const generateActivityData = () => {
      const today = new Date();
      const startDate = subDays(today, 60);
      
      // Generate entries for each day in the interval
      const days = eachDayOfInterval({ start: startDate, end: today });
      
      // Get activity data from localStorage or generate random data
      const savedActivities = localStorage.getItem("activities");
      let activities: any[] = [];
      
      if (savedActivities) {
        activities = JSON.parse(savedActivities);
      }
      
      // Count activities per day
      const activityCounts = days.map(day => {
        const dateStr = format(day, "yyyy-MM-dd");
        let count = 0;
        
        if (activities.length > 0) {
          // Count actual activities on this day
          count = activities.filter((activity: any) => {
            const activityDate = parseISO(activity.timestamp);
            return isSameDay(activityDate, day);
          }).length;
        } else {
          // Generate random data for demonstration
          // More likely to have activity on weekdays
          const dayOfWeek = day.getDay();
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
          const baseChance = isWeekend ? 0.3 : 0.6;
          const hasActivity = Math.random() < baseChance;
          
          if (hasActivity) {
            // Generate 1-5 activities for active days
            count = Math.floor(Math.random() * 5) + 1;
          }
        }
        
        return {
          date: dateStr,
          count
        };
      });
      
      // Find maximum count for color scaling
      const max = Math.max(...activityCounts.map(d => d.count));
      setMaxCount(max > 0 ? max : 5); // Default to 5 if no activity
      
      setActivityData(activityCounts);
    };
    
    generateActivityData();
  }, []);
  
  // Get intensity class based on count and max count
  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted hover:bg-muted/80";
    
    const normalizedIntensity = count / maxCount;
    
    if (normalizedIntensity < 0.25) {
      return "bg-primary/10 hover:bg-primary/20";
    } else if (normalizedIntensity < 0.5) {
      return "bg-primary/30 hover:bg-primary/40";
    } else if (normalizedIntensity < 0.75) {
      return "bg-primary/50 hover:bg-primary/60";
    } else {
      return "bg-primary/70 hover:bg-primary/80";
    }
  };
  
  // Group activity data by week
  const groupByWeek = (data: ActivityEntry[]) => {
    const weeks: ActivityEntry[][] = [];
    let currentWeek: ActivityEntry[] = [];
    
    // Create copy and reverse to start with oldest
    const sortedData = [...data].reverse();
    
    sortedData.forEach((day, index) => {
      const dayOfWeek = parseISO(day.date).getDay();
      
      // Start new week on Sunday (0)
      if (dayOfWeek === 0 && index > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // Push the last week
      if (index === sortedData.length - 1) {
        weeks.push(currentWeek);
      }
    });
    
    return weeks;
  };
  
  const weeks = groupByWeek(activityData);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Activity Calendar
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[640px]">
            <div className="flex items-center mb-2">
              <div className="w-8 text-xs text-muted-foreground">
                {/* Empty space for alignment */}
              </div>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="flex-1 text-center text-xs text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex">
                  <div className="w-8 flex items-center">
                    <span className="text-xs text-muted-foreground">
                      {/* Get month name for first day of week */}
                      {week[0] && week[0].date ? 
                        format(parseISO(week[0].date), 'MMM') : ''}
                    </span>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-7 gap-2">
                    {Array(7).fill(null).map((_, dayIndex) => {
                      const day = week.find((d, i) => i === dayIndex);
                      
                      return (
                        <motion.div
                          key={dayIndex}
                          whileHover={{ scale: 1.2 }}
                          className={cn(
                            "aspect-square rounded",
                            day ? getIntensityClass(day.count) : "bg-transparent"
                          )}
                          title={day ? `${format(parseISO(day.date), 'MMM d')}: ${day.count} activities` : undefined}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-end mt-4 gap-2">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded bg-muted" />
                <div className="w-3 h-3 rounded bg-primary/10" />
                <div className="w-3 h-3 rounded bg-primary/30" />
                <div className="w-3 h-3 rounded bg-primary/50" />
                <div className="w-3 h-3 rounded bg-primary/70" />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 