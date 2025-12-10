import React, { useState } from 'react';
import { Book, TabType, ViewState, Translation } from '../types';
import RatingStars from '../components/RatingStars';

interface DashboardProps {
  userName: string;
  books: Book[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onBookClick: (id: string) => void;
  onAddClick: () => void;
  onNavClick: (view: ViewState) => void;
  newlyAddedBookId: string | null;
  t: Translation;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userName,
  books, 
  activeTab, 
  setActiveTab, 
  onBookClick, 
  onAddClick,
  onNavClick,
  newlyAddedBookId,
  t
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter & Sort State
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOption, setSortOption] = useState<'date-desc' | 'date-asc' | 'alpha'>('date-desc');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Helper to determine the date used for sorting based on the active tab
  const getSortDate = (book: Book) => {
      // Prioritize relevant dates based on tab
      if (activeTab === 'read' && book.finishDate) return new Date(book.finishDate).getTime();
      if (activeTab === 'reading' && book.startDate) return new Date(book.startDate).getTime();
      // Fallback: Use year if available (approximate), otherwise 0
      if (book.year) return new Date(book.year, 0, 1).getTime();
      return 0;
  };

  const filteredBooks = books
    .filter(book => book.status === activeTab)
    .filter(book => {
        // Filter by Favorites
        if (showFavoritesOnly && !book.isFavorite) return false;

        // Search Logic (Title, Author, Genre)
        const q = searchQuery.toLowerCase();
        return (
            book.title.toLowerCase().includes(q) || 
            book.author.toLowerCase().includes(q) ||
            (book.genre && book.genre.toLowerCase().includes(q))
        );
    })
    .sort((a, b) => {
        if (sortOption === 'alpha') {
            return a.title.localeCompare(b.title);
        }

        const dateA = getSortDate(a);
        const dateB = getSortDate(b);

        if (sortOption === 'date-desc') return dateB - dateA; // Newest first
        return dateA - dateB; // Oldest first
    });

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'reading', label: t.tab_reading },
    { id: 'read', label: t.tab_read },
    { id: 'want-to-read', label: t.tab_want_to_read },
  ];

  // Helper to generate possessive suffix (Ahmet'in, Ali'nin, vb.) only if Turkish
  const getDashboardTitle = () => {
     if (!userName) return t.my_library;
     
     if (t.my_library !== 'Kitaplığı') { 
         return `${userName}`; 
     }

     const lastWord = userName.trim().split(' ').pop() || userName;
     const lastLetter = lastWord.slice(-1).toLowerCase();
    
     // Turkish Vowel Harmony Logic
     const isVowelEnding = ['a','ı','e','i','o','u','ö','ü'].includes(lastLetter);
     const vowels = lastWord.match(/[aıeiouöü]/gi);
     const lastVowel = vowels ? vowels.pop()?.toLowerCase() : 'e'; 

     let suffix = '';
     if (lastVowel === 'a' || lastVowel === 'ı') suffix = 'ın';
     else if (lastVowel === 'e' || lastVowel === 'i') suffix = 'in';
     else if (lastVowel === 'o' || lastVowel === 'u') suffix = 'un';
     else if (lastVowel === 'ö' || lastVowel === 'u') suffix = 'ün';

     const buffer = isVowelEnding ? 'n' : '';
     return `${userName}'${buffer}${suffix} Kitaplığı`;
  };

  const dashboardTitle = getDashboardTitle();

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-24">
      
      {/* Unified Sticky Header Block */}
      <div className="sticky top-0 z-20 bg-background-light dark:bg-background-dark shadow-sm">
        
        {/* 1. Main Header - Material Design Style (Left Aligned) */}
        <div className="flex items-center justify-between px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)] border-b border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm">
            {isSearchOpen ? (
            <div className="flex flex-1 items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                <button 
                  onClick={handleCloseSearch}
                  className="p-2 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-zinc-600 dark:text-zinc-300">arrow_back</span>
                </button>
                <div className="relative flex-1">
                  <input 
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.search_placeholder}
                      className="w-full h-10 pl-4 pr-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-white placeholder:text-zinc-500 text-base"
                  />
                </div>
            </div>
            ) : (
            <>
                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                <h2 className="text-zinc-900 dark:text-white text-2xl font-bold leading-tight tracking-tight animate-in fade-in slide-in-from-left-4 duration-200 truncate">
                    {dashboardTitle}
                </h2>
                </div>
                
                <div className="flex items-center gap-1">
                    <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
                    >
                    <span className="material-symbols-outlined text-2xl text-zinc-900 dark:text-white">search</span>
                    </button>
                    
                    {/* Import Button */}
                    <button 
                    onClick={() => onNavClick('import')}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0 text-zinc-500 dark:text-zinc-400"
                    title="Bulk Import"
                    >
                    <span className="material-symbols-outlined text-2xl">upload_file</span>
                    </button>

                    {/* Add Book Button */}
                    <button 
                    onClick={onAddClick}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0 text-primary"
                    >
                    <span className="material-symbols-outlined text-3xl material-symbols-filled">add_circle</span>
                    </button>

                    {/* Settings Button */}
                    <button 
                    onClick={() => onNavClick('settings')}
                    className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
                    >
                    <span className="material-symbols-outlined text-2xl text-zinc-900 dark:text-white">settings</span>
                    </button>
                </div>
            </>
            )}
        </div>

        {/* 2. Tabs - Android Tabs style (Ripple effect usually, but strict border here is fine) */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-700/80 px-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center pb-3 pt-4 border-b-[3px] transition-all active:bg-zinc-100 dark:active:bg-zinc-800 ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-wide whitespace-nowrap uppercase">{tab.label}</p>
            </button>
          ))}
        </div>

        {/* 3. Filters Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800/50">
           <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              {filteredBooks.length} {t.book_count_label}
           </span>
           
           <div className="flex items-center gap-2">
              {/* Favorite Filter Toggle */}
              <button 
                 onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                 className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${showFavoritesOnly ? 'bg-red-500/10 text-red-500' : 'text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                 title={t.filter_favorites}
              >
                 <span className={`material-symbols-outlined text-xl ${showFavoritesOnly ? 'material-symbols-filled' : ''}`}>favorite</span>
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                 <button 
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    className={`flex items-center gap-1 h-8 px-2 rounded-lg transition-colors ${sortOption !== 'date-desc' ? 'bg-primary/10 text-primary' : 'text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                 >
                    <span className="material-symbols-outlined text-xl">sort</span>
                 </button>

                 {isSortMenuOpen && (
                    <>
                       <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>
                       <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-card-dark rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                          <button 
                             onClick={() => { setSortOption('date-desc'); setIsSortMenuOpen(false); }}
                             className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between ${sortOption === 'date-desc' ? 'text-primary bg-primary/5' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                          >
                             <span>{t.sort_newest}</span>
                             {sortOption === 'date-desc' && <span className="material-symbols-outlined text-lg">check</span>}
                          </button>
                          <button 
                             onClick={() => { setSortOption('date-asc'); setIsSortMenuOpen(false); }}
                             className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between ${sortOption === 'date-asc' ? 'text-primary bg-primary/5' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                          >
                             <span>{t.sort_oldest}</span>
                             {sortOption === 'date-asc' && <span className="material-symbols-outlined text-lg">check</span>}
                          </button>
                          <button 
                             onClick={() => { setSortOption('alpha'); setIsSortMenuOpen(false); }}
                             className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between ${sortOption === 'alpha' ? 'text-primary bg-primary/5' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                          >
                             <span>{t.sort_az}</span>
                             {sortOption === 'alpha' && <span className="material-symbols-outlined text-lg">check</span>}
                          </button>
                       </div>
                    </>
                 )}
              </div>
           </div>
        </div>

      </div>

      {/* Grid */}
      <div className="flex-1 p-4">
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {filteredBooks.map((book) => {
              const isNew = book.id === newlyAddedBookId;
              
              return (
                <div 
                  key={book.id} 
                  className={`flex flex-col gap-2 cursor-pointer group rounded-xl p-2 -m-2 transition-all duration-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 
                    ${isNew ? 'animate-in fade-in slide-in-from-bottom-8 duration-700' : ''}`}
                  onClick={() => onBookClick(book.id)}
                >
                  <div 
                    className={`w-full aspect-[3/4] bg-zinc-200 dark:bg-zinc-800 bg-center bg-no-repeat bg-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 relative overflow-hidden
                      ${isNew ? 'ring-2 ring-primary ring-offset-2 ring-offset-background-light dark:ring-offset-background-dark' : ''}`}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{ backgroundImage: `url("${book.coverUrl}")` }}
                    />
                    {/* Favorite Badge on Cover */}
                    {book.isFavorite && (
                      <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm p-1 rounded-full">
                        <span className="material-symbols-outlined text-red-500 text-sm material-symbols-filled" style={{ fontSize: '16px' }}>favorite</span>
                      </div>
                    )}
                    {/* Progress Badge if reading */}
                    {book.status === 'reading' && book.totalPages && book.totalPages > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/50">
                        <div 
                           className="h-full bg-green-500" 
                           style={{ width: `${Math.min(((book.currentPage || 0) / book.totalPages) * 100, 100)}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-zinc-900 dark:text-white text-base font-medium leading-normal truncate">
                      {book.title}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal leading-normal truncate">
                      {book.author}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <RatingStars rating={book.rating} size="sm" />
                      {book.currentPage && book.status === 'reading' && book.currentPage > 0 ? (
                        <span className="text-[10px] text-zinc-400 font-medium">{book.currentPage} {t.page}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-600 mb-4">menu_book</span>
            <p className="text-zinc-900 dark:text-white font-medium text-lg">{t.empty_state_title}</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              {searchQuery ? t.not_found : t.empty_state_desc}
            </p>
          </div>
        )}
      </div>
      
       {/* Bottom Navigation */}
       <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-background-light/95 dark:bg-[#101922]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 h-20 z-40 pb-safe">
        <button 
          onClick={() => onNavClick('dashboard')}
          className="flex flex-col items-center justify-center gap-1 w-20 text-primary dark:text-white active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl material-symbols-filled">home</span>
          <span className="text-[10px] font-bold">{t.nav_home}</span>
        </button>

        <button 
          onClick={() => onNavClick('reading-list-100')}
          className="relative -top-4 active:scale-95 transition-transform"
        >
           <div className="flex flex-col items-center justify-center h-16 w-16 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg shadow-black/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-transform border-4 border-background-light dark:border-background-dark">
              <span className="text-xl font-black leading-none tracking-tighter">100</span>
              <span className="text-[8px] font-bold uppercase tracking-wide opacity-80 mt-0.5">{t.nav_list}</span>
           </div>
        </button>

        <button 
          onClick={() => onNavClick('stats')} 
          className="flex flex-col items-center justify-center gap-1 w-20 text-zinc-500 dark:text-zinc-500 hover:text-primary dark:hover:text-white transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">emoji_events</span>
          <span className="text-[10px] font-medium">{t.nav_stats}</span>
        </button>
      </nav>

    </div>
  );
};

export default Dashboard;