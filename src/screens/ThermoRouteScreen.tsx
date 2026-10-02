import React, { useState, useEffect, useRef } from 'react';
import { useFactory } from '../context/FactoryContext';
import {
  Zap, Settings, Activity,
  AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, BarChart3,
  Gauge, BrainCircuit, Flame, Waves, Cpu, Clock, Battery
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────
interface ThermoData {
  furnaceTemp: number;
  wasteHeatKW: number;
  recoveredHeatKW: number;
  recoveryEfficiency: number;
  flowRate: number;
  pressure: number;
  hxOutletTemp: number;
  loopTemp: number;
  returnTemp: number;
  processBTemp: number;
  processBTarget: number;
  processBDemandKW: number;
  storageSOC: number;
  storageChargeKW: number;
  orcInputKW: number;
  orcOutputKW: number;
  orcEfficiency: number;
  routeToProcessB: number;
  routeToStorage: number;
  routeToORC: number;
  gridAvoidedKW: number;
  co2AvoidedToday: number;
  costSavedToday: number;
  aiStage: number;
  aiConfidence: number;
}

const SCENARIOS: Record<string, { label: string; desc: string }> = {
  normal:       { label: 'Normal Recovery',      desc: 'Balanced routing across all pathways.' },
  highDemandB:  { label: 'High Process B Demand',desc: 'AI prioritises Process B heat reuse.' },
  storageEmpty: { label: 'Storage Empty',        desc: 'AI prioritises charging storage first.' },
  storageFull:  { label: 'Storage Full',         desc: 'More heat diverted to ORC generation.' },
  highTariff:   { label: 'High Tariff',          desc: 'ORC preference increases for revenue.' },
  furnaceDrop:  { label: 'Furnace Load Drop',    desc: 'Available heat suddenly decreases.' },
  fouling:      { label: 'HX Fouling',           desc: 'Recovery efficiency drops to ~38%.' },
  orcOffline:   { label: 'ORC Offline',          desc: 'AI reroutes heat to reuse and storage.' },
  highSurplus:  { label: 'High Heat Surplus',    desc: 'ORC runs at increased capacity.' },
};

const AI_STAGES = [
  'Heat Availability Prediction',
  'Heat Demand Prediction',
  'Heat Quality Classification',
  'Route Optimisation',
  'Safety / Constraint Check',
  'Control Decision',
];

function computeSimData(scenario: string, prev: ThermoData, tick: number): ThermoData {
  const f = (a: number, b: number) => a + (Math.random() - 0.5) * b;
  let furnaceTemp = f(340, 8);
  let wasteHeatKW = f(500, 20);
  let recEfficiency = 0.60;
  let processBDemand = f(80, 8);
  let storageSOC = prev.storageSOC;
  let orcAvail = true;

  if (scenario === 'highDemandB')  { processBDemand = f(160, 10); }
  if (scenario === 'storageEmpty') { storageSOC = Math.max(3, prev.storageSOC - 0.5); }
  if (scenario === 'storageFull')  { storageSOC = Math.min(98, prev.storageSOC + 0.3); }
  if (scenario === 'furnaceDrop')  { wasteHeatKW = f(220, 15); furnaceTemp = f(260, 10); }
  if (scenario === 'fouling')      { recEfficiency = 0.38; }
  if (scenario === 'orcOffline')   { orcAvail = false; }
  if (scenario === 'highSurplus')  { wasteHeatKW = f(700, 20); }

  const recoveredHeatKW = Math.round(wasteHeatKW * recEfficiency);
  let toProcessB = 0, toStorage = 0, toORC = 0;
  let remaining = recoveredHeatKW;

  toProcessB = Math.min(remaining, processBDemand * 1.1);
  remaining -= toProcessB;
  const storageRate = Math.min(remaining, scenario === 'storageFull' ? 10 : 70);
  toStorage = orcAvail ? Math.min(remaining, storageRate) : remaining;
  remaining -= toStorage;
  toORC = orcAvail ? Math.max(0, remaining) : 0;

  const orcEff = 0.12 + Math.random() * 0.02;
  const orcOutput = orcAvail ? toORC * orcEff : 0;
  const newSOC = Math.max(5, Math.min(97, storageSOC + (toStorage - 20) * 0.005));

  return {
    furnaceTemp:       Math.round(f(furnaceTemp, 3)),
    wasteHeatKW:       Math.round(wasteHeatKW),
    recoveredHeatKW:   Math.round(recoveredHeatKW),
    recoveryEfficiency: Math.round(recEfficiency * 100),
    flowRate:          parseFloat(f(1.8, 0.1).toFixed(2)),
    pressure:          parseFloat(f(3.4, 0.15).toFixed(1)),
    hxOutletTemp:      Math.round(f(182, 5)),
    loopTemp:          Math.round(f(174, 4)),
    returnTemp:        Math.round(f(104, 3)),
    processBTemp:      Math.round(f(63, 1.5)),
    processBTarget:    65,
    processBDemandKW:  Math.round(processBDemand),
    storageSOC:        Math.round(newSOC),
    storageChargeKW:   Math.round(toStorage),
    orcInputKW:        Math.round(toORC),
    orcOutputKW:       parseFloat(orcOutput.toFixed(1)),
    orcEfficiency:     parseFloat((orcEff * 100).toFixed(1)),
    routeToProcessB:   Math.round(toProcessB),
    routeToStorage:    Math.round(toStorage),
    routeToORC:        Math.round(toORC),
    gridAvoidedKW:     Math.round(toProcessB + orcOutput),
    co2AvoidedToday:   Math.round(prev.co2AvoidedToday + 0.8),
    costSavedToday:    Math.round(prev.costSavedToday + 4.2),
    aiStage:           tick % AI_STAGES.length,
    aiConfidence:      Math.round(f(87, 4)),
  };
}

// ─── Sub-Components ────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string; value: string | number; unit?: string; sub?: string;
  color?: string; icon?: React.ReactNode;
}> = ({ label, value, unit, sub, color = 'text-slate-800 dark:text-white', icon }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm">
    <div className="flex items-start justify-between mb-1">
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">{label}</span>
      {icon && <span className="opacity-60">{icon}</span>}
    </div>
    <div className={`text-xl font-bold font-mono-num ${color} leading-none flex items-baseline gap-1 mt-1`}>
      {value}
      {unit && <span className="text-xs text-slate-400 font-normal">{unit}</span>}
    </div>
    {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
  </div>
);

const MiniChart: React.FC<{ history: number[]; color: string; label: string; unit: string }> = ({
  history, color, label, unit
}) => {
  const min = Math.min(...history);
  const max = Math.max(...history) || 1;
  const range = max - min || 1;
  const w = 260; const h = 55;
  const pts = history.map((v, i) =>
    `${(i / (history.length - 1)) * w},${h - ((v - min) / range) * (h - 8)}`
  ).join(' ');
  const last = history[history.length - 1];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 p-3 shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-bold font-mono-num" style={{ color }}>{typeof last === 'number' ? last.toFixed(1) : last} {unit}</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12">
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.12"/>
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

interface TimelineEvent { time: string; msg: string; type: 'info' | 'warn' | 'ok' }

// ─── Animated Thermal Flow SVG ─────────────────────────────────────────────
const ThermalFlowDiagram: React.FC<{ data: ThermoData; tick: number }> = ({ data, tick }) => {
  const bPct = data.recoveredHeatKW > 0 ? data.routeToProcessB / data.recoveredHeatKW : 0;
  const sPct = data.recoveredHeatKW > 0 ? data.routeToStorage / data.recoveredHeatKW : 0;
  const oPct = data.recoveredHeatKW > 0 ? data.routeToORC / data.recoveredHeatKW : 0;
  const pOff = (tick * 3.5) % 100;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <svg viewBox="0 0 900 400" className="w-full" style={{ minHeight: 280 }}>
        <defs>
          <pattern id="trgrid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0L0 0 0 28" fill="none" stroke="rgba(148,163,184,0.07)" strokeWidth="0.5"/>
          </pattern>
          <filter id="trGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="trFurnace" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#9a3412" stopOpacity="0.8"/>
          </linearGradient>
          <linearGradient id="trHotPipe" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f97316"/><stop offset="100%" stopColor="#fbbf24"/>
          </linearGradient>
        </defs>
        <rect width="900" height="400" fill="url(#trgrid)"/>

        {/* Furnace */}
        <g transform="translate(28, 130)">
          <rect x="0" y="0" width="105" height="130" rx="8" fill="url(#trFurnace)" opacity="0.92"/>
          <rect x="10" y="10" width="85" height="70" rx="4" fill="rgba(0,0,0,0.35)"/>
          {[0,1,2].map(i => (
            <ellipse key={i} cx={28 + i * 24} cy={50 - Math.sin((tick * 0.4) + i) * 7}
              rx="9" ry={13 + Math.sin((tick * 0.5) + i * 1.2) * 3}
              fill={i % 2 === 0 ? '#fbbf24' : '#f97316'} opacity="0.85" filter="url(#trGlow)"/>
          ))}
          <text x="52" y="100" textAnchor="middle" fill="#fed7aa" fontSize="9" fontWeight="700">FURNACE</text>
          <text x="52" y="113" textAnchor="middle" fill="#fb923c" fontSize="9" fontFamily="monospace">{data.furnaceTemp}°C</text>
          <text x="52" y="124" textAnchor="middle" fill="#fde68a" fontSize="8" fontFamily="monospace">{data.wasteHeatKW} kWth</text>
        </g>

        {/* Furnace → HX pipe */}
        <path d="M133 193 L193 193" stroke="#f97316" strokeWidth="8" strokeLinecap="round"/>
        {[0, 30, 60].map(off => (
          <circle key={off} cx={133 + ((pOff + off) % 60)} cy={193} r="3.5"
            fill="#fbbf24" opacity="0.9" filter="url(#trGlow)"/>
        ))}

        {/* Heat Exchanger */}
        <g transform="translate(193, 148)">
          <rect x="0" y="0" width="95" height="90" rx="8" fill="#1e3a5f" stroke="#38bdf8" strokeWidth="1.5"/>
          <path d="M10 18 Q47 8 84 18 Q47 28 10 38 Q47 48 84 58 Q47 68 10 78"
            fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.55"/>
          <text x="47" y="-7" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="700">HEAT EXCHANGER</text>
          <text x="47" y="104" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">η: {data.recoveryEfficiency}%</text>
          <text x="47" y="114" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace">{data.recoveredHeatKW} kWth</text>
        </g>

        {/* HX → AI Controller pipe */}
        <path d="M288 193 L410 193" stroke="#f97316" strokeWidth="5" strokeLinecap="round" opacity="0.7"/>
        {[0, 40, 80].map(off => (
          <circle key={off} cx={288 + ((pOff * 1.1 + off) % 122)} cy={193} r="3"
            fill="#f97316" opacity="0.88"/>
        ))}
        {/* sensor dots */}
        {[330, 370].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={193} r="5.5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5"/>
            <circle cx={x} cy={193} r="2.2" fill="#38bdf8"
              opacity={0.7 + Math.sin(tick * 0.3 + i) * 0.3}/>
          </g>
        ))}
        <text x="349" y="179" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">
          {data.loopTemp}°C · {data.flowRate}kg/s · {data.pressure}bar
        </text>

        {/* AI Controller */}
        <g transform="translate(410, 118)">
          <rect x="0" y="0" width="125" height="150" rx="10" fill="#0f172a" stroke="#6366f1" strokeWidth="2"
            filter="url(#trGlow)"/>
          <rect x="-2" y="-2" width="129" height="154" rx="12" fill="none" stroke="#818cf8"
            strokeWidth="1" opacity={0.35 + Math.sin(tick * 0.2) * 0.25}/>
          <text x="62" y="18" textAnchor="middle" fill="#a5b4fc" fontSize="8" fontWeight="700" letterSpacing="1">THERMOROUTE AI</text>
          {AI_STAGES.map((stage, i) => (
            <g key={i} transform={`translate(8, ${26 + i * 20})`}>
              <rect width="109" height="16" rx="3"
                fill={data.aiStage >= i ? '#312e81' : '#1e1b4b'}
                stroke={data.aiStage === i ? '#6366f1' : 'transparent'} strokeWidth="1"/>
              <circle cx="7" cy="8" r="3.5"
                fill={data.aiStage > i ? '#34d399' : data.aiStage === i ? '#818cf8' : '#475569'}
                opacity={data.aiStage === i ? 0.65 + Math.sin(tick * 0.5) * 0.35 : 1}/>
              <text x="16" y="11" fill={data.aiStage >= i ? '#e0e7ff' : '#475569'} fontSize="6.5">
                {stage}
              </text>
            </g>
          ))}
          <text x="62" y="148" textAnchor="middle" fill="#6366f1" fontSize="7" fontFamily="monospace">
            {data.aiConfidence}% confidence
          </text>
        </g>

        {/* AI → 3-way valve line */}
        <path d="M535 193 L600 193" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="5 3"/>

        {/* 3-way valve */}
        <g transform="translate(600, 173)">
          <polygon points="0,0 40,20 0,40" fill="#1e293b" stroke="#f97316" strokeWidth="2"/>
          <circle cx="14" cy="20" r="5" fill="#f97316" opacity={0.7 + Math.sin(tick * 0.4) * 0.3}/>
          <text x="20" y="-5" textAnchor="middle" fill="#94a3b8" fontSize="7">3-WAY VALVE</text>
        </g>

        {/* Route A: Process B */}
        <path d="M640 175 L700 95 L790 95"
          stroke="#34d399" strokeWidth={2 + bPct * 6} fill="none" strokeLinecap="round"/>
        {bPct > 0.05 && [0, 55].map(off => (
          <circle key={off} cx={640 + ((pOff + off) % 110) * 0.9} cy={175 - ((pOff + off) % 110) * 0.72}
            r="3" fill="#34d399" opacity="0.9"/>
        ))}

        {/* Route B: Storage */}
        <path d="M640 193 L790 193"
          stroke="#fbbf24" strokeWidth={2 + sPct * 6} fill="none" strokeLinecap="round"/>
        {sPct > 0.05 && [0, 50].map(off => (
          <circle key={off} cx={640 + ((pOff * 0.9 + off) % 150)} cy={193}
            r="3" fill="#fbbf24" opacity="0.88"/>
        ))}

        {/* Route C: ORC */}
        <path d="M640 211 L700 295 L790 295"
          stroke="#f97316" strokeWidth={2 + oPct * 6} fill="none" strokeLinecap="round"/>
        {oPct > 0.05 && [0, 55].map(off => (
          <circle key={off} cx={640 + ((pOff + off) % 110) * 0.9} cy={211 + ((pOff + off) % 110) * 0.77}
            r="3" fill="#f97316" opacity="0.85"/>
        ))}

        {/* Process B box */}
        <g transform="translate(790, 55)">
          <rect x="0" y="0" width="85" height="75" rx="8" fill="#064e3b" stroke="#34d399" strokeWidth="1.5"/>
          <text x="42" y="15" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="700">PROCESS B</text>
          <text x="42" y="28" textAnchor="middle" fill="#94a3b8" fontSize="7">Wash/Dry/Preheat</text>
          <text x="42" y="45" textAnchor="middle" fill="#34d399" fontSize="11" fontFamily="monospace" fontWeight="700">
            {data.processBTemp}°C
          </text>
          <text x="42" y="58" textAnchor="middle" fill="#6ee7b7" fontSize="7">Target: {data.processBTarget}°C</text>
          <text x="42" y="69" textAnchor="middle" fill="#a7f3d0" fontSize="7">{data.routeToProcessB} kWth</text>
        </g>

        {/* Storage box */}
        <g transform="translate(790, 153)">
          <rect x="0" y="0" width="85" height="75" rx="8" fill="#1c1917" stroke="#fbbf24" strokeWidth="1.5"/>
          <rect x="5" y={5 + (1 - data.storageSOC / 100) * 58} width="75"
            height={data.storageSOC / 100 * 58} rx="3" fill="#fbbf24" opacity="0.28"/>
          <text x="42" y="16" textAnchor="middle" fill="#fde68a" fontSize="7" fontWeight="700">THERMAL STORAGE</text>
          <text x="42" y="42" textAnchor="middle" fill="#fbbf24" fontSize="13" fontFamily="monospace" fontWeight="700">
            {data.storageSOC}%
          </text>
          <text x="42" y="58" textAnchor="middle" fill="#94a3b8" fontSize="7">{data.storageChargeKW} kW</text>
          <text x="42" y="69" textAnchor="middle" fill="#78716c" fontSize="6.5">500 kWhth cap</text>
        </g>

        {/* ORC box */}
        <g transform="translate(790, 255)">
          <rect x="0" y="0" width="85" height="80" rx="8" fill="#1e1b4b" stroke="#f97316" strokeWidth="1.5"/>
          <text x="42" y="14" textAnchor="middle" fill="#c7d2fe" fontSize="8" fontWeight="700">ORC MODULE</text>
          {[0,60,120,180,240,300].map((angle, i) => (
            <line key={i} x1="42" y1="38"
              x2={42 + Math.cos((angle + tick * 6) * Math.PI / 180) * 11}
              y2={38 + Math.sin((angle + tick * 6) * Math.PI / 180) * 11}
              stroke="#f97316" strokeWidth="2.5" strokeLinecap="round"/>
          ))}
          <circle cx="42" cy="38" r="5" fill="#f97316" opacity="0.85"/>
          <text x="42" y="57" textAnchor="middle" fill="#fb923c" fontSize="9" fontFamily="monospace" fontWeight="700">
            {data.orcOutputKW} kWe
          </text>
          <text x="42" y="68" textAnchor="middle" fill="#94a3b8" fontSize="7">η: {data.orcEfficiency}%</text>
          <text x="42" y="78" textAnchor="middle"
            fill={data.orcInputKW > 10 ? '#6ee7b7' : '#ef4444'} fontSize="7" fontWeight="600">
            {data.orcInputKW > 10 ? '● ACTIVE' : '○ STANDBY'}
          </text>
        </g>

        {/* Return loop */}
        <path d="M875 335 L875 380 L55 380 L55 260"
          stroke="#60a5fa" strokeWidth="3.5" fill="none" strokeDasharray="7 4" opacity="0.5"/>
        <text x="60" y="376" fill="#60a5fa" fontSize="7" fontFamily="monospace">← Return {data.returnTemp}°C</text>
      </svg>
    </div>
  );
};

