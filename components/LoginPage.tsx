
import React, { useState, useEffect } from 'react';
import { Lock, ChevronRight, ShieldCheck, Languages, Check, Copy, CheckCircle2, AlertCircle, Sun, Moon, ClipboardPaste, Loader2, Info } from 'lucide-react';
import { Particles } from './Particles';
import { audioService } from '../services/audioService';

interface LoginPageProps {
  onLogin: () => void;
  translations: any;
  lang: string;
  setLang: (lang: 'en' | 'ar') => void;
  theme?: 'dark' | 'light';
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, translations, lang, setLang, theme = 'dark' }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [clipboardError, setClipboardError] = useState(false);

  const ACCESS_KEY = "Abdo7";

  const loadingTextsAr = ["جاري فحص التشفير...", "مزامنة الرادار تكتيكياً...", "تم التصريح بالدخول!"];
  const loadingTextsEn = ["Verifying Encryption...", "Syncing Tactical Radar...", "Authenticated Successfully!"];

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => (prev < 2 ? prev + 1 : prev));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setClipboardError(false);

    if (password.trim().toLowerCase() !== ACCESS_KEY.toLowerCase()) {
      setError(lang === 'ar' ? 'رمز الوصول غير صحيح' : 'invalid key access');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    audioService.playLoginSuccess();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 2400);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ACCESS_KEY);
    audioService.playCopySound();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutoPaste = async () => {
    setClipboardError(false);
    try {
      // محاولة استخدام Clipboard API
      const text = await navigator.clipboard.readText();
      if (text) {
        setPassword(text.toUpperCase().trim());
        audioService.playCopySound();
        setError(null);
      }
    } catch (err: any) {
      console.warn("Clipboard access denied by browser policy.");
      setClipboardError(true);
      // إظهار رسالة خطأ مؤقتة للمستخدم تخبره بأن المتصفح منع الوصول التلقائي
      setTimeout(() => setClipboardError(false), 4000);
    }
  };

  const selectLanguage = (newLang: 'en' | 'ar') => {
    setLang(newLang);
    setShowLangMenu(false);
  };

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto relative overflow-hidden transition-all duration-700 animate-[fadeIn_0.8s_ease-out] 
      ${theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50'}
      ${lang === 'ar' ? 'lang-ar font-arabic' : ''}`}>
      
      <div className="absolute inset-0 z-0">
        <Particles theme={theme} />
      </div>

      {/* Loading Dialog Overlay - Professional Modal */}
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl animate-[fadeIn_0.3s_ease-out]"></div>
          <div className={`relative w-full max-w-xs border rounded-[2.5rem] p-12 flex flex-col items-center text-center space-y-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-[scaleIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]
            ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'}`}>
            
            <div className="relative">
              <div className="absolute inset-0 bg-rose-600 blur-3xl opacity-30 animate-pulse"></div>
              <div className="w-24 h-24 rounded-3xl border border-rose-500/30 flex items-center justify-center relative overflow-hidden bg-black/40">
                <Loader2 size={40} className="text-rose-500 animate-spin" />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent"></div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className={`text-xs font-black uppercase tracking-[0.3em] font-orbitron ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>
                {lang === 'ar' ? 'جاري معالجة الدخول' : 'INITIALIZING_CORE'}
              </h3>
              <p className={`text-sm font-black uppercase transition-all duration-500 min-h-[1.5rem] ${theme === 'dark' ? 'text-rose-500' : 'text-rose-600'}`}>
                {lang === 'ar' ? loadingTextsAr[loadingStep] : loadingTextsEn[loadingStep]}
              </p>
            </div>

            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= loadingStep ? 'bg-rose-500 scale-110 shadow-[0_0_15px_rgba(225,29,72,0.8)]' : 'bg-white/5'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Language Toggle */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => setShowLangMenu(!showLangMenu)}
          className={`px-4 py-2.5 backdrop-blur-md rounded-2xl border transition-all flex items-center gap-2.5 
            ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10' : 'bg-white hover:bg-slate-100 border-slate-200 shadow-sm'}`}
        >
          <Languages size={14} className="text-rose-500" />
          <span className={`text-[11px] font-black uppercase keep-orbitron ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
            {lang === 'en' ? 'English' : 'العربية'}
          </span>
        </button>

        {showLangMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)}></div>
            <div className={`absolute top-full mt-3 left-0 z-50 min-w-[150px] backdrop-blur-xl border rounded-[1.5rem] shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]
              ${theme === 'dark' ? 'bg-black/90 border-white/10' : 'bg-white border-slate-200'}`}>
              <button 
                onClick={() => selectLanguage('en')}
                className={`w-full px-5 py-4 text-left flex items-center justify-between hover:bg-rose-500/10 transition-colors 
                  ${lang === 'en' ? 'text-rose-500 font-bold' : theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}
              >
                <span className="text-[11px] font-black uppercase tracking-wider font-orbitron">English</span>
                {lang === 'en' && <Check size={14} />}
              </button>
              <div className={`h-px mx-3 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}></div>
              <button 
                onClick={() => selectLanguage('ar')}
                className={`w-full px-5 py-4 text-left flex items-center justify-between hover:bg-rose-500/10 transition-colors 
                  ${lang === 'ar' ? 'text-rose-500 font-bold' : theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}
              >
                <span className="text-[11px] font-black uppercase tracking-wider font-arabic">العربية</span>
                {lang === 'ar' && <Check size={14} />}
              </button>
            </div>
          </>
        )}
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center px-8 z-30">
        <div className="mb-12 text-center animate-[fadeIn_1s_ease-out]">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-rose-600 blur-[80px] opacity-20 animate-pulse"></div>
            <img 
              src="https://image2url.com/r2/bucket2/images/1766784510979-3fece383-00b0-4520-b8a6-809fe17cf95d.png" 
              alt="NINJA STOR Logo"
              className="w-40 h-auto relative z-10 drop-shadow-[0_0_30px_rgba(225,29,72,0.8)]"
            />
          </div>
          <div className="space-y-2">
            <h1 className={`text-3xl font-black tracking-[0.15em] uppercase font-orbitron 
              ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {lang === 'en' ? 'NINJA_STOR_V1' : 'نينجا ستور V1'}
            </h1>
            <div className="flex items-center justify-center gap-3 opacity-40">
              <div className="h-[1px] w-6 bg-rose-600"></div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${lang === 'ar' ? 'tracking-normal' : ''} ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                {lang === 'en' ? 'QUANTUM ENCRYPTION' : 'تشفير كوانتم آمن'}
              </p>
              <div className="h-[1px] w-6 bg-rose-600"></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-5 relative group animate-[fadeIn_1.2s_ease-out]">
          <div className="absolute -inset-6 bg-rose-600/5 blur-3xl rounded-[3rem] -z-10 group-focus-within:bg-rose-600/10 transition-all duration-700"></div>
          
          <div className={`relative transition-transform duration-100 ${shake ? 'translate-x-1 animate-[shake_0.2s_ease-in-out_infinite]' : ''}`}>
            <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-6' : 'left-0 pl-6'} flex items-center pointer-events-none`}>
              <Lock size={20} className={`${error ? 'text-rose-500' : theme === 'dark' ? 'text-white/20' : 'text-slate-300'} group-focus-within:text-rose-500 transition-colors`} />
            </div>
            
            <input
              type="text"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if(error) setError(null);
                setClipboardError(false);
              }}
              placeholder={lang === 'en' ? 'ENTER_ACCESS_KEY' : 'رمز الدخول'}
              className={`w-full backdrop-blur-xl border rounded-[2rem] py-7 px-16 text-center text-xl tracking-[0.25em] font-orbitron transition-all 
                ${theme === 'dark' 
                  ? 'bg-black/60 border-white/10 text-white placeholder:text-white/5' 
                  : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 shadow-xl'} 
                focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.04]`}
              autoFocus
            />

            {/* Auto Paste Icon with Enhanced Feedback */}
            <button
              type="button"
              onClick={handleAutoPaste}
              className={`absolute inset-y-0 ${lang === 'ar' ? 'left-0 pl-6' : 'right-0 pr-6'} flex items-center text-rose-500 hover:text-rose-400 transition-all active:scale-90`}
              title={lang === 'ar' ? 'لصق من الحافظة' : 'Paste from Clipboard'}
            >
              <ClipboardPaste size={22} className="drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
            </button>
          </div>

          {/* Clipboard Permissions Fallback Message */}
          {clipboardError && (
            <div className="flex items-center justify-center gap-2 text-rose-400 text-[10px] font-bold animate-[fadeIn_0.3s_ease-out] bg-rose-500/10 py-2 rounded-xl">
              <Info size={12} />
              <span>{lang === 'ar' ? 'يرجى كتابة الرمز يدوياً (المتصفح حظر اللصق)' : 'Please type key manually (Browser blocked access)'}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center gap-2 text-rose-500 text-[11px] font-black animate-[fadeIn_0.2s_ease-out] uppercase tracking-wider">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className="relative pt-2">
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className={`w-full group relative overflow-hidden py-6 rounded-[2rem] text-white font-black text-xs tracking-[0.3em] font-orbitron shadow-[0_20px_50px_rgba(225,29,72,0.5)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none
                ${loading ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-500'}`}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
              <div className="flex items-center justify-center gap-3">
                {lang === 'en' ? 'ACTIVATE_SYSTEM' : 'تفعيل النظام'} <ChevronRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
              </div>
            </button>
          </div>
        </form>

        <div className="w-full mt-10 relative group/key animate-[fadeIn_1.4s_ease-out]">
           <div className={`flex items-center justify-between p-4 border rounded-[1.5rem] transition-all
              ${theme === 'dark' ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-md'}`}>
              <div className="flex flex-col">
                 <span className={`text-[8px] uppercase font-black tracking-widest mb-1.5 ${lang === 'ar' ? 'font-arabic tracking-normal' : ''} ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>
                    {lang === 'ar' ? 'رمز التفعيل الافتراضي' : 'GLOBAL_ENCRYPTED_KEY'}
                 </span>
                 <code className="text-[11px] text-rose-500/80 font-mono tracking-wider blur-[3.5px] group-hover/key:blur-none transition-all duration-500 select-none">
                    {ACCESS_KEY}
                 </code>
              </div>
              <button 
                type="button"
                onClick={handleCopy}
                className="w-12 h-12 bg-rose-500/5 hover:bg-rose-500/20 rounded-2xl text-rose-500/40 hover:text-rose-500 transition-all flex items-center justify-center border border-rose-500/10"
              >
                 {copied ? <CheckCircle2 size={20} className="text-emerald-500 animate-bounce" /> : <Copy size={18} />}
              </button>
           </div>
        </div>
      </div>

      <div className="pb-12 pt-4 flex flex-col items-center gap-5 relative z-30">
        <div className={`flex items-center gap-3 py-3 px-6 border rounded-full shadow-xl backdrop-blur-md
          ${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${lang === 'ar' ? 'font-arabic tracking-normal' : ''} ${theme === 'dark' ? 'text-white/30' : 'text-slate-500'}`}>
            {lang === 'en' ? 'SECURE_CLOUD_ACTIVE' : 'الاتصال السحابي مؤمن'}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
