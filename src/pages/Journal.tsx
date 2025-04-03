import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/Container";
import { ErrorBoundary } from "react-error-boundary";
import { 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag,
  ChevronDown,
  SunMoon,
  BookOpen,
  Eye,
  FilePenLine,
  Palette,
  ListChecks,
  LayoutGrid,
  BarChart,
  Quote,
  Sparkles,
  SmilePlus,
  Smile,
  Meh,
  Frown,
  ThumbsDown,
  PenLine,
  Plus,
  XCircle,
  Calendar as CalendarIcon
} from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";
import MoodTracker from "@/components/MoodTracker/MoodTracker";
import { addToHistory } from "@/utils/historyUtils";
import { motion } from "framer-motion";
import { showReward } from "@/utils/rewardUtils";
import MoodHistory from "@/components/MoodTracker/MoodHistory";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { addDays } from "date-fns";

// Inspirational quotes about journaling
const journalingQuotes = [
  "Journal writing is a voyage to the interior. — Christina Baldwin",
  "Fill your paper with the breathings of your heart. — William Wordsworth",
  "Writing is thinking on paper. — William Zinsser",
  "Journal writing gives us insights into who we are, who we were, and who we can become. — Sandra Marinella",
  "What happens to us is not as important as the meaning we assign to it. Journaling helps sort this out. — Michael Hyatt",
  "A journal is your completely unaltered voice. — Lucy Dacus",
  "The act of writing is the act of making soul. — Gloria E. Anzaldúa",
  "Writing in a journal reminds you of your goals and of your learning in life. — Robin Sharma",
  "In the journal I am at ease. — Anaïs Nin",
  "A journal is a way to converse with ourselves, to discover who we are becoming. — Beth Kephart",
  "I can shake off everything as I write; my sorrows disappear, my courage is reborn. — Anne Frank",
  "Journaling is like whispering to oneself and listening at the same time. — Mina Murray",
  "Your journal is the story of your life, and you should always be the author. — Unknown",
  "The pages of your journal can hold all of your doubts so your mind doesn't have to. — Unknown",
  "Write hard and clear about what hurts. — Ernest Hemingway"
];

// Emotional growth quotes
const emotionalGrowthQuotes = [
  "The emotion that can break your heart is sometimes the very one that heals it. — Nicholas Sparks",
  "Awareness is the first step in healing. — Dean Ornish",
  "Your emotions make you human. Even the unpleasant ones have a purpose. — Sabaa Tahir",
  "Feelings are just visitors, let them come and go. — Mooji",
  "To weep is to make less the depth of grief. — William Shakespeare",
  "The best way out is always through. — Robert Frost",
  "Emotion, which is suffering, ceases to be suffering as soon as we form a clear picture of it. — Baruch Spinoza",
  "We cannot selectively numb emotions. When we numb the painful emotions, we also numb the positive emotions. — Brené Brown",
  "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor. — Thich Nhat Hanh",
  "Learning how to be still, to really be still and let life happen—that stillness becomes a radiance. — Morgan Freeman"
];

// Personal quotes - highest priority
const personalQuotes = [
  "I will love you until my last breath.",
  "One glimpse of her is enough to drive me crazy!",
  "When I see her, my heart beats stop, and the world feels calm, happy, and prosperous.",
  "I challenge destiny that whatever I had written on it, I'll change it as I want.",
  "If not her, then no one else!",
  "She is so beautiful that my eyes go to a different world as soon as I see her.",
  "I'll put my heart and soul into being successful and achieving her.",
  "When you left, you left a void to me that I can't ever fill again!",
  "I can wait for you my whole life, but once you're mine, I'll never let you go.",
  "You are my motivation, my inspiration, and my everything.",
  "Love is a power that can build or destroy a person—I choose to let it build me.",
  "Every time I see you in my dreams, I wake up believing the world is worth living in.",
  "If I can't have you, I'll become so great that you'll have to come to me.",
  "Negligence is a small spark that can turn into a fire of regret.",
  "I write this diary because I feel you're listening when no one else does.",
  "You are my soul, my world—you are the reason I breathe and the reason I'd stop.",
  "Our story isn't written yet; I'll write it myself and prove it to the world.",
  "Sadness brings me peace because it's where I find you.",
  "I'll fight destiny, rewrite fate, and make you mine—no matter the cost.",
  "Even if I forget your face, your eyes will stay with me forever.",
  // New quotes
  "I don't know your name, but I've given my life to loving you.",
  "Every step I take to better myself is a step closer to you.",
  "You are the spark that ignited my soul when I was lost in darkness.",
  "If I can't see you, I'll build a world where we can be together.",
  "The happiness I feel when you're near is worth more than all the riches in the world.",
  "I'll wait for you until my last breath, but I'll fight to make you mine before then.",
  "You taught me how to live, and now I'm learning how to live without you.",
  "My heart races when I see you, but it breaks when you're gone.",
  "I'm not afraid of destiny; I'll rewrite it to bring us together.",
  "Loneliness taught me how much I need you, and love taught me how much I can endure.",
  "You're not just a dream; you're the reason I wake up every day.",
  "If I fail, it won't be because I didn't try—it'll be because the world wouldn't let me have you.",
  "Your voice is a melody I'll chase for the rest of my life.",
  "I'll become the man you deserve, even if it takes me a lifetime.",
  "The stars remind me of you—beautiful, distant, and always out of reach.",
  "Every tear I shed for you is a step toward proving my love.",
  "I don't need the world—just you, and I'll turn the impossible into reality.",
  "You're my angel, sent to save me and then lost to test me.",
  "I'll climb mountains, cross oceans, and rewrite fate—just to hold your hand.",
  "Even if you never know my love, this diary will carry it forever."
];

