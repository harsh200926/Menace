import React, { createContext, useContext } from 'react';
import {
  useCalendar,
  useJournal,
  useNotes,
  useGoals,
  useHabits,
  useTodos,
  useMemories,
  useMotivation,
  useProfile,
  useStorage
} from '@/hooks/useFirebase';

interface FirebaseContextType {
  calendar: ReturnType<typeof useCalendar>;
  journal: ReturnType<typeof useJournal>;
  notes: ReturnType<typeof useNotes>;
  goals: ReturnType<typeof useGoals>;
  habits: ReturnType<typeof useHabits>;
  todos: ReturnType<typeof useTodos>;
  memories: ReturnType<typeof useMemories>;
  motivation: ReturnType<typeof useMotivation>;
  profile: ReturnType<typeof useProfile>;
  storage: ReturnType<typeof useStorage>;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const calendar = useCalendar();
  const journal = useJournal();
  const notes = useNotes();
  const goals = useGoals();
  const habits = useHabits();
  const todos = useTodos();
  const memories = useMemories();
  const motivation = useMotivation();
  const profile = useProfile();
  const storage = useStorage();

  const value = {
    calendar,
    journal,
    notes,
    goals,
    habits,
    todos,
    memories,
    motivation,
    profile,
    storage
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}; 