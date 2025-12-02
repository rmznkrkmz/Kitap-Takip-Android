
import React, { useState, useEffect } from 'react';
import { Book, ViewState, TabType } from './types';
import { INITIAL_BOOKS } from './constants';
import Dashboard from './views/Dashboard';
import AddBook from './views/AddBook';
import BookDetails from './views/BookDetails';
import Stats from './views/Stats';

// Helper for local storage
const loadState = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.warn(`Error loading ${key} from localStorage`, e);
    return defaultValue;
  }
};

const App: React.FC = () => {
  // State for Navigation
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // State for Data - Persisted
  const [books, setBooks] = useState<Book[]>(() => loadState('books', INITIAL_BOOKS));
  
  // State for UI - Not Persisted
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('reading');

  // State for Stats/Goals - Persisted
  const [yearlyGoal, setYearlyGoal] = useState(() => loadState('yearlyGoal', 30));
  const [dailyPageGoal, setDailyPageGoal] = useState(() => loadState('dailyPageGoal', 50));
  
  // Daily Pages Read - Persisted with Date Check (Reset on new day)
  const [dailyPagesRead, setDailyPagesRead] = useState(() => {
    try {
      const savedDate = localStorage.getItem('dailyPagesDate');
      const today = new Date().toLocaleDateString('tr-TR');
      // If the saved date is not today, reset count to 0
      if (savedDate !== today) {
        return 0;
      }
      return loadState('dailyPagesRead', 0);
    } catch (e) {
      return 0;
    }
  });

  // State for Streak - Persisted
  const [streakCount, setStreakCount] = useState(() => loadState('streakCount', 15));
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(() => loadState('lastStreakDate', null));

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('yearlyGoal', JSON.stringify(yearlyGoal));
  }, [yearlyGoal]);

  useEffect(() => {
    localStorage.setItem('dailyPageGoal', JSON.stringify(dailyPageGoal));
  }, [dailyPageGoal]);

  useEffect(() => {
    localStorage.setItem('dailyPagesRead', JSON.stringify(dailyPagesRead));
    localStorage.setItem('dailyPagesDate', new Date().toLocaleDateString('tr-TR'));
  }, [dailyPagesRead]);

  useEffect(() => {
    localStorage.setItem('streakCount', JSON.stringify(streakCount));
  }, [streakCount]);

  useEffect(() => {
    localStorage.setItem('lastStreakDate', JSON.stringify(lastStreakDate));
  }, [lastStreakDate]);

  // --- Navigation Handlers ---
  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
  };

  const handleBookClick = (bookId: string) => {
    setSelectedBookId(bookId);
    navigateTo('details');
  };

  const handleAddBook = (newBook: Book) => {
    setBooks([newBook, ...books]);
    navigateTo('dashboard');
  };

  const handleDeleteBook = (bookId: string) => {
    if (window.confirm('Bu kitabı silmek istediğinize emin misiniz?')) {
      setBooks(books.filter(b => b.id !== bookId));
      navigateTo('dashboard');
    }
  };

  const handleUpdateBookStatus = (bookId: string, status: Book['status']) => {
    setBooks(books.map(b => {
      if (b.id === bookId) {
        const updatedBook = { ...b, status };
        
        // If marking as read, set the finish date to today (YYYY-MM-DD)
        if (status === 'read' && b.status !== 'read') {
          const today = new Date();
          const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          updatedBook.finishDate = formattedDate;
        }
        
        return updatedBook;
      }
      return b;
    }));
  };

  const handleUpdateBookNotes = (bookId: string, notes: string) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setBooks(books.map(b => b.id === bookId ? { ...b, notes, notesLastUpdated: timestamp } : b));
  };

  const handleToggleFavorite = (bookId: string) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b));
  };

  const handleUpdateBookRating = (bookId: string, rating: number) => {
    setBooks(books.map(b => b.id === bookId ? { ...b, rating } : b));
  };

  // Streak Handler
  const handleIncrementStreak = () => {
    const today = new Date().toLocaleDateString('tr-TR');
    
    // If different date, allow increment
    if (lastStreakDate !== today) {
      setStreakCount(prev => prev + 1);
      setLastStreakDate(today);
      
      // Optional: Also add some pages to daily read if not already added to encourage usage
      if (dailyPagesRead === 0) {
        setDailyPagesRead(10);
      }
    }
  };

  // Check if streak is already claimed for today
  const hasReadToday = lastStreakDate === new Date().toLocaleDateString('tr-TR');

  // Render View based on state
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            books={books}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBookClick={handleBookClick}
            onAddClick={() => navigateTo('add')}
            onStatsClick={() => navigateTo('stats')}
          />
        );
      case 'add':
        return (
          <AddBook 
            onBack={() => navigateTo('dashboard')}
            onSave={handleAddBook}
          />
        );
      case 'details':
        const selectedBook = books.find(b => b.id === selectedBookId);
        if (!selectedBook) return null;
        return (
          <BookDetails 
            book={selectedBook}
            onBack={() => navigateTo('dashboard')}
            onUpdateStatus={handleUpdateBookStatus}
            onUpdateNotes={handleUpdateBookNotes}
            onToggleFavorite={handleToggleFavorite}
            onUpdateRating={handleUpdateBookRating}
            onDeleteBook={handleDeleteBook}
          />
        );
      case 'stats':
        return (
          <Stats 
            books={books}
            onBack={() => navigateTo('dashboard')}
            onNavClick={(view) => navigateTo(view)}
            yearlyGoal={yearlyGoal}
            setYearlyGoal={setYearlyGoal}
            dailyPageGoal={dailyPageGoal}
            setDailyPageGoal={setDailyPageGoal}
            dailyPagesRead={dailyPagesRead}
            setDailyPagesRead={setDailyPagesRead}
            streakCount={streakCount}
            hasReadToday={hasReadToday}
            onIncrementStreak={handleIncrementStreak}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark font-display transition-colors duration-200">
      {renderView()}
    </div>
  );
};

export default App;
