import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase';
import {
  calendarService,
  journalService,
  notesService,
  goalsService,
  habitsService,
  todosService,
  memoriesService,
  motivationService,
  profileService,
  storageService
} from '@/lib/firebase-services';
import type {
  CalendarEvent,
  JournalEntry,
  Note,
  Goal,
  Habit,
  Todo,
  Memory,
  Motivation,
  UserProfile
} from '@/lib/firebase-services';

// Calendar Hook
export const useCalendar = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = async (startDate: Date, endDate: Date) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await calendarService.getEvents(currentUser.uid, startDate, endDate);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events'));
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: Omit<CalendarEvent, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      const id = await calendarService.createEvent(currentUser.uid, event);
      await fetchEvents(new Date(), new Date());
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create event'));
      throw err;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      await calendarService.updateEvent(eventId, updates);
      await fetchEvents(new Date(), new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update event'));
      throw err;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      await calendarService.deleteEvent(eventId);
      await fetchEvents(new Date(), new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete event'));
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
};

// Journal Hook
export const useJournal = () => {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = async (limit: number = 10) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await journalService.getEntries(currentUser.uid, limit);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch entries'));
    } finally {
      setLoading(false);
    }
  };

  const createEntry = async (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      const id = await journalService.createEntry(currentUser.uid, entry);
      await fetchEntries();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create entry'));
      throw err;
    }
  };

  const updateEntry = async (entryId: string, updates: Partial<JournalEntry>) => {
    try {
      await journalService.updateEntry(entryId, updates);
      await fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update entry'));
      throw err;
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      await journalService.deleteEntry(entryId);
      await fetchEntries();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete entry'));
      throw err;
    }
  };

  return {
    entries,
    loading,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry
  };
};

// Notes Hook
export const useNotes = () => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchNotes = async (limit: number = 20) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await notesService.getNotes(currentUser.uid, limit);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notes'));
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      const id = await notesService.createNote(currentUser.uid, note);
      await fetchNotes();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create note'));
      throw err;
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    try {
      await notesService.updateNote(noteId, updates);
      await fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update note'));
      throw err;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      await notesService.deleteNote(noteId);
      await fetchNotes();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete note'));
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote
  };
};

// Goals Hook
export const useGoals = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = async (status?: Goal['status']) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await goalsService.getGoals(currentUser.uid, status);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch goals'));
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      const id = await goalsService.createGoal(currentUser.uid, goal);
      await fetchGoals();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create goal'));
      throw err;
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    try {
      await goalsService.updateGoal(goalId, updates);
      await fetchGoals();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update goal'));
      throw err;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await goalsService.deleteGoal(goalId);
      await fetchGoals();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete goal'));
      throw err;
    }
  };

  return {
    goals,
    loading,
    error,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal
  };
};

// Habits Hook
export const useHabits = () => {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHabits = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await habitsService.getHabits(currentUser.uid);
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch habits'));
    } finally {
      setLoading(false);
    }
  };

  const createHabit = async (habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      const id = await habitsService.createHabit(currentUser.uid, habit);
      await fetchHabits();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create habit'));
      throw err;
    }
  };

  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
      await habitsService.updateHabit(habitId, updates);
      await fetchHabits();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update habit'));
      throw err;
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      await habitsService.deleteHabit(habitId);
      await fetchHabits();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete habit'));
      throw err;
    }
  };

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit
  };
};

// Todos Hook
export const useTodos = () => {
  const { currentUser } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTodos = async (status?: Todo['status']) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await todosService.getTodos(currentUser.uid, status);
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch todos'));
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todo: Omit<Todo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      const id = await todosService.createTodo(currentUser.uid, todo);
      await fetchTodos();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create todo'));
      throw err;
    }
  };

  const updateTodo = async (todoId: string, updates: Partial<Todo>) => {
    try {
      await todosService.updateTodo(todoId, updates);
      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update todo'));
      throw err;
    }
  };

  const deleteTodo = async (todoId: string) => {
    try {
      await todosService.deleteTodo(todoId);
      await fetchTodos();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete todo'));
      throw err;
    }
  };

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo
  };
};

// Memories Hook
export const useMemories = () => {
  const { currentUser } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemories = async (limit: number = 20) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await memoriesService.getMemories(currentUser.uid, limit);
      setMemories(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch memories'));
    } finally {
      setLoading(false);
    }
  };

  const createMemory = async (memory: Omit<Memory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      const id = await memoriesService.createMemory(currentUser.uid, memory);
      await fetchMemories();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create memory'));
      throw err;
    }
  };

  const updateMemory = async (memoryId: string, updates: Partial<Memory>) => {
    try {
      await memoriesService.updateMemory(memoryId, updates);
      await fetchMemories();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update memory'));
      throw err;
    }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      await memoriesService.deleteMemory(memoryId);
      await fetchMemories();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete memory'));
      throw err;
    }
  };

  return {
    memories,
    loading,
    error,
    fetchMemories,
    createMemory,
    updateMemory,
    deleteMemory
  };
};

// Motivation Hook
export const useMotivation = () => {
  const { currentUser } = useAuth();
  const [motivations, setMotivations] = useState<Motivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMotivations = async (category?: string) => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await motivationService.getMotivations(currentUser.uid, category);
      setMotivations(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch motivations'));
    } finally {
      setLoading(false);
    }
  };

  const createMotivation = async (motivation: Omit<Motivation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      const id = await motivationService.createMotivation(currentUser.uid, motivation);
      await fetchMotivations();
      return id;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create motivation'));
      throw err;
    }
  };

  const updateMotivation = async (motivationId: string, updates: Partial<Motivation>) => {
    try {
      await motivationService.updateMotivation(motivationId, updates);
      await fetchMotivations();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update motivation'));
      throw err;
    }
  };

  const deleteMotivation = async (motivationId: string) => {
    try {
      await motivationService.deleteMotivation(motivationId);
      await fetchMotivations();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete motivation'));
      throw err;
    }
  };

  return {
    motivations,
    loading,
    error,
    fetchMotivations,
    createMotivation,
    updateMotivation,
    deleteMotivation
  };
};

// Profile Hook
export const useProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await profileService.getProfile(currentUser.uid);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (profile: Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      await profileService.createProfile(currentUser.uid, profile);
      await fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create profile'));
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      await profileService.updateProfile(currentUser.uid, updates);
      await fetchProfile();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update profile'));
      throw err;
    }
  };

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile
  };
};

// Storage Hook
export const useStorage = () => {
  const { currentUser } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      return await storageService.uploadFile(currentUser.uid, file, path);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to upload file'));
      throw err;
    }
  };

  const deleteFile = async (path: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    try {
      await storageService.deleteFile(currentUser.uid, path);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete file'));
      throw err;
    }
  };

  return {
    error,
    uploadFile,
    deleteFile
  };
}; 