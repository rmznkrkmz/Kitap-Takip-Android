
import React, { useState, useRef } from 'react';
import { Book, ReadingStatus } from '../types';

interface AddBookProps {
  onBack: () => void;
  onSave: (book: Book) => void;
}

const GENRES = [
  "Roman", "Hikaye", "Bilim Kurgu", "Fantastik", "Polisiye", "Gerilim", "Korku", 
  "Romantik", "Tarihi Kurgu", "Macera", "Mizah", "Çizgi Roman", "Manga", "Şiir", 
  "Tiyatro", "Biyografi", "Otobiyografi", "Anı", "Tarih", "Felsefe", "Psikoloji", 
  "Sosyoloji", "Kişisel Gelişim", "Bilim", "Teknoloji", "Sanat", "İş Dünyası", 
  "Ekonomi", "Seyahat", "Yemek", "Sağlık", "Din", "Mitoloji", "Eğitim", 
  "Politika", "Çocuk", "Genç Yetişkin", "Deneme", "Araştırma", "İnceleme", "Klasikler"
];

const AddBook: React.FC<AddBookProps> = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear().toString(),
    genre: 'Roman',
    description: '',
    status: 'reading' as ReadingStatus
  });

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.author) return;

    // Use selected image or a placeholder if none selected
    const finalCoverUrl = coverImage || `https://picsum.photos/300/400?random=${Math.floor(Math.random() * 1000)}`;

    const newBook: Book = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      author: formData.author,
      year: parseInt(formData.year),
      genre: formData.genre,
      description: formData.description,
      status: formData.status,
      rating: 0,
      coverUrl: finalCoverUrl
    };

    onSave(newBook);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-200/50 bg-background-light/80 px-4 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-background-dark/80">
        <button onClick={onBack} className="flex items-center gap-1 text-primary hover:opacity-80">
          <span className="material-symbols-outlined text-2xl">arrow_back_ios_new</span>
          <span className="text-base font-medium">Geri</span>
        </button>
        <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Kitap Ekle</h1>
        <div className="w-16"></div> 
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="flex flex-col gap-6">
          {/* Cover Upload Area */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          
          <div 
            onClick={triggerFileInput}
            className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300 relative overflow-hidden group ${coverImage ? 'border-primary bg-zinc-900' : 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}`}
          >
            {coverImage ? (
              <>
                <img src={coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-white drop-shadow-lg">edit</span>
                  <p className="text-white font-medium drop-shadow-lg">Görseli Değiştir</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="material-symbols-outlined text-5xl text-zinc-400 dark:text-zinc-500">add_photo_alternate</span>
                <p className="text-base font-semibold text-zinc-900 dark:text-white">Kitap Kapağı Ekle</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Resim yüklemek için dokunun</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Başlık</p>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                placeholder="Örn: Dune"
              />
            </label>

            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Yazar</p>
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
                <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Tür</p>
                <div className="relative w-full">
                  <select 
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-zinc-900 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  >
                    {GENRES.map((genre) => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">unfold_more</span>
                </div>
              </label>

              <label className="flex flex-col">
                <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Yayın Yılı</p>
                <input 
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="h-12 w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                  placeholder="Örn: 1965"
                />
              </label>
            </div>

            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Durum</p>
              <div className="relative w-full">
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as ReadingStatus})}
                  className="h-12 w-full appearance-none rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-zinc-900 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="reading">Şu An Okunanlar</option>
                  <option value="read">Okundu</option>
                  <option value="want-to-read">Okumak İstiyorum</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">unfold_more</span>
              </div>
            </label>

            <label className="flex flex-col">
              <p className="pb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Açıklama</p>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-lg border border-zinc-300 bg-zinc-100 p-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-primary focus:outline-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                placeholder="Kitap hakkında biraz bilgi verin..."
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
          <span className="truncate">Kaydet</span>
        </button>
      </footer>
    </div>
  );
};

export default AddBook;
