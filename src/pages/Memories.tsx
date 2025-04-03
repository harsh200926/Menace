import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PlusIcon, 
  Quote, 
  Star, 
  Pin, 
  PinOff, 
  Music, 
  Image, 
  Link, 
  Book, 
  BookOpen, 
  Trash, 
  Edit,
  FileText,
  File,
  Upload,
  BookIcon,
  Play,
  Pause
} from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { MemoryItem, MemoryType } from "@/types/memory";
import MemoryItemCard from "@/components/MemoryBoard/MemoryItemCard";
import { addToHistory } from "@/utils/historyUtils";

const MemoriesPage = () => {
  const { toast: uiToast } = useToast();
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newMemory, setNewMemory] = useState<Omit<MemoryItem, "id" | "date" | "pinned">>({
    type: "text",
    content: "",
    color: "default" // Set a default non-empty value
  });
  
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [quotes, setQuotes] = useState<Array<{text: string, author: string}>>([]);
  const [newQuote, setNewQuote] = useState({text: "", author: ""});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // Load memories and quotes from local storage
  useEffect(() => {
    const savedMemories = localStorage.getItem("memories");
    if (savedMemories) {
      setMemories(JSON.parse(savedMemories));
    }
    
    const savedQuotes = localStorage.getItem("motivationalQuotes");
    if (savedQuotes) {
      setQuotes(JSON.parse(savedQuotes));
    } else {
      // Default quotes
      const defaultQuotes = [
        { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
        { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      ];
      setQuotes(defaultQuotes);
      localStorage.setItem("motivationalQuotes", JSON.stringify(defaultQuotes));
    }
  }, []);
  
  // Save memories to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("memories", JSON.stringify(memories));
  }, [memories]);
  
  // Save quotes to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("motivationalQuotes", JSON.stringify(quotes));
  }, [quotes]);
  
  const handleAddMemory = () => {
    if (!newMemory.content) {
      toast("Please enter content for your memory");
      return;
    }
    
    const memory: MemoryItem = {
      id: Date.now().toString(),
      ...newMemory,
      date: new Date().toLocaleDateString(),
      pinned: false
    };
    
    setMemories([memory, ...memories]);
    setIsAddDialogOpen(false);
    setNewMemory({
      type: "text",
      content: "",
      color: "default" // Reset with default non-empty value
    });
    
    addToHistory("memory", "created", memory.title || "New memory");
    toast("Memory added successfully");
  };
  
  const handleUpdateMemory = () => {
    if (!editingMemory) return;
    
    setMemories(memories.map(memory => 
      memory.id === editingMemory.id ? editingMemory : memory
    ));
    
    setIsEditDialogOpen(false);
    setEditingMemory(null);
    
    addToHistory("memory", "updated", editingMemory.title || "Memory");
    toast("Memory updated successfully");
  };
  
  const handleDeleteMemory = (id: string) => {
    const memoryToDelete = memories.find(memory => memory.id === id);
    if (!memoryToDelete) return;
    
    setMemories(memories.filter(memory => memory.id !== id));
    
    addToHistory("memory", "deleted", memoryToDelete.title || "Memory");
    toast("Memory deleted successfully");
  };
  
  const handlePinMemory = (id: string) => {
    setMemories(memories.map(memory => {
      if (memory.id === id) {
        const updatedMemory = { ...memory, pinned: !memory.pinned };
        addToHistory(
          "memory", 
          updatedMemory.pinned ? "pinned" : "unpinned", 
          memory.title || "Memory"
        );
        return updatedMemory;
      }
      return memory;
    }));
    
    toast(memories.find(m => m.id === id)?.pinned 
      ? "Memory unpinned" 
      : "Memory pinned successfully");
  };
  
  const handleAddQuote = () => {
    if (!newQuote.text || !newQuote.author) {
      toast("Please enter both the quote text and author");
      return;
    }
    
    setQuotes([...quotes, newQuote]);
    setNewQuote({text: "", author: ""});
    setIsQuoteDialogOpen(false);
    
    addToHistory("quote", "added", `Quote by ${newQuote.author}`);
    toast("Quote added successfully");
  };
  
  const handleDeleteQuote = (index: number) => {
    const updatedQuotes = [...quotes];
    updatedQuotes.splice(index, 1);
    setQuotes(updatedQuotes);
    
    addToHistory("quote", "deleted", "Motivational quote");
    toast("Quote deleted successfully");
  };
  
  // Filtered memories based on active tab and search query
  const getFilteredMemories = () => {
    return memories.filter(memory => {
      // Filter by type (active tab)
      const matchesTab = activeTab === "all" || 
        (activeTab === "files" && (memory.type === "pdf" || memory.type === "txt")) ||
        memory.type === activeTab;
      
      // Filter by search query
      const matchesSearch = searchQuery === "" || 
        (memory.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          memory.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) || "");
      
      return matchesTab && matchesSearch;
    });
  };
  
  // Get random quote of the day
  const getQuoteOfTheDay = () => {
    if (quotes.length === 0) return { text: "Add your first quote!", author: "GoalWhisper" };
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };
  
  // Add file handling functions
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast("File too large! Please upload files smaller than 5MB.");
      return;
    }
    
    try {
      // Read the file
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        
        // Update the memory with file data
        if (file.type.includes('pdf')) {
          setNewMemory({
            ...newMemory,
            type: 'pdf',
            fileName: file.name,
            fileSize: file.size,
            fileData
          });
        } else if (file.type.includes('text/plain') || file.name.endsWith('.txt')) {
          setNewMemory({
            ...newMemory,
            type: 'txt',
            fileName: file.name,
            fileSize: file.size,
            fileData
          });
        } else if (file.type.includes('audio')) {
          setNewMemory({
            ...newMemory,
            type: 'music',
            fileName: file.name,
            fileSize: file.size,
            fileData
          });
        } else if (file.type.includes('image')) {
          setNewMemory({
            ...newMemory,
            type: 'image',
            fileName: file.name,
            fileSize: file.size,
            fileData,
            imageUrl: fileData
          });
        } else {
          toast("Unsupported file type. Please upload PDF, TXT, MP3, or image files.");
        }
      };
      
      if (file.type.includes('image') || file.type.includes('audio') || file.type.includes('pdf')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast("Failed to read file. Please try again.");
    }
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const triggerFileInput = (acceptTypes: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptTypes;
      fileInputRef.current.click();
    }
  };
  
  // Create a separate function to trigger file selection for editing
  const triggerEditFileInput = (acceptTypes: string) => {
    if (editFileInputRef.current) {
      editFileInputRef.current.accept = acceptTypes;
      editFileInputRef.current.click();
    }
  };
  
  // Add a dedicated function for editing file uploads
  const handleEditFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingMemory) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast("File too large! Please upload files smaller than 5MB.");
      return;
    }
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const fileData = e.target?.result as string;
        
        setEditingMemory({
          ...editingMemory,
          fileName: file.name,
          fileSize: file.size,
          fileData,
          imageUrl: editingMemory.type === 'image' ? fileData : editingMemory.imageUrl
        });
      };
      
      if (file.type.includes('image') || file.type.includes('audio') || file.type.includes('pdf')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast("Failed to read file. Please try again.");
    }
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Wall Of Faces</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsQuoteDialogOpen(true)}>
            <Quote className="mr-2 h-4 w-4" />
            Manage Quotes
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Memory
          </Button>
        </div>
      </div>
      
      {/* Quote of the Day Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-6">
          <div className="flex items-start">
            <Quote className="h-8 w-8 text-primary mr-4 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Motivation Quote of the Day</h3>
              <blockquote className="text-xl italic">"{getQuoteOfTheDay().text}"</blockquote>
              <footer className="text-right text-muted-foreground mt-2">― {getQuoteOfTheDay().author}</footer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Memory Board Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Your Memories</CardTitle>
              <CardDescription>Store your motivational memories and inspirations</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[200px]"
                />
              </div>
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-1">
                <Book className="h-4 w-4" /> Text
              </TabsTrigger>
              <TabsTrigger value="image" className="flex items-center gap-1">
                <Image className="h-4 w-4" /> Images
              </TabsTrigger>
              <TabsTrigger value="quote" className="flex items-center gap-1">
                <Quote className="h-4 w-4" /> Quotes
              </TabsTrigger>
              <TabsTrigger value="link" className="flex items-center gap-1">
                <Link className="h-4 w-4" /> Links
              </TabsTrigger>
              <TabsTrigger value="music" className="flex items-center gap-1">
                <Music className="h-4 w-4" /> Music
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-1">
                <FileText className="h-4 w-4" /> Files
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {getFilteredMemories().length === 0 ? (
              <div className="text-center py-10">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">No memories found</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setIsAddDialogOpen(true);
                    setNewMemory({...newMemory, type: activeTab === "all" ? "text" : activeTab as MemoryType});
                  }}
                >
                  Add your first memory
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {getFilteredMemories().map(memory => (
                  <MemoryItemCard
                    key={memory.id}
                    memory={memory}
                    onDelete={handleDeleteMemory}
                    onPin={handlePinMemory}
                    onEdit={(memory) => {
                      setEditingMemory(memory);
                      setIsEditDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Add Memory Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Memory</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Memory Type</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                <Button
                  type="button"
                  variant={newMemory.type === "text" ? "default" : "outline"}
                  className="flex flex-col gap-1 py-2 h-auto"
                  onClick={() => setNewMemory({...newMemory, type: "text"})}
                >
                  <Book className="h-4 w-4" />
                  <span className="text-xs">Text</span>
                </Button>
                <Button
                  type="button"
                  variant={newMemory.type === "image" ? "default" : "outline"}
                  className="flex flex-col gap-1 py-2 h-auto"
                  onClick={() => setNewMemory({...newMemory, type: "image"})}
                >
                  <Image className="h-4 w-4" />
                  <span className="text-xs">Image</span>
                </Button>
                <Button
                  type="button"
                  variant={newMemory.type === "quote" ? "default" : "outline"}
                  className="flex flex-col gap-1 py-2 h-auto"
                  onClick={() => setNewMemory({...newMemory, type: "quote"})}
                >
                  <Quote className="h-4 w-4" />
                  <span className="text-xs">Quote</span>
                </Button>
                <Button
                  type="button"
                  variant={newMemory.type === "link" ? "default" : "outline"}
                  className="flex flex-col gap-1 py-2 h-auto"
                  onClick={() => setNewMemory({...newMemory, type: "link"})}
                >
                  <Link className="h-4 w-4" />
                  <span className="text-xs">Link</span>
                </Button>
                <Button
                  type="button"
                  variant={newMemory.type === "music" ? "default" : "outline"}
                  className="flex flex-col gap-1 py-2 h-auto"
                  onClick={() => setNewMemory({...newMemory, type: "music"})}
                >
                  <Music className="h-4 w-4" />
                  <span className="text-xs">Music</span>
                </Button>
                <Button
                  type="button"
                  variant={newMemory.type === "pdf" ? "default" : "outline"}
                  className="flex flex-col gap-1 py-2 h-auto"
                  onClick={() => setNewMemory({...newMemory, type: "pdf"})}
                >
                  <FileText className="h-4 w-4 text-red-500" />
                  <span className="text-xs">PDF</span>
                </Button>
                <Button
                  type="button"
                  variant={newMemory.type === "txt" ? "default" : "outline"}
                  className="flex flex-col gap-1 py-2 h-auto"
                  onClick={() => setNewMemory({...newMemory, type: "txt"})}
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">TXT</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                placeholder="Enter a title"
                value={newMemory.title || ""}
                onChange={(e) => setNewMemory({...newMemory, title: e.target.value})}
              />
            </div>
            
            {/* File upload section */}
            {(newMemory.type === "pdf" || newMemory.type === "txt" || newMemory.type === "music" || newMemory.type === "image") && (
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      const acceptMap = {
                        'pdf': '.pdf,application/pdf',
                        'txt': '.txt,text/plain',
                        'music': '.mp3,audio/*',
                        'image': '.jpg,.jpeg,.png,image/*'
                      };
                      
                      triggerFileInput(acceptMap[newMemory.type as keyof typeof acceptMap]);
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {newMemory.fileName ? 'Change File' : `Upload ${newMemory.type.toUpperCase()} File`}
                  </Button>
                </div>
                {newMemory.fileName && (
                  <div className="text-sm bg-secondary/30 p-2 rounded-md">
                    <div className="font-medium flex items-center">
                      {newMemory.type === 'pdf' && <FileText className="h-4 w-4 mr-1 text-red-500" />}
                      {newMemory.type === 'txt' && <FileText className="h-4 w-4 mr-1" />}
                      {newMemory.type === 'music' && <Music className="h-4 w-4 mr-1" />}
                      {newMemory.type === 'image' && <Image className="h-4 w-4 mr-1" />}
                      {newMemory.fileName}
                    </div>
                    {newMemory.fileSize && (
                      <div className="text-xs text-muted-foreground">
                        {(newMemory.fileSize / 1024).toFixed(1)} KB
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="content">
                {newMemory.type === "text" ? "Memory Content" : 
                 newMemory.type === "image" ? "Image Description" :
                 newMemory.type === "quote" ? "Quote Text" :
                 newMemory.type === "link" ? "Link Description" :
                 newMemory.type === "pdf" ? "PDF Description" :
                 newMemory.type === "txt" ? "Text File Description" :
                 "Music Description"}
              </Label>
              <Textarea
                id="content"
                placeholder={
                  newMemory.type === "text" ? "A special moment that inspired me..." : 
                  newMemory.type === "image" ? "Describe this inspiring image..." :
                  newMemory.type === "quote" ? "Enter the motivational quote..." :
                  newMemory.type === "link" ? "Describe why this link motivates you..." :
                  newMemory.type === "pdf" ? "Describe what this PDF document means to you..." :
                  newMemory.type === "txt" ? "Describe what this text file contains..." :
                  "Describe why this song motivates you..."
                }
                value={newMemory.content}
                onChange={(e) => setNewMemory({...newMemory, content: e.target.value})}
                rows={4}
              />
            </div>
            
            {(newMemory.type === "image") && !newMemory.fileData && (
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={newMemory.imageUrl || ""}
                  onChange={(e) => setNewMemory({...newMemory, imageUrl: e.target.value})}
                />
              </div>
            )}
            
            {(newMemory.type === "link" || (newMemory.type === "music" && !newMemory.fileData)) && (
              <div className="space-y-2">
                <Label htmlFor="linkUrl">
                  {newMemory.type === "link" ? "Link URL" : "Music Link URL"}
                </Label>
                <Input
                  id="linkUrl"
                  placeholder={
                    newMemory.type === "link" 
                      ? "https://example.com" 
                      : "https://open.spotify.com/track/..."
                  }
                  value={newMemory.linkUrl || ""}
                  onChange={(e) => setNewMemory({...newMemory, linkUrl: e.target.value})}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="color">Color (Optional)</Label>
              <Select
                value={newMemory.color || "default"}
                onValueChange={(value) => setNewMemory({...newMemory, color: value})}
              >
                <SelectTrigger id="color">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="bg-red-50">Red</SelectItem>
                  <SelectItem value="bg-orange-50">Orange</SelectItem>
                  <SelectItem value="bg-yellow-50">Yellow</SelectItem>
                  <SelectItem value="bg-green-50">Green</SelectItem>
                  <SelectItem value="bg-blue-50">Blue</SelectItem>
                  <SelectItem value="bg-purple-50">Purple</SelectItem>
                  <SelectItem value="bg-pink-50">Pink</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMemory}>
              Add Memory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Memory Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditingMemory(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          
          {editingMemory && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingMemory.title || ""}
                  onChange={(e) => setEditingMemory({...editingMemory, title: e.target.value})}
                />
              </div>
              
              {/* Add hidden file input for edit file uploads */}
              <input 
                type="file" 
                ref={editFileInputRef} 
                onChange={handleEditFileSelect} 
                className="hidden"
              />
              
              {/* Show file information for uploaded files */}
              {(editingMemory.type === "pdf" || editingMemory.type === "txt" || 
                (editingMemory.type === "music" && editingMemory.fileData) || 
                (editingMemory.type === "image" && editingMemory.fileData)) && editingMemory.fileName && (
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="text-sm bg-secondary/30 p-2 rounded-md">
                    <div className="font-medium flex items-center">
                      {editingMemory.type === 'pdf' && <FileText className="h-4 w-4 mr-1 text-red-500" />}
                      {editingMemory.type === 'txt' && <FileText className="h-4 w-4 mr-1" />}
                      {editingMemory.type === 'music' && <Music className="h-4 w-4 mr-1" />}
                      {editingMemory.type === 'image' && <Image className="h-4 w-4 mr-1" />}
                      {editingMemory.fileName}
                    </div>
                    {editingMemory.fileSize && (
                      <div className="text-xs text-muted-foreground">
                        {(editingMemory.fileSize / 1024).toFixed(1)} KB
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Trigger the edit file input with appropriate accept types
                        triggerEditFileInput(
                          editingMemory.type === 'pdf' ? '.pdf,application/pdf' :
                          editingMemory.type === 'txt' ? '.txt,text/plain' :
                          editingMemory.type === 'music' ? '.mp3,audio/*' :
                          '.jpg,.jpeg,.png,image/*'
                        );
                      }}
                    >
                      Replace File
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingMemory.content}
                  onChange={(e) => setEditingMemory({...editingMemory, content: e.target.value})}
                  rows={4}
                />
              </div>
              
              {editingMemory.type === "image" && !editingMemory.fileData && (
                <div className="space-y-2">
                  <Label htmlFor="edit-imageUrl">Image URL</Label>
                  <Input
                    id="edit-imageUrl"
                    value={editingMemory.imageUrl || ""}
                    onChange={(e) => setEditingMemory({...editingMemory, imageUrl: e.target.value})}
                  />
                </div>
              )}
              
              {(editingMemory.type === "link" || (editingMemory.type === "music" && !editingMemory.fileData)) && (
                <div className="space-y-2">
                  <Label htmlFor="edit-linkUrl">
                    {editingMemory.type === "link" ? "Link URL" : "Music Link URL"}
                  </Label>
                  <Input
                    id="edit-linkUrl"
                    value={editingMemory.linkUrl || ""}
                    onChange={(e) => setEditingMemory({...editingMemory, linkUrl: e.target.value})}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Select
                  value={editingMemory.color || "default"}
                  onValueChange={(value) => setEditingMemory({...editingMemory, color: value})}
                >
                  <SelectTrigger id="edit-color">
                    <SelectValue placeholder="Select a color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="bg-red-50">Red</SelectItem>
                    <SelectItem value="bg-orange-50">Orange</SelectItem>
                    <SelectItem value="bg-yellow-50">Yellow</SelectItem>
                    <SelectItem value="bg-green-50">Green</SelectItem>
                    <SelectItem value="bg-blue-50">Blue</SelectItem>
                    <SelectItem value="bg-purple-50">Purple</SelectItem>
                    <SelectItem value="bg-pink-50">Pink</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="destructive" 
              onClick={() => editingMemory && handleDeleteMemory(editingMemory.id)}
            >
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMemory}>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Quotes Dialog */}
      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Motivational Quotes</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quote-text">Quote Text</Label>
              <Textarea
                id="quote-text"
                placeholder="Enter an inspirational quote"
                value={newQuote.text}
                onChange={(e) => setNewQuote({...newQuote, text: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quote-author">Author</Label>
              <Input
                id="quote-author"
                placeholder="Enter the author's name"
                value={newQuote.author}
                onChange={(e) => setNewQuote({...newQuote, author: e.target.value})}
              />
            </div>
            
            <Button 
              onClick={handleAddQuote}
              className="w-full"
              disabled={!newQuote.text || !newQuote.author}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Quote
            </Button>
            
            <div className="pt-4">
              <h4 className="font-medium mb-2">Your Quotes</h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {quotes.map((quote, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-start p-3 border rounded-md"
                    >
                      <div>
                        <p className="text-sm italic">"{quote.text}"</p>
                        <p className="text-xs text-muted-foreground">— {quote.author}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteQuote(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {quotes.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No quotes added yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsQuoteDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemoriesPage;
