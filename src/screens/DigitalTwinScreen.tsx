import React, { useState, useEffect } from 'react';
import { useFactory } from '../context/FactoryContext';
import { OscilloscopeCanvas } from '../components/OscilloscopeCanvas';
import {
  Activity,
  Sliders,
  TrendingDown,
  Zap,
  Repeat,
  IndianRupee,
  RotateCw,
  Power,
  Layers,
  Sparkles,
} from 'lucide-react';

export const DigitalTwinScreen: React.FC = () => {
  const { selectedMachine, tariffRateINR, t, language } = useFactory();

  // Duty Cycle mechanical engine loop simulation state
  const [engineState, setEngineState] = useState<'active' | 'idle' | 'off'>('active');
  const [cycleProgress, setCycleProgress] = useState<number>(0);

  // Scenario Simulator: user drags slider (0 to 6 hours reduction in idle running per day)
  const [reducedIdleHours, setReducedIdleHours] = useState<number>(2.5);

  // Machine power calculation for simulator
  const idlePowerKW = +(selectedMachine.telemetry.powerKW * 0.45).toFixed(1);
  const dailyKWhSaved = +(reducedIdleHours * idlePowerKW).toFixed(1);
  const monthlyKWhSaved = +(dailyKWhSaved * 26).toFixed(0);
  const monthlyRupeesSaved = +(monthlyKWhSaved * tariffRateINR).toFixed(0);
  const annualRupeesSaved = +(monthlyRupeesSaved * 12).toFixed(0);

  // Cyclic engine loop simulation (visualizes Active -> Idle -> Active)
  useEffect(() => {
    const timer = setInterval(() => {
      setCycleProgress((prev) => {
        const next = (prev + 1) % 100;
        if (next < 65) {
          setEngineState('active');
        } else if (next < 92) {
          setEngineState('idle');
        } else {
          setEngineState('off');
        }
        return next;
      });
    }, 120);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header (ChatGPT style clean card) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t.navDigitalTwin}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-mono-num font-semibold">
              Live Twin
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'ऑसिलोस्कोप करंट वेवफॉर्म, ड्यूटी साइकिल इंजन और बिजली बचत कैलकुलेटर'
              : 'Real-time harmonic current oscilloscope, mechanical state engine & what-if tariff simulator'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-num bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400">Target Machine:</span>
          <span className="text-slate-900 dark:text-white font-bold">{selectedMachine.name}</span>
        </div>
      </div>

      {/* Top Section: Live Oscilloscope Waveform Display */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.realtimeOscilloscope}</span>
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {t.waveformSubtitle}
          </span>
        </div>

        <OscilloscopeCanvas
          currentRMS={selectedMachine.telemetry.currentA}
          isAnomaly={selectedMachine.status === 'warning'}
        />
      </div>

      {/* Middle Section: Looping Mechanical State Simulation & What-If Energy Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Mechanical Duty Cycle State Engine (Animated Diagram) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-amber-500" />
                <span>{t.dutyCycleEngine}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                CYCLE TICK: {cycleProgress}%
              </span>
            </div>

            {/* Visual Mechanical Diagram */}
            <div className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Rotating flywheel / motor disk */}
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                {/* Circular track */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-800"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke={
                      engineState === 'active'
                        ? '#10b981'
                        : engineState === 'idle'
                        ? '#f59e0b'
                        : '#94a3b8'
                    }
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * cycleProgress) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-150"
                  />
                </svg>

                {/* Center Hub with state icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                      engineState === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : engineState === 'idle'
                        ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {engineState === 'active' ? (
                      <Layers className="w-7 h-7 animate-pulse" />
                    ) : engineState === 'idle' ? (
                      <RotateCw className="w-7 h-7 animate-spin" style={{ animationDuration: '4s' }} />
                    ) : (
                      <Power className="w-7 h-7" />
                    )}
                  </div>
                </div>
              </div>

              {/* State Status Banner */}
              <div className="text-center space-y-1">
                <span
                  className={`text-xs font-bold tracking-wide uppercase px-3 py-1 rounded-full border inline-block ${
                    engineState === 'active'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:border-emerald-500/40 dark:text-emerald-300'
                      : engineState === 'idle'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/40 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {engineState === 'active'
                    ? t.runningActive
                    : engineState === 'idle'
                    ? t.machineIdle
                    : t.stopped}
                </span>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono-num pt-1">
                  {engineState === 'active'
                    ? `Current Draw: ${selectedMachine.telemetry.currentA.toFixed(1)} A · Full Hydraulic Stamping`
                    : engineState === 'idle'
                    ? `Current Draw: ${(selectedMachine.telemetry.currentA * 0.42).toFixed(1)} A · Motor spinning unloaded (Waste)`
                    : 'Current Draw: 0.0 A · Standby'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Shift Ratio: <strong className="text-emerald-600 dark:text-emerald-400">{selectedMachine.telemetry.dutyCycle.active}% active</strong></span>
            <span className="text-amber-600 dark:text-amber-400"><strong>{selectedMachine.telemetry.dutyCycle.idle}% idle waste</strong></span>
          </div>
        </div>

        {/* Panel 2: Interactive Scenario Simulator ("What If") */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.whatIfSimulator}</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-bold">
                ROI MODEL
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {t.extraHoursLabel}
            </p>

            {/* Interactive Slider */}
            <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-num">
                <span className="text-slate-500 dark:text-slate-400">Reduce Idle Time By:</span>
                <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {reducedIdleHours.toFixed(1)} Hours / day
                </span>
              </div>

              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.5"
                value={reducedIdleHours}
                onChange={(e) => setReducedIdleHours(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono-num">
                <span>0.5 hrs</span>
                <span>3.0 hrs</span>
                <span>6.0 hrs</span>
              </div>
            </div>

            {/* Projected Impact Live Cards */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
                  Monthly Energy Saved
                </span>
                <div className="text-xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
                  {monthlyKWhSaved}
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1">kWh / mo</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono-num">
                  {dailyKWhSaved} kWh per 8-hr shift
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-slate-950 border border-emerald-200 dark:border-emerald-500/30">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-mono font-semibold">
                  Monthly ₹ Bill Reduction
                </span>
                <div className="text-xl font-bold font-mono-num text-emerald-700 dark:text-emerald-400 mt-1">
                  ₹{Number(monthlyRupeesSaved).toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-500 font-mono-num">
                  ₹{Number(annualRupeesSaved).toLocaleString('en-IN')} per year
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono-num">
            <span>DISCOM Tariff: ₹{tariffRateINR}/unit</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Payback of SmartFactory box: &lt; 2 Months!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
