import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  MOODS, 
  MOOD_TAGS, 
  getMoodDescription, 
  saveMoodEntry,
  getMoodBackgroundColor,
  MoodEntry
} from "@/utils/moodUtils";

interface MoodTrackerProps {
  onMoodLogged: (entry: MoodEntry) => void;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ onMoodLogged }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [lastLogged, setLastLogged] = useState<Date | null>(null);
  const [canLogToday, setCanLogToday] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user already logged mood today
    const moodEntries = localStorage.getItem("moodEntries");
    if (moodEntries) {
      try {
        const entries: MoodEntry[] = JSON.parse(moodEntries);
        if (entries.length > 0) {
          // Sort entries by timestamp in descending order
          const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
          const latestEntry = sortedEntries[0];
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const latestDate = new Date(latestEntry.date);
          latestDate.setHours(0, 0, 0, 0);
          
          if (latestDate.getTime() === today.getTime()) {
            setLastLogged(new Date(latestEntry.date));
            // They already logged today, but we'll still allow them to log again
            // Just show a message that they've already logged today
            setCanLogToday(true);
          }
        }
      } catch (error) {
        console.error("Error parsing mood entries:", error);
      }
    }
  }, []);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    if (!selectedMood) {
      toast({
        title: "Mood Required",
        description: "Please select a mood before saving.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const entry: MoodEntry = {
      id: uuidv4(),
      mood: selectedMood,
      note: note.trim(),
      tags: selectedTags,
      date: now.toISOString().split('T')[0],
      timestamp: now.getTime(),
    };

    saveMoodEntry(entry);
    
    toast({
      title: "Mood Logged",
      description: "Your mood has been logged successfully.",
    });

    setLastLogged(now);
    setSelectedMood(null);
    setNote("");
    setSelectedTags([]);
    onMoodLogged(entry);
  };

  return (
    <Card className="w-full shadow-sm border-border/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Daily Mood Check-in</CardTitle>
        <CardDescription>
          {lastLogged 
            ? `Last logged: ${lastLogged.toLocaleDateString()}`
            : "Track how you're feeling today"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mood Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium mb-1">How are you feeling today?</h3>
            <div className="flex flex-wrap justify-between gap-2">
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood.value;
                const Icon = mood.icon;
                return (
                  <Button
                    key={mood.value}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "flex-1 min-w-[80px] py-6 flex flex-col items-center gap-2",
                      isSelected && getMoodBackgroundColor(mood.value)
                    )}
                    onClick={() => handleMoodSelect(mood.value)}
                  >
                    <Icon className={cn("h-8 w-8", !isSelected && "text-muted-foreground")} />
                    <span>{mood.label}</span>
                  </Button>
                );
              })}
            </div>
            
            {selectedMood && (
              <p className="text-sm text-muted-foreground pt-1 px-1 italic">
                {getMoodDescription(selectedMood)}
              </p>
            )}
          </div>
          
          {/* Mood Tags */}
          {selectedMood && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">What's influencing your mood? (Optional)</h3>
              <div className="flex flex-wrap gap-2">
                {MOOD_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.value);
                  const Icon = tag.icon;
                  return (
                    <Badge
                      key={tag.value}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "px-3 py-1 cursor-pointer hover:bg-accent",
                        isSelected && "hover:bg-primary/90"
                      )}
                      onClick={() => handleTagToggle(tag.value)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {tag.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Notes */}
          {selectedMood && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Additional Notes (Optional)</h3>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add some details about how you're feeling..."
                className="min-h-[80px]"
              />
            </div>
          )}
          
          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedMood}
              className="w-full"
            >
              Log Mood
            </Button>
            {!canLogToday && lastLogged && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                You've already logged a mood today, but you can update it if you want.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodTracker;
