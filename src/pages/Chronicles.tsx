import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Edit, 
  Trash, 
  Tag, 
  PinIcon, 
  Scroll, 
  Feather, 
  Search,
  FilterX,
  SortDesc,
  SortAsc,
  Shield,
  Sword,
  ScrollText,
  Grid,
  List,
  Layout,
  Plus,
  Pin,
  Trash2,
  Edit2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const Chronicles = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("#f3f4f6");
  const [isPinned, setIsPinned] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "scrolls">("scrolls");
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: '',
    isPinned: false
  });
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const categories = Array.from(new Set(notes.map(note => note.category)));

  useEffect(() => {
    // Load notes from localStorage
    const savedNotes = localStorage.getItem("notes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      // Demo notes if none exist
      const demoNotes: Note[] = [
        {
          id: "1",
          title: "Battle Strategies",
          content: "1. Protect the flanks\n2. Shield wall formations\n3. Scout ahead for ambushes\n4. Maintain high ground advantage",
          category: "Strategy",
          color: "#374151", // consistent dark color
          isPinned: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "2",
          title: "Winter Provisions",
          content: "- Salted meats\n- Grain stores\n- Firewood\n- Fur cloaks\n- Mead supplies",
          category: "Supplies",
          color: "#374151", // consistent dark color
          isPinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "3",
          title: "Words of Wisdom",
          content: "- The lone wolf dies, but the pack survives\n- Fear cuts deeper than swords\n- Honor guides the true warrior\n- Courage is knowing when to fight",
          category: "Wisdom",
          color: "#374151", // consistent dark color
          isPinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setNotes(demoNotes);
      localStorage.setItem("notes", JSON.stringify(demoNotes));
    }
  }, []);

  const filteredNotes = notes
    .filter(note => 
      (searchTerm === "" || 
       note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       note.content.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeCategory === null || note.category === activeCategory)
    )
    .sort((a, b) => {
      // First by pinned status
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then by date
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
    });

  const addOrUpdateNote = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "A scroll must bear a title",
        variant: "destructive"
      });
      return;
    }

    // Add history record
    const historyAction = isEditing ? "updated" : "created";
    addToHistory("note", historyAction, title);

    if (isEditing && currentNote) {
      const updatedNotes = notes.map(note => 
        note.id === currentNote.id 
          ? { 
              ...note, 
              title, 
              content, 
              category, 
              color, 
              isPinned, 
              updatedAt: new Date().toISOString() 
            }
          : note
      );
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      toast({
        title: "Success",
        description: "Your scroll has been updated"
      });
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title,
        content,
        category,
        color,
        isPinned,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      toast({
        title: "Success",
        description: "A new scroll has been added to your chronicles"
      });
    }
    
    resetForm();
    setOpen(false);
  };

  const deleteNote = (id: string) => {
    const noteToDelete = notes.find(note => note.id === id);
    if (noteToDelete && window.confirm(`Are you sure you want to burn the scroll "${noteToDelete.title}"?`)) {
      // Add to history
      addToHistory("note", "deleted", noteToDelete.title);
      
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      toast({
        title: "Success",
        description: "The scroll has been burned"
      });
    }
  };

  const editNote = (note: Note) => {
    setCurrentNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setColor(note.color);
    setIsPinned(note.isPinned);
    setIsEditing(true);
    setOpen(true);
  };

  const togglePin = (id: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id 
        ? { ...note, isPinned: !note.isPinned }
        : note
    );
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));

    const noteToToggle = notes.find(note => note.id === id);
    if (noteToToggle) {
      toast({
        title: "Success",
        description: `Scroll ${noteToToggle.isPinned ? "removed from" : "added to"} the Archives`
      });
    }
  };

  const resetForm = () => {
    setCurrentNote(null);
    setTitle("");
    setContent("");
    setCategory("");
    setColor("#f3f4f6");
    setIsPinned(false);
    setIsEditing(false);
  };

  const addToHistory = (type: string, action: string, name: string) => {
    const historyItem = {
      id: Date.now().toString(),
      type,
      action,
      name,
      timestamp: new Date().toISOString()
    };
    
    const savedHistory = localStorage.getItem("history");
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    const updatedHistory = [historyItem, ...history];
    localStorage.setItem("history", JSON.stringify(updatedHistory));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveCategory(null);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "desc" ? "asc" : "desc");
  };

  const toggleExpanded = (id: string) => {
    setExpandedNoteId(expandedNoteId === id ? null : id);
  };

  const colorOptions = [
    { name: "Parchment", value: "#f5f0e5" },
    { name: "Steel", value: "#374151" },
    { name: "Shadow", value: "#1a202c" },
    { name: "Slate", value: "#1c4532" },
    { name: "Ember", value: "#9B2C2C" },
    { name: "Midnight", value: "#1a365d" }
  ];

  const categoryBadgeColor = (category: string) => {
    switch(category) {
      case "Strategy": return "bg-red-800 text-white";
      case "Supplies": return "bg-green-800 text-white";
      case "Wisdom": return "bg-blue-800 text-white";
      default: return "bg-gray-700 text-white";
    }
  };

  const handleAddNote = () => {
    if (!newNote.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const note: Note = {
      id: Date.now().toString(),
      ...newNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [...notes, note];
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    setIsDialogOpen(false);
    setNewNote({ title: '', content: '', category: '', isPinned: false });
    toast({
      title: "Success",
      description: "Note added successfully",
    });
  };

  const handleEditNote = () => {
    if (!currentNote) return;

    if (!currentNote.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    const updatedNotes = notes.map(note =>
      note.id === currentNote.id
        ? { ...currentNote, updatedAt: new Date().toISOString() }
        : note
    );

    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Note updated successfully",
    });
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
    toast({
      title: "Success",
      description: "Note deleted successfully",
    });
  };

  const handlePinNote = (id: string) => {
    const updatedNotes = notes.map(note =>
      note.id === id
        ? { ...note, isPinned: !note.isPinned }
        : note
    );
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight">Chronicles</h1>
              <Badge variant="outline" className="hidden md:inline-flex">
                {filteredNotes.length} scrolls
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search chronicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortDirection}
                className="hidden md:inline-flex"
              >
                {sortDirection === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === "grid" ? "scrolls" : "grid")}
                className="hidden md:inline-flex"
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Scroll
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>
                      {currentNote ? 'Edit Scroll' : 'New Scroll'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={currentNote ? currentNote.title : newNote.title}
                        onChange={(e) => {
                          if (currentNote) {
                            setCurrentNote({ ...currentNote, title: e.target.value });
                          } else {
                            setNewNote({ ...newNote, title: e.target.value });
                          }
                        }}
                        placeholder="Enter scroll title..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        value={currentNote ? currentNote.content : newNote.content}
                        onChange={(e) => {
                          if (currentNote) {
                            setCurrentNote({ ...currentNote, content: e.target.value });
                          } else {
                            setNewNote({ ...newNote, content: e.target.value });
                          }
                        }}
                        placeholder="Write your scroll content..."
                        className="min-h-[200px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={currentNote ? currentNote.category : newNote.category}
                        onValueChange={(value) => {
                          if (currentNote) {
                            setCurrentNote({ ...currentNote, category: value });
                          } else {
                            setNewNote({ ...newNote, category: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pinned"
                        checked={currentNote ? currentNote.isPinned : newNote.isPinned}
                        onCheckedChange={(checked) => {
                          if (currentNote) {
                            setCurrentNote({ ...currentNote, isPinned: checked });
                          } else {
                            setNewNote({ ...newNote, isPinned: checked });
                          }
                        }}
                      />
                      <Label htmlFor="pinned">Pin to top</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={currentNote ? handleEditNote : handleAddNote}>
                      {currentNote ? 'Save Changes' : 'Create Scroll'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Categories Tabs */}
        <div className="mb-6">
          <Tabs defaultValue={activeCategory || "all"} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="all" onClick={() => setActiveCategory(null)}>
                All Scrolls
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Notes Grid/List */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={cn(
                    "h-full transition-all hover:shadow-lg",
                    note.isPinned && "border-primary shadow-glow-sm"
                  )}>
                    <CardHeader className="space-y-1">
                      <div className="flex items-start justify-between">
                        <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => togglePin(note.id)}
                          >
                            <PinIcon className={cn(
                              "h-4 w-4",
                              note.isPinned ? "text-primary" : "text-muted-foreground"
                            )} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editNote(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <Badge variant="secondary" className={categoryBadgeColor(note.category)}>
                          {note.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.updatedAt), "MMM d, yyyy")}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {note.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={cn(
                    "transition-all hover:shadow-lg",
                    note.isPinned && "border-primary shadow-glow-sm"
                  )}>
                    <CardHeader className="space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle>{note.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="secondary" className={categoryBadgeColor(note.category)}>
                              {note.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(note.updatedAt), "MMM d, yyyy")}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => togglePin(note.id)}
                          >
                            <PinIcon className={cn(
                              "h-4 w-4",
                              note.isPinned ? "text-primary" : "text-muted-foreground"
                            )} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editNote(note)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Scroll className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No scrolls found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm || activeCategory
                ? "Try adjusting your search or filters"
                : "Create your first scroll to begin your chronicles"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chronicles;
