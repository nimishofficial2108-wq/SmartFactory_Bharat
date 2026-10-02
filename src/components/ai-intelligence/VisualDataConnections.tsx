import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  Cpu,
  Radio,
  Cloud,
  BrainCircuit,
  Bell,
  ArrowRight,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const VisualDataConnections: React.FC = () => {
  const { sensors, connectivity, pipeline, isSimulating } = useAIIntelligence();

  const isAnomaly = pipeline.anomaly.isAnomaly;

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>End-to-End Industrial Telemetry Pipeline</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Non-invasive machine sensors ➔ ESP32 Edge acquisition ➔ AI Engine ➔ Decision Logic
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono-num bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-500">Wi-Fi Telemetry Rate:</span>
          <strong className="text-slate-800 dark:text-slate-200">1.0 Hz (38 ms latency)</strong>
        </div>
      </div>

      {/* Interactive Animated Pipeline Flow Graphic */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* Stage 1: Machine & Sensor Cluster */}
        <div className="p-4 rounded-2xl bg-[#fcfcfd] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-500" />
                Physical Sensors
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 font-mono-num">
                {sensors.filter((s) => s.isOnline).length}/6 Active
              </span>
            </div>

            <div className="space-y-1.5">
              {sensors.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        !s.isOnline
                          ? 'bg-slate-300'
                          : s.status === 'warning' || s.status === 'critical'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="truncate">{s.sensorModel.split(' ')[0]}</span>
                  </div>
                  <span className="font-mono-num font-bold text-slate-800 dark:text-slate-200 text-[10px]">
                    {s.isOnline ? s.value : 'OFFLINE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Analog / I2C / 1-Wire</span>
            <span className="text-emerald-600 font-bold">100% Clip-on</span>
          </div>
        </div>

        {/* Pulse Connector 1 */}
        <div className="hidden md:flex absolute left-[23%] top-1/2 -translate-y-1/2 z-10 items-center justify-center">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[9px] font-mono text-slate-500">I2C / SPI</span>
          </div>
        </div>

        {/* Stage 2: ESP32 Edge Gateway */}
        <div className="p-4 rounded-2xl bg-[#fcfcfd] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                ESP32 Edge Gateway
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono-num">
                ONLINE
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-mono">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Kalman Filter:</span>
                  <span className="text-emerald-600 font-bold">CONVERGED</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Payload Dispatch:</span>
                  <span className="text-slate-800 dark:text-slate-200">MQTT TLS</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-slate-400">Edge Buffer:</span>
                  <span className="text-slate-800 dark:text-slate-200">0 dropped</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Non-Invasive Box</span>
            <span className="text-slate-600 dark:text-slate-300">ESP32-WROOM-32D</span>
          </div>
        </div>

        {/* Pulse Connector 2 */}
        <div className="hidden md:flex absolute left-[48%] top-1/2 -translate-y-1/2 z-10 items-center justify-center">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[9px] font-mono text-slate-500">Wi-Fi / MQTT</span>
          </div>
        </div>

        {/* Stage 3: AI Feature Engine & Anomaly Detection */}
        <div className="p-4 rounded-2xl bg-[#fcfcfd] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-purple-500" />
                AI Analysis Engine
              </span>
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full font-mono-num font-bold ${
                  isAnomaly
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {pipeline.anomaly.status}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 space-y-1.5 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] text-slate-500">Anomaly Index:</span>
                <span
                  className={`font-mono-num font-bold ${
                    isAnomaly ? 'text-amber-600 dark:text-amber-400 text-sm' : 'text-emerald-600'
                  }`}
                >
                  {pipeline.anomaly.scorePct}%
                </span>
              </div>
              <div className="flex justify-between items-baseline text-[11px]">
                <span className="text-slate-500">AI Confidence:</span>
                <span className="font-mono-num font-bold text-slate-800 dark:text-white">
                  {pipeline.decision.confidencePct}%
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Model: Bayesian Fusion</span>
            <span className="text-purple-600 font-bold">Correlated</span>
          </div>
        </div>

        {/* Pulse Connector 3 */}
        <div className="hidden md:flex absolute left-[73%] top-1/2 -translate-y-1/2 z-10 items-center justify-center">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[9px] font-mono text-slate-500">Insights</span>
          </div>
        </div>

        {/* Stage 4: Decision Engine & Alerts */}
        <div
          className={`p-4 rounded-2xl border flex flex-col justify-between transition-colors ${
            isAnomaly
              ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-500/30'
              : 'bg-[#fcfcfd] dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-600" />
                Decision & Action
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">
                Risk: {pipeline.decision.riskLevel}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/60 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block uppercase">
                AI Indication
              </span>
              <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight line-clamp-2">
                {pipeline.decision.probableCause}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Inspection window:</span>
            <span className="text-amber-700 dark:text-amber-300 font-bold truncate">
              {pipeline.decision.suggestedInspectionWindow}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
