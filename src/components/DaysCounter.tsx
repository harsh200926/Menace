import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DaysCounterProps {
  startDate?: Date;
  days?: number;
  label?: string;
  className?: string;
}

const DaysCounter = ({ startDate, days: propDays, label = "Time Passed", className }: DaysCounterProps) => {
  const [days, setDays] = useState(propDays || 0);
  const [weeks, setWeeks] = useState(0);
  const [months, setMonths] = useState(0);
  
  useEffect(() => {
    // If days is directly provided, use that instead of calculating
    if (propDays !== undefined) {
      setDays(propDays);
      setWeeks(Math.floor(propDays / 7));
      setMonths(Math.floor(propDays / 30));
      return;
    }
    
    // Only calculate if startDate is provided
    if (!startDate) return;
    
    const calculateTimePassed = () => {
      const currentDate = new Date();
      
      // For accurate day difference accounting for time zones
      const timeDiff = currentDate.getTime() - startDate.getTime();
      const daysPassed = Math.floor(timeDiff / (1000 * 3600 * 24));
      
      // Calculate weeks
      const weeksPassed = Math.floor(daysPassed / 7);
      
      // Calculate months - more approximate
      const monthDiff = 
        (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
        (currentDate.getMonth() - startDate.getMonth());
      
      setDays(daysPassed);
      setWeeks(weeksPassed);
      setMonths(monthDiff);
    };
    
    calculateTimePassed();
    
    // Update every day at midnight
    const timer = setInterval(() => {
      calculateTimePassed();
    }, 1000 * 60 * 60 * 24);
    
    return () => clearInterval(timer);
  }, [startDate, propDays]);
  
  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-primary">{days}</span>
            <span className="text-xs text-muted-foreground">Days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-primary">{weeks}</span>
            <span className="text-xs text-muted-foreground">Weeks</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-primary">{months}</span>
            <span className="text-xs text-muted-foreground">Months</span>
          </div>
        </div>
        {startDate && (
          <div className="mt-3 text-xs text-center text-muted-foreground">
            Since {startDate.toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DaysCounter; 