import React from 'react';
import { useAIIntelligence, MACHINE_PROFILES } from '../../context/AIIntelligenceContext';
import { AIMachineProfileId, SimulationScenarioId } from '../../types/aiIntelligence';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ScenarioControlBar: React.FC = () => {
  const {
    selectedProfileId,
    setSelectedProfileId,
    selectedProfile,
    scenario,
    setScenario,
    isSimulating,
    toggleSimulation,
    resetSimulation,
    autoDemoRunning,
    autoDemoElapsedSec,
    startAutoDemo,
    stopAutoDemo,
  } = useAIIntelligence();

  const scenarios: { id: SimulationScenarioId; label: string; desc: string }[] = [
    { id: 'normal', label: 'Normal Operation', desc: 'All telemetry stable within baseline bounds.' },
    { id: 'bearing_degradation', label: 'Bearing Degradation', desc: 'Correlated rise in vibration, current & temp.' },
    { id: 'machine_overload', label: 'Machine Overload', desc: 'High electrical current strain with moderate vibration.' },
    { id: 'misalignment', label: 'Shaft Misalignment', desc: 'Sharp 1X/2X mechanical vibration spike.' },
    { id: 'idle_waste', label: 'Idle Energy Waste', desc: '0 parts produced while motor draws significant power.' },
    { id: 'overheating', label: 'Overheating / Thermal', desc: 'Thermal dissipation failure on contact & IR probes.' },
    { id: 'acoustic_anomaly', label: 'Acoustic Anomaly', desc: 'High-frequency ultrasonic bearing squeal manifests first.' },
  ];

  return (
    <div className="p-4 md:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all">
      {/* Top Controls Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Machine Profile Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Machine Profile:
            </span>
            <select
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(e.target.value as AIMachineProfileId)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 shadow-2xs"
            >
              {Object.values(MACHINE_PROFILES).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono-num text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <span>Nominal:</span>
            <strong className="text-slate-800 dark:text-slate-200">{selectedProfile.nominalCurrentA}A</strong> ·
            <strong className="text-slate-800 dark:text-slate-200">{selectedProfile.nominalVibRMS}mm/s</strong> ·
            <strong className="text-slate-800 dark:text-slate-200">{selectedProfile.nominalTempC}°C</strong>
          </div>
        </div>

        {/* Simulation Execution Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 75s Automated Demo Button */}
          <button
            onClick={autoDemoRunning ? stopAutoDemo : startAutoDemo}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shadow-xs transition-all ${
              autoDemoRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>
              {autoDemoRunning ? `Demo Running (${autoDemoElapsedSec}s / 75s)` : 'Run Failure Simulation (75s)'}
            </span>
          </button>

          {/* Pause / Play */}
          <button
            onClick={toggleSimulation}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulating ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={resetSimulation}
            title="Reset Simulation"
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto Demo Progress Bar */}
      {autoDemoRunning && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono-num text-slate-500">
            <span className="text-amber-600 font-bold">
              {autoDemoElapsedSec < 10
                ? 'Phase 1: Normal baseline operation (0-10s)'
                : autoDemoElapsedSec < 25
                ? 'Phase 2: Vibration RMS rising (10-25s)'
                : autoDemoElapsedSec < 35
                ? 'Phase 3: Motor current compensating for friction (25-35s)'
                : autoDemoElapsedSec < 50
                ? 'Phase 4: Temperature dissipation rising (35-50s)'
                : autoDemoElapsedSec < 60
                ? 'Phase 5: Multi-sensor AI correlation & anomaly detection (50-60s)'
                : 'Phase 6: Decision attribution & maintenance alert (60-75s)'}
            </span>
            <span className="font-bold">{autoDemoElapsedSec} / 75s</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${(autoDemoElapsedSec / 75) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Scenario Pills Selector */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Interactive Fault Injection Scenarios:
          </span>
          <span className="text-[11px] text-slate-400">
            Active: <strong className="text-slate-800 dark:text-slate-200">{scenarios.find((s) => s.id === scenario)?.label}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {scenarios.map((sc) => {
            const isActive = scenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  stopAutoDemo();
                  setScenario(sc.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs'
                    : 'bg-[#f7f7f8] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
                title={sc.desc}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