// ─── Sankey ────────────────────────────────────────────────────────────────
const SankeyFlow: React.FC<{ data: ThermoData }> = ({ data }) => {
  const total = data.wasteHeatKW || 1;
  const rejected = total - data.recoveredHeatKW;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-orange-500"/> Energy Flow — Sankey
      </h3>
      <svg viewBox="0 0 500 190" className="w-full h-44">
        {/* Source */}
        <rect x="2" y="55" width="78" height="80" rx="6" fill="#f97316" opacity="0.88"/>
        <text x="41" y="93" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">Waste Heat</text>
        <text x="41" y="106" textAnchor="middle" fill="#fed7aa" fontSize="8" fontFamily="monospace">{total} kWth</text>

        {/* main stream */}
        <path d={`M80 95 C150 95 150 95 195 95`}
          stroke="#f97316" strokeWidth={Math.max(4, data.recoveredHeatKW / total * 28)} fill="none" opacity="0.8"/>

        {/* rejected */}
        <path d={`M80 115 C140 150 170 165 215 165`}
          stroke="#94a3b8" strokeWidth={Math.max(2, rejected / total * 18)} fill="none" opacity="0.5"/>
        <text x="220" y="170" fill="#94a3b8" fontSize="7" fontFamily="monospace">Rejected {rejected} kWth</text>

        <circle cx="205" cy="95" r="7" fill="#6366f1" opacity="0.9"/>

        {/* Process B */}
        <path d={`M212 88 C268 55 305 50 348 50`}
          stroke="#34d399" strokeWidth={Math.max(2, data.routeToProcessB / total * 20)} fill="none" opacity="0.85"/>
        <rect x="348" y="30" width="80" height="40" rx="4" fill="#064e3b"/>
        <text x="388" y="47" textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="700">Process B</text>
        <text x="388" y="60" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace">{data.routeToProcessB} kWth</text>

        {/* Storage */}
        <path d={`M212 95 L348 95`}
          stroke="#fbbf24" strokeWidth={Math.max(2, data.routeToStorage / total * 20)} fill="none" opacity="0.85"/>
        <rect x="348" y="80" width="80" height="30" rx="4" fill="#292524"/>
        <text x="388" y="94" textAnchor="middle" fill="#fde68a" fontSize="8" fontWeight="700">Storage</text>
        <text x="388" y="105" textAnchor="middle" fill="#fbbf24" fontSize="8" fontFamily="monospace">{data.routeToStorage} kWth</text>

        {/* ORC */}
        <path d={`M212 102 C268 135 305 140 348 140`}
          stroke="#f97316" strokeWidth={Math.max(2, data.routeToORC / total * 20)} fill="none" opacity="0.85"/>
        <rect x="348" y="125" width="80" height="35" rx="4" fill="#1e1b4b"/>
        <text x="388" y="140" textAnchor="middle" fill="#c7d2fe" fontSize="8" fontWeight="700">ORC</text>
        <text x="388" y="150" textAnchor="middle" fill="#f97316" fontSize="8" fontFamily="monospace">{data.routeToORC} kWth</text>
        <text x="388" y="160" textAnchor="middle" fill="#fde68a" fontSize="7" fontFamily="monospace">→ {data.orcOutputKW} kWe</text>
      </svg>
    </div>
  );
};

