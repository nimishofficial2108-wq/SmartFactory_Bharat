import React, { useEffect, useRef } from 'react';
import { useAIIntelligence } from '../../context/AIIntelligenceContext';
import { Sparkline } from '../Sparkline';
import {
  Zap,
  Activity,
  Thermometer,
  Flame,
  Volume2,
  Repeat,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const LiveSensorCards: React.FC = () => {
  const { sensors, selectedProfile, telemetryHistory, scenario } = useAIIntelligence();

  const currentTrend = telemetryHistory.map((p) => p.currentA);
  const vibTrend = telemetryHistory.map((p) => p.vibrationRMS);

  const currentSensor = sensors.find((s) => s.id === 'sct013')!;
  const vibSensor = sensors.find((s) => s.id === 'mpu6050')!;
  const contactTempSensor = sensors.find((s) => s.id === 'ds18b20')!;
  const irTempSensor = sensors.find((s) => s.id === 'mlx90614')!;
  const acousticSensor = sensors.find((s) => s.id === 'inmp441')!;
  const proximitySensor = sensors.find((s) => s.id === 'proximity')!;

  const isCurrentWarn = currentSensor.status === 'warning' || currentSensor.status === 'critical';
  const isVibWarn = vibSensor.status === 'warning' || vibSensor.status === 'critical';
  const isAcousticWarn = acousticSensor.status === 'warning' || acousticSensor.status === 'critical';

  // Animated Acoustic Canvas Waveform
  const acousticCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = acousticCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;
      offset += 0.15;

      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Audio wave
      const isHighAnomaly = isAcousticWarn || scenario === 'acoustic_anomaly';
      ctx.strokeStyle = isHighAnomaly ? '#f59e0b' : '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const amplitude = isHighAnomaly ? height * 0.38 : height * 0.18;
      const freq = isHighAnomaly ? 0.08 : 0.04;

      for (let x = 0; x < width; x++) {
        const y =
          height / 2 +
          Math.sin(x * freq + offset) * amplitude * 0.7 +
          Math.sin(x * 0.12 - offset * 1.5) * (amplitude * 0.3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isAcousticWarn, scenario]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Live Sensor Node Cluster Readouts</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time telemetry streams from external non-invasive sensor hardware
          </p>
        </div>

        <span className="text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs">
          Sampling @ 1000 Hz
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. SCT-013 CURRENT SENSOR */}
        <div
          className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between ${
            isCurrentWarn
              ? 'border-amber-300 dark:border-amber-500/40'
              : 'border-[#00000010] dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>SCT-013 Current Sensor</span>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  !currentSensor.isOnline
                    ? 'bg-slate-100 text-slate-400'
                    : isCurrentWarn
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {!currentSensor.isOnline ? 'OFFLINE' : isCurrentWarn ? 'ELEVATED' : 'NORMAL'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">External Split-Core CT Clamp</p>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
                  {currentSensor.numericValue.toFixed(1)}
                  <span className="text-xs text-amber-600 dark:text-amber-400 ml-1 font-normal">A</span>
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Load: {Math.min(100, Math.round((currentSensor.numericValue / selectedProfile.nominalCurrentA) * 85))}%
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-mono mb-1">Trace</span>
                <Sparkline data={currentTrend} color={isCurrentWarn ? '#f59e0b' : '#10b981'} width={85} height={28} />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-num text-slate-500">
            <span>Machine State:</span>
            <strong className="text-slate-800 dark:text-slate-200">
              {currentSensor.numericValue < 5 ? 'Off' : scenario === 'idle_waste' ? 'Idle (Unloaded)' : 'Running (Loaded)'}
            </strong>
          </div>
        </div>

        {/* 2. MPU6050 VIBRATION SENSOR */}
        <div
          className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between ${
            isVibWarn
              ? 'border-amber-300 dark:border-amber-500/40'
              : 'border-[#00000010] dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>MPU6050 Vibration</span>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  !vibSensor.isOnline
                    ? 'bg-slate-100 text-slate-400'
                    : isVibWarn
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {!vibSensor.isOnline ? 'OFFLINE' : isVibWarn ? 'WARNING' : 'NORMAL'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Magnetic Base Tri-Axial Mount</p>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
                  {vibSensor.numericValue.toFixed(2)}
                  <span className="text-xs text-slate-400 ml-1 font-normal">mm/s</span>
                </span>
                <span className="text-[11px] text-slate-400 block font-mono">
                  Dominant Peak: 48.2 Hz (1X RPM)
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-mono mb-1">Trend</span>
                <Sparkline data={vibTrend} color={isVibWarn ? '#f59e0b' : '#10b981'} width={85} height={28} />
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-num text-slate-500">
            <span>Vibration Health:</span>
            <strong className={isVibWarn ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
              {isVibWarn ? '72% (Degraded)' : '94% (Good)'}
            </strong>
          </div>
        </div>

        {/* 3. TEMPERATURE SENSORS: DS18B20 vs MLX90614 */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span>Contact vs Optical IR Temp</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                Dual Probe
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">DS18B20 Probe & MLX90614 IR</p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-mono block">Contact (DS18B20)</span>
                <span className="text-xl font-bold font-mono-num text-slate-900 dark:text-white mt-0.5 block">
                  {contactTempSensor.numericValue.toFixed(1)}°C
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Bearing shell</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 font-mono block">Optical IR (MLX)</span>
                <span className="text-xl font-bold font-mono-num text-amber-700 dark:text-amber-400 mt-0.5 block">
                  {irTempSensor.numericValue.toFixed(1)}°C
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Spinning shaft</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-num text-slate-500">
            <span>Thermal Gradient (ΔT):</span>
            <strong className="text-slate-800 dark:text-slate-200">
              +{(irTempSensor.numericValue - contactTempSensor.numericValue).toFixed(1)}°C (Nominal)
            </strong>
          </div>
        </div>

        {/* 4. INMP441 ACOUSTIC SOUND SENSOR */}
        <div
          className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between ${
            isAcousticWarn
              ? 'border-amber-300 dark:border-amber-500/40'
              : 'border-[#00000010] dark:border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Volume2 className="w-4 h-4 text-purple-500" />
                <span>INMP441 Acoustic Signal</span>
              </div>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  !acousticSensor.isOnline
                    ? 'bg-slate-100 text-slate-400'
                    : isAcousticWarn
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                Anomaly: {acousticSensor.numericValue}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">I2S Digital MEMS Microphone</p>

            {/* Live Waveform Canvas */}
            <div className="mt-3 h-14 w-full bg-[#f8fafc] dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800 flex items-center justify-center relative">
              <canvas ref={acousticCanvasRef} width={280} height={56} className="w-full h-full" />
              <div className="absolute right-2 bottom-1 text-[9px] font-mono text-slate-400 bg-white/70 dark:bg-slate-900/70 px-1 rounded">
                Live Waveform
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-num text-slate-500">
            <span>Spectral Noise Floor:</span>
            <strong className={isAcousticWarn ? 'text-amber-600 font-bold' : 'text-slate-800 dark:text-slate-200'}>
              {isAcousticWarn ? 'High Harmonic Squeal' : '-62 dBFS (Nominal)'}
            </strong>
          </div>
        </div>

        {/* 5. NPN PROXIMITY / CYCLE COUNTER */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <Repeat className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Part / Cycle Counter</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                {selectedProfile.hasProximity ? 'Active Sensor' : 'Simulated'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Inductive Proximity Sensor M18</p>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
                  {selectedProfile.hasProximity ? proximitySensor.numericValue.toLocaleString() : 'N/A'}
                  <span className="text-xs text-slate-400 ml-1 font-normal">hits</span>
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-mono font-medium">
                  {selectedProfile.hasProximity ? '22 cycles / min rate' : 'Continuous Motor Run'}
                </span>
              </div>

              <div className="text-right font-mono-num">
                <span className="text-[10px] text-slate-400 block uppercase">Efficiency</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">96.8%</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-num text-slate-500">
            <span>Shift Target (5,000):</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
              </div>
              <strong className="text-slate-800 dark:text-slate-200">85%</strong>
            </div>
          </div>
        </div>

        {/* 6. ESP32 HARDWARE HEALTH CARD */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ESP32 Box Diagnostic</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                100% ONLINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Microcontroller Core & Transceiver</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono-num">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">CPU Core 0/1</span>
                <span className="font-bold text-slate-800 dark:text-white">240 MHz</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Wi-Fi RSSI</span>
                <span className="font-bold text-emerald-600">-58 dBm</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-num text-slate-500">
            <span>Uptime:</span>
            <strong className="text-slate-800 dark:text-slate-200">18h 42m (0 reboots)</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
