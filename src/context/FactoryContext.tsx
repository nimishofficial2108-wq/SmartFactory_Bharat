import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Machine,
  AlertItem,
  SupportedLanguage,
  ChatMessage,
  PredictiveHealthResult,
  MaintenanceRecord,
} from '../types';
import { translations, TranslationDictionary } from '../i18n/translations';

interface FactoryContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  machines: Machine[];
  selectedMachineId: string;
  setSelectedMachineId: (id: string) => void;
  selectedMachine: Machine;
  alerts: AlertItem[];
  acknowledgeAlert: (alertId: string) => void;
  tariffRateINR: number;
  setTariffRateINR: (rate: number) => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  isAiThinking: boolean;
  addMachine: (newMachine: Machine) => void;
  disconnectMachine: (machineId: string) => void;
  renameMachine: (machineId: string, newName: string) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  replayPreloader: () => void;
  showPreloader: boolean;
  currentNav: string;
  setCurrentNav: (nav: string) => void;
  getPredictiveHealth: (machine: Machine) => PredictiveHealthResult;
  calculateMachineHealthScore: (
    vibrationRMS: number,
    currentA: number,
    trendData: { vibration: number; current: number; normalMax?: number }[],
    status: Machine['status'],
    isServiced?: boolean
  ) => number;
  servicedMachineIds: string[];
  simulateService: (machineId: string) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  maintenanceLogs: MaintenanceRecord[];
  addMaintenanceRecord: (record: Omit<MaintenanceRecord, 'id'>) => void;
}

export function calculateMachineHealthScore(
  vibrationRMS: number,
  currentA: number,
  trendData: { vibration: number; current: number; normalMax?: number }[],
  status: Machine['status'],
  isServiced: boolean = false
): number {
  if (isServiced) return 98;
  if (status === 'fault') return 34;

  let vibSlope = 0;
  if (trendData && trendData.length >= 2) {
    const first = trendData[0].vibration;
    const last = trendData[trendData.length - 1].vibration;
    vibSlope = (last - first) / trendData.length;
  }

  let currentDeviation = 0;
  if (trendData && trendData.length >= 2) {
    const avgCurrent = trendData.reduce((acc, p) => acc + p.current, 0) / trendData.length;
    currentDeviation = Math.max(0, (currentA - avgCurrent) / (avgCurrent || 40));
  }

  const vibPenalty = Math.max(0, (vibrationRMS - 1.8) / 2.5) * 36;
  const slopePenalty = Math.max(0, vibSlope * 20);
  const currentPenalty = currentDeviation * 24;

  let score = 100 - (vibPenalty + slopePenalty + currentPenalty);
  if (status === 'warning') score = Math.min(score, 68);
  if (status === 'normal' && score < 85) score = 88;

  return Math.max(12, Math.min(99, Math.round(score)));
}

