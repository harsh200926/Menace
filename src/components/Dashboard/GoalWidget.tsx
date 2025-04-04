import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Import Card components
import { Button } from "@/components/ui/button"; // Import Button component
import { Progress } from "@/components/ui/progress"; // Import Progress component
import { Badge } from "@/components/ui/badge"; // Import Badge component
import { format } from "date-fns"; // Import format from date-fns
import { CalendarDays, ChevronRight, Target } from "lucide-react"; // Import Icons
import { useNavigate } from "react-router-dom"; // Import useNavigate hook
import { motion } from "framer-motion";
import { Goal } from "@/types/dashboard"; // Import Goal type from dashboard

// Define the props interface for the GoalWidget component, using the Goal type
interface GoalWidgetProps {
  goals: Goal[];
}





const GoalsTitle = 'Active Goals';
const ManageGoalsText = 'Manage Goals';
const NoActiveGoalsText = 'No active goals';
const NoActiveGoalsDescription = 'Set goals to track your progress';
// Define the GoalWidget component
export function GoalWidget({ goals }: GoalWidgetProps) {
  const navigate = useNavigate();

  // Function to navigate to the goals page
  const handleManageGoals = () => {
    navigate("/goals");
  };

  // Function to get the color for a category
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
    <Card className="h-full space-y-4 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm">
      <CardContent className="p-6">
      <div className="flex items-center text-xl pb-2">
          <Target className="mr-2 h-5 w-5" />
        <h3 className="text-lg font-semibold">{GoalsTitle}</h3>
      </div>
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals
                .filter((goal) => goal.status === "active" && goal.progress < 100)
                .slice(0, 3)// Sort goals by progress
                .map((goal) => ( // Map through each goal
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
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-2">{NoActiveGoalsText}</p>
            <p className="text-xs text-muted-foreground">
            {NoActiveGoalsDescription}
            </p>
          </div>
        )}
        <Button onClick={handleManageGoals} variant="outline" className="w-full flex items-center justify-center mt-4">
          {ManageGoalsText}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
    
