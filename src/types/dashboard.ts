export interface Goal {
  
  id: string;
  createdAt: string;
  name: string;
  target: number;
  progress: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  completedAt?: string;
  title: string;
  completed: boolean;
  category: string;
  deadline: string;
  status: "pending" | "in progress" | "completed";
}