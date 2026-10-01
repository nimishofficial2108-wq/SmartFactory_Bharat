import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  Cpu,
  Sliders,
  Filter,
  Layers,
  ShieldCheck,
  Send,
  Zap,
  Activity,
  Thermometer,
  Volume2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const ESP32EdgeProcessingBox: React.FC = () => {
  const { esp32Steps, sensors, selectedProfile } = useAIIntelligence();

  const stepIcons = [Sliders, Filter, Layers, ShieldCheck, Send];

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              ESP32 Edge Microcontroller Processing Architecture
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Live Edge Loop
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sequential on-chip execution pipeline transforming raw sensor signals into AI feature vectors
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono-num bg-[#f7f7f8] dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700">
          <span className="text-slate-400">Firmware:</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold">FreeRTOS v10.4 · Dual Core 240MHz</span>
        </div>
      </div>

      {/* 5-Step Sequential Visual Illuminated Box */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {esp32Steps.map((s, idx) => {
          const Icon = stepIcons[idx] || Cpu;
          const isCurrentActive = s.active;

          return (
            <div
              key={s.step}
              className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                isCurrentActive
                  ? 'bg-slate-900 text-white dark:bg-slate-800 border-slate-800 shadow-md ring-2 ring-emerald-500/20'
                  : 'bg-[#fcfcfd] dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isCurrentActive
                        ? 'bg-emerald-500 text-slate-950 font-black'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    STEP 0{s.step}
                  </span>

                  <Icon
                    className={`w-4 h-4 ${isCurrentActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`}
                  />
                </div>

                <h4
                  className={`text-xs font-bold leading-tight ${
                    isCurrentActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {s.title}
                </h4>
                <p
                  className={`text-[10px] mt-0.5 leading-snug ${
                    isCurrentActive ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {s.subtitle}
                </p>
              </div>

              <div
                className={`mt-3 p-2 rounded-xl text-[10px] font-mono-num leading-tight border ${
                  isCurrentActive
                    ? 'bg-slate-950/80 text-emerald-300 border-slate-700'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/70 dark:border-slate-700/60'
                }`}
              >
                <span className="block text-[9px] text-slate-400 mb-0.5 uppercase tracking-wider font-sans">
                  Edge Output:
                </span>
                <span className="truncate block font-semibold">{s.outputMetric}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw Sensor Ingestion Chips */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Edge Ingest Bus:</span>
          <span className="font-mono text-[11px] text-slate-400">
            SCT-013 (ADC1_CH0) · MPU6050 (I2C_0) · DS18B20 (GPIO4 1-Wire) · MLX90614 (I2C_1) · INMP441 (I2S0)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono-num text-emerald-600 dark:text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Zero Machine Rewiring Required</span>
        </div>
      </div>
    </div>
  );
};
