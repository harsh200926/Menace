import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  ListChecks,
  FileText,
  LogIn,
  Calendar,
  Star,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAchievements } from "@/context/AchievementContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type StreakAchievement = {
  name: string;
  description: string;
  icon: any;
  best: number;
  current: number;
};

const Achievements = () => {
  const { streaks, points } = useAchievements();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (points?.level) {
      if (points?.level >= 10) {
        //setOpen(true);
      }
    }
  }, [points]);

  const streakAchievements: StreakAchievement[] = [
    {
      name: "Login Streak",
      description: "Consecutive days you've logged in.",
      icon: LogIn,
      best: streaks?.login.best ?? 0,
      current: streaks?.login.current ?? 0,
    },
    {
      name: "Todo Streak",
      description: "Consecutive days you've completed all your tasks.",
      icon: ListChecks,
      best: streaks?.todos.best ?? 0,
      current: streaks?.todos.current ?? 0,
    },
    {
      name: "Journal Streak",
      description: "Consecutive days you've written in your journal.",
      icon: FileText,
      best: streaks?.journal.best ?? 0,
      current: streaks?.journal.current ?? 0,
    },
    {
      name: "Habit Streak",
      description: "Consecutive days you've completed your habits.",
      icon: Calendar,
      best: streaks?.habits.best ?? 0,
      current: streaks?.habits.current ?? 0,
    },
  ];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Decorative SVG Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-background/50 to-background/90" />

        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-drift-slow" />

        {/* Decorative patterns */}
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-[0.02] bg-repeat" />
        <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-[0.05] bg-repeat" />

        {/* Accent elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />

        {/* Sword patterns in background */}
        <div className="absolute inset-0 bg-[url('/images/swords-pattern.svg')] opacity-[0.02] bg-repeat rotate-45 scale-50" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Achievements</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-primary to-primary/90 hover:opacity-90"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Rewards
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Congratulations</DialogTitle>
                <DialogDescription>
                  You reached level 10 and you are now a true warrior.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button type="submit" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          Here are some of your achievements.
        </p>
        <Card className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{points?.level}</div>
              <div>
                <span className="text-sm text-muted-foreground">Level</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streakAchievements.map((achievement, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm border-0"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {achievement.icon({ className: "w-4 h-4 text-primary" })}
                  {achievement.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {achievement.current}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                      Current
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "w-fit",
                        achievement.current === achievement.best &&
                          "bg-green-500 text-white border-green-500"
                      )}
                    >
                      Best: {achievement.best}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardDescription>{achievement.description}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;