const INITIAL_MACHINES: Machine[] = [
  {
    id: 'm1',
    name: 'Hydraulic Press 200T (Deep Draw)',
    type: 'press',
    boxId: 'SF-IN-8842',
    location: 'Bay 1 · Stamping Section, Pune MIDC',
    installationDate: '2026-03-12',
    status: 'normal',
    statusMessage: 'Operating within safe thermal and vibration baseline',
    healthScore: 94,
    telemetry: {
      currentA: 42.4,
      powerKW: 24.8,
      powerFactor: 0.92,
      vibrationRMS: 2.1,
      temperatureC: 52.4,
      acousticAnomalyScore: 4,
      goodStrokes: 1420,
      blankStrokes: 38,
      totalStrokes: 1458,
      dutyCycle: { active: 68, idle: 22, off: 10 },
      todayKWh: 168.4,
      weeklyKWh: 940.2,
      monthlyKWh: 3820.0,
      idleCostTodayINR: 380,
      monthlySavingsINR: 14200,
    },
    trendData: [
      { time: '06:00', current: 12.0, temp: 28.0, vibration: 1.1, normalMin: 10, normalMax: 48 },
      { time: '08:00', current: 38.5, temp: 42.0, vibration: 1.9, normalMin: 10, normalMax: 48 },
      { time: '10:00', current: 43.1, temp: 48.5, vibration: 2.2, normalMin: 10, normalMax: 48 },
      { time: '12:00', current: 41.8, temp: 51.0, vibration: 2.0, normalMin: 10, normalMax: 48 },
      { time: '14:00', current: 14.2, temp: 45.0, vibration: 1.2, normalMin: 10, normalMax: 48 },
      { time: '16:00', current: 44.0, temp: 53.2, vibration: 2.3, normalMin: 10, normalMax: 48 },
      { time: '18:00', current: 42.4, temp: 52.4, vibration: 2.1, normalMin: 10, normalMax: 48 },
    ],
  },
  {
    id: 'm2',
    name: 'Rotary Screw Compressor 45kW',
    type: 'compressor',
    boxId: 'SF-IN-9104',
    location: 'Utility Room North · Chakan Plant',
    installationDate: '2026-04-05',
    status: 'warning',
    statusMessage: 'Vibration RMS 4.8 mm/s elevated during unload cycle',
    healthScore: 68,
    telemetry: {
      currentA: 58.6,
      powerKW: 38.2,
      powerFactor: 0.88,
      vibrationRMS: 4.8,
      temperatureC: 68.2,
      acousticAnomalyScore: 28,
      dutyCycle: { active: 44, idle: 48, off: 8 },
      todayKWh: 245.8,
      weeklyKWh: 1480.0,
      monthlyKWh: 6100.5,
      idleCostTodayINR: 1120,
      monthlySavingsINR: 8400,
    },
    trendData: [
      { time: '06:00', current: 22.0, temp: 32.0, vibration: 2.4, normalMin: 15, normalMax: 55 },
      { time: '08:00', current: 54.0, temp: 58.0, vibration: 3.8, normalMin: 15, normalMax: 55 },
      { time: '10:00', current: 59.2, temp: 64.0, vibration: 4.6, normalMin: 15, normalMax: 55 },
      { time: '12:00', current: 24.5, temp: 62.0, vibration: 3.1, normalMin: 15, normalMax: 55 },
      { time: '14:00', current: 57.0, temp: 66.5, vibration: 4.7, normalMin: 15, normalMax: 55 },
      { time: '16:00', current: 60.1, temp: 69.0, vibration: 5.0, normalMin: 15, normalMax: 55 },
      { time: '18:00', current: 58.6, temp: 68.2, vibration: 4.8, normalMin: 15, normalMax: 55 },
    ],
  },
  {
    id: 'm3',
    name: 'Polishing & Deburring Motor 15HP',
    type: 'motor',
    boxId: 'SF-IN-7320',
    location: 'Finishing Line 2 · Surface Prep',
    installationDate: '2026-05-18',
    status: 'normal',
    statusMessage: 'Steady harmonic load, balanced phase current',
    healthScore: 92,
    telemetry: {
      currentA: 18.6,
      powerKW: 10.4,
      powerFactor: 0.94,
      vibrationRMS: 1.6,
      temperatureC: 44.0,
      acousticAnomalyScore: 2,
      dutyCycle: { active: 74, idle: 16, off: 10 },
      todayKWh: 76.5,
      weeklyKWh: 420.0,
      monthlyKWh: 1740.0,
      idleCostTodayINR: 190,
      monthlySavingsINR: 6800,
    },
    trendData: [
      { time: '06:00', current: 0.0, temp: 24.0, vibration: 0.2, normalMin: 5, normalMax: 22 },
      { time: '08:00', current: 18.0, temp: 36.0, vibration: 1.5, normalMin: 5, normalMax: 22 },
      { time: '10:00', current: 18.8, temp: 42.0, vibration: 1.6, normalMin: 5, normalMax: 22 },
      { time: '12:00', current: 8.0, temp: 39.0, vibration: 0.8, normalMin: 5, normalMax: 22 },
      { time: '14:00', current: 18.4, temp: 43.5, vibration: 1.7, normalMin: 5, normalMax: 22 },
      { time: '16:00', current: 19.0, temp: 45.0, vibration: 1.6, normalMin: 5, normalMax: 22 },
      { time: '18:00', current: 18.6, temp: 44.0, vibration: 1.6, normalMin: 5, normalMax: 22 },
    ],
  },
  {
    id: 'm4',
    name: 'Medium Induction Furnace 100kW',
    type: 'furnace',
    boxId: 'SF-IN-6218',
    location: 'Foundry Section South · Billet Heating',
    installationDate: '2026-02-28',
    status: 'normal',
    statusMessage: 'Coil temperature stable, power factor high',
    healthScore: 96,
    telemetry: {
      currentA: 88.5,
      powerKW: 74.0,
      powerFactor: 0.95,
      vibrationRMS: 1.2,
      temperatureC: 78.5,
      acousticAnomalyScore: 5,
      dutyCycle: { active: 82, idle: 12, off: 6 },
      todayKWh: 482.0,
      weeklyKWh: 2890.0,
      monthlyKWh: 11400.0,
      idleCostTodayINR: 620,
      monthlySavingsINR: 21500,
    },
    trendData: [
      { time: '06:00', current: 30.0, temp: 45.0, vibration: 0.8, normalMin: 20, normalMax: 95 },
      { time: '08:00', current: 85.0, temp: 72.0, vibration: 1.1, normalMin: 20, normalMax: 95 },
      { time: '10:00', current: 90.0, temp: 78.0, vibration: 1.3, normalMin: 20, normalMax: 95 },
      { time: '12:00', current: 84.0, temp: 76.0, vibration: 1.1, normalMin: 20, normalMax: 95 },
      { time: '14:00', current: 89.0, temp: 79.0, vibration: 1.2, normalMin: 20, normalMax: 95 },
      { time: '16:00', current: 88.0, temp: 80.0, vibration: 1.3, normalMin: 20, normalMax: 95 },
      { time: '18:00', current: 88.5, temp: 78.5, vibration: 1.2, normalMin: 20, normalMax: 95 },
    ],
  },
];

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-1',
    machineId: 'm2',
    machineName: 'Rotary Screw Compressor 45kW',
    severity: 'warning',
    code: 'VIB-WARN-4.8',
    title: 'High Vibration RMS on Unload Cycle',
    plainDescription: 'Vibration reached 4.8 mm/s (normal is below 4.5 mm/s). Likely belt slack or worn drive damper.',
    timestamp: '14 mins ago',
    acknowledged: false,
    suggestedAction: 'Check belt tension and rubber anti-vibration mount pads.',
    costImpactEst: 'Potential bearing failure if unaddressed (~₹22,000 replacement).',
  },
  {
    id: 'alt-2',
    machineId: 'm2',
    machineName: 'Rotary Screw Compressor 45kW',
    severity: 'warning',
    code: 'IDLE-ENERGY-48PCT',
    title: 'Excessive Motor Idle Running (48% of Shift)',
    plainDescription: 'Compressor ran unloaded for 3.4 hours with no pneumatic tool demand. Motor wasted electricity.',
    timestamp: '1 hour ago',
    acknowledged: false,
    suggestedAction: 'Enable automatic shutdown timer on compressor or check pneumatic line leaks in Bay 2.',
    costImpactEst: '₹1,120 wasted in electricity today alone.',
  },
  {
    id: 'alt-3',
    machineId: 'm1',
    machineName: 'Hydraulic Press 200T',
    severity: 'warning',
    code: 'BLANK-STROKE-38',
    title: 'Blank Strokes Detected (38 Unproductive Hits)',
    plainDescription: 'Ram completed pressing cycle without blank sheet metal loaded between dies.',
    timestamp: '3 hours ago',
    acknowledged: true,
    suggestedAction: 'Calibrate foot-pedal lockout sensor or review operator cycle timing.',
    costImpactEst: 'Die tool wear + ₹85 idle hydraulic pressure cycle loss.',
  },
];

