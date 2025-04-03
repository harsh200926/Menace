import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarDays, ChevronRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Define interface for goal
interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  category: string;
  deadline?: string;
  createdAt: string;
  updatedAt?: string;
  completed: boolean;
}

export function GoalWidget() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load goals from localStorage
    const loadGoals = () => {
      setLoading(true);
      try {
        const savedGoals = localStorage.getItem("goals");
        if (savedGoals) {
          const parsedGoals = JSON.parse(savedGoals) as Goal[];
          
          // Filter for active goals (not completed and with progress < 100)
          const activeGoals = parsedGoals.filter(
            (goal) => !goal.completed && goal.progress < 100
          );
          
          // Sort by progress (ascending) so least completed goals show first
          const sortedGoals = activeGoals.sort((a, b) => a.progress - b.progress);
          
          setGoals(sortedGoals);
        }
      } catch (error) {
        console.error("Error loading goals:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGoals();
  }, []);

  const handleManageGoals = () => {
    navigate("/goals");
  };

  // Function to get category color
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      "personal": "bg-blue-500",
      "work": "bg-purple-500",
      "health": "bg-green-500",
      "finance": "bg-amber-500",
      "education": "bg-indigo-500",
      "social": "bg-pink-500",
      "project": "bg-teal-500",
      "other": "bg-gray-500"
    };

    return categoryColors[category.toLowerCase()] || "bg-gray-500";
  };

  // Function to determine progress color
  const getProgressColor = (progress: number) => {
    if (progress < 25) return "bg-red-500";
    if (progress < 50) return "bg-amber-500";
    if (progress < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Target className="mr-2 h-5 w-5" />
          Active Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-0">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : goals.length > 0 ? (
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => (
              <motion.div 
                key={goal.id}
                className="border rounded-lg p-3 relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium line-clamp-1">{goal.title}</h3>
                    <Badge 
                      variant="outline" 
                      className={`mt-1 text-xs ${getCategoryColor(goal.category)} bg-opacity-15 text-foreground`}
                    >
                      {goal.category}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="font-bold">
                    {goal.progress}%
                  </Badge>
                </div>
                
                <Progress 
                  value={goal.progress} 
                  className={`h-2 mt-2 ${getProgressColor(goal.progress)}`}
                />
                
                {goal.deadline && (
                  <div className="flex items-center text-xs text-muted-foreground mt-2">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Due: {format(new Date(goal.deadline), "MMM d, yyyy")}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground mb-2">No active goals</p>
            <p className="text-xs text-muted-foreground">Set goals to track your progress</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={handleManageGoals} 
          variant="outline" 
          className="w-full flex items-center justify-center"
        >
          Manage Goals
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
} 