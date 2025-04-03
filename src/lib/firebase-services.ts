import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Types
interface BaseDocument {
  id?: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface CalendarEvent extends BaseDocument {
  title: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  color?: string;
  isAllDay?: boolean;
}

interface JournalEntry extends BaseDocument {
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  images?: string[];
}

interface Note extends BaseDocument {
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}

interface Chronicle extends BaseDocument {
  title: string;
  content: string;
  date: Timestamp;
  category: string;
  images?: string[];
}

interface Goal extends BaseDocument {
  title: string;
  description: string;
  targetDate?: Timestamp;
  status: 'active' | 'completed' | 'archived';
  progress: number;
  milestones?: {
    title: string;
    completed: boolean;
  }[];
}

interface Habit extends BaseDocument {
  title: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[];
  timeOfDay?: string;
  streak: number;
  lastCompleted?: Timestamp;
  category?: string;
}

interface Todo extends BaseDocument {
  title: string;
  description?: string;
  dueDate?: Timestamp;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  tags?: string[];
}

interface Memory extends BaseDocument {
  title: string;
  description: string;
  date: Timestamp;
  images?: string[];
  tags?: string[];
  mood?: string;
}

interface Motivation extends BaseDocument {
  content: string;
  author?: string;
  category: string;
  tags?: string[];
  isFavorite?: boolean;
}

interface UserProfile extends BaseDocument {
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    language: string;
  };
}

// Calendar Services
export const calendarService = {
  async createEvent(userId: string, event: Omit<CalendarEvent, keyof BaseDocument>): Promise<string> {
    const docRef = await addDoc(collection(db, 'calendar'), {
      ...event,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getEvents(userId: string, startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    const q = query(
      collection(db, 'calendar'),
      where('userId', '==', userId),
      where('startDate', '>=', Timestamp.fromDate(startDate)),
      where('startDate', '<=', Timestamp.fromDate(endDate)),
      orderBy('startDate')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
  },

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    const docRef = doc(db, 'calendar', eventId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteEvent(eventId: string): Promise<void> {
    const docRef = doc(db, 'calendar', eventId);
    await deleteDoc(docRef);
  }
};

// Journal Services
export const journalService = {
  async createEntry(userId: string, entry: Omit<JournalEntry, keyof BaseDocument>): Promise<string> {
    const docRef = await addDoc(collection(db, 'journal'), {
      ...entry,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getEntries(userId: string, limit: number = 10): Promise<JournalEntry[]> {
    const q = query(
      collection(db, 'journal'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
  },

  async updateEntry(entryId: string, updates: Partial<JournalEntry>): Promise<void> {
    const docRef = doc(db, 'journal', entryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteEntry(entryId: string): Promise<void> {
    const docRef = doc(db, 'journal', entryId);
    await deleteDoc(docRef);
  }
};

// Notes Services
export const notesService = {
  async createNote(userId: string, note: Omit<Note, keyof BaseDocument>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notes'), {
      ...note,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getNotes(userId: string, limit: number = 20): Promise<Note[]> {
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
  },

  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const docRef = doc(db, 'notes', noteId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteNote(noteId: string): Promise<void> {
    const docRef = doc(db, 'notes', noteId);
    await deleteDoc(docRef);
  }
};

// Goals Services
export const goalsService = {
  async createGoal(userId: string, goal: Omit<Goal, keyof BaseDocument>): Promise<string> {
    const docRef = await addDoc(collection(db, 'goals'), {
      ...goal,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getGoals(userId: string, status?: Goal['status']): Promise<Goal[]> {
    let q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
  },

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<void> {
    const docRef = doc(db, 'goals', goalId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteGoal(goalId: string): Promise<void> {
    const docRef = doc(db, 'goals', goalId);
    await deleteDoc(docRef);
  }
};

// Habits Services
export const habitsService = {
  async createHabit(userId: string, habit: Omit<Habit, keyof BaseDocument>): Promise<string> {
    const docRef = await addDoc(collection(db, 'habits'), {
      ...habit,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getHabits(userId: string): Promise<Habit[]> {
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
  },

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<void> {
    const docRef = doc(db, 'habits', habitId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteHabit(habitId: string): Promise<void> {
    const docRef = doc(db, 'habits', habitId);
    await deleteDoc(docRef);
  }
};

// Todos Services
export const todosService = {
  async createTodo(userId: string, todo: Omit<Todo, keyof BaseDocument>): Promise<string> {
    const docRef = await addDoc(collection(db, 'todos'), {
      ...todo,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getTodos(userId: string, status?: Todo['status']): Promise<Todo[]> {
    let q = query(
      collection(db, 'todos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (status) {
      q = query(q, where('status', '==', status));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Todo));
  },

  async updateTodo(todoId: string, updates: Partial<Todo>): Promise<void> {
    const docRef = doc(db, 'todos', todoId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteTodo(todoId: string): Promise<void> {
    const docRef = doc(db, 'todos', todoId);
    await deleteDoc(docRef);
  }
};

// Memories Services
export const memoriesService = {
  async createMemory(userId: string, memory: Omit<Memory, keyof BaseDocument>): Promise<string> {
    const docRef = await addDoc(collection(db, 'memories'), {
      ...memory,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getMemories(userId: string, limit: number = 20): Promise<Memory[]> {
    const q = query(
      collection(db, 'memories'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(limit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Memory));
  },

  async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<void> {
    const docRef = doc(db, 'memories', memoryId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteMemory(memoryId: string): Promise<void> {
    const docRef = doc(db, 'memories', memoryId);
    await deleteDoc(docRef);
  }
};

// Motivation Services
export const motivationService = {
  async createMotivation(userId: string, motivation: Omit<Motivation, keyof BaseDocument>): Promise<string> {
    const docRef = await addDoc(collection(db, 'motivation'), {
      ...motivation,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async getMotivations(userId: string, category?: string): Promise<Motivation[]> {
    let q = query(
      collection(db, 'motivation'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (category) {
      q = query(q, where('category', '==', category));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Motivation));
  },

  async updateMotivation(motivationId: string, updates: Partial<Motivation>): Promise<void> {
    const docRef = doc(db, 'motivation', motivationId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async deleteMotivation(motivationId: string): Promise<void> {
    const docRef = doc(db, 'motivation', motivationId);
    await deleteDoc(docRef);
  }
};

// Profile Services
export const profileService = {
  async createProfile(userId: string, profile: Omit<UserProfile, keyof BaseDocument>): Promise<void> {
    const docRef = doc(db, 'profiles', userId);
    await setDoc(docRef, {
      ...profile,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as UserProfile : null;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const docRef = doc(db, 'profiles', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};

// Storage Services
export const storageService = {
  async uploadFile(userId: string, file: File, path: string): Promise<string> {
    const storageRef = ref(storage, `${userId}/${path}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  async deleteFile(userId: string, path: string): Promise<void> {
    const storageRef = ref(storage, `${userId}/${path}`);
    await deleteObject(storageRef);
  }
}; 