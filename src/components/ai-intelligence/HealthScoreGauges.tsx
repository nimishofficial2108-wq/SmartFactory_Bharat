import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  HeartPulse,
  Zap,
  Activity,
  Thermometer,
  Volume2,
  Clock,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
} from 'lucide-react';

export const HealthScoreGauges: React.FC = () => {
  const { health, pipeline, scenario } = useAIIntelligence();

  const isCritical = health.total < 70;
  const isWarning = health.total < 85 && !isCritical;

  const getSubScoreColor = (val: number) => {
    if (val >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (val >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* 1. Large Composite Health Score Gauge */}
      <div className="lg:col-span-2 p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Machine Health & Multi-Physics Prognostics
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Weighted composite from electrical, mechanical, thermal and acoustic harmonics
            </p>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider font-mono border ${
              isCritical
                ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                : isWarning
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {isCritical ? 'Action Required' : isWarning ? 'Degrading' : 'Optimal'}
          </span>
        </div>

        {/* Big Radial Progress Center & 4 Sub-Physics Pillars */}
        <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Big Gauge */}
          <div className="flex flex-col items-center justify-center sm:border-r border-slate-100 dark:border-slate-800 pr-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Circular SVG Ring */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="58"
                  stroke={isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * health.total) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold font-mono-num text-slate-900 dark:text-white leading-none">
                  {health.total}
                </span>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">/ 100</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
                  Health Index
                </span>
              </div>
            </div>
          </div>

          {/* 4 Sub-Health Bars */}
          <div className="sm:col-span-2 space-y-2.5">
            {/* Electrical Health */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono-num">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Electrical Health (Current / Harmonics)
                </span>
                <strong className="text-slate-900 dark:text-white">{health.electrical}%</strong>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${health.electrical}%` }}
                />
              </div>
            </div>

            {/* Mechanical Health */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono-num">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                  Mechanical Health (Vibration / Misalignment)
                </span>
                <strong className="text-slate-900 dark:text-white">{health.mechanical}%</strong>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${health.mechanical}%` }}
                />
              </div>
            </div>

            {/* Thermal Health */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono-num">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Thermometer className="w-3.5 h-3.5 text-red-500" />
                  Thermal Health (Dissipation / Contact vs IR)
                </span>
                <strong className="text-slate-900 dark:text-white">{health.thermal}%</strong>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${health.thermal}%` }}
                />
              </div>
            </div>

            {/* Acoustic Health */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono-num">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Volume2 className="w-3.5 h-3.5 text-purple-500" />
                  Acoustic Health (Sound Spectrum / Cavitation)
                </span>
                <strong className="text-slate-900 dark:text-white">{health.acoustic}%</strong>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-300"
                  style={{ width: `${health.acoustic}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono-num">
          <span>Continuous Sensor Correlation Model</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">Confidence: {pipeline.decision.confidencePct}%</span>
        </div>
      </div>

      {/* 2. Predictive Maintenance Card (Part 14) */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-all">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Predictive Maintenance</span>
            </h3>
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                pipeline.decision.riskLevel === 'High'
                  ? 'bg-red-50 text-red-700'
                  : pipeline.decision.riskLevel === 'Medium'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              Risk: {pipeline.decision.riskLevel}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Failure Mode Probability</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {scenario === 'bearing_degradation'
                    ? 'Bearing Fatigue Risk'
                    : scenario === 'machine_overload'
                    ? 'Winding Overheat Risk'
                    : scenario === 'misalignment'
                    ? 'Shaft Coupling Shearing'
                    : 'Unscheduled Downtime Risk'}
                </span>
                <span className="text-xl font-bold font-mono-num text-amber-600 dark:text-amber-400">
                  {scenario === 'normal' ? '12%' : '68%'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">Suggested Inspection Window</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white block mt-0.5">
                {pipeline.decision.suggestedInspectionWindow}
              </span>
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Based on machine duty cycle & vibration trend slope
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/40 text-[10px] text-amber-800 dark:text-amber-300 leading-tight flex items-start gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
          <span>AI-based prediction model — physical technician verification required prior to component overhaul.</span>
        </div>
      </div>
    </div>
  );
};
