
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (name.trim().length === 0) {
      setError('Lütfen isminizi giriniz.');
      return;
    }
    onLogin(name.trim());
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark px-6 font-display">
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        {/* Logo / Icon */}
        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 bg-primary/10 rounded-3xl flex items-center justify-center shadow-xl shadow-primary/10 rotate-3">
            <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Hoş Geldiniz</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Kitap okuma yolculuğunuzu takip etmeye başlamak için sizi tanıyalım.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-xl blur transition-opacity duration-300 ${name ? 'opacity-50' : 'opacity-0'}`}></div>
            <input 
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Adınız nedir?"
              autoFocus
              className="relative w-full h-14 rounded-xl bg-white dark:bg-[#1c2127] border border-zinc-200 dark:border-zinc-700 px-5 text-lg font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm font-medium ml-1 animate-in fade-in slide-in-from-top-1">{error}</p>
          )}

          <button 
            type="submit"
            disabled={!name.trim()}
            className="h-14 w-full mt-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span>Başla</span>
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </form>

      </div>
      
      <p className="absolute bottom-8 text-xs text-zinc-400 text-center w-full opacity-60">
        Kişisel Kütüphane Asistanınız
      </p>
    </div>
  );
};

export default Login;
