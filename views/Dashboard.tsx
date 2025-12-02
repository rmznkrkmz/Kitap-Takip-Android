
import React, { useState } from 'react';
import { Book, TabType } from '../types';
import RatingStars from '../components/RatingStars';

interface DashboardProps {
  books: Book[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onBookClick: (id: string) => void;
  onAddClick: () => void;
  onStatsClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  books, 
  activeTab, 
  setActiveTab, 
  onBookClick, 
  onAddClick,
  onStatsClick
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = books.filter(book => {
    const matchesTab = book.status === activeTab;
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'reading', label: 'Şu An Okunanlar' },
    { id: 'read', label: 'Okundu' },
    { id: 'want-to-read', label: 'Okumak İstiyorum' },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background-light dark:bg-background-dark p-4 pb-2 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm h-[72px]">
        {isSearchOpen ? (
          <div className="flex flex-1 items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">search</span>
              <input 
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kitap veya yazar ara..."
                className="w-full h-10 pl-10 pr-4 rounded-full bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-white placeholder:text-zinc-500 text-sm"
              />
            </div>
            <button 
              onClick={handleCloseSearch}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors text-sm font-medium"
            >
              Vazgeç
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-zinc-900 dark:text-white text-2xl font-bold leading-tight tracking-tight animate-in fade-in slide-in-from-left-4 duration-200">Kitaplarım Panosu</h2>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="material-symbols-outlined text-2xl text-zinc-900 dark:text-white">search</span>
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="sticky top-[72px] z-10 bg-background-light dark:bg-background-dark">
        <div className="flex border-b border-zinc-200 dark:border-zinc-700/80 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center pb-3 pt-4 border-b-[3px] transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <p className="text-sm font-bold leading-normal tracking-wide whitespace-nowrap">{tab.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 p-4">
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {filteredBooks.map((book) => (
              <div 
                key={book.id} 
                className="flex flex-col gap-2 cursor-pointer group"
                onClick={() => onBookClick(book.id)}
              >
                <div 
                  className="w-full aspect-[3/4] bg-zinc-200 dark:bg-zinc-800 bg-center bg-no-repeat bg-cover rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300 relative overflow-hidden"
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
                </div>
                <div>
                  <p className="text-zinc-900 dark:text-white text-base font-medium leading-normal truncate">
                    {book.title}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm font-normal leading-normal truncate">
                    {book.author}
                  </p>
                  <div className="mt-1">
                    <RatingStars rating={book.rating} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <span className="material-symbols-outlined text-6xl text-zinc-300 dark:text-zinc-600 mb-4">menu_book</span>
            <p className="text-zinc-900 dark:text-white font-medium text-lg">Kitap bulunamadı</p>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
              {searchQuery ? `"${searchQuery}" için sonuç yok.` : 'Bu kategoride henüz kitap yok.'}
            </p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="mt-4 text-primary font-bold text-sm"
              >
                Aramayı Temizle
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button 
          onClick={onAddClick}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>add</span>
        </button>
      </div>
      
       {/* Bottom Navigation for Stats Demo */}
       <div className="fixed bottom-6 left-6 z-30">
        <button 
          onClick={onStatsClick}
          className="flex h-12 px-4 gap-2 items-center justify-center rounded-full bg-card-dark text-white shadow-lg border border-zinc-700 hover:bg-zinc-800 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">bar_chart</span>
          <span className="text-sm font-medium">İstatistikler</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
