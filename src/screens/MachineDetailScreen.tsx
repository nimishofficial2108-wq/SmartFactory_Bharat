import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { Machine3DViewer } from '../components/Machine3DViewer';
import { MetricTrendChart } from '../components/MetricTrendChart';
import { PredictiveHealthScore } from '../components/PredictiveHealthScore';
import { MaintenanceLog } from '../components/MaintenanceLog';
import {
  Zap,
  Activity,
  Flame,
  Volume2,
  PieChart,
  Repeat,
  IndianRupee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const MachineDetailScreen: React.FC = () => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    selectedMachine,
    t,
    tariffRateINR,
    language,
  } = useFactory();

  const [activeChartMetric, setActiveChartMetric] = useState<'current' | 'temp' | 'vibration'>('current');

  const { telemetry } = selectedMachine;
  const isPress = selectedMachine.type === 'press';
  const isWarning = selectedMachine.status === 'warning';
  const isFault = selectedMachine.status === 'fault';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Machine Selector Tab Bar (ChatGPT-style clean segmented capsules) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {machines.map((m) => {
          const isSelected = m.id === selectedMachineId;
          const hasWarn = m.status === 'warning';
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMachineId(m.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  hasWarn
                    ? 'bg-amber-500 animate-pulse'
                    : isSelected
                    ? 'bg-emerald-400'
                    : 'bg-emerald-500'
                }`}
              />
              <span>{m.name}</span>
              {hasWarn && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-400 text-amber-900 dark:text-slate-950 px-1.5 py-0.2 rounded font-bold">
                  !
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Machine Header & Cost Impact Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Machine Identity & Status Card */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {selectedMachine.name}
                </h1>

                {/* Predictive Longevity Badge */}
                <PredictiveHealthScore machine={selectedMachine} mode="badge" />

                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                    isFault
                      ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30'
                      : isWarning
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                  }`}
                >
                  {isFault ? t.statusFault : isWarning ? t.statusWarning : t.statusNormal}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Retrofit Box: <strong>{selectedMachine.boxId}</strong> · {selectedMachine.location}
              </p>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-950 text-[11px] font-mono-num text-emerald-700 dark:text-emerald-400 border border-slate-200/80 dark:border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Telemetry
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Diagnosis:</span>
            <span>{selectedMachine.statusMessage}</span>
          </p>
        </div>

        {/* Cost-Impact Strip: ₹ Wasted on Idle Time Today */}
        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              {t.idleCostToday}
            </span>
            <span className="text-[10px] font-mono-num bg-amber-200/70 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-500/30 font-bold">
              TODAY
            </span>
          </div>

          <div className="my-2">
            <div className="text-3xl font-bold font-mono-num text-amber-900 dark:text-amber-300">
              ₹{telemetry.idleCostTodayINR}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {t.idleCostExpl}
            </p>
          </div>

          <div className="pt-2 border-t border-amber-200/80 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono-num text-slate-500 dark:text-slate-400">
            <span>Tariff Rate: ₹{tariffRateINR}/kWh</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              Save up to ₹{(telemetry.idleCostTodayINR * 26).toFixed(0)}/mo
            </span>
          </div>
        </div>
      </div>

      {/* 3D Machine Model Twin Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.machine3DModel}</span>
            <span className="text-xs font-normal text-slate-400">
              ({selectedMachine.type.toUpperCase()})
            </span>
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">
            {t.clickSensorHotspot}
          </span>
        </div>

        <Machine3DViewer machine={selectedMachine} />
      </div>

      {/* Machine Predictive Health & Longevity Prognostics */}
      <PredictiveHealthScore machine={selectedMachine} mode="detailed" />

      {/* Complete Sensor Telemetry Readout Grid */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Real-Time Sensor Telemetry Matrix</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Live Current (A) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.metricCurrent}</span>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {telemetry.currentA.toFixed(1)}
              <span className="text-xs text-amber-600 dark:text-amber-400 ml-1">Amps</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {t.metricCurrentExpl}
            </p>
          </div>

          {/* 2. Active Power (kW) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.metricPower}</span>
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {telemetry.powerKW.toFixed(1)}
              <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1">kW</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {t.metricPowerExpl}
            </p>
          </div>

          {/* 3. Power Factor (cos φ) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.metricPowerFactor}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 font-bold">
                cos φ
              </span>
            </div>
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {telemetry.powerFactor.toFixed(2)}
              <span className="text-xs text-slate-400 ml-1">/ 1.00</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {t.metricPowerFactorExpl}
            </p>
          </div>

          {/* 4. Vibration RMS */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.metricVibration}</span>
              <Activity
                className={`w-4 h-4 ${
                  telemetry.vibrationRMS > 4.5 ? 'text-amber-500 animate-pulse' : 'text-slate-400'
                }`}
              />
            </div>
            <div
              className={`text-2xl font-bold font-mono-num mt-1 ${
                telemetry.vibrationRMS > 4.5 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {telemetry.vibrationRMS.toFixed(2)}
              <span className="text-xs text-slate-400 ml-1">mm/s</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {t.metricVibrationExpl}
            </p>
          </div>

          {/* 5. Surface Temperature */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.metricTemperature}</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {telemetry.temperatureC.toFixed(1)}
              <span className="text-xs text-amber-500 ml-1">°C</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {t.metricTemperatureExpl}
            </p>
          </div>

          {/* 6. Acoustic Anomaly Score */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.metricAcoustic}</span>
              <Volume2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {telemetry.acousticAnomalyScore}
              <span className="text-xs text-slate-400 ml-1">% index</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {t.metricAcousticExpl}
            </p>
          </div>

          {/* 7. Duty Cycle Breakdown */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{t.metricDutyCycle}</span>
              <PieChart className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1 flex items-baseline gap-1">
              <span className="text-emerald-600 dark:text-emerald-400">{telemetry.dutyCycle.active}%</span>
              <span className="text-xs text-slate-400">act /</span>
              <span className="text-amber-600 dark:text-amber-400 text-lg">{telemetry.dutyCycle.idle}%</span>
              <span className="text-xs text-slate-400">idle</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {t.metricDutyCycleExpl}
            </p>
          </div>

          {/* 8. Stroke Counter */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {isPress ? t.metricStrokes : 'Daily Energy (kWh)'}
              </span>
              <Repeat className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {isPress ? (
                <>
                  {telemetry.goodStrokes?.toLocaleString()}
                  <span className="text-xs text-amber-600 dark:text-amber-400 ml-1">
                    (+{telemetry.blankStrokes} blank)
                  </span>
                </>
              ) : (
                <>
                  {telemetry.todayKWh.toFixed(1)}
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1">kWh today</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              {isPress
                ? t.metricStrokesExpl
                : `Week: ${telemetry.weeklyKWh.toFixed(0)} kWh · Month: ${telemetry.monthlyKWh.toFixed(0)} kWh`}
            </p>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Trend Chart */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <span>{t.historicalTrends}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compare current sensor trace against the machine's factory baseline envelope
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setActiveChartMetric('current')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeChartMetric === 'current'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Current (A)
            </button>
            <button
              onClick={() => setActiveChartMetric('temp')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeChartMetric === 'temp'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Temperature (°C)
            </button>
            <button
              onClick={() => setActiveChartMetric('vibration')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeChartMetric === 'vibration'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Vibration RMS
            </button>
          </div>
        </div>

        <MetricTrendChart
          data={selectedMachine.trendData}
          activeMetric={activeChartMetric}
        />
      </div>

      {/* Maintenance & Service Log Section */}
      <MaintenanceLog machine={selectedMachine} />
    </div>
  );
};
