import React, { useState, useRef } from 'react';
import { Book, ReadingStatus, Translation } from '../types';

interface AddBookProps {
  onBack: () => void;
  onSave: (book: Book) => void;
  t: Translation;
}

// Default Book Cover (Gradient Placeholder)
const DEFAULT_COVER = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop";

const AddBook: React.FC<AddBookProps> = ({ onBack, onSave, t }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear().toString(), // Keep as string for better input handling
    genre: t.genres[0] || 'Roman',
    description: '',
    status: 'reading' as ReadingStatus,
    coverUrl: '',
    totalPages: '', // Keep as string for better input handling
    notes: ''
  });

  const [isProcessingImg, setIsProcessingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to process image: Resize -> Base64
  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600; // Resize to max 600px width
                const scaleSize = MAX_WIDTH / img.width;
                const newWidth = MAX_WIDTH;
                const newHeight = img.height * scaleSize;

                canvas.width = newWidth;
                canvas.height = newHeight;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, newWidth, newHeight);

                // Compress to JPEG 70% quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
  };

  const generateId = () => {
     if (typeof crypto !== 'undefined' && crypto.randomUUID) {
         return crypto.randomUUID();
     }
     return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.author) {
        alert("Lütfen en az kitap adı ve yazar giriniz.");
        return;
    }

    const newBook: Book = {
      id: generateId(),
      title: formData.title,
      author: formData.author,
      year: formData.year ? parseInt(formData.year) : undefined,
      genre: formData.genre,
      description: formData.description,
      status: formData.status,
      rating: 0,
      // Use uploaded image OR default image if empty
      coverUrl: formData.coverUrl || DEFAULT_COVER,
      totalPages: formData.totalPages ? parseInt(formData.totalPages) : undefined,
      currentPage: 0,
      notes: formData.notes
    };

    onSave(newBook);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessingImg(true);
      try {
          const base64Image = await processImage(file);
          setFormData({ ...formData, coverUrl: base64Image });
      } catch (error) {
          console.error("Görsel işlenirken hata:", error);
          alert("Görsel yüklenirken bir sorun oluştu.");
      } finally {
          setIsProcessingImg(false);
      }
    }
  };

  const handleClearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({ ...formData, coverUrl: '' });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/50 bg-background-light/80 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)] backdrop-blur-sm dark:border-zinc-800/50 dark:bg-background-dark/80">
        <button onClick={onBack} className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
          <span className="material-symbols-outlined text-2xl text-zinc-900 dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex-1 ml-2">{t.add_book_title}</h1>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Cover Upload Area */}
          <div 
            onClick={handleFileClick}
            className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed ${formData.coverUrl ? 'border-primary' : 'border-zinc-300 dark:border-zinc-700'} p-8 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors relative overflow-hidden group`}
          >
             {isProcessingImg ? (
                 <div className="flex flex-col items-center justify-center p-4">
                     <span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span>
                     <p className="mt-2 text-sm text-zinc-500">İşleniyor...</p>
                 </div>
             ) : formData.coverUrl ? (
                <>
                  <button 
                      onClick={handleClearImage}
                      className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors backdrop-blur-sm shadow-md"
                      title={t.close}
                  >
                      <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                  <div className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-40 transition-opacity" style={{ backgroundImage: `url("${formData.coverUrl}")` }}></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="material-symbols-outlined text-5xl text-primary drop-shadow-md">check_circle</span>
                    <p className="text-base font-bold text-zinc-900 dark:text-white drop-shadow-md mt-2">{t.cover_image}</p>
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-200 drop-shadow-md">Değiştirmek için dokunun</p>
                  </div>
                </>
             ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="material-symbols-outlined text-5xl text-zinc-400 dark:text-zinc-500">add_photo_alternate</span>
                  <p className="text-base font-semibold text-zinc-900 dark:text-white">{t.cover_placeholder}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.tap_to_upload}</p>
                </div>
             )}
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.book_name}</p>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                placeholder="Örn: Dune"
              />
            </label>

            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.author}</p>
              <input 
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                placeholder="Örn: Frank Herbert"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.genre}</p>
                <div className="relative w-full">
                  <select 
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-zinc-900 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    {t.genres.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">unfold_more</span>
                </div>
              </label>

              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.page_count}</p>
                <input 
                  type="number"
                  inputMode="numeric"
                  value={formData.totalPages}
                  onChange={(e) => setFormData({...formData, totalPages: e.target.value})}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="350"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.publish_year}</p>
                <input 
                  type="number"
                  inputMode="numeric"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="1965"
                />
              </label>
              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.status}</p>
                <div className="relative w-full">
                    <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as ReadingStatus})}
                    className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-zinc-900 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    >
                    <option value="reading">{t.tab_reading}</option>
                    <option value="read">{t.tab_read}</option>
                    <option value="want-to-read">{t.tab_want_to_read}</option>
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">unfold_more</span>
                </div>
              </label>
            </div>

            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.description}</p>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                placeholder="..."
              ></textarea>
            </label>

            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{t.notes}</p>
              <textarea 
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                placeholder={t.notes_placeholder}
              ></textarea>
            </label>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 bg-background-light/80 px-4 py-4 backdrop-blur-sm dark:bg-background-dark/80 border-t border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={handleSubmit}
          className="flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-primary text-base font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
        >
          <span className="truncate">{t.save}</span>
        </button>
      </footer>
    </div>
  );
};

export default AddBook;