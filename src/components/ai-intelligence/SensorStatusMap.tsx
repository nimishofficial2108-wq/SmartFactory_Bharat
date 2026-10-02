import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  Radio,
  Power,
  PowerOff,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const SensorStatusMap: React.FC = () => {
  const { sensors, toggleSensorOnline, pipeline, selectedProfile } = useAIIntelligence();

  const missingSensors = sensors.filter((s) => !s.isOnline);

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sensor Node Hardware Map & Fault Injection
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click any sensor chip to test one-click disconnect/reconnect and observe dynamic AI confidence adjustments
          </p>
        </div>

        {/* AI Confidence Dynamic Gauge */}
        <div className="flex items-center gap-3 p-1.5 pl-3.5 pr-2 rounded-full bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">AI Confidence</span>
            <span className="text-sm font-bold font-mono-num text-slate-900 dark:text-white">
              {pipeline.decision.confidencePct}%
            </span>
          </div>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              pipeline.decision.confidencePct >= 80
                ? 'bg-emerald-500 text-white'
                : pipeline.decision.confidencePct >= 65
                ? 'bg-amber-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {pipeline.decision.confidencePct >= 80 ? '✓' : '!'}
          </div>
        </div>
      </div>

      {/* Sensor Chips Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
        {sensors.map((sensor) => {
          const isOnline = sensor.isOnline;
          const isOptional = sensor.id === 'proximity' && !selectedProfile.hasProximity;

          return (
            <div
              key={sensor.id}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                !isOnline
                  ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-700 opacity-60'
                  : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      !isOnline
                        ? 'bg-slate-400'
                        : isOptional
                        ? 'bg-slate-400'
                        : 'bg-emerald-500 animate-pulse'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                      !isOnline
                        ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        : isOptional
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {isOptional ? 'OPTIONAL' : isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {sensor.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {sensor.sensorModel.split(' ')[0]}
                </div>
              </div>

              {/* One-Click Disconnect / Reconnect Button */}
              <button
                type="button"
                onClick={() => toggleSensorOnline(sensor.id)}
                className={`mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[10px] font-semibold transition-all ${
                  isOnline
                    ? 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 dark:bg-slate-700 dark:hover:bg-red-950/40 dark:text-slate-300'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                }`}
              >
                {isOnline ? (
                  <>
                    <PowerOff className="w-3 h-3 text-slate-400" />
                    <span>Disconnect</span>
                  </>
                ) : (
                  <>
                    <Power className="w-3 h-3" />
                    <span>Reconnect</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* AI Confidence Explanation Banner */}
      {missingSensors.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/40 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">
              AI Confidence reduced to {pipeline.decision.confidencePct}%:
            </span>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
              Sensor {missingSensors.map((s) => s.sensorModel.split(' ')[0]).join(', ')} is currently offline. The AI Decision Engine continues inference via remaining telemetry channels with reduced model certainty.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
