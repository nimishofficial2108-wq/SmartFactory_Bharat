import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Radio,
} from 'lucide-react';

export const MachineEventTimeline: React.FC = () => {
  const { timelineEvents } = useAIIntelligence();

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Machine Event & Anomaly Timeline</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time chronological telemetry event stream with AI inference triggers
          </p>
        </div>

        <span className="text-[10px] font-mono-num text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
          {timelineEvents.length} Events
        </span>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {timelineEvents.map((ev) => {
          return (
            <div
              key={ev.id}
              className="p-3 rounded-2xl bg-[#fcfcfd] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  ev.severity === 'alert'
                    ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
                    : ev.severity === 'warning'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'
                    : ev.severity === 'success'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {ev.severity === 'alert' || ev.severity === 'warning' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : ev.severity === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Info className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {ev.title}
                  </h4>
                  <span className="text-[10px] font-mono-num text-slate-400 shrink-0">
                    {ev.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {ev.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
