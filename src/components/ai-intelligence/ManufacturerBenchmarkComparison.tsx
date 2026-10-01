import React, { useState } from 'react';
import { useAIIntelligence, MACHINE_PROFILES } from '../../context/AIIntelligenceContext';
import {
  AIMachineProfileId,
  ManufacturerBenchmarkData,
  ActualPerformanceData,
} from '../../types/aiIntelligence';
import {
  Award,
  Zap,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
  Sliders,
  Flame,
  FileCheck,
  Clock,
  IndianRupee,
  Leaf,
  BarChart3,
  Download,
} from 'lucide-react';

export const OEM_BENCHMARK_PROFILES: Record<AIMachineProfileId, ManufacturerBenchmarkData> = {
  hydraulic_press: {
    profileId: 'hydraulic_press',
    machineName: 'Hydraulic Press 200T',
    manufacturerName: 'Schuler / Godrej Industrial',
    modelNumber: 'HP-200T DeepDraw Hydro-Form Series V',
    yearOfCommissioning: 2021,
    certificationStandard: 'ISO 50001 / IEC 60034-30-1 (IE3 Premium)',
    ratedPowerKW: 22.0,
    ratedCurrentA: 18.4,
    ratedEfficiencyPct: 91.5,
    ratedSpecificEnergy: {
      value: 0.082,
      unit: 'kWh / stamped cycle',
    },
    ratedIdlePowerKW: 3.2,
    ratedIdlePctOfNominal: 14.5,
    ratedPowerFactor: 0.88,
    ratedMaxVibrationRMS: 2.8,
    ratedMaxTempC: 65.0,
    annualBenchmarkKWh: 48500,
    serviceCycleDays: 90,
  },
  air_compressor: {
    profileId: 'air_compressor',
    machineName: 'Rotary Screw Compressor 45kW',
    manufacturerName: 'Atlas Copco / ELGi Equipments',
    modelNumber: 'GA-45 VSD+ Industrial Screw Unit',
    yearOfCommissioning: 2020,
    certificationStandard: 'ISO 1217 Annex C / IEC 60034-30-1 (IE3)',
    ratedPowerKW: 45.0,
    ratedCurrentA: 28.5,
    ratedEfficiencyPct: 93.6,
    ratedSpecificEnergy: {
      value: 6.42,
      unit: 'kW / (m³/min) @ 7.5 bar',
    },
    ratedIdlePowerKW: 8.5,
    ratedIdlePctOfNominal: 18.8,
    ratedPowerFactor: 0.89,
    ratedMaxVibrationRMS: 3.5,
    ratedMaxTempC: 78.0,
    annualBenchmarkKWh: 89400,
    serviceCycleDays: 60,
  },
  polishing_motor: {
    profileId: 'polishing_motor',
    machineName: 'High-Speed Polishing Motor 15HP',
    manufacturerName: 'Bharat Bijlee / Kirloskar Electric',
    modelNumber: 'BB-15HP 4-Pole Precision Spindle Motor',
    yearOfCommissioning: 2022,
    certificationStandard: 'IS 12615 / IEC 60034-30-1 (IE2/IE3)',
    ratedPowerKW: 11.0,
    ratedCurrentA: 12.2,
    ratedEfficiencyPct: 91.0,
    ratedSpecificEnergy: {
      value: 0.38,
      unit: 'kWh / finished component',
    },
    ratedIdlePowerKW: 1.8,
    ratedIdlePctOfNominal: 16.3,
    ratedPowerFactor: 0.86,
    ratedMaxVibrationRMS: 2.0,
    ratedMaxTempC: 54.0,
    annualBenchmarkKWh: 24200,
    serviceCycleDays: 120,
  },
  furnace: {
    profileId: 'furnace',
    machineName: 'Medium Induction Furnace 100kW',
    manufacturerName: 'Electrotherm / Inductotherm India',
    modelNumber: 'ET-100 VIP Solid-State Induction Melter',
    yearOfCommissioning: 2019,
    certificationStandard: 'IEEE 519 / ISO 50001 Energy Standard',
    ratedPowerKW: 100.0,
    ratedCurrentA: 86.0,
    ratedEfficiencyPct: 78.5,
    ratedSpecificEnergy: {
      value: 540.0,
      unit: 'kWh / ton metal melted',
    },
    ratedIdlePowerKW: 12.0,
    ratedIdlePctOfNominal: 12.0,
    ratedPowerFactor: 0.94,
    ratedMaxVibrationRMS: 1.4,
    ratedMaxTempC: 88.0,
    annualBenchmarkKWh: 168000,
    serviceCycleDays: 45,
  },
  generic_motor: {
    profileId: 'generic_motor',
    machineName: 'Generic 3-Phase Induction Motor',
    manufacturerName: 'Crompton Greaves / Siemens',
    modelNumber: '1LE7 High-Torque Industrial Drive',
    yearOfCommissioning: 2022,
    certificationStandard: 'IEC 60034-1 / IE2 Standard',
    ratedPowerKW: 15.0,
    ratedCurrentA: 16.0,
    ratedEfficiencyPct: 90.2,
    ratedSpecificEnergy: {
      value: 1.25,
      unit: 'kWh / operating hour',
    },
    ratedIdlePowerKW: 2.8,
    ratedIdlePctOfNominal: 18.6,
    ratedPowerFactor: 0.85,
    ratedMaxVibrationRMS: 2.2,
    ratedMaxTempC: 58.0,
    annualBenchmarkKWh: 32000,
    serviceCycleDays: 90,
  },
};

