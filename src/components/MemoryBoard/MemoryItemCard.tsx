import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MemoryItem } from "@/types/memory";
import { cn } from "@/lib/utils";
import { 
  Image, 
  Quote, 
  Link, 
  Book, 
  Pin, 
  PinOff, 
  Trash, 
  Music, 
  Edit, 
  FileText, 
  File as FileIcon,
  Play,
  Pause,
  X,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Add FileViewer component
const FileViewer = ({ 
  isOpen, 
  onClose, 
  fileData, 
  fileName, 
  fileType 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  fileData: string; 
  fileName: string; 
  fileType: string;
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col",
        isFullscreen && "sm:max-w-[95vw] h-[95vh] max-h-[95vh]"
      )}>
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="truncate flex-1">{fileName}</DialogTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto p-4 bg-secondary/30 rounded-md mt-4">
          {fileType === 'pdf' && (
            <iframe 
              src={fileData} 
              title={fileName}
              className="w-full h-full border-0"
            />
          )}
          
          {fileType === 'txt' && (
            <pre className="whitespace-pre-wrap text-sm font-mono p-4 bg-card">
              {/* For text files, fileData might be the actual text or a data URL */}
              {fileData.startsWith('data:text/plain') 
                ? atob(fileData.split(',')[1]) 
                : fileData}
            </pre>
          )}
          
          {fileType === 'image' && (
            <div className="flex items-center justify-center h-full">
              <img 
                src={fileData} 
                alt={fileName}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface MemoryItemCardProps {
  memory: MemoryItem;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  onEdit?: (memory: MemoryItem) => void;
  isPreview?: boolean;
}

const MemoryItemCard = ({ 
  memory, 
  onDelete, 
  onPin, 
  onEdit,
  isPreview = false 
}: MemoryItemCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

  // Add a ref for the audio element
  const audioRef = useRef<HTMLAudioElement>(null);

  const getTypeIcon = () => {
    switch (memory.type) {
      case "image":
        return <Image className="h-4 w-4 text-blue-500" />;
      case "quote":
        return <Quote className="h-4 w-4 text-yellow-500" />;
      case "link":
        return <Link className="h-4 w-4 text-purple-500" />;
      case "text":
        return <Book className="h-4 w-4 text-green-500" />;
      case "music":
        return <Music className="h-4 w-4 text-red-500" />;
      case "pdf":
        return <FileIcon className="h-4 w-4 text-red-500" />;
      case "txt":
        return <FileText className="h-4 w-4 text-slate-500" />;
      default:
        return <Book className="h-4 w-4 text-primary" />;
    }
  };

  const handlePlayPause = () => {
    if (!memory.fileData && !memory.linkUrl) return;
    
    if (!audioElement) {
      const audio = new Audio(memory.fileData || memory.linkUrl);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openFile = () => {
    if ((memory.type === 'pdf' || memory.type === 'txt' || memory.type === 'image') && memory.fileData) {
      // Open the built-in file viewer for supported types
      setIsFileViewerOpen(true);
    } else if (memory.fileData) {
      // Download for unsupported types
      const link = document.createElement('a');
      link.href = memory.fileData;
      link.download = memory.fileName || `download.${memory.type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (memory.fileUrl) {
      window.open(memory.fileUrl, '_blank');
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all duration-200 h-full relative group",
          memory.pinned && "border-primary/50 shadow-md",
          isPreview && "h-28",
          !isPreview && "hover:shadow-md"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {memory.type === "image" && memory.imageUrl && (
          <div className="absolute inset-0 bg-cover bg-center z-0 opacity-20" 
               style={{ backgroundImage: `url(${memory.imageUrl})` }} />
        )}
        
        <CardContent className={cn(
          "p-3 relative z-10 h-full flex flex-col",
        )}>
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center gap-1">
              {getTypeIcon()}
              <span className="text-xs text-muted-foreground">{memory.date}</span>
            </div>
            
            {!isPreview && isHovered && (
              <div className="flex gap-1">
                {onPin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onPin(memory.id)}
                  >
                    {memory.pinned ? (
                      <PinOff className="h-3 w-3" />
                    ) : (
                      <Pin className="h-3 w-3" />
                    )}
                  </Button>
                )}
                
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onEdit(memory)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={() => onDelete(memory.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className={cn(
            "flex-1 overflow-hidden", 
            isPreview && "line-clamp-2 text-xs",
            !isPreview && "text-sm"
          )}>
            {memory.title && <div className="font-medium">{memory.title}</div>}
            
            {(memory.type === "pdf" || memory.type === "txt") && memory.fileName && (
              <div className="mt-1 mb-2 text-xs flex items-center">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md flex items-center gap-1">
                  {memory.type === "pdf" ? <FileIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                  {memory.fileName}
                  {memory.fileSize && <span className="text-muted-foreground">({Math.round(memory.fileSize / 1024)} KB)</span>}
                </span>
              </div>
            )}
            
            {memory.type === "image" && memory.imageUrl && (
              <div className="mt-1 mb-2 cursor-pointer" onClick={memory.fileData ? openFile : undefined}>
                <img 
                  src={memory.imageUrl} 
                  alt={memory.content || "Memory image"} 
                  className="rounded-md w-full h-auto object-cover max-h-[160px]" 
                />
              </div>
            )}
            
            {memory.type === "music" && (
              <div className="mt-2 mb-2 flex flex-col gap-2">
                {memory.fileData && (
                  <audio ref={audioRef} className="w-full" controls src={memory.fileData} />
                )}
                {!memory.fileData && memory.linkUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1" 
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {isPlaying ? "Pause" : "Play"} Music
                  </Button>
                )}
              </div>
            )}
            
            {(memory.type === "pdf" || memory.type === "txt" || memory.type === "image") && (memory.fileData || memory.fileUrl) && (
              <div className="mt-1 mb-2 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1" 
                  onClick={openFile}
                >
                  {memory.type === "pdf" ? <FileIcon className="h-3 w-3" /> : 
                   memory.type === "txt" ? <FileText className="h-3 w-3" /> :
                   <Image className="h-3 w-3" />}
                  View {memory.type.toUpperCase()}
                </Button>
              </div>
            )}
            
            <div className={cn(memory.title && "text-muted-foreground text-xs")}>
              {memory.content}
            </div>
          </div>
          
          {memory.pinned && (
            <div className="absolute top-0 right-0">
              <Pin className="h-3 w-3 text-primary" fill="currentColor" />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* File Viewer Dialog */}
      {isFileViewerOpen && memory.fileData && (
        <FileViewer 
          isOpen={isFileViewerOpen}
          onClose={() => setIsFileViewerOpen(false)}
          fileData={memory.fileData}
          fileName={memory.fileName || `file.${memory.type}`}
          fileType={memory.type}
        />
      )}
    </>
  );
};

export default MemoryItemCard;
