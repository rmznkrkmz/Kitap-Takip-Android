
export type ReadingStatus = 'reading' | 'read' | 'want-to-read';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: ReadingStatus;
  rating: number; // 0-5
  year?: number;
  genre?: string;
  description?: string;
  startDate?: string;
  finishDate?: string;
  notes?: string;
  notesLastUpdated?: string;
  isFavorite?: boolean;
}

export type ViewState = 'login' | 'dashboard' | 'add' | 'details' | 'stats' | 'top100';

export type TabType = ReadingStatus;

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
  isLocked: boolean;
}
