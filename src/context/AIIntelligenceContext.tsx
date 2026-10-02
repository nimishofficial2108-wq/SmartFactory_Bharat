import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  AIMachineProfileId,
  AIMachineProfileConfig,
  SimulationScenarioId,
  SensorNodeState,
  TelemetryPoint,
  ESP32ProcessingStep,
  AIPipelineState,
  HealthScoreBreakdown,
  EnergyIntelligenceData,
  DeviceConnectivityState,
  MachineTimelineEvent,
  StandardMachinePayload,
  MachineCarbonPassport,
  MachineThresholdConfig,
  ThresholdBreachAlert,
} from '../types/aiIntelligence';

export const DEFAULT_THRESHOLDS: Record<AIMachineProfileId, MachineThresholdConfig> = {
  hydraulic_press: {
    profileId: 'hydraulic_press',
    vibrationWarningRMS: 3.4,
    vibrationCriticalRMS: 4.6,
    tempWarningC: 72.0,
    tempCriticalC: 84.0,
    currentWarningA: 21.5,
    currentCriticalA: 26.0,
    sensitivityMode: 'medium',
    autoProactiveAlerts: true,
    minDurationSeconds: 2,
  },
  air_compressor: {
    profileId: 'air_compressor',
    vibrationWarningRMS: 4.2,
    vibrationCriticalRMS: 5.4,
    tempWarningC: 82.0,
    tempCriticalC: 94.0,
    currentWarningA: 32.5,
    currentCriticalA: 38.0,
    sensitivityMode: 'medium',
    autoProactiveAlerts: true,
    minDurationSeconds: 2,
  },
  polishing_motor: {
    profileId: 'polishing_motor',
    vibrationWarningRMS: 2.3,
    vibrationCriticalRMS: 3.2,
    tempWarningC: 58.0,
    tempCriticalC: 68.0,
    currentWarningA: 14.2,
    currentCriticalA: 17.0,
    sensitivityMode: 'medium',
    autoProactiveAlerts: true,
    minDurationSeconds: 2,
  },
  furnace: {
    profileId: 'furnace',
    vibrationWarningRMS: 1.8,
    vibrationCriticalRMS: 2.6,
    tempWarningC: 92.0,
    tempCriticalC: 104.0,
    currentWarningA: 98.0,
    currentCriticalA: 115.0,
    sensitivityMode: 'medium',
    autoProactiveAlerts: true,
    minDurationSeconds: 2,
  },
  generic_motor: {
    profileId: 'generic_motor',
    vibrationWarningRMS: 2.6,
    vibrationCriticalRMS: 3.6,
    tempWarningC: 66.0,
    tempCriticalC: 78.0,
    currentWarningA: 18.5,
    currentCriticalA: 22.0,
    sensitivityMode: 'medium',
    autoProactiveAlerts: true,
    minDurationSeconds: 2,
  },
};

export const MACHINE_PROFILES: Record<AIMachineProfileId, AIMachineProfileConfig> = {
  hydraulic_press: {
    id: 'hydraulic_press',
    name: 'Hydraulic Press 200T',
    subtitle: 'Deep Drawing & Stamping Unit',
    nominalCurrentA: 18.4,
    nominalTempC: 63.4,
    nominalVibRMS: 2.6,
    hasProximity: true,
    primaryMetrics: ['Current Draw (SCT-013)', 'Cycle Count (NPN)', 'Hydraulic Vibration (MPU6050)'],
  },
  air_compressor: {
    id: 'air_compressor',
    name: 'Rotary Screw Compressor 45kW',
    subtitle: 'Central Plant Pneumatics',
    nominalCurrentA: 28.5,
    nominalTempC: 76.2,
    nominalVibRMS: 3.4,
    hasProximity: false,
    primaryMetrics: ['Motor Current (SCT-013)', 'Vibration RMS (MPU6050)', 'Acoustic Signature (INMP441)'],
  },
  polishing_motor: {
    id: 'polishing_motor',
    name: 'High-Speed Polishing Motor 15HP',
    subtitle: 'Finishing & Deburring Line',
    nominalCurrentA: 12.2,
    nominalTempC: 52.8,
    nominalVibRMS: 1.8,
    hasProximity: false,
    primaryMetrics: ['RPM Vibration (MPU6050)', 'Bearing Temp (DS18B20)', 'Harmonic Acoustics (INMP441)'],
  },
  furnace: {
    id: 'furnace',
    name: 'Medium Induction Furnace 100kW',
    subtitle: 'Non-Ferrous Melting Bay',
    nominalCurrentA: 86.0,
    nominalTempC: 84.5,
    nominalVibRMS: 1.2,
    hasProximity: false,
    primaryMetrics: ['Surface IR Temp (MLX90614)', 'Contact Temp (DS18B20)', 'Induction Current (SCT-013)'],
  },
  generic_motor: {
    id: 'generic_motor',
    name: 'Generic 3-Phase Induction Motor',
    subtitle: 'Universal Retrofit Profile',
    nominalCurrentA: 16.0,
    nominalTempC: 56.0,
    nominalVibRMS: 2.0,
    hasProximity: false,
    primaryMetrics: ['3-Phase Current', 'Tri-Axial Vibration', 'Body Heat'],
  },
};

interface AIIntelligenceContextType {
  activeModuleTab: 'monitor' | 'digitaltwin';
  setActiveModuleTab: (tab: 'monitor' | 'digitaltwin') => void;
  selectedProfileId: AIMachineProfileId;
  setSelectedProfileId: (id: AIMachineProfileId) => void;
  selectedProfile: AIMachineProfileConfig;
  scenario: SimulationScenarioId;
  setScenario: (sc: SimulationScenarioId) => void;
  isSimulating: boolean;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  autoDemoRunning: boolean;
  autoDemoElapsedSec: number;
  startAutoDemo: () => void;
  stopAutoDemo: () => void;
  sensors: SensorNodeState[];
  toggleSensorOnline: (sensorId: SensorNodeState['id']) => void;
  selectedSensorId: SensorNodeState['id'] | null;
  setSelectedSensorId: (id: SensorNodeState['id'] | null) => void;
  telemetryHistory: TelemetryPoint[];
  esp32Steps: ESP32ProcessingStep[];
  pipeline: AIPipelineState;
  health: HealthScoreBreakdown;
  energy: EnergyIntelligenceData;
  connectivity: DeviceConnectivityState;
  timelineEvents: MachineTimelineEvent[];
  acknowledgeAlert: () => void;
  standardPayload: StandardMachinePayload;
  carbonPassports: MachineCarbonPassport[];
  selectedCarbonPassport: MachineCarbonPassport;
  factoryTotalCarbonEmittedKg: number;
  factoryIdleCarbonLossKg: number;
  factoryTopHotspotAssetsPct: number;
  indiaGridEmissionFactor: number;
  carbonPredictiveNotice: {
    normalNotice: string;
    carbonNotice: string;
    extraEnergyPct: number;
    extraCostYearINR: number;
    extraCo2TonsYear: number;
    action: string;
  };
  machineThresholds: Record<AIMachineProfileId, MachineThresholdConfig>;
  currentMachineThresholds: MachineThresholdConfig;
  updateMachineThresholds: (profileId: AIMachineProfileId, updates: Partial<MachineThresholdConfig>) => void;
  resetMachineThresholds: (profileId: AIMachineProfileId) => void;
  activeThresholdBreaches: ThresholdBreachAlert[];
  dismissBreachAlert: (id: string) => void;
  isThresholdModalOpen: boolean;
  setIsThresholdModalOpen: (open: boolean) => void;
}

