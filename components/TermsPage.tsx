
import React, { useState } from 'react';
import { Download, Copy, Check, ChevronRight, AlertCircle, User, Wallet, ShieldCheck } from 'lucide-react';
import { Particles } from './Particles';
import { audioService } from '../services/audioService';

interface TermsPageProps {
  onFinish: (userId: string) => void;
  translations: any;
  lang: string;
  theme?: 'dark' | 'light';
}

export const TermsPage: React.FC<TermsPageProps> = ({ onFinish, translations, lang, theme = 'dark' }) => {
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const PROMO_CODE = "Abdo7";
  const APK_URL = "https://1xbet.com/en/mobile"; // Placeholder URL

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_CODE);
    audioService.playCopySound();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    if (!userId.trim()) {
      setError(lang === 'ar' ? 'يرجى إدخال معرف اللاعب الخاص بك' : 'Please enter your Player ID');
      return;
    }
    
    setIsLoading(true);
    audioService.playScanStart();
    
    setTimeout(() => {
      setIsLoading(false);
      audioService.playLoginSuccess();
      onFinish(userId.trim());
    }, 3000);
  };

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto relative overflow-hidden transition-all duration-700 animate-[fadeIn_0.8s_ease-out] 
      ${theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50'}
      ${lang === 'ar' ? 'lang-ar font-arabic' : ''}`}>
      
      <div className="absolute inset-0 z-0">
        <Particles theme={theme} />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-[fadeIn_0.3s_ease-out]">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-rose-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldCheck size={32} className="text-rose-500 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-white font-black tracking-[0.2em] uppercase text-sm font-orbitron">
              {lang === 'ar' ? 'جاري التحقق من الهوية' : 'VERIFYING_IDENTITY'}
            </h3>
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1 h-1 bg-rose-500 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col px-8 pt-12 pb-8 z-30 overflow-y-auto no-scrollbar">
        <div className="mb-8 text-center">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-rose-600 blur-[60px] opacity-20 animate-pulse"></div>
            <ShieldCheck size={48} className="text-rose-500 relative z-10 drop-shadow-[0_0_15px_rgba(225,29,72,0.8)]" />
          </div>
          <h2 className={`text-2xl font-black tracking-widest uppercase font-orbitron ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
            {lang === 'ar' ? 'شروط التفعيل' : 'ACTIVATION_TERMS'}
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-2 ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}>
            {lang === 'ar' ? 'يرجى اتباع الخطوات التالية لتفعيل النظام' : 'FOLLOW STEPS TO ACTIVATE SYSTEM'}
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1: Download */}
          <div className={`p-5 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black font-orbitron text-xs">1</div>
              <span className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                {lang === 'ar' ? 'تحميل تطبيق 1XBET' : 'Download 1XBET APK'}
              </span>
            </div>
            <a 
              href={APK_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 rounded-2xl flex items-center justify-center gap-2 text-rose-500 transition-all active:scale-95"
            >
              <Download size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest font-orbitron">Download Now</span>
            </a>
          </div>

          {/* Step 2: Promo Code */}
          <div className={`p-5 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black font-orbitron text-xs">2</div>
              <span className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                {lang === 'ar' ? 'التسجيل بكود البرومو' : 'LOGIN WITH PROMOCODE'}
              </span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-2xl border ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
              <span className="text-lg font-black font-orbitron text-rose-500 tracking-widest ml-2">{PROMO_CODE}</span>
              <button 
                onClick={handleCopy}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-90"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? (lang === 'ar' ? 'تم' : 'COPIED') : (lang === 'ar' ? 'نسخ' : 'COPY')}
              </button>
            </div>
          </div>

          {/* Step 3: Deposit */}
          <div className={`p-5 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black font-orbitron text-xs">3</div>
              <div className="flex flex-col">
                <span className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                  {lang === 'ar' ? 'إيداع 300 جنيه أو أكثر' : 'Deposit 300 LE or Above'}
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <Wallet size={10} className="text-rose-500/50" />
                  <span className="text-[8px] font-bold text-rose-500/50 uppercase tracking-widest">Required for activation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: ID Input */}
          <div className={`p-5 rounded-3xl border transition-all ${theme === 'dark' ? 'bg-white/[0.02] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 font-black font-orbitron text-xs">4</div>
              <span className={`text-xs font-black uppercase tracking-wider ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                {lang === 'ar' ? 'أدخل معرف اللاعب الخاص بك' : 'Write your Id'}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User size={16} className="text-rose-500/40" />
              </div>
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  if(error) setError(null);
                }}
                placeholder="ID: 12345678"
                className={`w-full py-4 pl-12 pr-4 rounded-2xl border text-sm font-orbitron transition-all focus:outline-none focus:border-rose-500/50
                  ${theme === 'dark' ? 'bg-black/40 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
              />
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-rose-500 text-[10px] font-bold animate-[fadeIn_0.2s_ease-out]">
                <AlertCircle size={12} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleContinue}
            className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] font-orbitron shadow-[0_20px_40px_rgba(225,29,72,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {lang === 'ar' ? 'متابعة' : 'CONTINUE'}
            <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
          </button>
        </div>
      </div>

      <div className="pb-8 flex flex-col items-center gap-2 relative z-30">
        <span className={`text-[8px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>
          NINJA STOR V1 SECURITY
        </span>
      </div>
    </div>
  );
};
