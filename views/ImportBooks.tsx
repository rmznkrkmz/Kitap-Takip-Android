import React, { useState, useRef, useEffect } from 'react';
import { Book, Translation } from '../types';

interface ImportBooksProps {
  onBack: () => void;
  onImport: (books: Book[]) => void;
  t: Translation;
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730&auto=format&fit=crop";

const ImportBooks: React.FC<ImportBooksProps> = ({ onBack, onImport, t }) => {
  const [importedBooks, setImportedBooks] = useState<Book[]>([]);
  
  // ISBN Input State
  const [isbnInput, setIsbnInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const generateId = () => {
     if (typeof crypto !== 'undefined' && crypto.randomUUID) {
         return crypto.randomUUID();
     }
     return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  };

  // --- API Logic ---
  const fetchBookByIsbn = async (isbn: string): Promise<Book | null> => {
    try {
        const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
        if (cleanIsbn.length < 10) return null;

        const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
        
        if (!response.ok) throw new Error("API Error");
        
        const data = await response.json();
        const bookData = data[`ISBN:${cleanIsbn}`];

        if (bookData) {
          return {
            id: generateId(),
            title: bookData.title || t.book_name,
            author: bookData.authors?.[0]?.name || t.author,
            year: bookData.publish_date ? parseInt(bookData.publish_date) : undefined,
            coverUrl: bookData.cover?.large || bookData.cover?.medium || DEFAULT_COVER,
            status: 'want-to-read',
            rating: 0,
            description: `ISBN: ${cleanIsbn}`,
            genre: t.genres[0]
          };
        }
    } catch (err) {
        console.warn(`Error fetching ISBN ${isbn}`, err);
    }
    return null;
  };

  // --- ISBN List Fetching Logic ---
  const handleFetchISBNs = async () => {
    if (!isbnInput.trim()) return;
    setIsLoading(true);
    
    const rawLines = isbnInput.split('\n');
    const isbns = rawLines.map(s => s.trim()).filter(s => s.length >= 10);
    
    if (isbns.length === 0) {
        setIsLoading(false);
        setStatusMsg(t.not_found);
        return;
    }

    setProgress({ current: 0, total: isbns.length });
    const newBooks: Book[] = [];
    let failedCount = 0;

    for (let i = 0; i < isbns.length; i++) {
      if (!isMounted.current) break;
      const isbn = isbns[i];
      setStatusMsg(`${t.loading} (${i + 1}/${isbns.length})`);
      
      const book = await fetchBookByIsbn(isbn);
      if (book) {
          const isDuplicate = importedBooks.some(b => b.description?.includes(isbn)) || 
                              newBooks.some(b => b.description?.includes(isbn));
          if (!isDuplicate) newBooks.push(book);
      } else {
          failedCount++;
      }
      if (isMounted.current) setProgress({ current: i + 1, total: isbns.length });
    }

    if (isMounted.current) {
        setImportedBooks(prev => [...newBooks, ...prev]);
        setIsLoading(false);
        setProgress(null);
        if (newBooks.length > 0) {
            setIsbnInput('');
            setStatusMsg(`${newBooks.length} ${t.books_found}`);
        } else {
            setStatusMsg(t.not_found);
        }
    }
  };

  const handleRemoveBook = (id: string) => {
    setImportedBooks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark font-display">
       
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-background-light dark:bg-background-dark px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <button 
            onClick={onBack} 
            className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <span className="material-symbols-outlined text-zinc-900 dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white flex-1 ml-2">{t.import_title}</h1>
      </header>

      <main className="p-4 space-y-4 flex-1 overflow-y-auto">
        
        {/* ISBN INPUT AREA */}
        <div className="flex flex-col gap-4 animate-in slide-in-from-bottom duration-300">
            <div className="bg-white dark:bg-card-dark p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{t.paste_isbns}</label>
                </div>
                <p className="text-xs text-zinc-500 mb-3 ml-8">{t.isbn_instructions}</p>
                
                <textarea 
                    className="w-full h-40 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-primary outline-none text-[17px] resize-none font-mono placeholder:text-zinc-400"
                    placeholder={`9789750719387\n9780140449136`}
                    value={isbnInput}
                    onChange={(e) => setIsbnInput(e.target.value)}
                />
                
                {progress && (
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span>{t.loading}</span>
                            <span>{progress.current} / {progress.total}</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                        </div>
                    </div>
                )}

                {statusMsg && !progress && (
                    <p className={`text-center text-sm font-medium mt-3 ${statusMsg.includes('❌') || statusMsg === t.not_found ? 'text-red-500' : 'text-green-600'}`}>
                        {statusMsg}
                    </p>
                )}
            </div>

            <button 
                onClick={handleFetchISBNs}
                disabled={isLoading || !isbnInput.trim()}
                className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg"
            >
                {isLoading ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                ) : (
                    <span className="material-symbols-outlined">search</span>
                )}
                {isLoading ? t.loading : t.fetch_books}
            </button>
        </div>

        {/* RESULTS LIST */}
        {importedBooks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-2">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider px-1">{t.books_found} ({importedBooks.length})</h2>
            <div className="flex flex-col gap-3">
              {importedBooks.map((book) => (
                <div key={book.id} className="flex gap-3 p-3 bg-white dark:bg-card-dark rounded-xl border border-zinc-200 dark:border-zinc-700 items-center animate-in slide-in-from-bottom-2">
                  <div 
                    className="w-12 h-16 bg-cover bg-center rounded-md bg-zinc-200 shrink-0 border border-zinc-100 dark:border-zinc-600"
                    style={{ backgroundImage: `url("${book.coverUrl}")` }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate text-zinc-900 dark:text-white">{book.title}</h4>
                    <p className="text-xs text-zinc-500 truncate">{book.author}</p>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{book.description}</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveBook(book.id)}
                    className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Padding for bottom button */}
        <div className="h-20"></div>

      </main>

      {/* Sticky Footer Action */}
      {importedBooks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur border-t border-zinc-200 dark:border-zinc-800 z-30 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
           <button 
             onClick={() => onImport(importedBooks)}
             className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
           >
             <span className="material-symbols-outlined">download</span>
             {t.import_btn} ({importedBooks.length})
           </button>
        </div>
      )}
    </div>
  );
};

export default ImportBooks;