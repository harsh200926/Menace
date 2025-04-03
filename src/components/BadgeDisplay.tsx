import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, Check, Lock, Trophy, Medal, Target, Brain, Heart, 
  Flame, Zap, Star, Sparkles, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAchievements } from '@/context/AchievementContext';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export function BadgeDisplay() {
  const { achievements } = useAchievements();
  const [badges, setBadges] = useState<Badge[]>([]);
  
  // Initialize badges and check which ones are unlocked
  useEffect(() => {
    // Define all available badges with their unlock conditions
    const allBadges: Badge[] = [
      {
        id: 'first-task',
        name: 'First Steps',
        description: 'Created your first task',
        icon: <Check className="h-6 w-6" />,
        color: 'bg-green-500',
        unlocked: false
      },
      {
        id: 'task-master',
        name: 'Task Master',
        description: 'Completed 10 tasks',
        icon: <Trophy className="h-6 w-6" />,
        color: 'bg-amber-500',
        unlocked: false
      },
      {
        id: 'productivity-guru',
        name: 'Productivity Guru',
        description: 'Completed 50 tasks',
        icon: <Zap className="h-6 w-6" />,
        color: 'bg-purple-500',
        unlocked: false
      },
      {
        id: 'goal-setter',
        name: 'Goal Setter',
        description: 'Created your first goal',
        icon: <Target className="h-6 w-6" />,
        color: 'bg-blue-500',
        unlocked: false
      },
      {
        id: 'achiever',
        name: 'Achiever',
        description: 'Completed 5 goals',
        icon: <Medal className="h-6 w-6" />,
        color: 'bg-yellow-500',
        unlocked: false
      },
      {
        id: 'focus-hero',
        name: 'Focus Hero',
        description: 'Used focus mode for 10 hours total',
        icon: <Brain className="h-6 w-6" />,
        color: 'bg-indigo-500',
        unlocked: false
      },
      {
        id: 'streak-starter',
        name: 'Streak Starter',
        description: 'Maintained a 3-day streak',
        icon: <Flame className="h-6 w-6" />,
        color: 'bg-red-500',
        unlocked: false
      },
      {
        id: 'consistency-king',
        name: 'Consistency King',
        description: 'Maintained a 7-day streak',
        icon: <Star className="h-6 w-6" />,
        color: 'bg-orange-500',
        unlocked: false
      },
      {
        id: 'early-bird',
        name: 'Early Bird',
        description: 'Completed 5 tasks before 9am',
        icon: <Clock className="h-6 w-6" />,
        color: 'bg-cyan-500',
        unlocked: false
      },
      {
        id: 'theme-explorer',
        name: 'Theme Explorer',
        description: 'Tried 5 different themes',
        icon: <Sparkles className="h-6 w-6" />,
        color: 'bg-pink-500',
        unlocked: false
      }
    ];
    
    // Update badges with unlocked status from achievements
    const updatedBadges = allBadges.map(badge => {
      const achievement = achievements.find(a => a.id === badge.id);
      return {
        ...badge,
        unlocked: achievement ? achievement.completed : false,
        unlockedAt: achievement?.completedAt
      };
    });
    
    setBadges(updatedBadges);
  }, [achievements]);
  
  // Split badges into unlocked and locked
  const unlockedBadges = badges.filter(badge => badge.unlocked);
  const lockedBadges = badges.filter(badge => !badge.unlocked);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5" />
          Earned Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {unlockedBadges.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {unlockedBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  className="flex flex-col items-center text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <div className={`${badge.color} text-white p-3 rounded-full mb-2`}>
                    {badge.icon}
                  </div>
                  <p className="font-medium text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  {badge.unlockedAt && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Earned: {new Date(badge.unlockedAt).toLocaleDateString()}
                    </Badge>
                  )}
                </motion.div>
              ))}
            </div>
            
            {lockedBadges.length > 0 && (
              <>
                <h3 className="text-sm font-medium mb-3">Locked Badges</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 opacity-60">
                  {lockedBadges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center text-center">
                      <div className="bg-muted text-muted-foreground p-3 rounded-full mb-2 relative">
                        <Lock className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-sm">{badge.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Award className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-1">No badges earned yet</h3>
            <p className="text-sm text-muted-foreground max-w-[320px]">
              Complete tasks, reach goals, and maintain streaks to earn badges and track your progress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 