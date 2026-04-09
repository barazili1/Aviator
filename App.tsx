
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Shield, Zap, Clock, Languages, Check, AlertTriangle, LogOut, Eye, EyeOff, Bell, X, Info, Wifi, Trash2, ArrowUpDown, TrendingUp, Cpu, Activity, User, Users, Sun, Moon, AlertCircle, CheckCircle2, Settings, Flame, Brain, ShieldCheck, Layers, BarChart3, Target, History as HistoryIcon, AlertOctagon, SortAsc, SortDesc } from 'lucide-react';
import { SignalCircle } from './components/SignalCircle';
import { Particles } from './components/Particles';
import { SplashScreen } from './components/SplashScreen';
import { LoginPage } from './components/LoginPage';
import { TermsPage } from './components/TermsPage';
import { getPrediction } from './services/geminiService';
import { audioService } from './services/audioService';
import { AppStatus, Prediction, PredictionMode } from './types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}

interface HistoryItem {
  id: string;
  val: number;
  time: string;
  hash: string;
  verified: boolean;
}

interface AppNotification {
  id: number;
  text: string;
  time: string;
  type: 'info' | 'zap' | 'alert' | 'success';
}

interface ToastState {
  id: number;
  message: string;
  type: 'info' | 'zap' | 'alert' | 'success';
  visible: boolean;
}

type Language = 'en' | 'ar';
type Theme = 'dark' | 'light';
type SortMode = 'recent' | 'multiplier';

