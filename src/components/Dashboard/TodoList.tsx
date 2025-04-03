import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  status?: 'pending' | 'completed';
  dueDate?: string;
}

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  quote?: string;
}

const TodoList = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, quote }: TodoListProps) => {
  const [newTodo, setNewTodo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      try {
        onAddTodo(newTodo.trim());
        setNewTodo("");
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  return (
    <Card className="h-full shadow-md overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 border-b border-border/20 pb-3">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-primary" />
          Quick Tasks
        </CardTitle>
        {quote && (
          <CardDescription>
            {quote}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <form className="p-4 border-b">
          <div className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="flex-1"
              aria-label="Task description"
            />
            <Button 
              type="button" 
              size="icon" 
              title="Add task"
              aria-label="Add task"
              onClick={() => {
                if (newTodo.trim()) {
                  try {
                    onAddTodo(newTodo.trim());
                    setNewTodo("");
                  } catch (error) {
                    console.error("Error adding todo:", error);
                  }
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>
        <ScrollArea className="h-[300px]">
          <div className="p-4 space-y-2">
            <AnimatePresence>
              {todos.length > 0 ? (
                todos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => onToggleTodo(todo.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <span className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                      {todo.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No tasks yet. Add one to get started!</p>
                  {quote && (
                    <div className="mt-4 italic text-sm text-center mx-auto max-w-sm">
                      "{quote}"
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TodoList; 