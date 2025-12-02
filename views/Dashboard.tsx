
import React, { useState } from 'react';
import { Book, TabType, ViewState } from '../types';
import RatingStars from '../components/RatingStars';

interface DashboardProps {
  books: Book[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onBookClick: (id: string) => void;
  onAddClick: () => void;
  onStatsClick: () => void;
  onTop100Click: () => void;
  dashboardTitle: string;
  userName: string;
  onUpdateName: (name: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  books, 
  activeTab, 
  setActiveTab, 
  onBookClick, 
  onAddClick,
  onStatsClick,
  onTop100Click,
  dashboardTitle,
  userName,
  onUpdateName
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Name Editing State
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');

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

  const openNameEdit = () => {
    setNameInput(userName);
    setIsNameModalOpen(true);
  };

  const saveNameEdit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
      setIsNameModalOpen(false);
    }
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
            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
              <h2 className="text-zinc-900 dark:text-white text-xl font-bold leading-tight tracking-tight truncate">
                {dashboardTitle}
              </h2>
              <button 
                onClick={openNameEdit}
                className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
              </button>
            </div>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
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
      <div className="fixed bottom-24 right-6 z-30">
        <button 
          onClick={onAddClick}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 500" }}>add</span>
        </button>
      </div>
      
       {/* Bottom Navigation */}
       <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-end bg-background-light/90 dark:bg-[#101922]/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 h-20 pb-4 z-40">
        <button className="flex flex-col items-center justify-center gap-1 w-20 text-primary transition-colors">
          <span className="material-symbols-outlined material-symbols-filled">home</span>
          <span className="text-[10px] font-bold">Anasayfa</span>
        </button>

        {/* 100 Button */}
        <div className="relative -top-5">
           <button 
             onClick={onTop100Click}
             className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transform transition-transform hover:scale-110 active:scale-95 border-4 border-background-light dark:border-background-dark"
           >
             <span className="text-sm font-black tracking-tighter">100</span>
           </button>
        </div>

        <button 
          onClick={onStatsClick} 
          className="flex flex-col items-center justify-center gap-1 w-20 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">emoji_events</span>
          <span className="text-[10px] font-medium">Başarılar</span>
        </button>
      </nav>

      {/* Edit Name Modal */}
      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-[#1c2127] border border-zinc-200 dark:border-zinc-700 w-full max-w-xs rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">İsim Düzenle</h3>
              <form onSubmit={saveNameEdit} className="flex flex-col gap-4">
                <input 
                   type="text" 
                   value={nameInput}
                   onChange={(e) => setNameInput(e.target.value)}
                   className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white rounded-lg py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                   placeholder="Adınız"
                   autoFocus
                />
                <div className="flex gap-2 justify-end mt-2">
                   <button 
                     type="button"
                     onClick={() => setIsNameModalOpen(false)}
                     className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors"
                   >
                     Vazgeç
                   </button>
                   <button 
                     type="submit"
                     disabled={!nameInput.trim()}
                     className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                   >
                     Kaydet
                   </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
