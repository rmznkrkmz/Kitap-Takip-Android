import React, { useState } from 'react';
import { LanguageCode, Translation } from '../types';

interface LoginProps {
  onLogin: (name: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translation;
}

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const Login: React.FC<LoginProps> = ({ onLogin, language, setLanguage, t }) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Language, 2: Name
  const [name, setName] = useState('');

  const handleLanguageSelect = (lang: LanguageCode) => {
    setLanguage(lang);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 pt-[env(safe-area-inset-top)] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] aspect-square bg-primary/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] aspect-square bg-blue-400/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-2">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-4 text-primary shadow-lg shadow-primary/20 rotate-3">
                <span className="material-symbols-outlined text-5xl">auto_stories</span>
            </div>
            
            {/* We use current language 't' for title, but since lang changes in step 1, it updates live */}
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {step === 1 ? 'Kitap Takip' : t.welcome}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-[280px]">
              {step === 1 ? 'Please select your language / Lütfen dilinizi seçin' : t.welcome_subtitle}
            </p>
        </div>

        {/* STEP 1: Language Selection */}
        {step === 1 && (
            <div className="w-full grid grid-cols-1 gap-3 animate-in slide-in-from-bottom-8 duration-500">
                {LANGUAGES.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-700 hover:border-primary dark:hover:border-primary transition-all active:scale-[0.98] shadow-sm group"
                    >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-primary transition-colors">{lang.label}</span>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-primary">arrow_forward</span>
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* STEP 2: Name Input */}
        {step === 2 && (
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 animate-in slide-in-from-right-8 duration-500">
              
              <div className="flex items-center justify-center mb-2">
                 <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1"
                 >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    {t.select_language}
                 </button>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-zinc-400 group-focus-within:text-primary transition-colors">person</span>
                </div>
                <input
                    autoFocus
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.enter_name}
                    className="w-full h-14 pl-11 pr-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-lg text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:border-primary focus:ring-0 transition-all outline-none shadow-sm"
                  />
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full h-14 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>{t.login_button}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
        )}
      </div>

      <p className="absolute bottom-8 text-xs text-zinc-400 dark:text-zinc-600 font-medium">
        {t.version || 'Kitap Takip v1.1'}
      </p>
    </div>
  );
};

export default Login;