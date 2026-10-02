import React from 'react';
import { useAIIntelligence, MACHINE_PROFILES } from '../context/AIIntelligenceContext';
import { AIMachineProfileId } from '../types/aiIntelligence';
import { Machine3DInteractiveModel } from '../components/ai-intelligence/Machine3DInteractiveModel';
import { VisualDataConnections } from '../components/ai-intelligence/VisualDataConnections';
import { LiveSensorCards } from '../components/ai-intelligence/LiveSensorCards';
import { LiveMetricCharts } from '../components/ai-intelligence/LiveMetricCharts';
import { ESP32EdgeProcessingBox } from '../components/ai-intelligence/ESP32EdgeProcessingBox';
import { DeviceConnectivityPanel } from '../components/ai-intelligence/DeviceConnectivityPanel';
import { SensorStatusMap } from '../components/ai-intelligence/SensorStatusMap';
import { ScenarioControlBar } from '../components/ai-intelligence/ScenarioControlBar';
import { ProactiveAlertBanner } from '../components/ai-intelligence/ProactiveAlertBanner';
import { MachineCarbonPassportCard } from '../components/carbon/MachineCarbonPassportCard';
import { CarbonAwareMaintenanceBanner } from '../components/carbon/CarbonAwareMaintenanceBanner';
import {
  Gauge,
  BrainCircuit,
  Radio,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Cpu,
  Leaf,
  Layers,
  Activity,
  AlertTriangle,
  Flame,
  Sliders,
} from 'lucide-react';

interface MachineMonitorScreenProps {
  onNavigateToDigitalTwin?: () => void;
  onNavigateToCarbonMonitor?: () => void;
}

export const MachineMonitorScreen: React.FC<MachineMonitorScreenProps> = ({
  onNavigateToDigitalTwin,
  onNavigateToCarbonMonitor,
}) => {
  const {
    selectedProfileId,
    setSelectedProfileId,
    selectedProfile,
    scenario,
    setScenario,
    selectedCarbonPassport,
    isSimulating,
    setIsThresholdModalOpen,
    activeThresholdBreaches,
  } = useAIIntelligence();

  const isNormal = scenario === 'normal';
  const isBearingWear = scenario === 'bearing_degradation';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner (Part 2 Header) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Gauge className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Machine Monitor
              </h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
                AI Machine Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time non-invasive machine condition intelligence · {selectedProfile.name}
            </p>
          </div>
        </div>

        {/* Top Right: SIMULATION MODE + Switchers to AI Twin and Carbon Monitor + Anomaly Thresholds */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>ESP32 Gateway — Connected</span>
            </div>
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 mt-0.5">
              ● SIMULATION MODE · Demo Data
            </span>
          </div>

          <button
            onClick={() => setIsThresholdModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition-all shadow-xs"
            title="Configure Custom Sensitivity Ranges for Vibration, Temp & Current"
          >
            <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Sensitivity Thresholds</span>
            {activeThresholdBreaches && activeThresholdBreaches.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {onNavigateToCarbonMonitor && (
            <button
              onClick={onNavigateToCarbonMonitor}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>Carbon Monitor</span>
            </button>
          )}

          {onNavigateToDigitalTwin && (
            <button
              onClick={onNavigateToDigitalTwin}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Digital Twin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Proactive Threshold Breach Alerts from AI Engine */}
      <ProactiveAlertBanner />

      {/* Interactive Machine Profile Selection Grid */}
      <div className="p-4 md:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Select Machine Profile:</span>
            </span>
            <p className="text-[11px] text-slate-400">
              Adapts 3D visual geometry, sensor baselines, nominal Amps, and carbon intensity
            </p>
          </div>

          {/* Quick Toggle: 'Normal' vs 'Bearing Degradation' */}
          <div className="flex items-center gap-2 p-1 rounded-full bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setScenario('normal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isNormal
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Normal State</span>
            </button>
            <button
              onClick={() => setScenario('bearing_degradation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isBearingWear
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Bearing Degradation</span>
            </button>
          </div>
        </div>

        {/* 5 Machine Profile Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-1">
          {Object.values(MACHINE_PROFILES).map((prof) => {
            const isSelected = selectedProfileId === prof.id;
            return (
              <button
                key={prof.id}
                onClick={() => setSelectedProfileId(prof.id as AIMachineProfileId)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-sm scale-[1.02]'
                    : 'bg-[#fcfcfd] dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? 'bg-emerald-400' : 'bg-slate-400'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-slate-900 dark:text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {prof.nominalCurrentA}A
                  </span>
                </div>
                <div className="text-xs font-bold leading-tight truncate">{prof.name}</div>
                <span
                  className={`text-[10px] block mt-0.5 truncate ${
                    isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400'
                  }`}
                >
                  {prof.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Control Bar (with 75s Demo Runner) */}
      <ScenarioControlBar />

      {/* 3D Machine Digital Twin with Clickable Sensor Pins */}
      <Machine3DInteractiveModel />

      {/* Visual End-to-End Data Connections (Sensor -> ESP32 -> AI Engine) */}
      <VisualDataConnections />

      {/* Live Animated Sensor Readout Cards (Current, Vibration, Temp, Acoustic, Proximity) */}
      <LiveSensorCards />

      {/* 30-Point Live Sliding Window Charts */}
      <LiveMetricCharts />

      {/* Carbon-Aware Predictive Maintenance Warning Callout */}
      <CarbonAwareMaintenanceBanner onServiceAction={() => setScenario('normal')} />

      {/* Embedded Live Machine Carbon Passport */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Machine-Level Carbon Passport ({selectedProfile.name})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live Scope 2 emissions, unit production carbon intensity, and unproductive idle losses
            </p>
          </div>
          {onNavigateToCarbonMonitor && (
            <button
              onClick={onNavigateToCarbonMonitor}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>View Factory Heatmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <MachineCarbonPassportCard passport={selectedCarbonPassport} isDetailed={true} />
      </div>

      {/* ESP32 Edge Sequential Microcontroller Processing Box */}
      <ESP32EdgeProcessingBox />

      {/* Sensor Hardware Disconnect/Reconnect Map & Connectivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SensorStatusMap />
        <DeviceConnectivityPanel />
      </div>
    </div>
  );
};
