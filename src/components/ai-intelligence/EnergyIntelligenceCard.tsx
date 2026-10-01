import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  Zap,
  TrendingDown,
  IndianRupee,
  Clock,
  Sparkles,
  PieChart,
} from 'lucide-react';

export const EnergyIntelligenceCard: React.FC = () => {
  const { energy, selectedProfile, scenario } = useAIIntelligence();

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Energy Intelligence & Idle Run Losses
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time power analysis detecting unloaded spinning losses and monthly rupee savings
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 text-xs font-semibold">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Active Idle Energy Curbs</span>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* 1. Current Operating Power */}
        <div className="p-3.5 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Operating Power</span>
          <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
            {energy.operatingKW}
            <span className="text-xs text-amber-600 ml-1 font-normal">kW</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">From SCT-013 CT clamp</span>
        </div>

        {/* 2. Idle Consumption */}
        <div className="p-3.5 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Idle Consumption</span>
          <div className="text-2xl font-bold font-mono-num text-amber-700 dark:text-amber-400 mt-1">
            {energy.idleKW}
            <span className="text-xs text-slate-400 ml-1 font-normal">kW</span>
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium">
            {energy.detectedIdleMinutes} min idle detected
          </span>
        </div>

        {/* 3. Wasted Energy Today */}
        <div className="p-3.5 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Potential Saving</span>
          <div className="text-2xl font-bold font-mono-num text-emerald-600 dark:text-emerald-400 mt-1">
            {energy.potentialKWhSaving}
            <span className="text-xs text-slate-400 ml-1 font-normal">kWh / day</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Via auto-standby</span>
        </div>

        {/* 4. Monthly Rupee Cost Impact */}
        <div className="p-3.5 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Est. Monthly Saving</span>
          <div className="text-2xl font-bold font-mono-num text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{energy.estimatedMonthlySavingINR.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">₹{energy.estimatedDailySavingINR}/day</span>
        </div>
      </div>
    </div>
  );
};
