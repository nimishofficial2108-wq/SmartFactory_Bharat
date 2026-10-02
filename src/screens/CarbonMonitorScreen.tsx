import React, { useState } from 'react';
import { useAIIntelligence } from '../context/AIIntelligenceContext';
import { CarbonHotspotHeatmap } from '../components/carbon/CarbonHotspotHeatmap';
import { MachineCarbonPassportCard } from '../components/carbon/MachineCarbonPassportCard';
import { CarbonAwareMaintenanceBanner } from '../components/carbon/CarbonAwareMaintenanceBanner';
import { generateCarbonPdfReport } from '../utils/generateCarbonPdfReport';
import {
  Leaf,
  Factory,
  Flame,
  Zap,
  TrendingDown,
  Gauge,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileDown,
  Printer,
  Sparkles,
} from 'lucide-react';

interface CarbonMonitorScreenProps {
  onNavigateToMonitor?: () => void;
  onNavigateToDigitalTwin?: () => void;
}

export const CarbonMonitorScreen: React.FC<CarbonMonitorScreenProps> = ({
  onNavigateToMonitor,
  onNavigateToDigitalTwin,
}) => {
  const {
    carbonPassports,
    selectedCarbonPassport,
    setSelectedProfileId,
    factoryTotalCarbonEmittedKg,
    factoryIdleCarbonLossKg,
    factoryTopHotspotAssetsPct,
    indiaGridEmissionFactor,
    carbonPredictiveNotice,
    scenario,
    setScenario,
  } = useAIIntelligence();

  const [filterHotspotOnly, setFilterHotspotOnly] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const displayedPassports = filterHotspotOnly
    ? carbonPassports.filter((p) => p.isHotspot)
    : carbonPassports;

  const handleDownloadReport = () => {
    setIsExporting(true);
    try {
      generateCarbonPdfReport({
        carbonPassports,
        factoryTotalCarbonEmittedKg,
        factoryIdleCarbonLossKg,
        factoryTopHotspotAssetsPct,
        indiaGridEmissionFactor,
        carbonPredictiveNotice,
      });
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setIsExporting(false);
      }, 3000);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner: Plant Carbon Passport & ESG Readiness */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white border border-[#00000012] dark:border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider flex items-center gap-1">
              <Leaf className="w-3 h-3 text-emerald-400" />
              Scope 2 Industrial Carbon Passport
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              India CEA Grid Factor: {indiaGridEmissionFactor} kg CO₂/kWh
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Plant Carbon Monitor & Hotspot Intelligence</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Machine-level carbon passports, spatial hotspot heatmap, and carbon-aware predictive maintenance for Indian manufacturing SMEs.
          </p>
        </div>

        {/* Action Buttons: Navigate to Machine Monitor & Export Report */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToMonitor && (
            <button
              onClick={onNavigateToMonitor}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Machine Monitor</span>
            </button>
          )}

          {onNavigateToDigitalTwin && (
            <button
              onClick={onNavigateToDigitalTwin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Digital Twin</span>
            </button>
          )}

          <button
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-75"
          >
            <Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>
              {downloadSuccess
                ? 'PDF Report Downloaded!'
                : isExporting
                ? 'Generating PDF...'
                : 'Download Report'}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-950 text-emerald-400 font-mono font-bold">
              PDF
            </span>
          </button>
        </div>
      </div>

      {/* 4 Plant Carbon KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* 1. Total Plant CO2 Today */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>Plant Carbon (Today)</span>
            <Leaf className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {factoryTotalCarbonEmittedKg}
              <span className="text-xs text-slate-400 font-normal ml-1">kg CO₂</span>
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono-num font-medium flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" />
              CEA Grid Linked
            </span>
          </div>
        </div>

        {/* 2. Idle Carbon Waste */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>Idle Carbon Loss</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono-num text-amber-600 dark:text-amber-400 mt-1">
              {factoryIdleCarbonLossKg}
              <span className="text-xs text-slate-400 font-normal ml-1">kg CO₂</span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono-num font-medium mt-1 block">
              21.2% wasted unloaded!
            </span>
          </div>
        </div>

        {/* 3. Top 4 Asset Concentration */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>Top Asset Concentration</span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono-num text-red-600 dark:text-red-400 mt-1">
              {factoryTopHotspotAssetsPct}%
            </div>
            <span className="text-[11px] text-slate-500 font-mono-num mt-1 block">
              Concentrated in 4 assets
            </span>
          </div>
        </div>

        {/* 4. ESG BRSR Readiness */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>Audit Readiness</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-1">
              ISO 50001
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-medium mt-1 block">
              SEBI BRSR Scope 2 Ready
            </span>
          </div>
        </div>
      </div>

      {/* Feature 1: Carbon Hotspot Heatmap (Factory Layout) */}
      <CarbonHotspotHeatmap />

      {/* Feature 2: Carbon-Aware Predictive Maintenance Comparison */}
      <CarbonAwareMaintenanceBanner onServiceAction={() => setScenario('normal')} />

      {/* Feature 3: Machine-Level Carbon Passports Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Machine-Level Carbon Passports</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Disproportionate carbon emission tracking: kWh consumed, kg CO₂ emitted, unit production footprint, and idle loss
            </p>
          </div>

          {/* Filter Hotspots Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterHotspotOnly(false)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                !filterHotspotOnly
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
              }`}
            >
              All Assets ({carbonPassports.length})
            </button>
            <button
              onClick={() => setFilterHotspotOnly(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                filterHotspotOnly
                  ? 'bg-red-500 text-white border-red-500 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Flame className="w-3 h-3 text-red-500" />
              <span>Hotspots Only ({carbonPassports.filter((p) => p.isHotspot).length})</span>
            </button>
          </div>
        </div>

        {/* Grid of Passports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedPassports.map((passport) => (
            <MachineCarbonPassportCard
              key={passport.machineId}
              passport={passport}
              onSelectMachine={(profId) => setSelectedProfileId(profId as any)}
            />
          ))}
        </div>
      </div>

      {/* Dedicated PDF Export & Audit Report Card */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-br from-white via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileDown className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Download Certified Carbon & Energy Efficiency Audit Report
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                ISO 50001 & SEBI BRSR Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Export an official Scope 2 industrial greenhouse gas (GHG) summary PDF with machine-level telemetry, spatial hotspot analysis, and quantifiable maintenance ROI.
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-75 shrink-0"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>
              {downloadSuccess
                ? 'Report Downloaded Successfully!'
                : isExporting
                ? 'Generating PDF Document...'
                : 'Download Report'}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-950 text-emerald-400 font-mono font-bold">
              PDF
            </span>
          </button>
        </div>

        {/* Content Checklist of What's inside the PDF */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Plant Scope 2 Summary</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Total kWh, kg CO₂ emitted (@ {indiaGridEmissionFactor} kg/kWh CEA), and idle wasted units.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Hotspot Heatmap Audit</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Detailed proof that {factoryTopHotspotAssetsPct}% of plant emissions stem from 4 primary assets.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>All Machine Passports</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Individual machine breakdowns with specific unit footprints and efficiency ratings (A+ to D).
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Predictive Rupee & Carbon ROI</span>
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Avoidable ₹18,000/yr electricity costs and 1.3 tCO₂ reduction through early servicing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
