import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  AlertTriangle,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Clock,
  IndianRupee,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

export const ProactiveAlertBanner: React.FC = () => {
  const {
    activeThresholdBreaches,
    dismissBreachAlert,
    setIsThresholdModalOpen,
    setScenario,
  } = useAIIntelligence();

  if (!activeThresholdBreaches || activeThresholdBreaches.length === 0) return null;

  return (
    <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-300">
      {activeThresholdBreaches.map((breach) => {
        const isCritical = breach.severity === 'critical';

        return (
          <div
            key={breach.id}
            className={`p-4 rounded-3xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              isCritical
                ? 'bg-gradient-to-r from-red-500/15 via-red-500/5 to-transparent border-red-300 dark:border-red-500/40 text-red-950 dark:text-red-200'
                : 'bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200'
            }`}
          >
            {/* Left Content */}
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                  isCritical ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      isCritical ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                    }`}
                  >
                    Proactive AI Alert: {breach.severity.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {breach.machineName} · {breach.metricLabel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Observed: <strong>{breach.observedValue} {breach.unit}</strong> (Limit: {breach.thresholdValue} {breach.unit})
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {breach.proactiveRecommendation}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>Urgency: {breach.urgencyWindow}</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <IndianRupee className="w-3 h-3" />
                    <span>Avoidable Risk: ₹{breach.estimatedCostImpactINR.toLocaleString('en-IN')}</span>
                  </span>
                  <span>Sensor: {breach.sensorModel}</span>
                </div>
              </div>
            </div>

            {/* Right Buttons */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0">
              <button
                onClick={() => setIsThresholdModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-2xs transition-all"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Adjust Threshold</span>
              </button>

              <button
                onClick={() => {
                  dismissBreachAlert(breach.id);
                  setScenario('normal');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Acknowledge</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
