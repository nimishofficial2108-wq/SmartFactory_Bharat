import React from 'react';
import { useAIIntelligence } from '../context/AIIntelligenceContext';
import { Machine3DInteractiveModel } from '../components/ai-intelligence/Machine3DInteractiveModel';
import { AIPipelineFlow } from '../components/ai-intelligence/AIPipelineFlow';
import { AIDecisionLogicTree } from '../components/ai-intelligence/AIDecisionLogicTree';
import { HealthScoreGauges } from '../components/ai-intelligence/HealthScoreGauges';
import { EnergyIntelligenceCard } from '../components/ai-intelligence/EnergyIntelligenceCard';
import { ManufacturerBenchmarkComparison } from '../components/ai-intelligence/ManufacturerBenchmarkComparison';
import { SensorStatusMap } from '../components/ai-intelligence/SensorStatusMap';
import { MachineEventTimeline } from '../components/ai-intelligence/MachineEventTimeline';
import { ScenarioControlBar } from '../components/ai-intelligence/ScenarioControlBar';
import { DeviceConnectivityPanel } from '../components/ai-intelligence/DeviceConnectivityPanel';
import { ProactiveAlertBanner } from '../components/ai-intelligence/ProactiveAlertBanner';
import {
  BrainCircuit,
  Gauge,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Sliders,
} from 'lucide-react';

interface AIDigitalTwinScreenProps {
  onNavigateToMonitor?: () => void;
  onNavigateToCarbonMonitor?: () => void;
}

export const AIDigitalTwinScreen: React.FC<AIDigitalTwinScreenProps> = ({
  onNavigateToMonitor,
  onNavigateToCarbonMonitor,
}) => {
  const { selectedProfile, pipeline, setIsThresholdModalOpen, activeThresholdBreaches } = useAIIntelligence();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner (Part 8 Header) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <BrainCircuit className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                AI Digital Twin
              </h1>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/60 font-semibold">
                Control Centre
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Interactive simulation, multi-sensor AI processing, decision-making & predictive inference
            </p>
          </div>
        </div>

        {/* Top Right: SIMULATION MODE + Switch to Machine Monitor + Configure Thresholds */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>AI Engine Active</span>
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

          {onNavigateToMonitor && (
            <button
              onClick={onNavigateToMonitor}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Gauge className="w-3.5 h-3.5 text-emerald-300" />
              <span>Machine Monitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Proactive Threshold Breach Alerts from AI Engine */}
      <ProactiveAlertBanner />

      {/* Profile & Fault Scenario Controller Bar with 75s Demo Runner */}
      <ScenarioControlBar />

      {/* 3D Machine Digital Twin with Sensor Pins */}
      <Machine3DInteractiveModel />

      {/* Multi-Stage AI Processing Pipeline (Fusion -> Features -> Baseline -> Anomaly) */}
      <AIPipelineFlow />

      {/* Visual Live AI Decision Logic Tree (Attribution, Evidence, Confidence & Actions) */}
      <AIDecisionLogicTree />

      {/* Composite Health Score Gauges & Predictive Maintenance Risk Window */}
      <HealthScoreGauges />

      {/* Energy Intelligence & Idle Consumption Savings */}
      <EnergyIntelligenceCard />

      {/* Side-by-Side Performance Comparison: Actual Energy vs Manufacturer-Rated Benchmark */}
      <ManufacturerBenchmarkComparison />

      {/* Sensor Hardware Disconnect Map & Live Chronological Event Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SensorStatusMap />
        <MachineEventTimeline />
      </div>

      {/* Connectivity Status */}
      <DeviceConnectivityPanel />
    </div>
  );
};
