import React from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import {
  Wifi,
  Radio,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export const DeviceConnectivityPanel: React.FC = () => {
  const { connectivity, sensors } = useAIIntelligence();

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wifi className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hardware Gateway Connectivity Status
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60 font-semibold">
              Simulated Connectivity
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            ESP32 micro-gateway edge connection, RF signal fidelity and telemetry dispatch health
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ESP32 GATEWAY: ONLINE
          </span>
        </div>
      </div>

      {/* Connectivity Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* 1. ESP32 Gateway */}
        <div className="p-3 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Gateway Core</span>
          <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>ONLINE</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ESP32-WROOM</span>
        </div>

        {/* 2. Wi-Fi Link */}
        <div className="p-3 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Wi-Fi Gateway</span>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span>Connected</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">2.4 GHz 802.11b/g/n</span>
        </div>

        {/* 3. Packet Rate */}
        <div className="p-3 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Telemetry Rate</span>
          <div className="text-base font-bold font-mono-num text-slate-900 dark:text-white mt-1">
            {connectivity.packetRateHz.toFixed(1)} Hz
          </div>
          <span className="text-[10px] text-slate-400 font-mono">1 packet / sec</span>
        </div>

        {/* 4. Roundtrip Latency */}
        <div className="p-3 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Ping Latency</span>
          <div className="text-base font-bold font-mono-num text-emerald-600 dark:text-emerald-400 mt-1">
            {connectivity.latencyMs} ms
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Local Subnet</span>
        </div>

        {/* 5. Data Quality */}
        <div className="p-3 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[10px] text-slate-400 font-mono uppercase block">Payload Integrity</span>
          <div className="text-base font-bold font-mono-num text-slate-900 dark:text-white mt-1">
            {connectivity.dataQualityPct}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">0 CRC check errors</span>
        </div>
      </div>
    </div>
  );
};
