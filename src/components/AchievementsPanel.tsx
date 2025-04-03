import { useState } from "react";
import { useAchievements } from "@/context/AchievementContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Flame, Award, Target, Calendar, BookText, CheckCircle2, ImageIcon, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Map achievement icons to Lucide components
const iconMap: Record<string, React.ReactNode> = {
  checkbox: <CheckCircle2 className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
  book: <BookText className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  image: <ImageIcon className="h-5 w-5" />,
  flag: <Trophy className="h-5 w-5" />,
  zap: <Flame className="h-5 w-5" />,
  palette: <Sparkles className="h-5 w-5" />,
  "trending-up": <TrendingUp className="h-5 w-5" />,
};

export function AchievementsPanel() {
  const { achievements, points, getCompletedAchievements, getNextAchievements } = useAchievements();
  const [activeTab, setActiveTab] = useState("progress");
  
  const completedAchievements = getCompletedAchievements();
  const nextAchievements = getNextAchievements();
  
  // Calculate XP progress for current level
  const calculateXPProgress = () => {
    return Math.min(100, (points.currentXP / points.nextLevelXP) * 100);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Achievements & Progress
        </CardTitle>
        <CardDescription>Track your journey and earn rewards</CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Level and XP display */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary gap-1 py-1.5 font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                Level {points.level}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {points.currentXP} / {points.nextLevelXP} XP
              </span>
            </div>
            <span className="text-xs font-medium">
              {Math.round(calculateXPProgress())}%
            </span>
          </div>
          
          <Progress value={calculateXPProgress()} className="h-2" />
        </div>
        
        {/* Streaks display */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {Object.entries(points.streaks).map(([key, streak]) => (
            <div 
              key={key}
              className="flex flex-col items-center justify-center bg-muted/50 rounded-md p-2"
            >
              <div className="text-xl font-bold">{streak.current}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {key} {streak.current > 1 ? "Days" : "Day"}
              </div>
              {streak.best > streak.current && (
                <div className="text-[10px] text-muted-foreground mt-1">
                  Best: {streak.best}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Achievements tabs */}
        <Tabs defaultValue="progress" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress" className="space-y-4">
            {nextAchievements.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No achievements in progress.
              </div>
            ) : (
              <div className="space-y-3">
                {nextAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    showProgress 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedAchievements.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No achievements completed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {completedAchievements.map((achievement) => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement} 
                    showProgress={false} 
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <AchievementCard 
                  key={achievement.id} 
                  achievement={achievement} 
                  showProgress 
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface AchievementCardProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    completedAt: string | null;
    progress: number;
    total: number;
    reward: {
      type: string;
      value: number | string;
    };
  };
  showProgress?: boolean;
}

function AchievementCard({ achievement, showProgress = true }: AchievementCardProps) {
  const isCompleted = achievement.completedAt !== null;
  const progressPercentage = (achievement.progress / achievement.total) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "border rounded-lg p-3 transition-all",
        isCompleted 
          ? "bg-primary/5 border-primary/20" 
          : "bg-card border-border hover:border-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isCompleted ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {iconMap[achievement.icon] || <Award className="h-5 w-5" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm truncate">{achievement.title}</h4>
            {isCompleted && (
              <Badge variant="outline" className="bg-primary/10 text-primary">
                Completed
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
          
          {showProgress && !isCompleted && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>{achievement.progress} / {achievement.total}</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-1.5" />
            </div>
          )}
          
          <div className="flex items-center mt-2 text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Award className="h-3.5 w-3.5" />
              Reward: {achievement.reward.type === "xp" 
                ? `${achievement.reward.value} XP` 
                : achievement.reward.type === "badge" 
                  ? `${achievement.reward.value} Badge` 
                  : `${achievement.reward.value} Theme`
              }
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 