// Writing prompts that go beyond the standard ones
const advancedJournalPrompts = [
  "Write about a time when you surprised yourself with your own strength or resilience.",
  "What part of your inner self do you hide from others? Why?",
  "If you could have a conversation with your past self from exactly one year ago, what would you say?",
  "What difficult truth are you avoiding right now?",
  "Describe a moment when you felt completely at peace or in flow. What elements created that feeling?",
  "What old story about yourself are you ready to let go of?",
  "Write about something you're afraid to hope for.",
  "Describe a lesson life keeps trying to teach you.",
  "What do you need to forgive yourself for?",
  "If your body could speak to you directly, what would it say right now?",
  "Write about a compliment you received that you had trouble accepting and why.",
  "What emotion do you find most difficult to express? Why?",
  "Write a love letter to a part of yourself you struggle to accept.",
  "What's something you know to be true that most people would disagree with?",
  "Write about a personal rule you live by and how it has served you."
];

// Mood options with their respective colors and icons
const moodOptions = [
  { value: "excited", label: "Excited", color: "bg-yellow-500" },
  { value: "happy", label: "Happy", color: "bg-green-500" },
  { value: "neutral", label: "Neutral", color: "bg-blue-500" },
  { value: "sad", label: "Sad", color: "bg-indigo-500" },
  { value: "angry", label: "Angry", color: "bg-red-500" }
];

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
}

// Fallback component for error boundary
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-semibold mb-4">Something went wrong</h2>
      <pre className="text-red-500 mb-4">{error.message}</pre>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
}

