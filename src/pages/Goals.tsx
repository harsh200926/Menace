import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash, CheckCircle, XCircle, ListChecks, ArrowDown, ArrowUp, LayoutGrid, List } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, isPast, isToday, parseISO } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { addToHistory } from "@/utils/historyUtils";
import { motion } from "framer-motion";

type GoalStatus = "active" | "completed" | "archived";
type GoalPriority = "high" | "medium" | "low";

interface Goal {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  category: string;
  priority: GoalPriority;
  status: GoalStatus;
  createdAt: string;
  dueDate?: string;
}

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem("goals");
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isEditGoalOpen, setIsEditGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<GoalStatus | "all">("active");
  const [filterCategory, setFilterCategory] = useState<string | "all">("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  
  const [newGoal, setNewGoal] = useState<Omit<Goal, "id" | "status" | "createdAt">>({
    name: "",
    description: "",
    progress: 0,
    target: 100,
    category: "personal",
    priority: "medium",
    dueDate: undefined
  });
  
  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);
  
  const handleAddGoal = () => {
    if (!newGoal.name.trim()) {
      toast("Please enter a name for the goal");
      return;
    }
    
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      status: "active",
      createdAt: new Date().toISOString()
    };
    
    setGoals([goal, ...goals]);
    setIsAddGoalOpen(false);
    setNewGoal({
      name: "",
      description: "",
      progress: 0,
      target: 100,
      category: "personal",
      priority: "medium",
      dueDate: undefined
    });
    
    toast("Goal added successfully");
    addToHistory("goal", "created", goal.name);
  };
  
  const handleUpdateGoal = () => {
    if (!selectedGoal) return;
    
    const updatedGoals = goals.map(goal => 
      goal.id === selectedGoal.id ? selectedGoal : goal
    );
    
    setGoals(updatedGoals);
    setIsEditGoalOpen(false);
    
    toast("Goal updated successfully");
    addToHistory("goal", "updated", selectedGoal.name);
  };
  
  const handleDeleteGoal = (id: string) => {
    const goalToDelete = goals.find(goal => goal.id === id);
    if (!goalToDelete) return;
    
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    setIsEditGoalOpen(false);
    
    toast("Goal deleted successfully");
    addToHistory("goal", "deleted", goalToDelete.name);
  };
  
  const toggleGoalStatus = (id: string, status: GoalStatus) => {
    setGoals(goals.map(goal => {
      if (goal.id === id) {
        
        addToHistory("goal", status, goal.name);
        
        return {
          ...goal,
          status: status
        };
      }
      return goal;
    }));
    
    toast(`Goal marked as ${status}`);
  };
  
  // Function to calculate days remaining
  const daysRemaining = (dueDate: string | undefined) => {
    if (!dueDate) return "No due date";
    
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    
    if (days < 0) {
      return "Overdue";
    } else if (days === 0) {
      return "Due today";
    } else {
      return `${days} days remaining`;
    }
  };
  
  // Function to determine if a goal is overdue
  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false;
    
    const due = new Date(dueDate);
    return isPast(due) && !isToday(due);
  };
  
  // Function to determine if a goal is due today
  const isDueToday = (dueDate: string | undefined) => {
    if (!dueDate) return false;
    
    const due = new Date(dueDate);
    return isToday(due);
  };
  
  // Function to sort goals
  const sortGoals = (goals: Goal[]) => {
    const sortedGoals = [...goals];
    
    sortedGoals.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === "priority") {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        comparison = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      } else if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return sortedGoals;
  };
  
  // Function to filter goals
  const filterGoals = (goals: Goal[]) => {
    let filteredGoals = [...goals];
    
    if (filterStatus !== "all") {
      filteredGoals = filteredGoals.filter(goal => goal.status === filterStatus);
    }
    
    if (filterCategory !== "all") {
      filteredGoals = filteredGoals.filter(goal => goal.category === filterCategory);
    }
    
    return filteredGoals;
  };
  
  // Get unique categories from all goals
  const getUniqueCategories = () => {
    const categories = goals.map(goal => goal.category);
    return ["all", ...new Set(categories)];
  };
  
  const sortedGoals = sortGoals(filterGoals(goals));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Oaths</h1>
        <Button onClick={() => setIsAddGoalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Goal
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Current Goals</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            >
              {sortOrder === "asc" ? <ArrowUp /> : <ArrowDown />}
            </Button>
            
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as GoalStatus | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No goals yet</h3>
              <p className="text-muted-foreground mt-2">
                Start setting goals to achieve your dreams.
              </p>
              <Button 
                onClick={() => setIsAddGoalOpen(true)} 
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" /> Create a Goal
              </Button>
            </div>
          ) : viewMode === "list" ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {sortedGoals.map(goal => (
                  <div key={goal.id} className="border rounded-lg p-4 hover:bg-secondary/20 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {goal.category}
                          </span>
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                            {goal.priority} priority
                          </span>
                          {goal.dueDate && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isOverdue(goal.dueDate) ? "bg-red-500/10 text-red-500" :
                              isDueToday(goal.dueDate) ? "bg-orange-500/10 text-orange-500" :
                              "bg-green-500/10 text-green-500"
                            }`}>
                              {daysRemaining(goal.dueDate)}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{goal.progress} / {goal.target}</span>
                            <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
                          </div>
                          <Progress value={(goal.progress / goal.target) * 100} />
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedGoal(goal);
                            setIsEditGoalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {goal.status === "active" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-500 hover:text-green-600"
                            onClick={() => toggleGoalStatus(goal.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {goal.status !== "archived" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-gray-500 hover:text-gray-600"
                            onClick={() => toggleGoalStatus(goal.id, "archived")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            // Grid view
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {sortedGoals.map(goal => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow border-border/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{goal.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {goal.category}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary">
                          {goal.priority} priority
                        </span>
                        {goal.dueDate && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            isOverdue(goal.dueDate) ? "bg-red-500/10 text-red-500" :
                            isDueToday(goal.dueDate) ? "bg-orange-500/10 text-orange-500" :
                            "bg-green-500/10 text-green-500"
                          }`}>
                            {daysRemaining(goal.dueDate)}
                          </span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {goal.description}
                      </p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{goal.progress} / {goal.target}</span>
                          <span>{Math.round((goal.progress / goal.target) * 100)}%</span>
                        </div>
                        <Progress value={(goal.progress / goal.target) * 100} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 pt-0">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setIsEditGoalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      {goal.status === "active" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-green-500 hover:text-green-600"
                          onClick={() => toggleGoalStatus(goal.id, "completed")}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      
                      {goal.status !== "archived" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-gray-500 hover:text-gray-600"
                          onClick={() => toggleGoalStatus(goal.id, "archived")}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Archive
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Goal Dialog */}
      <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Goal</DialogTitle>
            <DialogDescription>
              Set a new goal and start tracking your progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Read 50 books this year"
                value={newGoal.name}
                onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="What do you want to achieve?"
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target">Target Value</Label>
                <Input 
                  type="number"
                  id="target" 
                  placeholder="e.g., 50"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="progress">Current Progress</Label>
                <Input 
                  type="number"
                  id="progress" 
                  placeholder="e.g., 10"
                  value={newGoal.progress}
                  onChange={(e) => setNewGoal({...newGoal, progress: parseInt(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newGoal.category}
                  onValueChange={(value) => setNewGoal({...newGoal, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newGoal.priority}
                  onValueChange={(value: GoalPriority) => setNewGoal({ ...newGoal, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input 
                type="date"
                id="dueDate"
                value={newGoal.dueDate}
                onChange={(e) => setNewGoal({...newGoal, dueDate: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Goal Dialog */}
      <Dialog open={isEditGoalOpen} onOpenChange={setIsEditGoalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Modify the details of your goal.
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoal && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Goal Name</Label>
                <Input 
                  id="edit-name" 
                  value={selectedGoal.name}
                  onChange={(e) => setSelectedGoal({...selectedGoal, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={selectedGoal.description}
                  onChange={(e) => setSelectedGoal({...selectedGoal, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-target">Target Value</Label>
                  <Input 
                    type="number"
                    id="edit-target" 
                    value={selectedGoal.target}
                    onChange={(e) => setSelectedGoal({...selectedGoal, target: parseInt(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-progress">Current Progress</Label>
                  <Input 
                    type="number"
                    id="edit-progress" 
                    value={selectedGoal.progress}
                    onChange={(e) => setSelectedGoal({...selectedGoal, progress: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={selectedGoal.category}
                    onValueChange={(value) => setSelectedGoal({...selectedGoal, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select 
                    value={selectedGoal.priority}
                    onValueChange={(value: GoalPriority) => setSelectedGoal({...selectedGoal, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date (Optional)</Label>
                <Input 
                  type="date"
                  id="edit-dueDate"
                  value={selectedGoal.dueDate}
                  onChange={(e) => setSelectedGoal({...selectedGoal, dueDate: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={() => selectedGoal && handleDeleteGoal(selectedGoal.id)}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditGoalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGoal}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;