export const ManufacturerBenchmarkComparison: React.FC = () => {
  const {
    selectedProfileId,
    setSelectedProfileId,
    scenario,
    setScenario,
    pipeline,
    energy,
  } = useAIIntelligence();

  const [activeTab, setActiveTab] = useState<'sidebyside' | 'metricsbreakdown' | 'auditreport'>('sidebyside');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const benchmark = OEM_BENCHMARK_PROFILES[selectedProfileId] || OEM_BENCHMARK_PROFILES.hydraulic_press;

  // Compute live actual performance data dynamically
  const isBearingWear = scenario === 'bearing_degradation';
  const isOverload = scenario === 'machine_overload';
  const isIdleWaste = scenario === 'idle_waste';
  const isOverheating = scenario === 'overheating';
  const isMisalignment = scenario === 'misalignment';

  // Live measured current
  const liveCurrentA = pipeline.features.currentRMS;
  const currentRatio = liveCurrentA / benchmark.ratedCurrentA;

  // Power calculation (approx 3-phase active kW)
  const measuredPowerKW = +(liveCurrentA * 0.58 * (benchmark.ratedPowerKW / (benchmark.ratedCurrentA * 0.58))).toFixed(1);

  // Dynamic Efficiency Calculation
  let efficiencyLoss = 0;
  if (isBearingWear) efficiencyLoss = 11.2;
  else if (isOverload) efficiencyLoss = 7.4;
  else if (isIdleWaste) efficiencyLoss = 14.8;
  else if (isOverheating) efficiencyLoss = 8.5;
  else if (isMisalignment) efficiencyLoss = 6.2;
  else efficiencyLoss = +(Math.abs(currentRatio - 1) * 2.8).toFixed(1);

  const measuredEfficiencyPct = +(benchmark.ratedEfficiencyPct - efficiencyLoss).toFixed(1);
  const efficiencyVariancePct = +(-efficiencyLoss).toFixed(1);

  // Specific energy penalty
  const specificEnergyPenaltyPct = +(efficiencyLoss * 1.45).toFixed(1);
  const measuredSpecificEnergyValue = +(benchmark.ratedSpecificEnergy.value * (1 + specificEnergyPenaltyPct / 100)).toFixed(3);

  // Idle power draw
  const measuredIdlePowerKW = isIdleWaste
    ? +(benchmark.ratedIdlePowerKW * 2.4).toFixed(1)
    : isBearingWear
    ? +(benchmark.ratedIdlePowerKW * 1.35).toFixed(1)
    : +(benchmark.ratedIdlePowerKW * 1.08).toFixed(1);

  const idlePowerRatioPct = +( (measuredIdlePowerKW / measuredPowerKW) * 100 ).toFixed(1);

  // Power Factor
  const measuredPowerFactor = +(benchmark.ratedPowerFactor - (isBearingWear || isIdleWaste ? 0.08 : 0.02)).toFixed(2);

  // Vibration and Temperature from pipeline
  const measuredVibrationRMS = pipeline.features.vibrationRMS;
  const measuredTempC = pipeline.baseline.observedTemp;

  // Financial & Carbon penalty calculations
  const excessKWhPerHour = Math.max(0, +(measuredPowerKW - benchmark.ratedPowerKW * (measuredEfficiencyPct / benchmark.ratedEfficiencyPct)).toFixed(2));
  const dailyAvoidableKWh = +(excessKWhPerHour * 16).toFixed(1); // 16 operating hours per day
  const annualAvoidableCostINR = +(dailyAvoidableKWh * 300 * 8.5).toFixed(0); // 300 operating days @ ₹8.5/kWh
  const annualAvoidableCo2Tons = +((dailyAvoidableKWh * 300 * 0.82) / 1000).toFixed(2); // CEA grid emission factor

  let efficiencyHealthRating: 'Optimal' | 'Degraded' | 'Critical Failure Risk' = 'Optimal';
  if (Math.abs(efficiencyVariancePct) > 10) efficiencyHealthRating = 'Critical Failure Risk';
  else if (Math.abs(efficiencyVariancePct) > 4) efficiencyHealthRating = 'Degraded';

  // Root cause text based on profile & scenario
  let rootCauseAnalysis = 'Operational parameters conform closely to OEM test bench specifications. Minimal friction and optimal lubrication.';
  let recommendedOEMAlignmentAction = 'Maintain scheduled periodic maintenance. Next recommended oil and vibration check in 90 days.';

  if (isBearingWear) {
    rootCauseAnalysis = `Mechanical friction inside drive bearings causing ${efficiencyLoss}% efficiency penalty below manufacturer rated ${benchmark.ratedEfficiencyPct}%. Parasitic drag wastes ~${dailyAvoidableKWh} kWh/day.`;
    recommendedOEMAlignmentAction = `Clean and grease bearing races according to ${benchmark.manufacturerName} OEM Manual §4.2. Replace drive seals to recover ₹${annualAvoidableCostINR.toLocaleString('en-IN')}/year and restore OEM baseline.`;
  } else if (isIdleWaste) {
    rootCauseAnalysis = `Unloaded spinning draw of ${measuredIdlePowerKW} kW represents ${idlePowerRatioPct}% of full load (OEM specification permits max ${benchmark.ratedIdlePctOfNominal}%).`;
    recommendedOEMAlignmentAction = 'Configure automated 5-minute standby shut-off timer on motor starter to curb unnecessary unloaded spin hours.';
  } else if (isOverload) {
    rootCauseAnalysis = `Operating at ${measuredPowerKW} kW (+${((measuredPowerKW - benchmark.ratedPowerKW) / benchmark.ratedPowerKW * 100).toFixed(1)}% above rated ${benchmark.ratedPowerKW} kW) resulting in thermal saturation and winding heat.`;
    recommendedOEMAlignmentAction = 'Calibrate hydraulic press tonnage relief setting and inspect die clearance to prevent drive motor overload.';
  } else if (isMisalignment) {
    rootCauseAnalysis = `Angular or parallel drive coupling offset causing rotational vibration peaks (${measuredVibrationRMS} mm/s vs OEM rated ${benchmark.ratedMaxVibrationRMS} mm/s) and ${efficiencyLoss}% power loss.`;
    recommendedOEMAlignmentAction = 'Execute laser alignment of motor and driven shafts; verify mounting bolt torques per OEM spec.';
  }

  const actualData: ActualPerformanceData = {
    measuredPowerKW,
    measuredCurrentA: liveCurrentA,
    currentDiffPct: pipeline.baseline.currentDiffPct,
    measuredEfficiencyPct,
    efficiencyVariancePct,
    measuredSpecificEnergy: {
      value: measuredSpecificEnergyValue,
      unit: benchmark.ratedSpecificEnergy.unit,
    },
    specificEnergyPenaltyPct,
    measuredIdlePowerKW,
    idlePowerRatioPct,
    measuredPowerFactor,
    measuredVibrationRMS,
    measuredTempC,
    dailyAvoidableKWh,
    annualAvoidableCostINR,
    annualAvoidableCo2Tons,
    efficiencyHealthRating,
    rootCauseAnalysis,
    recommendedOEMAlignmentAction,
  };

  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6 transition-all">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              Side-by-Side Efficiency Performance Comparison
            </h2>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold uppercase tracking-wider">
              Actual vs OEM Benchmark
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Contrasts live IoT energy telemetry against manufacturer-rated nameplate specifications (IEC 60034-30-1 / ISO 50001) to diagnose performance degradation, specific energy loss, and avoidable costs.
          </p>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center text-xs">
            <button
              onClick={() => setActiveTab('sidebyside')}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                activeTab === 'sidebyside'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Side-by-Side View
            </button>
            <button
              onClick={() => setActiveTab('metricsbreakdown')}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                activeTab === 'metricsbreakdown'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Metric Bars
            </button>
            <button
              onClick={() => setActiveTab('auditreport')}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                activeTab === 'auditreport'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              OEM Alignment Plan
            </button>
          </div>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? 'Report Saved!' : 'Export OEM Audit'}</span>
          </button>
        </div>
      </div>

      {/* Machine Profile Selector Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Select Machine for Benchmark Comparison:</span>
          </span>
          <span className="font-mono text-[11px]">
            Active: <strong className="text-slate-900 dark:text-white">{benchmark.machineName}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Object.values(OEM_BENCHMARK_PROFILES).map((prof) => {
            const isSelected = prof.profileId === selectedProfileId;
            return (
              <button
                key={prof.profileId}
                onClick={() => setSelectedProfileId(prof.profileId)}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-300 dark:border-purple-600 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-[#fafafa] dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                  <span className="uppercase text-slate-400 truncate">{prof.profileId.replace('_', ' ')}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {prof.machineName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  Rated: {prof.ratedPowerKW} kW · {prof.ratedEfficiencyPct}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick KPI Summary Tiles (Variance Highlights) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* 1. Efficiency Variance */}
        <div className="p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Efficiency Variance</span>
            <Award className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono-num ${
                actualData.efficiencyVariancePct < -6
                  ? 'text-red-600 dark:text-red-400'
                  : actualData.efficiencyVariancePct < -2
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {actualData.efficiencyVariancePct > 0 ? '+' : ''}
              {actualData.efficiencyVariancePct}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              vs {benchmark.ratedEfficiencyPct}% OEM
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
            Actual: {actualData.measuredEfficiencyPct}% operating efficiency
          </span>
        </div>

        {/* 2. Power Demand Overdraw */}
        <div className="p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Power Demand</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
              {actualData.measuredPowerKW}
              <span className="text-xs text-slate-400 font-normal ml-1">kW</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Rated: {benchmark.ratedPowerKW} kW
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-0.5 block">
            {actualData.measuredPowerKW > benchmark.ratedPowerKW
              ? `▲ +${(actualData.measuredPowerKW - benchmark.ratedPowerKW).toFixed(1)} kW parasitic overdraw`
              : '✓ Within nominal power envelope'}
          </span>
        </div>

        {/* 3. Specific Energy Consumption Gap */}
        <div className="p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Specific Energy (SEC)</span>
            <Scale className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5 truncate">
            <span className="text-lg font-bold font-mono-num text-slate-900 dark:text-white truncate">
              {actualData.measuredSpecificEnergy.value}
            </span>
            <span className="text-[10px] text-slate-400 font-mono truncate">
              {benchmark.ratedSpecificEnergy.unit}
            </span>
          </div>
          <span className="text-[10px] font-mono text-red-600 dark:text-red-400 mt-0.5 block truncate">
            {actualData.specificEnergyPenaltyPct > 0
              ? `▲ +${actualData.specificEnergyPenaltyPct}% energy intensive`
              : '✓ Matches OEM benchmark'}
          </span>
        </div>

        {/* 4. Avoidable Financial & ESG Loss */}
        <div className="p-3.5 rounded-2xl bg-[#f8fafc] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Annual Avoidable Loss</span>
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-num text-red-600 dark:text-red-400">
              ₹{actualData.annualAvoidableCostINR.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-mono">/yr</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {actualData.annualAvoidableCo2Tons} tCO₂ avoidable emissions
          </span>
        </div>
      </div>

      {/* Main Tab 1: Side-by-Side Performance Comparison Columns */}
      {activeTab === 'sidebyside' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ========================================================================= */}
          {/* COLUMN 1: Manufacturer-Rated Benchmark (OEM Nameplate)                   */}
          {/* ========================================================================= */}
          <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-b from-blue-50/40 via-white to-white dark:from-slate-800/70 dark:via-slate-850 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/40 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              {/* Column Header */}
              <div className="flex items-start justify-between pb-3 border-b border-blue-100 dark:border-blue-900/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold uppercase tracking-wider">
                      OEM Target Standard
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Commissioned: {benchmark.yearOfCommissioning}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Manufacturer-Rated Efficiency Benchmark
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {benchmark.manufacturerName} · {benchmark.modelNumber}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
              </div>

              {/* Certification Banner */}
              <div className="my-3 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 flex items-center gap-2 text-xs font-mono text-blue-900 dark:text-blue-200">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{benchmark.certificationStandard}</span>
              </div>

              {/* OEM Rated Parameters Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* 1. Rated Efficiency */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Rated Efficiency</span>
                  <div className="text-xl font-bold font-mono-num text-blue-600 dark:text-blue-400 mt-0.5">
                    {benchmark.ratedEfficiencyPct}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">IE3 Premium Standard</span>
                </div>

                {/* 2. Rated Power Draw */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Nameplate Power</span>
                  <div className="text-xl font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                    {benchmark.ratedPowerKW} <span className="text-xs text-slate-400 font-normal">kW</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Rated: {benchmark.ratedCurrentA} A (415V)</span>
                </div>

                {/* 3. Rated Specific Energy */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Rated Unit Energy</span>
                  <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                    {benchmark.ratedSpecificEnergy.value}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono truncate block">
                    {benchmark.ratedSpecificEnergy.unit}
                  </span>
                </div>

                {/* 4. Rated Idle Power Limit */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Allowable Standby</span>
                  <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                    &lt; {benchmark.ratedIdlePowerKW} kW
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Max {benchmark.ratedIdlePctOfNominal}% of full load</span>
                </div>

                {/* 5. Power Factor Benchmark */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Rated Power Factor</span>
                  <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                    {benchmark.ratedPowerFactor} cos φ
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Optimal displacement</span>
                </div>

                {/* 6. Vibration & Thermal Tolerance */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Tolerable Limits</span>
                  <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                    &lt; {benchmark.ratedMaxVibrationRMS} mm/s · &lt; {benchmark.ratedMaxTempC}°C
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">ISO 10816-3 Class II</span>
                </div>
              </div>
            </div>

            {/* Benchmark Footer */}
            <div className="pt-3 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Annual Benchmark: {benchmark.annualBenchmarkKWh.toLocaleString('en-IN')} kWh</span>
              <span>PM Cycle: {benchmark.serviceCycleDays} Days</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLUMN 2: Actual Real-Time Measured Telemetry (Retrofit IoT Box)          */}
          {/* ========================================================================= */}
          <div
            className={`p-5 md:p-6 rounded-3xl border shadow-xs space-y-4 flex flex-col justify-between transition-all ${
              actualData.efficiencyHealthRating === 'Critical Failure Risk'
                ? 'bg-gradient-to-b from-red-50/40 via-white to-white dark:from-red-950/20 dark:via-slate-850 dark:to-slate-900 border-red-300 dark:border-red-800/40'
                : actualData.efficiencyHealthRating === 'Degraded'
                ? 'bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-slate-850 dark:to-slate-900 border-amber-300 dark:border-amber-800/40'
                : 'bg-gradient-to-b from-emerald-50/40 via-white to-white dark:from-emerald-950/20 dark:via-slate-850 dark:to-slate-900 border-emerald-300 dark:border-emerald-800/40'
            }`}
          >
            <div>
              {/* Column Header */}
              <div className="flex items-start justify-between pb-3 border-b border-black/5 dark:border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        actualData.efficiencyHealthRating === 'Critical Failure Risk'
                          ? 'bg-red-500 text-white'
                          : actualData.efficiencyHealthRating === 'Degraded'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {actualData.efficiencyHealthRating}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live 1Hz Telemetry
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Actual Measured Shopfloor Performance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    SCT-013 CT Clamp + MPU6050 Vibration + DS18B20 Contact Telemetry
                  </p>
                </div>

                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    actualData.efficiencyHealthRating === 'Critical Failure Risk'
                      ? 'bg-red-500/10 text-red-600'
                      : actualData.efficiencyHealthRating === 'Degraded'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-emerald-500/10 text-emerald-600'
                  }`}
                >
                  <Scale className="w-5 h-5" />
                </div>
              </div>

              {/* Variance Callout Pill */}
              <div
                className={`my-3 p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                  actualData.efficiencyVariancePct < -6
                    ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-300'
                    : actualData.efficiencyVariancePct < -2
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Variance vs OEM Target:</span>
                </div>
                <span className="font-bold font-mono-num text-sm">
                  {actualData.efficiencyVariancePct}% Efficiency Gap
                </span>
              </div>

              {/* Actual Measured Parameters Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* 1. Actual Operating Efficiency */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Actual Efficiency</span>
                  <div
                    className={`text-xl font-bold font-mono-num mt-0.5 ${
                      actualData.measuredEfficiencyPct < benchmark.ratedEfficiencyPct - 5
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {actualData.measuredEfficiencyPct}%
                  </div>
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-mono font-medium">
                    {actualData.efficiencyVariancePct}% below OEM
                  </span>
                </div>

                {/* 2. Actual Power Draw */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Measured Power</span>
                  <div className="text-xl font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                    {actualData.measuredPowerKW} <span className="text-xs text-slate-400 font-normal">kW</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Current: {actualData.measuredCurrentA.toFixed(1)} A ({actualData.currentDiffPct > 0 ? '+' : ''}{actualData.currentDiffPct}%)
                  </span>
                </div>

                {/* 3. Actual Specific Energy */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Measured Specific Energy</span>
                  <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-0.5 truncate">
                    {actualData.measuredSpecificEnergy.value}
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono truncate block">
                    ▲ +{actualData.specificEnergyPenaltyPct}% energy intensive
                  </span>
                </div>

                {/* 4. Actual Idle Power Draw */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Unloaded Idle Draw</span>
                  <div className="text-sm font-bold font-mono-num text-amber-600 dark:text-amber-400 mt-0.5">
                    {actualData.measuredIdlePowerKW} kW
                  </div>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono block">
                    {actualData.idlePowerRatioPct}% of load (Limit: {benchmark.ratedIdlePctOfNominal}%)
                  </span>
                </div>

                {/* 5. Actual Power Factor */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Operating Power Factor</span>
                  <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                    {actualData.measuredPowerFactor} cos φ
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {actualData.measuredPowerFactor < benchmark.ratedPowerFactor ? 'Reactive penalty' : 'Good pf'}
                  </span>
                </div>

                {/* 6. Measured Vibration & Temp */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Measured Dynamics</span>
                  <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-0.5">
                    {actualData.measuredVibrationRMS.toFixed(2)} mm/s · {actualData.measuredTempC.toFixed(1)}°C
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {actualData.measuredVibrationRMS > benchmark.ratedMaxVibrationRMS ? '⚠ Above OEM limit' : '✓ Normal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actual Performance Footer */}
            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Excess Waste: ~{actualData.dailyAvoidableKWh} kWh/day</span>
              <span className="text-red-600 dark:text-red-400 font-semibold">
                Penalty: ₹{actualData.annualAvoidableCostINR.toLocaleString('en-IN')}/yr
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: Metric-by-Metric Visual Comparison Bars */}
      {activeTab === 'metricsbreakdown' && (
        <div className="p-5 rounded-3xl bg-[#fcfcfd] dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span>Direct Normalized Metric Contrasts (OEM Target = 100%)</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              Grey Tick = Manufacturer Nameplate Target
            </span>
          </div>

          {/* Metric 1: Operating Energy Efficiency */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Operating Energy Efficiency</span>
                <span className="text-slate-400 text-[11px] block">IEC 60034-30-1 standard rating</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-blue-600 font-bold">OEM: {benchmark.ratedEfficiencyPct}%</span>
                <span className="mx-2 text-slate-300">vs</span>
                <span className={`font-bold ${actualData.measuredEfficiencyPct < benchmark.ratedEfficiencyPct - 4 ? 'text-red-600' : 'text-emerald-600'}`}>
                  Actual: {actualData.measuredEfficiencyPct}% ({actualData.efficiencyVariancePct}%)
                </span>
              </div>
            </div>

            <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  actualData.efficiencyVariancePct < -6
                    ? 'bg-red-500'
                    : actualData.efficiencyVariancePct < -2
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (actualData.measuredEfficiencyPct / benchmark.ratedEfficiencyPct) * 100)}%` }}
              />
            </div>
          </div>

          {/* Metric 2: Specific Energy Consumption (Lower is better) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Specific Energy Consumption (SEC)</span>
                <span className="text-slate-400 text-[11px] block">{benchmark.ratedSpecificEnergy.unit}</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-blue-600 font-bold">OEM: {benchmark.ratedSpecificEnergy.value}</span>
                <span className="mx-2 text-slate-300">vs</span>
                <span className="text-amber-600 font-bold">
                  Actual: {actualData.measuredSpecificEnergy.value} (+{actualData.specificEnergyPenaltyPct}%)
                </span>
              </div>
            </div>

            <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, 100 / (1 + actualData.specificEnergyPenaltyPct / 100))}%` }}
              />
            </div>
          </div>

          {/* Metric 3: Idle / Standby Power Draw (Lower is better) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Idle Standby Power Dissipation</span>
                <span className="text-slate-400 text-[11px] block">Unloaded spinning loss without production</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-blue-600 font-bold">OEM Limit: &lt; {benchmark.ratedIdlePowerKW} kW</span>
                <span className="mx-2 text-slate-300">vs</span>
                <span className={`font-bold ${actualData.measuredIdlePowerKW > benchmark.ratedIdlePowerKW * 1.5 ? 'text-red-600' : 'text-amber-600'}`}>
                  Actual: {actualData.measuredIdlePowerKW} kW ({actualData.idlePowerRatioPct}%)
                </span>
              </div>
            </div>

            <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  actualData.measuredIdlePowerKW > benchmark.ratedIdlePowerKW * 1.5 ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (actualData.measuredIdlePowerKW / (benchmark.ratedIdlePowerKW * 2.5)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Metric 4: Vibration RMS (Mechanical Health Envelope) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">Vibration Energy Level</span>
                <span className="text-slate-400 text-[11px] block">ISO 10816-3 Class II compliance</span>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-blue-600 font-bold">OEM Limit: &lt; {benchmark.ratedMaxVibrationRMS} mm/s</span>
                <span className="mx-2 text-slate-300">vs</span>
                <span className={`font-bold ${actualData.measuredVibrationRMS > benchmark.ratedMaxVibrationRMS ? 'text-red-600' : 'text-emerald-600'}`}>
                  Actual: {actualData.measuredVibrationRMS.toFixed(2)} mm/s
                </span>
              </div>
            </div>

            <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  actualData.measuredVibrationRMS > benchmark.ratedMaxVibrationRMS ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (actualData.measuredVibrationRMS / (benchmark.ratedMaxVibrationRMS * 1.6)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 3: OEM Alignment & Corrective Action Plan */}
      {activeTab === 'auditreport' && (
        <div className="p-5 rounded-3xl bg-[#fcfcfd] dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Digital Twin Prognostic Root-Cause & OEM Re-Alignment Plan
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Root Cause Diagnostics */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Identified Cause of Benchmark Deviation:</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {actualData.rootCauseAnalysis}
              </p>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/40 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Recommended OEM Alignment Action:</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {actualData.recommendedOEMAlignmentAction}
              </p>
            </div>
          </div>

          {/* Payback & Financial Impact Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-purple-500/10 to-transparent border border-emerald-300/80 dark:border-emerald-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Quantified Return on Investment (ROI):
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Restoring this asset to its {benchmark.ratedEfficiencyPct}% OEM benchmark eliminates {actualData.dailyAvoidableKWh} kWh/day of electrical waste, saving ₹{actualData.annualAvoidableCostINR.toLocaleString('en-IN')}/year and {actualData.annualAvoidableCo2Tons} tCO₂ emissions.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] text-slate-400 font-mono block">Estimated Payback</span>
              <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                &lt; 18 Days
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Scenario Quick-Tester */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-600" />
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Simulate Machine Performance Degradation:
            </span>
            <span className="text-[11px] text-slate-500">
              Test how actual energy & efficiency metrics dynamically diverge from manufacturer rating
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setScenario('normal')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
              scenario === 'normal'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Normal (At OEM Spec)
          </button>
          <button
            onClick={() => setScenario('bearing_degradation')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
              scenario === 'bearing_degradation'
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Bearing Wear (-11.2%)
          </button>
          <button
            onClick={() => setScenario('idle_waste')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
              scenario === 'idle_waste'
                ? 'bg-red-500 text-white border-red-500 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            Idle Waste (2.4x Draw)
          </button>
        </div>
      </div>
    </div>
  );
};
