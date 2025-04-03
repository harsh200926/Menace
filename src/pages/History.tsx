import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HistoryItem {
  id: string;
  type: "habit" | "goal" | "note" | "journal";
  action: "created" | "updated" | "deleted" | "completed";
  name: string;
  timestamp: string;
}

const History = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem("history");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      // Add some demo history if none exists
      const demoHistory: HistoryItem[] = [
        {
          id: "1",
          type: "habit",
          action: "created",
          name: "Morning Meditation",
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        },
        {
          id: "2",
          type: "habit",
          action: "completed",
          name: "Morning Meditation",
          timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
        },
        {
          id: "3",
          type: "goal",
          action: "created",
          name: "Learn Spanish",
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
        {
          id: "4",
          type: "note",
          action: "created",
          name: "Project Ideas",
          timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        },
        {
          id: "5",
          type: "note",
          action: "updated",
          name: "Project Ideas",
          timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
        },
        {
          id: "6",
          type: "journal",
          action: "created",
          name: "Daily Reflection",
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        }
      ];
      setHistory(demoHistory);
      localStorage.setItem("history", JSON.stringify(demoHistory));
    }
  }, []);

  const filteredHistory = activeTab === "all" 
    ? history 
    : history.filter(item => item.type === activeTab);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case "created": return "text-green-500";
      case "updated": return "text-blue-500";
      case "deleted": return "text-red-500";
      case "completed": return "text-purple-500";
      default: return "";
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.setItem("history", JSON.stringify([]));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tale Of The Pasts</h1>
        <Button variant="destructive" onClick={clearHistory}>Clear History</Button>
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="habit">Habits</TabsTrigger>
          <TabsTrigger value="goal">Goals</TabsTrigger>
          <TabsTrigger value="note">Notes</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
        </TabsList>
      
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{formatDate(item.timestamp)}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className={getActionColor(item.action)}>
                              {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                            </TableCell>
                            <TableCell className="capitalize">{item.type}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="habit">
          <Card>
            <CardHeader>
              <CardTitle>Habits Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.filter(item => item.type === "habit").length > 0 ? (
                      history
                        .filter(item => item.type === "habit")
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{formatDate(item.timestamp)}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className={getActionColor(item.action)}>
                              {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                            </TableCell>
                            <TableCell className="capitalize">{item.type}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No habit history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="goal">
          <Card>
            <CardHeader>
              <CardTitle>Goals Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.filter(item => item.type === "goal").length > 0 ? (
                      history
                        .filter(item => item.type === "goal")
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{formatDate(item.timestamp)}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className={getActionColor(item.action)}>
                              {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                            </TableCell>
                            <TableCell className="capitalize">{item.type}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No goal history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="note">
          <Card>
            <CardHeader>
              <CardTitle>Notes Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.filter(item => item.type === "note").length > 0 ? (
                      history
                        .filter(item => item.type === "note")
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{formatDate(item.timestamp)}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className={getActionColor(item.action)}>
                              {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                            </TableCell>
                            <TableCell className="capitalize">{item.type}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No note history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="journal">
          <Card>
            <CardHeader>
              <CardTitle>Journal Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] scrollbar-hide">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.filter(item => item.type === "journal").length > 0 ? (
                      history
                        .filter(item => item.type === "journal")
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{formatDate(item.timestamp)}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className={getActionColor(item.action)}>
                              {item.action.charAt(0).toUpperCase() + item.action.slice(1)}
                            </TableCell>
                            <TableCell className="capitalize">{item.type}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No journal history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default History;
