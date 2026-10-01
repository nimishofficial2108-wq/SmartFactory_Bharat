import React, { useState } from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  TrendingUp,
  Zap,
  Thermometer,
  Activity,
  Volume2,
  HeartPulse,
} from 'lucide-react';

export const LiveMetricCharts: React.FC = () => {
  const { telemetryHistory, selectedProfile } = useAIIntelligence();
  const [activeTab, setActiveTab] = useState<'current' | 'temp' | 'vibration' | 'acoustic' | 'health'>('current');

  const history = telemetryHistory.slice(-30);

  // Compute SVG line paths
  const getSvgPath = (values: number[], min: number, max: number, width: number, height: number) => {
    if (values.length < 2) return '';
    const span = max - min || 1;
    const step = width / (values.length - 1);

    const points = values.map((val, idx) => {
      const x = idx * step;
      const normalized = (val - min) / span;
      const y = height - normalized * (height - 20) - 10;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const getSvgArea = (values: number[], min: number, max: number, width: number, height: number) => {
    const line = getSvgPath(values, min, max, width, height);
    if (!line) return '';
    return `${line} L ${width},${height} L 0,${height} Z`;
  };

  const currentValues = history.map((p) => p.currentA);
  const contactTempValues = history.map((p) => p.contactTempC);
  const irTempValues = history.map((p) => p.irTempC);
  const vibValues = history.map((p) => p.vibrationRMS);
  const acousticValues = history.map((p) => p.acousticAnomalyScore);
  const healthValues = history.map((p) => p.healthScore);

  const chartWidth = 680;
  const chartHeight = 180;

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>Live Continuous Trend Visualizer (30-Point Sliding Window)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synchronized sensor parameters updating every 1.5s in real time
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 overflow-x-auto scrollbar-none self-start sm:self-auto">
          {[
            { id: 'current', label: 'Current (A)', icon: Zap },
            { id: 'temp', label: 'Temp (°C)', icon: Thermometer },
            { id: 'vibration', label: 'Vib (mm/s)', icon: Activity },
            { id: 'acoustic', label: 'Acoustic (%)', icon: Volume2 },
            { id: 'health', label: 'Health Score', icon: HeartPulse },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Area */}
      <div className="relative w-full h-52 bg-[#fcfcfd] dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-3 flex flex-col justify-between overflow-hidden">
        {/* Dynamic Chart Display based on Tab */}
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradAmber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartGradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartGradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid horizontal guidelines */}
          <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
          <line x1="0" y1="70" x2={chartWidth} y2="70" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />
          <line x1="0" y1="120" x2={chartWidth} y2="120" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeDasharray="3 3" />

          {/* 1. CURRENT TAB */}
          {activeTab === 'current' && (
            <>
              <path
                d={getSvgArea(currentValues, selectedProfile.nominalCurrentA * 0.7, selectedProfile.nominalCurrentA * 1.6, chartWidth, chartHeight)}
                fill="url(#chartGradAmber)"
              />
              <path
                d={getSvgPath(currentValues, selectedProfile.nominalCurrentA * 0.7, selectedProfile.nominalCurrentA * 1.6, chartWidth, chartHeight)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* 2. TEMPERATURE TAB (Contact vs IR dual trace) */}
          {activeTab === 'temp' && (
            <>
              {/* IR trace (Amber) */}
              <path
                d={getSvgPath(irTempValues, 40, 110, chartWidth, chartHeight)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
              {/* Contact trace (Red/Rose) */}
              <path
                d={getSvgArea(contactTempValues, 40, 110, chartWidth, chartHeight)}
                fill="url(#chartGradRed)"
              />
              <path
                d={getSvgPath(contactTempValues, 40, 110, chartWidth, chartHeight)}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* 3. VIBRATION TAB */}
          {activeTab === 'vibration' && (
            <>
              <path
                d={getSvgArea(vibValues, 0.5, 6.0, chartWidth, chartHeight)}
                fill="url(#chartGradGreen)"
              />
              <path
                d={getSvgPath(vibValues, 0.5, 6.0, chartWidth, chartHeight)}
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* 4. ACOUSTIC TAB */}
          {activeTab === 'acoustic' && (
            <>
              <path
                d={getSvgArea(acousticValues, 0, 100, chartWidth, chartHeight)}
                fill="url(#chartGradAmber)"
              />
              <path
                d={getSvgPath(acousticValues, 0, 100, chartWidth, chartHeight)}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </>
          )}

          {/* 5. HEALTH SCORE TAB */}
          {activeTab === 'health' && (
            <>
              <path
                d={getSvgArea(healthValues, 30, 100, chartWidth, chartHeight)}
                fill="url(#chartGradGreen)"
              />
              <path
                d={getSvgPath(healthValues, 30, 100, chartWidth, chartHeight)}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          )}
        </svg>

        {/* Legend / Range labels overlay */}
        <div className="flex items-center justify-between text-[11px] font-mono-num text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span>Window: 45 seconds (30 pts)</span>
            {activeTab === 'temp' && (
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-red-500 font-semibold">
                  <span className="w-2 h-0.5 bg-red-500 inline-block" /> Contact (DS18B20)
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <span className="w-2 h-0.5 bg-amber-500 border-dashed inline-block" /> IR Optical (MLX90614)
                </span>
              </div>
            )}
          </div>

          <span className="text-slate-600 dark:text-slate-300 font-bold">
            Latest:{' '}
            {activeTab === 'current'
              ? `${history[history.length - 1]?.currentA.toFixed(1)} A`
              : activeTab === 'temp'
              ? `${history[history.length - 1]?.contactTempC.toFixed(1)} °C`
              : activeTab === 'vibration'
              ? `${history[history.length - 1]?.vibrationRMS.toFixed(2)} mm/s`
              : activeTab === 'acoustic'
              ? `${history[history.length - 1]?.acousticAnomalyScore}% Anomaly`
              : `${history[history.length - 1]?.healthScore} / 100`}
          </span>
        </div>
      </div>
    </div>
  );
};
