import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Heart, Image, Plus, Quote } from "lucide-react";
import { motion } from "framer-motion";

interface Memory {
  id: string;
  title: string;
  description: string;
  date: string;
  image?: string;
  tags: string[];
  isSpecial: boolean;
}

const MemoryBoardWidget = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load memories from localStorage
    const savedMemories = localStorage.getItem("memories");
    if (savedMemories) {
      setMemories(JSON.parse(savedMemories));
    } else {
      // Initialize with a welcome memory if none exist
      const initialMemory = {
        id: "welcome-memory",
        title: "Your First Memory",
        description: "Welcome to your Memory Board. This is where you can store your most cherished moments and memories. Add photos, quotes, and feelings to preserve them forever.",
        date: format(new Date(), "yyyy-MM-dd"),
        tags: ["welcome", "first"],
        isSpecial: true
      };
      setMemories([initialMemory]);
      localStorage.setItem("memories", JSON.stringify([initialMemory]));
    }
  }, []);
  
  const renderMemoryPreview = (memory: Memory) => {
    return (
      <motion.div 
        key={memory.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex flex-col relative overflow-hidden rounded-lg p-4 border ${memory.isSpecial ? 'border-primary/30 bg-primary/5' : 'border-border/40 bg-card/80'} backdrop-blur-sm hover:shadow-md transition-all duration-200 h-full`}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {memory.isSpecial && <Heart size={14} className="text-primary fill-primary animate-gentle-pulse" />}
            <h3 className="font-medium text-sm line-clamp-1">{memory.title}</h3>
          </div>
          <div className="text-xs text-muted-foreground">
            {format(new Date(memory.date), "MMM d, yyyy")}
          </div>
        </div>
        
        {memory.image && (
          <div className="relative aspect-video overflow-hidden rounded-md mb-2 bg-muted/50">
            <img
              src={memory.image}
              alt={memory.title}
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {memory.description}
        </p>
        
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {memory.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-primary/10 text-primary-foreground rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <Card className="shadow-md overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="bg-primary/5 border-b border-border/20 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Image size={18} className="text-primary" />
          Memory Board
        </CardTitle>
        <CardDescription>
          Preserve your cherished moments
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {memories.length > 0 ? (
          <div className="grid-layout-2 gap-3">
            {memories.slice(0, 4).map(memory => renderMemoryPreview(memory))}
          </div>
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center text-center p-4">
            <Image className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">No memories added yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start preserving your cherished moments
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4 gap-1"
              onClick={() => navigate('/memories/new')}
            >
              <Plus size={16} />
              Add First Memory
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-card/50 border-t border-border/20 flex justify-between gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 bg-card hover:bg-card/80 gap-1"
          onClick={() => navigate('/memories/new')}
        >
          <Plus size={16} />
          New Memory
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 bg-card hover:bg-card/80"
          onClick={() => navigate('/memories')}
        >
          View All
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MemoryBoardWidget;
