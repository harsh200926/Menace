import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp, 
  addDoc,
  limit
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, auth } from '@/lib/firebase';

// Initialize Firebase Storage
export const storage = getStorage();

// Generic Types
interface BaseItem {
  id: string;
}

// Todo Types
export interface TodoItem extends BaseItem {
  text: string;
  completed: boolean;
  createdAt: string;
  status: 'pending' | 'completed';
  dueDate?: string;
  userId: string;
  priority?: 'none' | 'low' | 'medium' | 'high';
}

// Habit Types
export interface HabitItem extends BaseItem {
  name: string;
  description: string;
  frequency: string;
  completedDates: string[];
  streak: number;
  category: string;
  created: string;
  userId: string;
}

// Goal Types
export interface GoalItem extends BaseItem {
  name: string;
  description: string;
  target: number;
  progress: number;
  unit: string;
  category: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string | null;
  userId: string;
}

// Journal Entry Types
export interface JournalEntry extends BaseItem {
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  createdAt: string;
  userId: string;
}

// Memory Types
export interface MemoryItem extends BaseItem {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  tags?: string[];
  createdAt: string;
  userId: string;
  location?: string;
  favorite?: boolean;
}

// Music Types
export interface MusicItem extends BaseItem {
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  audioUrl?: string;
  externalUrl?: string;
  tags?: string[];
  createdAt: string;
  userId: string;
  favorite?: boolean;
  playCount?: number;
}

// Generic CRUD operations
async function getCollection<T extends BaseItem>(
  collectionName: string,
  userId: string,
  maxItems: number = 100
): Promise<T[]> {
  const q = query(
    collection(db, collectionName),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(maxItems)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ 
    ...doc.data(), 
    id: doc.id 
  })) as T[];
}

async function getItem<T extends BaseItem>(
  collectionName: string,
  id: string
): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id } as T;
  } else {
    return null;
  }
}

async function addItem<T extends Omit<BaseItem, "id">>(
  collectionName: string,
  item: T
): Promise<string> {
  const docRef = await addDoc(collection(db, collectionName), {
    ...item,
    createdAt: item.createdAt || serverTimestamp()
  });
  
  return docRef.id;
}

async function updateItem<T extends BaseItem>(
  collectionName: string,
  id: string,
  updates: Partial<T>
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, updates);
}

async function deleteItem(
  collectionName: string,
  id: string
): Promise<void> {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
}

