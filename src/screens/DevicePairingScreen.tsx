import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { MachineType, Machine } from '../types';
import { ChakraMotif } from '../components/ChakraMotif';
import {
  Radio,
  Wifi,
  KeyRound,
  CheckCircle,
  Cpu,
  Layers,
  Flame,
  Fan,
  Cog,
  RefreshCw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const DevicePairingScreen: React.FC = () => {
  const { t, addMachine, setCurrentNav, setSelectedMachineId } = useFactory();

  // Wizard state: 1: Scan / Search, 2: Profile Selection, 3: Sync & Calibrate, 4: Success
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMethod, setScanMethod] = useState<'radar' | 'wifi' | 'manual'>('radar');
  const [foundBoxId, setFoundBoxId] = useState<string>('SF-IN-9812');
  const [manualCode, setManualCode] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<MachineType>('press');
  const [machineName, setMachineName] = useState<string>('Hydraulic Press 150T (Line 3)');
  const [machineLocation, setMachineLocation] = useState<string>('Bay 2 · Chakan MIDC');
  const [syncProgress, setSyncProgress] = useState<number>(0);

  // Trigger radar scan
  const startScan = (method: 'radar' | 'wifi' | 'manual') => {
    setScanMethod(method);
    if (method === 'manual') return;

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setFoundBoxId('SF-IN-' + Math.floor(1000 + Math.random() * 9000));
    }, 2000);
  };

  // Trigger sync data & baseline calibration
  const handleStartSync = () => {
    setCurrentStep(3);
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentStep(4), 500);
          return 100;
        }
        return prev + 20;
      });
    }, 350);
  };

  // Complete pairing and register new machine into context
  const handleFinishPairing = () => {
    const newM: Machine = {
      id: 'm-' + Date.now(),
      name: machineName || 'New Machine',
      type: selectedProfile,
      boxId: foundBoxId || 'SF-IN-9812',
      location: machineLocation || 'Main Plant Floor',
      installationDate: new Date().toISOString().split('T')[0],
      status: 'normal',
      statusMessage: 'Baseline CT clamps calibrated. Telemetry streaming normally.',
      healthScore: 95,
      telemetry: {
        currentA: 28.4,
        powerKW: 16.2,
        powerFactor: 0.93,
        vibrationRMS: 1.8,
        temperatureC: 46.0,
        acousticAnomalyScore: 3,
        dutyCycle: { active: 75, idle: 18, off: 7 },
        todayKWh: 42.0,
        weeklyKWh: 42.0,
        monthlyKWh: 42.0,
        idleCostTodayINR: 110,
        monthlySavingsINR: 3200,
        goodStrokes: selectedProfile === 'press' ? 450 : undefined,
        blankStrokes: selectedProfile === 'press' ? 12 : undefined,
        totalStrokes: selectedProfile === 'press' ? 462 : undefined,
      },
      trendData: [
        { time: '08:00', current: 0, temp: 25, vibration: 0.2, normalMin: 10, normalMax: 45 },
        { time: '10:00', current: 26, temp: 40, vibration: 1.7, normalMin: 10, normalMax: 45 },
        { time: '12:00', current: 28.4, temp: 46, vibration: 1.8, normalMin: 10, normalMax: 45 },
      ],
    };

    addMachine(newM);
    setSelectedMachineId(newM.id);
    setCurrentNav('machines');
  };

  const machineProfiles: { type: MachineType; title: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      type: 'press',
      title: t.pressProfile,
      desc: 'Deep draw, stamping, blanking, mechanical flywheel, or progressive die press.',
      icon: Layers,
    },
    {
      type: 'compressor',
      title: t.compressorProfile,
      desc: 'Rotary screw or piston compressor with load / unload cycle tracking.',
      icon: Fan,
    },
    {
      type: 'motor',
      title: t.motorProfile,
      desc: 'Heavy lathe, deburring, polishing motor, CNC spindle, or hydraulic pump drive.',
      icon: Cog,
    },
    {
      type: 'furnace',
      title: t.furnaceProfile,
      desc: 'Induction heating coil, melting crucible, or continuous heat-treat chamber.',
      icon: Flame,
    },
    {
      type: 'other',
      title: t.otherProfile,
      desc: 'Extruder, packaging line, chiller, or general factory motor machinery.',
      icon: Cpu,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Step Progress Breadcrumb */}
      <div className="grid grid-cols-4 gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {[
          { num: 1, label: t.step1Scan },
          { num: 2, label: t.step3Profile },
          { num: 3, label: t.step4Sync },
          { num: 4, label: '5. Complete' },
        ].map((s) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;
          return (
            <div
              key={s.num}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
                  : 'text-slate-400 bg-slate-50 dark:bg-slate-950/40'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isActive
                    ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white'
                    : isDone
                    ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {isDone ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: SCAN / HARDWARE DETECTION */}
      {currentStep === 1 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Clip & Connect New SmartFactory Box
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
              No machine rewiring needed. Snap the magnetic box onto your machine's steel frame and clamp the split-core current ring over the phase cable.
            </p>
          </div>

          {/* Three Large Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => startScan('radar')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                scanMethod === 'radar'
                  ? 'bg-amber-50/80 border-amber-300 text-slate-900 dark:bg-amber-500/15 dark:border-amber-500 dark:text-white shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <Radio className="w-6 h-6 text-amber-500" />
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-semibold">
                  Bluetooth Beacon
                </span>
              </div>
              <div>
                <span className="text-sm font-bold block">Scan for Nearby Box</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                  Autodetect broadcast signal within 10 meters
                </span>
              </div>
            </button>

            <button
              onClick={() => startScan('wifi')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                scanMethod === 'wifi'
                  ? 'bg-amber-50/80 border-amber-300 text-slate-900 dark:bg-amber-500/15 dark:border-amber-500 dark:text-white shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <Wifi className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                  Factory Wi-Fi
                </span>
              </div>
              <div>
                <span className="text-sm font-bold block">Connect via Wi-Fi</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                  Connect through local workshop router
                </span>
              </div>
            </button>

            <button
              onClick={() => setScanMethod('manual')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                scanMethod === 'manual'
                  ? 'bg-amber-50/80 border-amber-300 text-slate-900 dark:bg-amber-500/15 dark:border-amber-500 dark:text-white shadow-xs'
                  : 'bg-slate-50/70 border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <KeyRound className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 uppercase font-semibold">
                  Box Serial Key
                </span>
              </div>
              <div>
                <span className="text-sm font-bold block">Enter Device Code</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
                  Type 8-digit serial printed on label
                </span>
              </div>
            </button>
          </div>

          {/* Scanning Radar Display or Manual Input */}
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-center relative overflow-hidden">
            {scanMethod !== 'manual' ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                {/* Radar animation circles */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full border-2 border-amber-400/40 ${
                      isScanning ? 'animate-ping' : ''
                    }`}
                  />
                  <div className="w-24 h-24 rounded-full border border-amber-400/50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-400 flex items-center justify-center">
                      <Radio className="w-8 h-8 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isScanning ? t.scanningNearby : t.foundDevice}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono-num">
                    Detected Hardware ID: <strong className="text-amber-600 dark:text-amber-400">{foundBoxId}</strong> · RSSI -58 dBm
                  </p>
                </div>

                {!isScanning && (
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>Pair This Box & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto py-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enter 8-Digit Serial Code from SmartFactory Box Label
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SF-IN-9812"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-mono text-center text-slate-900 dark:text-white tracking-widest focus:outline-none focus:border-slate-400 uppercase"
                  />
                  <button
                    onClick={() => {
                      if (manualCode) {
                        setFoundBoxId(manualCode);
                        setCurrentStep(2);
                      }
                    }}
                    disabled={!manualCode}
                    className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: MACHINE PROFILE SELECTOR */}
      {currentStep === 2 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.selectMachineProfile}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">
              The AI helper customizes vibration, thermal, and stroke algorithms based on your machine type.
            </p>
          </div>

          {/* Machine Name & Floor Location Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                Machine Nickname / मशीन का नाम:
              </label>
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                Workshop Location / कार्यशाला स्थान:
              </label>
              <input
                type="text"
                value={machineLocation}
                onChange={(e) => setMachineLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
              />
            </div>
          </div>

          {/* Large Profile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {machineProfiles.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedProfile === p.type;
              return (
                <button
                  key={p.type}
                  onClick={() => setSelectedProfile(p.type)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 text-slate-900 dark:bg-amber-500/15 dark:border-amber-500 dark:text-white shadow-xs'
                      : 'bg-slate-50/70 border-slate-200/80 dark:bg-slate-800/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5 text-amber-500" />
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-amber-500" />}
                  </div>

                  <div>
                    <span className="font-bold text-sm block">{p.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block leading-relaxed">
                      {p.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            >
              Back
            </button>
            <button
              onClick={handleStartSync}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold transition-all shadow-xs"
            >
              <span>Sync Telemetry & Calibrate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SYNC & CALIBRATE DATA */}
      {currentStep === 3 && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto">
            <ChakraMotif size={36} className="text-slate-900 dark:text-amber-400" animate={true} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.syncingData}</h2>
            <p className="text-xs text-slate-500 font-mono-num">
              Establishing 50Hz CT zero-crossing baseline · Sampling noise floor
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-800">
              <div
                className="h-full bg-slate-900 dark:bg-white rounded-full transition-all duration-300 ease-out"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono-num text-slate-500">
              <span>Calibrating Clamp</span>
              <span className="text-slate-900 dark:text-emerald-400 font-bold">{syncProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS & LAUNCH */}
      {currentStep === 4 && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/40 shadow-xs text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-9 h-9 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.pairingSuccess}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Box <strong>{foundBoxId}</strong> is now securely transmitting live current, vibration, and temperature telemetry over Wi-Fi.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 max-w-sm mx-auto text-xs text-left space-y-1.5 font-mono-num">
            <div className="flex justify-between text-slate-500">
              <span>Machine:</span>
              <span className="text-slate-900 dark:text-white font-bold">{machineName}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Category:</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold uppercase">{selectedProfile}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Initial Current:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">28.4 A (Nominal)</span>
            </div>
          </div>

          <button
            onClick={handleFinishPairing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold transition-all shadow-xs"
          >
            <span>Launch Machine Digital Twin</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
