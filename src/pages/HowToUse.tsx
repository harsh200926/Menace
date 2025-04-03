import { Container } from "@/components/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  CalendarDays, 
  CheckCircle2, 
  Target, 
  HeartPulse, 
  Flame, 
  ImageDown, 
  LineChart,
  FileText,
  BookText,
  UserCircle,
  Settings,
  AlertTriangle,
  Info,
  Sparkles,
  Calendar,
  ListTodo,
  Trophy,
  Brain,
  BarChart3,
  Palette
} from "lucide-react";

const HowToUse = () => {
  return (
    <Container>
      <div className="pb-6 mb-6 border-b">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Tome of Wisdom</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Your comprehensive guide to mastering the art of personal growth and productivity
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Core Features</TabsTrigger>
          <TabsTrigger value="growth">Personal Growth</TabsTrigger>
          <TabsTrigger value="tracking">Progress Tracking</TabsTrigger>
          <TabsTrigger value="settings">Customization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Journey</CardTitle>
              <CardDescription>
                Embark on a path of self-improvement and achievement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                This application is designed to be your companion on the journey of personal development
                and productivity enhancement. Whether you're focusing on daily tasks, long-term goals,
                or building lasting habits, you'll find the tools you need to succeed.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <Card className="bg-primary/5 border-primary/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Achievement System
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Track your progress and earn rewards as you accomplish your goals
              </p>
            </CardContent>
          </Card>

                <Card className="bg-primary/5 border-primary/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Smart Insights
                </CardTitle>
              </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Get personalized recommendations based on your habits and progress
                    </p>
              </CardContent>
            </Card>

                <Card className="bg-primary/5 border-primary/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Progress Analytics
                </CardTitle>
              </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Visualize your journey with detailed charts and statistics
                </p>
              </CardContent>
            </Card>
          </div>

              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  Sign in to unlock cloud synchronization and access your data across all your devices.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Task Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="create-task">
                    <AccordionTrigger>Creating Tasks</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>1. Navigate to the Quests section</p>
                      <p>2. Click the "+" button or use the quick-add shortcut (Ctrl/Cmd + N)</p>
                      <p>3. Enter task details and optional due date</p>
                      <p>4. Add tags or categories for better organization</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="organize-tasks">
                    <AccordionTrigger>Organization Tips</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>• Use categories to group related tasks</p>
                      <p>• Set priorities with high/medium/low flags</p>
                      <p>• Break down large tasks into subtasks</p>
                      <p>• Use the drag-and-drop interface to reorder</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goal Setting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="smart-goals">
                    <AccordionTrigger>SMART Goals</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>• Specific: Clear and well-defined objectives</p>
                      <p>• Measurable: Track progress with numbers</p>
                      <p>• Achievable: Realistic and attainable</p>
                      <p>• Relevant: Aligned with your values</p>
                      <p>• Time-bound: Set deadlines</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="tracking">
                    <AccordionTrigger>Progress Tracking</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>• Update progress regularly</p>
                      <p>• View progress in charts and graphs</p>
                      <p>• Set milestones for long-term goals</p>
                      <p>• Celebrate achievements</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5" />
                  Habit Building
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="habit-creation">
                    <AccordionTrigger>Creating Habits</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>1. Choose a specific habit to develop</p>
                      <p>2. Set a realistic frequency (daily/weekly)</p>
                      <p>3. Start small and build gradually</p>
                      <p>4. Track your streak</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="habit-tips">
                    <AccordionTrigger>Success Tips</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>• Stack habits with existing routines</p>
                      <p>• Set reminders at specific times</p>
                      <p>• Focus on consistency over perfection</p>
                      <p>• Review and adjust as needed</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Calendar & Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  <AccordionItem value="planning">
                    <AccordionTrigger>Effective Planning</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>• Plan your week in advance</p>
                      <p>• Block time for important tasks</p>
                      <p>• Set realistic deadlines</p>
                      <p>• Review and adjust regularly</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="integration">
                    <AccordionTrigger>Calendar Integration</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p>• Sync with external calendars</p>
                      <p>• View tasks and events together</p>
                      <p>• Set up recurring events</p>
                      <p>• Get smart scheduling suggestions</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle>Personal Development Tools</CardTitle>
              <CardDescription>
                Track your journey of growth and improvement
              </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Journaling</h3>
                  <p className="text-muted-foreground">
                    Record your thoughts, reflections, and experiences to gain insights and track your personal growth.
                  </p>
                  <ul className="space-y-2 ml-4 list-disc text-sm">
                    <li>Daily reflections</li>
                    <li>Gratitude entries</li>
                    <li>Progress notes</li>
                    <li>Mood tracking</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Memory Wall</h3>
                  <p className="text-muted-foreground">
                    Capture and organize meaningful moments with photos and notes.
                  </p>
                  <ul className="space-y-2 ml-4 list-disc text-sm">
                    <li>Photo uploads</li>
                    <li>Memory tagging</li>
                    <li>Timeline view</li>
                    <li>Collections</li>
                  </ul>
                </div>
              </div>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle>Progress Analytics</CardTitle>
              <CardDescription>
                Visualize and understand your journey
              </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Metrics</h3>
                  <ul className="space-y-2 ml-4 list-disc text-sm">
                    <li>Task completion rates</li>
                    <li>Habit streaks</li>
                    <li>Goal progress</li>
                    <li>Time tracking</li>
                    <li>Productivity scores</li>
                </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Insights</h3>
                  <ul className="space-y-2 ml-4 list-disc text-sm">
                    <li>Weekly/monthly reports</li>
                    <li>Trend analysis</li>
                    <li>Performance patterns</li>
                    <li>Achievement highlights</li>
                </ul>
                </div>
              </div>
              </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personalization
                </CardTitle>
              <CardDescription>
                Make the application truly yours
              </CardDescription>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Theme Options</h3>
                  <ul className="space-y-2 ml-4 list-disc text-sm">
                    <li>Light and dark modes</li>
                    <li>Custom accent colors</li>
                    <li>Font preferences</li>
                    <li>Layout options</li>
                </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Preferences</h3>
                  <ul className="space-y-2 ml-4 list-disc text-sm">
                    <li>Notification settings</li>
                    <li>Display options</li>
                    <li>Language selection</li>
                    <li>Data synchronization</li>
                </ul>
                </div>
              </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </Container>
  );
};

export default HowToUse; 