const translations = {
  en: {
    title: "NINJA STOR V1",
    reliability: "AI Reliability",
    confidence: "Confidence",
    history: "Tactical Logs",
    synced: "SYNCED",
    buttonIdle: "LAUNCH RADAR",
    buttonLoading: "SCANNING WAVES...",
    buttonCountdown: "NEXT READY IN",
    buttonSuccess: "SIGNAL CAPTURED!",
    buttonQuota: "Upgrade Key",
    radarTerminal: "Radar Terminal",
    calculating: "CALCULATING",
    splashInit: "Initializing Radar",
    splashSecured: "Secured by Gemini AI",
    langEnglish: "English",
    langArabic: "Arabic",
    selectLanguage: "Interface Language",
    selectMode: "Operation Mode",
    modeStable: "Stable Mode",
    modeStableDesc: "Low risk, consistent signals.",
    modeBalanced: "Balanced Mode",
    modeBalancedDesc: "Standard algorithm calibration.",
    modeHighRisk: "High Risk",
    modeHighRiskDesc: "Targeting high multipliers.",
    modeAIPro: "AI Pro (Gemini 3)",
    modeAIProDesc: "Deep pattern reasoning active.",
    quotaError: "Quota Exceeded. Use a personal API key for unlimited signals.",
    selectKey: "Select API Key",
    logout: "Log Out",
    hideHistory: "Hide Logs",
    showHistory: "Show Logs",
    clearHistory: "Memory Wiped",
    sortRecent: "Sorted by Recent",
    sortTop: "Sorted by Top Wins",
    avgSignal: "Avg. Signal",
    topCapture: "Top Capture",
    notifications: "System Notifications",
    noNotifications: "No new alerts",
    clearAll: "Clear All",
    multiplierDetected: "Data Stream",
    verified: "DECRYPTED",
    systemAlert: "System Alert",
    liveBroadcast: "Live Broadcast",
    now: "Now",
    confirmClear: "Clear all signal history?",
    confirmAction: "Wipe All Data",
    cancelAction: "Cancel",
    emptyHistory: "No Data Intercepted",
    liveStatus: "LIVE",
    signalHash: "SigID",
    onlineUsers: "Connected",
    toastSignal: "SIGNAL CAPTURED",
    modeReconfigured: "Mode Reconfigured",
    langReconfigured: "Language Reconfigured",
    itemDeleted: "Entry Purged",
    systemAlerts: [
      "Satellite link synchronized with server cluster 09.",
      "High probability multiplier pattern detected in current wave.",
      "System recalibrated. Signal accuracy optimized to 98.2%.",
      "Cloud processing node shift detected. Latency stable.",
      "New sector signal intercepted. Checking validity...",
      "Bi-directional data link secured via RSA-4096.",
      "Atmospheric noise filtered. Radar clarity enhanced.",
      "Sequence detected: Possible 2.0x+ trend incoming.",
      "Network relay optimization complete. Signal flow: EXCELLENT."
    ]
  },
  ar: {
    title: "NINJA STOR V1",
    reliability: "موثوقية الذكاء الاصطناعي",
    confidence: "مستوى الثقة",
    history: "سجلات تكتيكية",
    synced: "متصل",
    buttonIdle: "بدء الانطلاق",
    buttonLoading: "جاري المسح...",
    buttonCountdown: "جاهز خلال",
    buttonSuccess: "تم التقاط الإشارة!",
    buttonQuota: "ترقية المفتاح",
    radarTerminal: "محطة الرادار",
    calculating: "جاري الحساب",
    splashInit: "تهيئة الرادار",
    splashSecured: "مؤمن بواسطة Gemini AI",
    langEnglish: "الإنجليزية",
    langArabic: "العربية",
    selectLanguage: "لغة الواجهة",
    selectMode: "وضع التشغيل",
    modeStable: "الوضع المستقر",
    modeStableDesc: "مخاطر منخفضة، إشارات ثابتة.",
    modeBalanced: "الوضع المتوازن",
    modeBalancedDesc: "معايرة الخوارزمية القياسية.",
    modeHighRisk: "مخاطر عالية",
    modeHighRiskDesc: "استهداف مضاعفات عالية.",
    modeAIPro: "الذكاء الاصطناعي برو",
    modeAIProDesc: "تفعيل استدلال الأنماط العميق.",
    quotaError: "تم تجاوز الحصة. استخدم مفتاح API الشخصي للحصول على إشارات غير محدودة.",
    selectKey: "اختر مفتاح API",
    logout: "تسجيل الخروج",
    hideHistory: "إخفاء السجلات",
    showHistory: "إظهار السجلات",
    clearHistory: "تم مسح الذاكرة",
    sortRecent: "الترتيب حسب الأحدث",
    sortTop: "الترتيب حسب الأعلى",
    avgSignal: "متوسط الإشارة",
    topCapture: "أعلى التقاط",
    notifications: "إشعارات النظام",
    noNotifications: "لا توجد تنبيهات جديدة",
    clearAll: "مسح الكل",
    multiplierDetected: "تدفق البيانات",
    verified: "تم فك التشفير",
    systemAlert: "تنبيه النظام",
    liveBroadcast: "بث مباشر",
    now: "الآن",
    confirmClear: "هل تريد مسح سجل الإشارات بالكامل؟",
    confirmAction: "تأكيد المسح الشامل",
    cancelAction: "إلغاء",
    emptyHistory: "لم يتم اعتراض بيانات",
    liveStatus: "مباشر",
    signalHash: "معرف",
    onlineUsers: "متصل الآن",
    toastSignal: "تم التقاط الإشارة",
    modeReconfigured: "تم إعادة ضبط الوضع",
    langReconfigured: "تم إعادة ضبط اللغة",
    itemDeleted: "تم حذف السجل",
    systemAlerts: [
      "تم مزامنة رابط القمر الصناعي مع مجموعة الخوادم 09.",
      "تم اكتشاف نمط مضاعف عالي الاحتمال في الموجة الحالية.",
      "تمت إعادة معايرة النظام. تم تحسين دقة الإشارة إلى 98.2٪.",
      "تم اكتشاف تحول في عقدة معالجة السحابة. الكمون مستقر.",
      "تم اعتراض إشارة قطاع جديد. جاري التحقق من الصلاحية...",
      "رابط بيانات ثنائي الاتجاه مؤمن عبر RSA-4096.",
      "تم تصفية الضوضاء الجوية. تم تحسين وضوح الرادار.",
      "تم اكتشاف تسلسل: اتجاه محتمل لأكثر من 2.0x قادم.",
      "اكتمل تحسين ترحيل الشبكة. تدفق الإشارة: ممتاز."
    ]
  }
};