const AIIntelligenceContext = createContext<AIIntelligenceContextType | undefined>(undefined);

export const AIIntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModuleTab, setActiveModuleTab] = useState<'monitor' | 'digitaltwin'>('monitor');
  const [selectedProfileId, setSelectedProfileId] = useState<AIMachineProfileId>('hydraulic_press');
  const [scenario, setScenario] = useState<SimulationScenarioId>('normal');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedSensorId, setSelectedSensorId] = useState<SensorNodeState['id'] | null>(null);

  // 75-second automated demo sequence state
  const [autoDemoRunning, setAutoDemoRunning] = useState<boolean>(false);
  const [autoDemoElapsedSec, setAutoDemoElapsedSec] = useState<number>(0);

  // Sensor online/offline toggles
  const [sensorOnlineState, setSensorOnlineState] = useState<Record<SensorNodeState['id'], boolean>>({
    sct013: true,
    mpu6050: true,
    ds18b20: true,
    mlx90614: true,
    inmp441: true,
    proximity: true,
  });

  const selectedProfile = MACHINE_PROFILES[selectedProfileId];

  // Custom Anomaly Thresholds state (configurable sensitivity per machine)
  const [machineThresholds, setMachineThresholds] = useState<Record<AIMachineProfileId, MachineThresholdConfig>>(DEFAULT_THRESHOLDS);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [dismissedBreachIds, setDismissedBreachIds] = useState<string[]>([]);

  const currentMachineThresholds = machineThresholds[selectedProfileId] || DEFAULT_THRESHOLDS[selectedProfileId];

  const updateMachineThresholds = (profileId: AIMachineProfileId, updates: Partial<MachineThresholdConfig>) => {
    setMachineThresholds((prev) => ({
      ...prev,
      [profileId]: {
        ...prev[profileId],
        ...updates,
      },
    }));
  };

  const resetMachineThresholds = (profileId: AIMachineProfileId) => {
    setMachineThresholds((prev) => ({
      ...prev,
      [profileId]: { ...DEFAULT_THRESHOLDS[profileId] },
    }));
  };

  const dismissBreachAlert = (id: string) => {
    setDismissedBreachIds((prev) => [...prev, id]);
  };

  // Real-time sensor state variables
  const [currentVal, setCurrentVal] = useState<number>(selectedProfile.nominalCurrentA);
  const [contactTempVal, setContactTempVal] = useState<number>(selectedProfile.nominalTempC);
  const [irTempVal, setIrTempVal] = useState<number>(selectedProfile.nominalTempC + 4.7);
  const [vibVal, setVibVal] = useState<number>(selectedProfile.nominalVibRMS);
  const [acousticScore, setAcousticScore] = useState<number>(8);
  const [cycleCount, setCycleCount] = useState<number>(4286);
  const [productionRate, setProductionRate] = useState<number>(22);
  const [stepTick, setStepTick] = useState<number>(0);

  // History buffer (30 points)
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() => {
    const initial: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const t = new Date(now - i * 1500);
      initial.push({
        timestamp: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeSec: 30 - i,
        currentA: selectedProfile.nominalCurrentA + (Math.random() - 0.5) * 0.4,
        contactTempC: selectedProfile.nominalTempC + (Math.random() - 0.5) * 0.3,
        irTempC: selectedProfile.nominalTempC + 4.7 + (Math.random() - 0.5) * 0.4,
        vibrationRMS: selectedProfile.nominalVibRMS + (Math.random() - 0.5) * 0.15,
        acousticAnomalyScore: 8 + Math.floor(Math.random() * 4),
        healthScore: 92,
      });
    }
    return initial;
  });

  // Timeline events
  const [timelineEvents, setTimelineEvents] = useState<MachineTimelineEvent[]>([
    {
      id: 'ev-1',
      time: '10:42 AM',
      title: 'Machine Started',
      description: 'Main hydraulic pump and motor initialized under normal unloaded state.',
      severity: 'info',
    },
    {
      id: 'ev-2',
      time: '11:15 AM',
      title: 'Baseline Synchronized',
      description: 'SCT-013, MPU6050 & DS18B20 signals matched factory baseline profile.',
      severity: 'success',
    },
  ]);

  const toggleSensorOnline = (sensorId: SensorNodeState['id']) => {
    setSensorOnlineState((prev) => {
      const next = !prev[sensorId];
      // Add timeline event
      const sensorName =
        sensorId === 'sct013'
          ? 'SCT-013 Current Sensor'
          : sensorId === 'mpu6050'
          ? 'MPU6050 Vibration'
          : sensorId === 'ds18b20'
          ? 'DS18B20 Temperature'
          : sensorId === 'mlx90614'
          ? 'MLX90614 IR Temp'
          : sensorId === 'inmp441'
          ? 'INMP441 Acoustic'
          : 'Proximity Sensor';

      const now = new Date();
      setTimelineEvents((evs) => [
        {
          id: `ev-${Date.now()}`,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          title: next ? `${sensorName} Reconnected` : `${sensorName} Disconnected`,
          description: next
            ? 'Signal link restored. Multi-sensor fusion re-established.'
            : 'Sensor link broken. AI Engine operating on reduced confidence.',
          severity: next ? 'success' : 'warning',
        },
        ...evs,
      ]);

      return { ...prev, [sensorId]: next };
    });
  };

  // Reset when profile changes
  useEffect(() => {
    setCurrentVal(selectedProfile.nominalCurrentA);
    setContactTempVal(selectedProfile.nominalTempC);
    setIrTempVal(selectedProfile.nominalTempC + 4.7);
    setVibVal(selectedProfile.nominalVibRMS);
    setAcousticScore(8);
  }, [selectedProfileId]);

  // Automated 75-second Demo Runner
  useEffect(() => {
    if (!autoDemoRunning) return;

    const interval = setInterval(() => {
      setAutoDemoElapsedSec((prev) => {
        const next = prev + 1;
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (next === 10) {
          setScenario('bearing_degradation');
          setTimelineEvents((evs) => [
            {
              id: `ev-demo-10`,
              time: timeStr,
              title: 'Vibration Jitter Detected',
              description: 'Vibration RMS slowly rising above 3.5 mm/s baseline threshold.',
              severity: 'info',
            },
            ...evs,
          ]);
        } else if (next === 25) {
          setTimelineEvents((evs) => [
            {
              id: `ev-demo-25`,
              time: timeStr,
              title: 'Motor Current Deviation',
              description: 'SCT-013 registering +18% draw to compensate for mechanical friction.',
              severity: 'warning',
            },
            ...evs,
          ]);
        } else if (next === 35) {
          setTimelineEvents((evs) => [
            {
              id: `ev-demo-35`,
              time: timeStr,
              title: 'Surface Temperature Rising',
              description: 'Bearing housing friction converting to thermal dissipation (+9°C rise).',
              severity: 'warning',
            },
            ...evs,
          ]);
        } else if (next === 50) {
          setTimelineEvents((evs) => [
            {
              id: `ev-demo-50`,
              time: timeStr,
              title: 'ANOMALY DETECTED by AI',
              description: 'Multi-sensor baseline correlation anomaly score reached 82%.',
              severity: 'alert',
            },
            ...evs,
          ]);
        } else if (next === 60) {
          setTimelineEvents((evs) => [
            {
              id: `ev-demo-60`,
              time: timeStr,
              title: 'AI Decision: Probable Bearing Degradation',
              description: 'Confidence 87%. Recommended action: inspect lubrication & alignment.',
              severity: 'alert',
            },
            ...evs,
          ]);
        } else if (next >= 75) {
          setAutoDemoRunning(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoDemoRunning]);

  const startAutoDemo = () => {
    setAutoDemoElapsedSec(0);
    setScenario('normal');
    setAutoDemoRunning(true);
    setTimelineEvents((evs) => [
      {
        id: `ev-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        title: '75s Automated Demo Started',
        description: 'Demonstrating normal operation -> progressive degradation -> multi-sensor AI correlation.',
        severity: 'info',
      },
      ...evs,
    ]);
  };

  const stopAutoDemo = () => {
    setAutoDemoRunning(false);
  };

  const resetSimulation = () => {
    setScenario('normal');
    setAutoDemoRunning(false);
    setAutoDemoElapsedSec(0);
    setCurrentVal(selectedProfile.nominalCurrentA);
    setContactTempVal(selectedProfile.nominalTempC);
    setIrTempVal(selectedProfile.nominalTempC + 4.7);
    setVibVal(selectedProfile.nominalVibRMS);
    setAcousticScore(8);
  };

  const toggleSimulation = () => {
    setIsSimulating((prev) => !prev);
  };

  // Main 1.5s Simulation Pulse Loop
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setStepTick((prev) => (prev + 1) % 5);

      // Compute targets based on Scenario
      let targetCurrent = selectedProfile.nominalCurrentA;
      let targetTemp = selectedProfile.nominalTempC;
      let targetIr = selectedProfile.nominalTempC + 4.7;
      let targetVib = selectedProfile.nominalVibRMS;
      let targetAcoustic = 8;

      if (scenario === 'bearing_degradation') {
        targetCurrent = selectedProfile.nominalCurrentA * 1.22;
        targetTemp = selectedProfile.nominalTempC + 8.5;
        targetIr = selectedProfile.nominalTempC + 14.2;
        targetVib = selectedProfile.nominalVibRMS * 1.95;
        targetAcoustic = 68;
      } else if (scenario === 'machine_overload') {
        targetCurrent = selectedProfile.nominalCurrentA * 1.45;
        targetTemp = selectedProfile.nominalTempC + 14.0;
        targetIr = selectedProfile.nominalTempC + 18.0;
        targetVib = selectedProfile.nominalVibRMS * 1.25;
        targetAcoustic = 34;
      } else if (scenario === 'misalignment') {
        targetCurrent = selectedProfile.nominalCurrentA * 1.1;
        targetTemp = selectedProfile.nominalTempC + 4.0;
        targetIr = selectedProfile.nominalTempC + 7.5;
        targetVib = selectedProfile.nominalVibRMS * 2.4;
        targetAcoustic = 52;
      } else if (scenario === 'idle_waste') {
        targetCurrent = selectedProfile.nominalCurrentA * 0.44; // running unloaded
        targetTemp = selectedProfile.nominalTempC - 6.0;
        targetIr = selectedProfile.nominalTempC - 4.0;
        targetVib = selectedProfile.nominalVibRMS * 0.6;
        targetAcoustic = 12;
      } else if (scenario === 'overheating') {
        targetCurrent = selectedProfile.nominalCurrentA * 1.15;
        targetTemp = selectedProfile.nominalTempC + 22.0;
        targetIr = selectedProfile.nominalTempC + 28.5;
        targetVib = selectedProfile.nominalVibRMS * 1.1;
        targetAcoustic = 22;
      } else if (scenario === 'acoustic_anomaly') {
        targetCurrent = selectedProfile.nominalCurrentA * 1.05;
        targetTemp = selectedProfile.nominalTempC + 2.0;
        targetIr = selectedProfile.nominalTempC + 4.5;
        targetVib = selectedProfile.nominalVibRMS * 1.15;
        targetAcoustic = 78;
      }

      // Smooth step towards target with slight natural jitter
      const jitter = (Math.random() - 0.5) * 0.04;
      const newCurr = +(currentVal + (targetCurrent - currentVal) * 0.25 + jitter * targetCurrent).toFixed(1);
      const newTemp = +(contactTempVal + (targetTemp - contactTempVal) * 0.2 + (Math.random() - 0.5) * 0.2).toFixed(1);
      const newIr = +(irTempVal + (targetIr - irTempVal) * 0.2 + (Math.random() - 0.5) * 0.25).toFixed(1);
      const newVib = +(vibVal + (targetVib - vibVal) * 0.25 + (Math.random() - 0.5) * 0.08).toFixed(2);
      const newAcoustic = Math.min(
        100,
        Math.max(0, Math.round(acousticScore + (targetAcoustic - acousticScore) * 0.3 + (Math.random() - 0.5) * 2))
      );

      setCurrentVal(newCurr);
      setContactTempVal(newTemp);
      setIrTempVal(newIr);
      setVibVal(newVib);
      setAcousticScore(newAcoustic);

      // Increment cycle count for press
      if (selectedProfile.hasProximity && scenario !== 'idle_waste') {
        setCycleCount((c) => c + 1);
        setProductionRate(22 + (Math.random() > 0.5 ? 1 : -1));
      } else if (scenario === 'idle_waste') {
        setProductionRate(0);
      }

      // Calculate composite health score
      let currStrain = Math.max(0, (newCurr - selectedProfile.nominalCurrentA) / selectedProfile.nominalCurrentA);
      let vibStrain = Math.max(0, (newVib - selectedProfile.nominalVibRMS) / selectedProfile.nominalVibRMS);
      let tempStrain = Math.max(0, (newTemp - selectedProfile.nominalTempC) / 30);
      let acousticStrain = newAcoustic / 100;

      let calcHealth = Math.round(100 - (currStrain * 25 + vibStrain * 35 + tempStrain * 25 + acousticStrain * 15));
      calcHealth = Math.max(42, Math.min(98, calcHealth));

      // Append point to history
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryHistory((prev) => {
        const next = [...prev.slice(1)];
        next.push({
          timestamp: timeStr,
          timeSec: (prev[prev.length - 1]?.timeSec || 0) + 1.5,
          currentA: newCurr,
          contactTempC: newTemp,
          irTempC: newIr,
          vibrationRMS: newVib,
          acousticAnomalyScore: newAcoustic,
          healthScore: calcHealth,
        });
        return next;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [
    isSimulating,
    scenario,
    selectedProfileId,
    currentVal,
    contactTempVal,
    irTempVal,
    vibVal,
    acousticScore,
    selectedProfile,
  ]);

  // ESP32 Sequential Steps State
  const esp32Steps: ESP32ProcessingStep[] = [
    {
      step: 1,
      title: 'Signal Acquisition',
      subtitle: 'ADC 12-bit & I2C/SPI DMA Sampling',
      outputMetric: `Raw Current: ${(currentVal * 1.02).toFixed(1)} A · MPU Accel: ${(vibVal * 1.05).toFixed(2)} mm/s`,
      active: stepTick >= 0,
    },
    {
      step: 2,
      title: 'Noise Filtering',
      subtitle: 'Butterworth Bandpass & Kalman Smoothing',
      outputMetric: `Filtered: ${currentVal.toFixed(1)} A · Contact Temp: ${contactTempVal.toFixed(1)}°C`,
      active: stepTick >= 1,
    },
    {
      step: 3,
      title: 'Feature Extraction',
      subtitle: 'RMS, Crest Factor, Spectral Centroid',
      outputMetric: `Vib RMS: ${vibVal.toFixed(2)} mm/s · Acoustic RMS: 0.42`,
      active: stepTick >= 2,
    },
    {
      step: 4,
      title: 'Local Threshold Detection',
      subtitle: 'Edge Bounds Validation',
      outputMetric:
        vibVal > selectedProfile.nominalVibRMS * 1.4
          ? '⚠ Local Anomaly Flag Raised'
          : '✓ Within Normal Machine Bounds',
      active: stepTick >= 3,
    },
    {
      step: 5,
      title: 'Transmit to AI Engine',
      subtitle: 'MQTT / Wi-Fi Encrypted Telemetry Frame',
      outputMetric: 'JSON Payload Dispatched (1 Hz)',
      active: stepTick >= 4,
    },
  ];

  // Dynamically compute AI Confidence based on active sensors
  const onlineSensorsCount = Object.values(sensorOnlineState).filter(Boolean).length;
  let baseConfidence = 88;
  if (!sensorOnlineState.mpu6050) baseConfidence -= 16;
  if (!sensorOnlineState.sct013) baseConfidence -= 18;
  if (!sensorOnlineState.ds18b20 && !sensorOnlineState.mlx90614) baseConfidence -= 14;
  if (!sensorOnlineState.inmp441) baseConfidence -= 10;
  baseConfidence = Math.max(45, Math.min(94, baseConfidence));

  // Evaluate custom sensitivity threshold breaches for active machine
  const isVibCritical = vibVal >= currentMachineThresholds.vibrationCriticalRMS;
  const isVibWarning = vibVal >= currentMachineThresholds.vibrationWarningRMS;
  const isTempCritical = contactTempVal >= currentMachineThresholds.tempCriticalC;
  const isTempWarning = contactTempVal >= currentMachineThresholds.tempWarningC;
  const isCurrentCritical = currentVal >= currentMachineThresholds.currentCriticalA;
  const isCurrentWarning = currentVal >= currentMachineThresholds.currentWarningA;

  const hasAnyThresholdBreach = isVibWarning || isTempWarning || isCurrentWarning;
  const hasCriticalThresholdBreach = isVibCritical || isTempCritical || isCurrentCritical;

  const rawBreaches: ThresholdBreachAlert[] = [];
  if (currentMachineThresholds.autoProactiveAlerts) {
    if (isVibWarning) {
      rawBreaches.push({
        id: `breach-vib-${selectedProfileId}`,
        profileId: selectedProfileId,
        machineName: selectedProfile.name,
        metric: 'vibration',
        metricLabel: 'Tri-Axial Vibration (MPU6050)',
        sensorModel: 'MPU6050',
        observedValue: +vibVal.toFixed(2),
        unit: 'mm/s',
        thresholdValue: isVibCritical ? currentMachineThresholds.vibrationCriticalRMS : currentMachineThresholds.vibrationWarningRMS,
        severity: isVibCritical ? 'critical' : 'warning',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeAgo: 'Just now',
        probableCause: isVibCritical
          ? 'Severe dynamic rotor unbalance or bearing raceway spalling'
          : 'Early mechanical looseness, drive belt slack, or grease dry-out',
        proactiveRecommendation: isVibCritical
          ? 'Perform immediate vibration FFT spectrum analysis and inspect motor drive bearings before shift end.'
          : 'Replenish bearing grease and inspect foundation damper bolts during next maintenance window.',
        estimatedCostImpactINR: isVibCritical ? 38000 : 14000,
        urgencyWindow: isVibCritical ? 'Within 4-8 hours' : 'Within 48 operating hours',
      });
    }

    if (isTempWarning) {
      rawBreaches.push({
        id: `breach-temp-${selectedProfileId}`,
        profileId: selectedProfileId,
        machineName: selectedProfile.name,
        metric: 'temperature',
        metricLabel: 'Surface Heat (DS18B20)',
        sensorModel: 'DS18B20',
        observedValue: +contactTempVal.toFixed(1),
        unit: '°C',
        thresholdValue: isTempCritical ? currentMachineThresholds.tempCriticalC : currentMachineThresholds.tempWarningC,
        severity: isTempCritical ? 'critical' : 'warning',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeAgo: 'Just now',
        probableCause: isTempCritical
          ? 'Cooling fan obstruction or heavy thermal runaway in stator windings'
          : 'Inadequate heat dissipation or high ambient cabinet temperature',
        proactiveRecommendation: isTempCritical
          ? 'Stop machine to inspect cooling ducts and clean heat sink fins immediately.'
          : 'Verify cooling air flow and clean motor fin channels.',
        estimatedCostImpactINR: isTempCritical ? 45000 : 12000,
        urgencyWindow: isTempCritical ? 'Immediate Action' : 'Within 24 hours',
      });
    }

    if (isCurrentWarning) {
      rawBreaches.push({
        id: `breach-curr-${selectedProfileId}`,
        profileId: selectedProfileId,
        machineName: selectedProfile.name,
        metric: 'current',
        metricLabel: 'Phase Current (SCT-013)',
        sensorModel: 'SCT-013',
        observedValue: +currentVal.toFixed(1),
        unit: 'A',
        thresholdValue: isCurrentCritical ? currentMachineThresholds.currentCriticalA : currentMachineThresholds.currentWarningA,
        severity: isCurrentCritical ? 'critical' : 'warning',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timeAgo: 'Just now',
        probableCause: isCurrentCritical
          ? 'Mechanical die binding, pump cavitation overload, or phase imbalance'
          : 'Excess mechanical load resistance or degraded lubrication causing parasitic drag',
        proactiveRecommendation: isCurrentCritical
          ? 'Inspect workpiece clearance and verify hydraulic pressure relief valve setting.'
          : 'Monitor load cycle and check mechanical transmission for binding.',
        estimatedCostImpactINR: isCurrentCritical ? 52000 : 18000,
        urgencyWindow: isCurrentCritical ? 'Immediate Action' : 'Within 48 operating hours',
      });
    }
  }

  const activeThresholdBreaches = rawBreaches.filter(
    (b) => !dismissedBreachIds.includes(b.id)
  );

  // Determine anomaly state (either manual scenario OR custom threshold breach!)
  const isAnomalyState =
    scenario !== 'normal' || (currentMachineThresholds.autoProactiveAlerts && hasAnyThresholdBreach);

  let anomalyScorePct = 12;
  if (hasCriticalThresholdBreach) anomalyScorePct = 94;
  else if (hasAnyThresholdBreach) anomalyScorePct = 78;
  else if (scenario === 'bearing_degradation') anomalyScorePct = 82;
  else if (scenario !== 'normal') anomalyScorePct = 74;

  // Pipeline Decision Interpretation
  let probableCause = 'Normal Operation — Mechanical & electrical parameters nominal.';
  let aiInterpretation = 'All sensor features conform to standard factory baseline envelope.';
  let recommendedActions = ['Continue standard shift operating schedule.', 'Next periodic PM in 90 days.'];
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  let suggestedInspectionWindow = 'Standard 90 Days';

  // If custom threshold is breached under normal scenario, prioritize the proactive threshold alert!
  if (hasAnyThresholdBreach && scenario === 'normal' && activeThresholdBreaches.length > 0) {
    const top = activeThresholdBreaches[0];
    probableCause = `Threshold Breach: ${top.metricLabel} (${top.observedValue} ${top.unit} > Limit ${top.thresholdValue} ${top.unit})`;
    aiInterpretation = `Live sensor telemetry crossed custom ${top.severity.toUpperCase()} threshold set for ${selectedProfile.name}. ${top.probableCause}. Proactive maintenance triggered.`;
    recommendedActions = [
      top.proactiveRecommendation,
      `Estimated avoidable cost impact: ₹${top.estimatedCostImpactINR.toLocaleString('en-IN')}`,
    ];
    riskLevel = hasCriticalThresholdBreach ? 'High' : 'Medium';
    suggestedInspectionWindow = top.urgencyWindow;
  }

  if (scenario === 'bearing_degradation') {
    probableCause = 'Probable Bearing Assembly Degradation / Race Fatigue';
    aiInterpretation =
      'Correlated spike in Vibration RMS (+42%), motor current draw (+18%), and thermal dissipation (+9°C) indicates progressive mechanical resistance inside the drive bearing housing.';
    recommendedActions = [
      'Inspect bearing lubrication & grease condition.',
      'Check shaft radial alignment using laser tool.',
      'Schedule bearing replacement during upcoming planned maintenance window.',
    ];
    riskLevel = 'High';
    suggestedInspectionWindow = 'Within 48 operating hours';
  } else if (scenario === 'machine_overload') {
    probableCause = 'Electrical Overload / Hydraulic Pressing Resistance';
    aiInterpretation =
      'SCT-013 current draw spiked by +45% while vibration remained only moderately elevated (+12%), indicating heavy tool strain or die jamming.';
    recommendedActions = [
      'Review workpiece blank thickness and die clearance.',
      'Verify hydraulic relief valve pressure setting.',
    ];
    riskLevel = 'Medium';
    suggestedInspectionWindow = 'Immediate Shift Inspection';
  } else if (scenario === 'misalignment') {
    probableCause = 'Drive Pulley / Shaft Angular Misalignment';
    aiInterpretation =
      'Vibration frequency spectrum shows dominant 1X and 2X rotational peaks (+140% rise), consistent with coupling or belt misalignment.';
    recommendedActions = ['Re-align motor drive pulley and retighten foot mounting bolts.'];
    riskLevel = 'Medium';
    suggestedInspectionWindow = 'Within 72 operating hours';
  } else if (scenario === 'idle_waste') {
    probableCause = 'Unproductive Idle Energy Waste Detected';
    aiInterpretation =
      'Production cycle count = 0, but machine motor is still drawing 44% load continuously, generating ₹18-24/hr in pure electrical waste.';
    recommendedActions = [
      'Enable 5-minute auto-unload stop timer.',
      'Review operator cycle discipline between shifts.',
    ];
    riskLevel = 'Low';
    suggestedInspectionWindow = 'Operational Review';
  } else if (scenario === 'overheating') {
    probableCause = 'Thermal Dissipation Failure / Cooling Water Blockage';
    aiInterpretation =
      'Contact temperature and IR surface temperature diverged rapidly (+22°C), indicating blocked cooling ducts or failed fan shroud.';
    recommendedActions = ['Inspect cooling water circulation filter and clean motor fin channels.'];
    riskLevel = 'High';
    suggestedInspectionWindow = 'Immediate Action Required';
  } else if (scenario === 'acoustic_anomaly') {
    probableCause = 'Acoustic Harmonic Cavitation / Belt Squeal';
    aiInterpretation =
      'INMP441 ultrasonic microphone detected high-frequency spectral deviation (+78%) before thermal or current changes manifested.';
    recommendedActions = ['Check belt tension and inspect pump suction line for aeration cavitation.'];
    riskLevel = 'Medium';
    suggestedInspectionWindow = 'Within 48 operating hours';
  }

  const pipeline: AIPipelineState = {
    fusion: {
      stateVector: [currentVal, vibVal, contactTempVal, irTempVal, acousticScore],
      activeSensorsCount: onlineSensorsCount,
    },
    features: {
      currentRMS: currentVal,
      currentVariance: +(Math.abs(currentVal - selectedProfile.nominalCurrentA) * 0.12).toFixed(3),
      tempRiseRate: scenario === 'overheating' ? 1.4 : 0.08,
      vibrationRMS: vibVal,
      vibrationPeak: +(vibVal * 1.414).toFixed(2),
      acousticRMS: +(acousticScore * 0.012).toFixed(2),
      acousticSpectralDeviation: +(acousticScore * 0.85).toFixed(1),
      machineCycleTimeSec: selectedProfile.hasProximity ? 2.7 : 0,
    },
    baseline: {
      expectedCurrent: selectedProfile.nominalCurrentA,
      observedCurrent: currentVal,
      currentDiffPct: +(((currentVal - selectedProfile.nominalCurrentA) / selectedProfile.nominalCurrentA) * 100).toFixed(1),
      expectedTemp: selectedProfile.nominalTempC,
      observedTemp: contactTempVal,
      tempDiffPct: +(((contactTempVal - selectedProfile.nominalTempC) / selectedProfile.nominalTempC) * 100).toFixed(1),
      expectedVib: selectedProfile.nominalVibRMS,
      observedVib: vibVal,
      vibDiffPct: +(((vibVal - selectedProfile.nominalVibRMS) / selectedProfile.nominalVibRMS) * 100).toFixed(1),
    },
    anomaly: {
      status: isAnomalyState ? 'ANOMALY DETECTED' : 'NORMAL',
      scorePct: anomalyScorePct,
      isAnomaly: isAnomalyState,
    },
    decision: {
      probableCause,
      confidencePct: baseConfidence,
      evidence: [
        {
          metric: 'Current Draw (SCT-013)',
          delta: `${currentVal > selectedProfile.nominalCurrentA ? '+' : ''}${Math.round(
            ((currentVal - selectedProfile.nominalCurrentA) / selectedProfile.nominalCurrentA) * 100
          )}%`,
        },
        {
          metric: 'Vibration RMS (MPU6050)',
          delta: `${vibVal > selectedProfile.nominalVibRMS ? '+' : ''}${Math.round(
            ((vibVal - selectedProfile.nominalVibRMS) / selectedProfile.nominalVibRMS) * 100
          )}%`,
        },
        {
          metric: 'Contact Temp (DS18B20)',
          delta: `${contactTempVal > selectedProfile.nominalTempC ? '+' : ''}${(
            contactTempVal - selectedProfile.nominalTempC
          ).toFixed(1)}°C`,
        },
        {
          metric: 'Acoustic Anomaly (INMP441)',
          delta: `${acousticScore}% score`,
        },
      ],
      aiInterpretation,
      recommendedActions,
      riskLevel,
      suggestedInspectionWindow,
    },
  };

  // Health breakdown
  const electricalHealth = Math.max(30, Math.min(98, Math.round(100 - Math.abs(pipeline.baseline.currentDiffPct) * 1.2)));
  const mechanicalHealth = Math.max(25, Math.min(98, Math.round(100 - Math.abs(pipeline.baseline.vibDiffPct) * 0.9)));
  const thermalHealth = Math.max(35, Math.min(98, Math.round(100 - Math.abs(pipeline.baseline.tempDiffPct) * 1.5)));
  const acousticHealth = Math.max(30, Math.min(98, Math.round(100 - acousticScore * 0.8)));
  const compositeHealth = Math.round(
    electricalHealth * 0.3 + mechanicalHealth * 0.35 + thermalHealth * 0.2 + acousticHealth * 0.15
  );

  const health: HealthScoreBreakdown = {
    total: compositeHealth,
    electrical: electricalHealth,
    mechanical: mechanicalHealth,
    thermal: thermalHealth,
    acoustic: acousticHealth,
  };

  // Energy intelligence
  const operatingKW = +(currentVal * 0.58).toFixed(1);
  const idleKW = +(selectedProfile.nominalCurrentA * 0.44 * 0.58).toFixed(1);
  const idleMinutes = scenario === 'idle_waste' ? 46 : 14;
  const potentialKWhSaving = +(idleKW * (idleMinutes / 60)).toFixed(2);
  const dailySavingINR = +(potentialKWhSaving * 8.5 * 3).toFixed(1);
  const monthlySavingINR = +(dailySavingINR * 26).toFixed(0);

  const energy: EnergyIntelligenceData = {
    operatingKW,
    idleKW,
    detectedIdleMinutes: idleMinutes,
    potentialKWhSaving,
    estimatedDailySavingINR: dailySavingINR,
    estimatedMonthlySavingINR: monthlySavingINR,
  };

  // Machine-Level Carbon Passports & Carbon Intelligence
  const indiaGridEmissionFactor = 0.82; // Central Electricity Authority (CEA) standard factor (kg CO2 / kWh)

  const isBearingWear = scenario === 'bearing_degradation';
  const isOverload = scenario === 'machine_overload';
  const isIdleWaste = scenario === 'idle_waste';

  const pressExtraPct = isBearingWear ? 8.5 : 0;

  const carbonPassports: MachineCarbonPassport[] = [
    {
      machineId: 'SF-PRESS-01',
      name: 'Hydraulic Press 200T',
      profileId: 'hydraulic_press',
      location: 'Pune MIDC · Bay 1',
      bay: 'Bay 1 (Stamping Line)',
      kwhConsumedToday: +(168.4 * (selectedProfileId === 'hydraulic_press' ? currentVal / selectedProfile.nominalCurrentA : 1)).toFixed(1),
      co2EmittedKg: +(168.4 * (selectedProfileId === 'hydraulic_press' ? currentVal / selectedProfile.nominalCurrentA : 1) * indiaGridEmissionFactor).toFixed(1),
      co2PerUnitProduced: {
        value: +(14.2 * (selectedProfileId === 'hydraulic_press' && isBearingWear ? 1.09 : 1)).toFixed(1),
        unit: 'g CO₂ / stamped part',
      },
      idleCarbonLossKg: +(24.8 * (selectedProfileId === 'hydraulic_press' && isIdleWaste ? 2.4 : 1)).toFixed(1),
      idleCarbonLossPct: selectedProfileId === 'hydraulic_press' && isIdleWaste ? 38 : 18,
      efficiencyGrade: selectedProfileId === 'hydraulic_press' && (isBearingWear || isIdleWaste) ? 'C' : 'B+',
      efficiencyTrend: selectedProfileId === 'hydraulic_press' && isBearingWear ? 'degrading' : 'stable',
      isHotspot: true,
      hotspotRank: 2,
      shareOfPlantEmissionsPct: 21.2,
      extraEnergyPctDueToWear: pressExtraPct,
      extraEnergyCostYearINR: isBearingWear ? 14800 : 0,
      extraCo2TonsYear: isBearingWear ? 1.1 : 0,
      carbonPaybackDaysIfServiced: 18,
    },
    {
      machineId: 'SF-COMP-02',
      name: 'Rotary Screw Compressor 45kW',
      profileId: 'air_compressor',
      location: 'Pune MIDC · Bay 2',
      bay: 'Bay 2 (Pneumatic Utility)',
      kwhConsumedToday: +(245.8 * (selectedProfileId === 'air_compressor' ? currentVal / selectedProfile.nominalCurrentA : 1)).toFixed(1),
      co2EmittedKg: +(245.8 * (selectedProfileId === 'air_compressor' ? currentVal / selectedProfile.nominalCurrentA : 1) * indiaGridEmissionFactor).toFixed(1),
      co2PerUnitProduced: {
        value: +(48.2 * (selectedProfileId === 'air_compressor' && isBearingWear ? 1.09 : 1)).toFixed(1),
        unit: 'g CO₂ / m³ air',
      },
      idleCarbonLossKg: +(96.7 * (selectedProfileId === 'air_compressor' && isIdleWaste ? 1.3 : 1)).toFixed(1),
      idleCarbonLossPct: 48,
      efficiencyGrade: 'D',
      efficiencyTrend: 'degrading',
      isHotspot: true,
      hotspotRank: 1, // Primary plant carbon hotspot!
      shareOfPlantEmissionsPct: 30.8,
      extraEnergyPctDueToWear: 9.0, // EXACT requirement from prompt!
      extraEnergyCostYearINR: 18000, // EXACT requirement from prompt!
      extraCo2TonsYear: 1.3, // EXACT requirement from prompt!
      carbonPaybackDaysIfServiced: 14,
    },
    {
      machineId: 'SF-POLISH-03',
      name: 'High-Speed Polishing Motor 15HP',
      profileId: 'polishing_motor',
      location: 'Pune MIDC · Bay 3',
      bay: 'Bay 3 (Finishing Line)',
      kwhConsumedToday: +(76.5 * (selectedProfileId === 'polishing_motor' ? currentVal / selectedProfile.nominalCurrentA : 1)).toFixed(1),
      co2EmittedKg: +(76.5 * (selectedProfileId === 'polishing_motor' ? currentVal / selectedProfile.nominalCurrentA : 1) * indiaGridEmissionFactor).toFixed(1),
      co2PerUnitProduced: {
        value: 8.4,
        unit: 'g CO₂ / finished piece',
      },
      idleCarbonLossKg: 6.8,
      idleCarbonLossPct: 11,
      efficiencyGrade: 'A',
      efficiencyTrend: 'stable',
      isHotspot: false,
      hotspotRank: 4,
      shareOfPlantEmissionsPct: 9.6,
      extraEnergyPctDueToWear: 0,
      extraEnergyCostYearINR: 0,
      extraCo2TonsYear: 0,
      carbonPaybackDaysIfServiced: 60,
    },
    {
      machineId: 'SF-FURNACE-04',
      name: 'Medium Induction Furnace 100kW',
      profileId: 'furnace',
      location: 'Pune MIDC · Bay 4',
      bay: 'Bay 4 (Casting Bay)',
      kwhConsumedToday: +(482.0 * (selectedProfileId === 'furnace' ? currentVal / selectedProfile.nominalCurrentA : 1)).toFixed(1),
      co2EmittedKg: +(482.0 * (selectedProfileId === 'furnace' ? currentVal / selectedProfile.nominalCurrentA : 1) * indiaGridEmissionFactor).toFixed(1),
      co2PerUnitProduced: {
        value: 182.0,
        unit: 'g CO₂ / kg metal melted',
      },
      idleCarbonLossKg: 38.5,
      idleCarbonLossPct: 9.7,
      efficiencyGrade: 'B',
      efficiencyTrend: 'stable',
      isHotspot: true,
      hotspotRank: 3,
      shareOfPlantEmissionsPct: 38.4,
      extraEnergyPctDueToWear: 4.2,
      extraEnergyCostYearINR: 9600,
      extraCo2TonsYear: 0.8,
      carbonPaybackDaysIfServiced: 30,
    },
  ];

  const selectedCarbonPassport =
    carbonPassports.find((p) => p.profileId === selectedProfileId) || carbonPassports[0];

  const factoryTotalCarbonEmittedKg = +carbonPassports.reduce((acc, p) => acc + p.co2EmittedKg, 0).toFixed(1);
  const factoryIdleCarbonLossKg = +carbonPassports.reduce((acc, p) => acc + p.idleCarbonLossKg, 0).toFixed(1);
  const factoryTopHotspotAssetsPct = 64.2;

  const carbonPredictiveNotice = {
    normalNotice: 'Bearing 20 days me fail ho sakta hai.',
    carbonNotice:
      'Bearing degradation ke वजह se motor 9% extra energy consume kar rahi hai, causing ₹18,000/year avoidable energy cost and 1.3 tCO₂ extra emissions.',
    extraEnergyPct: 9.0,
    extraCostYearINR: 18000,
    extraCo2TonsYear: 1.3,
    action: 'Schedule laser alignment and bearing lubrication within 48h to eliminate 1.3 tCO₂ and save ₹18,000 avoidable energy cost.',
  };

  // Connectivity metrics
  const connectivity: DeviceConnectivityState = {
    esp32Status: 'ONLINE',
    wifiStatus: 'CONNECTED',
    packetRateHz: 1.0,
    latencyMs: 38,
    lastPacketSec: 1,
    dataQualityPct: 98.6,
  };

  // Sensor node states list
  const sensors: SensorNodeState[] = [
    {
      id: 'sct013',
      name: 'Current Sensor',
      sensorModel: 'SCT-013 CT Clamp',
      mountType: 'External Split-Core around phase lead',
      value: sensorOnlineState.sct013 ? `${currentVal.toFixed(1)} A` : 'OFFLINE',
      numericValue: currentVal,
      unit: 'A',
      status: !sensorOnlineState.sct013
        ? 'offline'
        : currentVal > selectedProfile.nominalCurrentA * 1.25
        ? 'critical'
        : currentVal > selectedProfile.nominalCurrentA * 1.12
        ? 'warning'
        : 'normal',
      isOnline: sensorOnlineState.sct013,
      description: 'Non-invasive split-core CT sensor clamped around power conductor. Reads 3-phase RMS current.',
    },
    {
      id: 'mpu6050',
      name: 'Vibration Sensor',
      sensorModel: 'MPU6050 Tri-Axial Accelerometer',
      mountType: 'Magnetic base to motor bearing housing',
      value: sensorOnlineState.mpu6050 ? `${vibVal.toFixed(2)} mm/s` : 'OFFLINE',
      numericValue: vibVal,
      unit: 'mm/s',
      status: !sensorOnlineState.mpu6050
        ? 'offline'
        : vibVal > selectedProfile.nominalVibRMS * 1.5
        ? 'critical'
        : vibVal > selectedProfile.nominalVibRMS * 1.25
        ? 'warning'
        : 'normal',
      isOnline: sensorOnlineState.mpu6050,
      description: 'High-sensitivity 3-axis accelerometer measuring mechanical shake, bearing degradation and unbalance.',
    },
    {
      id: 'ds18b20',
      name: 'Contact Temperature',
      sensorModel: 'DS18B20 Waterproof Probe',
      mountType: 'Thermal tape / strap to motor casing',
      value: sensorOnlineState.ds18b20 ? `${contactTempVal.toFixed(1)} °C` : 'OFFLINE',
      numericValue: contactTempVal,
      unit: '°C',
      status: !sensorOnlineState.ds18b20
        ? 'offline'
        : contactTempVal > selectedProfile.nominalTempC + 15
        ? 'critical'
        : contactTempVal > selectedProfile.nominalTempC + 7
        ? 'warning'
        : 'normal',
      isOnline: sensorOnlineState.ds18b20,
      description: 'Digital 1-wire thermal probe in direct contact with metal frame for heat dissipation trends.',
    },
    {
      id: 'mlx90614',
      name: 'IR Temperature',
      sensorModel: 'MLX90614 Non-Contact IR Sensor',
      mountType: 'Optical bracket aimed at rotating shaft',
      value: sensorOnlineState.mlx90614 ? `${irTempVal.toFixed(1)} °C` : 'OFFLINE',
      numericValue: irTempVal,
      unit: '°C',
      status: !sensorOnlineState.mlx90614
        ? 'offline'
        : irTempVal > selectedProfile.nominalTempC + 20
        ? 'critical'
        : irTempVal > selectedProfile.nominalTempC + 10
        ? 'warning'
        : 'normal',
      isOnline: sensorOnlineState.mlx90614,
      description: 'Infrared non-contact sensor measuring surface friction temperature on spinning parts without contact.',
    },
    {
      id: 'inmp441',
      name: 'Acoustic Sound Sensor',
      sensorModel: 'INMP441 Omnidirectional MEMS Mic',
      mountType: 'External acoustic port pointing at machine',
      value: sensorOnlineState.inmp441 ? `${acousticScore}% Anomaly` : 'OFFLINE',
      numericValue: acousticScore,
      unit: '%',
      status: !sensorOnlineState.inmp441
        ? 'offline'
        : acousticScore > 50
        ? 'critical'
        : acousticScore > 25
        ? 'warning'
        : 'normal',
      isOnline: sensorOnlineState.inmp441,
      description: 'I2S digital MEMS microphone detecting bearing squeal, cavitation, and high-frequency friction.',
    },
    {
      id: 'proximity',
      name: 'Part / Cycle Detection',
      sensorModel: 'Inductive Proximity Sensor (Optional)',
      mountType: 'Adjustable bracket near moving platen',
      value: selectedProfile.hasProximity
        ? sensorOnlineState.proximity
          ? `${cycleCount.toLocaleString()} Hits`
          : 'OFFLINE'
        : 'N/A for Profile',
      numericValue: cycleCount,
      unit: 'hits',
      status: !selectedProfile.hasProximity
        ? 'normal'
        : !sensorOnlineState.proximity
        ? 'offline'
        : 'normal',
      isOnline: selectedProfile.hasProximity ? sensorOnlineState.proximity : false,
      description: 'NPN inductive proximity sensor tracking stroke counts and real-time production throughput.',
    },
  ];

  const acknowledgeAlert = () => {
    setScenario('normal');
  };

  // Standard machine payload for API/WebSocket/MQTT readiness
  const standardPayload: StandardMachinePayload = {
    machineId: selectedProfile.id.toUpperCase(),
    profileId: selectedProfile.id,
    timestamp: new Date().toISOString(),
    sensors: {
      currentA: currentVal,
      contactTempC: contactTempVal,
      irTempC: irTempVal,
      vibrationRMS: vibVal,
      acousticAnomalyScore: acousticScore,
      cycleCount,
    },
    healthScore: compositeHealth,
    anomalyScore: anomalyScorePct,
    confidencePct: baseConfidence,
    state: scenario === 'idle_waste' ? 'idle' : 'running',
    mode: 'SIMULATION',
  };

  return (
    <AIIntelligenceContext.Provider
      value={{
        activeModuleTab,
        setActiveModuleTab,
        selectedProfileId,
        setSelectedProfileId,
        selectedProfile,
        scenario,
        setScenario,
        isSimulating,
        toggleSimulation,
        resetSimulation,
        autoDemoRunning,
        autoDemoElapsedSec,
        startAutoDemo,
        stopAutoDemo,
        sensors,
        toggleSensorOnline,
        selectedSensorId,
        setSelectedSensorId,
        telemetryHistory,
        esp32Steps,
        pipeline,
        health,
        energy,
        connectivity,
        timelineEvents,
        acknowledgeAlert,
        standardPayload,
        carbonPassports,
        selectedCarbonPassport,
        factoryTotalCarbonEmittedKg,
        factoryIdleCarbonLossKg,
        factoryTopHotspotAssetsPct,
        indiaGridEmissionFactor,
        carbonPredictiveNotice,
        machineThresholds,
        currentMachineThresholds,
        updateMachineThresholds,
        resetMachineThresholds,
        activeThresholdBreaches,
        dismissBreachAlert,
        isThresholdModalOpen,
        setIsThresholdModalOpen,
      }}
    >
      {children}
    </AIIntelligenceContext.Provider>
  );
};

export const useAIIntelligence = () => {
  const context = useContext(AIIntelligenceContext);
  if (!context) throw new Error('useAIIntelligence must be used within AIIntelligenceProvider');
  return context;
};