// ─── Event Timeline ────────────────────────────────────────────────────────
const EventTimeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => (
  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
    {events.slice().reverse().map((ev, i) => (
      <div key={i} className="flex gap-3 items-start text-xs">
        <span className="font-mono-num text-slate-400 shrink-0 pt-0.5 w-10">{ev.time}</span>
        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
          ev.type === 'ok' ? 'bg-emerald-500' : ev.type === 'warn' ? 'bg-amber-500' : 'bg-blue-500'
        }`}/>
        <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{ev.msg}</span>
      </div>
    ))}
  </div>
);

// ─── Main Screen ───────────────────────────────────────────────────────────
export const ThermoRouteScreen: React.FC = () => {
  const { tariffRateINR } = useFactory();
  const [scenario, setScenario] = useState('normal');
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'analytics' | 'events'>('overview');
  const tickRef = useRef(0);

  const [data, setData] = useState<ThermoData>({
    furnaceTemp: 340, wasteHeatKW: 500, recoveredHeatKW: 300,
    recoveryEfficiency: 60, flowRate: 1.8, pressure: 3.4,
    hxOutletTemp: 182, loopTemp: 174, returnTemp: 104,
    processBTemp: 63, processBTarget: 65, processBDemandKW: 80,
    storageSOC: 64, storageChargeKW: 60, orcInputKW: 151,
    orcOutputKW: 18.7, orcEfficiency: 12.4,
    routeToProcessB: 89, routeToStorage: 60, routeToORC: 151,
    gridAvoidedKW: 98.7, co2AvoidedToday: 0, costSavedToday: 0,
    aiStage: 0, aiConfidence: 87,
  });

  const [chartHistory, setChartHistory] = useState<Record<string, number[]>>({
    wasteHeat: Array(30).fill(500),
    recovered: Array(30).fill(300),
    orcOutput: Array(30).fill(18.7),
    storageSOC: Array(30).fill(64),
    gridAvoided: Array(30).fill(98.7),
    costSaved: Array(30).fill(0),
  });

  const [events, setEvents] = useState<TimelineEvent[]>([
    { time: '10:12', msg: 'Furnace waste heat increased to 500 kWth', type: 'info' },
    { time: '10:14', msg: 'Heat recovery reached 302 kW', type: 'ok' },
    { time: '10:16', msg: 'Process-B heat demand detected (80 kW)', type: 'info' },
    { time: '10:17', msg: 'AI rerouted 89 kWth to Process B', type: 'ok' },
    { time: '10:23', msg: 'Storage reached 64%', type: 'info' },
    { time: '10:24', msg: 'ORC activated — sufficient thermal input', type: 'ok' },
    { time: '10:25', msg: 'Generator output: 18.7 kWe', type: 'ok' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      setData(prev => {
        const next = computeSimData(scenario, prev, tick);
        if (tick % 12 === 0) {
          const now = new Date();
          const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
          const opts: TimelineEvent[] = [
            { time: t, msg: `AI confidence: ${next.aiConfidence}%`, type: 'info' },
            { time: t, msg: `Route optimised — ${next.routeToProcessB} kWth → Process B`, type: 'ok' },
            { time: t, msg: `Storage SOC now ${next.storageSOC}%`, type: 'info' },
            { time: t, msg: `ORC generating ${next.orcOutputKW} kWe`, type: 'ok' },
          ];
          setEvents(p => [...p.slice(-20), opts[tick % opts.length]]);
        }
        setChartHistory(h => ({
          wasteHeat:   [...h.wasteHeat.slice(-29),   next.wasteHeatKW],
          recovered:   [...h.recovered.slice(-29),    next.recoveredHeatKW],
          orcOutput:   [...h.orcOutput.slice(-29),    next.orcOutputKW],
          storageSOC:  [...h.storageSOC.slice(-29),   next.storageSOC],
          gridAvoided: [...h.gridAvoided.slice(-29),  next.gridAvoidedKW],
          costSaved:   [...h.costSaved.slice(-29),    next.costSavedToday],
        }));
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [scenario]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'ai', label: 'AI Engine' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'events', label: 'Event Log' },
  ] as const;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-200 dark:border-orange-800 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500"/>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ThermoRoute AI</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700 uppercase tracking-wide">
              Simulation Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Predict · Capture · Route · Reuse · Generate — AI-Driven Waste Heat Recovery & Intelligent Thermal Routing
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">● Heat Recovery Active</span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700">● ORC Online</span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-700">AI: {data.aiConfidence}% conf.</span>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"><Settings className="w-3.5 h-3.5"/> Scenario:</span>
          {Object.entries(SCENARIOS).map(([key, { label }]) => (
            <button key={key} onClick={() => setScenario(key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                scenario === key
                  ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-orange-300'
              }`}>{label}</button>
          ))}
        </div>
        {scenario !== 'normal' && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3"/> {SCENARIOS[scenario].desc}
          </p>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <KpiCard label="Waste Heat" value={data.wasteHeatKW} unit="kWth" color="text-orange-600 dark:text-orange-400" icon={<Flame className="w-4 h-4 text-orange-500"/>}/>
        <KpiCard label="Heat Recovered" value={data.recoveredHeatKW} unit="kWth" color="text-blue-600 dark:text-blue-400" icon={<Activity className="w-4 h-4 text-blue-500"/>}/>
        <KpiCard label="Recovery Efficiency" value={`${data.recoveryEfficiency}%`} color={data.recoveryEfficiency >= 55 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} icon={<Gauge className="w-4 h-4 text-indigo-500"/>}/>
        <KpiCard label="Thermal Storage" value={`${data.storageSOC}%`} unit="SOC" color="text-amber-600 dark:text-amber-400" icon={<Battery className="w-4 h-4 text-amber-500"/>}/>
        <KpiCard label="ORC Output" value={data.orcOutputKW} unit="kWe" color="text-yellow-600 dark:text-yellow-400" icon={<Zap className="w-4 h-4 text-yellow-500"/>}/>
        <KpiCard label="Direct Reuse" value={data.routeToProcessB} unit="kWth" color="text-emerald-600 dark:text-emerald-400" icon={<Waves className="w-4 h-4 text-emerald-500"/>}/>
        <KpiCard label="Grid Avoided" value={data.gridAvoidedKW.toFixed(1)} unit="kW" color="text-emerald-600 dark:text-emerald-400" icon={<TrendingDown className="w-4 h-4 text-emerald-500"/>}/>
        <KpiCard label="CO₂ Avoided" value={data.co2AvoidedToday} unit="kg" sub="Today" color="text-green-600 dark:text-green-400"/>
        <KpiCard label="Cost Saved" value={`₹${data.costSavedToday}`} sub="Today" color="text-emerald-600 dark:text-emerald-400"/>
        <KpiCard label="Flow · Pressure" value={`${data.flowRate}`} unit="kg/s" sub={`${data.pressure} bar · ${data.loopTemp}°C`} icon={<Waves className="w-4 h-4 text-blue-500"/>}/>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-orange-500"/> Thermal Digital Twin — Live
              </h2>
              <span className="text-[10px] text-slate-400 font-mono-num animate-pulse">● LIVE SIM</span>
            </div>
            <ThermalFlowDiagram data={data} tick={tickRef.current}/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SankeyFlow data={data}/>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/50 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-3 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4"/> AI Heat Routing Decision
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Route to Process B', value: data.routeToProcessB, color: 'bg-emerald-500', pct: data.recoveredHeatKW > 0 ? data.routeToProcessB / data.recoveredHeatKW * 100 : 0 },
                  { label: 'Route to Storage', value: data.routeToStorage, color: 'bg-amber-500', pct: data.recoveredHeatKW > 0 ? data.routeToStorage / data.recoveredHeatKW * 100 : 0 },
                  { label: 'Route to ORC', value: data.routeToORC, color: 'bg-orange-500', pct: data.recoveredHeatKW > 0 ? data.routeToORC / data.recoveredHeatKW * 100 : 0 },
                ].map(r => (
                  <div key={r.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{r.label}</span>
                      <span className="font-mono-num font-bold text-slate-800 dark:text-white">{r.value} kWth</span>
                    </div>
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full ${r.color} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(100, r.pct)}%` }}/>
                    </div>
                    <div className="text-[10px] text-right text-slate-400 mt-0.5">{r.pct.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-white/60 dark:bg-slate-900/40 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <div className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 mb-1">Why this decision?</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {scenario === 'orcOffline'
                    ? 'ORC offline. All surplus redirected to storage and direct reuse. Maximising storage for predicted demand.'
                    : scenario === 'highDemandB'
                    ? 'High Process B demand detected. AI prioritises direct thermal reuse — highest energy quality match before ORC.'
                    : scenario === 'fouling'
                    ? 'HX fouling reduces recovery quality. ORC allocation reduced — degraded thermal quality lowers ORC efficiency. Maintenance advisory issued.'
                    : `Process B needs ${data.processBDemandKW} kW now. Remaining high-grade heat (${data.routeToORC} kWth) thermodynamically viable for ORC at η=${data.orcEfficiency}%.`
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800/40 p-4 shadow-sm">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                <Waves className="w-3.5 h-3.5"/> Process B — Direct Reuse
              </h4>
              <div className="space-y-2">
                {[['Incoming', `${data.returnTemp}°C`], ['Current', `${data.processBTemp}°C`], ['Target', `${data.processBTarget}°C`],
                  ['Heat Supplied', `${data.routeToProcessB} kWth`], ['Grid Displaced', `${data.processBDemandKW} kW`]].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between text-xs">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-mono-num font-semibold text-slate-800 dark:text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Grid Heating Avoided</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-mono-num">{data.processBDemandKW} kW</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-800/40 p-4 shadow-sm">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                <Battery className="w-3.5 h-3.5"/> Thermal Storage
              </h4>
              <div className="relative h-20 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden mb-3 border border-slate-200 dark:border-slate-700">
                <div className="absolute bottom-0 left-0 right-0 bg-amber-400/40 transition-all duration-1000"
                  style={{ height: `${data.storageSOC}%` }}/>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold font-mono-num text-amber-700 dark:text-amber-400">{data.storageSOC}%</span>
                </div>
              </div>
              <div className="space-y-1.5 text-xs">
                {[['Capacity', '500 kWhth'], ['Charging', `${data.storageChargeKW} kW`], ['Next demand', '120 kWh in ~2.2 hrs']].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-mono-num font-semibold text-slate-700 dark:text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-orange-200 dark:border-orange-800/40 p-4 shadow-sm">
              <h4 className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-3 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5"/> ORC Power Module
              </h4>
              <div className="space-y-1.5 text-xs mb-3">
                {[['Thermal input', `${data.orcInputKW} kWth`], ['ORC efficiency', `${data.orcEfficiency}%`],
                  ['Electrical output', `${data.orcOutputKW} kWe`],
                  ['Generator', data.orcInputKW > 10 ? 'ACTIVE' : 'STANDBY']].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className={`font-mono-num font-semibold ${k === 'Generator' ? (v === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600') : 'text-slate-700 dark:text-slate-300'}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-orange-600 dark:text-orange-400 text-center bg-orange-50 dark:bg-orange-950/30 rounded p-1.5">
                Evaporator → Expander → Generator → Condenser → Pump
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Engine Tab */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl border border-indigo-800/50 p-5 shadow-lg">
            <h3 className="text-sm font-bold text-indigo-300 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4"/> ThermoRoute AI — Live Processing
            </h3>
            <div className="space-y-2.5">
              {AI_STAGES.map((stage, i) => (
                <div key={i} className={`p-3 rounded-lg border transition-all duration-400 ${
                  data.aiStage > i ? 'border-emerald-800 bg-emerald-950/40'
                  : data.aiStage === i ? 'border-indigo-500 bg-indigo-950/60 shadow-[0_0_14px_rgba(99,102,241,0.35)]'
                  : 'border-slate-800 bg-slate-900/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      data.aiStage > i ? 'bg-emerald-600' : data.aiStage === i ? 'bg-indigo-600 animate-pulse' : 'bg-slate-700'
                    }`}>
                      {data.aiStage > i
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-white"/>
                        : <span className="text-[10px] text-white font-bold">{i + 1}</span>}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${data.aiStage >= i ? 'text-white' : 'text-slate-500'}`}>{stage}</div>
                      {data.aiStage === i && <div className="text-[10px] text-indigo-400 mt-0.5 animate-pulse">Processing…</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>Cycle: ~1.2s</span>
              <span className="font-mono-num text-indigo-400">Confidence: {data.aiConfidence}%</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wide">Live Sensor Inputs</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Furnace Exhaust', value: `${data.furnaceTemp}°C`, color: 'text-orange-500' },
                  { label: 'HX Outlet', value: `${data.hxOutletTemp}°C`, color: 'text-amber-500' },
                  { label: 'Loop Temp', value: `${data.loopTemp}°C`, color: 'text-orange-400' },
                  { label: 'Return Temp', value: `${data.returnTemp}°C`, color: 'text-blue-500' },
                  { label: 'Flow Rate', value: `${data.flowRate} kg/s`, color: 'text-blue-400' },
                  { label: 'Pressure', value: `${data.pressure} bar`, color: 'text-indigo-400' },
                  { label: 'Process B', value: `${data.processBTemp}°C`, color: 'text-emerald-500' },
                  { label: 'Storage SOC', value: `${data.storageSOC}%`, color: 'text-amber-500' },
                  { label: 'Tariff', value: `₹${tariffRateINR}/kWh`, color: 'text-slate-600 dark:text-slate-300' },
                  { label: 'ORC Status', value: data.orcInputKW > 10 ? 'READY' : 'STANDBY', color: data.orcInputKW > 10 ? 'text-emerald-500' : 'text-amber-500' },
                ].map(s => (
                  <div key={s.label} className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500">{s.label}</span>
                    <span className={`text-[11px] font-bold font-mono-num ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-800/50 p-4">
              <h3 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mb-2">AI Explanation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {scenario === 'fouling'
                  ? 'Heat exchanger fouling detected — recovery efficiency at ~38%. ORC allocation reduced as thermal quality is degraded. Maintenance advisory raised.'
                  : scenario === 'highTariff'
                  ? 'High electricity tariff: ORC electricity revenue exceeds equivalent gas cost. AI increases ORC allocation where thermodynamically justified.'
                  : `Process B requires ${data.processBDemandKW} kW immediately. Direct thermal reuse carries higher overall efficiency than ORC conversion. Storage has headroom for predicted 2-hr demand. Remaining ${data.routeToORC} kWth is viable for ORC at η=${data.orcEfficiency}%.`}
              </p>
              <div className="mt-2 text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                Decision: Process B → Storage → ORC
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <MiniChart history={chartHistory.wasteHeat} color="#f97316" label="Waste Heat Available" unit="kWth"/>
          <MiniChart history={chartHistory.recovered} color="#38bdf8" label="Heat Recovered" unit="kWth"/>
          <MiniChart history={chartHistory.orcOutput} color="#fbbf24" label="ORC Electrical Output" unit="kWe"/>
          <MiniChart history={chartHistory.storageSOC} color="#fb923c" label="Storage SOC" unit="%"/>
          <MiniChart history={chartHistory.gridAvoided} color="#34d399" label="Grid Energy Avoided" unit="kW"/>
          <MiniChart history={chartHistory.costSaved} color="#a78bfa" label="Cumulative Cost Saved" unit="₹"/>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500"/> ThermoRoute Event Timeline
          </h3>
          <EventTimeline events={events}/>
        </div>
      )}

      {/* Connected Intelligence */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide flex items-center gap-2">
          <Activity className="w-3.5 h-3.5"/> Connected Smart Factory Intelligence
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { name: 'Machine Intelligence', sub: 'Real-time machine health', active: false },
            { name: 'ThermoRoute AI', sub: 'Waste-heat routing', active: true },
            { name: 'SolarSync AI', sub: 'Renewable optimisation', active: false },
            { name: 'FuelFlex AI', sub: 'Fuel switching', active: false },
          ].map(m => (
            <div key={m.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
              m.active
                ? 'bg-orange-50 border-orange-300 text-orange-700 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-300'
                : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${m.active ? 'bg-orange-500 animate-pulse' : 'bg-slate-400'}`}/>
              <div>
                <div className="font-semibold">{m.name}</div>
                <div className="text-[10px] opacity-70">{m.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
