
import { useState, useEffect } from "react";

interface HexColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export const HexColorPicker = ({ color, onChange }: HexColorPickerProps) => {
  const [localColor, setLocalColor] = useState(color);
  
  // Update local color when prop changes
  useEffect(() => {
    setLocalColor(color);
  }, [color]);
  
  // Handle color input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalColor(e.target.value);
    onChange(e.target.value);
  };
  
  return (
    <div className="mt-2">
      <input 
        type="color" 
        value={localColor}
        onChange={handleChange}
        className="w-full h-8 rounded cursor-pointer"
      />
    </div>
  );
};
