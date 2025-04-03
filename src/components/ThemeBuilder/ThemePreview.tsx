import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, ArrowRight } from "lucide-react";

interface ThemePreviewProps {
  colors: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    card: string;
    cardForeground: string;
    border: string;
    muted: string;
    accent: string;
  };
  backgroundImage?: string;
  font?: string;
}

export const ThemePreview = ({ colors, backgroundImage, font }: ThemePreviewProps) => {
  const containerStyle = {
    backgroundColor: colors.background,
    color: colors.foreground,
    backgroundImage: backgroundImage && backgroundImage.length > 0 ? `url(${backgroundImage})` : undefined,
    backgroundSize: backgroundImage && backgroundImage.length > 0 ? 'cover' : undefined,
    backgroundPosition: backgroundImage && backgroundImage.length > 0 ? 'center' : undefined,
    fontFamily: font || undefined,
  };
  
  const cardStyle = {
    backgroundColor: colors.card,
    color: colors.cardForeground,
    borderColor: colors.border,
  };
  
  const buttonStyle = {
    backgroundColor: colors.primary,
    color: "#ffffff", // Text is usually white on primary
  };
  
  const secondaryButtonStyle = {
    backgroundColor: colors.secondary,
    color: colors.foreground,
    borderColor: colors.border,
  };
  
  const badgeStyle = {
    backgroundColor: colors.accent,
    color: "#ffffff", // Text is usually white on accent
  };
  
  return (
    <div 
      className="relative p-4 rounded-md overflow-hidden"
      style={containerStyle}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Theme Preview</h3>
          <p className="text-sm">This is how your theme will look when applied.</p>
          
          <div className="flex space-x-2">
            <button className="px-4 py-2 rounded text-sm font-medium" style={buttonStyle}>
              Primary Button
            </button>
            <button className="px-4 py-2 rounded border text-sm font-medium" style={secondaryButtonStyle}>
              Secondary Button
            </button>
          </div>
          
          <div className="flex space-x-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium" style={badgeStyle}>
              Badge 1
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium" style={badgeStyle}>
              Badge 2
            </span>
          </div>
        </div>
        
        <div 
          className="rounded-md p-4"
          style={cardStyle}
        >
          <h4 className="font-medium mb-2">Card Example</h4>
          <p className="text-sm mb-4">This is a sample card using your theme colors.</p>
          <div className="flex justify-between">
            <span className="text-xs opacity-70">Sample data</span>
            <span className="text-xs font-bold">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
