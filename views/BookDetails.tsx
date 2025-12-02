
import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../types';
import RatingStars from '../components/RatingStars';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
  onUpdateStatus: (id: string, status: Book['status']) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onDeleteBook: (id: string) => void;
}

const BookDetails: React.FC<BookDetailsProps> = ({ 
  book, 
  onBack, 
  onUpdateStatus, 
  onUpdateNotes, 
  onToggleFavorite,
  onUpdateRating,
  onDeleteBook
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const statusLabels: Record<string, string> = {
    'reading': 'Şu An Okunanlar',
    'read': 'Okundu',
    'want-to-read': 'Okumak İstiyorum'
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStatus = () => {
    // Simple cycle for demo purposes
    if (book.status === 'reading') onUpdateStatus(book.id, 'read');
    else if (book.status === 'read') onUpdateStatus(book.id, 'want-to-read');
    else onUpdateStatus(book.id, 'reading');
  };

  const startEditing = () => {
    setNotesDraft(book.notes || '');
    setIsEditingNotes(true);
  };

  const cancelEditing = () => {
    setIsEditingNotes(false);
    setNotesDraft('');
  };

  const saveNotes = () => {
    onUpdateNotes(book.id, notesDraft);
    setIsEditingNotes(false);
  };

  const handleShare = async () => {
    setIsMenuOpen(false);
    const shareData = {
      title: 'Kitap Tavsiyesi',
      text: `${book.title} - ${book.author} kitabını okuyorum!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      // Fallback for browsers without share API
      navigator.clipboard.writeText(`${book.title} by ${book.author}`);
      alert('Kitap bilgisi kopyalandı!');
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-zinc-900 dark:text-white">
      <header className="sticky top-0 z-10 flex h-[56px] items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-background-light dark:bg-background-dark px-2">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold">Kitap Detayları</h1>
        <div className="flex items-center relative">
          <button 
            onClick={() => onToggleFavorite(book.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors mr-1"
          >
            <span className={`material-symbols-outlined ${book.isFavorite ? 'text-red-500 material-symbols-filled' : 'text-zinc-500 dark:text-zinc-400'}`}>
              favorite
            </span>
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="material-symbols-outlined">more_horiz</span>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div ref={menuRef} className="absolute top-12 right-0 w-48 bg-white dark:bg-[#1c2127] rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-1">
                <button 
                  onClick={handleShare}
                  className="w-full text-left px-4 py-3 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">share</span>
                  Paylaş
                </button>
                <button 
                  onClick={() => onDeleteBook(book.id)}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Sil
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-48 shadow-xl shadow-black/20 rounded-xl transition-transform hover:scale-[1.02]">
            <div 
              className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl" 
              style={{ backgroundImage: `url("${book.coverUrl}")` }}
            ></div>
          </div>
          
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold leading-tight">{book.title}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">{book.author}</p>
          </div>
          
          <RatingStars 
            rating={book.rating} 
            size="lg" 
            onRate={(r) => onUpdateRating(book.id, r)}
          />
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Açıklama</h3>
            <p className="mt-2 text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {book.description || "Açıklama bulunmamaktadır."}
            </p>
          </div>

          <div className="flex justify-between items-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4">
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Okuma Durumu</span>
              <span className="font-bold text-primary">{statusLabels[book.status]}</span>
            </div>
            <button onClick={toggleStatus} className="text-primary font-bold text-sm hover:underline">Değiştir</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Başlangıç Tarihi</p>
              <p className="font-semibold">{book.startDate || "-"}</p>
            </div>
            <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Bitiş Tarihi</p>
              <p className="font-semibold">{book.finishDate || "-"}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Kişisel Notlar</h3>
                {book.notesLastUpdated && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    ({book.notesLastUpdated})
                  </span>
                )}
              </div>
              
              {isEditingNotes ? (
                <button onClick={cancelEditing} className="text-red-500 font-bold text-sm hover:underline">Vazgeç</button>
              ) : (
                <button onClick={startEditing} className="text-primary font-bold text-sm hover:underline">Düzenle</button>
              )}
            </div>
            
            {isEditingNotes ? (
              <div className="flex flex-col gap-3">
                <textarea 
                  className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 p-4 min-h-[120px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Notlarınızı buraya yazın..."
                  autoFocus
                />
                <button 
                  onClick={saveNotes}
                  className="self-end px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                  Kaydet
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4 min-h-[120px]">
                <p className="text-zinc-800 dark:text-zinc-200 italic whitespace-pre-wrap">
                  {book.notes || "Henüz not eklenmedi."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookDetails;
