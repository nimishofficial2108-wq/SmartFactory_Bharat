import React, { useState, useEffect } from 'react';
import { useAIIntelligence, MACHINE_PROFILES, DEFAULT_THRESHOLDS } from '../../context/AIIntelligenceContext';
import { AIMachineProfileId, MachineThresholdConfig } from '../../types/aiIntelligence';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  X,
  RotateCcw,
  Zap,
  Activity,
  Flame,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  Clock,
  IndianRupee,
  Check,
} from 'lucide-react';

export const AnomalyThresholdModal: React.FC = () => {
  const {
    isThresholdModalOpen,
    setIsThresholdModalOpen,
    selectedProfileId,
    setSelectedProfileId,
    machineThresholds,
    updateMachineThresholds,
    resetMachineThresholds,
    pipeline,
    activeThresholdBreaches,
    scenario,
    setScenario,
  } = useAIIntelligence();

  // Local editing state so user can tweak without committing immediately
  const [activeProfile, setActiveProfile] = useState<AIMachineProfileId>(selectedProfileId);
  const [localConfig, setLocalConfig] = useState<MachineThresholdConfig>(() => {
    return machineThresholds[selectedProfileId] || DEFAULT_THRESHOLDS[selectedProfileId];
  });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync active machine profile when modal opens or profile changes
  useEffect(() => {
    setActiveProfile(selectedProfileId);
    setLocalConfig(machineThresholds[selectedProfileId] || DEFAULT_THRESHOLDS[selectedProfileId]);
  }, [selectedProfileId, isThresholdModalOpen, machineThresholds]);

  // When user switches profile tab inside the modal
  const handleProfileChange = (profId: AIMachineProfileId) => {
    setActiveProfile(profId);
    setLocalConfig(machineThresholds[profId] || DEFAULT_THRESHOLDS[profId]);
  };

  if (!isThresholdModalOpen) return null;

  const profile = MACHINE_PROFILES[activeProfile];
  const liveVib = pipeline.features.vibrationRMS;
  const liveTemp = pipeline.baseline.observedTemp;
  const liveCurrent = pipeline.features.currentRMS;

  // Sensitivity Presets calculation
  const applySensitivityPreset = (mode: 'high' | 'medium' | 'low') => {
    let vibWarnMultiplier = 1.25;
    let vibCritMultiplier = 1.6;
    let tempWarnMultiplier = 1.15;
    let tempCritMultiplier = 1.35;
    let currWarnMultiplier = 1.15;
    let currCritMultiplier = 1.35;

    if (mode === 'high') {
      // High sensitivity = tighter thresholds (early detection)
      vibWarnMultiplier = 1.12;
      vibCritMultiplier = 1.35;
      tempWarnMultiplier = 1.08;
      tempCritMultiplier = 1.2;
      currWarnMultiplier = 1.08;
      currCritMultiplier = 1.22;
    } else if (mode === 'low') {
      // Low sensitivity = wider tolerance (less noisy)
      vibWarnMultiplier = 1.45;
      vibCritMultiplier = 1.9;
      tempWarnMultiplier = 1.25;
      tempCritMultiplier = 1.5;
      currWarnMultiplier = 1.25;
      currCritMultiplier = 1.5;
    }

    setLocalConfig((prev) => ({
      ...prev,
      sensitivityMode: mode,
      vibrationWarningRMS: +(profile.nominalVibRMS * vibWarnMultiplier).toFixed(2),
      vibrationCriticalRMS: +(profile.nominalVibRMS * vibCritMultiplier).toFixed(2),
      tempWarningC: +(profile.nominalTempC * tempWarnMultiplier).toFixed(1),
      tempCriticalC: +(profile.nominalTempC * tempCritMultiplier).toFixed(1),
      currentWarningA: +(profile.nominalCurrentA * currWarnMultiplier).toFixed(1),
      currentCriticalA: +(profile.nominalCurrentA * currCritMultiplier).toFixed(1),
    }));
  };

  const handleSave = () => {
    updateMachineThresholds(activeProfile, localConfig);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsThresholdModalOpen(false);
    }, 1000);
  };

  const handleReset = () => {
    resetMachineThresholds(activeProfile);
    setLocalConfig(DEFAULT_THRESHOLDS[activeProfile]);
  };

  // Check if live telemetry breaches local config
  const isVibBreached = liveVib >= localConfig.vibrationWarningRMS;
  const isTempBreached = liveTemp >= localConfig.tempWarningC;
  const isCurrentBreached = liveCurrent >= localConfig.currentWarningA;
  const anyBreached = isVibBreached || isTempBreached || isCurrentBreached;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 md:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-purple-50/50 via-white to-transparent dark:from-purple-950/20 dark:via-slate-900 dark:to-transparent">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-purple-600" />
                AI Proactive Guard
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Non-Invasive IoT Telemetry Envelope
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Anomaly Threshold & Sensitivity Configuration</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              Configure custom sensitivity setpoints for machine vibration (MPU6050), surface temperature (DS18B20/MLX90614), and motor current (SCT-013). When breached, the AI engine proactively generates early-warning maintenance alerts before breakdown.
            </p>
          </div>

          <button
            onClick={() => setIsThresholdModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Machine Profile Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Configure Thresholds For Machine:</span>
              </span>
              <span className="font-mono text-[11px]">
                Nominal: {profile.nominalVibRMS} mm/s · {profile.nominalTempC}°C · {profile.nominalCurrentA} A
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.values(MACHINE_PROFILES).map((p) => {
                const isSelected = p.id === activeProfile;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleProfileChange(p.id)}
                    className={`p-2.5 rounded-2xl text-left border text-xs transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold truncate">{p.name}</div>
                    <div
                      className={`text-[10px] font-mono mt-0.5 truncate ${
                        isSelected ? 'text-purple-200' : 'text-slate-400'
                      }`}
                    >
                      {p.nominalCurrentA}A nominal
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensitivity Presets Bar */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Quick Sensitivity Presets:</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Scales all 3 sensor bounds based on machinery criticality
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'high', label: 'High (Strict ±10%)' },
                  { id: 'medium', label: 'Medium (Standard ±25%)' },
                  { id: 'low', label: 'Low (Tolerant ±40%)' },
                ] as const
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applySensitivityPreset(preset.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    localConfig.sensitivityMode === preset.id
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3 Core Metric Threshold Configuration Cards */}
          <div className="space-y-4">
            {/* ========================================================================= */}
            {/* 1. MPU6050 Vibration Thresholds                                          */}
            {/* ========================================================================= */}
            <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Tri-Axial Vibration Limits (MPU6050)</span>
                      <span className="text-[10px] font-mono text-slate-400">mm/s RMS</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      ISO 10816 Class II mechanical envelope · Nominal: {profile.nominalVibRMS} mm/s
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400 text-[11px]">Live Reading:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      isVibBreached
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {liveVib.toFixed(2)} mm/s
                  </span>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Warning Threshold Slider */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Warning Setpoint (Early Wear):</span>
                    </span>
                    <span className="font-bold font-mono text-amber-700 dark:text-amber-300">
                      {localConfig.vibrationWarningRMS} mm/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={(profile.nominalVibRMS * 1.05).toFixed(1)}
                    max={(profile.nominalVibRMS * 2.2).toFixed(1)}
                    step="0.1"
                    value={localConfig.vibrationWarningRMS}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        vibrationWarningRMS: parseFloat(e.target.value),
                        sensitivityMode: 'custom',
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Tight (+5%)</span>
                    <span>Tolerant (+120%)</span>
                  </div>
                </div>

                {/* Critical Threshold Slider */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>Critical Danger Limit:</span>
                    </span>
                    <span className="font-bold font-mono text-red-700 dark:text-red-300">
                      {localConfig.vibrationCriticalRMS} mm/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={(localConfig.vibrationWarningRMS + 0.5).toFixed(1)}
                    max={(profile.nominalVibRMS * 3.5).toFixed(1)}
                    step="0.1"
                    value={localConfig.vibrationCriticalRMS}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        vibrationCriticalRMS: parseFloat(e.target.value),
                        sensitivityMode: 'custom',
                      }))
                    }
                    className="w-full accent-red-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Moderate Critical</span>
                    <span>Severe Damage Risk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 2. DS18B20 & MLX90614 Temperature Thresholds                             */}
            {/* ========================================================================= */}
            <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Surface & Contact Heat Thresholds (DS18B20 / MLX90614)</span>
                      <span className="text-[10px] font-mono text-slate-400">°C</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Class F Winding insulation limits · Nominal: {profile.nominalTempC}°C
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400 text-[11px]">Live Reading:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      isTempBreached
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {liveTemp.toFixed(1)}°C
                  </span>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Warning Temp Slider */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-amber-700 dark:text-amber-300">
                      Thermal Warning Setpoint:
                    </span>
                    <span className="font-bold font-mono text-amber-700 dark:text-amber-300">
                      {localConfig.tempWarningC}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min={(profile.nominalTempC + 4).toFixed(0)}
                    max={(profile.nominalTempC + 35).toFixed(0)}
                    step="1"
                    value={localConfig.tempWarningC}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        tempWarningC: parseFloat(e.target.value),
                        sensitivityMode: 'custom',
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{(profile.nominalTempC + 4).toFixed(0)}°C</span>
                    <span>{(profile.nominalTempC + 35).toFixed(0)}°C</span>
                  </div>
                </div>

                {/* Critical Temp Slider */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-red-700 dark:text-red-300">
                      Critical Winding Damage Limit:
                    </span>
                    <span className="font-bold font-mono text-red-700 dark:text-red-300">
                      {localConfig.tempCriticalC}°C
                    </span>
                  </div>
                  <input
                    type="range"
                    min={(localConfig.tempWarningC + 5).toFixed(0)}
                    max={(profile.nominalTempC + 55).toFixed(0)}
                    step="1"
                    value={localConfig.tempCriticalC}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        tempCriticalC: parseFloat(e.target.value),
                        sensitivityMode: 'custom',
                      }))
                    }
                    className="w-full accent-red-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{(localConfig.tempWarningC + 5).toFixed(0)}°C</span>
                    <span>{(profile.nominalTempC + 55).toFixed(0)}°C</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* 3. SCT-013 Phase Current Draw Thresholds                                 */}
            {/* ========================================================================= */}
            <div className="p-4 md:p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Phase Current Draw & Overcurrent (SCT-013)</span>
                      <span className="text-[10px] font-mono text-slate-400">A RMS</span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Full Load Amps (FLA) overload envelope · Nominal: {profile.nominalCurrentA} A
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400 text-[11px]">Live Reading:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full ${
                      isCurrentBreached
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {liveCurrent.toFixed(1)} A
                  </span>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Warning Current Slider */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-amber-700 dark:text-amber-300">
                      Warning Load Threshold:
                    </span>
                    <span className="font-bold font-mono text-amber-700 dark:text-amber-300">
                      {localConfig.currentWarningA} A
                    </span>
                  </div>
                  <input
                    type="range"
                    min={(profile.nominalCurrentA * 1.05).toFixed(1)}
                    max={(profile.nominalCurrentA * 1.6).toFixed(1)}
                    step="0.5"
                    value={localConfig.currentWarningA}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        currentWarningA: parseFloat(e.target.value),
                        sensitivityMode: 'custom',
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{(profile.nominalCurrentA * 1.05).toFixed(1)} A</span>
                    <span>{(profile.nominalCurrentA * 1.6).toFixed(1)} A</span>
                  </div>
                </div>

                {/* Critical Current Slider */}
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-red-700 dark:text-red-300">
                      Trip / Lockout Overload:
                    </span>
                    <span className="font-bold font-mono text-red-700 dark:text-red-300">
                      {localConfig.currentCriticalA} A
                    </span>
                  </div>
                  <input
                    type="range"
                    min={(localConfig.currentWarningA + 1).toFixed(1)}
                    max={(profile.nominalCurrentA * 2.2).toFixed(1)}
                    step="0.5"
                    value={localConfig.currentCriticalA}
                    onChange={(e) =>
                      setLocalConfig((c) => ({
                        ...c,
                        currentCriticalA: parseFloat(e.target.value),
                        sensitivityMode: 'custom',
                      }))
                    }
                    className="w-full accent-red-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{(localConfig.currentWarningA + 1).toFixed(1)} A</span>
                    <span>{(profile.nominalCurrentA * 2.2).toFixed(1)} A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Proactive Dispatch & Trigger Setting */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-emerald-500/10 to-transparent border border-purple-200 dark:border-purple-800/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Proactive AI Maintenance Engine Integration:</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  When enabled, threshold violations automatically trigger proactive prognostic alerts, compute rupee risk, and recommend servicing windows.
                </p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
                <input
                  type="checkbox"
                  checked={localConfig.autoProactiveAlerts}
                  onChange={(e) =>
                    setLocalConfig((c) => ({ ...c, autoProactiveAlerts: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {localConfig.autoProactiveAlerts ? 'Proactive Alerts Active' : 'Muted'}
                </span>
              </label>
            </div>
          </div>

          {/* Live Breach Simulation & Proactive Alert Preview */}
          <div className="p-4 rounded-2xl bg-[#fafafa] dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-black/5 dark:border-white/5">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Threshold Status Preview:</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScenario('bearing_degradation')}
                  className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-semibold transition-all"
                >
                  Test Wear (+28%)
                </button>
                <button
                  onClick={() => setScenario('normal')}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold transition-all"
                >
                  Reset Normal
                </button>
              </div>
            </div>

            {anyBreached ? (
              <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-200">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Threshold Breach Detected in Live Telemetry!</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 uppercase">
                    Proactive Alert Dispatched
                  </span>
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Live reading has exceeded the newly configured bounds. The AI Engine will proactively flag:
                  <strong> “Inspect drive bearing lubrication within 48h to prevent ₹24,000 catastrophic breakdown.”</strong>
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  All current telemetry parameters operate safely inside the configured sensitivity bounds.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 md:p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to OEM Baseline</span>
          </button>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsThresholdModalOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved & Applied!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Apply Thresholds</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
