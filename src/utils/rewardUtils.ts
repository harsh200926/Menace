import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

// Sweet heartwarming messages for rewards
const heartMessages = [
  "The way you keep going makes her proud every single day.",
  "She would smile seeing how far you've come on this journey.",
  "Your dedication shines as brightly as her eyes once did.",
  "With every goal you complete, you honor the memory you cherish.",
  "The love you carry transforms into strength with each small victory.",
  "She would be amazed at how you've grown, step by step.",
  "The journey continues, but you're never walking it alone.",
  "Your persistence is beautiful - just like the memories you hold dear.",
  "Each completed task is a love letter to who you're becoming.",
  "The most precious diamonds are formed under pressure - you're becoming something beautiful."
];

// Romantic journal entries that feel personal
const journalEntries = [
  "Today I saw a butterfly and thought of you - how something so delicate can be so resilient. Just like the way you touched my heart.",
  "Dear diary, I found myself smiling today for no reason, then realized I was thinking of those moments we shared. How time stands still in memories.",
  "The sunset today had those same colors I once tried to describe to you. Some beauty can only be felt, never explained.",
  "I dreamt of you last night. In that space between worlds, we walked together again, and everything made sense.",
  "Sometimes I catch myself looking for you in crowds, even now. The heart doesn't easily forget its favorite person.",
  "A song played today that reminded me of you. It's amazing how music can carry feelings across time and distance.",
  "They say true connections never break, they just stretch across time and space. I felt that truth today.",
  "I saw something beautiful today and my first thought was wishing you could see it too. Some habits never fade.",
  "The rain today reminded me of that day we got caught without an umbrella. How we laughed instead of running. I miss that laughter.",
  "Today was full of small moments where I felt your presence. Maybe some bonds transcend physical distance."
];

// Milestone congratulatory messages
const milestoneMessages = [
  "Day by day, step by step, you're building something beautiful from these memories.",
  "Your journey has meaning, and every completed goal is a testament to your strength.",
  "This path isn't always easy, but the way you honor these feelings is truly beautiful.",
  "There's something magical about how you transform emotion into action and growth.",
  "Even on difficult days, you find the courage to continue. She would be so proud."
];

// Define types for our data structures
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  status: 'pending' | 'completed';
  dueDate?: string;
}

interface Habit {
  id: string;
  name: string;
  frequency: string;
  completedDates: string[];
}

// Save the reward status in localStorage
interface RewardStatus {
  lastRewardDate: string;
  tasksStreak: number;
  journalStreak: number;
  goalsCompleted: number;
  lastRewardType: string;
}

// Global state for reward dialog
interface RewardDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'tasks' | 'journal' | 'goal' | 'day';
}

// Initialize the reward dialog state
const initialRewardDialogState: RewardDialogState = {
  isOpen: false,
  title: '',
  message: '',
  type: 'tasks'
};

// Export a singleton for the reward dialog state
export let rewardDialogState = { ...initialRewardDialogState };

// Function to open the reward dialog
export const openRewardDialog = (title: string, message: string, type: 'tasks' | 'journal' | 'goal' | 'day'): void => {
  rewardDialogState = {
    isOpen: true,
    title,
    message,
    type
  };
  
  // Dispatch a custom event that our components can listen for
  const event = new CustomEvent('reward-dialog-update', { detail: rewardDialogState });
  window.dispatchEvent(event);
};

// Function to close the reward dialog
export const closeRewardDialog = (): void => {
  rewardDialogState = { ...initialRewardDialogState };
  
  // Dispatch a custom event
  const event = new CustomEvent('reward-dialog-update', { detail: rewardDialogState });
  window.dispatchEvent(event);
};

// Initialize or get reward status
export const getRewardStatus = (): RewardStatus => {
  const saved = localStorage.getItem('rewardStatus');
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    lastRewardDate: '',
    tasksStreak: 0,
    journalStreak: 0,
    goalsCompleted: 0,
    lastRewardType: ''
  };
};

// Save reward status
const saveRewardStatus = (status: RewardStatus): void => {
  localStorage.setItem('rewardStatus', JSON.stringify(status));
};

// Get a random message from the given array
const getRandomMessage = (array: string[]): string => {
  return array[Math.floor(Math.random() * array.length)];
};

// Check if user should receive a reward
export const checkForReward = (type: 'tasks' | 'journal' | 'goal' | 'day'): boolean => {
  const status = getRewardStatus();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Don't give multiple rewards on the same day for the same type
  if (status.lastRewardDate === today && status.lastRewardType === type) {
    return false;
  }
  
  // Update streaks and counts
  if (type === 'tasks') {
    status.tasksStreak += 1;
  } else if (type === 'journal') {
    status.journalStreak += 1;
  } else if (type === 'goal') {
    status.goalsCompleted += 1;
  }
  
  status.lastRewardDate = today;
  status.lastRewardType = type;
  saveRewardStatus(status);
  
  return true;
};

// Show a heartwarming reward
export const showReward = (type: 'tasks' | 'journal' | 'goal' | 'day'): void => {
  if (!checkForReward(type)) return;
  
  // Choose appropriate message based on type
  let title = '';
  let message = '';
  
  switch (type) {
    case 'tasks':
      title = '✨ All Tasks Completed!';
      message = getRandomMessage(heartMessages);
      break;
    case 'journal':
      title = '📝 Journal Entry Completed';
      message = getRandomMessage(journalEntries);
      break;
    case 'goal':
      title = '�� Goal Accomplished!';
      message = getRandomMessage(heartMessages);
      break;
    case 'day':
      title = '🌟 Milestone Reached!';
      message = getRandomMessage(milestoneMessages);
      break;
  }
  
  // Show the reward dialog
  openRewardDialog(title, message, type);
};

// Check if all tasks are completed
export const checkAllTasksCompleted = (todos: Todo[]): boolean => {
  return todos.length > 0 && todos.every(todo => todo.completed);
};

// Check if all daily habits are completed
export const checkAllHabitsCompleted = (habits: Habit[]): boolean => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const dailyHabits = habits.filter(h => h.frequency === 'daily');
  return dailyHabits.length > 0 && dailyHabits.every(h => h.completedDates.includes(today));
};

// Check for daily completion rewards
export const checkDailyCompletion = (todos: Todo[], habits: Habit[], journalWritten: boolean): void => {
  const allTasksCompleted = checkAllTasksCompleted(todos);
  const allHabitsCompleted = checkAllHabitsCompleted(habits);
  
  if (allTasksCompleted && allHabitsCompleted && journalWritten) {
    showReward('day');
  } else if (allTasksCompleted) {
    showReward('tasks');
  }
}; 