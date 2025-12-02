
import React, { useState, useEffect, useRef } from 'react';
import { Book, ViewState } from '../types';

interface StatsProps {
  books: Book[];
  onBack: () => void;
  onNavClick: (view: ViewState) => void;
  yearlyGoal: number;
  setYearlyGoal: (n: number) => void;
  dailyPageGoal: number;
  setDailyPageGoal: (n: number) => void;
  dailyPagesRead: number;
  setDailyPagesRead: (n: number) => void;
  readingHistory: Record<string, number>;
  streakCount: number;
  hasReadToday: boolean;
  onIncrementStreak: () => void;
  hasSetInitialGoals: boolean;
  setHasSetInitialGoals: (val: boolean) => void;
}

const Stats: React.FC<StatsProps> = ({ 
  books, 
  onBack, 
  onNavClick,
  yearlyGoal,
  setYearlyGoal,
  dailyPageGoal,
  setDailyPageGoal,
  dailyPagesRead,
  setDailyPagesRead,
  readingHistory,
  streakCount,
  hasReadToday,
  onIncrementStreak,
  hasSetInitialGoals,
  setHasSetInitialGoals
}) => {
  const readCount = books.filter(b => b.status === 'read').length;
  const isYearlyGoalMet = readCount >= yearlyGoal;

  // Local state for manual page input
  const [localPagesInput, setLocalPagesInput] = useState(dailyPagesRead.toString());
  
  // Toast Notification State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Setup Modal State (Temporary input holders)
  const [setupYearly, setSetupYearly] = useState(yearlyGoal.toString());
  const [setupDaily, setSetupDaily] = useState(dailyPageGoal.toString());

  // Report Date State (For Monthly Report Navigation)
  const [reportDate, setReportDate] = useState(new Date());

  // Refs to track previous values for goal completion detection
  const prevDailyPages = useRef(dailyPagesRead);
  const prevDailyGoal = useRef(dailyPageGoal);
  const prevYearlyGoal = useRef(yearlyGoal);
  const prevReadCount = useRef(readCount);

  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();

  // --- Monthly Goals Logic (ALWAYS CURRENT MONTH) ---
  const readBooks = books.filter(b => b.status === 'read');

  // Filter books read THIS month (For Goals)
  const booksReadCurrentMonth = readBooks.filter(b => {
    if (!b.finishDate) return false;
    const [year, month, day] = b.finishDate.split('-').map(Number);
    return (month - 1) === currentMonth && year === currentYear;
  });

  const booksReadBeforeThisMonth = readBooks.filter(b => {
      if (!b.finishDate) return true;
      const [year, month, day] = b.finishDate.split('-').map(Number);
      const bookDate = new Date(year, month - 1, day);
      return bookDate.getTime() < new Date(currentYear, currentMonth, 1).getTime();
  });

  // Goal 1: Read 2 books this month
  const monthlyBookGoal = 2;
  const monthlyBooksReadCount = booksReadCurrentMonth.length;
  const isMonthlyBookGoalMet = monthlyBooksReadCount >= monthlyBookGoal;

  // Goal 2: Discover a new genre
  const pastGenres = new Set(booksReadBeforeThisMonth.map(b => b.genre).filter(Boolean));
  const newGenreDiscovered = booksReadCurrentMonth.some(b => b.genre && !pastGenres.has(b.genre));
  
  // --- Monthly Report Logic (DYNAMIC DATE) ---
  
  const handlePrevMonth = () => {
    setReportDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setReportDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Check if we are viewing the current month to disable "Next" button
  const isViewingCurrentMonth = 
    reportDate.getMonth() === currentMonth && 
    reportDate.getFullYear() === currentYear;

  const reportMonthName = reportDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
  const reportMonthIdx = reportDate.getMonth();
  const reportYearIdx = reportDate.getFullYear();

  // Filter books for the SELECTED report month
  const booksReadReportMonth = readBooks.filter(b => {
    if (!b.finishDate) return false;
    const [year, month, day] = b.finishDate.split('-').map(Number);
    return (month - 1) === reportMonthIdx && year === reportYearIdx;
  });

  const reportBookCount = booksReadReportMonth.length;

  // Avg Rating this report month
  const totalReportRating = booksReadReportMonth.reduce((acc: number, b: Book) => acc + b.rating, 0);
  const avgReportRating = reportBookCount > 0 
    ? (totalReportRating / reportBookCount).toFixed(1) 
    : '-';

  // Favorite Genre this report month
  const reportGenreCounts = booksReadReportMonth.reduce((acc: Record<string, number>, b: Book) => {
    const genre = b.genre || 'Diğer';
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteReportGenre = Object.entries(reportGenreCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]?.[0] || '-';


  // --- End Logic ---

  // Sync local input when parent prop changes (e.g. via +10 buttons)
  useEffect(() => {
    setLocalPagesInput(dailyPagesRead.toString());
  }, [dailyPagesRead]);

  // Check Daily Goal Completion
  useEffect(() => {
    const isDailyMet = dailyPagesRead >= dailyPageGoal && dailyPageGoal > 0;
    const wasDailyMet = prevDailyPages.current >= prevDailyGoal.current && prevDailyGoal.current > 0;

    if (isDailyMet && !wasDailyMet) {
       setToastMessage("Tebrikler! Günlük okuma hedefine ulaştın! 🎉");
       setShowToast(true);
       setTimeout(() => setShowToast(false), 6000);
    }

    prevDailyPages.current = dailyPagesRead;
    prevDailyGoal.current = dailyPageGoal;
  }, [dailyPagesRead, dailyPageGoal]);

  // Check Yearly Goal Completion
  useEffect(() => {
    const currentReadCount = books.filter(b => b.status === 'read').length;
    const isYearlyMet = currentReadCount >= yearlyGoal && yearlyGoal > 0;
    const wasYearlyMet = prevReadCount.current >= prevYearlyGoal.current && prevYearlyGoal.current > 0;

    if (isYearlyMet && !wasYearlyMet) {
       setToastMessage("Muhteşem! Yıllık kitap hedefini tamamladın! 🏆");
       setShowToast(true);
       setTimeout(() => setShowToast(false), 6000);
    }

    prevReadCount.current = currentReadCount;
    prevYearlyGoal.current = yearlyGoal;
  }, [yearlyGoal, books]);

  const handleManualSave = () => {
    const val = parseInt(localPagesInput);
    if (!isNaN(val)) {
      setDailyPagesRead(val);
    }
  };

  const handleSetupSave = () => {
    const yGoal = parseInt(setupYearly);
    const dGoal = parseInt(setupDaily);

    if (yGoal > 0 && dGoal > 0) {
      setYearlyGoal(yGoal);
      setDailyPageGoal(dGoal);
      setHasSetInitialGoals(true);
    }
  };

  const isGoalMet = dailyPagesRead >= dailyPageGoal && dailyPageGoal > 0;

  // --- Dynamic Chart Logic (REAL DATA) ---
  const today = new Date();
  
  // 1. Determine Monday of the current week
  // JS getDay(): Sunday=0, Monday=1, ..., Saturday=6
  const currentDayIndex = today.getDay(); 
  const diffToMonday = today.getDate() - currentDayIndex + (currentDayIndex === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0); // Reset time part for accurate comparisons

  // 2. Generate Data for Mon-Sun of THIS week
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  const chartData = weekDays.map((label, index) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + index);
    
    const key = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let value = 0;
    const isFuture = dayDate.getTime() > today.getTime();
    const isToday = key === todayKey;

    if (isFuture) {
      value = 0;
    } else {
      value = readingHistory[key] || 0;
    }

    return { label, value, isToday };
  });

  const maxChartValue = Math.max(...chartData.map(d => d.value), dailyPageGoal) * 1.2;

  const todayFormatted = today.toLocaleDateString('tr-TR');

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark text-white font-display">
      
      {/* Onboarding Modal - Show if goals not set */}
      {!hasSetInitialGoals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-[#1c2127] border border-zinc-700 w-full max-w-sm rounded-2xl shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-300">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                   <span className="material-symbols-outlined text-3xl">flag</span>
                </div>
                <h2 className="text-xl font-bold text-white">Hoş Geldiniz!</h2>
                <p className="text-zinc-400 text-sm mt-2">Okuma alışkanlığınızı takip etmeye başlamadan önce hedeflerinizi belirleyelim.</p>
              </div>

              <div className="flex flex-col gap-4">
                 <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Yıllık Kitap Hedefi</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={setupYearly} 
                         onChange={(e) => setSetupYearly(e.target.value)}
                         className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Kitap</span>
                    </div>
                 </div>

                 <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1 block">Günlük Sayfa Hedefi</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={setupDaily} 
                         onChange={(e) => setSetupDaily(e.target.value)}
                         className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">Sayfa</span>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleSetupSave}
                className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-95"
              >
                Takibe Başla
              </button>
           </div>
        </div>
      )}

      {/* Toast Notification - Prominent */}
      <div 
        className={`fixed inset-x-0 top-10 z-50 flex justify-center px-4 transition-all duration-700 ease-out ${showToast ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' : '-translate-y-10 opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="bg-gradient-to-r from-green-900/90 to-[#1c2127]/95 backdrop-blur-xl border border-green-500/50 text-white p-6 rounded-2xl shadow-[0_10px_40px_-10px_rgba(34,197,94,0.5)] flex flex-col items-center gap-3 text-center max-w-sm w-full">
           <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-full text-white shadow-lg shadow-green-500/30 mb-1 animate-bounce">
             <span className="material-symbols-outlined material-symbols-filled text-3xl">celebration</span>
           </div>
           <div>
             <h4 className="font-bold text-xl tracking-tight">Harika İş!</h4>
             <p className="text-zinc-200 mt-1 font-medium">{toastMessage}</p>
           </div>
           <button 
             onClick={() => setShowToast(false)}
             className="mt-2 text-xs font-bold uppercase tracking-wider text-green-400 hover:text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/10 transition-colors cursor-pointer relative z-50"
           >
             Kapat
           </button>
        </div>
      </div>

      <header className="flex items-center bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-zinc-800/50">
        <button onClick={onBack} className="text-white flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-zinc-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h1 className="text-white text-lg font-bold leading-tight flex-1 text-center pr-10">Okuma Serisi ve Kilometre Taşları</h1>
      </header>

      <main className="flex-1 pb-24">
        {/* Streak Card - Minimalist Version */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-card-dark p-3 shadow-md relative z-20">
             <div className="flex items-center gap-3 pointer-events-none">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${hasReadToday ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-600'}`}>
                   <span className={`material-symbols-outlined text-xl ${hasReadToday ? 'animate-pulse' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-lg font-bold leading-none text-white">{streakCount} Gün</span>
                   <span className="text-[10px] font-medium text-zinc-500">{hasReadToday ? 'Seri aktif' : 'Seri tehlikede'}</span>
                </div>
             </div>
             
             <button 
                onClick={onIncrementStreak}
                disabled={hasReadToday}
                className={`h-9 rounded-lg px-4 text-xs font-bold relative z-20 transition-all ${
                  hasReadToday 
                    ? 'cursor-default bg-green-500/10 text-green-400' 
                    : 'cursor-pointer bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95'
                }`}
              >
                {hasReadToday ? 'Tamamlandı' : 'Bugün Okudum'}
              </button>
          </div>
        </div>

        {/* Custom Goals Section */}
        <section>
          <h2 className="text-white text-xl font-bold px-4 pb-3 pt-6">Kişisel Hedefler</h2>
          <div className="flex flex-col gap-4 px-4">
            
            {/* Yearly Goal Card */}
            <div className={`bg-card-dark border rounded-xl p-5 transition-all duration-500 ${isYearlyGoalMet ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-zinc-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isYearlyGoalMet ? 'bg-green-500 text-white animate-bounce' : 'bg-blue-500/20 text-blue-400'}`}>
                     <span className="material-symbols-outlined">{isYearlyGoalMet ? 'emoji_events' : 'menu_book'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Yıllık Kitap Hedefi</h3>
                    <p className="text-xs text-zinc-400">
                      {isYearlyGoalMet ? "Harika! Yıllık hedefine ulaştın." : "Bu yıl okumak istediğiniz kitap sayısı"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                    <button 
                        onClick={() => setYearlyGoal(Math.max(1, yearlyGoal - 1))}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                    >-</button>
                    <span className="w-8 text-center text-sm font-bold">{yearlyGoal}</span>
                    <button 
                        onClick={() => setYearlyGoal(yearlyGoal + 1)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                    >+</button>
                </div>
              </div>
              
              <div className="flex justify-between items-end mb-2">
                 <span className="text-2xl font-bold text-white">{readCount}</span>
                 <span className="text-sm text-zinc-500 mb-1">/ {yearlyGoal} Kitap</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden relative">
                 <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isYearlyGoalMet ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min((readCount / yearlyGoal) * 100, 100)}%` }}
                 >
                    {isYearlyGoalMet && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                 </div>
              </div>
            </div>

            {/* Daily Page Goal Card */}
            <div className={`relative bg-card-dark border rounded-xl p-5 transition-all duration-500 ${isGoalMet ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-zinc-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isGoalMet ? 'bg-green-500 text-white animate-bounce' : 'bg-green-500/20 text-green-400'}`}>
                     <span className="material-symbols-outlined">{isGoalMet ? 'emoji_events' : 'auto_stories'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Günlük Sayfa</h3>
                    <p className="text-xs text-zinc-400">
                      {isGoalMet ? "Tebrikler! Günlük hedefe ulaştın." : "Bugün okuduğunuz sayfa sayısı"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-zinc-500">Hedef</span>
                    <div className="flex items-center bg-zinc-800 rounded-lg px-2 py-1 gap-2">
                         <input 
                            type="number" 
                            value={dailyPageGoal}
                            onChange={(e) => setDailyPageGoal(parseInt(e.target.value) || 0)}
                            className="w-12 bg-transparent text-right text-sm font-bold text-white focus:outline-none"
                         />
                         <span className="text-xs text-zinc-500">sf</span>
                    </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-5">
                 <button 
                    onClick={() => setDailyPagesRead(Math.max(0, dailyPagesRead - 10))}
                    className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center justify-center transition-colors shrink-0"
                 >-10</button>
                 
                 <div className="flex-1 flex flex-col items-center gap-1">
                     <div className="flex items-center gap-2 border-b border-zinc-700 focus-within:border-primary transition-colors">
                        <input 
                          type="number"
                          value={localPagesInput}
                          onChange={(e) => setLocalPagesInput(e.target.value)}
                          className="bg-transparent text-3xl font-bold text-white text-center w-24 focus:outline-none"
                        />
                        <button 
                          onClick={handleManualSave}
                          className="text-xs font-semibold bg-zinc-800 hover:bg-primary text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors"
                        >
                          Kaydet
                        </button>
                     </div>
                     <span className="text-xs text-zinc-500">Sayfa Okundu</span>
                 </div>
                 
                 <button 
                    onClick={() => setDailyPagesRead(dailyPagesRead + 10)}
                    className="w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/20 transition-colors shrink-0"
                 >+10</button>
              </div>
              
              <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden relative">
                 <div 
                    className={`h-full rounded-full transition-all duration-700 ${isGoalMet ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-green-500'}`} 
                    style={{ width: `${Math.min((dailyPagesRead / dailyPageGoal) * 100, 100)}%` }}
                  >
                     {isGoalMet && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
                  </div>
              </div>
            </div>

          </div>
        </section>

        {/* Weekly Activity Chart - REAL DATA */}
        <section>
             <h2 className="text-white text-xl font-bold px-4 pb-3 pt-6">Haftalık Aktivite</h2>
             <div className="mx-4 bg-card-dark border border-zinc-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Bugün</p>
                            <span className="text-zinc-500 text-[10px] font-normal bg-zinc-800 px-1.5 py-0.5 rounded">
                                {todayFormatted}
                            </span>
                        </div>
                        <p className="text-white text-2xl font-bold mt-0.5">{dailyPagesRead} Sayfa</p>
                    </div>
                     <div className="flex items-center gap-3 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50">
                        <div className="flex items-center gap-1.5">
                           <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                           <span className="text-[10px] text-zinc-300 font-medium">Bugün</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span>
                           <span className="text-[10px] text-zinc-300 font-medium">Hedef</span>
                        </div>
                     </div>
                </div>

                <div className="relative h-48 w-full select-none">
                    {/* Goal Line */}
                    <div 
                        className="absolute w-full border-t border-dashed border-zinc-500/50 z-0 flex items-center"
                        style={{ bottom: `${Math.min((dailyPageGoal / maxChartValue) * 100, 100)}%` }}
                    >
                         <span className="absolute right-0 -top-5 text-[10px] font-medium text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded backdrop-blur-sm">Hedef: {dailyPageGoal}</span>
                    </div>

                    {/* Bars */}
                    <div className="relative z-10 flex items-end justify-between h-full gap-2 sm:gap-4">
                        {chartData.map((data, index) => {
                             const heightPercent = maxChartValue > 0 ? Math.min((data.value / maxChartValue) * 100, 100) : 0;
                             
                             return (
                             <div key={index} className="flex flex-col items-center flex-1 h-full justify-end group cursor-default">
                                <div className="relative w-full max-w-[32px] flex items-end justify-center h-full">
                                   <div 
                                      className={`w-full rounded-t-sm transition-all duration-500 ease-out relative group-hover:opacity-90 ${data.isToday ? 'bg-primary shadow-[0_0_10px_rgba(19,127,236,0.3)]' : 'bg-zinc-700'}`}
                                      style={{ height: `${heightPercent}%` }}
                                   >
                                      {/* Value Label */}
                                      <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded transition-all transform ${data.isToday ? 'bg-primary text-white scale-100' : 'bg-zinc-800 text-zinc-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'}`}>
                                          {data.value}
                                      </div>
                                   </div>
                                </div>
                                <span className={`text-[10px] mt-3 font-medium transition-colors ${data.isToday ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-400'}`}>{data.label}</span>
                             </div>
                             );
                        })}
                    </div>
                </div>
             </div>
        </section>

        {/* Monthly Goals */}
        <section>
          <h2 className="text-white text-xl font-bold px-4 pb-3 pt-6">Aylık Hedefler</h2>
          <div className="flex flex-col gap-4 px-4">
            
            {/* Goal 1: Read 2 Books This Month */}
            <div className={`group relative overflow-hidden rounded-xl bg-card-dark border ${isMonthlyBookGoalMet ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-zinc-800'} p-5 transition-all duration-500`}>
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${isMonthlyBookGoalMet ? 'bg-green-500 text-white scale-110 rotate-12 shadow-lg shadow-green-500/30' : 'bg-blue-500/10 text-blue-400'}`}>
                        <span className={`material-symbols-outlined text-2xl ${isMonthlyBookGoalMet ? 'animate-bounce' : ''}`}>
                            {isMonthlyBookGoalMet ? 'emoji_events' : 'auto_stories'}
                        </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-base font-bold transition-colors ${isMonthlyBookGoalMet ? 'text-green-400' : 'text-white'}`}>
                                Bu Ay 2 Kitap
                            </h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isMonthlyBookGoalMet ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                {monthlyBooksReadCount}/{monthlyBookGoal}
                            </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${isMonthlyBookGoalMet ? 'bg-green-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min((monthlyBooksReadCount / monthlyBookGoal) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500 truncate">
                            {isMonthlyBookGoalMet ? "Tebrikler! Bu ayki hedef tamamlandı." : "Hedefe ulaşmak için okumaya devam et."}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Goal 2: Discover New Genre */}
            <div className={`group relative overflow-hidden rounded-xl bg-card-dark border ${newGenreDiscovered ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-zinc-800'} p-5 transition-all duration-500`}>
                <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${newGenreDiscovered ? 'bg-green-500 text-white scale-110 rotate-12 shadow-lg shadow-green-500/30' : 'bg-purple-500/10 text-purple-400'}`}>
                        <span className={`material-symbols-outlined text-2xl ${newGenreDiscovered ? 'animate-bounce' : ''}`}>
                            {newGenreDiscovered ? 'verified' : 'explore'}
                        </span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-base font-bold transition-colors ${newGenreDiscovered ? 'text-green-400' : 'text-white'}`}>
                                Yeni Tür Keşfi
                            </h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${newGenreDiscovered ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                {newGenreDiscovered ? '1/1' : '0/1'}
                            </span>
                        </div>

                         {/* Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                            <div 
                               className={`h-full rounded-full transition-all duration-1000 ease-out ${newGenreDiscovered ? 'bg-green-500' : 'bg-purple-500'}`} 
                               style={{ width: newGenreDiscovered ? '100%' : '0%' }}
                            ></div>
                        </div>
                         <p className="mt-2 text-xs text-zinc-500 truncate">
                            {newGenreDiscovered ? "Yeni bir ufuk açtın!" : "Farklı bir kategoriden kitap oku."}
                        </p>
                    </div>
                </div>
            </div>

          </div>
        </section>

         {/* Monthly Report Section - Interactive */}
         <section>
          <h2 className="text-white text-xl font-bold px-4 pb-3 pt-6">Aylık Özet Raporu</h2>
          <div className="px-4">
            <div className="bg-card-dark border border-zinc-800 rounded-xl p-5 shadow-sm">
                
                {/* Interactive Month Selector */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
                    <button 
                        onClick={handlePrevMonth}
                        className="h-8 w-8 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">chevron_left</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                         <span className="material-symbols-outlined text-zinc-500 text-lg">calendar_month</span>
                         <span className="text-sm font-bold text-white uppercase tracking-wider">{reportMonthName}</span>
                    </div>

                    <button 
                        onClick={handleNextMonth}
                        disabled={isViewingCurrentMonth}
                        className={`h-8 w-8 flex items-center justify-center rounded-full transition-colors ${isViewingCurrentMonth ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                    >
                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center p-3 bg-zinc-800/30 rounded-lg">
                        <span className="text-2xl font-bold text-white mb-1">{reportBookCount}</span>
                        <span className="text-[10px] text-zinc-500 text-center leading-tight">Okunan<br/>Kitap</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-zinc-800/30 rounded-lg">
                        <span className="text-2xl font-bold text-yellow-500 mb-1">{avgReportRating}</span>
                        <span className="text-[10px] text-zinc-500 text-center leading-tight">Ortalama<br/>Puan</span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-zinc-800/30 rounded-lg">
                        <span className="text-lg font-bold text-purple-400 mb-1 truncate max-w-full px-1">{favoriteReportGenre}</span>
                        <span className="text-[10px] text-zinc-500 text-center leading-tight">Favori<br/>Tür</span>
                    </div>
                </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-end bg-[#101922]/90 backdrop-blur-md border-t border-zinc-800 h-20 pb-4 z-40">
        <button 
          onClick={() => onNavClick('dashboard')} 
          className="flex flex-col items-center justify-center gap-1 w-20 text-zinc-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium">Anasayfa</span>
        </button>
        
        {/* 100 Button */}
        <div className="relative -top-5">
           <button 
             onClick={() => onNavClick('top100')}
             className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 transform transition-transform hover:scale-110 active:scale-95 border-4 border-background-dark"
           >
             <span className="text-sm font-black tracking-tighter">100</span>
           </button>
        </div>

        <button className="flex flex-col items-center justify-center gap-1 w-20 text-primary transition-colors">
          <span className="material-symbols-outlined material-symbols-filled">emoji_events</span>
          <span className="text-[10px] font-bold">Başarılar</span>
        </button>
      </nav>
    </div>
  );
};

export default Stats;
