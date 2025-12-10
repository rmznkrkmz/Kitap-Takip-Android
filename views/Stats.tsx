import React, { useState, useEffect, useRef } from 'react';
import { Book, ViewState, Translation, LanguageCode } from '../types';

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
  streakCount: number;
  hasReadToday: boolean;
  onIncrementStreak: () => void;
  readingHistory: Record<string, number>;
  hasSetGoals: boolean;
  onCompleteGoals: () => void;
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
  streakCount,
  hasReadToday,
  onIncrementStreak,
  readingHistory,
  hasSetGoals,
  onCompleteGoals,
  t,
  language
}) => {
  const readCount = books.filter(b => b.status === 'read').length;
  const isYearlyGoalMet = readCount >= yearlyGoal;

  // Local state for manual page input
  const [localPagesInput, setLocalPagesInput] = useState(dailyPagesRead.toString());
  
  // Toast Notification State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Onboarding State
  const [onboardingStep, setOnboardingStep] = useState(hasSetGoals ? 0 : 1);
  const [tempYearlyGoal, setTempYearlyGoal] = useState(yearlyGoal);
  const [tempDailyGoal, setTempDailyGoal] = useState(dailyPageGoal);

  // Monthly Report Navigation State
  const [reportDate, setReportDate] = useState(new Date());

  // Refs to track previous values for goal completion detection
  const prevDailyPages = useRef(dailyPagesRead);
  const prevDailyGoal = useRef(dailyPageGoal);
  const prevYearlyGoal = useRef(yearlyGoal);
  const prevReadCount = useRef(readCount);

  // --- Date and Time Logic ---
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  // Dynamic Date Formatting
  const todayFormatted = now.toLocaleDateString(getLocale(language));

  // Calculate day index for chart (Mon=0, Tue=1, ... Sun=6)
  const currentDayOfWeek = now.getDay();
  const normalizedCurrentDayIndex = (currentDayOfWeek + 6) % 7;

  // --- Chart Data Generation (Real History) ---
  const dayLabels = t.days_short;
  
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const diffDays = i - normalizedCurrentDayIndex;
    const date = new Date(now);
    date.setDate(now.getDate() + diffDays);
    
    // Ensure this matches getTodayISO format in App.tsx
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    return {
      label: dayLabels[i],
      value: readingHistory[dateKey] || 0,
      isFuture: diffDays > 0 
    };
  });

  const maxDataValue = Math.max(...chartData.map(d => d.value));
  // Increased buffer to 1.3 to prevent overflow at top
  const maxChartValue = Math.max(maxDataValue, dailyPageGoal, 10) * 1.3;

  // --- Current Month Statistics Logic (For Goals) ---
  const readBooks = books.filter(b => b.status === 'read');

  const booksReadThisCurrentMonth = readBooks.filter(b => {
    if (!b.finishDate) return false;
    const date = new Date(b.finishDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const booksReadBeforeThisMonth = readBooks.filter(b => {
      if (!b.finishDate) return true;
      const date = new Date(b.finishDate);
      return date < new Date(currentYear, currentMonth, 1);
  });

  // Goal 1: Read 2 books this month
  const monthlyBookGoal = 2;
  const monthlyBooksReadCount = booksReadThisCurrentMonth.length;
  const isMonthlyBookGoalMet = monthlyBooksReadCount >= monthlyBookGoal;

  // Goal 2: Discover a new genre
  const pastGenres = new Set(booksReadBeforeThisMonth.map(b => b.genre).filter(Boolean));
  const newGenreDiscovered = booksReadThisCurrentMonth.some(b => b.genre && !pastGenres.has(b.genre));
  
  // --- Historical Monthly Report Logic (For Report Section) ---
  const reportMonthIndex = reportDate.getMonth();
  const reportYearVal = reportDate.getFullYear();
  const reportMonthName = reportDate.toLocaleDateString(getLocale(language), { month: 'long', year: 'numeric' });

  const booksReadInReportMonth = readBooks.filter(b => {
      if (!b.finishDate) return false;
      const date = new Date(b.finishDate);
      return date.getMonth() === reportMonthIndex && date.getFullYear() === reportYearVal;
  });

  const reportGenres = booksReadInReportMonth.map(b => b.genre).filter(Boolean) as string[];
  const genreCounts: Record<string, number> = {};
  let reportMostReadGenre = "-";
  let maxGenreCount = 0;

  reportGenres.forEach(genre => {
    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    if (genreCounts[genre] > maxGenreCount) {
      maxGenreCount = genreCounts[genre];
      reportMostReadGenre = genre;
    }
  });

  const handlePrevMonth = () => {
      const newDate = new Date(reportDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setReportDate(newDate);
  };

  const handleNextMonth = () => {
      const newDate = new Date(reportDate);
      newDate.setMonth(newDate.getMonth() + 1);
      // Prevent going to future months for reporting
      if (newDate > now) return;
      setReportDate(newDate);
  };
  
  // Check if next month is available (not in future)
  const isNextMonthDisabled = 
      reportDate.getMonth() === currentMonth && 
      reportDate.getFullYear() === currentYear;

  // --- End Logic ---

  useEffect(() => {
    setLocalPagesInput(dailyPagesRead.toString());
  }, [dailyPagesRead]);

  useEffect(() => {
    const isDailyMet = dailyPagesRead >= dailyPageGoal && dailyPageGoal > 0;
    const wasDailyMet = prevDailyPages.current >= prevDailyGoal.current && prevDailyGoal.current > 0;

    if (isDailyMet && !wasDailyMet) {
       setToastMessage(t.goal_met_desc + " 🎉");
       setShowToast(true);
       setTimeout(() => setShowToast(false), 6000);
    }

    prevDailyPages.current = dailyPagesRead;
    prevDailyGoal.current = dailyPageGoal;
  }, [dailyPagesRead, dailyPageGoal]);

  useEffect(() => {
    const currentReadCount = books.filter(b => b.status === 'read').length;
    const isYearlyMet = currentReadCount >= yearlyGoal && yearlyGoal > 0;
    const wasYearlyMet = prevReadCount.current >= prevYearlyGoal.current && prevYearlyGoal.current > 0;

    if (isYearlyMet && !wasYearlyMet) {
       setToastMessage(t.goal_met_desc + " 🏆");
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

  // Onboarding Logic
  const handleOnboardingNext = () => {
      setYearlyGoal(tempYearlyGoal);
      setOnboardingStep(2);
  };

  const handleOnboardingFinish = () => {
      setDailyPageGoal(tempDailyGoal);
      onCompleteGoals();
      setOnboardingStep(0);
  };

  const isGoalMet = dailyPagesRead >= dailyPageGoal && dailyPageGoal > 0;

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-dark text-white font-display">
      
      {/* Onboarding Wizard Overlay */}
      {onboardingStep > 0 && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-card-dark w-full max-w-md rounded-3xl border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
                  {/* Decorative Background Element */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                  
                  {onboardingStep === 1 && (
                      <div className="flex flex-col items-center text-center gap-6 animate-in slide-in-from-right duration-300">
                          <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                              <span className="material-symbols-outlined text-4xl">emoji_events</span>
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">{t.yearly_goal}</h2>
                            <p className="text-zinc-400">{t.onboarding_yearly_goal_question}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 bg-zinc-800/50 p-2 rounded-2xl border border-zinc-700 w-full justify-center">
                              <button 
                                onClick={() => setTempYearlyGoal(Math.max(1, tempYearlyGoal - 1))}
                                className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl transition-colors text-2xl"
                              >-</button>
                              <span className="text-4xl font-bold text-white w-20">{tempYearlyGoal}</span>
                              <button 
                                onClick={() => setTempYearlyGoal(tempYearlyGoal + 1)}
                                className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl transition-colors text-2xl"
                              >+</button>
                          </div>
                          
                          <button 
                             onClick={handleOnboardingNext}
                             className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all active:scale-95 mt-4"
                          >
                              {t.save}
                          </button>
                      </div>
                  )}

                  {onboardingStep === 2 && (
                      <div className="flex flex-col items-center text-center gap-6 animate-in slide-in-from-right duration-300">
                           <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-2">
                              <span className="material-symbols-outlined text-4xl">auto_stories</span>
                          </div>
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-white">{t.daily_goal}</h2>
                            <p className="text-zinc-400">{t.onboarding_daily_goal_question}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 bg-zinc-800/50 p-2 rounded-2xl border border-zinc-700 w-full justify-center">
                              <button 
                                onClick={() => setTempDailyGoal(Math.max(5, tempDailyGoal - 5))}
                                className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl transition-colors text-2xl"
                              >-</button>
                              <span className="text-4xl font-bold text-white w-20">{tempDailyGoal}</span>
                              <button 
                                onClick={() => setTempDailyGoal(tempDailyGoal + 5)}
                                className="w-12 h-12 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl transition-colors text-2xl"
                              >+</button>
                          </div>
                          
                          <button 
                             onClick={handleOnboardingFinish}
                             className="w-full h-14 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/25 transition-all active:scale-95 mt-4"
                          >
                              {t.save}
                          </button>
                      </div>
                  )}
                  
                  {/* Step Indicator */}
                  <div className="flex justify-center gap-2 mt-6">
                      <div className={`w-2 h-2 rounded-full transition-colors ${onboardingStep === 1 ? 'bg-primary' : 'bg-zinc-700'}`}></div>
                      <div className={`w-2 h-2 rounded-full transition-colors ${onboardingStep === 2 ? 'bg-primary' : 'bg-zinc-700'}`}></div>
                  </div>
              </div>
          </div>
      )}

      {/* Toast Notification */}
      <div 
        className={`fixed inset-x-0 top-[60px] z-50 flex justify-center px-4 transition-all duration-700 ease-out ${showToast ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto' : '-translate-y-10 opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="bg-gradient-to-r from-green-900/90 to-[#1c2127]/95 backdrop-blur-xl border border-green-500/50 text-white p-6 rounded-2xl shadow-[0_10px_40px_-10px_rgba(34,197,94,0.5)] flex flex-col items-center gap-3 text-center max-w-sm w-full">
           <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-full text-white shadow-lg shadow-green-500/30 mb-1 animate-bounce">
             <span className="material-symbols-outlined material-symbols-filled text-3xl">celebration</span>
           </div>
           <div>
             <h4 className="font-bold text-xl tracking-tight">{t.completed}!</h4>
             <p className="text-zinc-200 mt-1 font-medium">{toastMessage}</p>
           </div>
           <button 
             onClick={() => setShowToast(false)}
             className="mt-2 text-xs font-bold uppercase tracking-wider text-green-400 hover:text-green-300 px-4 py-2 rounded-lg hover:bg-green-500/10 transition-colors cursor-pointer relative z-50"
           >
             {t.close}
           </button>
        </div>
      </div>

      {/* HEADER Z-INDEX FIXED: changed z-10 to z-40 to stay above charts */}
      <header className={`flex items-center bg-background-dark px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] justify-between sticky top-0 z-40 border-b border-zinc-800/50 transition-all`}>
        <button onClick={onBack} className="text-white flex h-10 w-10 -ml-2 shrink-0 items-center justify-center rounded-full hover:bg-zinc-800 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-white text-lg font-bold leading-tight flex-1 ml-2">{t.stats_title}</h1>
      </header>

      <main className="flex-1 pb-24">
        {/* Streak Card - Minimalist */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-card-dark p-3 shadow-md relative z-20">
             <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${hasReadToday ? 'bg-orange-500/10 text-orange-500' : 'bg-zinc-800 text-zinc-600'}`}>
                   <span className={`material-symbols-outlined text-xl ${hasReadToday ? 'animate-pulse' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-lg font-bold leading-none text-white">{streakCount} {t.streak_day}</span>
                   <span className="text-[10px] font-medium text-zinc-500">{hasReadToday ? t.streak_active : t.streak_risk}</span>
                </div>
             </div>
             
             <button 
                onClick={onIncrementStreak}
                disabled={hasReadToday}
                className={`h-9 rounded-lg px-4 text-xs font-bold transition-all relative z-30 cursor-pointer ${
                  hasReadToday 
                    ? 'cursor-default bg-green-500/10 text-green-400' 
                    : 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-95'
                }`}
              >
                {hasReadToday ? t.completed : t.today_read}
              </button>
          </div>
        </div>

        {/* Custom Goals Section */}
        <section>
          <h2 className="text-white text-xl font-bold px-4 pb-3 pt-6">{t.personal_goals}</h2>
          <div className="flex flex-col gap-4 px-4">
            
            {/* Yearly Goal Card */}
            <div className={`bg-card-dark border rounded-xl p-5 transition-all duration-500 ${isYearlyGoalMet ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-zinc-800'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isYearlyGoalMet ? 'bg-green-500 text-white animate-bounce' : 'bg-blue-500/20 text-blue-400'}`}>
                     <span className="material-symbols-outlined">{isYearlyGoalMet ? 'emoji_events' : 'menu_book'}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{t.yearly_goal}</h3>
                    <p className="text-xs text-zinc-400">
                      {isYearlyGoalMet ? t.goal_met_desc : t.yearly_goal_desc}
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
                 <span className="text-sm text-zinc-500 mb-1">/ {yearlyGoal}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden relative">
                 <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isYearlyGoalMet ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-[pulse_3s_ease-in-out_infinite]' : 'bg-blue-500'}`} 
                    style={{ width: `${Math.min((readCount / yearlyGoal) * 100, 100)}%` }}
                 >
                    {isYearlyGoalMet && <div className="absolute inset-0 bg-white/30 animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>}
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
                    <h3 className="font-semibold text-white">{t.daily_goal}</h3>
                    <p className="text-xs text-zinc-400">
                      {isGoalMet ? t.goal_met_desc : t.daily_goal_desc}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-zinc-500">{t.chart_goal}</span>
                    <div className="flex items-center bg-zinc-800 rounded-lg px-2 py-1 gap-2">
                         <input 
                            type="number" 
                            value={dailyPageGoal}
                            onChange={(e) => setDailyPageGoal(parseInt(e.target.value) || 0)}
                            className="w-12 bg-transparent text-right text-sm font-bold text-white focus:outline-none"
                         />
                         <span className="text-xs text-zinc-500">{t.page}</span>
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
                          {t.save}
                        </button>
                     </div>
                     <span className="text-xs text-zinc-500">{t.tab_reading}</span>
                 </div>
                 
                 <button 
                    onClick={() => setDailyPagesRead(dailyPagesRead + 10)}
                    className="w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/20 transition-colors shrink-0"
                 >+10</button>
              </div>
              
              <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden relative">
                 <div 
                    className={`h-full rounded-full transition-all duration-700 ${isGoalMet ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-[pulse_3s_ease-in-out_infinite]' : 'bg-green-500'}`} 
                    style={{ width: `${Math.min((dailyPagesRead / dailyPageGoal) * 100, 100)}%` }}
                  >
                     {isGoalMet && <div className="absolute inset-0 bg-white/30 animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>}
                  </div>
              </div>
            </div>

          </div>
        </section>

        {/* Weekly Activity Chart */}
        <section>
             <h2 className="text-white text-xl font-bold px-4 pb-3 pt-6">{t.weekly_activity}</h2>
             {/* Added overflow-hidden to prevent chart bars from bleeding out */}
             <div className="mx-4 bg-card-dark border border-zinc-800 rounded-xl p-5 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                          {t.today_read} <span className="text-zinc-500 text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">{todayFormatted}</span>
                        </p>
                        <p className="text-white text-2xl font-bold mt-0.5">{dailyPagesRead} {t.page}</p>
                    </div>
                     <div className="flex items-center gap-3 bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-700/50">
                        <div className="flex items-center gap-1.5">
                           <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                           <span className="text-[10px] text-zinc-300 font-medium">{t.chart_read}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span>
                           <span className="text-[10px] text-zinc-300 font-medium">{t.chart_goal}</span>
                        </div>
                     </div>
                </div>

                <div className="relative h-56 w-full select-none pt-6"> {/* Added pt-6 for top headroom */}
                    {/* Goal Line */}
                    <div 
                        className="absolute w-full border-t border-dashed border-zinc-500/50 z-0 flex items-center"
                        style={{ bottom: `${Math.min((dailyPageGoal / maxChartValue) * 100, 100)}%` }}
                    >
                         <span className="absolute right-0 -top-5 text-[10px] font-medium text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded backdrop-blur-sm">{t.chart_goal}: {dailyPageGoal}</span>
                    </div>

                    {/* Bars */}
                    <div className="relative z-10 flex items-end justify-between h-full gap-2 sm:gap-4">
                        {chartData.map((data, index) => {
                             const isToday = index === normalizedCurrentDayIndex;
                             const heightPercent = Math.min((data.value / maxChartValue) * 100, 100);
                             
                             return (
                             <div key={index} className={`flex flex-col items-center flex-1 h-full justify-end group ${data.isFuture ? 'opacity-30 pointer-events-none' : 'cursor-default'}`}>
                                <div className="relative w-full max-w-[32px] flex items-end justify-center h-full">
                                   <div 
                                      className={`w-full rounded-t-sm transition-all duration-500 ease-out relative group-hover:opacity-90 ${isToday ? 'bg-primary shadow-[0_0_10px_rgba(19,127,236,0.3)]' : 'bg-zinc-700'}`}
                                      style={{ height: `${heightPercent}%` }}
                                   >
                                      {/* Value Label - Always show for today, hover for others if value > 0 */}
                                      {(isToday || data.value > 0) && (
                                        <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded transition-all transform z-50 whitespace-nowrap ${isToday ? 'bg-primary text-white scale-100 opacity-100' : 'bg-zinc-800 text-zinc-300 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'}`}>
                                            {data.value}
                                        </div>
                                      )}
                                   </div>
                                </div>
                                <span className={`text-[10px] mt-3 font-medium transition-colors ${isToday ? 'text-primary font-bold' : 'text-zinc-500 group-hover:text-zinc-400'}`}>{data.label}</span>
                             </div>
                             );
                        })}
                    </div>
                </div>
             </div>
        </section>

        {/* Monthly Goals - Keeps focus on CURRENT month for gamification */}
        <section>
          <h2 className="text-white text-xl font-bold px-4 pb-3 pt-6">{t.monthly_goals}</h2>
          <div className="flex flex-col gap-4 px-4">
            
            {/* Goal 1: Read 2 Books This Month */}
            <div className={`group relative overflow-hidden rounded-xl bg-card-dark border ${isMonthlyBookGoalMet ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-zinc-800'} p-5 transition-all duration-500`}>
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${isMonthlyBookGoalMet ? 'bg-green-500 text-white scale-110 rotate-12 shadow-lg shadow-green-500/30' : 'bg-blue-500/10 text-blue-400'}`}>
                        <span className={`material-symbols-outlined text-2xl ${isMonthlyBookGoalMet ? 'animate-bounce' : ''}`}>
                            {isMonthlyBookGoalMet ? 'emoji_events' : 'auto_stories'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-base font-bold transition-colors ${isMonthlyBookGoalMet ? 'text-green-400' : 'text-white'}`}>
                                {t.goal_2_books}
                            </h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${isMonthlyBookGoalMet ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                {monthlyBooksReadCount}/{monthlyBookGoal}
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${isMonthlyBookGoalMet ? 'bg-green-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min((monthlyBooksReadCount / monthlyBookGoal) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="mt-2 text-xs text-zinc-500 truncate">
                            {isMonthlyBookGoalMet ? t.goal_met_desc : t.goal_continue}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Goal 2: Discover New Genre */}
            <div className={`group relative overflow-hidden rounded-xl bg-card-dark border ${newGenreDiscovered ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.15)]' : 'border-zinc-800'} p-5 transition-all duration-500`}>
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${newGenreDiscovered ? 'bg-green-500 text-white scale-110 rotate-12 shadow-lg shadow-green-500/30' : 'bg-purple-500/10 text-purple-400'}`}>
                        <span className={`material-symbols-outlined text-2xl ${newGenreDiscovered ? 'animate-bounce' : ''}`}>
                            {newGenreDiscovered ? 'verified' : 'explore'}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-base font-bold transition-colors ${newGenreDiscovered ? 'text-green-400' : 'text-white'}`}>
                                {t.goal_new_genre}
                            </h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${newGenreDiscovered ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                {newGenreDiscovered ? '1/1' : '0/1'}
                            </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                            <div 
                               className={`h-full rounded-full transition-all duration-1000 ease-out ${newGenreDiscovered ? 'bg-green-500' : 'bg-purple-500'}`} 
                               style={{ width: newGenreDiscovered ? '100%' : '0%' }}
                            ></div>
                        </div>
                         <p className="mt-2 text-xs text-zinc-500 truncate">
                            {newGenreDiscovered ? t.goal_met_desc : t.goal_continue}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Monthly Book Report (Navigable) */}
        <section>
          <div className="flex items-center justify-between px-4 pb-3 pt-6">
            <h2 className="text-white text-xl font-bold">{t.monthly_report}</h2>
            <div className="flex items-center bg-zinc-800 rounded-lg p-1 gap-1">
                 <button 
                    onClick={handlePrevMonth}
                    className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-md transition-colors"
                 >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                 </button>
                 <span className="text-xs font-medium text-white px-2 min-w-[100px] text-center">{reportMonthName}</span>
                 <button 
                    onClick={handleNextMonth}
                    disabled={isNextMonthDisabled}
                    className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${isNextMonthDisabled ? 'text-zinc-600 cursor-not-allowed' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                 >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                 </button>
            </div>
          </div>
          <div className="mx-4 grid grid-cols-2 gap-3 mb-6">
             <div className="bg-card-dark border border-zinc-800 p-4 rounded-xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200" key={`count-${reportMonthIndex}`}>
                <span className="material-symbols-outlined text-zinc-500 mb-2">import_contacts</span>
                <span className="text-2xl font-bold text-white">{booksReadInReportMonth.length}</span>
                <span className="text-xs text-zinc-400">{t.books_read_count}</span>
             </div>
             
             <div className="bg-card-dark border border-zinc-800 p-4 rounded-xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200" key={`genre-${reportMonthIndex}`}>
                <span className="material-symbols-outlined text-zinc-500 mb-2">category</span>
                <span className="text-lg font-bold text-white truncate w-full">{reportMostReadGenre}</span>
                <span className="text-xs text-zinc-400">{t.favorite_genre}</span>
             </div>
          </div>
        </section>
        
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around items-center bg-[#101922]/90 backdrop-blur-md border-t border-zinc-800 h-20 z-40 pb-safe">
        <button 
          onClick={() => onNavClick('dashboard')}
          className="flex flex-col items-center justify-center gap-1 w-20 text-zinc-500 hover:text-white transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">home</span>
          <span className="text-[10px] font-medium">{t.nav_home}</span>
        </button>

         <button 
          onClick={() => onNavClick('reading-list-100')}
          className="relative -top-4 active:scale-95 transition-transform"
        >
           <div className="flex flex-col items-center justify-center h-16 w-16 rounded-full bg-zinc-900 text-white shadow-lg shadow-black/20 hover:scale-105 active:scale-95 transition-transform border-4 border-[#101922]">
              <span className="text-xl font-black leading-none tracking-tighter">100</span>
              <span className="text-[8px] font-bold uppercase tracking-wide opacity-80 mt-0.5">{t.nav_list}</span>
           </div>
        </button>

        <button 
           className="flex flex-col items-center justify-center gap-1 w-20 text-primary active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-2xl material-symbols-filled">emoji_events</span>
          <span className="text-[10px] font-bold">{t.nav_stats}</span>
        </button>
      </nav>

    </div>
  );
};

export default Stats;