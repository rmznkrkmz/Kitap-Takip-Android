
import React, { useState, useEffect } from 'react';
import { Book, ViewState, TabType } from './types';
import { INITIAL_BOOKS } from './constants';
import Dashboard from './views/Dashboard';
import AddBook from './views/AddBook';
import BookDetails from './views/BookDetails';
import Stats from './views/Stats';
import Login from './views/Login';
import Top100Books from './views/Top100Books';

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

// Helper to get consistent YYYY-MM-DD key
const getDateKey = (date: Date = new Date()) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Helper for Turkish Possessive Suffixes (Vowel Harmony)
const getSuffix = (name: string) => {
  const lastVowel = name.match(/[aıeiouöü]/gi)?.pop()?.toLowerCase();
  
  // Last letter check for apostrophe (optional, but good for proper nouns)
  // We assume all names are proper nouns here.
  
  if (!lastVowel) return "'in"; // Fallback

  if (['a', 'ı'].includes(lastVowel)) return "'ın";
  if (['e', 'i'].includes(lastVowel)) return "'in";
  if (['o', 'u'].includes(lastVowel)) return "'un";
  if (['ö', 'ü'].includes(lastVowel)) return "'ün";
  
  return "'in";
};

const App: React.FC = () => {
  // User Identity - Persisted
  const [userName, setUserName] = useState<string>(() => loadState('userName', ''));

  // State for Navigation - Initial logic handles redirect if not logged in
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    // Direct check to localStorage to prevent flicker on first render
    const savedName = localStorage.getItem('userName');
    return savedName ? 'dashboard' : 'login';
  });
  
  // State for Data - Persisted
  const [books, setBooks] = useState<Book[]>(() => loadState('books', INITIAL_BOOKS));
  
  // State for UI - Not Persisted
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('reading');

  // State for Stats/Goals - Persisted
  const [yearlyGoal, setYearlyGoal] = useState(() => loadState('yearlyGoal', 30));
  const [dailyPageGoal, setDailyPageGoal] = useState(() => loadState('dailyPageGoal', 50));
  
  // New State: Has the user set their initial goals?
  const [hasSetInitialGoals, setHasSetInitialGoals] = useState(() => loadState('hasSetInitialGoals', false));
  
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

  // Reading History for Charts - Persisted
  const [readingHistory, setReadingHistory] = useState<Record<string, number>>(() => loadState('readingHistory', {}));

  // State for Streak - Persisted
  const [streakCount, setStreakCount] = useState(() => loadState('streakCount', 0));
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(() => loadState('lastStreakDate', null));

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('userName', JSON.stringify(userName));
  }, [userName]);

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
    localStorage.setItem('hasSetInitialGoals', JSON.stringify(hasSetInitialGoals));
  }, [hasSetInitialGoals]);

  useEffect(() => {
    localStorage.setItem('dailyPagesRead', JSON.stringify(dailyPagesRead));
    localStorage.setItem('dailyPagesDate', new Date().toLocaleDateString('tr-TR'));

    // Update History when daily pages change
    const todayKey = getDateKey();
    setReadingHistory(prev => {
      const newHistory = { ...prev, [todayKey]: dailyPagesRead };
      localStorage.setItem('readingHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [dailyPagesRead]);

  useEffect(() => {
    localStorage.setItem('streakCount', JSON.stringify(streakCount));
  }, [streakCount]);

  useEffect(() => {
    localStorage.setItem('lastStreakDate', JSON.stringify(lastStreakDate));
  }, [lastStreakDate]);

  // --- Logic Handlers ---

  const handleLogin = (name: string) => {
    setUserName(name);
    setCurrentView('dashboard');
  };

  const handleUpdateName = (newName: string) => {
    setUserName(newName);
  };

  const formattedUserName = userName ? `${userName}${getSuffix(userName)} Kitaplığı` : 'Kitaplarım Panosu';

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
    const today = getDateKey();

    setBooks(books.map(b => {
      if (b.id === bookId) {
        const updatedBook: Book = { ...b, status };
        
        if (status === 'read') {
          // If marking as read:
          // 1. Ensure Start Date exists (if not, assume started today)
          if (!updatedBook.startDate) updatedBook.startDate = today;
          // 2. Ensure Finish Date exists (set to today if not present)
          if (!updatedBook.finishDate) updatedBook.finishDate = today;
          
        } else if (status === 'reading') {
          // If marking as reading:
          // 1. Ensure Start Date exists (if not, assume started today)
          if (!updatedBook.startDate) updatedBook.startDate = today;
          // 2. Clear Finish Date (it's in progress)
          updatedBook.finishDate = undefined;
          
        } else if (status === 'want-to-read') {
          // If marking as want-to-read:
          // Clear both dates, as reading hasn't genuinely started
          updatedBook.startDate = undefined;
          updatedBook.finishDate = undefined;
        }
        
        return updatedBook;
      }
      return b;
    }));
  };

  const handleUpdateBookDates = (bookId: string, startDate?: string, finishDate?: string) => {
    setBooks(books.map(b => {
      if (b.id === bookId) {
        return { ...b, startDate, finishDate };
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
      
      // Optional: Also add some pages to daily read if not already added
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
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'dashboard':
        return (
          <Dashboard 
            books={books}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBookClick={handleBookClick}
            onAddClick={() => navigateTo('add')}
            onStatsClick={() => navigateTo('stats')}
            onTop100Click={() => navigateTo('top100')}
            dashboardTitle={formattedUserName}
            userName={userName}
            onUpdateName={handleUpdateName}
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
            onUpdateDates={handleUpdateBookDates}
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
            readingHistory={readingHistory}
            streakCount={streakCount}
            hasReadToday={hasReadToday}
            onIncrementStreak={handleIncrementStreak}
            hasSetInitialGoals={hasSetInitialGoals}
            setHasSetInitialGoals={setHasSetInitialGoals}
          />
        );
      case 'top100':
        return (
          <Top100Books 
            onNavClick={(view) => navigateTo(view)}
          />
        );
      default:
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark font-display transition-colors duration-200">
      {renderView()}
    </div>
  );
};

export default App;
