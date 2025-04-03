import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, CheckCircle2, CalendarIcon, Clock, FilterIcon, ArrowUpDown, AlertTriangle, Flag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { addToHistory } from "@/utils/historyUtils";
import { showReward } from "@/utils/rewardUtils";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { todosAPI, TodoItem } from "@/utils/firestoreUtils";
import { format, isAfter, isBefore, isPast, parse, parseISO, formatDistance } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type SortOption = 'default' | 'dueDateAsc' | 'dueDateDesc' | 'createdAtAsc' | 'createdAtDesc' | 'priorityDesc';
type FilterOption = 'all' | 'active' | 'completed' | 'dueSoon' | 'overdue' | 'highPriority';
type PriorityLevel = 'low' | 'medium' | 'high' | 'none';

interface ExtendedTodoItem extends TodoItem {
  priority?: PriorityLevel;
}

const priorityColors = {
  high: "text-destructive dark:text-red-400",
  medium: "text-yellow-600 dark:text-yellow-400",
  low: "text-blue-600 dark:text-blue-400",
  none: "text-muted-foreground"
};

const priorityBadgeColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  none: "bg-muted/10 text-muted-foreground border-muted/20"
};

const Todos = () => {
  const [todos, setTodos] = useState<ExtendedTodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState<PriorityLevel>("none");
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();

  // Load todos from Firestore if user is logged in, otherwise from localStorage
  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      try {
        if (currentUser) {
          console.log('🔄 Loading todos from Firestore...');
          const firestoreTodos = await todosAPI.getTodos(currentUser.uid);
          setTodos(firestoreTodos);
        } else {
          console.log('🔄 Loading todos from localStorage...');
          try {
            const savedTodos = localStorage.getItem("todos");
            if (savedTodos) {
              const parsed = JSON.parse(savedTodos);
              console.log("Loaded todos:", parsed);
              if (Array.isArray(parsed)) {
                setTodos(parsed);
              } else {
                console.error('❌ Todos is not an array, resetting to empty array');
                setTodos([]);
                localStorage.setItem("todos", JSON.stringify([]));
              }
            } else {
              console.log("No todos found in localStorage");
              setTodos([]);
            }
          } catch (error) {
            console.error("Error loading todos:", error);
            setTodos([]);
            localStorage.setItem("todos", JSON.stringify([]));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [currentUser]);

  // Save to localStorage when using local storage
  useEffect(() => {
    if (!currentUser && todos.length > 0) {
      console.log('💾 Saving todos to localStorage:', todos);
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addNewTodo();
  };

  const addNewTodo = async () => {
    console.log("📝 Adding new task function called");
    if (newTodo.trim()) {
      try {
        console.log("Creating new todo with text:", newTodo);

        const todoData = {
          text: newTodo.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
          status: 'pending' as const,
          userId: currentUser?.uid || 'local',
          dueDate: dueDate ? dueDate.toISOString() : undefined,
          priority: priority
        };

        if (currentUser) {
          // Add to Firestore
          const newId = await todosAPI.addTodo(todoData);
          const newTodo = { ...todoData, id: newId };
          setTodos(prevTodos => [newTodo, ...prevTodos]);
        } else {
          // Add to local storage
          const todo = {
            ...todoData,
            id: crypto.randomUUID(),
          };

          setTodos(prevTodos => [todo, ...prevTodos]);
        }

        // Add to history
        addToHistory(
          "todo" as const,
          "created" as const,
          "New Task",
          todoData.text
        );

        setNewTodo("");
        setDueDate(undefined);
        setPriority("none");

        toast({
          description: "Your new task has been added to the list.",
        });
      } catch (error) {
        console.error("❌ Error adding task:", error);
        toast({
          variant: "destructive",
          description: "Something went wrong. Please try again.",
        });
      }
    } else {
      console.log("⚠️ Empty task text, not adding");
      toast({
        variant: "destructive",
        description: "Please enter a task description.",
      });
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);

      if (!todoToUpdate) return;

      const newCompletedStatus = !todoToUpdate.completed;

      if (currentUser) {
        // Update in Firestore
        await todosAPI.toggleTodoStatus(id, newCompletedStatus);
      }

      // Update in state
      const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
          const newStatus: 'pending' | 'completed' = newCompletedStatus ? 'completed' : 'pending';
          return {
            ...todo,
            completed: newCompletedStatus,
            status: newStatus
          };
        }
        return todo;
      });

      setTodos(updatedTodos);

      // Add to history
      addToHistory(
        "todo" as const,
        newCompletedStatus ? "completed" as const : "uncompleted" as const,
        "Task Update",
        todoToUpdate.text
      );

      // Check if all todos are completed
      const allCompleted = updatedTodos.every(todo => todo.completed);
      if (allCompleted && updatedTodos.length > 0) {
        showReward('tasks');
      }
    } catch (error) {
      console.error("Error toggling todo status:", error);
      toast({
        variant: "destructive",
        description: "Failed to update task status. Please try again.",
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const todoToDelete = todos.find(todo => todo.id === id);
      if (!todoToDelete) return;

      if (currentUser) {
        // Delete from Firestore
        await todosAPI.deleteTodo(id);
      }

      // Delete from state
      const updatedTodos = todos.filter(todo => todo.id !== id);
      setTodos(updatedTodos);

      // Add to history
      addToHistory(
        "todo" as const,
        "deleted" as const,
        "Task Deleted",
        todoToDelete.text
      );

      toast({
        description: "The task has been removed from your list.",
      });
    } catch (error) {
      console.error("Error deleting todo:", error);
      toast({
        variant: "destructive",
        description: "Failed to delete task. Please try again.",
      });
    }
  };

  const handleUpdatePriority = async (id: string, newPriority: PriorityLevel) => {
    try {
      const todoToUpdate = todos.find(todo => todo.id === id);
      if (!todoToUpdate) return;

      if (currentUser) {
        // Update in Firestore
        await todosAPI.updateTodo(id, { priority: newPriority });
      }

      // Update in state
      const updatedTodos = todos.map(todo => {
        if (todo.id === id) {
          return {
            ...todo,
            priority: newPriority
          };
        }
        return todo;
      });

      setTodos(updatedTodos);

      toast({
        description: `Task priority updated to ${newPriority}.`,
      });
    } catch (error) {
      console.error("Error updating todo priority:", error);
      toast({
        variant: "destructive",
        description: "Failed to update task priority. Please try again.",
      });
    }
  };

  // Filter todos based on the filter option and search query
  const filteredTodos = todos.filter(todo => {
    const matchesSearch = searchQuery 
      ? todo.text.toLowerCase().includes(searchQuery.toLowerCase()) 
      : true;

    if (!matchesSearch) return false;

    // Variables for due date calculations
    let dueDate, now, threeDaysFromNow;

    switch (filterOption) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      case 'dueSoon':
        if (!todo.dueDate) return false;
        dueDate = new Date(todo.dueDate);
        now = new Date();
        threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        return !todo.completed && dueDate <= threeDaysFromNow && dueDate >= now;
      case 'overdue':
        if (!todo.dueDate) return false;
        return !todo.completed && new Date(todo.dueDate) < new Date();
      case 'highPriority':
        return todo.priority === 'high' && !todo.completed;
      case 'all':
      default:
        return true;
    }
  });

  // Sort todos based on the sort option
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Declare variables for priority sorting outside case blocks
    let aPriority, bPriority, aPriorityValue, bPriorityValue;
    const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };

    switch(sortOption) {
      case 'priorityDesc':
        // Priority order: high, medium, low, none
        aPriority = a.priority ? priorityOrder[a.priority] : 0;
        bPriority = b.priority ? priorityOrder[b.priority] : 0;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        // If priorities are the same, sort by completion and then creation date
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      
      case 'dueDateAsc':
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return 0;
      
      case 'dueDateDesc':
        if (a.dueDate && b.dueDate) {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return 0;
      
      case 'createdAtAsc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      
      case 'createdAtDesc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      
      case 'default':
      default:
        // First check priority (high priority first)
        aPriorityValue = a.priority === 'high' ? 3 : a.priority === 'medium' ? 2 : a.priority === 'low' ? 1 : 0;
        bPriorityValue = b.priority === 'high' ? 3 : b.priority === 'medium' ? 2 : b.priority === 'low' ? 1 : 0;
        
        if (aPriorityValue !== bPriorityValue) {
          return bPriorityValue - aPriorityValue;
        }
        
        // Then by completion status
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        
        // Then by due date (if available) - prioritize soon due dates
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (a.dueDate) {
          return -1; // a has due date, b doesn't
        } else if (b.dueDate) {
          return 1; // b has due date, a doesn't
        }
        
        // Finally by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  // Function to display relative due date
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    
    try {
      const date = parseISO(dateString);
      const today = new Date();
      const isPastDue = isPast(date) && !isAfter(date, new Date(today.setHours(0, 0, 0, 0)));
      
      return (
        <div className={`text-xs flex items-center gap-1 ${isPastDue ? 'text-destructive' : 'text-muted-foreground'}`}>
          <Clock className="h-3 w-3" />
          <span>{formatDistance(date, new Date(), { addSuffix: true })}</span>
        </div>
      );
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  // Get counts for the filter tabs
  const activeTodosCount = todos.filter(todo => !todo.completed).length;
  const completedTodosCount = todos.filter(todo => todo.completed).length;
  const dueSoonCount = todos.filter(todo => {
    if (!todo.dueDate || todo.completed) return false;
    const dueDate = new Date(todo.dueDate);
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    return dueDate <= threeDaysFromNow && dueDate >= now;
  }).length;
  const overdueCount = todos.filter(todo => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date();
  }).length;
  const highPriorityCount = todos.filter(todo => 
    todo.priority === 'high' && !todo.completed
  ).length;

  // Function to render the sort option text
  const getSortOptionText = (option: SortOption) => {
    switch(option) {
      case 'dueDateAsc': return 'Due Date (Earliest)';
      case 'dueDateDesc': return 'Due Date (Latest)';
      case 'createdAtAsc': return 'Created (Oldest)';
      case 'createdAtDesc': return 'Created (Newest)';
      case 'priorityDesc': return 'Priority (Highest)';
      default: return 'Default';
    }
  };

  // Render priority icon based on priority level
  const renderPriorityIcon = (priority: PriorityLevel = 'none') => {
    if (priority === 'none') return null;
    
    return (
      <Badge variant="outline" className={cn("h-5 ml-1", priorityBadgeColors[priority])}>
        <Flag className="h-3 w-3 mr-1" />
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warrior's Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your quests and missions</p>
        </div>
        <a
          href="/debug.html"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-500 hover:underline"
        >
          Debug Tasks
        </a>
      </div>

      <Card className="shadow-md overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-primary/5 border-b border-border/20 pb-3">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-primary" />
            Your Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  className="flex-1"
                  aria-label="Task description"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className={cn(
                        "w-[40px] p-0",
                        priority !== 'none' && priorityColors[priority]
                      )}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={priority} onValueChange={(value) => setPriority(value as PriorityLevel)}>
                      <DropdownMenuRadioItem value="high" className={priorityColors.high}>
                        <Flag className="h-4 w-4 mr-2" /> High
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="medium" className={priorityColors.medium}>
                        <Flag className="h-4 w-4 mr-2" /> Medium
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="low" className={priorityColors.low}>
                        <Flag className="h-4 w-4 mr-2" /> Low
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="none" className={priorityColors.none}>
                        <Flag className="h-4 w-4 mr-2" /> None
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      type="button"
                      className={cn(
                        "w-[40px] p-0",
                        dueDate && "text-primary"
                      )}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  type="submit"
                  aria-label="Add task"
                >
                  Add Task
                </Button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {priority !== 'none' && (
                  <div>
                    Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    <Button 
                      variant="link" 
                      className="text-xs h-auto p-0 ml-2" 
                      onClick={() => setPriority('none')}
                    >
                      Clear
                    </Button>
                  </div>
                )}
                {dueDate && (
                  <div>
                    Due: {format(dueDate, "PPP")}
                    <Button 
                      variant="link" 
                      className="text-xs h-auto p-0 ml-2" 
                      onClick={() => setDueDate(undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="p-4 border-b space-y-2">
            <div className="flex items-center justify-between">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline-block">Sort: {getSortOptionText(sortOption)}</span>
                    <span className="sm:hidden">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Sort Tasks</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setSortOption('default')}>
                      Default
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('priorityDesc')}>
                      Priority (Highest First)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('dueDateAsc')}>
                      Due Date (Earliest First)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('dueDateDesc')}>
                      Due Date (Latest First)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('createdAtDesc')}>
                      Recently Added
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('createdAtAsc')}>
                      Oldest First
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Tabs 
              defaultValue="all" 
              className="w-full" 
              value={filterOption}
              onValueChange={(value) => setFilterOption(value as FilterOption)}
            >
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="all" className="text-xs">
                  All ({todos.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs">
                  Active ({activeTodosCount})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs">
                  Completed ({completedTodosCount})
                </TabsTrigger>
                <TabsTrigger value="dueSoon" className="text-xs">
                  Due Soon ({dueSoonCount})
                </TabsTrigger>
                <TabsTrigger value="overdue" className="text-xs">
                  Overdue ({overdueCount})
                </TabsTrigger>
                <TabsTrigger value="highPriority" className="text-xs">
                  High Priority ({highPriorityCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="p-4 space-y-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading tasks...
                </div>
              ) : (
                <AnimatePresence>
                  {sortedTodos.length > 0 ? (
                    sortedTodos.map((todo) => (
                      <motion.div
                        key={todo.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
                      >
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleTodo(todo.id)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                        <div className="flex-1 flex flex-col">
                          <div className="flex items-center">
                            <span className={`${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                              {todo.text}
                            </span>
                            {renderPriorityIcon(todo.priority)}
                          </div>
                          {todo.dueDate && formatDueDate(todo.dueDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Flag className={cn("h-4 w-4", todo.priority !== 'none' ? priorityColors[todo.priority!] : "text-muted-foreground")} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuRadioGroup 
                                value={todo.priority || 'none'} 
                                onValueChange={(value) => handleUpdatePriority(todo.id, value as PriorityLevel)}
                              >
                                <DropdownMenuRadioItem value="high" className={priorityColors.high}>
                                  <Flag className="h-4 w-4 mr-2" /> High
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="medium" className={priorityColors.medium}>
                                  <Flag className="h-4 w-4 mr-2" /> Medium
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="low" className={priorityColors.low}>
                                  <Flag className="h-4 w-4 mr-2" /> Low
                                </DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="none" className={priorityColors.none}>
                                  <Flag className="h-4 w-4 mr-2" /> None
                                </DropdownMenuRadioItem>
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteTodo(todo.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      {searchQuery ? "No tasks match your search." : "No tasks yet. Add one to get started!"}
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Todos; 