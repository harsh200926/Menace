import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format, isToday, parseISO, startOfDay, isWithinInterval, subDays } from "date-fns";
import { 
  Plus, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash, 
  BarChart, 
  Calendar as CalendarIcon,
  Flame,
  Clock
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { addToHistory } from "@/utils/historyUtils";

interface Habit {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  category: string;
  created: string;
  streak: number;
  completedDates: string[];
}

const HabitsPage = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const savedHabits = localStorage.getItem("habits");
    return savedHabits ? JSON.parse(savedHabits) : [];
  });
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const [newHabit, setNewHabit] = useState<Omit<Habit, "id" | "streak" | "completedDates">>({
    name: "",
    description: "",
    frequency: "daily",
    category: "health",
    created: new Date().toISOString()
  });
  
  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);
  
  const handleAddHabit = () => {
    if (!newHabit.name.trim()) {
      toast("Please enter a name for the habit");
      return;
    }
    
    const habit: Habit = {
      id: Date.now().toString(),
      ...newHabit,
      streak: 0,
      completedDates: []
    };
    
    setHabits([...habits, habit]);
    setIsAddDialogOpen(false);
    setNewHabit({
      name: "",
      description: "",
      frequency: "daily",
      category: "health",
      created: new Date().toISOString()
    });
    
    toast("Habit added successfully");
    addToHistory("habit", "created", habit.name);
  };
  
  const handleUpdateHabit = () => {
    if (!selectedHabit) return;
    
    const updatedHabits = habits.map(habit => 
      habit.id === selectedHabit.id ? selectedHabit : habit
    );
    
    setHabits(updatedHabits);
    setIsEditDialogOpen(false);
    
    toast("Habit updated successfully");
    addToHistory("habit", "updated", selectedHabit.name);
  };
  
  const handleDeleteHabit = (id: string) => {
    const habitToDelete = habits.find(h => h.id === id);
    if (!habitToDelete) return;
    
    const updatedHabits = habits.filter(habit => habit.id !== id);
    setHabits(updatedHabits);
    setIsEditDialogOpen(false);
    
    toast("Habit deleted successfully");
    addToHistory("habit", "deleted", habitToDelete.name);
  };
  
  const toggleHabitCompletion = (habitId: string, date = new Date().toISOString().split('T')[0]) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(date);
        
        if (isCompleted) {
          // Remove the date
          const newCompletedDates = habit.completedDates.filter(d => d !== date);
          const newStreak = isToday(parseISO(date)) ? Math.max(0, habit.streak - 1) : habit.streak;
          
          addToHistory("habit", "uncompleted", habit.name);
          
          return {
            ...habit,
            completedDates: newCompletedDates,
            streak: newStreak
          };
        } else {
          // Add the date
          const newCompletedDates = [...habit.completedDates, date];
          const newStreak = isToday(parseISO(date)) ? habit.streak + 1 : habit.streak;
          
          addToHistory("habit", "completed", habit.name);
          
          return {
            ...habit,
            completedDates: newCompletedDates,
            streak: newStreak
          };
        }
      }
      return habit;
    }));
    
    toast("Habit completion updated");
  };
  
  // Filter habits based on active tab and categories
  const getFilteredHabits = () => {
    let filtered = [...habits];
    
    // Filter by tab
    if (activeTab === "daily") {
      filtered = filtered.filter(h => h.frequency === "daily");
    } else if (activeTab === "weekly") {
      filtered = filtered.filter(h => h.frequency === "weekly");
    } else if (activeTab === "monthly") {
      filtered = filtered.filter(h => h.frequency === "monthly");
    }
    
    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(h => selectedCategories.includes(h.category));
    }
    
    return filtered;
  };
  
  // Get unique categories from all habits
  const getUniqueCategories = () => {
    const categories = habits.map(h => h.category);
    return [...new Set(categories)];
  };
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  
  // Get completion status for a habit on a specific date
  const isHabitCompletedOnDate = (habit: Habit, date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return habit.completedDates.includes(dateString);
  };
  
  // Calculate completion rate for the selected date
  const calculateCompletionRate = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    const applicableHabits = habits.filter(h => {
      if (h.frequency === "daily") return true;
      if (h.frequency === "weekly") {
        // Check if date falls on the same day of week as creation date
        const creationDate = new Date(h.created);
        return date.getDay() === creationDate.getDay();
      }
      if (h.frequency === "monthly") {
        // Check if date falls on the same day of month as creation date
        const creationDate = new Date(h.created);
        return date.getDate() === creationDate.getDate();
      }
      return false;
    });
    
    if (applicableHabits.length === 0) return 0;
    
    const completed = applicableHabits.filter(h => h.completedDates.includes(dateString));
    return (completed.length / applicableHabits.length) * 100;
  };
  
  // Calculate streak data
  const calculateStreakData = () => {
    return habits.map(habit => ({
      name: habit.name,
      streak: habit.streak,
      category: habit.category
    }));
  };
  
  // Calculate recent completion rates (last 7 days)
  const calculateRecentCompletionRates = () => {
    const days = 7;
    const result = [];
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i);
      const rate = calculateCompletionRate(date);
      
      result.push({
        date: format(date, "yyyy-MM-dd"),
        displayDate: format(date, "EEE"),
        rate
      });
    }
    
    return result.reverse();
  };
  
  const recentCompletionRates = calculateRecentCompletionRates();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rituals</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Habit
        </Button>
      </div>
      
      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion Rate Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              {calculateCompletionRate(new Date()).toFixed(0)}%
              {calculateCompletionRate(new Date()) >= 100 ? (
                <Flame className="ml-2 h-6 w-6 text-orange-500" />
              ) : (
                <Clock className="ml-2 h-6 w-6 text-primary" />
              )}
            </div>
            <Progress 
              value={calculateCompletionRate(new Date())} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
        
        {/* Streak Leaders Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Streak Leaders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6">
              {calculateStreakData()
                .sort((a, b) => b.streak - a.streak)
                .slice(0, 3)
                .map((item, index) => (
                  <div key={index} className="py-2 border-b last:border-b-0 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <div className="flex items-center bg-primary/10 px-2 py-1 rounded-full">
                      <Flame className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm font-medium">{item.streak}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Performance Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-6 pt-2 pb-4 flex justify-between items-end h-[100px]">
              {recentCompletionRates.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-6 bg-primary/20 rounded-t-sm transition-all duration-300"
                    style={{ height: `${Math.max(4, day.rate)}%` }}
                  />
                  <p className="text-xs mt-1">{day.displayDate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Habit Management Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Habits</CardTitle>
              <CardDescription>Track and manage your habits</CardDescription>
              
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              
                {/* Category Filters */}
                {getUniqueCategories().length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {getUniqueCategories().map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategories.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategories([])}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              </Tabs>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4 scrollbar-hide">
                {getFilteredHabits().length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No habits found. Add a new habit to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getFilteredHabits().map(habit => {
                      const dateString = format(selectedDate, "yyyy-MM-dd");
                      const isCompleted = habit.completedDates.includes(dateString);
                      
                      return (
                        <div key={habit.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{habit.name}</h3>
                              <p className="text-sm text-muted-foreground">{habit.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {habit.category}
                                </span>
                                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                                  {habit.frequency}
                                </span>
                                <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full flex items-center">
                                  <Flame className="h-3 w-3 mr-1" />
                                  Streak: {habit.streak}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <Button
                                variant={isCompleted ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleHabitCompletion(habit.id, dateString)}
                              >
                                {isCompleted ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Done
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Mark Done
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedHabit(habit);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Calendar View
              </CardTitle>
              <CardDescription>
                Select a date to view and track habits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border pointer-events-auto"
              />
              
              <div className="mt-4">
                <h3 className="font-medium">
                  {format(selectedDate, "MMMM d, yyyy")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Completion rate: {calculateCompletionRate(selectedDate).toFixed(0)}%
                </p>
                
                <div className="mt-4 space-y-2">
                  {habits.map(habit => {
                    const isCompleted = isHabitCompletedOnDate(habit, selectedDate);
                    
                    return (
                      <div 
                        key={habit.id}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <span className="text-sm">{habit.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHabitCompletion(habit.id, format(selectedDate, "yyyy-MM-dd"))}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Habit Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input 
                id="name" 
                placeholder="e.g., Morning Meditation"
                value={newHabit.name}
                onChange={(e) => setNewHabit({...newHabit, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="What does this habit involve?"
                value={newHabit.description}
                onChange={(e) => setNewHabit({...newHabit, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select 
                  value={newHabit.frequency}
                  onValueChange={(value: "daily" | "weekly" | "monthly") => 
                    setNewHabit({...newHabit, frequency: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newHabit.category}
                  onValueChange={(value) => setNewHabit({...newHabit, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddHabit}>Add Habit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Habit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          
          {selectedHabit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Habit Name</Label>
                <Input 
                  id="edit-name" 
                  value={selectedHabit.name}
                  onChange={(e) => setSelectedHabit({...selectedHabit, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea 
                  id="edit-description" 
                  value={selectedHabit.description}
                  onChange={(e) => setSelectedHabit({...selectedHabit, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-frequency">Frequency</Label>
                  <Select 
                    value={selectedHabit.frequency}
                    onValueChange={(value: "daily" | "weekly" | "monthly") => 
                      setSelectedHabit({...selectedHabit, frequency: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={selectedHabit.category}
                    onValueChange={(value) => setSelectedHabit({...selectedHabit, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Flame className="h-4 w-4 mr-1 text-orange-500" />
                  Current streak: {selectedHabit.streak} days
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={() => selectedHabit && handleDeleteHabit(selectedHabit.id)}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateHabit}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HabitsPage;
