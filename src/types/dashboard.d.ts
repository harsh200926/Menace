export interface Points {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
}

export interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description?: string;
}

export type DashboardTodo = Todo;

export interface HistoryItem {
  id: string;
  type: string;
  action: string;
  name: string;
  details?: string;
  timestamp: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  status: 'pending' | 'completed';
  dueDate?: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: string;
  completedDates: string[];
  streak: number;
  category: string;
  created: string;
}

export interface Goal {
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