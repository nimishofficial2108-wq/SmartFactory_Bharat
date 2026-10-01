import React from 'react';
import { MachineCarbonPassport } from '../../types/aiIntelligence';
import {
  Leaf,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  Factory,
  Flame,
  Award,
} from 'lucide-react';

interface MachineCarbonPassportCardProps {
  passport: MachineCarbonPassport;
  isDetailed?: boolean;
  onSelectMachine?: (profileId: string) => void;
}

export const MachineCarbonPassportCard: React.FC<MachineCarbonPassportCardProps> = ({
  passport,
  isDetailed = false,
  onSelectMachine,
}) => {
  const isHighIdleLoss = passport.idleCarbonLossPct >= 30;
  const isGradeD = passport.efficiencyGrade === 'D';

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'bg-emerald-500 text-white';
      case 'B+':
      case 'B':
        return 'bg-blue-500 text-white';
      case 'C':
        return 'bg-amber-500 text-white';
      case 'D':
      default:
        return 'bg-red-500 text-white';
    }
  };

  return (
    <div
      onClick={() => onSelectMachine && onSelectMachine(passport.profileId)}
      className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md flex flex-col justify-between ${
        passport.isHotspot
          ? 'border-amber-300 dark:border-amber-500/40 ring-1 ring-amber-400/20'
          : 'border-[#00000012] dark:border-slate-800'
      } ${onSelectMachine ? 'cursor-pointer' : ''}`}
    >
      <div>
        {/* Top Header: Passport Identifier & Efficiency Grade */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                {passport.machineId}
              </span>
              {passport.isHotspot && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  Hotspot Rank #{passport.hotspotRank}
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {passport.name}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono block">{passport.bay}</span>
          </div>

          {/* Efficiency Grade Pill */}
          <div className="flex flex-col items-end">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${getGradeColor(
                passport.efficiencyGrade
              )}`}
              title={`Carbon Efficiency Rating: Grade ${passport.efficiencyGrade}`}
            >
              {passport.efficiencyGrade}
            </div>
            <span className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">Efficiency</span>
          </div>
        </div>

        {/* 4 Carbon Metric Tiles */}
        <div className="grid grid-cols-2 gap-2.5 my-3.5">
          {/* 1. kWh Consumed Today */}
          <div className="p-2.5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-[9px] text-slate-400 font-mono uppercase block">Energy (Today)</span>
            <div className="text-base font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
              {passport.kwhConsumedToday}
              <span className="text-[10px] text-amber-600 font-normal ml-0.5">kWh</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">Continuous CT stream</span>
          </div>

          {/* 2. CO2 Emitted Today */}
          <div className="p-2.5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-[9px] text-slate-400 font-mono uppercase block">CO₂ Emitted</span>
            <div className="text-base font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
              {passport.co2EmittedKg}
              <span className="text-[10px] text-emerald-600 font-normal ml-0.5">kg CO₂</span>
            </div>
            <span className="text-[9px] text-slate-400 font-mono">@ 0.82 kg/kWh (CEA)</span>
          </div>

          {/* 3. CO2 Per Unit Produced */}
          <div className="p-2.5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
            <span className="text-[9px] text-slate-400 font-mono uppercase block">Unit Intensity</span>
            <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
              {passport.co2PerUnitProduced.value}
            </div>
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate block">
              {passport.co2PerUnitProduced.unit}
            </span>
          </div>

          {/* 4. Idle Carbon Loss */}
          <div
            className={`p-2.5 rounded-2xl border ${
              isHighIdleLoss
                ? 'bg-amber-50/80 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'
                : 'bg-[#f8fafc] dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700/60'
            }`}
          >
            <span className="text-[9px] text-amber-700 dark:text-amber-300 font-mono uppercase font-semibold block">
              Idle Carbon Waste
            </span>
            <div className="text-sm font-bold font-mono-num text-amber-900 dark:text-amber-200 mt-0.5">
              {passport.idleCarbonLossKg} kg
            </div>
            <span className="text-[9px] text-amber-700 dark:text-amber-400 font-mono block">
              {passport.idleCarbonLossPct}% of its total emissions!
            </span>
          </div>
        </div>

        {/* Carbon-Aware Predictive Maintenance Warning Callout */}
        {passport.extraEnergyPctDueToWear > 0 && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/50 space-y-1 mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Carbon-Aware Predictive Maintenance:</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-snug">
              Bearing degradation ke वजह se motor <strong>{passport.extraEnergyPctDueToWear}% extra energy</strong> consume kar rahi hai, causing <strong>₹{passport.extraEnergyCostYearINR.toLocaleString('en-IN')}/year</strong> avoidable energy cost and <strong>{passport.extraCo2TonsYear} tCO₂</strong> extra emissions.
            </p>
          </div>
        )}
      </div>

      {/* Card Footer: Share of Plant Emissions */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-num text-slate-500">
        <span className="flex items-center gap-1">
          <Leaf className="w-3.5 h-3.5 text-emerald-500" />
          <span>Plant Share:</span>
          <strong className="text-slate-800 dark:text-slate-200">{passport.shareOfPlantEmissionsPct}%</strong>
        </span>

        <span
          className={`flex items-center gap-1 font-semibold ${
            passport.efficiencyTrend === 'degrading'
              ? 'text-amber-600'
              : 'text-emerald-600'
          }`}
        >
          {passport.efficiencyTrend === 'degrading' ? (
            <>
              <TrendingDown className="w-3 h-3" />
              <span>Degrading</span>
            </>
          ) : (
            <>
              <TrendingUp className="w-3 h-3" />
              <span>Optimal</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
};
