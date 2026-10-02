import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  Layers,
  Sliders,
  Scale,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const AIPipelineFlow: React.FC = () => {
  const { pipeline, selectedProfile, scenario } = useAIIntelligence();
  const { fusion, features, baseline, anomaly } = pipeline;

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Multi-Stage Feature Extraction & Processing Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronous transformation of multi-sensor frames into predictive machine longevity indices
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-num bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
          <span className="text-slate-400">Fusion Vector:</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">
            [{fusion.stateVector.map((v) => v.toFixed(1)).join(', ')}]
          </span>
        </div>
      </div>

      {/* 4 Multi-Stage Visual Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {/* Stage 1: Sensor Fusion */}
        <div className="p-4 rounded-2xl bg-[#fcfcfd] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Stage 1 · Fusion
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sensor Fusion Layer</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Synchronously interlaces 5 heterogeneous sensor streams into a unified 5-D state vector.
            </p>

            <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 space-y-1 text-[11px] font-mono-num">
              <div className="flex justify-between">
                <span className="text-slate-400">Active Inputs:</span>
                <span className="text-emerald-600 font-bold">{fusion.activeSensorsCount} Nodes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Temporal Alignment:</span>
                <span className="text-slate-700 dark:text-slate-200">10ms epoch</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono">
            Output: Machine State Vector
          </div>
        </div>

        {/* Stage 2: Feature Extraction */}
        <div className="p-4 rounded-2xl bg-[#fcfcfd] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Stage 2 · Features
              </span>
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Feature Extraction</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Calculates RMS energy, harmonic variance, peak acceleration, and spectral shift.
            </p>

            <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 space-y-1 text-[11px] font-mono-num">
              <div className="flex justify-between">
                <span className="text-slate-400">Current Variance:</span>
                <span className="text-slate-700 dark:text-slate-200">{features.currentVariance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vib Peak (g):</span>
                <span className="text-slate-700 dark:text-slate-200">{features.vibrationPeak}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Spectral Dev:</span>
                <span className="text-slate-700 dark:text-slate-200">{features.acousticSpectralDeviation}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono">
            Output: Multi-domain Tensor
          </div>
        </div>

        {/* Stage 3: Baseline Comparison */}
        <div className="p-4 rounded-2xl bg-[#fcfcfd] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Stage 3 · Baseline
              </span>
              <Scale className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Baseline Comparison</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Evaluates live observations against factory golden standard envelope.
            </p>

            <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 space-y-1 text-[11px] font-mono-num">
              <div className="flex justify-between">
                <span className="text-slate-400">Exp. Current:</span>
                <span className="text-slate-700 dark:text-slate-200">
                  {baseline.expectedCurrent}A vs {baseline.observedCurrent}A
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Δ:</span>
                <span
                  className={baseline.currentDiffPct > 10 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}
                >
                  {baseline.currentDiffPct > 0 ? '+' : ''}
                  {baseline.currentDiffPct}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vibration Δ:</span>
                <span className={baseline.vibDiffPct > 15 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {baseline.vibDiffPct > 0 ? '+' : ''}
                  {baseline.vibDiffPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono">
            Output: Residual Error Vectors
          </div>
        </div>

        {/* Stage 4: AI Anomaly Detection */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
            anomaly.isAnomaly
              ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/20 dark:border-amber-500/30'
              : 'bg-[#fcfcfd] dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Stage 4 · Detection
              </span>
              <ShieldAlert
                className={`w-3.5 h-3.5 ${anomaly.isAnomaly ? 'text-amber-600 animate-pulse' : 'text-emerald-500'}`}
              />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Anomaly Detection</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Probabilistic multivariate Gaussian distance classifier.
            </p>

            <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 space-y-1 text-[11px] font-mono-num">
              <div className="flex justify-between">
                <span className="text-slate-400">System State:</span>
                <span
                  className={`font-bold ${
                    anomaly.isAnomaly ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'
                  }`}
                >
                  {anomaly.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Anomaly Index:</span>
                <span className="text-slate-800 dark:text-white font-bold">{anomaly.scorePct}%</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono">
            Output: Trigger to Decision Engine
          </div>
        </div>
      </div>
    </div>
  );
};
