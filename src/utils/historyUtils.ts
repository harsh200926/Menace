export type HistoryItemType = 'todo' | 'habit' | 'goal' | 'event' | 'note' | 'milestone' | 'memory' | 'quote' | 'journal' | 'mood';
export type HistoryAction = 'created' | 'updated' | 'deleted' | 'completed' | 'uncompleted' | 'pinned' | 'unpinned' | 'logged';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  action: HistoryAction;
  name: string;
  details?: string;
  timestamp: string;
}

/**
 * Adds an action to the history
 * @param type The type of item (habit, goal, event, note, milestone)
 * @param action What happened (created, updated, deleted, completed, etc.)
 * @param name The name of the item
 * @param details Optional additional details
 */
export const addToHistory = (type: string, action: string, name: string, details?: string) => {
  try {
    const newEntry = {
      id: crypto.randomUUID(),
      type,
      action,
      name,
      details,
      timestamp: new Date().toISOString()
    };
    
    const history = getHistory();
    const updatedHistory = [newEntry, ...history];
    
    localStorage.setItem('history', JSON.stringify(updatedHistory));
    
    return newEntry;
  } catch (error) {
    console.error("Error adding to history:", error);
    return null;
  }
};

/**
 * Gets history items, optionally filtered by type
 * @param type Optional type to filter by
 * @param limit Optional number of items to return
 * @returns Array of history items
 */
export const getHistory = (type?: string, limit?: number) => {
  try {
    const historyData = localStorage.getItem('history');
    if (!historyData) return [];
    
    let history = JSON.parse(historyData);
    
    if (type) {
      history = history.filter((item: any) => item.type === type);
    }
    
    if (limit) {
      history = history.slice(0, limit);
    }
    
    return history;
  } catch (error) {
    console.error("Error getting history:", error);
    return [];
  }
};

/**
 * Clears all history items
 */
export const clearHistory = () => {
  localStorage.removeItem("history");
};

/**
 * Gets a formatted history summary for analytics
 * @returns Object with counts by type and action
 */
export const getHistorySummary = () => {
  const history = getHistory();
  
  // Initialize summary object
  const summary = {
    byType: {} as Record<string, number>,
    byAction: {} as Record<string, number>,
    byDay: {} as Record<string, number>,
    byMonth: {} as Record<string, number>,
    total: history.length
  };
  
  // Count items by type and action
  history.forEach((item: HistoryItem) => {
    // Count by type
    if (summary.byType[item.type]) {
      summary.byType[item.type]++;
    } else {
      summary.byType[item.type] = 1;
    }
    
    // Count by action
    if (summary.byAction[item.action]) {
      summary.byAction[item.action]++;
    } else {
      summary.byAction[item.action] = 1;
    }
    
    // Count by day
    const date = new Date(item.timestamp);
    const day = date.toISOString().split('T')[0];
    if (summary.byDay[day]) {
      summary.byDay[day]++;
    } else {
      summary.byDay[day] = 1;
    }
    
    // Count by month
    const month = day.substring(0, 7); // YYYY-MM
    if (summary.byMonth[month]) {
      summary.byMonth[month]++;
    } else {
      summary.byMonth[month] = 1;
    }
  });
  
  return summary;
};

// Load activities or create empty array
export const getActivities = () => {
  try {
    const activities = localStorage.getItem('activities');
    return activities ? JSON.parse(activities) : [];
  } catch (error) {
    console.error("Error loading activities:", error);
    return [];
  }
};

// Add a new activity
export const addActivity = (action: string, details?: string, entityId?: string, entityType?: string) => {
  try {
    const newActivity = {
      id: crypto.randomUUID(),
      action,
      timestamp: new Date().toISOString(),
      details,
      entityId,
      entityType
    };
    
    const activities = getActivities();
    const updatedActivities = [newActivity, ...activities];
    
    localStorage.setItem('activities', JSON.stringify(updatedActivities));
    
    return newActivity;
  } catch (error) {
    console.error("Error adding activity:", error);
    return null;
  }
};
