
import React, { useState, useEffect } from 'react';
import { Book, ViewState, TabType, LanguageCode } from './types';
import { INITIAL_BOOKS } from './constants';
import { TRANSLATIONS } from './translations';
import Dashboard from './views/Dashboard';
import AddBook from './views/AddBook';
import BookDetails from './views/BookDetails';
import Stats from './views/Stats';
import Login from './views/Login';
import ReadingList100 from './views/ReadingList100';
import Settings from './views/Settings';
import ImportBooks from './views/ImportBooks';

// Helper to get consistent YYYY-MM-DD string regardless of locale
const getTodayISO = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

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
  // Language State - Persisted
  const [language, setLanguage] = useState<LanguageCode>(() => loadState('appLanguage', 'tr'));

  // User Profile State - Persisted
  const [userName, setUserName] = useState<string>(() => loadState('userName', ''));

  // State for Navigation
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    const savedName = loadState('userName', '');
    return savedName ? 'dashboard' : 'login';
  });
  
  // State for Data - Persisted
  const [books, setBooks] = useState<Book[]>(() => loadState('books', INITIAL_BOOKS));
  
  // State for UI - Not Persisted
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('reading');
  const [newlyAddedBookId, setNewlyAddedBookId] = useState<string | null>(null);

  // State for Stats/Goals - Persisted
  const [yearlyGoal, setYearlyGoal] = useState(() => loadState('yearlyGoal', 30));
  const [dailyPageGoal, setDailyPageGoal] = useState(() => loadState('dailyPageGoal', 50));
  
  const [hasSetGoals, setHasSetGoals] = useState(() => loadState('hasSetGoals', false));
  
  // Daily Pages Read - Persisted with Date Check (Reset on new day)
  const [dailyPagesRead, setDailyPagesRead] = useState(() => {
    try {
      const savedDate = localStorage.getItem('dailyPagesDate');
      const today = getTodayISO(); // Use ISO format
      // If the saved date is not today, reset count to 0
      if (savedDate !== today) {
        return 0;
      }
      return loadState('dailyPagesRead', 0);
    } catch (e) {
      return 0;
    }
  });

  // Reading History (Date -> Page Count map) for Charts
  const [readingHistory, setReadingHistory] = useState<Record<string, number>>(() => loadState('readingHistory', {}));

  // State for Streak - Persisted
  const [streakCount, setStreakCount] = useState(() => loadState('streakCount', 0));
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(() => loadState('lastStreakDate', null));

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('appLanguage', JSON.stringify(language));
  }, [language]);

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
    localStorage.setItem('hasSetGoals', JSON.stringify(hasSetGoals));
  }, [hasSetGoals]);

  useEffect(() => {
    // 1. Save current daily count
    localStorage.setItem('dailyPagesRead', JSON.stringify(dailyPagesRead));
    
    // 2. Update date tracker with ISO format
    const todayStr = getTodayISO();
    localStorage.setItem('dailyPagesDate', todayStr);

    // 3. Update History (Key format: YYYY-MM-DD)
    setReadingHistory(prev => {
      // Only update if value changed to avoid unnecessary writes/renders
      if (prev[todayStr] === dailyPagesRead) return prev;
      
      const newHistory = { ...prev, [todayStr]: dailyPagesRead };
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

  // --- Navigation Handlers ---
  const navigateTo = (view: ViewState) => {
    setCurrentView(view);
    if (view !== 'dashboard') {
        setTimeout(() => setNewlyAddedBookId(null), 500);
    }
  };

  const handleLogin = (name: string) => {
    setUserName(name);
    navigateTo('dashboard');
  };

  const handleBookClick = (bookId: string) => {
    setSelectedBookId(bookId);
    navigateTo('details');
  };

  const handleAddBook = (newBook: Book) => {
    setBooks([newBook, ...books]);
    setNewlyAddedBookId(newBook.id);
    navigateTo('dashboard');
    setTimeout(() => {
      setNewlyAddedBookId(null);
    }, 2000); 
  };

  const handleImportBooks = (newBooks: Book[]) => {
    setBooks(prev => [...newBooks, ...prev]);
    // Optionally highlight the first imported book
    if (newBooks.length > 0) {
        setNewlyAddedBookId(newBooks[0].id);
        setTimeout(() => setNewlyAddedBookId(null), 3000);
    }
    navigateTo('dashboard');
  };

  const handleEditBook = (updatedBook: Book) => {
    setBooks(books.map(b => b.id === updatedBook.id ? updatedBook : b));
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks(books.filter(b => b.id !== bookId));
    navigateTo('dashboard');
  };

  const handleUpdateBookStatus = (bookId: string, status: Book['status']) => {
    setBooks(books.map(b => {
      if (b.id === bookId) {
        const updatedBook = { ...b, status };
        const formattedDate = getTodayISO();
        
        if (status === 'reading') {
            if (!updatedBook.startDate) {
                updatedBook.startDate = formattedDate;
            }
            updatedBook.finishDate = undefined;
        } 
        else if (status === 'read') {
            if (!updatedBook.startDate) {
                updatedBook.startDate = formattedDate;
            }
            if (b.status !== 'read') {
                updatedBook.finishDate = formattedDate;
            }
        } 
        else if (status === 'want-to-read') {
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
        return { 
          ...b, 
          startDate: startDate !== undefined ? startDate : b.startDate,
          finishDate: finishDate !== undefined ? finishDate : b.finishDate
        };
      }
      return b;
    }));
  };

  const handleUpdateBookProgress = (bookId: string, currentPage: number, totalPages?: number) => {
      setBooks(books.map(b => {
          if (b.id === bookId) {
              const updated = { ...b, currentPage };
              if (totalPages !== undefined) updated.totalPages = totalPages;
              
              // Add difference to daily stats if increasing pages
              // NOTE: This logic assumes 'currentPage' is always accurate. 
              // If user corrects a typo (e.g. 100 -> 10), we don't subtract from daily stats to avoid complex ledger logic.
              if (currentPage > (b.currentPage || 0)) {
                  const diff = currentPage - (b.currentPage || 0);
                  setDailyPagesRead(dailyPagesRead + diff);
              }
              
              return updated;
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
    const today = getTodayISO();
    
    // If different date, allow increment
    if (lastStreakDate !== today) {
      setStreakCount(prev => prev + 1);
      setLastStreakDate(today);
      
      if (dailyPagesRead === 0) {
        setDailyPagesRead(10);
      }
    }
  };

  // Check if streak is already claimed for today
  const hasReadToday = lastStreakDate === getTodayISO();

  // --- I18N Logic ---
  const t = TRANSLATIONS[language];

  const renderView = () => {
    switch (currentView) {
      case 'login':
        return (
          <Login 
            onLogin={handleLogin} 
            language={language}
            setLanguage={setLanguage}
            t={t}
          />
        );
      case 'dashboard':
        return (
          <Dashboard 
            userName={userName}
            books={books}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBookClick={handleBookClick}
            onAddClick={() => navigateTo('add')}
            onNavClick={(view) => navigateTo(view)}
            newlyAddedBookId={newlyAddedBookId}
            t={t}
          />
        );
      case 'add':
        return (
          <AddBook 
            onBack={() => navigateTo('dashboard')}
            onSave={handleAddBook}
            t={t}
          />
        );
      case 'import':
        return (
          <ImportBooks 
            onBack={() => navigateTo('dashboard')}
            onImport={handleImportBooks}
            t={t}
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
            onEditBook={handleEditBook}
            onDelete={() => handleDeleteBook(selectedBook.id)}
            onUpdateProgress={handleUpdateBookProgress}
            t={t}
            language={language}
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
            readingHistory={readingHistory}
            hasSetGoals={hasSetGoals}
            onCompleteGoals={() => setHasSetGoals(true)}
            t={t}
            language={language}
          />
        );
      case 'reading-list-100':
        return (
          <ReadingList100 
            onNavClick={(view) => navigateTo(view)}
            t={t}
            language={language}
          />
        );
      case 'settings':
        return (
          <Settings 
             onBack={() => navigateTo('dashboard')}
             currentLanguage={language}
             setLanguage={setLanguage}
             userName={userName}
             setUserName={setUserName}
             t={t}
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
