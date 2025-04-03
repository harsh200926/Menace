import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Define interfaces for upcoming items
interface UpcomingTodo {
  id: string;
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  type: "todo";
}

interface UpcomingGoal {
  id: string;
  title: string;
  deadline: string;
  category: string;
  type: "goal";
}

type UpcomingItem = UpcomingTodo | UpcomingGoal;

// Define interfaces for localStorage items
interface TodoItem {
  id: string;
  title: string;
  dueDate?: string;
  priority?: "low" | "medium" | "high";
  completed: boolean;
}

interface GoalItem {
  id: string;
  title: string;
  deadline?: string;
  category: string;
  completed: boolean;
  progress: number;
}

export function UpcomingWidget() {
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    // Function to load and combine upcoming todos and goals
    const loadUpcomingItems = () => {
      // Load todos
      const todosJson = localStorage.getItem("todos");
      let upcomingTodos: UpcomingTodo[] = [];
      if (todosJson) {
        try {
          const todos = JSON.parse(todosJson) as TodoItem[];
          upcomingTodos = todos
            .filter((todo) => todo.dueDate && !todo.completed)
            .map((todo) => ({
              id: todo.id,
              title: todo.title,
              dueDate: todo.dueDate!,
              priority: todo.priority || "medium",
              type: "todo" as const
            }))
            .sort((a, b) => 
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
        } catch (error) {
          console.error("Error parsing todos:", error);
        }
      }
      
      // Load goals
      const goalsJson = localStorage.getItem("goals");
      let upcomingGoals: UpcomingGoal[] = [];
      if (goalsJson) {
        try {
          const goals = JSON.parse(goalsJson) as GoalItem[];
          upcomingGoals = goals
            .filter((goal) => goal.deadline && !goal.completed && goal.progress < 100)
            .map((goal) => ({
              id: goal.id,
              title: goal.title,
              deadline: goal.deadline!,
              category: goal.category,
              type: "goal" as const
            }))
            .sort((a, b) => 
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            );
        } catch (error) {
          console.error("Error parsing goals:", error);
        }
      }
      
      // Combine and sort all upcoming items
      const combined: (UpcomingTodo | UpcomingGoal & { date: string })[] = [
        ...upcomingTodos.map(todo => ({
          ...todo,
          date: todo.dueDate
        })),
        ...upcomingGoals.map(goal => ({
          ...goal,
          date: goal.deadline
        }))
      ].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setUpcomingItems(combined.slice(0, 5) as UpcomingItem[]); // Show top 5 upcoming items
      setLoading(false);
    };
    
    loadUpcomingItems();
  }, []);

  // Get color for priority badge
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  // Handle click on an upcoming item
  const handleItemClick = (item: UpcomingItem) => {
    if (item.type === "todo") {
      navigate("/tasks");
    } else if (item.type === "goal") {
      navigate("/goals");
    }
  };

  // Format due date string
  const formatDueDate = (dateString: string) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset hours to compare just the dates
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate.getTime() === today.getTime()) {
      return "Today";
    } else if (dueDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return format(dueDate, "MMM d, yyyy");
    }
  };

  // Check if date is soon (today or tomorrow)
  const isSoon = (dateString: string) => {
    const itemDate = new Date(dateString);
    const today = new Date();
    const twoDaysFromNow = new Date(today);
    twoDaysFromNow.setDate(today.getDate() + 2);
    
    return itemDate < twoDaysFromNow;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Clock className="mr-2 h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : upcomingItems.length > 0 ? (
          <div className="space-y-3">
            {upcomingItems.map((item) => (
              <motion.div
                key={`${item.type}-${item.id}`}
                className="p-3 border rounded-lg cursor-pointer"
                whileHover={{ backgroundColor: "hsl(var(--muted))", x: 2 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium line-clamp-1">{item.title}</h3>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <div className="flex items-center text-muted-foreground">
                        <CalendarDays className="h-3 w-3 mr-1" />
                        {item.type === "todo" 
                          ? formatDueDate(item.dueDate)
                          : formatDueDate(item.deadline)}
                      </div>
                      
                      {item.type === "todo" && (
                        <Badge 
                          variant="outline" 
                          className={`${getPriorityColor(item.priority)}`}
                        >
                          {item.priority}
                        </Badge>
                      )}
                      
                      {item.type === "goal" && (
                        <Badge variant="outline">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Badge variant="outline">
                    {item.type === "todo" ? "Task" : "Goal"}
                  </Badge>
                </div>
                
                {isSoon(item.type === "todo" ? item.dueDate : item.deadline) && (
                  <Badge 
                    variant="outline"
                    className="mt-2 bg-red-500 text-white border-red-500"
                  >
                    Due soon!
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground mb-2">No upcoming deadlines</p>
            <p className="text-xs text-muted-foreground">Your schedule is clear for now</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 