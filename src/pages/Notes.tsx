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
  ScrollText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

const Notes = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Scroll className="h-8 w-8 text-primary" />
            Chronicles & Scrolls
          </h1>
          <p className="text-muted-foreground">Record your strategies, wisdom, and memories</p>
        </div>
        <Button onClick={() => { resetForm(); setOpen(true); }} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
          <Feather className="h-4 w-4" />
          Scribe New Scroll
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search your scrolls..."
            className="pl-10 bg-background/80 backdrop-blur-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Tag className="h-4 w-4 mr-2" />
                {activeCategory || "All Categories"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveCategory(null)}>
                All Categories
              </DropdownMenuItem>
              {categories.map(cat => (
                <DropdownMenuItem 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className="flex items-center gap-2"
                >
                  <Badge variant="outline" className={cn("h-5 px-2 rounded-sm", categoryBadgeColor(cat))}>
                    {cat}
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9" 
            onClick={toggleSortDirection}
            title={`Sort by ${sortDirection === "desc" ? "oldest" : "newest"} first`}
          >
            {sortDirection === "desc" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-9 w-9" 
            onClick={() => setViewMode(viewMode === "grid" ? "scrolls" : "grid")}
            title={`View as ${viewMode === "grid" ? "scrolls" : "grid"}`}
          >
            {viewMode === "grid" ? <ScrollText className="h-4 w-4" /> : <Sword className="h-4 w-4" />}
          </Button>

          {(searchTerm || activeCategory) && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 flex items-center gap-1" 
              onClick={clearFilters}
            >
              <FilterX className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* No notes state */}
      {notes.length === 0 ? (
        <Card className="border-2 border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Scroll className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Your archives are empty</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Begin recording your thoughts, strategies, and wisdom for your journey
            </p>
            <Button onClick={() => { resetForm(); setOpen(true); }} className="flex items-center gap-2">
              <Feather className="h-4 w-4" />
              Scribe First Scroll
            </Button>
          </CardContent>
        </Card>
      ) : filteredNotes.length === 0 ? (
        <Card className="border-2 border-primary/30 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No scrolls found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters
            </p>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={clearFilters}
            >
              <FilterX className="h-4 w-4" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <AnimatePresence>
            <div className={viewMode === "scrolls" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className={viewMode === "scrolls" ? "w-full" : ""}
                >
                  {viewMode === "scrolls" ? (
                    <ScrollNote 
                      note={note}
                      expanded={expandedNoteId === note.id}
                      toggleExpanded={() => toggleExpanded(note.id)}
                      onEdit={() => editNote(note)}
                      onDelete={() => deleteNote(note.id)}
                      onTogglePin={() => togglePin(note.id)}
                      categoryBadgeColor={categoryBadgeColor}
                    />
                  ) : (
                    <Card 
                      className={cn(
                        "card-hover transition-all duration-300 h-full flex flex-col border-2 overflow-hidden",
                        note.isPinned ? "border-primary/40" : "border-border",
                        "hover:shadow-md"
                      )}
                      style={{ backgroundColor: note.color }}
                    >
                      <CardHeader className="flex flex-row justify-between items-start pb-2 relative">
                        <div>
                          <CardTitle className="line-clamp-1 mr-6 text-lg">
                            {note.title}
                          </CardTitle>
                          {note.category && (
                            <Badge variant="outline" className={categoryBadgeColor(note.category)}>
                              {note.category}
                            </Badge>
                          )}
                        </div>
                        {note.isPinned && (
                          <div className="absolute top-3 right-3">
                            <Shield className="h-4 w-4 text-primary/70" />
                          </div>
                        )}
                      </CardHeader>
                      
                      <CardContent className="flex-grow px-4 py-2">
                        <ScrollArea className="h-[100px]">
                          <div className="whitespace-pre-line text-sm text-card-foreground/90">
                            {note.content}
                          </div>
                        </ScrollArea>
                      </CardContent>
                      
                      <CardFooter className="flex justify-between pt-4 pb-3 px-4 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.updatedAt), "MMMM d, yyyy")}
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => togglePin(note.id)}
                          >
                            <PinIcon className={cn("h-4 w-4 mr-1.5", note.isPinned ? "text-primary fill-primary" : "")} />
                            <span className="sr-only">{note.isPinned ? "Unpin" : "Pin"}</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEdit();
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1.5" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8" 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete();
                            }}
                          >
                            <Trash className="h-4 w-4 mr-1.5" />
                            Delete
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </>
      )}

      {/* Note creation/editing dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Feather className="h-5 w-5 text-primary" />
              {isEditing ? "Edit Scroll" : "Scribe New Scroll"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your scroll"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your wisdom, strategies, or memories..."
                className="min-h-[200px] resize-none font-serif"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Strategy, Wisdom"
                />
              </div>
              
              <div className="grid gap-2">
                <label htmlFor="color" className="text-sm font-medium">
                  Scroll Appearance
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setColor(option.value)}
                      className={cn(
                        "h-8 rounded-md border border-border flex items-center justify-center text-xs",
                        color === option.value && "ring-2 ring-primary"
                      )}
                      style={{ backgroundColor: option.value }}
                      title={option.name}
                    >
                      {color === option.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-pinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-primary text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="is-pinned" className="text-sm font-medium">
                Add to Archives (pin to top)
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addOrUpdateNote} className="bg-primary hover:bg-primary/90">
              {isEditing ? "Update Scroll" : "Create Scroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Scroll-styled Note Component
interface ScrollNoteProps {
  note: Note;
  expanded: boolean;
  toggleExpanded: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  categoryBadgeColor: (category: string) => string;
}

const ScrollNote = ({ 
  note, 
  expanded, 
  toggleExpanded,
  onEdit,
  onDelete,
  onTogglePin,
  categoryBadgeColor
}: ScrollNoteProps) => {
  return (
    <motion.div
      layout
      className={cn(
        "border-2 rounded-lg overflow-hidden transition-colors",
        note.isPinned ? "border-primary/40" : "border-border/70",
        "scroll-note bg-gradient-to-r"
      )}
      style={{ backgroundColor: note.color }}
    >
      <div 
        className={cn(
          "px-5 py-4 relative cursor-pointer",
          "hover:bg-black/5 transition-colors"
        )}
        onClick={toggleExpanded}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Scroll className="h-5 w-5 text-primary/70 shrink-0" />
            <h3 className="font-medium text-lg">{note.title}</h3>
          </div>
          
          <div className="flex items-center space-x-1.5">
            {note.isPinned && <Shield className="h-4 w-4 text-primary/70" />}
            {note.category && (
              <Badge variant="outline" className={categoryBadgeColor(note.category)}>
                {note.category}
              </Badge>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="whitespace-pre-line font-serif border-l-2 border-primary/30 pl-4 py-1 my-2">
                {note.content}
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/30">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.updatedAt), "MMMM d, yyyy")}
                </span>
                
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin();
                    }}
                  >
                    <PinIcon className={cn("h-4 w-4 mr-1.5", note.isPinned ? "text-primary fill-primary" : "")} />
                    {note.isPinned ? "Unpin" : "Pin"}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash className="h-4 w-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Notes;
