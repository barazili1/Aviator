
import React, { useState, useEffect, useRef } from 'react';
import { PlaneIcon } from './PlaneIcon';

interface SignalCircleProps {
  multiplier: number;
  loading: boolean;
  labels: {
    calculating: string;
  };
  lang: string;
  theme?: 'dark' | 'light';
}

interface OrbitalParticle {
  id: number;
  delay: string;
  duration: string;
  size: string;
  opacity: number;
}

export const SignalCircle: React.FC<SignalCircleProps> = ({ multiplier, loading, labels, lang, theme = 'dark' }) => {
  const [displayValue, setDisplayValue] = useState(1.00);
  const [scale, setScale] = useState(1);
  const [particles, setParticles] = useState<OrbitalParticle[]>([]);
  const [revealKey, setRevealKey] = useState(0);
  const [showImpact, setShowImpact] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const animationRef = useRef<number | null>(null);

  const ringColor = theme === 'dark' ? 'border-white/20' : 'border-slate-300';
  const labelColor = theme === 'dark' ? 'text-rose-500' : 'text-rose-600';
  const tacticalColor = theme === 'dark' ? 'text-rose-500/40' : 'text-rose-600/30';

  useEffect(() => {
    if (loading) {
      const newParticles = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        delay: `${Math.random() * -4}s`,
        duration: `${3 + Math.random() * 2}s`,
        size: '1.2px',
        opacity: theme === 'dark' ? 0.5 : 0.8
      }));
      setParticles(newParticles);
      setShowImpact(false);
      setIsSettled(false);
    } else {
      setParticles([]);
      setRevealKey(prev => prev + 1);
      setShowImpact(true);
      const timer = setTimeout(() => setShowImpact(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, theme]);

  useEffect(() => {
    if (loading) {
      setDisplayValue(1.00);
      setScale(0.8);
      setIsSettled(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const startValue = 1.00;
    const endValue = multiplier;
    const duration = 1400; 
    const startTime = performance.now();

    const easeOutBack = (x: number): number => {
      const c1 = 1.6; 
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeProgress = easeOutBack(progress);
      const currentValue = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(currentValue);

      const s = 0.85 + (progress * 0.3); 
      const overshootScale = progress > 0.6 ? 1 + Math.sin((progress - 0.6) * Math.PI / 0.4) * 0.12 : s;
      
      const finalScale = progress >= 0.99 ? 1 : overshootScale;
      setScale(finalScale);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setScale(1);
        setIsSettled(true);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [multiplier, loading]);

  return (
    <div className="relative w-72 h-72 flex items-center justify-center transition-all duration-500">
      {/* Background Rings */}
      <div className={`absolute inset-6 rounded-full border transition-all duration-1000 ${ringColor} ${loading ? 'scale-95 rotate-45' : 'scale-100 rotate-0'}`}></div>
      <div className={`absolute inset-12 rounded-full border transition-all duration-1000 ${ringColor} ${loading ? 'scale-90 rotate-[-45deg]' : 'scale-100 rotate-0'}`}></div>
      
      {/* Tactical Coordinate Labels */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 flex flex-col items-center transition-opacity duration-500 ${loading ? 'opacity-100' : 'opacity-30'}`}>
        <span className={`text-[8px] font-black font-orbitron tracking-tighter ${tacticalColor}`}>NAV_LAT: 34.0522</span>
      </div>
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-8 flex flex-col items-center transition-opacity duration-500 ${loading ? 'opacity-100' : 'opacity-30'}`}>
        <span className={`text-[8px] font-black font-orbitron tracking-tighter ${tacticalColor}`}>NAV_LNG: -118.2437</span>
      </div>

      {/* Impact Glow */}
      {!loading && showImpact && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-rose-500 rounded-full blur-[60px] animate-[ping_1.5s_ease-out_infinite] opacity-60"></div>
          <div className={`w-24 h-24 rounded-full blur-[40px] animate-[pulse_0.6s_ease-out] opacity-30 ${theme === 'dark' ? 'bg-white' : 'bg-rose-400'}`}></div>
        </div>
      )}

      {loading && (
        <>
          {/* الوسط المتوهج */}
          <div className="absolute w-32 h-32 bg-rose-600/20 rounded-full blur-[40px]"></div>
          
          {/* الموجة النابضة */}
          <div className="absolute inset-0 rounded-full border-2 border-rose-600/30 animate-wave-simple pointer-events-none"></div>

          <div className="absolute inset-0 rounded-full animate-radar-classic pointer-events-none">
            {/* Sweep Gradient */}
            <div 
              className={`absolute inset-0 rounded-full ${theme === 'dark' ? 'opacity-60' : 'opacity-40'}`}
              style={{
                background: 'conic-gradient(from 270deg at 50% 50%, #e11d48 0deg, transparent 60deg)',
                transform: 'rotate(90deg)'
              }}
            ></div>

            {/* Sweep Line Shadow */}
            <div 
              className={`absolute top-0 left-1/2 -translate-x-[calc(50%-2px)] w-[4px] h-1/2 blur-[3px] ${theme === 'dark' ? 'opacity-100 bg-black' : 'opacity-50 bg-slate-400'}`}
            ></div>

            {/* Main Sweep Line */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[4px] h-1/2"
              style={{
                background: `linear-gradient(to top, transparent, #e11d48 80%, ${theme === 'dark' ? '#ffffff' : '#f43f5e'})`,
                boxShadow: '0 0 20px #e11d48, 0 0 40px #e11d48'
              }}
            ></div>

            {/* Single Plane on the Radar Sweep Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
               <div className="relative transform-style-3d rotate-90 scale-75">
                 <PlaneIcon className="w-8 h-8 text-rose-500 drop-shadow-[0_0_25px_rgba(225,29,72,1)]" thrum={true} />
               </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            {particles.map((p) => (
              <div
                key={p.id}
                className="absolute bg-rose-500 rounded-full animate-orbital"
                style={{
                  width: p.size,
                  height: p.size,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                  opacity: p.opacity
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Main Container Border */}
      <div className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
        loading 
          ? 'border-rose-600/40 scale-105 shadow-[0_0_40px_rgba(225,29,72,0.2)]' 
          : `${theme === 'dark' ? 'border-white/30' : 'border-slate-300'} scale-100`
      }`}></div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <div 
          key={revealKey}
          style={{ transform: `scale(${scale})` }}
          className={`font-orbitron text-6xl font-black transition-all duration-300 tracking-tighter leading-none select-none min-h-[60px] flex items-center justify-center ${
            loading 
              ? 'opacity-0 scale-75 blur-md' 
              : 'animate-number-reveal'
          }`}
        >
          {!loading && (
            <div className={`${isSettled ? 'animate-multiplier-pulse' : ''} inline-block relative`}>
              <span className={`absolute inset-0 blur-[5px] translate-y-1.5 translate-x-1 select-none pointer-events-none opacity-50 ${theme === 'dark' ? 'text-rose-600' : 'text-rose-300'}`} aria-hidden="true">
                {displayValue.toFixed(2)}
              </span>
              <span className={`relative z-10 inline-flex items-baseline drop-shadow-[0_0_20px_rgba(225,29,72,0.9)] transition-colors ${theme === 'dark' ? 'text-white' : 'text-rose-600'}`}>
                <span className={theme === 'dark' ? 'text-rose-500' : 'text-rose-600'}>{displayValue.toFixed(2)}</span>
                <span className={`text-2xl ml-1 font-bold ${theme === 'dark' ? 'opacity-80 text-white/60' : 'text-slate-400'}`}>x</span>
              </span>
            </div>
          )}
        </div>
        
        {loading && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className={`text-[11px] tracking-[0.4em] font-black animate-pulse uppercase ${labelColor} ${lang === 'ar' ? 'font-arabic' : 'font-orbitron'}`}>
              {labels.calculating}
            </div>
            <div className={`w-24 h-[4px] rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/20' : 'bg-slate-200'}`}>
               <div className="h-full bg-rose-600 animate-[shimmer_2s_infinite] w-full opacity-100 shadow-[0_0_20px_#e11d48]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Crosshair Elements */}
      {/* Top Crosshair */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ${loading ? 'h-14 translate-y-[-10px]' : 'h-8 translate-y-0'}`}>
        <div className={`w-[2px] flex-1 bg-gradient-to-t from-rose-600 to-transparent shadow-[0_0_10px_#e11d48]`}></div>
        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_15px_#e11d48] mt-[-4px]"></div>
      </div>

      {/* Bottom Crosshair */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ${loading ? 'h-14 translate-y-[10px]' : 'h-8 translate-y-0'}`}>
        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_15px_#e11d48] mb-[-4px]"></div>
        <div className={`w-[2px] flex-1 bg-gradient-to-b from-rose-600 to-transparent shadow-[0_0_10px_#e11d48]`}></div>
      </div>

      {/* Left Crosshair */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-700 ${loading ? 'w-14 translate-x-[-10px]' : 'w-8 translate-x-0'}`}>
        <div className={`h-[2px] flex-1 bg-gradient-to-l from-rose-600 to-transparent shadow-[0_0_10px_#e11d48]`}></div>
        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_15px_#e11d48] ml-[-4px]"></div>
      </div>

      {/* Right Crosshair */}
      <div className={`absolute right-0 top-1/2 -translate-y-1/2 flex items-center transition-all duration-700 ${loading ? 'w-14 translate-x-[10px]' : 'w-8 translate-x-0'}`}>
        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_15px_#e11d48] mr-[-4px]"></div>
        <div className={`h-[2px] flex-1 bg-gradient-to-r from-rose-600 to-transparent shadow-[0_0_10px_#e11d48]`}></div>
      </div>

      <style>{`
        @keyframes reticle-lock {
          0% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
