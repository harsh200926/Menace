import { Check, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme, THEMES, ThemeType, ACCENTS, AccentType } from "@/context/theme";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

export function ThemeSelector() {
  const { theme, setTheme, accent, setAccent } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          {theme === 'crystal' || theme === 'arctic' || theme === 'sunset' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel className="flex items-center">
          <Sparkles className="mr-2 h-4 w-4" />
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="themes" className="flex-1">Themes</TabsTrigger>
            <TabsTrigger value="accents" className="flex-1">Accents</TabsTrigger>
          </TabsList>
          <TabsContent value="themes" className="space-y-1 mt-2">
            {(Object.entries(THEMES) as [ThemeType, string][]).map(([themeKey, themeDescription]) => (
              <DropdownMenuItem
                key={themeKey}
                className="flex items-center justify-between gap-2"
                onClick={() => setTheme(themeKey)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border ${themeKey}`}></div>
                  <span>{themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}</span>
                </div>
                {theme === themeKey && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </TabsContent>
          <TabsContent value="accents" className="mt-2">
            <div className="grid grid-cols-5 gap-1 mb-2">
              {(Object.keys(ACCENTS) as AccentType[]).map((accentKey) => (
                <div 
                  key={accentKey}
                  className={`w-8 h-8 rounded-full cursor-pointer accent-${accentKey} bg-primary flex items-center justify-center`}
                  onClick={() => setAccent(accentKey)}
                >
                  {accent === accentKey && <Check className="h-4 w-4 text-primary-foreground" />}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ThemeCard() {
  const { theme, setTheme, accent, setAccent, useBlur, setUseBlur, useAnimations, setUseAnimations } = useTheme();
  
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(theme);
  const [selectedAccent, setSelectedAccent] = useState<AccentType>(accent);
  
  useEffect(() => {
    setSelectedTheme(theme);
    setSelectedAccent(accent);
  }, [theme, accent]);
  
  const applyTheme = () => {
    setTheme(selectedTheme);
    setAccent(selectedAccent);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="mr-2 h-5 w-5" />
          Theme Settings
        </CardTitle>
        <CardDescription>
          Customize the appearance of the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-3">Theme</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.entries(THEMES) as [ThemeType, string][]).map(([themeKey, themeDescription]) => (
              <div
                key={themeKey}
                className={`relative rounded-md border p-2 cursor-pointer transition-all ${
                  selectedTheme === themeKey ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTheme(themeKey)}
              >
                <div className={`w-full h-10 rounded mb-2 ${themeKey}`}></div>
                <div className="text-xs font-medium">{themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{themeDescription}</div>
                {selectedTheme === themeKey && (
                  <div className="absolute top-1 right-1">
                    <Badge variant="outline" className="bg-primary text-primary-foreground h-5 px-1">
                      <Check className="h-3 w-3" />
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-3">Accent Color</h3>
          <div className="grid grid-cols-5 md:grid-cols-8 gap-2">
            {(Object.entries(ACCENTS) as [AccentType, string][]).map(([accentKey, accentDescription]) => (
              <div
                key={accentKey}
                className="relative"
                title={accentDescription}
              >
                <div 
                  className={`w-full aspect-square rounded-full cursor-pointer accent-${accentKey} bg-primary flex items-center justify-center ${
                    selectedAccent === accentKey ? 'ring-2 ring-foreground' : ''
                  }`}
                  onClick={() => setSelectedAccent(accentKey)}
                >
                  {selectedAccent === accentKey && <Check className="h-4 w-4 text-primary-foreground" />}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium mb-2">Effects</h3>
          <div className="flex items-center justify-between">
            <label htmlFor="use-blur" className="text-sm">
              Use backdrop blur
            </label>
            <div className="flex items-center">
              <input
                id="use-blur"
                type="checkbox"
                className="mr-2 h-4 w-4"
                checked={useBlur}
                onChange={(e) => setUseBlur(e.target.checked)}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="use-animations" className="text-sm">
              Enable animations
            </label>
            <div className="flex items-center">
              <input
                id="use-animations"
                type="checkbox"
                className="mr-2 h-4 w-4"
                checked={useAnimations}
                onChange={(e) => setUseAnimations(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={applyTheme} className="ml-auto">
          Apply Theme
        </Button>
      </CardFooter>
    </Card>
  );
} 