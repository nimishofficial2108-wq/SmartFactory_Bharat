import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  BrainCircuit,
  Wrench,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Leaf,
  CheckCircle2,
  Clock,
  IndianRupee,
} from 'lucide-react';

interface CarbonAwareMaintenanceBannerProps {
  onServiceAction?: () => void;
}

export const CarbonAwareMaintenanceBanner: React.FC<CarbonAwareMaintenanceBannerProps> = ({
  onServiceAction,
}) => {
  const { scenario, setScenario, carbonPredictiveNotice, selectedProfile } = useAIIntelligence();

  const isDegradation = scenario === 'bearing_degradation';

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-white via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Leaf className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Carbon-Aware Predictive Maintenance Intelligence
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold">
              ESG + Reliability Fusion
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Beyond standard breakdown warnings: quantifies avoidable kilowatt hours, rupee losses, and excess tCO₂ footprint
          </p>
        </div>

        {/* Interactive Scenario Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Test Scenario:</span>
          <button
            onClick={() => setScenario(isDegradation ? 'normal' : 'bearing_degradation')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              isDegradation
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {isDegradation ? '● Bearing Degradation Active' : 'Simulate Bearing Degradation'}
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison: Traditional vs Carbon-Aware */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Traditional Predictive Maintenance */}
        <div className="p-4 md:p-5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span className="flex items-center gap-1.5 uppercase font-bold text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                Conventional Predictive Maintenance
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Threshold Only
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">
                Standard Alert:
              </span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 italic">
                “{carbonPredictiveNotice.normalNotice}”
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug">
            Misses financial urgency: Plant managers delay servicing because the machine still appears to run without immediate stoppage.
          </p>
        </div>

        {/* Right: SmartFactory Carbon-Aware Prognostic */}
        <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/70 dark:from-slate-800/80 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-500/40 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-mono mb-2 font-bold">
              <span className="flex items-center gap-1.5 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                SmartFactory Carbon-Aware Intelligence
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                Energy + Carbon Multi-Physics
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-500/30 space-y-1 shadow-2xs">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold block uppercase">
                Quantified ESG & Rupee Notice:
              </span>
              <p className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                “{carbonPredictiveNotice.carbonNotice}”
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono-num">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 block uppercase">Extra Energy</span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                +{carbonPredictiveNotice.extraEnergyPct}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 block uppercase">Avoidable Cost</span>
              <span className="text-sm font-bold text-red-600 dark:text-red-400">
                ₹{carbonPredictiveNotice.extraCostYearINR.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 block uppercase">Avoidable CO₂</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {carbonPredictiveNotice.extraCo2TonsYear} tCO₂
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Action Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{carbonPredictiveNotice.action}</span>
        </div>

        <button
          onClick={() => {
            setScenario('normal');
            if (onServiceAction) onServiceAction();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
        >
          <span>Acknowledge & Eliminate 1.3 tCO₂</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