const INITIAL_MAINTENANCE_LOGS: MaintenanceRecord[] = [
  // Machine 1: Hydraulic Press 200T
  {
    id: 'maint-1',
    machineId: 'm1',
    serviceDate: '12 Aug 2026',
    technicianName: 'Ramesh Patil',
    technicianRole: 'Senior Hydraulics Specialist',
    serviceType: 'routine',
    technicianNotes: 'Hydraulic oil flushed and replenished with ISO VG 68. Proportional valve seals inspected. Minor seepage at main cylinder gland packing tightened. Pressure relief valve calibrated to 210 bar.',
    partReplacements: [
      { partName: 'High-Pressure Gland O-Ring Kit', partNumber: 'SKF-902', quantity: 1, costINR: 3200 },
      { partName: 'Hydraulic Oil (Servo System 68)', partNumber: 'IOC-VG68', quantity: 40, costINR: 8800 },
      { partName: 'Return Line Suction Filter Element', partNumber: 'HY-200T-04', quantity: 1, costINR: 2200 },
    ],
    totalCostINR: 14200,
    downtimeHours: 3.5,
    healthScoreBefore: 82,
    healthScoreAfter: 94,
    nextScheduledDate: '12 Nov 2026',
    status: 'completed',
  },
  {
    id: 'maint-2',
    machineId: 'm1',
    serviceDate: '04 May 2026',
    technicianName: 'Sunil Sharma',
    technicianRole: 'Tooling & Alignment Engineer',
    serviceType: 'overhaul',
    technicianNotes: 'Platen bed parallelism checked (+-0.03mm across 1200mm platen). Ram guide phosphor bronze gibs adjusted to eliminate backlash. Calibrated inductive proximity sensor for blank stroke detection.',
    partReplacements: [
      { partName: 'Phosphor Bronze Wear Plates (Set of 4)', partNumber: 'PB-12-BRZ', quantity: 4, costINR: 18500 },
      { partName: 'M18 Inductive Proximity Sensor', partNumber: 'Omron E2E-X5', quantity: 2, costINR: 4200 },
      { partName: 'High-Tension Die Mounting Studs', partNumber: 'M24-GR10.9', quantity: 8, costINR: 5800 },
    ],
    totalCostINR: 28500,
    downtimeHours: 6.0,
    healthScoreBefore: 74,
    healthScoreAfter: 91,
    nextScheduledDate: '04 Aug 2026',
    status: 'completed',
  },

  // Machine 2: Rotary Screw Compressor 45kW
  {
    id: 'maint-3',
    machineId: 'm2',
    serviceDate: '28 Sep 2026',
    technicianName: 'Vikas Gaikwad',
    technicianRole: 'Pneumatics Field Service Eng',
    serviceType: 'predictive',
    technicianNotes: 'Vibration spike diagnosed at 4.8 mm/s due to drive belt slack and pulley misalignment. Laser alignment performed. Recommended belt replacement & rubber vibration damper replacement before 15 Oct.',
    partReplacements: [
      { partName: 'Synthetic Poly-V Drive Belt', partNumber: 'ContiTech 8PK-1860', quantity: 1, costINR: 6500 },
      { partName: 'Air/Oil Separator Spin-on Filter', partNumber: 'MANN-LB13145', quantity: 1, costINR: 7600 },
      { partName: 'Neoprene Anti-Vibration Foot Bushings', partNumber: 'AV-M16-HD', quantity: 4, costINR: 4800 },
    ],
    totalCostINR: 18900,
    downtimeHours: 2.0,
    healthScoreBefore: 64,
    healthScoreAfter: 76,
    nextScheduledDate: '15 Oct 2026',
    status: 'completed',
  },
  {
    id: 'maint-4',
    machineId: 'm2',
    serviceDate: '15 Jun 2026',
    technicianName: 'Amit Kulkarni',
    technicianRole: 'Compressor Maintenance Tech',
    serviceType: 'routine',
    technicianNotes: '2000-hour periodic PM completed. Synthetic compressor lubricant replaced. Unloader solenoid valve coil tested for resistance (38.5 Ω, nominal). Intake air filter cleaned.',
    partReplacements: [
      { partName: 'Fully Synthetic Compressor Lubricant 20L', partNumber: 'Roto-Inject Ultra', quantity: 1, costINR: 8400 },
      { partName: 'Oil Filter Cartridge', partNumber: 'AC-16136105', quantity: 1, costINR: 2800 },
      { partName: 'Heavy-Duty Air Intake Filter Element', partNumber: 'C-15300', quantity: 1, costINR: 1200 },
    ],
    totalCostINR: 12400,
    downtimeHours: 2.5,
    healthScoreBefore: 78,
    healthScoreAfter: 92,
    nextScheduledDate: '15 Sep 2026',
    status: 'completed',
  },

  // Machine 3: High-Speed Stirring Motor 15HP
  {
    id: 'maint-5',
    machineId: 'm3',
    serviceDate: '02 Sep 2026',
    technicianName: 'Rajesh Shinde',
    technicianRole: 'Certified Industrial Electrician',
    serviceType: 'predictive',
    technicianNotes: 'Bearing lubrication and electrical insulation assessment. Megger test showed 450 MΩ winding resistance. Bearings flushed and repacked with high-temperature Klüber grease.',
    partReplacements: [
      { partName: 'Deep Groove Ball Bearings (Drive End)', partNumber: 'SKF 6308-2Z/C3', quantity: 2, costINR: 4200 },
      { partName: 'Klüber Isoflex Synthetic Grease Tube', partNumber: 'Topas NB52', quantity: 1, costINR: 1800 },
      { partName: 'Silicone IP65 Terminal Box Gasket', partNumber: 'TB-GASKET-15HP', quantity: 1, costINR: 800 },
    ],
    totalCostINR: 6800,
    downtimeHours: 1.5,
    healthScoreBefore: 84,
    healthScoreAfter: 96,
    nextScheduledDate: '02 Dec 2026',
    status: 'completed',
  },

  // Machine 4: Medium Induction Furnace 100kW
  {
    id: 'maint-6',
    machineId: 'm4',
    serviceDate: '22 Jul 2026',
    technicianName: 'Mahendra Verma',
    technicianRole: 'Thermal Systems Specialist',
    serviceType: 'overhaul',
    technicianNotes: 'Induction coil internal cooling channels de-scaled using dilute sulfamic acid flush. Cooling water flow rate restored to 120 LPM. Refractory crucible lining patched with high-alumina ramming mass.',
    partReplacements: [
      { partName: 'High-Temperature Silicon Water Hose Set', partNumber: 'SIL-HOSE-32MM', quantity: 6, costINR: 12400 },
      { partName: 'Alumina Ramming Refractory Mix (50kg Bag)', partNumber: 'RAM-AL92', quantity: 2, costINR: 16000 },
      { partName: 'Type-K Mineral Insulated Thermocouple', partNumber: 'TC-K-1200C', quantity: 2, costINR: 5600 },
    ],
    totalCostINR: 34000,
    downtimeHours: 8.0,
    healthScoreBefore: 72,
    healthScoreAfter: 92,
    nextScheduledDate: '22 Oct 2026',
    status: 'completed',
  },
];

