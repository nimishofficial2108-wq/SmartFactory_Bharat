import React, { useEffect, useState } from 'react';
import { ChakraMotif } from './ChakraMotif';

interface NamastePreloaderProps {
  onComplete?: () => void;
}

export const NamastePreloader: React.FC<NamastePreloaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'namaste' | 'sync' | 'fadeout'>('namaste');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase('sync');
    }, 850);

    const t2 = setTimeout(() => {
      setPhase('fadeout');
    }, 1500);

    const t3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1850);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-100 transition-opacity duration-500 ${
        phase === 'fadeout' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle industrial background grid & soft saffron-green ambient glows */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
        {/* Animated Folded Hands / Namaste Symbol */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl shadow-amber-500/5 relative overflow-hidden">
            {/* Tri-color subtle top edge */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-500" />
            
            {/* Folded Hands Namaste Vector */}
            <svg
              className="w-10 h-10 text-amber-400 animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Stylized graceful Namaste folded palms */}
              <path d="M12 3v18" strokeOpacity="0.2" />
              <path d="M8.5 7.5c.8-1.2 2-2 3.5-2s2.7.8 3.5 2l1.5 5.5c.3 1.1 0 2.2-.8 3-1.2 1.2-2.7 2-4.2 2s-3-.8-4.2-2c-.8-.8-1.1-1.9-.8-3l1.5-5.5z" />
              <path d="M10 11.5l2-1.5 2 1.5" />
            </svg>
          </div>

          {/* Chakra small rotating ring */}
          <div className="absolute -bottom-2 -right-2">
            <ChakraMotif size={24} className="text-blue-500/80" animate={true} />
          </div>
        </div>

        {/* Text transition */}
        <div className="h-16 flex flex-col items-center justify-center">
          {phase === 'namaste' && (
            <div className="animate-fade-in flex flex-col items-center">
              <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>नमस्ते</span>
                <span className="text-amber-500 text-sm font-medium tracking-widest uppercase">
                  · Namaste
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-mono-num">
                SmartFactory Bharat IoT Platform
              </p>
            </div>
          )}

          {(phase === 'sync' || phase === 'fadeout') && (
            <div className="flex flex-col items-center animate-fade-in">
              <span className="text-sm font-medium text-slate-200">
                Connecting Non-Invasive Retrofit Sensors...
              </span>
              <span className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5 font-mono-num">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                4 Boxes Online · Wi-Fi Telemetry Synced
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar with Tri-color Accent */}
        <div className="w-56 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-white to-emerald-500 transition-all duration-1000 ease-out"
            style={{
              width: phase === 'namaste' ? '45%' : phase === 'sync' ? '92%' : '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
};
