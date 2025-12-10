import React from 'react';
import { LanguageCode, Translation } from '../types';

interface SettingsProps {
  onBack: () => void;
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  userName: string;
  setUserName: (name: string) => void;
  t: Translation;
}

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const Settings: React.FC<SettingsProps> = ({ 
    onBack, 
    currentLanguage, 
    setLanguage, 
    userName, 
    setUserName, 
    t 
}) => {
  return (
    <div className="min-h-screen w-full bg-background-light dark:bg-background-dark font-display">
      
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-background-light dark:bg-background-dark px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <button onClick={onBack} className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
          <span className="material-symbols-outlined text-zinc-900 dark:text-white">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white flex-1 ml-2">{t.settings_title}</h1>
      </header>

      <main className="p-4 space-y-6">
          
          {/* Profile Section */}
          <section>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">{t.username}</h2>
              <div className="bg-white dark:bg-card-dark rounded-xl border border-zinc-200 dark:border-zinc-700 p-1">
                  <input 
                      type="text" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-transparent p-3 text-zinc-900 dark:text-white outline-none"
                  />
              </div>
          </section>

          {/* Language Section */}
          <section>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">{t.app_language}</h2>
              <div className="bg-white dark:bg-card-dark rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                  {LANGUAGES.map((lang, index) => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`w-full flex items-center justify-between p-4 transition-colors ${
                            index !== LANGUAGES.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-700' : ''
                        } ${currentLanguage === lang.code ? 'bg-primary/5' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}`}
                      >
                          <div className="flex items-center gap-3">
                              <span className="text-2xl">{lang.flag}</span>
                              <span className={`font-medium ${currentLanguage === lang.code ? 'text-primary' : 'text-zinc-700 dark:text-zinc-200'}`}>
                                  {lang.label}
                              </span>
                          </div>
                          {currentLanguage === lang.code && (
                              <span className="material-symbols-outlined text-primary">check_circle</span>
                          )}
                      </button>
                  ))}
              </div>
          </section>

          {/* Info Section */}
          <section>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">{t.about}</h2>
              <div className="bg-white dark:bg-card-dark rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 flex justify-between items-center">
                  <span className="text-zinc-900 dark:text-white font-medium">Kitap Takip (Android)</span>
                  <span className="text-sm text-zinc-500">{t.version}</span>
              </div>
          </section>

      </main>
    </div>
  );
};

export default Settings;