import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import { getActivities } from "@/utils/historyUtils";

// Define the activity item interface
interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
  entityId?: string;
  entityType?: string;
}

interface RecentActivityWidgetProps {
  limit?: number;
}

export function RecentActivityWidget({ limit = 5 }: RecentActivityWidgetProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to load activities
    const loadActivities = () => {
      setLoading(true);
      try {
        const loadedActivities = getActivities();
        
        // Sort activities by timestamp (most recent first)
        const sortedActivities = loadedActivities.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        // Limit the number of activities shown
        setActivities(sortedActivities.slice(0, limit));
      } catch (error) {
        console.error("Error loading activities:", error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [limit]);

  // Format the timestamp to a readable format
  const formatTimestamp = (timestamp: string | unknown) => {
    try {
      if (typeof timestamp !== 'string') {
        return "Unknown time";
      }
      
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Unknown time";
      }
      
      return format(date, "MMM d, h:mm a");
    } catch (error) {
      return "Unknown time";
    }
  };

  // Get the appropriate label for each activity type
  const getActionLabel = (action: string | unknown) => {
    // If action is not a string, return a default value
    if (typeof action !== 'string') return 'Unknown action';
    
    const actionMap: Record<string, string> = {
      "task_created": "Created task",
      "task_completed": "Completed task",
      "task_updated": "Updated task",
      "task_deleted": "Deleted task",
      "goal_created": "Created goal",
      "goal_updated": "Updated goal",
      "goal_completed": "Achieved goal",
      "goal_deleted": "Deleted goal",
      "note_created": "Added note",
      "note_updated": "Updated note",
      "note_deleted": "Deleted note",
      "login": "Logged in",
      "theme_changed": "Changed theme",
      "settings_updated": "Updated settings",
      "profile_updated": "Updated profile"
    };
    
    return actionMap[action] || action;
  };

  // Get the appropriate color for each activity type
  const getActionColor = (action: string | unknown) => {
    if (typeof action !== 'string') return "bg-gray-500 text-white";
    if (action.includes("created")) return "bg-green-500 text-white";
    if (action.includes("completed") || action.includes("achieved")) return "bg-blue-500 text-white";
    if (action.includes("updated")) return "bg-yellow-500 text-black";
    if (action.includes("deleted")) return "bg-red-500 text-white";
    return "bg-gray-500 text-white";
  };

  // Safe function to check if a value is an object
  const isObject = (value: unknown): boolean => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Activity className="mr-2 h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                className="border rounded-lg p-3"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge 
                      className={getActionColor(activity.action)}
                    >
                      {getActionLabel(activity.action)}
                    </Badge>
                    {activity.details && typeof activity.details === 'string' && (
                      <p className="mt-1 text-sm">{activity.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(String(activity.timestamp || ''))}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground mb-2">No recent activity</p>
            <p className="text-xs text-muted-foreground">Your actions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 