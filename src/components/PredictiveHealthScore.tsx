import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { Machine, PredictiveHealthResult } from '../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldAlert,
  Wrench,
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface PredictiveHealthScoreProps {
  machine?: Machine;
  mode?: 'badge' | 'compact' | 'detailed';
  showInteractiveService?: boolean;
}

export const PredictiveHealthScore: React.FC<PredictiveHealthScoreProps> = ({
  machine,
  mode = 'detailed',
  showInteractiveService = true,
}) => {
  const {
    machines,
    getPredictiveHealth,
    servicedMachineIds,
    simulateService,
    setSelectedMachineId,
    setCurrentNav,
    language,
  } = useFactory();

  const targetMachine = machine || machines[0];
  const [activeTabMachineId, setActiveTabMachineId] = useState<string>(targetMachine?.id || 'm1');

  const currentMachine = machine || machines.find((m) => m.id === activeTabMachineId) || machines[0];
  const health: PredictiveHealthResult = getPredictiveHealth(currentMachine);
  const isServiced = servicedMachineIds.includes(currentMachine.id);

  // Color coding based on longevity score percentage
  const getColorClasses = (score: number) => {
    if (score >= 85) {
      return {
        text: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/15',
        border: 'border-emerald-200 dark:border-emerald-500/30',
        ringStroke: '#10b981',
        barBg: 'bg-emerald-500',
        label: 'Optimal',
        hindiLabel: 'उत्कृष्ट (सुरक्षित)',
      };
    }
    if (score >= 70) {
      return {
        text: 'text-amber-800 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/15',
        border: 'border-amber-200 dark:border-amber-500/30',
        ringStroke: '#f59e0b',
        barBg: 'bg-amber-500',
        label: 'Moderate Wear',
        hindiLabel: 'मध्यम घिसाव (सावधानी)',
      };
    }
    return {
      text: 'text-red-700 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-500/15',
      border: 'border-red-200 dark:border-red-500/30',
      ringStroke: '#ef4444',
      barBg: 'bg-red-500',
      label: 'High Degradation',
      hindiLabel: 'गंभीर घिसाव (तत्काल ध्यान दें)',
    };
  };

  const colors = getColorClasses(health.score);

  // 1. BADGE MODE (for machine card header)
  if (mode === 'badge') {
    const displayScore = machine?.healthScore ?? health.score;
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono-num font-semibold transition-all ${colors.bg} ${colors.border} ${colors.text}`}
        title={`Health Score: ${displayScore}% · Time-to-Failure: ~${health.timeToFailureDays} days (${health.timeToFailureHours} hrs)`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${colors.barBg} ${
            displayScore < 75 ? 'animate-pulse' : ''
          }`}
        />
        <span className="text-slate-500 dark:text-slate-400 font-normal">Health:</span>
        <strong className="font-bold text-slate-900 dark:text-white">{displayScore}%</strong>
        <span className="text-[10px] text-slate-400 font-normal">
          ({health.timeToFailureDays > 60 ? '>60d' : `${health.timeToFailureDays}d`})
        </span>
      </div>
    );
  }

  // 2. COMPACT MODE (for machine card body strip)
  if (mode === 'compact') {
    return (
      <div
        className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${colors.bg} ${colors.border} shadow-2xs transition-colors`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
            <Activity className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-white">
                {language === 'hi' ? 'अनुमानित मशीन जीवन (Longevity):' : 'Estimated Longevity:'}
              </span>
              <span className={`text-sm font-bold font-mono-num ${colors.text}`}>
                {health.score}%
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                {language === 'hi' ? colors.hindiLabel : colors.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono-num">
              {language === 'hi'
                ? `खराबी आने में अनुमानित समय: ${health.timeToFailureDays} दिन (${health.timeToFailureHours} कार्य घंटे)`
                : `Estimated Time-to-Failure: ${health.timeToFailureDays} Days (${health.timeToFailureHours} hrs)`}
            </p>
          </div>
        </div>

        {/* Small mini-bar indicator */}
        <div className="flex items-center gap-2 min-w-[130px]">
          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-950 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.barBg} transition-all duration-500`}
              style={{ width: `${health.score}%` }}
            />
          </div>
          <span className="text-xs font-mono-num font-bold text-slate-800 dark:text-white">
            {health.score}%
          </span>
        </div>
      </div>
    );
  }

  // 3. DETAILED PROGNOSTIC MODE (for Dashboard and Machine Detail Screen)
  const isFleetMode = !machine;
  const highRiskCount = machines.filter(
    (m) => getPredictiveHealth(m).riskLevel === 'high' || getPredictiveHealth(m).riskLevel === 'critical'
  ).length;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden p-5 space-y-5 relative transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-amber-400 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {language === 'hi'
                  ? 'प्रेडिक्टिव हेल्थ स्कोर एवं मशीन जीवन (Longevity %)'
                  : 'Predictive Health Score & Machine Longevity'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold uppercase">
                AI Prognostics
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'hi'
                ? 'कंपन व करंट की प्रवृत्तियों (Trends) से मोटर जलने व खराबी का पूर्व-आकलन'
                : 'Trends vibration and current data over time to estimate machine longevity and time-to-failure'}
            </p>
          </div>
        </div>

        {/* Global Summary Badge */}
        {isFleetMode && (
          <div className="flex items-center gap-2">
            {highRiskCount > 0 ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 text-xs font-semibold font-mono-num">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>{highRiskCount} Machine Needs Maintenance</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300 text-xs font-semibold font-mono-num">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>All Machines In Safe Longevity Zone</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fleet Machine Selector Cards */}
      {isFleetMode && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {machines.map((m) => {
            const mHealth = getPredictiveHealth(m);
            const mColors = getColorClasses(mHealth.score);
            const isSelected = m.id === activeTabMachineId;

            return (
              <button
                key={m.id}
                onClick={() => setActiveTabMachineId(m.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-900 dark:border-amber-400 shadow-xs'
                    : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-slate-400 truncate">
                      {m.boxId}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase ${mColors.bg} ${mColors.border} ${mColors.text}`}
                    >
                      {mHealth.riskLevel}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {m.name}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-baseline justify-between font-mono-num">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Longevity</span>
                    <span className={`text-lg font-bold ${mColors.text}`}>
                      {mHealth.score}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase">Est. TTF</span>
                    <span
                      className={`text-xs font-bold ${
                        mHealth.score < 75 ? 'text-amber-700 dark:text-amber-300 animate-pulse' : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {mHealth.timeToFailureDays > 60
                        ? '>60 Days'
                        : `${mHealth.timeToFailureDays} Days`}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detailed Deep-Dive Prognostics Container */}
      <div className="p-5 rounded-xl bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {currentMachine.name}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({currentMachine.type.toUpperCase()})
              </span>
              {isServiced && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 font-mono font-bold">
                  ✓ Serviced (Simulated)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'hi' ? health.hindiFailureMode : health.failureMode}
            </p>
          </div>

          {/* Quick Service Simulation Button */}
          {showInteractiveService && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => simulateService(currentMachine.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                  isServiced
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                    : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 border-transparent shadow-xs'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>
                  {isServiced
                    ? 'Revert to Degraded State'
                    : language === 'hi'
                    ? 'सर्विसिंग सिमुलेट करें (Simulate Greasing)'
                    : 'Simulate Preventive Service'}
                </span>
              </button>

              {isFleetMode && (
                <button
                  onClick={() => {
                    setSelectedMachineId(currentMachine.id);
                    setCurrentNav('machines');
                  }}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/90 dark:border-slate-700 transition-colors"
                >
                  <span>3D Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 dark:text-amber-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* 3 Prognostic Metric Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Longevity Percentage Gauge */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="#e2e8f0"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke={colors.ringStroke}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={150}
                  strokeDashoffset={150 - (150 * health.score) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono-num font-bold text-xs text-slate-900 dark:text-white">
                {health.score}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                Estimated Longevity
              </span>
              <span className={`text-xs font-bold ${colors.text} block`}>
                {language === 'hi' ? colors.hindiLabel : colors.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono-num">
                Algorithm Confidence: {health.confidenceScore}%
              </span>
            </div>
          </div>

          {/* 2. Time to Failure Countdown */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-700 dark:text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-mono">
                Time-to-Failure (TTF)
              </span>
              <div className="text-base font-bold font-mono-num text-slate-900 dark:text-white">
                {health.timeToFailureDays}{' '}
                <span className="text-xs text-slate-500 font-normal">Days</span>
                <span className="text-xs text-slate-400 ml-1.5 font-normal">
                  ({health.timeToFailureHours} hrs)
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono-num">
                Based on continuous shopfloor duty
              </span>
            </div>
          </div>

          {/* 3. Breakdown Cost Avoidance */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center gap-3 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/80 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-mono font-semibold">
                Breakdown Loss Avoidance
              </span>
              <div className="text-base font-bold font-mono-num text-emerald-700 dark:text-emerald-400">
                ₹{health.savingsIfServicedINR.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400 font-mono-num">
                Saved vs emergency motor rewind
              </span>
            </div>
          </div>
        </div>

        {/* Recommended Preventive Action Banner */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-start gap-2.5 text-xs shadow-2xs">
          <Wrench className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-slate-200">
              {language === 'hi' ? 'सलाह दी गई कार्रवाई (Action): ' : 'Recommended Maintenance Action: '}
            </span>
            <span className="text-slate-600 dark:text-slate-300">
              {language === 'hi' ? health.hindiPreventiveAction : health.preventiveAction}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