const FactoryContext = createContext<FactoryContextType | undefined>(undefined);

export const FactoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [machines, setMachines] = useState<Machine[]>(INITIAL_MACHINES);
  const [selectedMachineId, setSelectedMachineId] = useState<string>('m1');
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [tariffRateINR, setTariffRateINR] = useState<number>(8.5); // ₹8.50 per unit kWh
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [showPreloader, setShowPreloader] = useState<boolean>(true);
  const [currentNav, setCurrentNav] = useState<string>('dashboard');
  const [servicedMachineIds, setServicedMachineIds] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE_LOGS);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const addMaintenanceRecord = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRecord: MaintenanceRecord = {
      ...record,
      id: `maint-${Date.now()}`,
    };
    setMaintenanceLogs((prev) => [newRecord, ...prev]);

    // If service was completed, also boost machine health
    if (record.status === 'completed') {
      simulateService(record.machineId);
    }
  };

  // Mock Predictive Algorithm inside FactoryContext:
  // Trends vibration and current data over time from historical trend points
  const getPredictiveHealth = (machine: Machine): PredictiveHealthResult => {
    const isServiced = servicedMachineIds.includes(machine.id);

    if (isServiced) {
      return {
        score: 98,
        timeToFailureHours: 4200,
        timeToFailureDays: 262,
        riskLevel: 'low',
        trendSlope: 0.02,
        failureMode: 'Optimal - Routine service completed',
        hindiFailureMode: 'उत्कृष्ट स्थिति - हाल ही में सर्विस की गई',
        preventiveAction: 'Next scheduled routine check in 90 days.',
        hindiPreventiveAction: 'अगली नियमित जांच 90 दिनों बाद निर्धारित है।',
        savingsIfServicedINR: 0,
        confidenceScore: 96,
      };
    }

    const { telemetry, trendData, type } = machine;
    const { vibrationRMS, currentA, temperatureC, acousticAnomalyScore } = telemetry;

    // 1. Trend analysis of vibration over time (rate of mechanical degradation)
    let vibSlope = 0;
    if (trendData && trendData.length >= 2) {
      const first = trendData[0].vibration;
      const last = trendData[trendData.length - 1].vibration;
      vibSlope = (last - first) / trendData.length;
    }

    // 2. Trend analysis of current draw over time (overload / winding strain)
    let currentDeviation = 0;
    if (trendData && trendData.length >= 2) {
      const avgCurrent = trendData.reduce((acc, p) => acc + p.current, 0) / trendData.length;
      const normalMax = trendData[0].normalMax || 50;
      currentDeviation = Math.max(0, (currentA - avgCurrent) / normalMax);
    }

    // 3. Composite longevity calculation (0 - 100%)
    const vibImpact = Math.max(0, (vibrationRMS - 1.8) / 2.8) * 38;
    const currentImpact = currentDeviation * 20;
    const acousticImpact = (acousticAnomalyScore / 100) * 18;
    const thermalImpact = temperatureC > 60 ? (temperatureC - 60) * 1.1 : 0;
    const trendImpact = vibSlope > 0 ? vibSlope * 16 : 0;

    let rawScore = 100 - (vibImpact + currentImpact + acousticImpact + thermalImpact + trendImpact);

    if (machine.status === 'warning') rawScore = Math.min(rawScore, 68);
    if (machine.status === 'fault') rawScore = Math.min(rawScore, 36);
    if (machine.status === 'normal' && rawScore < 84) rawScore = 91;

    const score = Math.max(12, Math.min(99, Math.round(rawScore)));

    // 4. Time to Failure Forecast
    let timeToFailureHours: number;
    let riskLevel: PredictiveHealthResult['riskLevel'];

    if (score >= 86) {
      timeToFailureHours = 3600 + Math.round((score - 86) * 100);
      riskLevel = 'low';
    } else if (score >= 70) {
      timeToFailureHours = 720 + Math.round((score - 70) * 60);
      riskLevel = 'moderate';
    } else if (score >= 50) {
      timeToFailureHours = 240 + Math.round((score - 50) * 18);
      riskLevel = 'high';
    } else {
      timeToFailureHours = Math.max(18, Math.round(score * 3.5));
      riskLevel = 'critical';
    }

    const timeToFailureDays = Math.max(1, Math.round(timeToFailureHours / 16)); // 16h 2-shift day

    // 5. Failure Mode & Preventive Action
    let failureMode = 'Nominal operational wear on mechanical linkages';
    let hindiFailureMode = 'सामान्य टूट-फूट - सभी पुर्जे सुरक्षित दायरे में';
    let preventiveAction = 'Regular scheduled lubrication at next planned shift change.';
    let hindiPreventiveAction = 'अगले निर्धारित समय पर नियमित ग्रीसिंग व तेल बदलना पर्याप्त है।';
    let savingsIfServicedINR = 9000;

    if (type === 'compressor' || machine.id === 'm2') {
      failureMode = 'Rotary screw bearing race fatigue & V-belt tension slack';
      hindiFailureMode = 'स्क्रू बेयरिंग में घिसाव और V-बेल्ट ढीला होना';
      preventiveAction = 'Retension compressor drive belts and grease motor drive-end (DE) bearing.';
      hindiPreventiveAction = 'ड्राइव बेल्ट को कसें और मोटर बेयरिंग में हाई-टेम्परेचर ग्रीस डालें।';
      savingsIfServicedINR = 38000;
    } else if (type === 'press') {
      failureMode = 'Hydraulic ram guide bush friction & valve chatter';
      hindiFailureMode = 'हाइड्रोलिक रैम गाइड बुश में घर्षण व वाल्व कम्पन';
      preventiveAction = 'Inspect hydraulic oil filter particle count and inspect platen gib clearance.';
      hindiPreventiveAction = 'हाइड्रोलिक तेल का फिल्टर बदलें और रैम गाइड की क्लीयरेंस जांचें।';
      savingsIfServicedINR = 54000;
    } else if (type === 'motor') {
      failureMode = 'Rotor dynamic imbalance & end-shield bearing race wear';
      hindiFailureMode = 'रोटर असंतुलन और मोटर बेयरिंग घिसना';
      preventiveAction = 'Check shaft alignment with dial gauge and inspect motor foot mounting bolts.';
      hindiPreventiveAction = 'शाफ्ट अलाइनमेंट जांचें और मोटर के बेस बोल्ट कसें।';
      savingsIfServicedINR = 22000;
    } else if (type === 'furnace') {
      failureMode = 'Induction coil water-cooling scale buildup';
      hindiFailureMode = 'इंडक्शन कॉइल में पानी के स्केलिंग के कारण गर्मी बढ़ना';
      preventiveAction = 'Flush cooling manifold descaling agent and check thyristor phase current.';
      hindiPreventiveAction = 'कूलिंग पाइप की डी-स्केलिंग करें और करंट संतुलन जांचें।';
      savingsIfServicedINR = 65000;
    }

    return {
      score,
      timeToFailureHours,
      timeToFailureDays,
      riskLevel,
      trendSlope: +vibSlope.toFixed(2),
      failureMode,
      hindiFailureMode,
      preventiveAction,
      hindiPreventiveAction,
      savingsIfServicedINR,
      confidenceScore: 94,
    };
  };

  const simulateService = (machineId: string) => {
    setServicedMachineIds((prev) =>
      prev.includes(machineId) ? prev.filter((id) => id !== machineId) : [...prev, machineId]
    );
  };

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'नमस्ते! मैं आपका SmartFactory AI सहायक हूँ। आप अपनी किसी भी मशीन, बिजली खपत या खराबी के बारे में सरल हिंदी या अंग्रेजी में पूछ सकते हैं।',
      timestamp: 'Just now',
    },
  ]);

  const t = translations[language] || translations.en;

  // Selected Machine helper
  const selectedMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((item) => (item.id === alertId ? { ...item, acknowledged: true } : item))
    );
  };

  // Add new paired machine
  const addMachine = (newMachine: Machine) => {
    setMachines((prev) => [newMachine, ...prev]);
    setSelectedMachineId(newMachine.id);
  };

  // Disconnect machine
  const disconnectMachine = (machineId: string) => {
    setMachines((prev) => prev.filter((m) => m.id !== machineId));
    if (selectedMachineId === machineId) {
      const remaining = machines.filter((m) => m.id !== machineId);
      if (remaining.length > 0) setSelectedMachineId(remaining[0].id);
    }
  };

  // Rename machine
  const renameMachine = (machineId: string, newName: string) => {
    setMachines((prev) =>
      prev.map((m) => (m.id === machineId ? { ...m, name: newName } : m))
    );
  };

  // Replay preloader
  const replayPreloader = () => {
    setShowPreloader(true);
    setTimeout(() => setShowPreloader(false), 1900);
  };

  // Initial preloader timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Live telemetry pulse simulation (every 2.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setMachines((prev) =>
        prev.map((m) => {
          if (m.status === 'off') return m;
          // small natural jitter (±1.5%)
          const jitter = (Math.random() - 0.48) * 0.03;
          const newCurrent = Math.max(1, +(m.telemetry.currentA * (1 + jitter)).toFixed(1));
          const newPower = +(newCurrent * 0.58).toFixed(1);
          const newVib = Math.max(0.5, +(m.telemetry.vibrationRMS + (Math.random() - 0.49) * 0.08).toFixed(2));
          const newTemp = +(m.telemetry.temperatureC + (Math.random() - 0.49) * 0.1).toFixed(1);
          
          let strokes = m.telemetry.goodStrokes;
          let total = m.telemetry.totalStrokes;
          if (m.type === 'press' && Math.random() > 0.4) {
            strokes = (strokes || 1420) + 1;
            total = (total || 1458) + 1;
          }

          // Dynamic calculation of health score based on simulated vibration and current trends
          const dynamicHealthScore = calculateMachineHealthScore(
            newVib,
            newCurrent,
            m.trendData,
            m.status,
            servicedMachineIds.includes(m.id)
          );

          return {
            ...m,
            healthScore: dynamicHealthScore,
            telemetry: {
              ...m.telemetry,
              currentA: newCurrent,
              powerKW: newPower,
              vibrationRMS: newVib,
              temperatureC: newTemp,
              goodStrokes: strokes,
              totalStrokes: total,
            },
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Smart AI response logic (handles queries in English and Indian languages)
  const sendChatMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAiThinking(true);

    setTimeout(() => {
      let replyText = '';
      let quickAction = undefined;
      const lower = text.toLowerCase();

      if (lower.includes('warning') || lower.includes('alert') || lower.includes('चेतावनी') || lower.includes('खराबी') || lower.includes('problem') || lower.includes('2')) {
        replyText =
          language === 'hi'
            ? 'मशीन 2 (रोटरी स्क्रू कंप्रेसर 45kW) में कंपन 4.8 mm/s तक पहुँच गया है जो सामान्य सीमा (4.5 mm/s) से अधिक है। इसके अलावा आज यह 48% समय खाली चला जिससे लगभग ₹1,120 की बिजली व्यर्थ हुई। बेल्ट की कसावट जाँचने और ऑटो-शटडाउन टाइमर चालू करने की सलाह है।'
            : 'Machine 2 (Rotary Screw Compressor 45kW) has a vibration warning at 4.8 mm/s (safe limit is 4.5 mm/s) and spent 48% of shift time idling unloaded, costing ~₹1,120 in wasted electricity today. Recommendation: inspect drive belt tension and enable auto-unload stop timer.';
        quickAction = {
          label: language === 'hi' ? 'कंप्रेसर 3D और डेटा देखें' : 'Inspect Compressor 3D & Telemetry',
          targetScreen: 'machines',
          machineId: 'm2',
        };
      } else if (lower.includes('save') || lower.includes('बचत') || lower.includes('cost') || lower.includes('रुपये') || lower.includes('पैसे') || lower.includes('bill')) {
        replyText =
          language === 'hi'
            ? `इस महीने SmartFactory बॉक्स ने अनचाहे खाली चलने को रोककर और लोड संतुलन से कुल ₹50,900 की अनुमानित बिजली बचत कराई है। आज कारखाने में कुल खाली चलने से नुकसान ₹2,310 रहा (बिजली दर ₹${tariffRateINR}/यूनिट पर आधारित)।`
            : `Across your 4 retrofitted machines, SmartFactory has saved an estimated ₹50,900 this month by curbing idle motor running and power factor drops. Today's total idle waste across the shopfloor is ₹2,310 (based on your ₹${tariffRateINR}/kWh tariff).`;
        quickAction = {
          label: language === 'hi' ? 'बचत व ऑडिट रिपोर्ट देखें' : 'View Energy & Savings Audit',
          targetScreen: 'reports',
        };
      } else if (lower.includes('vibration') || lower.includes('कंपन') || lower.includes('rms') || lower.includes('shake')) {
        replyText =
          language === 'hi'
            ? 'Vibration RMS (कंपन) मोटर या मशीन के हिलने की गति बताता है। जब बेयरिंग घिस जाते हैं या नट-बोल्ट ढीले होते हैं, तो कंपन बढ़ता है। हमारे मैग्नेटिक सेंसर इसे तुरंत पकड़ लेते हैं ताकि मोटर जलने से पहले रोकी जा सके।'
            : 'Vibration RMS measures the velocity of mechanical shake on the motor housing. A sudden spike indicates bearing fatigue, unbalance, or loose mounting bolts. Detecting this early prevents catastrophic motor burnout.';
      } else if (lower.includes('connect') || lower.includes('जोड़ें') || lower.includes('pair') || lower.includes('new box') || lower.includes('नया')) {
        replyText =
          language === 'hi'
            ? 'नया स्मार्टफैक्ट्री बॉक्स जोड़ना बहुत आसान है! बस बॉक्स को मशीन के लोहे के फ्रेम पर मैग्नेट से चिपकाएं, करंट क्लैंप लगाएं और "नया बॉक्स जोड़ें" स्क्रीन पर जाएं।'
            : 'Pairing a new box takes zero machine rewiring. Snap the magnetic enclosure to the machine frame, clip the split-core CT clamp over any phase wire, and use the "Pair New Box" wizard.';
        quickAction = {
          label: language === 'hi' ? 'नया बॉक्स जोड़ें' : 'Pair New Box Now',
          targetScreen: 'pair',
        };
      } else if (
        lower.includes('maint') ||
        lower.includes('service') ||
        lower.includes('सर्विस') ||
        lower.includes('रखरखाव') ||
        lower.includes('part') ||
        lower.includes('technician') ||
        lower.includes('पार्ट')
      ) {
        replyText =
          language === 'hi'
            ? 'मशीन डिटेल स्क्रीन में नया "Maintenance Log" सक्रिय है! आप सभी मशीनों के पिछले सर्विस रिकॉर्ड्स, तकनीशियन नोट्स, बदले गए स्पेयर पार्ट्स (जैसे O-रिंग, ड्राइव बेल्ट, बेयरिंग) और कुल खर्च (₹) देख सकते हैं और नया सर्विस लॉग भी दर्ज कर सकते हैं।'
            : 'The Maintenance Log section is active in the Machine Detail screen! You can track past service dates, technician diagnosis notes, replaced spare parts (O-rings, belts, bearings), and record new service events with instant health score updates.';
        quickAction = {
          label: language === 'hi' ? 'सर्विस व मेंटेनेंस लॉग देखें' : 'View Machine Maintenance Log',
          targetScreen: 'machines',
          machineId: 'm1',
        };
      } else {
        replyText =
          language === 'hi'
            ? `आपकी 4 मशीनें जुड़ी हुई हैं। वर्तमान में 3 मशीनें पूरी तरह सामान्य हैं और 1 मशीन (कंप्रेसर 45kW) पर ध्यान देने की आवश्यकता है। आज की कुल बिजली खपत ${(168.4 + 245.8 + 76.5 + 482.0).toFixed(0)} kWh है।`
            : `All 4 retrofitted machines are currently reporting live telemetry over Wi-Fi. 3 are healthy and 1 (Compressor 45kW) requires attention. Total plant energy consumption today is ${(168.4 + 245.8 + 76.5 + 482.0).toFixed(0)} kWh.`;
      }

      const assistantMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickAction,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      setIsAiThinking(false);
    }, 600);
  };

  return (
    <FactoryContext.Provider
      value={{
        language,
        setLanguage,
        t,
        machines,
        selectedMachineId,
        setSelectedMachineId,
        selectedMachine,
        alerts,
        acknowledgeAlert,
        tariffRateINR,
        setTariffRateINR,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        chatMessages,
        sendChatMessage,
        isAiThinking,
        addMachine,
        disconnectMachine,
        renameMachine,
        isOnboardingOpen,
        setIsOnboardingOpen,
        replayPreloader,
        showPreloader,
        currentNav,
        setCurrentNav,
        getPredictiveHealth,
        calculateMachineHealthScore,
        servicedMachineIds,
        simulateService,
        theme,
        toggleTheme,
        maintenanceLogs,
        addMaintenanceRecord,
      }}
    >
      {children}
    </FactoryContext.Provider>
  );
};

export const useFactory = () => {
  const context = useContext(FactoryContext);
  if (!context) throw new Error('useFactory must be used within a FactoryProvider');
  return context;
};