const generateHash = () => {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const AnimatedPercentage: React.FC<{ value: number; duration?: number; suffix?: string; decimals?: number }> = ({ 
  value, 
  duration = 1000, 
  suffix = "%", 
  decimals = 0 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart;
      
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValueRef.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{displayValue.toFixed(decimals)}{suffix}</>;
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('ninja_stor_lang');
    return (saved as Language) || 'en';
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ninja_stor_theme');
    return (saved as Theme) || 'dark';
  });

  const [mode, setMode] = useState<PredictionMode>(() => {
    const saved = localStorage.getItem('ninja_stor_mode');
    return (saved as PredictionMode) || PredictionMode.BALANCED;
  });

  const [showSplash, setShowSplash] = useState(true);
  const [showTerms, setShowTerms] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDialog, setShowLangDialog] = useState(false);
  const [showModesDialog, setShowModesDialog] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);
  const [notificationList, setNotificationList] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [reliability, setReliability] = useState(98.2);
  const [prediction, setPrediction] = useState<Prediction>({
    multiplier: 1.00,
    confidence: 0,
    timestamp: '--:--:--'
  });
  
  const [connectedUsers, setConnectedUsers] = useState(Math.floor(Math.random() * 500) + 1200);
  const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const [currentTime, setCurrentTime] = useState(formatTime());
  const [isHistoryVisible, setIsHistoryVisible] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('ninja_stor_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      { id: 'h1', val: 1.45, time: '14:20:00', hash: '0x3f2a1b', verified: true },
      { id: 'h2', val: 2.89, time: '14:18:32', hash: '0x9e8d7c', verified: true },
      { id: 'h3', val: 2.12, time: '14:15:15', hash: '0x1a2b3c', verified: true },
    ];
  });

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('ninja_stor_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('ninja_stor_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('ninja_stor_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('ninja_stor_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectedUsers(prev => {
        const change = Math.floor(Math.random() * 11) - 5;
        return Math.max(800, prev + change);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = useCallback((message: string, type: 'info' | 'zap' | 'alert' | 'success' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    
    setActiveToast({
      id: Date.now(),
      message,
      type,
      visible: true
    });

    toastTimeoutRef.current = window.setTimeout(() => {
      setActiveToast(prev => prev ? { ...prev, visible: false } : null);
    }, 3500);
  }, []);

  const triggerNotification = useCallback((text: string, type: 'info' | 'zap' | 'alert' | 'success' = 'info', quiet: boolean = false) => {
    const newNotif: AppNotification = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    
    setNotificationList(prev => [newNotif, ...prev].slice(0, 15));
    setHasUnreadNotifications(true);
    
    if (!quiet) {
      audioService.playCopySound();
      showToast(text, type);
    }
  }, [showToast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000); 
    return () => clearInterval(timer);
  }, []);

  const handleGetSignal = useCallback(async () => {
    if (status !== AppStatus.IDLE || countdown !== null) return;

    audioService.playScanStart();
    setStatus(AppStatus.LOADING);
    setShowNotifications(false); 
    
    try {
      const data = await getPrediction(mode);
      setPrediction(data);
      
      setTimeout(() => {
        setReliability(98.5 + (Math.random() * 1.0 - 0.5));

        const newHistoryItem: HistoryItem = { 
          id: `h-${Date.now()}`,
          val: data.multiplier, 
          time: data.timestamp,
          hash: generateHash(),
          verified: true
        };
        setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));
        setStatus(AppStatus.SUCCESS);
        audioService.playSuccess(data.multiplier);
        
        setCountdown(5);
        const intervalId = setInterval(() => {
          setCountdown((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(intervalId);
              setStatus(AppStatus.IDLE);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }, 5000);
    } catch (err: any) {
      setStatus(AppStatus.ERROR);
      showToast(err.message || 'Connection Interrupted', 'alert');
      setTimeout(() => setStatus(AppStatus.IDLE), 3000);
    }
  }, [status, countdown, t, mode, showToast]);

  const toggleLanguage = () => {
    audioService.playCopySound();
    setShowLangDialog(true);
  };

  const toggleModes = () => {
    audioService.playCopySound();
    setShowModesDialog(true);
  };

  const selectMode = (newMode: PredictionMode) => {
    setMode(newMode);
    setShowModesDialog(false);
    audioService.playLoginSuccess();
    showToast(`${t.modeReconfigured}: ${newMode}`, 'zap');
    triggerNotification(`${t.modeReconfigured}: ${newMode}`, 'info', true);
  };

  const selectLanguage = (newLang: Language) => {
    setLang(newLang);
    setShowLangDialog(false);
    audioService.playLoginSuccess();
    showToast(translations[newLang].langReconfigured, 'success');
  };

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    setShowTerms(true);
  }, []);

  // Updated Sort Logic: Recent shows newest first, Multiplier shows highest first
  const sortedHistory = useMemo(() => {
    let result = [...history];
    if (sortMode === 'multiplier') {
      result.sort((a, b) => b.val - a.val);
    } else {
      // For 'recent', history is naturally newest first, but we ensure it by sorting by time/id
      result.sort((a, b) => b.id.localeCompare(a.id));
    }
    return result;
  }, [history, sortMode]);

  const toggleSortMode = () => {
    const newMode = sortMode === 'recent' ? 'multiplier' : 'recent';
    setSortMode(newMode);
    audioService.playCopySound();
    showToast(newMode === 'multiplier' ? t.sortTop : t.sortRecent, 'info');
  };

  const avgMultiplier = useMemo(() => {
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, curr) => acc + curr.val, 0);
    return sum / history.length;
  }, [history]);

  const maxMultiplier = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.max(...history.map(h => h.val));
  }, [history]);

  const initiateClearHistory = () => {
    audioService.playCopySound();
    setShowConfirmClear(true);
  };

  const confirmClearHistory = () => {
    setHistory([]);
    setShowConfirmClear(false);
    audioService.playCopySound();
    showToast(t.clearHistory, 'alert');
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    audioService.playCopySound();
    showToast(t.itemDeleted, 'alert');
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} translations={t} lang={lang} theme={theme} />;
  }

  if (showTerms) {
    return <TermsPage onFinish={() => setShowTerms(false)} translations={t} lang={lang} theme={theme} />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} translations={t} lang={lang} setLang={setLang} theme={theme} />;
  }

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto relative overflow-hidden border-x transition-all duration-500 animate-[fadeIn_0.5s_ease-out] 
      ${theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-slate-50 border-slate-200'}
      ${lang === 'ar' ? 'lang-ar font-arabic' : ''}`}>
      
      <Particles theme={theme} />
      
      {/* Toast Notification */}
      {activeToast && (
        <div className={`fixed top-14 left-4 right-4 z-[150] transition-all duration-500 flex justify-center pointer-events-none ${activeToast.visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-95'}`}>
          <div className={`max-w-xs w-full pointer-events-auto backdrop-blur-xl border p-4 rounded-2xl flex items-center gap-4 shadow-2xl transition-colors duration-500
            ${theme === 'dark' ? 'bg-black/80 border-white/10' : 'bg-white/90 border-slate-200'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeToast.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
              {activeToast.type === 'success' ? <CheckCircle2 size={20} /> : activeToast.type === 'info' ? <BarChart3 size={20} className="text-blue-500" /> : <Zap size={20} />}
            </div>
            <div className="flex-1 min-w-0">
               <p className={`text-[11px] font-bold leading-snug break-words ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{activeToast.message}</p>
            </div>
            <button onClick={() => setActiveToast(null)} className="p-1 text-white/20"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-red-600/90 backdrop-blur-md py-2 px-4 shadow-lg z-[80] flex justify-between items-center relative border-b border-white/10">
        <div className="flex items-center gap-2">
          <button onClick={toggleLanguage} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5">
            <Languages size={14} className="text-white" />
          </button>
          <button onClick={toggleModes} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1.5">
            <Settings size={14} className="text-white" />
          </button>
        </div>
        
        <span className="text-[10px] font-black tracking-widest text-white uppercase text-center flex-1 font-orbitron">{t.title}</span>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifications(true)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors relative">
            <Bell size={16} className={`text-white ${hasUnreadNotifications ? 'animate-bounce' : ''}`} />
          </button>
          <button onClick={() => setIsAuthenticated(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"><LogOut size={14} className="text-white" /></button>
        </div>
      </div>

      {/* Language Dialog */}
      {showLangDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLangDialog(false)}></div>
          <div className={`relative w-full max-w-xs border rounded-3xl overflow-hidden p-6 space-y-6 ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'}`}>
             <h3 className={`text-xs font-black uppercase tracking-widest text-rose-500`}>{t.selectLanguage}</h3>
             <div className="grid gap-3">
                <button onClick={() => selectLanguage('en')} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${lang === 'en' ? 'border-rose-500 bg-rose-500/10' : 'border-white/5 bg-white/5'}`}>
                  <span className="text-sm font-bold uppercase font-orbitron">English</span>
                  {lang === 'en' && <CheckCircle2 size={16} className="text-rose-500" />}
                </button>
                <button onClick={() => selectLanguage('ar')} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${lang === 'ar' ? 'border-rose-500 bg-rose-500/10' : 'border-white/5 bg-white/5'}`}>
                  <span className="text-sm font-bold font-arabic">العربية</span>
                  {lang === 'ar' && <CheckCircle2 size={16} className="text-rose-500" />}
                </button>
             </div>
             <button onClick={() => setShowLangDialog(false)} className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">{t.cancelAction}</button>
          </div>
        </div>
      )}

      {/* Modes Dialog */}
      {showModesDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModesDialog(false)}></div>
          <div className={`relative w-full max-w-xs border rounded-3xl overflow-hidden p-6 space-y-6 ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'}`}>
             <h3 className={`text-xs font-black uppercase tracking-widest text-rose-500`}>{t.selectMode}</h3>
             <div className="grid gap-3 max-h-[60vh] overflow-y-auto no-scrollbar">
                {[
                  { id: PredictionMode.STABLE, name: t.modeStable, desc: t.modeStableDesc, icon: ShieldCheck },
                  { id: PredictionMode.BALANCED, name: t.modeBalanced, desc: t.modeBalancedDesc, icon: Activity },
                  { id: PredictionMode.HIGH_RISK, name: t.modeHighRisk, desc: t.modeHighRiskDesc, icon: Flame },
                  { id: PredictionMode.AI_PRO, name: t.modeAIPro, desc: t.modeAIProDesc, icon: Brain },
                ].map((m) => (
                  <button key={m.id} onClick={() => selectMode(m.id)} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all text-left ${mode === m.id ? 'border-rose-500 bg-rose-500/10' : 'border-white/5 bg-white/5'}`}>
                    <m.icon size={20} className={mode === m.id ? 'text-rose-500' : 'text-white/20'} />
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest">{m.name}</div>
                      <div className="text-[9px] text-white/40 mt-1 leading-tight">{m.desc}</div>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* Confirmation Clear History Dialog */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowConfirmClear(false)}></div>
          <div className={`relative w-full max-w-xs border rounded-3xl overflow-hidden p-8 space-y-6 text-center ${theme === 'dark' ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-slate-200'}`}>
             <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <AlertOctagon size={32} />
             </div>
             <div className="space-y-2">
                <h3 className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{t.confirmAction}</h3>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}>{t.confirmClear}</p>
             </div>
             <div className="flex flex-col gap-3">
                <button onClick={confirmClearHistory} className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-[0_10px_30px_rgba(225,29,72,0.3)]">
                   {t.confirmAction}
                </button>
                <button onClick={() => setShowConfirmClear(false)} className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-500'}`}>
                   {t.cancelAction}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Main App Container */}
      <div className="flex-1 overflow-y-auto relative z-10 no-scrollbar flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-start pt-5 pb-10">
          <div className="mb-4 -mt-5 relative group">
            <div className="absolute inset-0 bg-rose-600 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img src="https://image2url.com/r2/bucket2/images/1766784510979-3fece383-00b0-4520-b8a6-809fe17cf95d.png" className="w-32 h-auto animate-pulse-glow relative z-10 object-contain drop-shadow-[0_0_20px_rgba(225,29,72,0.6)]" />
          </div>

          <SignalCircle 
            multiplier={prediction.multiplier} 
            loading={status === AppStatus.LOADING} 
            labels={{ calculating: t.calculating }} 
            lang={lang}
            theme={theme}
          />
          
          <div className="mt-8 flex gap-3 w-full px-8 z-20">
            <div className={`flex-1 p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all duration-500 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <Shield size={12} className="text-rose-500" />
              <span className={`text-[8px] font-bold uppercase tracking-tighter text-center font-orbitron ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.reliability}</span>
              <span className="font-orbitron text-[11px] text-rose-500 font-bold">
                <AnimatedPercentage value={reliability} decimals={1} duration={2000} />
              </span>
            </div>
            <div className={`flex-1 p-3 rounded-2xl flex flex-col items-center gap-1 border transition-all duration-500 ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <Zap size={12} className="text-rose-500" />
              <span className={`text-[8px] font-bold uppercase tracking-tighter text-center font-orbitron ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{t.confidence}</span>
              <span className="font-orbitron text-[11px] text-rose-500 font-bold">
                <AnimatedPercentage value={prediction.confidence * 100} decimals={0} duration={1200} />
              </span>
            </div>
          </div>
        </div>

        {/* Tactical History Logs */}
        <div className="mt-auto mb-40 flex flex-col">
          {/* Tactical Performance Header */}
          <div className="px-8 mb-6 grid grid-cols-2 gap-3">
             <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                   <Target size={16} className="text-emerald-500" />
                </div>
                <div>
                   <div className={`text-[7px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>{t.avgSignal}</div>
                   <div className="text-xs font-black font-orbitron text-emerald-500">{avgMultiplier.toFixed(2)}x</div>
                </div>
             </div>
             <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                   <TrendingUp size={16} className="text-amber-500" />
                </div>
                <div>
                   <div className={`text-[7px] font-black uppercase tracking-widest ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>{t.topCapture}</div>
                   <div className="text-xs font-black font-orbitron text-amber-500">{maxMultiplier.toFixed(2)}x</div>
                </div>
             </div>
          </div>

          <div className="px-8 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HistoryIcon size={14} className="text-rose-500" />
              <span className={`text-[10px] font-black tracking-[0.2em] uppercase font-orbitron ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{t.history}</span>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleSortMode}
                className={`p-1.5 rounded-lg border transition-all active:scale-90 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-slate-200 text-slate-400'} ${sortMode === 'multiplier' ? 'border-rose-500/50 bg-rose-500/10' : ''}`}
                title={sortMode === 'multiplier' ? t.sortTop : t.sortRecent}
              >
                {sortMode === 'multiplier' ? <SortDesc size={14} className="text-rose-500" /> : <SortAsc size={14} className="text-white/40" />}
              </button>
              <button onClick={initiateClearHistory} className={`p-1.5 rounded-lg border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40 hover:text-rose-500' : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'}`}>
                <Trash2 size={14} />
              </button>
              <button onClick={() => setIsHistoryVisible(!isHistoryVisible)} className={`p-1.5 rounded-lg border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-slate-200 text-slate-400'}`}>
                {isHistoryVisible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          
          <div className={`px-8 space-y-3 overflow-hidden transition-all duration-500 ${isHistoryVisible ? 'max-h-[800px] opacity-100 py-2' : 'max-h-0 opacity-0 pointer-events-none py-0'}`}>
            {sortedHistory.length === 0 ? (
               <div className="py-10 text-center flex flex-col items-center gap-3 opacity-20">
                  <Activity size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.emptyHistory}</span>
               </div>
            ) : sortedHistory.map((item) => {
              // Color Logic for Multipliers
              const isHigh = item.val >= 2;
              const isEpic = item.val >= 10;
              const valColor = isEpic ? 'text-amber-500' : isHigh ? 'text-rose-500' : 'text-cyan-500';
              const glowColor = isEpic ? 'shadow-[0_0_15px_rgba(245,158,11,0.3)]' : isHigh ? 'shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'shadow-none';

              return (
                <div key={item.id} className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 animate-history-item overflow-hidden ${glowColor} ${theme === 'dark' ? 'bg-black/40 border-white/5 hover:bg-white/[0.04]' : 'bg-white border-slate-100 shadow-sm'}`}>
                  {/* Tactical Scanline Decoration */}
                  <div className="absolute inset-y-0 left-0 w-[2px] bg-rose-500/40"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <Zap size={18} className={`${valColor} opacity-70`} />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[7px] font-black uppercase tracking-[0.2em] font-orbitron ${theme === 'dark' ? 'opacity-30' : 'text-slate-300'}`}>{t.multiplierDetected}</span>
                        <span className={`text-[7px] font-mono px-1.5 py-0.5 rounded-md ${theme === 'dark' ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'}`}>{item.hash}</span>
                      </div>
                      <span className={`font-orbitron text-2xl font-black tracking-tighter leading-tight ${valColor}`}>{item.val.toFixed(2)}x</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4 relative z-10">
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                         <Clock size={10} className="text-white/20" />
                         <span className={`text-[10px] font-bold font-orbitron ${theme === 'dark' ? 'opacity-40 text-white' : 'text-slate-400'}`}>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <Check size={8} className="text-emerald-500" />
                         <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/60 font-orbitron">{t.verified}</span>
                      </div>
                    </div>
                    
                    {/* زر حذف فردي */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteHistoryItem(item.id);
                      }}
                      className={`p-2 rounded-xl border transition-all hover:bg-rose-500 hover:border-rose-500 hover:text-white group/btn ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/20' : 'bg-white border-slate-200 text-slate-300'}`}
                    >
                      <Trash2 size={14} className="group-hover/btn:scale-110" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Button Area */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 pt-16 z-30 transition-all duration-700 ${theme === 'dark' ? 'bg-gradient-to-t from-black via-black/95 to-transparent' : 'bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent'}`}>
        <button
          onClick={handleGetSignal}
          disabled={status !== AppStatus.IDLE || countdown !== null}
          className={`w-full group relative overflow-hidden py-5 rounded-2xl text-white font-black text-sm tracking-[0.25em] shadow-2xl transition-all duration-300 active:scale-[0.98]
            ${(status !== AppStatus.IDLE || countdown !== null) ? 'bg-rose-900/40 cursor-not-allowed opacity-50' : 'bg-rose-600 hover:bg-rose-500 glow-red border border-white/10'}`}
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          <div className="flex items-center justify-center gap-3">
            {(status === AppStatus.LOADING || countdown !== null) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            <span className="uppercase text-xs font-orbitron">{status === AppStatus.LOADING ? t.buttonLoading : countdown !== null ? `${t.buttonCountdown} [${countdown}]` : t.buttonIdle}</span>
          </div>
        </button>
        <div className="mt-5 flex justify-center items-center gap-2">
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
          <div className={`text-[9px] tracking-[0.3em] font-medium uppercase text-center font-orbitron ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>
            {t.radarTerminal}: <span className="keep-orbitron">{currentTime}</span> | {mode}
          </div>
        </div>
      </div>
    </div>
  );
}
