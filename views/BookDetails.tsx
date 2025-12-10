import React, { useState, useRef, useEffect } from 'react';
import { Book, Translation, LanguageCode } from '../types';
import RatingStars from '../components/RatingStars';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
  onUpdateStatus: (id: string, status: Book['status']) => void;
  onUpdateDates: (id: string, startDate?: string, finishDate?: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onEditBook: (book: Book) => void;
  onDelete: () => void;
  onUpdateProgress: (id: string, currentPage: number, totalPages?: number) => void;
  t: Translation;
  language: LanguageCode;
}

// Helper to map app language code to standard locale string
const getLocale = (lang: LanguageCode) => {
  switch (lang) {
    case 'tr': return 'tr-TR';
    case 'en': return 'en-US';
    case 'fr': return 'fr-FR';
    case 'it': return 'it-IT';
    case 'de': return 'de-DE';
    default: return 'tr-TR';
  }
};

const BookDetails: React.FC<BookDetailsProps> = ({ 
  book, 
  onBack, 
  onUpdateStatus, 
  onUpdateDates,
  onUpdateNotes, 
  onToggleFavorite,
  onUpdateRating,
  onEditBook,
  onDelete,
  onUpdateProgress,
  t,
  language
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  
  // Animation States
  const [favoriteAnim, setFavoriteAnim] = useState(false);

  // Page Tracking State
  const [currentPageInput, setCurrentPageInput] = useState(book.currentPage?.toString() || '0');
  const [totalPagesInput, setTotalPagesInput] = useState(book.totalPages?.toString() || '');
  const [isEditingProgress, setIsEditingProgress] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Book>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Date editing state for quick edits
  const [editingDateType, setEditingDateType] = useState<'start' | 'finish' | null>(null);
  const [tempDate, setTempDate] = useState('');

  const statusLabels: Record<string, string> = {
    'reading': t.tab_reading,
    'read': t.tab_read,
    'want-to-read': t.tab_want_to_read
  };

  useEffect(() => {
    setCurrentPageInput(book.currentPage?.toString() || '0');
    setTotalPagesInput(book.totalPages?.toString() || '');
  }, [book.currentPage, book.totalPages]);

  // Format date string (YYYY-MM-DD) to locale display format
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      // Use numeric format to satisfy "gg.aa.yyyy" request but localized
      return new Intl.DateTimeFormat(getLocale(language), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // --- Image Processing Logic ---
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                const scaleSize = MAX_WIDTH / img.width;
                const newWidth = MAX_WIDTH;
                const newHeight = img.height * scaleSize;

                canvas.width = newWidth;
                canvas.height = newHeight;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, newWidth, newHeight);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
  };

  const toggleStatus = () => {
    if (book.status === 'reading') onUpdateStatus(book.id, 'read');
    else if (book.status === 'read') onUpdateStatus(book.id, 'want-to-read');
    else onUpdateStatus(book.id, 'reading');
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFavoriteAnim(true);
      onToggleFavorite(book.id);
      setTimeout(() => setFavoriteAnim(false), 300);
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

  // Date handlers
  const startEditingDate = (type: 'start' | 'finish') => {
    setEditingDateType(type);
    setTempDate(type === 'start' ? (book.startDate || '') : (book.finishDate || ''));
  };

  const saveDate = () => {
    if (editingDateType === 'start') {
      onUpdateDates(book.id, tempDate, undefined);
    } else if (editingDateType === 'finish') {
      onUpdateDates(book.id, undefined, tempDate);
    }
    setEditingDateType(null);
  };

  const cancelDateEdit = () => {
    setEditingDateType(null);
    setTempDate('');
  };

  // Progress Handlers
  const handleProgressSave = () => {
      const cur = parseInt(currentPageInput) || 0;
      const tot = parseInt(totalPagesInput);
      
      const validTotal = !isNaN(tot) && tot > 0 ? tot : undefined;
      const validCurrent = Math.min(cur, validTotal || cur);

      // Auto-update status to read if finished
      if (validTotal && validCurrent >= validTotal && book.status !== 'read') {
          if (window.confirm("Status update?")) { // Using simple confirm as fallback logic inside handler, UI handled by modal
              onUpdateStatus(book.id, 'read');
          }
      }

      onUpdateProgress(book.id, validCurrent, validTotal);
      setIsEditingProgress(false);
  };

  // --- Edit Modal Handlers ---
  const openEditModal = () => {
      setEditFormData({
          title: book.title,
          author: book.author,
          year: book.year,
          genre: book.genre,
          description: book.description,
          coverUrl: book.coverUrl,
          totalPages: book.totalPages
      });
      setShowMenu(false);
      setIsEditModalOpen(true);
  };

  const handleEditFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingImg(true);
      try {
          const base64Image = await processImage(file);
          setEditFormData(prev => ({ ...prev, coverUrl: base64Image }));
      } catch (error) {
          console.error("Görsel işlenirken hata:", error);
          alert("Görsel yüklenirken bir sorun oluştu.");
      } finally {
          setIsProcessingImg(false);
      }
    }
  };

  const saveEdit = () => {
      if (!editFormData.title || !editFormData.author) {
          alert("Başlık ve Yazar boş olamaz.");
          return;
      }
      onEditBook({
          ...book,
          ...editFormData as Book
      });
      setIsEditModalOpen(false);
  };

  // Progress Calculation
  const progressPercent = book.totalPages && book.totalPages > 0 
    ? Math.min(((book.currentPage || 0) / book.totalPages) * 100, 100) 
    : 0;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark text-zinc-900 dark:text-white" onClick={() => setShowMenu(false)}>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setIsDeleteModalOpen(false)}
            role="dialog"
            aria-modal="true"
        >
           <div 
               className="w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-700"
               onClick={(e) => e.stopPropagation()}
           >
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
                      <span className="material-symbols-outlined text-2xl">warning</span>
                  </div>
                  <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{t.delete_confirm_title}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          "{book.title}" {t.delete_confirm_desc} <br/>
                          <span className="text-red-500 dark:text-red-400 font-medium">{t.delete_irreversible}</span>
                      </p>
                  </div>
              </div>
              <div className="flex gap-3">
                 <button 
                   onClick={() => setIsDeleteModalOpen(false)}
                   className="flex-1 h-11 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold hover:opacity-90 transition-opacity"
                 >
                   {t.cancel}
                 </button>
                 <button 
                   onClick={onDelete}
                   className="flex-1 h-11 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                 >
                   {t.delete}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" 
            onClick={() => setIsEditModalOpen(false)}
        >
           <div 
               className="w-full max-w-lg bg-white dark:bg-card-dark rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 flex flex-col max-h-[90vh]"
               onClick={(e) => e.stopPropagation()}
           >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold">{t.edit}</h3>
                  <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 hover:text-red-500">
                      <span className="material-symbols-outlined">close</span>
                  </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-4">
                  {/* Image Edit */}
                  <div className="flex flex-col items-center gap-2">
                       <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleEditFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className="w-32 h-44 bg-zinc-200 dark:bg-zinc-800 rounded-lg bg-cover bg-center cursor-pointer relative group overflow-hidden border border-zinc-300 dark:border-zinc-600"
                         style={{ backgroundImage: `url("${editFormData.coverUrl}")` }}
                       >
                           <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="material-symbols-outlined text-white text-3xl">edit</span>
                           </div>
                           {isProcessingImg && (
                               <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                   <span className="material-symbols-outlined animate-spin text-white">progress_activity</span>
                               </div>
                           )}
                       </div>
                       <p className="text-xs text-zinc-500">{t.tap_to_upload}</p>
                  </div>

                  <div className="space-y-4">
                      <label className="block">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.book_name}</span>
                          <input 
                             type="text" 
                             value={editFormData.title || ''} 
                             onChange={e => setEditFormData(prev => ({...prev, title: e.target.value}))}
                             className="mt-1 w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                      </label>
                       <label className="block">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.author}</span>
                          <input 
                             type="text" 
                             value={editFormData.author || ''} 
                             onChange={e => setEditFormData(prev => ({...prev, author: e.target.value}))}
                             className="mt-1 w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                         <label className="block">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.publish_year}</span>
                            <input 
                                type="number" 
                                value={editFormData.year || ''} 
                                onChange={e => setEditFormData(prev => ({...prev, year: parseInt(e.target.value)}))}
                                className="mt-1 w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </label>
                         <label className="block">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.page_count}</span>
                            <input 
                                type="number" 
                                value={editFormData.totalPages || ''} 
                                onChange={e => setEditFormData(prev => ({...prev, totalPages: parseInt(e.target.value)}))}
                                className="mt-1 w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </label>
                      </div>
                       <label className="block">
                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.genre}</span>
                            <select 
                                value={editFormData.genre || ''} 
                                onChange={e => setEditFormData(prev => ({...prev, genre: e.target.value}))}
                                className="mt-1 w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                            >
                                {t.genres.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </label>
                      <label className="block">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.description}</span>
                          <textarea 
                             rows={3}
                             value={editFormData.description || ''} 
                             onChange={e => setEditFormData(prev => ({...prev, description: e.target.value}))}
                             className="mt-1 w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                      </label>
                  </div>
              </div>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                  <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold">
                      {t.cancel}
                  </button>
                  <button onClick={saveEdit} className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20">
                      {t.save}
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Header Sticky Logic - Android Style */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-background-light dark:bg-background-dark px-2 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
          <span className="material-symbols-outlined text-zinc-900 dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold flex-1 ml-2 text-left">{t.book_details}</h1>
        <div className="flex items-center">
          <button 
            onClick={handleFavoriteClick}
            className={`flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all duration-300 mr-1 ${favoriteAnim ? 'scale-125' : 'scale-100'}`}
          >
            <span className={`material-symbols-outlined ${book.isFavorite ? 'text-red-500 material-symbols-filled animate-[pulse_0.5s_ease-in-out]' : 'text-zinc-500 dark:text-zinc-400'}`}>
              favorite
            </span>
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            
            {/* Context Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={openEditModal}
                  className="w-full text-left px-4 py-3 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 flex items-center gap-2 text-sm font-medium transition-colors border-b border-zinc-100 dark:border-zinc-700"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  {t.edit}
                </button>
                <button 
                  onClick={() => { setShowMenu(false); setIsDeleteModalOpen(true); }}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  {t.delete}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-48 shadow-xl shadow-black/20 rounded-xl transition-transform hover:scale-[1.02] relative group">
            <div 
              className="w-full bg-center bg-no-repeat aspect-[3/4] bg-cover rounded-xl bg-zinc-800" 
              style={{ backgroundImage: `url("${book.coverUrl}")` }}
            ></div>
          </div>
          
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold leading-tight">{book.title}</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">{book.author}</p>
            {book.year && <p className="text-xs text-zinc-400">{book.year} • {book.genre}</p>}
          </div>
          
          <RatingStars 
            rating={book.rating} 
            size="lg" 
            onRate={(r) => onUpdateRating(book.id, r)}
          />
        </div>

        <div className="mt-8 space-y-6">
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-forwards">
            <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{t.description}</h3>
            <p className="mt-2 text-zinc-800 dark:text-zinc-200 leading-relaxed">
              {book.description || t.no_desc}
            </p>
          </div>

          <div className="flex justify-between items-center rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 fill-mode-forwards">
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{t.status}</span>
              {/* Animated Status Text */}
              <span key={book.status} className="font-bold text-primary animate-in fade-in slide-in-from-top-1 duration-300">
                  {statusLabels[book.status]}
              </span>
            </div>
            <button onClick={toggleStatus} className="text-primary font-bold text-sm hover:underline">{t.edit}</button>
          </div>

          {/* PAGE TRACKING CARD */}
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 fill-mode-forwards">
              <div className="flex justify-between items-end mb-2">
                 <div className="flex flex-col">
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{t.progress}</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-zinc-900 dark:text-white">
                            {Math.round(progressPercent)}%
                        </span>
                        {book.totalPages && (
                            <span className="text-xs text-zinc-500">
                                ({book.currentPage || 0} / {book.totalPages} {t.page})
                            </span>
                        )}
                    </div>
                 </div>
                 <button 
                    onClick={() => setIsEditingProgress(!isEditingProgress)}
                    className="text-primary font-bold text-sm hover:underline"
                 >
                    {isEditingProgress ? t.close : t.update_progress}
                 </button>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-zinc-300 dark:bg-zinc-700 rounded-full overflow-hidden mb-4">
                  <div 
                     className="h-full bg-green-500 transition-all duration-700 ease-out relative"
                     style={{ width: `${progressPercent}%` }}
                  >
                      {progressPercent >= 100 && <div className="absolute inset-0 bg-white/30 animate-pulse"></div>}
                  </div>
              </div>

              {/* Editing Area */}
              {isEditingProgress && (
                  <div className="bg-zinc-200 dark:bg-zinc-900/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-end gap-2">
                          <label className="flex-1">
                              <span className="text-xs font-medium text-zinc-500 ml-1">{t.tab_read}</span>
                              <input 
                                  type="number"
                                  value={currentPageInput}
                                  onChange={(e) => setCurrentPageInput(e.target.value)}
                                  className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-center font-bold"
                              />
                          </label>
                          <span className="text-zinc-400 pb-3">/</span>
                          <label className="flex-1">
                              <span className="text-xs font-medium text-zinc-500 ml-1">{t.total_pages}</span>
                              <input 
                                  type="number"
                                  value={totalPagesInput}
                                  onChange={(e) => setTotalPagesInput(e.target.value)}
                                  placeholder="?"
                                  className="w-full mt-1 p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-center font-bold"
                              />
                          </label>
                          <button 
                             onClick={handleProgressSave}
                             className="h-[42px] px-4 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90"
                          >
                             <span className="material-symbols-outlined">check</span>
                          </button>
                      </div>
                  </div>
              )}
          </div>

          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200 fill-mode-forwards">
            {/* Start Date Card */}
            <div className="relative rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4 group">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.start_date}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-tight opacity-70">({t.date_format})</p>
                 </div>
                 {editingDateType === 'start' ? (
                   <div className="flex gap-1">
                     <button onClick={saveDate} className="text-green-500 hover:text-green-400"><span className="material-symbols-outlined text-lg">check</span></button>
                     <button onClick={cancelDateEdit} className="text-red-500 hover:text-red-400"><span className="material-symbols-outlined text-lg">close</span></button>
                   </div>
                 ) : (
                   <button onClick={() => startEditingDate('start')} className="text-zinc-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                     <span className="material-symbols-outlined text-lg">edit</span>
                   </button>
                 )}
              </div>
              
              {editingDateType === 'start' ? (
                <input 
                  type="date" 
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="mt-1 w-full bg-zinc-200 dark:bg-zinc-900 border-none rounded p-1 text-sm font-semibold"
                  autoFocus
                />
              ) : (
                <p className="font-semibold">{formatDate(book.startDate)}</p>
              )}
            </div>

            {/* Finish Date Card */}
            <div className="relative rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4 group">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.finish_date}</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-tight opacity-70">({t.date_format})</p>
                 </div>
                 {editingDateType === 'finish' ? (
                   <div className="flex gap-1">
                     <button onClick={saveDate} className="text-green-500 hover:text-green-400"><span className="material-symbols-outlined text-lg">check</span></button>
                     <button onClick={cancelDateEdit} className="text-red-500 hover:text-red-400"><span className="material-symbols-outlined text-lg">close</span></button>
                   </div>
                 ) : (
                   <button onClick={() => startEditingDate('finish')} className="text-zinc-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                     <span className="material-symbols-outlined text-lg">edit</span>
                   </button>
                 )}
              </div>

              {editingDateType === 'finish' ? (
                <input 
                  type="date" 
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="mt-1 w-full bg-zinc-200 dark:bg-zinc-900 border-none rounded p-1 text-sm font-semibold"
                  autoFocus
                />
              ) : (
                <p className="font-semibold">{formatDate(book.finishDate)}</p>
              )}
            </div>
          </div>

          <div className="animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-forwards">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">{t.personal_notes}</h3>
                {book.notesLastUpdated && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                    ({book.notesLastUpdated})
                  </span>
                )}
              </div>
              
              {isEditingNotes ? (
                <button onClick={cancelEditing} className="text-red-500 font-bold text-sm hover:underline">{t.cancel}</button>
              ) : (
                <button onClick={startEditing} className="text-primary font-bold text-sm hover:underline">{t.edit}</button>
              )}
            </div>
            
            {isEditingNotes ? (
              <div className="flex flex-col gap-3">
                <textarea 
                  className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 p-4 min-h-[120px] text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder={t.notes_placeholder}
                  autoFocus
                />
                <button 
                  onClick={saveNotes}
                  className="self-end px-6 py-2.5 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
                >
                  {t.save}
                </button>
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-4 min-h-[120px]">
                <p className="text-zinc-800 dark:text-zinc-200 italic whitespace-pre-wrap">
                  {book.notes || t.no_notes}
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