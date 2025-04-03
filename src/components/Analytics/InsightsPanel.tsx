import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Insight, generateInsights, calculateProductivityScore, getRecommendations } from "@/utils/insightUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  TrendingUp, 
  Lightbulb, 
  Heart, 
  Target, 
  Calendar, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  SunMoon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface InsightsPanelProps {
  habits: any[];
  goals: any[];
  journalEntries: any[];
  moodEntries: any[];
  history: any[];
  onRefresh: () => void;
}

const InsightsPanel = ({ habits, goals, journalEntries, moodEntries, history, onRefresh }: InsightsPanelProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [productivityScore, setProductivityScore] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  
  // Generate insights when data changes
  useEffect(() => {
    if (habits.length === 0 && goals.length === 0 && journalEntries.length === 0 && moodEntries.length === 0) {
      return;
    }
    
    // Generate insights
    const generatedInsights = generateInsights(
      habits,
      goals,
      journalEntries,
      moodEntries,
      history
    );
    setInsights(generatedInsights);
    
    // Calculate productivity score
    const score = calculateProductivityScore(habits, goals, moodEntries, history);
    setProductivityScore(score);
    
    // Get recommendations
    const generatedRecommendations = getRecommendations(
      habits,
      goals,
      journalEntries,
      moodEntries,
      score
    );
    setRecommendations(generatedRecommendations);
  }, [habits, goals, journalEntries, moodEntries, history]);
  
  // Filter insights by type for tabs
  const filteredInsights = activeTab === "all" 
    ? insights 
    : insights.filter(insight => insight.type === activeTab);
  
  // Generate class for insight card based on impact
  const getInsightCardClass = (impact: string) => {
    switch (impact) {
      case "positive":
        return "border-l-green-500";
      case "negative":
        return "border-l-red-500";
      default:
        return "border-l-yellow-500";
    }
  };
  
  // Get icon for insight based on type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "productivity":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "mood":
        return <Heart className="h-5 w-5 text-pink-500" />;
      case "habit":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case "goal":
        return <Target className="h-5 w-5 text-orange-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };
  
  // Get color class for productivity score
  const getScoreColorClass = () => {
    if (productivityScore >= 80) return "text-green-500";
    if (productivityScore >= 60) return "text-blue-500";
    if (productivityScore >= 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Get progress color for productivity score
  const getProgressColor = () => {
    if (productivityScore >= 80) return "bg-green-500";
    if (productivityScore >= 60) return "bg-blue-500";
    if (productivityScore >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>Personalized Insights</CardTitle>
          </div>
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Personalized analytics and suggestions based on your activity patterns
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-6">
        {(habits.length === 0 && goals.length === 0 && journalEntries.length === 0 && moodEntries.length === 0) ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Not enough data yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start tracking your habits, goals, mood, and journal entries to receive personalized insights.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Productivity Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="col-span-1 md:col-span-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Productivity Score</CardTitle>
                  <CardDescription>
                    Based on your habits, goals, mood, and activity levels over the past week
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end space-x-2 mb-2">
                    <span className={`text-4xl font-bold ${getScoreColorClass()}`}>
                      {productivityScore}
                    </span>
                    <span className="text-muted-foreground text-sm pb-1">/100</span>
                  </div>
                  <Progress 
                    value={productivityScore} 
                    max={100} 
                    className={`h-2 ${getProgressColor()} bg-secondary`} 
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
                Recommendations
              </h3>
              <div className="space-y-2">
                {recommendations.length > 0 ? (
                  recommendations.map((recommendation, index) => (
                    <div 
                      key={index} 
                      className="flex items-start p-3 bg-secondary rounded-lg"
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-3 shrink-0" />
                      <p>{recommendation}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    Continue using the app to receive personalized recommendations
                  </div>
                )}
              </div>
            </div>
            
            {/* Insights */}
            <div>
              <h3 className="text-lg font-medium mb-3">Insights</h3>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="productivity">Productivity</TabsTrigger>
                  <TabsTrigger value="habit">Habits</TabsTrigger>
                  <TabsTrigger value="goal">Goals</TabsTrigger>
                  <TabsTrigger value="mood">Mood</TabsTrigger>
                </TabsList>
                
                <TabsContent value={activeTab} className="mt-0">
                  <ScrollArea className="h-[400px] pr-4">
                    {filteredInsights.length > 0 ? (
                      <div className="space-y-3">
                        {filteredInsights.map((insight) => (
                          <Card 
                            key={insight.id} 
                            className={`border-l-4 ${getInsightCardClass(insight.impact)}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start">
                                <div className="mr-3 mt-0.5">
                                  {getInsightIcon(insight.type)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="capitalize">
                                      {insight.type}
                                    </Badge>
                                    {insight.impact === "positive" && (
                                      <Badge variant="default" className="bg-green-500">
                                        Positive
                                      </Badge>
                                    )}
                                    {insight.impact === "negative" && (
                                      <Badge variant="default" className="bg-red-500">
                                        Needs Attention
                                      </Badge>
                                    )}
                                  </div>
                                  <p>{insight.message}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <XCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          {activeTab === "all" 
                            ? "No insights available yet. Continue using the app to generate insights."
                            : `No ${activeTab} insights available yet.`}
                        </p>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
