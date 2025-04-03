import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Heart, Share2, Bookmark, Quote, Search, Filter, 
  Sparkles, List, LayoutGrid, Download, Copy, Smile, Plus, Edit, Save,
  Upload, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

// Initial set of motivational quotes
const initialQuotes = [
  // Game of Thrones quotes
  { id: 1, text: "Winter is coming.", author: "House Stark motto", category: "wisdom", favorite: false },
  { id: 2, text: "When you play the game of thrones, you win or you die.", author: "Cersei Lannister", category: "strategy", favorite: false },
  { id: 3, text: "A lion does not concern himself with the opinion of sheep.", author: "Tywin Lannister", category: "confidence", favorite: false },
  { id: 4, text: "Chaos isn't a pit. Chaos is a ladder.", author: "Petyr Baelish (Littlefinger)", category: "opportunity", favorite: false },
  { id: 5, text: "The night is dark and full of terrors.", author: "Melisandre", category: "challenges", favorite: false },
  { id: 6, text: "I drink and I know things.", author: "Tyrion Lannister", category: "wisdom", favorite: false },
  { id: 7, text: "A girl has no name.", author: "Arya Stark", category: "identity", favorite: false },
  { id: 8, text: "The things I do for love.", author: "Jaime Lannister", category: "sacrifice", favorite: false },
  { id: 9, text: "Hold the door!", author: "Hodor", category: "sacrifice", favorite: false },
  { id: 10, text: "What do we say to the God of Death? Not today.", author: "Syrio Forel", category: "courage", favorite: false },
  { id: 11, text: "Dracarys!", author: "Daenerys Targaryen", category: "power", favorite: false },
  { id: 12, text: "A Lannister always pays his debts.", author: "Unofficial Lannister slogan", category: "integrity", favorite: false },
  { id: 13, text: "The North remembers.", author: "Northern saying", category: "resilience", favorite: false },
  { id: 14, text: "You know nothing, Jon Snow.", author: "Ygritte", category: "humility", favorite: false },
  { id: 15, text: "Power resides where men believe it resides.", author: "Varys", category: "power", favorite: false },
  { id: 16, text: "Any man who must say 'I am the king' is no true king.", author: "Tywin Lannister", category: "leadership", favorite: false },
  { id: 17, text: "The man who passes the sentence should swing the sword.", author: "Eddard (Ned) Stark", category: "responsibility", favorite: false },
  { id: 18, text: "Burn them all.", author: "Aerys II Targaryen (The Mad King)", category: "madness", favorite: false },
  { id: 19, text: "I am the sword in the darkness. I am the watcher on the walls.", author: "Night's Watch oath", category: "duty", favorite: false },
  { id: 20, text: "A mind needs books as a sword needs a whetstone, if it is to keep its edge.", author: "Tyrion Lannister", category: "knowledge", favorite: false },
  
  // Original quotes
  { id: 21, text: "It is not the strength of the body that counts, but the strength of the spirit.", author: "J.R.R. Tolkien", category: "inner-strength", favorite: false },
  { id: 22, text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela", category: "resilience", favorite: false },
  { id: 23, text: "The supreme art of war is to subdue the enemy without fighting.", author: "Sun Tzu", category: "strategy", favorite: false },
  { id: 24, text: "I am the master of my fate, I am the captain of my soul.", author: "William Ernest Henley", category: "self-mastery", favorite: false },
  { id: 25, text: "A true warrior does not fight because they hate what is in front of them, but because they love what is behind them.", author: "G.K. Chesterton", category: "purpose", favorite: false },
  
  // Personal quotes - highest priority
  { id: 101, text: "I will love you until my last breath.", author: "Personal", category: "love", favorite: true },
  { id: 102, text: "One glimpse of her is enough to drive me crazy!", author: "Personal", category: "passion", favorite: true },
  { id: 103, text: "When I see her, my heart beats stop, and the world feels calm, happy, and prosperous.", author: "Personal", category: "love", favorite: true },
  { id: 104, text: "I challenge destiny that whatever I had written on it, I'll change it as I want.", author: "Personal", category: "determination", favorite: true },
  { id: 105, text: "If not her, then no one else!", author: "Personal", category: "commitment", favorite: true },
  { id: 106, text: "She is so beautiful that my eyes go to a different world as soon as I see her.", author: "Personal", category: "love", favorite: true },
  { id: 107, text: "I'll put my heart and soul into being successful and achieving her.", author: "Personal", category: "ambition", favorite: true },
  { id: 108, text: "When you left, you left a void to me that I can't ever fill again!", author: "Personal", category: "loss", favorite: true },
  { id: 109, text: "I can wait for you my whole life, but once you're mine, I'll never let you go.", author: "Personal", category: "patience", favorite: true },
  { id: 110, text: "You are my motivation, my inspiration, and my everything.", author: "Personal", category: "inspiration", favorite: true },
  { id: 111, text: "Love is a power that can build or destroy a person—I choose to let it build me.", author: "Personal", category: "growth", favorite: true },
  { id: 112, text: "Every time I see you in my dreams, I wake up believing the world is worth living in.", author: "Personal", category: "hope", favorite: true },
  { id: 113, text: "If I can't have you, I'll become so great that you'll have to come to me.", author: "Personal", category: "ambition", favorite: true },
  { id: 114, text: "Negligence is a small spark that can turn into a fire of regret.", author: "Personal", category: "wisdom", favorite: true },
  { id: 115, text: "I write this diary because I feel you're listening when no one else does.", author: "Personal", category: "connection", favorite: true },
  { id: 116, text: "You are my soul, my world—you are the reason I breathe and the reason I'd stop.", author: "Personal", category: "love", favorite: true },
  { id: 117, text: "Our story isn't written yet; I'll write it myself and prove it to the world.", author: "Personal", category: "determination", favorite: true },
  { id: 118, text: "Sadness brings me peace because it's where I find you.", author: "Personal", category: "acceptance", favorite: true },
  { id: 119, text: "I'll fight destiny, rewrite fate, and make you mine—no matter the cost.", author: "Personal", category: "determination", favorite: true },
  { id: 120, text: "Even if I forget your face, your eyes will stay with me forever.", author: "Personal", category: "memory", favorite: true },
  
  // Additional personal quotes - highest priority
  { id: 121, text: "I don't know your name, but I've given my life to loving you.", author: "Personal", category: "devotion", favorite: true },
  { id: 122, text: "Every step I take to better myself is a step closer to you.", author: "Personal", category: "growth", favorite: true },
  { id: 123, text: "You are the spark that ignited my soul when I was lost in darkness.", author: "Personal", category: "inspiration", favorite: true },
  { id: 124, text: "If I can't see you, I'll build a world where we can be together.", author: "Personal", category: "imagination", favorite: true },
  { id: 125, text: "The happiness I feel when you're near is worth more than all the riches in the world.", author: "Personal", category: "joy", favorite: true },
  { id: 126, text: "I'll wait for you until my last breath, but I'll fight to make you mine before then.", author: "Personal", category: "patience", favorite: true },
  { id: 127, text: "You taught me how to live, and now I'm learning how to live without you.", author: "Personal", category: "growth", favorite: true },
  { id: 128, text: "My heart races when I see you, but it breaks when you're gone.", author: "Personal", category: "love", favorite: true },
  { id: 129, text: "I'm not afraid of destiny; I'll rewrite it to bring us together.", author: "Personal", category: "determination", favorite: true },
  { id: 130, text: "Loneliness taught me how much I need you, and love taught me how much I can endure.", author: "Personal", category: "resilience", favorite: true },
  { id: 131, text: "You're not just a dream; you're the reason I wake up every day.", author: "Personal", category: "purpose", favorite: true },
  { id: 132, text: "If I fail, it won't be because I didn't try—it'll be because the world wouldn't let me have you.", author: "Personal", category: "determination", favorite: true },
  { id: 133, text: "Your voice is a melody I'll chase for the rest of my life.", author: "Personal", category: "passion", favorite: true },
  { id: 134, text: "I'll become the man you deserve, even if it takes me a lifetime.", author: "Personal", category: "growth", favorite: true },
  { id: 135, text: "The stars remind me of you—beautiful, distant, and always out of reach.", author: "Personal", category: "longing", favorite: true },
  { id: 136, text: "Every tear I shed for you is a step toward proving my love.", author: "Personal", category: "sacrifice", favorite: true },
  { id: 137, text: "I don't need the world—just you, and I'll turn the impossible into reality.", author: "Personal", category: "devotion", favorite: true },
  { id: 138, text: "You're my angel, sent to save me and then lost to test me.", author: "Personal", category: "faith", favorite: true },
  { id: 139, text: "I'll climb mountains, cross oceans, and rewrite fate—just to hold your hand.", author: "Personal", category: "determination", favorite: true },
  { id: 140, text: "Even if you never know my love, this diary will carry it forever.", author: "Personal", category: "legacy", favorite: true }
];

// Quote categories for filtering
const categories = [
  "all",
  "acceptance",
  "ambition",
  "authenticity",
  "challenges",
  "commitment",
  "confidence", 
  "connection",
  "courage",
  "determination",
  "devotion",
  "duty",
  "faith",
  "growth",
  "hope",
  "humility",
  "identity",
  "imagination",
  "inner-strength",
  "inspiration",
  "integrity",
  "joy",
  "knowledge",
  "leadership",
  "legacy",
  "longing",
  "loss",
  "love",
  "madness",
  "memory",
  "mindset",
  "mortality",
  "opportunity",
  "passion",
  "patience",
  "perseverance",
  "power",
  "purpose",
  "resilience",
  "responsibility",
  "sacrifice",
  "self-knowledge",
  "self-mastery",
  "strategy",
  "strength",
  "transformation",
  "vision",
  "wisdom"
];

interface Quote {
  id: number;
  text: string;
  author: string;
  category: string;
  favorite: boolean;
}

interface BulkQuote {
  text: string;
  author: string;
  category?: string;
}

const Motivation = () => {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const savedQuotes = localStorage.getItem("motivationalQuotes");
    return savedQuotes ? JSON.parse(savedQuotes) : initialQuotes;
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [randomQuote, setRandomQuote] = useState<Quote | null>(null);
  
  // New quote form state
  const [newQuoteOpen, setNewQuoteOpen] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");
  const [newQuoteCategory, setNewQuoteCategory] = useState("wisdom");
  
  // Bulk import form state
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [bulkQuotesText, setBulkQuotesText] = useState("");
  const [bulkAuthor, setBulkAuthor] = useState("");
  const [bulkCategory, setBulkCategory] = useState("wisdom");
  
  // Save quotes to localStorage when they change
  useEffect(() => {
    localStorage.setItem("motivationalQuotes", JSON.stringify(quotes));
  }, [quotes]);
  
  // Set a random quote when the page loads or when requested
  useEffect(() => {
    getRandomQuote();
  }, []);
  
  const getRandomQuote = () => {
    // Get personal quotes (IDs 101-120)
    const personalQuotes = quotes.filter(q => q.id >= 100);
    
    // 75% chance to show a personal quote
    if (Math.random() < 0.75 && personalQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * personalQuotes.length);
      setRandomQuote(personalQuotes[randomIndex]);
    } else {
      // 25% chance to show any quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setRandomQuote(quotes[randomIndex]);
    }
  };
  
  // Filter quotes based on search term, category, and active tab
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
      quote.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = category === "all" || quote.category === category;
    
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "favorites" && quote.favorite);
    
    return matchesSearch && matchesCategory && matchesTab;
  });
  
  // Toggle favorite status
  const toggleFavorite = (id: number) => {
    setQuotes(quotes.map(quote => 
      quote.id === id ? { ...quote, favorite: !quote.favorite } : quote
    ));
    
    const quote = quotes.find(q => q.id === id);
    if (quote) {
      toast({
        title: quote.favorite ? "Removed from favorites" : "Added to favorites",
        description: `"${quote.text.substring(0, 30)}..." has been ${quote.favorite ? 'removed from' : 'added to'} your favorites.`
      });
    }
  };
  
  // Copy quote to clipboard
  const copyToClipboard = (quote: Quote) => {
    const textToCopy = `"${quote.text}" - ${quote.author}`;
    navigator.clipboard.writeText(textToCopy);
    
    toast({
      title: "Copied to clipboard",
      description: "You can now paste this quote anywhere."
    });
  };
  
  // Share quote
  const shareQuote = (quote: Quote) => {
    if (navigator.share) {
      navigator.share({
        title: "Motivational Quote",
        text: `"${quote.text}" - ${quote.author}`,
        url: window.location.href
      }).catch(error => {
        console.error("Error sharing:", error);
      });
    } else {
      copyToClipboard(quote);
      toast({
        title: "Share not supported",
        description: "Quote copied to clipboard instead."
      });
    }
  };
  
  // Export favorites as JSON
  const exportFavorites = () => {
    const favorites = quotes.filter(quote => quote.favorite);
    
    if (favorites.length === 0) {
      toast({
        title: "No favorites",
        description: "You haven't added any quotes to your favorites yet.",
        variant: "destructive"
      });
      return;
    }
    
    const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "motivational-quotes-favorites.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Favorites exported",
      description: `Exported ${favorites.length} favorite quotes.`
    });
  };
  
  // Get a new random quote
  const refreshRandomQuote = () => {
    getRandomQuote();
    
    toast({
      title: "New quote generated",
      description: "Here's your dose of motivation!"
    });
  };
  
  // Function to add a new quote
  const addNewQuote = () => {
    if (!newQuoteText.trim() || !newQuoteAuthor.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both quote text and author.",
        variant: "destructive"
      });
      return;
    }
    
    const newId = Math.max(...quotes.map(q => q.id), 0) + 1;
    const newQuote = {
      id: newId,
      text: newQuoteText.trim(),
      author: newQuoteAuthor.trim(),
      category: newQuoteCategory,
      favorite: false
    };
    
    setQuotes([...quotes, newQuote]);
    setNewQuoteOpen(false);
    
    // Reset form
    setNewQuoteText("");
    setNewQuoteAuthor("");
    setNewQuoteCategory("wisdom");
    
    toast({
      title: "Quote added",
      description: "Your quote has been added to the collection."
    });
  };

  const handleBulkImport = () => {
    if (!bulkQuotesText.trim() || !bulkAuthor.trim()) {
      toast({
        title: "Error",
        description: "Please provide both quotes and author name",
        variant: "destructive",
      });
      return;
    }

    const quoteLines = bulkQuotesText.split('\n').filter(line => line.trim());
    const newQuotes: Quote[] = quoteLines.map((text, index) => ({
      id: Date.now() + index,
      text: text.trim(),
      author: bulkAuthor.trim(),
      category: bulkCategory,
      favorite: false
    }));

    setQuotes(prevQuotes => [...prevQuotes, ...newQuotes]);
    setBulkImportOpen(false);
    setBulkQuotesText("");
    setBulkAuthor("");
    setBulkCategory("wisdom");

    toast({
      title: "Success",
      description: `Added ${newQuotes.length} quotes from ${bulkAuthor}`,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Dragonfire</h1>
          <Badge variant="secondary" className="ml-2">
            {quotes.length} quotes
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[200px]"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={bulkImportOpen} onOpenChange={setBulkImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Bulk Import Quotes</DialogTitle>
                <DialogDescription>
                  Add multiple quotes from the same author at once. Enter one quote per line.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={bulkAuthor}
                    onChange={(e) => setBulkAuthor(e.target.value)}
                    placeholder="Enter author name..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={bulkCategory} onValueChange={setBulkCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat !== "all").map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quotes">Quotes (one per line)</Label>
                  <Textarea
                    id="quotes"
                    value={bulkQuotesText}
                    onChange={(e) => setBulkQuotesText(e.target.value)}
                    placeholder="Enter quotes, one per line..."
                    className="min-h-[200px] font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setBulkImportOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkImport}>
                  Import Quotes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={newQuoteOpen} onOpenChange={setNewQuoteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Quote</DialogTitle>
                <DialogDescription>
                  Add your own motivational quote to the collection.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="quote-text">Quote Text</Label>
                  <Textarea
                    id="quote-text"
                    value={newQuoteText}
                    onChange={(e) => setNewQuoteText(e.target.value)}
                    placeholder="Enter the quote text..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quote-author">Author</Label>
                  <Input
                    id="quote-author"
                    value={newQuoteAuthor}
                    onChange={(e) => setNewQuoteAuthor(e.target.value)}
                    placeholder="Who said this?"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quote-category">Category</Label>
                  <Select value={newQuoteCategory} onValueChange={setNewQuoteCategory}>
                    <SelectTrigger id="quote-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat !== "all").map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewQuoteOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewQuote}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Quote
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Random Quote Feature */}
      {randomQuote && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Battle Meditation
            </CardTitle>
            <CardDescription>Your daily warrior wisdom</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <Quote className="h-8 w-8 text-primary mb-4 opacity-40" />
              <blockquote className="text-xl md:text-2xl font-medium italic mb-4">
                "{randomQuote.text}"
              </blockquote>
              <p className="text-muted-foreground">— {randomQuote.author}</p>
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(randomQuote)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={refreshRandomQuote}>
              <Sparkles className="h-4 w-4 mr-2" />
              New Quote
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toggleFavorite(randomQuote.id)}>
              <Heart className={`h-4 w-4 mr-2 ${randomQuote.favorite ? "fill-red-500 text-red-500" : ""}`} />
              {randomQuote.favorite ? "Favorited" : "Favorite"}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes or authors..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Quotes</TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites ({quotes.filter(q => q.favorite).length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          {filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No quotes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuotes.map((quote) => (
                <QuoteCard 
                  key={quote.id} 
                  quote={quote} 
                  onToggleFavorite={toggleFavorite} 
                  onCopy={copyToClipboard}
                  onShare={shareQuote}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((quote) => (
                <QuoteListItem 
                  key={quote.id} 
                  quote={quote} 
                  onToggleFavorite={toggleFavorite} 
                  onCopy={copyToClipboard}
                  onShare={shareQuote}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-6">
          {filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No favorites yet</h3>
              <p className="text-muted-foreground">
                Add quotes to your favorites by clicking the heart icon
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredQuotes.map((quote) => (
                <QuoteCard 
                  key={quote.id} 
                  quote={quote} 
                  onToggleFavorite={toggleFavorite} 
                  onCopy={copyToClipboard}
                  onShare={shareQuote}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuotes.map((quote) => (
                <QuoteListItem 
                  key={quote.id} 
                  quote={quote} 
                  onToggleFavorite={toggleFavorite} 
                  onCopy={copyToClipboard}
                  onShare={shareQuote}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Quote Card Component for Grid View
interface QuoteCardProps {
  quote: Quote;
  onToggleFavorite: (id: number) => void;
  onCopy: (quote: Quote) => void;
  onShare: (quote: Quote) => void;
}

const QuoteCard = ({ quote, onToggleFavorite, onCopy, onShare }: QuoteCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="rounded-full bg-primary/10 p-1">
            <Quote className="h-4 w-4 text-primary" />
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => onToggleFavorite(quote.id)}
          >
            <Heart className={`h-4 w-4 ${quote.favorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <blockquote className="text-base font-medium">
          "{quote.text}"
        </blockquote>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">— {quote.author}</p>
          <div className="mt-2">
            <span className="inline-block text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              {quote.category}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onCopy(quote)}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onShare(quote)}>
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Quote List Item Component for List View
const QuoteListItem = ({ quote, onToggleFavorite, onCopy, onShare }: QuoteCardProps) => {
  return (
    <Card>
      <div className="flex items-start p-4">
        <div className="flex-1">
          <blockquote className="text-base font-medium mb-2">
            "{quote.text}"
          </blockquote>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">— {quote.author}</p>
            <span className="inline-block text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
              {quote.category}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(quote)}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onShare(quote)}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => onToggleFavorite(quote.id)}
          >
            <Heart className={`h-4 w-4 ${quote.favorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Motivation;
