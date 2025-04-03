import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, PaintBucket, Image, Type } from "lucide-react";
import { HexColorPicker } from "@/components/ThemeBuilder/HexColorPicker";
import { ThemePreview } from "@/components/ThemeBuilder/ThemePreview";

// Add a utility function to check if a color is dark
const isDarkColor = (hex: string): boolean => {
  // Remove the hash symbol if it exists
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  // Using the formula: 0.299*R + 0.587*G + 0.114*B
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if the color is dark (luminance < 0.5)
  return luminance < 0.5;
};

const CustomThemes = () => {
  const { toast } = useToast();
  const { customThemes, addCustomTheme, removeCustomTheme, changeTheme, currentTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState("create");
  const [themeName, setThemeName] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [font, setFont] = useState("");
  
  const [colors, setColors] = useState({
    background: "#ffffff",
    foreground: "#1a1a1a",
    primary: "#4CAF50",
    secondary: "#f5f5f5",
    card: "#ffffff",
    cardForeground: "#1a1a1a",
    border: "#e0e0e0",
    muted: "#f5f5f5",
    accent: "#4CAF50"
  });
  
  const [editingTheme, setEditingTheme] = useState<string | null>(null);
  
  const resetForm = () => {
    setThemeName("");
    setBackgroundImage("");
    setFont("");
    setColors({
      background: "#ffffff",
      foreground: "#1a1a1a",
      primary: "#4CAF50",
      secondary: "#f5f5f5",
      card: "#ffffff",
      cardForeground: "#1a1a1a",
      border: "#e0e0e0",
      muted: "#f5f5f5",
      accent: "#4CAF50"
    });
    setEditingTheme(null);
  };
  
  const handleEditTheme = (themeName: string) => {
    const theme = customThemes.find(t => t.name === themeName);
    if (theme) {
      setThemeName(theme.name);
      if (theme.colors) {
        setColors({
          background: theme.colors.background,
          foreground: theme.colors.foreground,
          primary: theme.colors.primary,
          secondary: theme.colors.secondary,
          card: theme.colors.card,
          cardForeground: theme.colors.cardForeground,
          border: theme.colors.border,
          muted: theme.colors.muted,
          accent: theme.colors.accent
        });
      }
      setBackgroundImage(theme.backgroundImage || "");
      setFont(theme.font || "");
      setEditingTheme(themeName);
      setActiveTab("create");
    }
  };
  
  const handleSaveTheme = () => {
    if (!themeName.trim()) {
      toast({
        title: "Theme name required",
        description: "Please enter a name for your theme.",
        variant: "destructive"
      });
      return;
    }
    
    const newTheme = {
      name: themeName,
      colors,
      backgroundImage: backgroundImage || undefined,
      font: font || undefined,
      isDark: isDarkColor(colors.background),
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.accent,
      background: colors.background,
      text: colors.foreground
    };
    
    addCustomTheme(newTheme);
    
    toast({
      title: editingTheme ? "Theme updated" : "Theme created",
      description: editingTheme ? 
        `Your theme "${themeName}" has been updated.` : 
        `Your new theme "${themeName}" has been created.`
    });
    
    resetForm();
    setActiveTab("browse");
  };
  
  const handleDeleteTheme = (themeName: string) => {
    removeCustomTheme(themeName);
    
    toast({
      title: "Theme deleted",
      description: `Theme "${themeName}" has been deleted.`
    });
  };
  
  const handleApplyTheme = (themeName: string) => {
    changeTheme(`custom-${themeName}`);
    
    toast({
      title: "Theme applied",
      description: `Theme "${themeName}" has been applied.`
    });
  };
  
  const handleColorChange = (colorKey: keyof typeof colors, value: string) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Custom Themes</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={resetForm}>Reset</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Theme</TabsTrigger>
          <TabsTrigger value="browse">Browse Themes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editingTheme ? "Edit Theme" : "Create New Theme"}</CardTitle>
              <CardDescription>
                {editingTheme ? 
                  "Modify your custom theme with colors, background images, and fonts." : 
                  "Design your own theme with custom colors, background images, and fonts."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="theme-name">Theme Name</Label>
                  <Input 
                    id="theme-name" 
                    placeholder="My Custom Theme" 
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="background-image">Background Image URL (optional)</Label>
                  <Input 
                    id="background-image" 
                    placeholder="https://example.com/image.jpg" 
                    value={backgroundImage}
                    onChange={(e) => setBackgroundImage(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="font">Font Family (optional)</Label>
                  <Input 
                    id="font" 
                    placeholder="Arial, sans-serif" 
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label className="mb-3 block">Theme Colors</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="background-color" className="text-sm">Background</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: colors.background }} />
                          <Input
                            id="background-color"
                            value={colors.background}
                            onChange={(e) => handleColorChange("background", e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <HexColorPicker 
                          color={colors.background} 
                          onChange={(color) => handleColorChange("background", color)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="foreground-color" className="text-sm">Foreground (Text)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: colors.foreground }} />
                          <Input
                            id="foreground-color"
                            value={colors.foreground}
                            onChange={(e) => handleColorChange("foreground", e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <HexColorPicker 
                          color={colors.foreground} 
                          onChange={(color) => handleColorChange("foreground", color)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="primary-color" className="text-sm">Primary</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: colors.primary }} />
                          <Input
                            id="primary-color"
                            value={colors.primary}
                            onChange={(e) => handleColorChange("primary", e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <HexColorPicker 
                          color={colors.primary} 
                          onChange={(color) => handleColorChange("primary", color)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="secondary-color" className="text-sm">Secondary</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: colors.secondary }} />
                          <Input
                            id="secondary-color"
                            value={colors.secondary}
                            onChange={(e) => handleColorChange("secondary", e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <HexColorPicker 
                          color={colors.secondary} 
                          onChange={(color) => handleColorChange("secondary", color)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="card-color" className="text-sm">Card Background</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: colors.card }} />
                          <Input
                            id="card-color"
                            value={colors.card}
                            onChange={(e) => handleColorChange("card", e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <HexColorPicker 
                          color={colors.card} 
                          onChange={(color) => handleColorChange("card", color)}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="accent-color" className="text-sm">Accent</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-6 w-6 rounded-md border" style={{ backgroundColor: colors.accent }} />
                          <Input
                            id="accent-color"
                            value={colors.accent}
                            onChange={(e) => handleColorChange("accent", e.target.value)}
                            className="font-mono"
                          />
                        </div>
                        <HexColorPicker 
                          color={colors.accent} 
                          onChange={(color) => handleColorChange("accent", color)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSaveTheme}>
                {editingTheme ? "Update Theme" : "Save Theme"}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Theme Preview</CardTitle>
              <CardDescription>See how your theme will look.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemePreview 
                colors={colors} 
                backgroundImage={backgroundImage}
                font={font}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="browse">
          {customThemes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">You haven't created any custom themes yet.</p>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Theme
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customThemes.map((theme) => (
                <Card key={theme.name} className="overflow-hidden">
                  <div 
                    className="h-32 w-full" 
                    style={{ 
                      background: theme.backgroundImage ? `url(${theme.backgroundImage}) center/cover no-repeat` : theme.colors.background,
                      position: 'relative' 
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="h-16 w-16 rounded-full border-4" 
                        style={{ 
                          backgroundColor: theme.colors.primary,
                          borderColor: theme.colors.card 
                        }}
                      />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{theme.name}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(theme.colors).slice(0, 5).map(([key, color]) => (
                        <div 
                          key={key}
                          className="h-4 w-4 rounded-full border"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                    </div>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditTheme(theme.name)}
                      >
                        <PaintBucket className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteTheme(theme.name)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleApplyTheme(theme.name)}
                      disabled={currentTheme === `custom-${theme.name}`}
                    >
                      {currentTheme === `custom-${theme.name}` ? "Active" : "Apply"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomThemes;
