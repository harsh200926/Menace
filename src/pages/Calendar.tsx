import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { format, isToday, parseISO, isSameDay, isSameMonth, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, Flag, Plus, Search, Tag, XCircle, List, BarChart3, Calendar as CalendarViewIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { addToHistory } from "@/utils/historyUtils";
import { Container } from "@/components/Container";
import { useAuth } from "@/context/AuthContext";

// Define event priority colors
const priorityColors = {
  low: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  medium: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  high: "bg-red-100 text-red-800 hover:bg-red-200"
};

// Define priority display names
const priorityNames = {
  low: "Low",
  medium: "Medium",
  high: "High"
};

// Define color palette for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  priority: "low" | "medium" | "high";
  tags?: string[];
  completed: boolean;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const { currentUser } = useAuth();

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const savedEvents = localStorage.getItem("calendarEvents");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false);
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, "id" | "completed">>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    priority: "medium",
    tags: []
  });
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("calendar");
  
  // Save events to localStorage
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);
  
  // Get unique tags from all events
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    events.forEach(event => {
      if (event.tags) {
        event.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  };
  
  // Handle form input changes for new event
  const handleNewEventChange = (field: keyof Omit<CalendarEvent, "id" | "completed">, value: string) => {
    setNewEvent(prev => ({ ...prev, [field]: value }));
  };
  
  // Add a tag to new event
  const addTagToEvent = () => {
    if (!newTag.trim()) return;
    
    const currentTags = newEvent.tags || [];
    if (!currentTags.includes(newTag.trim())) {
      setNewEvent(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
    }
    setNewTag("");
  };
  
  // Remove a tag from new event
  const removeTagFromEvent = (tagToRemove: string) => {
    const currentTags = newEvent.tags || [];
    setNewEvent(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Add or edit an event
  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast("Please enter a title for the event");
      return;
    }
    
    const eventToAdd: CalendarEvent = {
      id: selectedEvent ? selectedEvent.id : Date.now().toString(),
      ...newEvent,
      completed: selectedEvent ? selectedEvent.completed : false
    };
    
    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === selectedEvent.id ? eventToAdd : event
      ));
      setIsEditEventDialogOpen(false);
      
      toast("Event updated successfully");
      addToHistory("event", "updated", eventToAdd.title);
    } else {
      // Add new event
      setEvents([...events, eventToAdd]);
      setIsAddEventDialogOpen(false);
      
      toast("Event added successfully");
      addToHistory("event", "created", eventToAdd.title);
    }
    
    // Reset form
    setNewEvent({
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "",
      priority: "medium",
      tags: []
    });
    setSelectedEvent(null);
  };
  
  // Delete an event
  const handleDeleteEvent = (id: string) => {
    const eventToDelete = events.find(e => e.id === id);
    if (!eventToDelete) return;
    
    setEvents(events.filter(event => event.id !== id));
    setIsEditEventDialogOpen(false);
    setSelectedEvent(null);
    
    toast("Event deleted successfully");
    addToHistory("event", "deleted", eventToDelete.title);
  };
  
  // Toggle event completion status
  const toggleEventCompletion = (id: string) => {
    setEvents(events.map(event => {
      if (event.id === id) {
        const newStatus = !event.completed;
        
        // Add to history
        addToHistory("event", newStatus ? "completed" : "uncompleted", event.title);
        
        return { ...event, completed: newStatus };
      }
      return event;
    }));
    
    toast("Event status updated");
  };
  
  // Handle navigation to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Handle navigation to next month
  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Filter events based on search term and filters
  const getFilteredEvents = () => {
    return events.filter(event => {
      // Filter by search term
      const matchesSearch = searchTerm === "" || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by priority
      const matchesPriority = priorityFilter === "" || event.priority === priorityFilter;
      
      // Filter by tag
      const matchesTag = tagFilter === "" || 
        (event.tags && event.tags.includes(tagFilter));
      
      return matchesSearch && matchesPriority && matchesTag;
    });
  };
  
  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(parseISO(event.date), date));
  };
  
  // Get events for the selected month
  const getEventsForMonth = (date: Date) => {
    return events.filter(event => isSameMonth(parseISO(event.date), date));
  };
  
  // Get total events count by priority
  const getEventsByPriority = () => {
    const result = { low: 0, medium: 0, high: 0 };
    events.forEach(event => {
      result[event.priority]++;
    });
    return Object.entries(result).map(([name, value]) => ({ name: priorityNames[name as keyof typeof priorityNames], value }));
  };
  
  // Get events by completion status
  const getEventsByCompletion = () => {
    const completed = events.filter(event => event.completed).length;
    const pending = events.filter(event => !event.completed).length;
    
    return [
      { name: "Completed", value: completed },
      { name: "Pending", value: pending }
    ];
  };
  
  // Get events by tags
  const getEventsByTags = () => {
    const tagCounts: Record<string, number> = {};
    events.forEach(event => {
      if (event.tags) {
        event.tags.forEach(tag => {
          if (!tagCounts[tag]) {
            tagCounts[tag] = 0;
          }
          tagCounts[tag]++;
        });
      }
    });
    
    return Object.entries(tagCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 tags
  };
  
  // Get events distribution by day of week
  const getEventsByDayOfWeek = () => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    
    events.forEach(event => {
      const date = parseISO(event.date);
      const dayOfWeek = date.getDay();
      dayCounts[dayOfWeek]++;
    });
    
    return dayNames.map((name, index) => ({
      name,
      value: dayCounts[index]
    }));
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const selectedDateEvents = events.filter(event => 
    isSameDay(new Date(event.date), selectedDate)
  );
  
  // Enhanced statistics calculations
  const getMonthlyTrends = () => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(currentDate, i);
      const count = events.filter(event => isSameMonth(parseISO(event.date), date)).length;
      return {
        name: format(date, "MMM"),
        value: count
      };
    }).reverse();
    return last6Months;
  };

  const getUpcomingDeadlines = () => {
    const today = new Date();
    return events
      .filter(event => !event.completed && new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const getCompletionRate = () => {
    if (events.length === 0) return 0;
    const completed = events.filter(event => event.completed).length;
    return (completed / events.length) * 100;
  };

  // Enhanced statistics view
  const renderStatisticsView = () => {
    const eventsByPriority = getEventsByPriority();
    const eventsByCompletion = getEventsByCompletion();
    const monthlyTrends = getMonthlyTrends();
    const upcomingDeadlines = getUpcomingDeadlines();
    const completionRate = getCompletionRate();

    return (
      <div className="grid grid-cols-12 gap-8">
        {/* Monthly Trends */}
        <div className="col-span-12">
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Event Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {monthlyTrends.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Priority and Completion Status */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="shadow-lg h-full">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={eventsByPriority}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventsByPriority.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Completion Stats */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="shadow-lg h-full">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Completion Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{completionRate.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Overall Completion Rate</div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventsByCompletion}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {eventsByCompletion.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines */}
        <div className="col-span-12">
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDeadlines.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                          <span className="text-xs text-primary font-medium">
                            {format(parseISO(event.date), "MMM")}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {format(parseISO(event.date), "d")}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.time || "All day"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        event.priority === 'high' ? 'destructive' :
                        event.priority === 'medium' ? 'default' :
                        'secondary'
                      }>
                        {event.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <Container variant="glass" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* User Profile & Title - Takes 8 columns */}
        <div className="col-span-12 md:col-span-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <span className="text-2xl font-bold text-primary">
                {currentUser?.displayName?.[0] || 'M'}
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                Moon Cycle
              </h1>
              <p className="text-lg text-muted-foreground">
                Organize your time, conquer your goals
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Takes 4 columns */}
        <div className="col-span-12 md:col-span-4 flex items-center justify-end">
          <Button 
            size="lg"
            onClick={() => setIsAddEventDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-lg shadow-primary/20"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Event
          </Button>
        </div>
      </div>
      
      {/* Main Content - Calendar and Stats side by side */}
      <div className="grid grid-cols-12 gap-8">
        {/* Calendar Section */}
        <div className="col-span-12 lg:col-span-8">
          {/* Calendar Grid */}
          <Card className="shadow-lg mb-8">
            <CardHeader className="border-b bg-muted/30 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">
                  {format(currentDate, "MMMM yyyy")}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousMonth}
                    className="h-9 w-9 rounded-full hover:bg-primary/10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 rounded-full h-9"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextMonth}
                    className="h-9 w-9 rounded-full hover:bg-primary/10"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-px bg-border/10 rounded-lg overflow-hidden">
                {/* Weekday headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className="p-4 text-center text-sm font-medium bg-muted/30"
                  >
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isWeekend = [0, 6].includes(day.getDay());
                  const hasEvents = events.some(event => 
                    isSameDay(new Date(event.date), day)
                  );
                  const dayEvents = events.filter(event => 
                    isSameDay(new Date(event.date), day)
                  );

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[100px] p-3 text-left transition-all
                        ${isWeekend ? 'bg-muted/30' : 'bg-background'}
                        ${!isCurrentMonth && 'text-muted-foreground/50'}
                        ${isSelected ? 'ring-2 ring-primary ring-inset' : 'hover:bg-muted/40'}
                        ${isToday(day) && 'font-bold text-primary'}
                      `}
                    >
                      <span className="block text-sm mb-2">
                        {format(day, "d")}
                      </span>
                      {hasEvents && (
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`
                                text-xs px-1.5 py-0.5 rounded truncate
                                ${event.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                                  event.priority === 'medium' ? 'bg-primary/20 text-primary' :
                                  'bg-muted text-muted-foreground'}
                              `}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs font-normal w-full justify-center"
                            >
                              +{dayEvents.length - 2} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary" />
                {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {selectedDateEvents.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {selectedDateEvents.map((event) => (
                      <Card key={event.id} className="border border-border/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{event.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {event.time || "All day"}
                                </p>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                            </div>
                            <Badge 
                              variant={
                                event.priority === 'high' ? 'destructive' :
                                event.priority === 'medium' ? 'default' :
                                'secondary'
                              }
                              className="shrink-0"
                            >
                              {event.priority}
                            </Badge>
                          </div>
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {event.tags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No events scheduled</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Start planning your day by adding an event
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddEventDialogOpen(true)}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Statistics Section */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          {/* Quick Stats Card */}
          <Card className="shadow-lg bg-gradient-to-br from-muted/50 via-background to-background border-border/50">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-semibold">{events.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-semibold">
                    {events.filter(event => isSameMonth(new Date(event.date), currentDate)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                Priority Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getEventsByPriority()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getEventsByPriority().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {getUpcomingDeadlines().length > 0 ? (
                <div className="space-y-4">
                  {getUpcomingDeadlines().map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                          <span className="text-xs text-primary font-medium">
                            {format(parseISO(event.date), "MMM")}
                          </span>
                          <span className="text-lg font-bold text-primary">
                            {format(parseISO(event.date), "d")}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {event.time || "All day"}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        event.priority === 'high' ? 'destructive' :
                        event.priority === 'medium' ? 'default' :
                        'secondary'
                      }>
                        {event.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => handleNewEventChange("title", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Event details"
                value={newEvent.description}
                onChange={(e) => handleNewEventChange("description", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => handleNewEventChange("date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time (Optional)</Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => handleNewEventChange("time", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={newEvent.priority}
                onValueChange={(value: "low" | "medium" | "high") => handleNewEventChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTagToEvent();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTagToEvent}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {newEvent.tags && newEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newEvent.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <XCircle
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTagFromEvent(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEvent}>
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Event Dialog */}
      <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Event Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => handleNewEventChange("title", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                placeholder="Event details"
                value={newEvent.description}
                onChange={(e) => handleNewEventChange("description", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => handleNewEventChange("date", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-time">Time (Optional)</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => handleNewEventChange("time", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={newEvent.priority}
                onValueChange={(value: "low" | "medium" | "high") => handleNewEventChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="edit-tags"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTagToEvent();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTagToEvent}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
              
              {newEvent.tags && newEvent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newEvent.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <XCircle
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTagFromEvent(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="destructive" onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}>
              Delete Event
            </Button>
            <Button onClick={handleAddEvent}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Calendar;
