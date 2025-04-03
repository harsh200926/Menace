export type MemoryType = "text" | "image" | "quote" | "link" | "music" | "pdf" | "txt";

export interface MemoryItem {
  id: string;
  type: MemoryType;
  title?: string;
  content: string;
  imageUrl?: string;
  linkUrl?: string;
  fileUrl?: string;
  fileData?: string; // Base64 encoded file data
  fileName?: string; // Original file name
  fileSize?: number; // File size in bytes
  date: string;
  pinned: boolean;
  color?: string;
  tags?: string[];
}