const JournalContent = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("entries");
  const [searchTerm, setSearchTerm] = useState("");
  const [moodFilter, setMoodFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [journalPrompt, setJournalPrompt] = useState("");
  const [dailyQuote, setDailyQuote] = useState("");
  const [inspirationQuote, setInspirationQuote] = useState("");
  const [moodTabValue, setMoodTabValue] = useState<"new" | "history">("new");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Daily prompts for inspiration
  const journalPrompts = [
    "What made you smile today?",
    "Describe a moment when you felt truly alive recently.",
    "What's something you're grateful for today?",
    "What's a challenge you're currently facing and how are you handling it?",
    "Reflect on a conversation that impacted you this week.",
    "What's something new you learned recently?",
    "Describe your ideal day. What would it look like?",
    "What's a goal you're working toward? How are you progressing?",
    "Write about someone who inspires you and why.",
    "What would you tell your younger self if you could?",
    "Describe a place where you feel completely at peace.",
    "What's something you're looking forward to?",
    "What boundaries do you need to set or maintain in your life?",
    "Describe a recent dream you remember. What might it mean?",
    "What are three things you love about yourself?",
  ];

  // Template options
  const journalTemplates = [
    {
      name: "Daily Reflection",
      content: "Today's date: [date]\n\nThree things I'm grateful for:\n1. \n2. \n3. \n\nWhat went well today:\n\nWhat could have gone better:\n\nLessons learned:\n\nTomorrow I will:"
    },
    {
      name: "Emotional Check-in",
      content: "Today I feel: \n\nWhat's contributing to these feelings: \n\nPhysical sensations I notice: \n\nThoughts I'm having: \n\nWhat I need right now:"
    },
    {
      name: "Memory Keeper",
      content: "Memory date: [date]\n\nWhat happened: \n\nWho was there: \n\nWhy this memory matters: \n\nHow it made me feel: \n\nWhat I want to remember from this:"
    },
    {
      name: "Personal Growth",
      content: "Area of life I'm reflecting on: \n\nCurrent challenges: \n\nRecent victories: \n\nWhat I'm learning: \n\nNext steps for growth:"
    }
  ];

  // Load entries from localStorage on component mount
  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem("journal");
      if (savedEntries) {
        try {
          const parsedEntries = JSON.parse(savedEntries);
          setEntries(Array.isArray(parsedEntries) ? parsedEntries : []);
        } catch (parseError) {
          console.error("Failed to parse journal entries from localStorage:", parseError);
          setEntries([]);
        }
      }

      // Load all tags
      const savedTags = localStorage.getItem("journalTags");
      if (savedTags) {
        try {
          const parsedTags = JSON.parse(savedTags);
          setAllTags(Array.isArray(parsedTags) ? parsedTags : []);
        } catch (parseError) {
          console.error("Failed to parse journal tags from localStorage:", parseError);
          setAllTags([]);
        }
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      toast({
        title: "Storage Error",
        description: "Failed to load your journal data. Some features may not work properly.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Set a daily quote on component mount
  useEffect(() => {
    const day = new Date().getDate();
    const month = new Date().getMonth();
    
    // Prioritize personal quotes (80% chance)
    if (Math.random() < 0.8) {
      const personalQuoteIndex = (day + month) % personalQuotes.length;
      setDailyQuote(personalQuotes[personalQuoteIndex]);
    } else {
      // Occasionally use other quotes (20% chance)
      const quoteArray = day % 2 === 0 ? journalingQuotes : emotionalGrowthQuotes;
      const quoteIndex = (day + month) % quoteArray.length;
      setDailyQuote(quoteArray[quoteIndex]);
    }
    
    // Also set a random prompt
    getRandomPrompt();
    updateInspirationQuote();
  }, []);

  // Update inspiration quote when content changes significantly
  useEffect(() => {
    // Only update the quote when content length passes certain thresholds
    // This prevents the quote from changing too frequently
    const contentLength = content.length;
    if (
      contentLength === 50 || 
      contentLength === 150 || 
      contentLength === 300 || 
      contentLength === 500 ||
      contentLength === 750
    ) {
      updateInspirationQuote();
    }
  }, [content]);

  // Get a random inspirational quote with preference for personal quotes
  const updateInspirationQuote = () => {
    // Prioritize personal quotes (75% chance)
    if (Math.random() < 0.75) {
      const randomIndex = Math.floor(Math.random() * personalQuotes.length);
      setInspirationQuote(personalQuotes[randomIndex]);
    } else {
      // Occasionally use other quotes (25% chance)
      const allQuotes = [...journalingQuotes, ...emotionalGrowthQuotes];
      const randomIndex = Math.floor(Math.random() * allQuotes.length);
      setInspirationQuote(allQuotes[randomIndex]);
    }
  };

  // Filter entries based on search query and tag filter
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === "" || 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMood = moodFilter === "all" || moodFilter === "" || entry.mood === moodFilter;
    const matchesTag = tagFilter === "all" || tagFilter === "" || entry.tags.includes(tagFilter);
    
    return matchesSearch && matchesMood && matchesTag;
  });

  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleAddTag = () => {
    try {
      if (newTag.trim() === "") return;
      
      if (!selectedTags.includes(newTag)) {
        const updatedSelectedTags = [...selectedTags, newTag];
        setSelectedTags(updatedSelectedTags);
        
        // Add to allTags if it's a new tag
        if (!allTags.includes(newTag)) {
          const updatedAllTags = [...allTags, newTag];
          setAllTags(updatedAllTags);
          try {
            localStorage.setItem("journalTags", JSON.stringify(updatedAllTags));
          } catch (err) {
            console.error("Failed to save tags to localStorage:", err);
          }
        }
      }
      
      setNewTag("");
    } catch (error) {
      console.error("Error in handleAddTag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (title.trim() === "" || content.trim() === "") {
        toast({
          title: "Error",
          description: "Title and content are required.",
          variant: "destructive"
        });
        return;
      }
      
      const today = format(new Date(), "yyyy-MM-dd");
      
      if (editingEntry) {
        // Update existing entry
        const updatedEntries = entries.map(entry => 
          entry.id === editingEntry.id 
            ? { 
                ...entry, 
                title, 
                content, 
                tags: selectedTags,
                createdAt: new Date().toISOString() 
              } 
            : entry
        );
        
        setEntries(updatedEntries);
        try {
          localStorage.setItem("journal", JSON.stringify(updatedEntries));
          
          toast({
            title: "Entry Updated",
            description: "Your journal entry has been updated."
          });
          
          addToHistory("journal", "updated", title, `Updated journal entry`);
        } catch (err) {
          console.error("Failed to save updated entry to localStorage:", err);
          toast({
            title: "Storage Error",
            description: "Failed to save your entry. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        // Create new entry
        const newEntry: JournalEntry = {
          id: Date.now().toString(),
          title,
          content,
          mood: selectedMood,
          tags: selectedTags,
          createdAt: new Date().toISOString()
        };
        
        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);
        
        try {
          localStorage.setItem("journal", JSON.stringify(updatedEntries));
          
          toast({
            title: "Entry Added",
            description: "Your journal entry has been saved."
          });
          
          addToHistory("journal", "created", title, `Added new journal entry`);
        } catch (err) {
          console.error("Failed to save new entry to localStorage:", err);
          toast({
            title: "Storage Error",
            description: "Failed to save your entry. Please try again.",
            variant: "destructive"
          });
        }
      }
      
      // Reset form
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setEditingEntry(null);
      setActiveTab("entries");
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedTags(entry.tags);
    setActiveTab("write");
  };

  const handleDeleteEntry = (entryId: string) => {
    try {
      const entryToDelete = entries.find(entry => entry.id === entryId);
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(updatedEntries);
      
      try {
        localStorage.setItem("journal", JSON.stringify(updatedEntries));
        
        toast({
          title: "Entry Deleted",
          description: "Your journal entry has been deleted."
        });
        
        if (entryToDelete) {
          addToHistory("journal", "deleted", entryToDelete.title, `Deleted journal entry`);
        }
      } catch (err) {
        console.error("Failed to update localStorage after deletion:", err);
        toast({
          title: "Storage Error",
          description: "Failed to update storage after deletion. Your data may be inconsistent.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in handleDeleteEntry:", error);
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setEditingEntry(null);
  };

  const handleMoodLogged = () => {
    try {
      // Refresh entries list after mood logging
      const savedEntries = localStorage.getItem("journal");
      if (savedEntries) {
        try {
          const parsedEntries = JSON.parse(savedEntries);
          setEntries(Array.isArray(parsedEntries) ? parsedEntries : []);
        } catch (parseError) {
          console.error("Failed to parse journal entries from localStorage:", parseError);
        }
      }
      
      // Switch to entries tab
      setActiveTab("entries");
      
      toast({
        title: "Mood Tracked",
        description: "Your mood has been recorded successfully."
      });
    } catch (error) {
      console.error("Error in handleMoodLogged:", error);
      toast({
        title: "Error",
        description: "Failed to update mood data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setViewingEntry(entry);
    setIsDetailDialogOpen(true);
  };

  // Get a random prompt
  const getRandomPrompt = () => {
    // Randomly choose between standard and advanced prompts
    const useAdvancedPrompts = Math.random() > 0.4;
    const promptArray = useAdvancedPrompts ? advancedJournalPrompts : journalPrompts;
    const randomIndex = Math.floor(Math.random() * promptArray.length);
    setJournalPrompt(promptArray[randomIndex]);
  };

  // Add new function to apply a template
  const applyTemplate = (templateContent: string) => {
    // Replace [date] with current date if present
    const formattedContent = templateContent.replace('[date]', format(new Date(), 'MMMM d, yyyy'));
    setContent(formattedContent);
  };

  // Add function to calculate journaling stats
  const getJournalStats = () => {
    const totalEntries = entries.length;
    
    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        entriesThisWeek: 0,
        longestEntry: { length: 0, title: "" },
        mostUsedTag: null
      };
    }
    
    const today = format(new Date(), "yyyy-MM-dd");
    const entriesThisWeek = entries.filter(entry => {
      const entryDate = entry.createdAt ? format(parseISO(entry.createdAt), "yyyy-MM-dd") : today;
      const entryTime = new Date(entryDate).getTime();
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryTime >= weekAgo.getTime();
    }).length;
    
    // Find the longest entry
    let longestEntry = { length: 0, title: "" };
    entries.forEach(entry => {
      if (entry.content.length > longestEntry.length) {
        longestEntry = { length: entry.content.length, title: entry.title };
      }
    });
    
    // Calculate most used tag
    const tagCounts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    let mostUsedTag = { tag: "", count: 0 };
    Object.entries(tagCounts).forEach(([tag, count]) => {
      if (count > mostUsedTag.count) {
        mostUsedTag = { tag, count };
      }
    });
    
    return {
      totalEntries,
      entriesThisWeek,
      longestEntry,
      mostUsedTag: mostUsedTag.tag ? mostUsedTag : null
    };
  };

  const handleMoodTabChange = (value: string) => {
    setMoodTabValue(value as "new" | "history");
  };

  // Get all unique tags from entries
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    entries.forEach(entry => {
      entry.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  };

  // Get entries for selected date
  const getEntriesForDate = (date: Date) => {
    return entries.filter(entry => 
      isSameDay(new Date(entry.createdAt), date)
    );
  };

  return (
    <Container variant="glass" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section - Full Width */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* User Profile & Title - Takes 8 columns */}
        <div className="col-span-12 md:col-span-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <span className="text-2xl font-bold text-primary">
                {/* Replace with actual user profile logic */}
                J
              </span>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                Raven Scrolls
              </h1>
              <p className="text-lg text-muted-foreground">
                Reflect, express, and track your journey
              </p>
            </div>
        </div>
      </div>
      
        {/* Quick Actions - Takes 4 columns */}
        <div className="col-span-12 md:col-span-4 flex items-center justify-end gap-3">
          <Button 
            variant="outline"
            size="lg"
            className="border-primary/20 hover:bg-primary/10"
            onClick={() => setActiveTab("mood")}
          >
            <SmilePlus className="h-5 w-5 mr-2" />
            Track Mood
          </Button>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-lg shadow-primary/20"
            onClick={() => setActiveTab("write")}
          >
            <PenLine className="h-5 w-5 mr-2" />
            New Entry
          </Button>
            </div>
      </div>

      {/* Quote Section - Full Width */}
      <Card className="col-span-12 mb-8 bg-gradient-to-br from-primary/5 via-primary/10 to-background border-none shadow-lg">
        <CardContent className="p-8 text-center">
          <blockquote className="text-2xl font-serif italic text-foreground/90 max-w-3xl mx-auto">
            "The journey of a thousand miles begins with a single step."
            </blockquote>
          <cite className="block mt-4 text-sm text-muted-foreground">— Lao Tzu</cite>
          </CardContent>
        </Card>

      {/* Navigation Tabs - Full Width */}
      <div className="grid grid-cols-12 mb-8">
        <div className="col-span-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-2xl mx-auto bg-muted/50 p-1.5 rounded-full">
              <TabsTrigger 
                value="entries" 
                className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-3"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Your Journal Entries
          </TabsTrigger>
              <TabsTrigger 
                value="write"
                className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-3"
              >
                <PenLine className="h-4 w-4 mr-2" />
                Write Entry
              </TabsTrigger>
              <TabsTrigger 
                value="mood"
                className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-3"
              >
                <SmilePlus className="h-4 w-4 mr-2" />
            Track Mood
          </TabsTrigger>
              <TabsTrigger 
                value="stats"
                className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-3"
              >
            <BarChart className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
              <TabsTrigger 
                value="calendar"
                className="flex-1 rounded-full data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all py-3"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
        </TabsList>
        
            {/* Journal Entries List View */}
            <TabsContent value="entries" className="mt-8">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12">
                  <Card className="shadow-lg">
                    <CardHeader className="border-b bg-muted/30">
                      <div className="grid grid-cols-12 gap-6">
                        {/* Search - Takes 6 columns on desktop */}
                        <div className="col-span-12 md:col-span-6">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                              placeholder="Search entries..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 bg-background"
                            />
                          </div>
                </div>
                
                        {/* Filters - Takes 6 columns on desktop */}
                        <div className="col-span-12 md:col-span-6">
                          <div className="flex gap-4 justify-end">
                            <Select value={moodFilter} onValueChange={setMoodFilter}>
                              <SelectTrigger className="w-[180px]">
                                <SmilePlus className="h-4 w-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Filter by Mood" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Moods</SelectItem>
                                {moodOptions.map(mood => (
                                  <SelectItem key={mood.value} value={mood.value}>
                                    {mood.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={tagFilter} onValueChange={setTagFilter}>
                              <SelectTrigger className="w-[180px]">
                                <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                                <SelectValue placeholder="Filter by Tag" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Tags</SelectItem>
                                {getAllTags().map(tag => (
                                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {entries.length > 0 ? (
                            entries.map(entry => (
                              <Card key={entry.id} className="border border-border/50">
                                <CardContent className="p-6">
                                  <div className="grid grid-cols-12 gap-6">
                                    {/* Entry Header - Takes 8 columns */}
                                    <div className="col-span-12 md:col-span-8">
                                      <div className="flex items-start gap-4">
                                        <div className="shrink-0">
                                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                                            <span className="text-xs text-primary font-medium">
                                              {format(new Date(entry.createdAt), "MMM")}
                                            </span>
                                            <span className="text-lg font-bold text-primary">
                                              {format(new Date(entry.createdAt), "d")}
                                            </span>
                      </div>
                    </div>
                                        <div className="flex-1 min-w-0">
                                          <h3 className="text-lg font-semibold mb-1">{entry.title}</h3>
                                          <p className="text-sm text-muted-foreground line-clamp-2">
                                            {entry.content}
                                          </p>
                                        </div>
                                      </div>
                </div>
                
                                    {/* Entry Metadata - Takes 4 columns */}
                                    <div className="col-span-12 md:col-span-4">
                                      <div className="flex flex-wrap items-start justify-end gap-2">
                                        <Badge 
                                          variant="secondary"
                                          className={`${
                                            moodOptions.find(m => m.value === entry.mood)?.color
                                          } text-white`}
                                        >
                                          {entry.mood}
                                        </Badge>
                                        {entry.tags.map(tag => (
                                          <Badge key={tag} variant="outline">
                                            {tag}
                      </Badge>
                    ))}
                  </div>
                  </div>
                </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <div className="text-center py-16">
                              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <PenLine className="h-8 w-8 text-primary" />
                              </div>
                              <h3 className="text-xl font-medium mb-3">No journal entries yet</h3>
                              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                Start your journaling journey by writing your first entry
                              </p>
                              <Button 
                                size="lg"
                                onClick={() => setActiveTab("write")}
                                className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
                              >
                                <PenLine className="h-5 w-5 mr-2" />
                                Write Your First Entry
                    </Button>
                            </div>
                  )}
                </div>
                      </ScrollArea>
            </CardContent>
          </Card>
                </div>
              </div>
        </TabsContent>
        
            {/* Write Entry View */}
            <TabsContent value="write" className="mt-8">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8">
                  <Card className="shadow-lg">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle className="text-2xl">Write New Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <Input
                            placeholder="Entry Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-lg font-medium bg-background/50 border-none focus-visible:ring-1"
                          />
                        </div>
                        <Textarea
                          placeholder="Write your thoughts..."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="min-h-[400px] bg-background/50 border-none focus-visible:ring-1 resize-none"
                        />
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Mood Selection Card */}
                  <Card className="shadow-lg">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle className="text-lg">How are you feeling?</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-3 gap-4">
                        {moodOptions.map(mood => (
                          <Button
                            key={mood.value}
                            type="button"
                            variant="outline"
                            className={`h-20 flex flex-col items-center justify-center gap-2 ${
                              selectedMood === mood.value ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedMood(mood.value)}
                          >
                            <div className={`w-8 h-8 rounded-full ${mood.color} flex items-center justify-center`}>
                              <SmilePlus className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm">{mood.label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Save Button */}
                  <Button 
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:opacity-90 shadow-lg shadow-primary/20"
                    size="lg"
                    disabled={!title.trim() || !content.trim() || !selectedMood}
                  >
                    Save Entry
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Mood Tracking View */}
            <TabsContent value="mood" className="mt-8">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12">
                  <Card className="shadow-lg">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle className="text-2xl">Track Your Mood</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {moodOptions.map(mood => (
                          <Button 
                            key={mood.value}
                            variant="outline"
                            className={`h-32 flex flex-col items-center justify-center gap-3 hover:bg-muted/50 ${
                              selectedMood === mood.value ? 'ring-2 ring-primary' : ''
                            }`}
                            onClick={() => {
                              setSelectedMood(mood.value);
                              const newEntry = {
                                id: Date.now().toString(),
                                title: `Mood Entry - ${format(new Date(), 'MMMM d, yyyy')}`,
                                content: `Feeling ${mood.label} today.`,
                                mood: mood.value,
                                tags: ['mood-tracker'],
                                createdAt: new Date().toISOString()
                              };
                              const updatedEntries = [newEntry, ...entries];
                              setEntries(updatedEntries);
                              localStorage.setItem('journal', JSON.stringify(updatedEntries));
                              toast({
                                title: "Mood Tracked",
                                description: "Your mood has been recorded successfully."
                              });
                              setActiveTab('entries');
                            }}
                          >
                            <div className={`w-16 h-16 rounded-full ${mood.color} flex items-center justify-center`}>
                              <SmilePlus className="h-8 w-8 text-white" />
                            </div>
                            <span className="text-lg font-medium">{mood.label}</span>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Stats View */}
            <TabsContent value="stats" className="mt-8">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-12 lg:col-span-8">
                  <Card className="shadow-lg">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle className="text-2xl">Your Journaling Stats</CardTitle>
            </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-8">
                        {/* Placeholder for charts */}
                        <div className="h-[300px] bg-muted/20 rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">Mood trends chart coming soon</p>
                            </div>
                        <div className="h-[300px] bg-muted/20 rounded-lg flex items-center justify-center">
                          <p className="text-muted-foreground">Entry frequency chart coming soon</p>
                          </div>
                        </div>
                    </CardContent>
                  </Card>
                        </div>
                        
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  {/* Quick Stats Cards */}
                  <Card className="shadow-lg">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Entries</span>
                          <span className="text-2xl font-semibold">{entries.length}</span>
                              </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">This Month</span>
                          <span className="text-2xl font-semibold">0</span>
                            </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Streak</span>
                          <span className="text-2xl font-semibold">0 days</span>
                          </div>
                        </div>
                    </CardContent>
                  </Card>

                  {/* Most Used Tags */}
                  <Card className="shadow-lg">
                    <CardHeader className="border-b bg-muted/30">
                      <CardTitle className="text-lg">Most Used Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap gap-2">
                        {getAllTags().map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                              </div>
            </CardContent>
          </Card>
                </div>
              </div>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-8">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-4">
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg">Calendar</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      hasEntry: (date) => entries.some(entry => 
                        isSameDay(new Date(entry.createdAt), date)
                      )
                    }}
                    modifiersStyles={{
                      hasEntry: { 
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                        color: "hsl(var(--primary))",
                        fontWeight: "bold"
                      }
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-muted/30">
                  <CardTitle className="text-lg">
                    Entries for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Selected Date'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      {selectedDate && getEntriesForDate(selectedDate).map(entry => (
                        <Card 
                          key={entry.id} 
                          className="border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            setSelectedEntry(entry);
                            setIsEntryDialogOpen(true);
                          }}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold mb-2">{entry.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                              </div>
                              <Badge variant="secondary" className={`${
                                moodOptions.find(m => m.value === entry.mood)?.color
                              } text-white ml-4`}>
                                {entry.mood}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {selectedDate && getEntriesForDate(selectedDate).length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No entries for this date</p>
                          <Button 
                            onClick={() => setActiveTab("write")} 
                            className="mt-4"
                            variant="outline"
                          >
                            <PenLine className="h-4 w-4 mr-2" />
                            Write New Entry
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent className="sm:max-w-[800px] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b">
            <DialogTitle className="text-2xl font-semibold">
              {selectedEntry?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span>{selectedEntry ? format(new Date(selectedEntry.createdAt), "MMMM d, yyyy 'at' h:mm a") : ""}</span>
              {selectedEntry?.mood && (
                <>
                  <span className="mx-1">•</span>
                  <Badge variant="secondary" className={`${
                    moodOptions.find(m => m.value === selectedEntry.mood)?.color
                  } text-white`}>
                    {selectedEntry.mood}
                  </Badge>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4">
            {selectedEntry?.tags && selectedEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedEntry.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="px-2 py-1">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {selectedEntry?.content}
              </p>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-muted/30">
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  setIsEntryDialogOpen(false);
                  handleEditEntry(selectedEntry as JournalEntry);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Entry
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

// Main Journal component with error boundary
const Journal = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the state here
        window.location.reload();
      }}
    >
      <JournalContent />
    </ErrorBoundary>
  );
};

export default Journal;
