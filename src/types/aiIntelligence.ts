export type AIMachineProfileId =
  | 'hydraulic_press'
  | 'air_compressor'
  | 'polishing_motor'
  | 'furnace'
  | 'generic_motor';

export interface AIMachineProfileConfig {
  id: AIMachineProfileId;
  name: string;
  subtitle: string;
  nominalCurrentA: number;
  nominalTempC: number;
  nominalVibRMS: number;
  hasProximity: boolean;
  primaryMetrics: string[];
}

export type SimulationScenarioId =
  | 'normal'
  | 'bearing_degradation'
  | 'machine_overload'
  | 'misalignment'
  | 'idle_waste'
  | 'overheating'
  | 'acoustic_anomaly';

export interface SensorNodeState {
  id: 'sct013' | 'mpu6050' | 'ds18b20' | 'mlx90614' | 'inmp441' | 'proximity';
  name: string;
  sensorModel: string;
  mountType: string;
  value: string;
  numericValue: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  isOnline: boolean;
  description: string;
}

export interface TelemetryPoint {
  timestamp: string;
  timeSec: number;
  currentA: number;
  contactTempC: number;
  irTempC: number;
  vibrationRMS: number;
  acousticAnomalyScore: number;
  healthScore: number;
}

export interface ESP32ProcessingStep {
  step: number;
  title: string;
  subtitle: string;
  outputMetric: string;
  active: boolean;
}

export interface AIPipelineState {
  fusion: {
    stateVector: [number, number, number, number, number];
    activeSensorsCount: number;
  };
  features: {
    currentRMS: number;
    currentVariance: number;
    tempRiseRate: number;
    vibrationRMS: number;
    vibrationPeak: number;
    acousticRMS: number;
    acousticSpectralDeviation: number;
    machineCycleTimeSec: number;
  };
  baseline: {
    expectedCurrent: number;
    observedCurrent: number;
    currentDiffPct: number;
    expectedTemp: number;
    observedTemp: number;
    tempDiffPct: number;
    expectedVib: number;
    observedVib: number;
    vibDiffPct: number;
  };
  anomaly: {
    status: 'NORMAL' | 'ELEVATED' | 'ANOMALY DETECTED';
    scorePct: number;
    isAnomaly: boolean;
  };
  decision: {
    probableCause: string;
    confidencePct: number;
    evidence: { metric: string; delta: string }[];
    aiInterpretation: string;
    recommendedActions: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
    suggestedInspectionWindow: string;
  };
}

export interface HealthScoreBreakdown {
  total: number;
  electrical: number;
  mechanical: number;
  thermal: number;
  acoustic: number;
}

export interface EnergyIntelligenceData {
  operatingKW: number;
  idleKW: number;
  detectedIdleMinutes: number;
  potentialKWhSaving: number;
  estimatedDailySavingINR: number;
  estimatedMonthlySavingINR: number;
}

export interface DeviceConnectivityState {
  esp32Status: 'ONLINE' | 'OFFLINE';
  wifiStatus: 'CONNECTED' | 'DISCONNECTED';
  packetRateHz: number;
  latencyMs: number;
  lastPacketSec: number;
  dataQualityPct: number;
}

export interface MachineTimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'alert' | 'success';
}

export interface MachineCarbonPassport {
  machineId: string;
  name: string;
  profileId: AIMachineProfileId;
  location: string;
  bay: string;
  kwhConsumedToday: number;
  co2EmittedKg: number;
  co2PerUnitProduced: {
    value: number;
    unit: string; // e.g. "g CO₂/part", "g CO₂/m³ air", "g CO₂/kg metal"
  };
  idleCarbonLossKg: number;
  idleCarbonLossPct: number; // percentage of machine's emissions wasted in idle
  efficiencyGrade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  efficiencyTrend: 'improving' | 'stable' | 'degrading';
  isHotspot: boolean;
  hotspotRank?: number;
  shareOfPlantEmissionsPct: number;
  // Carbon-aware predictive maintenance fields:
  extraEnergyPctDueToWear: number; // e.g. 9% extra energy
  extraEnergyCostYearINR: number; // e.g. ₹18,000/year avoidable energy cost
  extraCo2TonsYear: number; // e.g. 1.3 tCO₂ extra emissions
  carbonPaybackDaysIfServiced: number;
}

export interface StandardMachinePayload {
  machineId: string;
  profileId: AIMachineProfileId;
  timestamp: string;
  sensors: {
    currentA: number;
    contactTempC: number;
    irTempC: number;
    vibrationRMS: number;
    acousticAnomalyScore: number;
    cycleCount: number;
  };
  healthScore: number;
  anomalyScore: number;
  confidencePct: number;
  state: 'running' | 'idle' | 'off';
  mode: 'SIMULATION';
}

export interface ManufacturerBenchmarkData {
  profileId: AIMachineProfileId;
  machineName: string;
  manufacturerName: string;
  modelNumber: string;
  yearOfCommissioning: number;
  certificationStandard: string;
  ratedPowerKW: number;
  ratedCurrentA: number;
  ratedEfficiencyPct: number;
  ratedSpecificEnergy: {
    value: number;
    unit: string;
  };
  ratedIdlePowerKW: number;
  ratedIdlePctOfNominal: number;
  ratedPowerFactor: number;
  ratedMaxVibrationRMS: number;
  ratedMaxTempC: number;
  annualBenchmarkKWh: number;
  serviceCycleDays: number;
}

export interface ActualPerformanceData {
  measuredPowerKW: number;
  measuredCurrentA: number;
  currentDiffPct: number;
  measuredEfficiencyPct: number;
  efficiencyVariancePct: number; // e.g. -11.2%
  measuredSpecificEnergy: {
    value: number;
    unit: string;
  };
  specificEnergyPenaltyPct: number;
  measuredIdlePowerKW: number;
  idlePowerRatioPct: number;
  measuredPowerFactor: number;
  measuredVibrationRMS: number;
  measuredTempC: number;
  dailyAvoidableKWh: number;
  annualAvoidableCostINR: number;
  annualAvoidableCo2Tons: number;
  efficiencyHealthRating: 'Optimal' | 'Degraded' | 'Critical Failure Risk';
  rootCauseAnalysis: string;
  recommendedOEMAlignmentAction: string;
}

export interface MachineThresholdConfig {
  profileId: AIMachineProfileId;
  vibrationWarningRMS: number; // mm/s
  vibrationCriticalRMS: number; // mm/s
  tempWarningC: number; // °C
  tempCriticalC: number; // °C
  currentWarningA: number; // A
  currentCriticalA: number; // A
  sensitivityMode: 'high' | 'medium' | 'low' | 'custom';
  autoProactiveAlerts: boolean;
  minDurationSeconds: number;
}

export interface ThresholdBreachAlert {
  id: string;
  profileId: AIMachineProfileId;
  machineName: string;
  metric: 'vibration' | 'temperature' | 'current';
  metricLabel: string;
  sensorModel: string;
  observedValue: number;
  unit: string;
  thresholdValue: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  timeAgo: string;
  probableCause: string;
  proactiveRecommendation: string;
  estimatedCostImpactINR: number;
  urgencyWindow: string;
}


