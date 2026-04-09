
import React, { useEffect, useState, useRef } from 'react';
import { Particles } from './Particles';

interface SplashScreenProps {
  onFinish: () => void;
  translations: {
    splashInit: string;
    splashSecured: string;
  };
  lang: string;
  theme?: 'dark' | 'light';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish, lang, theme = 'dark' }) => {
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);
  const onFinishRef = useRef(onFinish);

  // Keep the latest onFinish in a ref to avoid resetting the interval
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const duration = 4000;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const calculatedProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(calculatedProgress);

      if (calculatedProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => setExit(true), 500);
        setTimeout(() => {
          onFinishRef.current();
        }, 1200);
      }
    }, 30);

    return () => clearInterval(timer);
  }, []); // Only run once on mount

  const isArabic = lang === 'ar';

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 ease-in-out 
      ${theme === 'dark' ? 'bg-[#020202]' : 'bg-slate-50'}
      ${exit ? 'opacity-0 scale-110 blur-xl' : 'opacity-100'} 
      ${isArabic ? 'font-arabic' : ''}`}>
      
      {/* Background with Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Particles theme={theme} />
        <div className={`absolute inset-0 bg-gradient-to-b via-transparent transition-colors duration-1000
          ${theme === 'dark' ? 'from-rose-900/10 to-black' : 'from-rose-500/5 to-slate-50'}`}></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center max-w-xs w-full px-6">
        {/* Main Logo */}
        <div className="relative mb-10 group">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-600 blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <img 
              src="https://image2url.com/r2/bucket2/images/1766784510979-3fece383-00b0-4520-b8a6-809fe17cf95d.png" 
              alt="Aviator Logo"
              className="w-52 h-auto relative z-10 drop-shadow-[0_0_45px_rgba(225,29,72,0.8)] animate-[float_4s_ease-in-out_infinite]"
            />
          </div>
        </div>

        {/* App Branding */}
        <div className="text-center mb-16 space-y-2">
          <h1 className={`text-3xl font-black tracking-[0.2em] uppercase drop-shadow-[0_0_20px_rgba(225,29,72,0.3)] 
            ${isArabic ? 'font-arabic tracking-normal' : 'font-orbitron'}
            ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            NINJA <span className="text-rose-600">pro V3.0</span>
          </h1>
          <div className="flex items-center justify-center gap-3 opacity-40">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-rose-600"></div>
            <span className={`text-[8px] font-black tracking-[0.5em] font-orbitron ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}>AI_RADAR_V3</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-rose-600"></div>
          </div>
        </div>

        {/* Sleek Progress UI */}
        <div className="w-full space-y-4">
          <div className="flex justify-between items-end px-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping"></div>
              <span className={`text-[9px] font-black tracking-widest uppercase font-orbitron ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>
                {isArabic ? 'جاري التحميل' : 'Initializing System'}
              </span>
            </div>
            <span className="text-sm font-black text-rose-500 font-orbitron">
              {Math.floor(progress)}%
            </span>
          </div>
          
          <div className={`h-1.5 w-full rounded-full overflow-hidden p-[1px] relative transition-colors duration-500
            ${theme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-200 border border-slate-200 shadow-inner'}`}>
            <div 
              className="h-full bg-rose-600 rounded-full transition-all duration-300 ease-out shadow-[0_0_20px_rgba(225,29,72,1)] relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/40 blur-md"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-10 opacity-20">
         <p className={`text-[8px] font-black tracking-[0.6em] font-orbitron uppercase ${theme === 'dark' ? 'text-white' : 'text-slate-500'}`}>
            {isArabic ? 'نظام مشفر آمن' : 'SECURE ENCRYPTED SYSTEM'}
         </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};
