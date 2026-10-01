import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  BrainCircuit,
  ArrowDown,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Check,
  Wrench,
  HelpCircle,
} from 'lucide-react';

export const AIDecisionLogicTree: React.FC = () => {
  const { pipeline, scenario } = useAIIntelligence();
  const { decision, baseline, anomaly } = pipeline;

  const isAnomaly = anomaly.isAnomaly;

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Decision Logic Tree & Root Cause Attribution
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
              Transparent Reasoning
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time inference graph attributing multi-sensor signal shifts to probable mechanical modes
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>AI Indication (Technician Confirmation Required)</span>
        </div>
      </div>

      {/* Visual Live Decision Flow Tree */}
      <div className="space-y-4">
        {/* Layer 1: Sensor Signal Vector Inputs */}
        <div className="p-4 rounded-2xl bg-[#fcfcfd] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-bold">
            Stage 1 · Multi-Signal Evidence Aggregation
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {decision.evidence.map((ev, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <span className="text-slate-600 dark:text-slate-400 truncate pr-1 text-[11px]">{ev.metric.split(' ')[0]}</span>
                <span
                  className={`font-mono-num font-bold text-[11px] ${
                    ev.delta.startsWith('+') ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                  }`}
                >
                  {ev.delta}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tree Branch Connector */}
        <div className="flex justify-center -my-2">
          <div className="flex flex-col items-center text-slate-300 dark:text-slate-700">
            <ArrowDown className="w-4 h-4 text-slate-400 animate-bounce" />
          </div>
        </div>

        {/* Layer 2: Baseline Correlation Check */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Historical Baseline Comparison & Anomaly Classification
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono-num">
              <span className="text-slate-400">Baseline Deviation:</span>
              <strong className={isAnomaly ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                {isAnomaly ? `+${Math.abs(baseline.currentDiffPct)}% Deviation` : 'Nominal (<4% Variance)'}
              </strong>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {decision.aiInterpretation}
          </p>
        </div>

        {/* Tree Branch Connector */}
        <div className="flex justify-center -my-2">
          <ArrowDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Layer 3: Probable Cause & Confidence Gauge */}
        <div
          className={`p-4 md:p-5 rounded-2xl border transition-all ${
            isAnomaly
              ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-500/30'
              : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-500/30'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5 dark:border-white/10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-0.5">
                AI Indication / Probable Cause:
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {decision.probableCause}
              </h4>
            </div>

            {/* Confidence Score Pill */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Confidence</span>
                <span className="text-xl font-bold font-mono-num text-slate-900 dark:text-white">
                  {decision.confidencePct}%
                </span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden bg-white dark:bg-slate-800">
                <div
                  className="absolute inset-0 bg-emerald-500/20"
                  style={{ height: `${decision.confidencePct}%`, bottom: 0 }}
                />
                <Sparkles className="w-5 h-5 text-amber-500 relative z-10" />
              </div>
            </div>
          </div>

          {/* Layer 4: Actionable Technician Recommendations */}
          <div className="pt-3 space-y-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Recommended Operator / Maintenance Actions:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {decision.recommendedActions.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2 shadow-2xs"
                >
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
