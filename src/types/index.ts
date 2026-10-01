export type MachineStatus = 'normal' | 'warning' | 'fault' | 'off';

export type MachineType = 'press' | 'compressor' | 'motor' | 'furnace' | 'other';

export interface SensorTelemetry {
  currentA: number; // Amperes
  powerKW: number; // Kilowatts
  powerFactor: number; // e.g. 0.92
  vibrationRMS: number; // mm/s
  temperatureC: number; // Celsius
  acousticAnomalyScore: number; // 0 - 100%
  goodStrokes?: number;
  blankStrokes?: number;
  totalStrokes?: number;
  dutyCycle: {
    active: number; // %
    idle: number; // %
    off: number; // %
  };
  todayKWh: number;
  weeklyKWh: number;
  monthlyKWh: number;
  idleCostTodayINR: number;
  monthlySavingsINR: number;
}

export interface HotspotInfo {
  id: string;
  name: string;
  hindiName: string;
  type: 'current' | 'vibration' | 'temperature' | 'acoustic' | 'proximity';
  position: [number, number, number];
  value: string;
  status: MachineStatus;
  normalRange: string;
  description: string;
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  boxId: string; // e.g. "SF-IN-8842"
  location: string;
  installationDate: string;
  status: MachineStatus;
  statusMessage: string;
  healthScore: number; // Health score percentage (0-100%) based on simulated vibration and current trends
  telemetry: SensorTelemetry;
  trendData: {
    time: string;
    current: number;
    temp: number;
    vibration: number;
    normalMin: number;
    normalMax: number;
  }[];
}

export interface AlertItem {
  id: string;
  machineId: string;
  machineName: string;
  severity: 'warning' | 'fault';
  code: string;
  title: string;
  plainDescription: string;
  timestamp: string;
  acknowledged: boolean;
  suggestedAction: string;
  costImpactEst?: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'pa' | 'mr' | 'gu' | 'ta' | 'te';

export interface PartReplacement {
  partName: string;
  partNumber?: string;
  quantity: number;
  costINR: number;
}

export interface MaintenanceRecord {
  id: string;
  machineId: string;
  serviceDate: string; // e.g. "2026-09-28"
  technicianName: string;
  technicianRole?: string;
  serviceType: 'routine' | 'emergency' | 'predictive' | 'overhaul';
  technicianNotes: string;
  partReplacements: PartReplacement[];
  totalCostINR: number;
  downtimeHours?: number;
  healthScoreBefore?: number;
  healthScoreAfter?: number;
  nextScheduledDate?: string;
  status: 'completed' | 'in_progress' | 'scheduled';
}

export interface PredictiveHealthResult {
  score: number; // 0 - 100%
  timeToFailureHours: number; // operating hours
  timeToFailureDays: number; // calendar days based on shifts
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  trendSlope: number; // rate of vibration/load degradation
  failureMode: string;
  hindiFailureMode: string;
  preventiveAction: string;
  hindiPreventiveAction: string;
  savingsIfServicedINR: number;
  confidenceScore: number; // e.g. 92%
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickAction?: {
    label: string;
    targetScreen?: string;
    machineId?: string;
  };
}
