import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Check,
  Paintbrush,
  Download,
  Upload,
  Save,
  Database,
  FileJson,
  HardDrive,
  RefreshCw,
  Trash2,
  Palette,
  Sparkles,
  EyeOff,
  Eye,
  Layers,
  SlidersHorizontal
} from "lucide-react";
import { useTheme, themes, modernThemes, accentColors } from "@/context/ThemeContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    currentTheme, 
    changeTheme, 
    randomThemesEnabled, 
    toggleRandomThemes, 
    customThemes,
    isDark,
    toggleDarkMode,
    accentColor,
    changeAccentColor,
    useAnimations,
    toggleAnimations,
    blurEffects,
    toggleBlurEffects
  } = useTheme();
  
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("displayName") || "");
  const [notifications, setNotifications] = useState(() => {
    const savedValue = localStorage.getItem("notificationsEnabled");
    return savedValue === null ? true : savedValue === "true";
  });
  
  const [backupOpen, setBackupOpen] = useState(false);
  
  const saveSettings = () => {
    localStorage.setItem("displayName", displayName);
    localStorage.setItem("notificationsEnabled", notifications.toString());
    
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully."
    });
  };
  
  const handleThemeChange = (theme: string) => {
    changeTheme(theme);
  };
  
  const formatThemeName = (themeName: string) => {
    if (themeName.startsWith("custom-")) return themeName.substring(7);
    return themeName.charAt(0).toUpperCase() + themeName.slice(1);
  };

  // Function to export all app data
  const exportAllData = () => {
    try {
      // Collect all data from localStorage
      const appData = {
        // User preferences
        theme: localStorage.getItem('theme'),
        customThemes: localStorage.getItem('customThemes'),
        
        // User content
        journal: localStorage.getItem('journal'),
        journalTags: localStorage.getItem('journalTags'),
        todos: localStorage.getItem('todos'),
        habits: localStorage.getItem('habits'),
        goals: localStorage.getItem('goals'),
        motivationalQuotes: localStorage.getItem('motivationalQuotes'),
        
        // History and reflections
        history: localStorage.getItem('history'),
        reflections: Object.keys(localStorage)
          .filter(key => key.startsWith('reflection-'))
          .reduce((acc, key) => ({
            ...acc,
            [key]: localStorage.getItem(key)
          }), {}),
        
        // Memory board data
        memoryBoard: localStorage.getItem('memoryBoard'),
        
        // Mood tracking data
        moods: localStorage.getItem('moods'),
        
        // Export metadata
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      };
      
      // Convert to JSON and create downloadable file
      const dataStr = JSON.stringify(appData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Generate filename with timestamp
      const date = new Date();
      const timestamp = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      const filename = `warrior-journal-backup-${timestamp}.json`;
      
      // Create download link and trigger click
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup Successful",
        description: "All your data has been exported. Store this file safely.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Function to import app data
  const importAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const contents = e.target?.result as string;
          const importedData = JSON.parse(contents);
          
          // Confirm before overwriting
          if (window.confirm("This will replace all your current app data. Are you sure you want to continue?")) {
            // Clear current data (optional, can be removed if you want to merge instead)
            // Store imported data in localStorage
            if (importedData.theme) localStorage.setItem('theme', importedData.theme);
            if (importedData.customThemes) localStorage.setItem('customThemes', importedData.customThemes);
            if (importedData.journal) localStorage.setItem('journal', importedData.journal);
            if (importedData.journalTags) localStorage.setItem('journalTags', importedData.journalTags);
            if (importedData.todos) localStorage.setItem('todos', importedData.todos);
            if (importedData.habits) localStorage.setItem('habits', importedData.habits);
            if (importedData.goals) localStorage.setItem('goals', importedData.goals);
            if (importedData.motivationalQuotes) localStorage.setItem('motivationalQuotes', importedData.motivationalQuotes);
            if (importedData.history) localStorage.setItem('history', importedData.history);
            if (importedData.memoryBoard) localStorage.setItem('memoryBoard', importedData.memoryBoard);
            if (importedData.moods) localStorage.setItem('moods', importedData.moods);
            
            // Import reflections
            if (importedData.reflections) {
              Object.entries(importedData.reflections).forEach(([key, value]) => {
                if (value) localStorage.setItem(key, value as string);
              });
            }
            
            toast({
              title: "Restore Successful",
              description: "Your data has been restored. Refreshing the page...",
            });
            
            // Refresh after a short delay to apply changes
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        } catch (parseError) {
          console.error("Error parsing imported data:", parseError);
          toast({
            title: "Import Failed",
            description: "The uploaded file does not contain valid backup data.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error importing data:", error);
      toast({
        title: "Import Failed",
        description: "There was an error importing your data. Please try again.",
        variant: "destructive",
      });
    }
    
    // Clear the input to allow selecting the same file again
    event.target.value = '';
  };

  const ThemeCard = ({ theme, isSelected }: { theme: string, isSelected: boolean }) => {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative rounded-xl border p-1 cursor-pointer overflow-hidden transition-all",
          isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
        )}
        onClick={() => handleThemeChange(theme)}
      >
        <div className={cn(
          "relative flex items-center justify-center rounded-lg h-20 w-full overflow-hidden",
          theme
        )}>
          <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary/10 via-background/5 to-primary/20" />
          <div className="font-medium">{formatThemeName(theme)}</div>
          {isSelected && (
            <div className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-0.5">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
      </motion.div>
    );
  };
  
  const ColorButton = ({ color }: { color: string }) => {
    const isSelected = color === accentColor;
    
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "w-8 h-8 rounded-full relative",
          `bg-${color}-500`,
          isSelected && "ring-2 ring-offset-2 ring-offset-background"
        )}
        style={{ 
          boxShadow: isSelected ? `0 0 0 2px var(--${color}-500)` : 'none'
        }}
        onClick={() => changeAccentColor(color)}
      >
        {isSelected && (
          <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
        )}
      </motion.button>
    );
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <Button variant="outline" className="gap-2" onClick={saveSettings}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
      
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            Data Management
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Customization</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Basic Themes */}
              <div className="space-y-3">
                <Label>Basic Themes</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {themes.map((theme) => (
                    <ThemeCard 
                      key={theme} 
                      theme={theme} 
                      isSelected={currentTheme === theme} 
                    />
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Modern Themes */}
              <div className="space-y-3">
                <Label>Modern Themes</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {modernThemes.map((theme) => (
                    <ThemeCard 
                      key={theme} 
                      theme={theme} 
                      isSelected={currentTheme === theme} 
                    />
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Visual Effects */}
              <div className="space-y-3">
                <Label>Visual Effects</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-medium">Animations</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable elegant animations throughout the application
                      </p>
                    </div>
                    <Switch 
                      checked={useAnimations} 
                      onCheckedChange={toggleAnimations} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="font-medium">Blur Effects</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable glass morphism and blur effects
                      </p>
                    </div>
                    <Switch 
                      checked={blurEffects} 
                      onCheckedChange={toggleBlurEffects} 
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Theme Randomizer */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-primary" />
                    <span className="font-medium">Random Theme on Launch</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use a different theme each time you open the app
                  </p>
                </div>
                <Switch 
                  checked={randomThemesEnabled} 
                  onCheckedChange={toggleRandomThemes} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Customize your personal preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable notifications for reminders and updates
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={notifications} 
                  onCheckedChange={setNotifications}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export or import your data for backup and recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Backup Your Data
                </h3>
                <p className="text-sm text-muted-foreground">
                  Export all your data to a file for safekeeping
                </p>
                <Button
                  variant="outline"
                  onClick={exportAllData}
                  className="w-full sm:w-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex flex-col space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Restore Your Data
                </h3>
                <p className="text-sm text-muted-foreground">
                  Import previously exported data
                </p>
                <Dialog open={backupOpen} onOpenChange={setBackupOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Import Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Data</DialogTitle>
                      <DialogDescription>
                        This will replace your current data. Make sure you have a backup.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-center w-full">
                        <Label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-primary" />
                            <p className="mb-2 text-sm text-center">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              JSON file exported from this application
                            </p>
                          </div>
                          <Input
                            id="file-upload"
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={importAllData}
                            onClick={() => setBackupOpen(false)}
                          />
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setBackupOpen(false)}>
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
