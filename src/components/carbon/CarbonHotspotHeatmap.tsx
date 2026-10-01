import React, { useState } from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  Flame,
  Factory,
  AlertTriangle,
  Leaf,
  Layers,
  Zap,
  Info,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const CarbonHotspotHeatmap: React.FC = () => {
  const {
    carbonPassports,
    selectedProfileId,
    setSelectedProfileId,
    factoryTopHotspotAssetsPct,
    factoryTotalCarbonEmittedKg,
    factoryIdleCarbonLossKg,
  } = useAIIntelligence();

  const [hoveredBay, setHoveredBay] = useState<string | null>(null);

  // Machine intensity mapping
  const getIntensityInfo = (sharePct: number) => {
    if (sharePct >= 30) {
      return {
        level: 'Critical Hotspot',
        badge: 'bg-red-500 text-white',
        halo: 'ring-4 ring-red-500/20 bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-500/40',
        dot: 'bg-red-500 animate-ping',
        color: '#ef4444',
      };
    }
    if (sharePct >= 20) {
      return {
        level: 'Moderate Hotspot',
        badge: 'bg-amber-500 text-white',
        halo: 'ring-4 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/40',
        dot: 'bg-amber-500 animate-pulse',
        color: '#f59e0b',
      };
    }
    return {
      level: 'Low Carbon Footprint',
      badge: 'bg-emerald-500 text-white',
      halo: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40',
      dot: 'bg-emerald-500',
      color: '#10b981',
    };
  };

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Factory Carbon Hotspot Heatmap
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 font-semibold">
              Live Digital Twin Layout
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Spatial energy and carbon intensity gradient (Green ➔ Yellow ➔ Red) across manufacturing bays
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Low (&lt;15%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-500">Moderate (15-30%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-slate-900 dark:text-white font-bold">Critical Hotspot (&gt;30%)</span>
          </div>
        </div>
      </div>

      {/* Prominent High-Impact Finding Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-200/80 dark:border-red-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs md:text-sm font-bold text-red-950 dark:text-red-200 tracking-tight">
              Factory ke 60% carbon emissions sirf 4 major assets se aa rahe hain.
            </h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
              The 4 monitored assets generate {factoryTopHotspotAssetsPct}% of plant emissions ({factoryTotalCarbonEmittedKg} kg CO₂ today). Rotary Screw Compressor alone wastes {factoryIdleCarbonLossKg} kg CO₂ in idle motor spin.
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 font-mono block">Plant Concentration</span>
          <span className="text-xl font-black font-mono-num text-red-600 dark:text-red-400">
            {factoryTopHotspotAssetsPct}%
          </span>
        </div>
      </div>

      {/* Interactive Shopfloor 4-Bay Schematic */}
      <div className="p-4 md:p-6 rounded-3xl bg-[#fcfcfd] dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Factory className="w-4 h-4 text-slate-500" />
            <span>Plant Floor Plan · Pune MIDC Unit 01 (Click bay to inspect machine)</span>
          </span>
          <span>4 Production Bays</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {carbonPassports.map((cp) => {
            const intensity = getIntensityInfo(cp.shareOfPlantEmissionsPct);
            const isSelected = selectedProfileId === cp.profileId;

            return (
              <div
                key={cp.machineId}
                onClick={() => setSelectedProfileId(cp.profileId)}
                onMouseEnter={() => setHoveredBay(cp.bay)}
                onMouseLeave={() => setHoveredBay(null)}
                className={`p-4 md:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  intensity.halo
                } ${
                  isSelected
                    ? 'ring-2 ring-slate-900 dark:ring-white scale-[1.01] shadow-md'
                    : 'hover:scale-[1.005]'
                }`}
              >
                {/* Bay Header */}
                <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${intensity.dot}`} />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {cp.bay}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${intensity.badge}`}
                  >
                    {intensity.level}
                  </span>
                </div>

                {/* Machine Asset Identity */}
                <div className="my-3 flex items-start justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cp.name}
                    </h5>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Box ID: {cp.machineId} · {cp.location}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono-num text-slate-900 dark:text-white block">
                      {cp.shareOfPlantEmissionsPct}%
                    </span>
                    <span className="text-[9px] text-slate-400 uppercase font-mono">
                      Of Factory CO₂
                    </span>
                  </div>
                </div>

                {/* Hotspot Intensity Progress Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, cp.shareOfPlantEmissionsPct * 2.5)}%`,
                        backgroundColor: intensity.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono-num text-slate-500">
                    <span>Emission: {cp.co2EmittedKg} kg CO₂</span>
                    <span>Idle Waste: {cp.idleCarbonLossKg} kg ({cp.idleCarbonLossPct}%)</span>
                  </div>
                </div>

                {/* Hotspot Explanatory Callout */}
                {cp.isHotspot && (
                  <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {cp.hotspotRank === 1
                        ? '48% Unloaded Idle Motor Run (Severe)'
                        : cp.hotspotRank === 2
                        ? 'Hydraulic Blank Stamping Friction'
                        : 'High Thermal Melting Draw'}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
