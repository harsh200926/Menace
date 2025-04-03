import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import confetti from "canvas-confetti";

interface RewardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'tasks' | 'journal' | 'goal' | 'day';
}

const RewardDialog = ({ isOpen, onClose, title, message, type }: RewardDialogProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      
      // Trigger confetti when dialog opens
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
      
      // Use different colors based on reward type
      let colors: string[] = [];
      switch (type) {
        case 'tasks':
          colors = ['#FF5E5B', '#D8D8D8'];
          break;
        case 'journal':
          colors = ['#5DA9E9', '#FFDD4A'];
          break;
        case 'goal':
          colors = ['#BD97CB', '#66E2D5'];
          break;
        case 'day':
          colors = ['#FF9A3C', '#B8E1FF'];
          break;
      }
      
      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Create heart-shaped confetti
        confetti({
          particleCount: Math.floor(particleCount),
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: Math.floor(particleCount),
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
      }, 250);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [isOpen, type]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-primary/30 bg-gradient-to-b from-background to-background/90 backdrop-blur-lg overflow-hidden max-w-md">
        <div className="absolute -z-10 top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-primary/20 to-transparent opacity-80" />
        
        <DialogHeader className="relative">
          <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-primary/20 blur-xl opacity-80" />
          <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-primary/10 blur-2xl opacity-60" />
          
          <DialogTitle className="text-2xl font-bold text-center pt-4 text-primary">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-center py-6"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "mirror"
                }}
                className="inline-block mb-4"
              >
                <Heart className="h-12 w-12 text-primary fill-primary animate-pulse" />
              </motion.div>
              
              <motion.p 
                className="text-lg italic font-playfair px-6 leading-relaxed text-foreground/90"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                "{message}"
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RewardDialog; 