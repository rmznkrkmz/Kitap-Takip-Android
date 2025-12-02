
import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { TOP_100_BOOKS } from '../constants';

interface Top100BooksProps {
  onNavClick: (view: ViewState) => void;
}

const Top100Books: React.FC<Top100BooksProps> = ({ onNavClick }) => {
  
  // State to track checked books (store as array of "Title-Author" strings)
  const [markedBooks, setMarkedBooks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('top100Progress');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('top100Progress', JSON.stringify(markedBooks));
  }, [markedBooks]);

  const toggleBook = (title: string, author: string) => {
    const id = `${title}-${author}`;
    setMarkedBooks(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation(); // Prevent toggling the book when clicking copy
    navigator.clipboard.writeText(text);
    // Optional: Visual feedback could be added here
  };

  // Calculate Progress
  const totalBooks = TOP_100_BOOKS.reduce((acc, cat) => acc + cat.books.length, 0);
  const completedBooks = markedBooks.length;
  const progressPercentage = Math.round((completedBooks / totalBooks) * 100);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display text-zinc-900 dark:text-white">
      
      <header className="sticky top-0 z-20 flex flex-col bg-background-light/95 backdrop-blur-sm dark:bg-background-dark/95 border-b border-zinc-200/50 dark:border-zinc-800/50 shadow-sm">
        <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Ölmeden Önce 100 Kitap
            </h1>
            <div className="h-8 w-8 flex items-center justify-center bg-primary/10 rounded-full">
                <span className="material-symbols-outlined text-primary text-xl">library_books</span>
            </div>
        </div>
        
        {/* Progress Bar */}
        <div className="px-4 pb-3">
            <div className="flex justify-between items-end mb-1">
                <span className="text-xs font-medium text-zinc-500">İlerleme Durumu</span>
                <span className="text-xs font-bold text-primary">%{progressPercentage} ({completedBooks}/{totalBooks})</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 pb-24 space-y-8">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-zinc-600 dark:text-zinc-300">
           <p><span className="font-bold text-primary">Bilgi:</span> Listeden okuduğunuz kitapların üzerine tıklayarak işaretleyebilirsiniz.</p>
        </div>

        {TOP_100_BOOKS.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="text-lg font-bold text-primary sticky top-28 bg-background-light dark:bg-background-dark py-2 z-10 border-b border-dashed border-zinc-300 dark:border-zinc-700 shadow-[0_10px_10px_-10px_rgba(0,0,0,0.05)]">
              {section.category}
            </h2>
            <div className="grid gap-3">
              {section.books.map((book, bookIdx) => {
                const id = `${book.title}-${book.author}`;
                const isMarked = markedBooks.includes(id);

                return (
                    <div 
                    key={bookIdx}
                    onClick={() => toggleBook(book.title, book.author)}
                    className={`group flex items-center gap-3 p-4 rounded-xl border shadow-sm transition-all cursor-pointer active:scale-[0.99] ${
                        isMarked 
                        ? 'bg-green-50 dark:bg-green-900/10 border-green-500/50 shadow-green-500/10' 
                        : 'bg-white dark:bg-card-dark border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md'
                    }`}
                    >
                    {/* Checkbox Icon */}
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                        isMarked 
                        ? 'border-green-500 bg-green-500 text-white' 
                        : 'border-zinc-300 dark:border-zinc-600 text-transparent group-hover:border-primary'
                    }`}>
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-base leading-tight transition-colors duration-300 ${isMarked ? 'text-green-600 dark:text-green-400' : 'group-hover:text-primary'}`}>
                            {book.title}
                        </div>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 block truncate">
                            {book.author}
                        </span>
                    </div>

                    <button 
                        onClick={(e) => handleCopy(e, `${book.title} - ${book.author}`)}
                        className="p-2 rounded-full text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                        title="İsmi Kopyala"
                    >
                        <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                    </div>
                );
              })}
            </div>
          </section>
        ))}
        
        <div className="text-center text-xs text-zinc-400 py-4 opacity-50">
           Kaynak: The World Library (Norveç Kitap Kulübü)
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-end bg-background-light/90 dark:bg-[#101922]/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 h-20 pb-4 z-40">
        <button 
          onClick={() => onNavClick('dashboard')} 
          className="flex flex-col items-center justify-center gap-1 w-20 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium">Anasayfa</span>
        </button>

        {/* 100 Button - Active State */}
        <div className="relative -top-5">
           <button 
             className="flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/20 transform scale-110 border-4 border-background-light dark:border-background-dark"
           >
             <span className="text-sm font-black tracking-tighter">100</span>
           </button>
        </div>

        <button 
          onClick={() => onNavClick('stats')} 
          className="flex flex-col items-center justify-center gap-1 w-20 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">emoji_events</span>
          <span className="text-[10px] font-medium">Başarılar</span>
        </button>
      </nav>
    </div>
  );
};

export default Top100Books;