// File upload helper
export async function uploadFile(file: File, path: string, metadata?: any): Promise<string> {
  if (!file) throw new Error('No file provided');
  
  // Create a storage reference
  const storageRef = ref(storage, `${path}/${file.name}-${Date.now()}`);
  
  // Upload file with metadata
  const uploadTask = uploadBytesResumable(storageRef, file, metadata);
  
  // Return a promise that resolves with the download URL when complete
  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Optional: track upload progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload progress: ${progress}%`);
      },
      (error) => {
        // Handle error
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        // Get download URL and resolve promise
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}

// Delete file from storage
export async function deleteFile(url: string): Promise<void> {
  if (!url || !url.includes('firebasestorage')) return;
  
  try {
    // Extract the path from the URL
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Specific functions for todos
export const todosAPI = {
  getTodos: (userId: string) => getCollection<TodoItem>("todos", userId),
  getTodo: (id: string) => getItem<TodoItem>("todos", id),
  addTodo: (todo: Omit<TodoItem, "id">) => addItem("todos", todo),
  updateTodo: (id: string, updates: Partial<TodoItem>) => updateItem("todos", id, updates),
  deleteTodo: (id: string) => deleteItem("todos", id),
  toggleTodoStatus: async (id: string, completed: boolean) => {
    await updateItem("todos", id, { 
      completed, 
      status: completed ? 'completed' : 'pending' 
    });
  }
};

// Specific functions for habits
export const habitsAPI = {
  getHabits: (userId: string) => getCollection<HabitItem>("habits", userId),
  getHabit: (id: string) => getItem<HabitItem>("habits", id),
  addHabit: (habit: Omit<HabitItem, "id">) => addItem("habits", habit),
  updateHabit: (id: string, updates: Partial<HabitItem>) => updateItem("habits", id, updates),
  deleteHabit: (id: string) => deleteItem("habits", id),
  trackHabit: async (id: string, date: string, userId: string) => {
    const habit = await getItem<HabitItem>("habits", id);
    if (habit && habit.userId === userId) {
      const completedDates = habit.completedDates || [];
      
      // Check if date already exists
      if (!completedDates.includes(date)) {
        completedDates.push(date);
        await updateItem("habits", id, { completedDates });
      }
    }
  }
};

// Specific functions for goals
export const goalsAPI = {
  getGoals: (userId: string) => getCollection<GoalItem>("goals", userId),
  getGoal: (id: string) => getItem<GoalItem>("goals", id),
  addGoal: (goal: Omit<GoalItem, "id">) => addItem("goals", goal),
  updateGoal: (id: string, updates: Partial<GoalItem>) => updateItem("goals", id, updates),
  deleteGoal: (id: string) => deleteItem("goals", id),
  updateProgress: async (id: string, progress: number) => {
    const goal = await getItem<GoalItem>("goals", id);
    if (goal) {
      const updates: Partial<GoalItem> = { progress };
      
      // Mark as completed if target reached
      if (progress >= goal.target && !goal.completedAt) {
        updates.completedAt = new Date().toISOString();
      }
      
      await updateItem("goals", id, updates);
    }
  }
};

// Specific functions for journal entries
export const journalAPI = {
  getEntries: (userId: string) => getCollection<JournalEntry>("journal", userId),
  getEntry: (id: string) => getItem<JournalEntry>("journal", id),
  addEntry: (entry: Omit<JournalEntry, "id">) => addItem("journal", entry),
  updateEntry: (id: string, updates: Partial<JournalEntry>) => updateItem("journal", id, updates),
  deleteEntry: (id: string) => deleteItem("journal", id)
};

// Memory API with image upload capabilities
export const memoriesAPI = {
  getMemories: (userId: string) => getCollection<MemoryItem>("memories", userId, 500), // Increased limit
  getMemory: (id: string) => getItem<MemoryItem>("memories", id),
  
  addMemory: async (memory: Omit<MemoryItem, "id" | "imageUrl">, imageFile: File): Promise<string> => {
    try {
      // 1. Upload the image file
      const imageUrl = await uploadFile(imageFile, `memories/${memory.userId}`, {
        contentType: imageFile.type,
        customMetadata: {
          title: memory.title || 'Untitled Memory'
        }
      });
      
      // 2. Create the memory record with the image URL
      const memoryWithImage = {
        ...memory,
        imageUrl,
        createdAt: memory.createdAt || new Date().toISOString()
      };
      
      // 3. Add the memory to Firestore
      return addItem("memories", memoryWithImage);
    } catch (error) {
      console.error("Error adding memory with image:", error);
      throw error;
    }
  },
  
  updateMemory: async (id: string, updates: Partial<MemoryItem>, newImageFile?: File): Promise<void> => {
    try {
      const memory = await getItem<MemoryItem>("memories", id);
      if (!memory) throw new Error("Memory not found");
      
      let updatedData: Partial<MemoryItem> = { ...updates };
      
      // If there's a new image, upload it and update the URL
      if (newImageFile) {
        // 1. Upload the new image
        const newImageUrl = await uploadFile(newImageFile, `memories/${memory.userId}`, {
          contentType: newImageFile.type
        });
        
        // 2. Delete the old image if it exists
        if (memory.imageUrl) {
          try {
            await deleteFile(memory.imageUrl);
          } catch (e) {
            console.warn("Could not delete old image:", e);
          }
        }
        
        // 3. Update the image URL
        updatedData.imageUrl = newImageUrl;
      }
      
      // Update the memory in Firestore
      await updateItem("memories", id, updatedData);
    } catch (error) {
      console.error("Error updating memory:", error);
      throw error;
    }
  },
  
  deleteMemory: async (id: string): Promise<void> => {
    try {
      // 1. Get the memory to retrieve the image URL
      const memory = await getItem<MemoryItem>("memories", id);
      if (!memory) return;
      
      // 2. Delete the image from storage if it exists
      if (memory.imageUrl) {
        try {
          await deleteFile(memory.imageUrl);
        } catch (e) {
          console.warn("Could not delete memory image:", e);
        }
      }
      
      // 3. Delete the memory from Firestore
      await deleteItem("memories", id);
    } catch (error) {
      console.error("Error deleting memory:", error);
      throw error;
    }
  },
  
  toggleFavorite: async (id: string, favorite: boolean): Promise<void> => {
    await updateItem("memories", id, { favorite });
  }
};

// Music API with increased limits
export const musicAPI = {
  // Get music with increased limit (1000 items)
  getMusic: (userId: string) => getCollection<MusicItem>("music", userId, 1000),
  getTrack: (id: string) => getItem<MusicItem>("music", id),
  
  addTrack: async (track: Omit<MusicItem, "id">, coverFile?: File): Promise<string> => {
    try {
      let trackData = { ...track };
      
      // If cover image is provided, upload it
      if (coverFile) {
        const coverUrl = await uploadFile(coverFile, `music/covers/${track.userId}`, {
          contentType: coverFile.type
        });
        trackData.coverUrl = coverUrl;
      }
      
      // Add the track to Firestore
      return addItem("music", trackData);
    } catch (error) {
      console.error("Error adding music track:", error);
      throw error;
    }
  },
  
  updateTrack: async (id: string, updates: Partial<MusicItem>, newCoverFile?: File): Promise<void> => {
    try {
      const track = await getItem<MusicItem>("music", id);
      if (!track) throw new Error("Track not found");
      
      let updatedData: Partial<MusicItem> = { ...updates };
      
      // If there's a new cover image, upload it
      if (newCoverFile) {
        const newCoverUrl = await uploadFile(newCoverFile, `music/covers/${track.userId}`, {
          contentType: newCoverFile.type
        });
        
        // Delete old cover if it exists
        if (track.coverUrl) {
          try {
            await deleteFile(track.coverUrl);
          } catch (e) {
            console.warn("Could not delete old cover image:", e);
          }
        }
        
        updatedData.coverUrl = newCoverUrl;
      }
      
      // Update the track in Firestore
      await updateItem("music", id, updatedData);
    } catch (error) {
      console.error("Error updating music track:", error);
      throw error;
    }
  },
  
  deleteTrack: async (id: string): Promise<void> => {
    try {
      // Get the track to retrieve the cover URL
      const track = await getItem<MusicItem>("music", id);
      if (!track) return;
      
      // Delete the cover image if it exists
      if (track.coverUrl) {
        try {
          await deleteFile(track.coverUrl);
        } catch (e) {
          console.warn("Could not delete track cover:", e);
        }
      }
      
      // Delete the track from Firestore
      await deleteItem("music", id);
    } catch (error) {
      console.error("Error deleting music track:", error);
      throw error;
    }
  },
  
  incrementPlayCount: async (id: string): Promise<void> => {
    const track = await getItem<MusicItem>("music", id);
    if (track) {
      const currentCount = track.playCount || 0;
      await updateItem("music", id, { playCount: currentCount + 1 });
    }
  },
  
  toggleFavorite: async (id: string, favorite: boolean): Promise<void> => {
    await updateItem("music", id, { favorite });
  }
};

// Migration function to move data from localStorage to Firestore
export async function migrateLocalStorageToFirestore(userId: string) {
  try {
    // Migrate todos
    const localTodos = localStorage.getItem("todos");
    if (localTodos) {
      const todosData = JSON.parse(localTodos);
      for (const todo of todosData) {
        await todosAPI.addTodo({
          ...todo,
          userId
        });
      }
    }
    
    // Migrate habits
    const localHabits = localStorage.getItem("habits");
    if (localHabits) {
      const habitsData = JSON.parse(localHabits);
      for (const habit of habitsData) {
        await habitsAPI.addHabit({
          ...habit,
          userId
        });
      }
    }
    
    // Migrate goals
    const localGoals = localStorage.getItem("goals");
    if (localGoals) {
      const goalsData = JSON.parse(localGoals);
      for (const goal of goalsData) {
        await goalsAPI.addGoal({
          ...goal,
          userId
        });
      }
    }
    
    // Migrate journal entries
    const localJournal = localStorage.getItem("journal");
    if (localJournal) {
      const journalData = JSON.parse(localJournal);
      for (const entry of journalData) {
        await journalAPI.addEntry({
          ...entry,
          userId
        });
      }
    }
    
    // Note: Memories with images and music files can't be automatically migrated 
    // as they need file uploads. The user will need to re-add these manually.
    
    return true;
  } catch (error) {
    console.error("Error migrating data:", error);
    return false;
  }
} 