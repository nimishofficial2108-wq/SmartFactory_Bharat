import React, { useState, useEffect, useRef } from 'react';
import { useFactory } from '../context/FactoryContext';
import {
  Flame, Zap, Leaf, Settings, Activity, BrainCircuit, CheckCircle2,
  AlertTriangle, XCircle, TrendingDown, TrendingUp, BarChart3,
  Clock, Gauge, Thermometer
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────
interface FuelOption {
  id: string;
  name: string;
  feasible: boolean;
  reason?: string;
  costFactor: number;    // relative 1=same as current
  co2Factor: number;     // relative 1=same
  retrofitComplexity: 'Low' | 'Medium' | 'High' | 'N/A';
  processFit: 'High' | 'Medium' | 'Low' | 'Rejected';
  paybackYears?: number;
  capexL?: string;
}

interface FuelFlexData {
  processTemp: number;
  processHeatDemand: number;
  currentFuelConsumption: number;
  fuelCostPerHr: number;
  scope1KgPerHr: number;
  scope2KgPerHr: number;
  renewableFraction: number;
  wasteHeatAvailable: number;
  aiConfidence: number;
  aiStage: number;
  recommendation: string;
  recommendedFuel: string;
  co2ReductionPct: number;
  costDeltaPct: number;
  paybackYears: number;
  capex: string;
}

interface IndustryProfile {
  name: string;
  processTemp: number;
  fuelType: string;
  heatDemandKW: number;
  primaryOptions: string[];
  notes: string;
}

const INDUSTRY_PROFILES: Record<string, IndustryProfile> = {
  metalForging:   { name: 'Metal / Forging',         processTemp: 1100, fuelType: 'Furnace Oil', heatDemandKW: 500, primaryOptions: ['induction', 'electricFurnace', 'naturalGas'], notes: 'Induction heating is high fit for metal heating processes.' },
  dairy:          { name: 'Dairy / Food Processing',  processTemp: 90,   fuelType: 'LPG',         heatDemandKW: 150, primaryOptions: ['heatPump', 'biogas', 'electricBoiler'], notes: 'Heat pump viable. Biogas strong candidate.' },
  textile:        { name: 'Textile',                  processTemp: 160,  fuelType: 'Coal',         heatDemandKW: 300, primaryOptions: ['electricBoiler', 'biomass', 'heatPump'], notes: 'Electrified steam via heat pump or electric boiler.' },
  ceramic:        { name: 'Ceramic / Glass',          processTemp: 1200, fuelType: 'Furnace Oil', heatDemandKW: 800, primaryOptions: ['electricFurnace', 'naturalGas', 'biogas'], notes: 'Hard-to-abate. Hybrid electrification and alternative fuels.' },
  cement:         { name: 'Cement',                   processTemp: 1450, fuelType: 'Coal',         heatDemandKW: 1200, primaryOptions: ['rdf', 'biomass', 'naturalGas'], notes: 'Process emissions significant. Fuel switch is partial solution.' },
  engineering:    { name: 'Engineering SME',          processTemp: 650,  fuelType: 'Furnace Oil', heatDemandKW: 300, primaryOptions: ['induction', 'solarElectric', 'naturalGas'], notes: 'Induction + solar electricity is optimal pathway.' },
  chemical:       { name: 'Chemical',                 processTemp: 350,  fuelType: 'Natural Gas',  heatDemandKW: 400, primaryOptions: ['electricResistance', 'heatPump', 'solarElectric'], notes: 'Electrification viable at this temperature range.' },
  utensil:        { name: 'Utensil / Cooker Mfg',    processTemp: 800,  fuelType: 'LPG',          heatDemandKW: 250, primaryOptions: ['induction', 'electricFurnace', 'biogas'], notes: 'Induction aluminium casting viable. Biogas for preheating.' },
};

const AI_STAGES_FUEL = [
  'Process Characterisation',
  'Temperature Requirement',
  'Available Energy Options',
  'Technical Feasibility',
  'CAPEX / OPEX Analysis',
  'Carbon Comparison',
  'Reliability Check',
  'Fuel-Switch Recommendation',
];

const SCENARIOS_FUEL: Record<string, { label: string; desc: string }> = {
  baseline:       { label: 'Furnace Oil Baseline',       desc: 'Current fossil fuel operation.' },
  naturalGas:     { label: 'Switch to Natural Gas',      desc: 'Bridge fuel transition scenario.' },
  fullElec:       { label: 'Full Electrification',       desc: 'Complete switch to grid electricity.' },
  solarElec:      { label: 'Solar + Electrification',    desc: 'Renewable-priority electric pathway.' },
  biogas:         { label: 'Biogas Available',           desc: 'Biogas supply integrated.' },
  highTariff:     { label: 'Electricity Tariff Spike',   desc: 'Grid cost increases; affects electrification economics.' },
  fuelPriceRise:  { label: 'Fossil Fuel Price Spike',    desc: 'Oil/LPG price increase accelerates switch.' },
  highSolar:      { label: 'High Solar Availability',    desc: 'SolarSync reports 85% renewable availability.' },
  hybridMode:     { label: 'Hybrid Mode',                desc: 'Partial electrification with fossil backup.' },
};

const AUTOPILOT_MODES = ['Lowest Cost', 'Lowest Carbon', 'Minimum CAPEX', 'Fastest Payback', 'Balanced'];

// Build fuel options table for a given industry + scenario
function buildFuelOptions(profile: IndustryProfile, scenario: string, autopilot: string): FuelOption[] {
  const temp = profile.processTemp;

  const base: Omit<FuelOption, 'feasible' | 'reason'>[] = [
    { id: 'currentFuel',      name: profile.fuelType + ' (Current)', costFactor: 1,    co2Factor: 1,    retrofitComplexity: 'N/A',    processFit: 'High',   paybackYears: 0,   capexL: '—' },
    { id: 'naturalGas',       name: 'Natural Gas',                   costFactor: 0.82, co2Factor: 0.74, retrofitComplexity: 'Low',    processFit: temp <= 1500 ? 'Medium' : 'Low', paybackYears: 2.5, capexL: '₹12L' },
    { id: 'electricResistance',name: 'Electric Resistance',          costFactor: scenario === 'highTariff' ? 1.4 : 0.95, co2Factor: 0.45, retrofitComplexity: 'Medium', processFit: temp <= 600 ? 'High' : 'Low', paybackYears: 4, capexL: '₹28L' },
    { id: 'induction',        name: 'Induction Heating',             costFactor: scenario === 'highTariff' ? 1.35 : 0.9, co2Factor: 0.38, retrofitComplexity: 'High',   processFit: temp >= 400 && temp <= 1200 ? 'High' : 'Low', paybackYears: 5, capexL: '₹55L' },
    { id: 'solarElectric',    name: 'Solar + Electrification',       costFactor: scenario === 'highSolar' ? 0.52 : 0.65, co2Factor: scenario === 'highSolar' ? 0.1 : 0.2, retrofitComplexity: 'High', processFit: temp <= 800 ? 'High' : 'Medium', paybackYears: 6.5, capexL: '₹85L' },
    { id: 'biogas',           name: 'Biogas',                        costFactor: 0.68, co2Factor: 0.3,  retrofitComplexity: 'Medium', processFit: temp <= 1000 ? 'Medium' : 'Low', paybackYears: 3.5, capexL: '₹35L' },
    { id: 'heatPump',         name: 'Heat Pump',                     costFactor: 0.7,  co2Factor: 0.35, retrofitComplexity: 'High',   processFit: temp <= 120 ? 'High' : 'Rejected', paybackYears: 4, capexL: '₹40L' },
    { id: 'electricFurnace',  name: 'Electric Furnace',              costFactor: scenario === 'highTariff' ? 1.45 : 1.05, co2Factor: 0.42, retrofitComplexity: 'High', processFit: temp >= 600 ? 'High' : 'Medium', paybackYears: 7, capexL: '₹120L' },
    { id: 'biomass',          name: 'Biomass / RDF',                 costFactor: 0.75, co2Factor: 0.25, retrofitComplexity: 'Medium', processFit: temp <= 1100 ? 'Medium' : 'Low', paybackYears: 3, capexL: '₹30L' },
  ];

  return base.map(opt => {
    const rejected = opt.processFit === 'Rejected';
    let reason: string | undefined;
    if (opt.id === 'heatPump' && temp > 120) {
      reason = `Process temperature ${temp}°C exceeds practical heat-pump range (≤120°C). NOT SUITABLE.`;
    }
    if (opt.id === 'electricResistance' && temp > 600) {
      reason = `High-temperature process requires more intensive solutions than electric resistance.`;
    }
    if (opt.id === 'biogas' && scenario !== 'biogas') {
      reason = opt.processFit !== 'Rejected' ? undefined : 'Biogas supply not confirmed in current scenario.';
    }
    return { ...opt, feasible: !rejected, reason };
  });
}

function computeFuelFlexData(profile: IndustryProfile, scenario: string, autopilot: string, prev: FuelFlexData, tick: number): FuelFlexData {
  const f = (a: number, b: number) => a + (Math.random() - 0.5) * b;
  let renewable = 62;
  let co2Reduction = 58;
  let costDelta = -22;
  let rec = 'Induction Heating + SolarSync AI';
  let recFuel = 'Electric Induction';

  if (scenario === 'naturalGas')    { co2Reduction = 28; costDelta = -18; rec = 'Switch to Natural Gas (Bridge Fuel)'; recFuel = 'Natural Gas'; }
  if (scenario === 'fullElec')      { co2Reduction = 55; costDelta = -10; rec = 'Full Grid Electrification'; recFuel = 'Grid Electricity'; }
  if (scenario === 'solarElec')     { co2Reduction = 82; costDelta = -35; renewable = 85; rec = 'Solar-Priority Electrification'; recFuel = 'Solar + Grid Electricity'; }
  if (scenario === 'biogas')        { co2Reduction = 68; costDelta = -28; rec = 'Biogas Firing (Drop-in)'; recFuel = 'Biogas'; }
  if (scenario === 'highTariff')    { co2Reduction = 30; costDelta = 15;  rec = 'Natural Gas (Tariff too high for full electrification)'; recFuel = 'Natural Gas'; }
  if (scenario === 'fuelPriceRise') { co2Reduction = 55; costDelta = -40; rec = 'Accelerated electrification — fossil price spike'; recFuel = 'Electric Induction'; }
  if (scenario === 'highSolar')     { co2Reduction = 88; costDelta = -45; renewable = 90; rec = 'Solar + Induction (High renewable availability)'; recFuel = 'Solar + Induction'; }
  if (scenario === 'hybridMode')    { co2Reduction = 42; costDelta = -18; rec = 'Hybrid: 60% Induction + 40% Fossil Backup'; recFuel = 'Hybrid'; }

  if (autopilot === 'Lowest Carbon') { co2Reduction = Math.min(95, co2Reduction + 8); }
  if (autopilot === 'Lowest Cost')   { costDelta = Math.min(-5, costDelta - 5); }
  if (autopilot === 'Minimum CAPEX') { rec = 'Natural Gas Retrofit (Lowest CAPEX)'; recFuel = 'Natural Gas'; co2Reduction = 28; }

  return {
    processTemp:           profile.processTemp,
    processHeatDemand:     Math.round(f(profile.heatDemandKW, 15)),
    currentFuelConsumption: Math.round(f(120, 8)),
    fuelCostPerHr:         Math.round(f(3800, 120)),
    scope1KgPerHr:         parseFloat(f(48, 3).toFixed(1)),
    scope2KgPerHr:         parseFloat(f(12, 2).toFixed(1)),
    renewableFraction:     Math.round(f(renewable, 3)),
    wasteHeatAvailable:    Math.round(f(70, 10)),
    aiConfidence:          Math.round(f(87, 4)),
    aiStage:               tick % AI_STAGES_FUEL.length,
    recommendation:        rec,
    recommendedFuel:       recFuel,
    co2ReductionPct:       Math.round(f(co2Reduction, 2)),
    costDeltaPct:          Math.round(f(costDelta, 2)),
    paybackYears:          parseFloat(f(4.5, 0.5).toFixed(1)),
    capex:                 '₹55–85L',
  };
}

// ─── Sub-Components ────────────────────────────────────────────────────────
const KpiCard: React.FC<{ label: string; value: string | number; unit?: string; sub?: string; color?: string; icon?: React.ReactNode }> = (
  { label, value, unit, sub, color = 'text-slate-800 dark:text-white', icon }
) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/60 p-4 shadow-sm">
    <div className="flex items-start justify-between mb-1">
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">{label}</span>
      {icon && <span className="opacity-60">{icon}</span>}
    </div>
    <div className={`text-xl font-bold font-mono-num ${color} flex items-baseline gap-1 mt-1`}>
      {value}{unit && <span className="text-xs text-slate-400 font-normal">{unit}</span>}
    </div>
    {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
  </div>
);

const MiniChart: React.FC<{ history: number[]; color: string; label: string; unit: string }> = ({ history, color, label, unit }) => {
  const min = Math.min(...history); const max = Math.max(...history) || 1; const range = max - min || 1;
  const w = 260; const h = 55;
  const pts = history.map((v, i) => `${(i / (history.length - 1)) * w},${h - ((v - min) / range) * (h - 8)}`).join(' ');
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
const EventTimeline: React.FC<{ events: TimelineEvent[] }> = ({ events }) => (
  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
    {events.slice().reverse().map((ev, i) => (
      <div key={i} className="flex gap-3 items-start text-xs">
        <span className="font-mono-num text-slate-400 shrink-0 pt-0.5 w-10">{ev.time}</span>
        <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${ev.type === 'ok' ? 'bg-emerald-500' : ev.type === 'warn' ? 'bg-amber-500' : 'bg-blue-500'}`}/>
        <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{ev.msg}</span>
      </div>
    ))}
  </div>
);

// Fuel switching animated flow SVG
const FuelFlowDiagram: React.FC<{ data: FuelFlexData; scenario: string; profile: IndustryProfile; tick: number }> = ({ data, scenario, profile, tick }) => {
  const pOff = (tick * 3) % 100;
  const isSolar = scenario === 'solarElec' || scenario === 'highSolar';
  const isBiogas = scenario === 'biogas';
  const isHybrid = scenario === 'hybridMode';
  const isNatGas = scenario === 'naturalGas';
  const isBaseline = scenario === 'baseline';

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <svg viewBox="0 0 860 340" className="w-full" style={{ minHeight: 240 }}>
        <defs>
          <pattern id="ffgrid" width="26" height="26" patternUnits="userSpaceOnUse">
            <path d="M26 0L0 0 0 26" fill="none" stroke="rgba(148,163,184,0.07)" strokeWidth="0.5"/>
          </pattern>
          <filter id="ffGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id="ffFossil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626"/><stop offset="100%" stopColor="#7f1d1d"/>
          </linearGradient>
          <linearGradient id="ffElec" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1"/><stop offset="100%" stopColor="#1e1b4b"/>
          </linearGradient>
          <linearGradient id="ffSolar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b"/><stop offset="100%" stopColor="#78350f"/>
          </linearGradient>
        </defs>
        <rect width="860" height="340" fill="url(#ffgrid)"/>

        {/* ── Energy sources (left column) ── */}
        {/* Fossil fuel tank */}
        <g transform="translate(20, 60)" opacity={isBaseline || isHybrid || isNatGas ? 1 : 0.3}>
          <rect x="0" y="0" width="80" height="90" rx="8" fill="url(#ffFossil)"/>
          <text x="40" y="22" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="700">FUEL TANK</text>
          <text x="40" y="36" textAnchor="middle" fill="#fca5a5" fontSize="8">{isBiogas ? 'Biogas' : isNatGas ? 'Nat. Gas' : profile.fuelType}</text>
          <text x="40" y="54" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace" fontWeight="700">
            {data.currentFuelConsumption}L/hr
          </text>
          <text x="40" y="68" textAnchor="middle" fill="#fca5a5" fontSize="7" fontFamily="monospace">
            {data.scope1KgPerHr} kg CO₂e/hr
          </text>
        </g>

        {/* Solar panel */}
        <g transform="translate(20, 170)" opacity={isSolar ? 1 : 0.2}>
          <rect x="0" y="0" width="80" height="70" rx="8" fill="url(#ffSolar)"/>
          {[0,1,2,3].map(i => (
            <rect key={i} x={8 + i * 17} y="12" width="12" height="45" rx="2"
              fill="#1e40af" stroke="#fbbf24" strokeWidth="0.8" opacity="0.85"/>
          ))}
          <text x="40" y="65" textAnchor="middle" fill="#fef3c7" fontSize="7" fontWeight="700">SOLAR PANELS</text>
          {isSolar && [0,20,40].map(off => (
            <circle key={off} cx={5 + ((pOff + off) % 75)} cy={35 - Math.sin((pOff + off) * 0.08) * 5}
              r="2.5" fill="#fbbf24" opacity="0.9" filter="url(#ffGlow)"/>
          ))}
        </g>

        {/* Grid supply */}
        <g transform="translate(20, 260)" opacity={!isBaseline ? 0.85 : 0.2}>
          <rect x="0" y="0" width="80" height="55" rx="8" fill="#1e293b" stroke="#6366f1" strokeWidth="1.5"/>
          <text x="40" y="20" textAnchor="middle" fill="#c7d2fe" fontSize="8" fontWeight="700">GRID SUPPLY</text>
          <text x="40" y="35" textAnchor="middle" fill="#818cf8" fontSize="7">Electricity</text>
          <text x="40" y="47" textAnchor="middle" fill="#6366f1" fontSize="8" fontFamily="monospace">
            {data.renewableFraction}% renewable
          </text>
        </g>

        {/* ── Flow lines to Process Hub ── */}
        {/* Fossil flow */}
        <path d="M100 105 C165 105 165 165 230 165"
          stroke={isBaseline || isHybrid || isNatGas ? '#dc2626' : '#374151'}
          strokeWidth={isBaseline || isHybrid || isNatGas ? 5 : 1.5}
          fill="none" strokeLinecap="round"/>
        {(isBaseline || isHybrid || isNatGas) && [0, 35, 70].map(off => (
          <circle key={off} cx={100 + ((pOff + off) % 90) * 1.4 * 0.9}
            cy={105 + ((pOff + off) % 90) * 0.67}
            r="3" fill="#ef4444" opacity="0.9"/>
        ))}

        {/* Solar flow */}
        <path d="M100 205 C165 205 165 175 230 165"
          stroke={isSolar ? '#f59e0b' : '#374151'}
          strokeWidth={isSolar ? 5 : 1.5} fill="none" strokeLinecap="round"/>
        {isSolar && [0, 35].map(off => (
          <circle key={off} cx={100 + ((pOff + off) % 90) * 1.1}
            cy={205 - ((pOff + off) % 90) * 0.44}
            r="3" fill="#fbbf24" opacity="0.9"/>
        ))}

        {/* Grid flow */}
        <path d="M100 287 C165 287 165 185 230 175"
          stroke={!isBaseline ? '#6366f1' : '#374151'}
          strokeWidth={!isBaseline ? 5 : 1.5} fill="none" strokeLinecap="round"/>
        {!isBaseline && [0, 40].map(off => (
          <circle key={off} cx={100 + ((pOff + off) % 90) * 1.1}
            cy={287 - ((pOff + off) % 90) * 1.24}
            r="3" fill="#818cf8" opacity="0.9"/>
        ))}

        {/* ── Power Electronics / Burner Node ── */}
        <g transform="translate(230, 140)">
          <rect x="0" y="0" width="90" height="60" rx="8"
            fill={isBaseline || isNatGas ? '#7f1d1d' : '#1e1b4b'}
            stroke={isBaseline || isNatGas ? '#dc2626' : '#6366f1'} strokeWidth="1.5"/>
          <text x="45" y="18" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">
            {isBaseline || isNatGas ? 'BURNER / COMBUSTION' : 'POWER ELECTRONICS'}
          </text>
          <text x="45" y="32" textAnchor="middle" fill="#94a3b8" fontSize="7">
            {isSolar ? 'Inverter + VFD' : isBaseline ? 'Oil Atomiser' : 'VFD + Rectifier'}
          </text>
          {[0,1,2].map(i => (
            <rect key={i} x={10 + i * 26} y="40" width="18" height="10" rx="2"
              fill={isBaseline ? '#ef4444' : '#6366f1'} opacity="0.7"/>
          ))}
        </g>

        {/* ── Heating Equipment ── */}
        <path d="M320 170 L400 170" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"/>
        {[0, 40].map(off => (
          <circle key={off} cx={322 + ((pOff * 1.1 + off) % 78)} cy={170}
            r="3" fill={isBaseline ? '#ef4444' : '#6366f1'} opacity="0.9"/>
        ))}

        <g transform="translate(400, 130)">
          <rect x="0" y="0" width="100" height="80" rx="8"
            fill="#0f172a" stroke={isBaseline ? '#ef4444' : '#6366f1'} strokeWidth="2"/>
          <text x="50" y="18" textAnchor="middle" fill="white" fontSize="8" fontWeight="700">
            {isSolar || !isBaseline && !isNatGas ? 'INDUCTION HEATER' : 'OIL/GAS BURNER'}
          </text>
          <text x="50" y="30" textAnchor="middle" fill="#94a3b8" fontSize="7">
            {isBaseline ? 'Combustion Chamber' : 'Electromagnetic Coil'}
          </text>
          {isBaseline ? (
            [0,1,2].map(i => (
              <ellipse key={i} cx={25 + i * 25} cy={55 - Math.sin((tick * 0.4) + i) * 6}
                rx="8" ry={10 + Math.sin((tick * 0.5) + i) * 3}
                fill={i % 2 === 0 ? '#fbbf24' : '#f97316'} opacity="0.85" filter="url(#ffGlow)"/>
            ))
          ) : (
            [0,1,2,3,4].map(i => (
              <line key={i} x1="50" y1="55"
                x2={50 + Math.cos((i * 72 + tick * 8) * Math.PI / 180) * 18}
                y2={55 + Math.sin((i * 72 + tick * 8) * Math.PI / 180) * 18}
                stroke="#6366f1" strokeWidth="2" strokeLinecap="round" filter="url(#ffGlow)"/>
            ))
          )}
        </g>

        {/* ── Furnace / Process ── */}
        <path d="M500 170 L590 170" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round"/>
        {[0, 40].map(off => (
          <circle key={off} cx={502 + ((pOff + off) % 88)} cy={170}
            r="3" fill="#f97316" opacity="0.9"/>
        ))}

        <g transform="translate(590, 100)">
          <rect x="0" y="0" width="115" height="140" rx="10" fill="#1c0a00" stroke="#f97316" strokeWidth="1.5"/>
          <text x="57" y="18" textAnchor="middle" fill="#fde68a" fontSize="8" fontWeight="700">INDUSTRIAL FURNACE</text>
          <text x="57" y="30" textAnchor="middle" fill="#94a3b8" fontSize="7">{profile.name}</text>
          <text x="57" y="60" textAnchor="middle" fill="#f97316" fontSize="16" fontFamily="monospace" fontWeight="700">
            {data.processTemp}°C
          </text>
          <text x="57" y="78" textAnchor="middle" fill="#94a3b8" fontSize="7">Process Temp</text>
          <text x="57" y="95" textAnchor="middle" fill="#fde68a" fontSize="8" fontFamily="monospace">
            {data.processHeatDemand} kWth
          </text>
          <text x="57" y="108" textAnchor="middle" fill="#94a3b8" fontSize="7">Heat Demand</text>
          {/* Thermal glow */}
          <ellipse cx="57" cy="70" rx="40" ry="30"
            fill="#f97316" opacity={0.06 + Math.sin(tick * 0.3) * 0.04}/>
        </g>

        {/* ThermoRoute waste-heat return */}
        <g transform="translate(590, 260)">
          <rect x="0" y="0" width="115" height="55" rx="8" fill="#064e3b" stroke="#34d399" strokeWidth="1"/>
          <text x="57" y="16" textAnchor="middle" fill="#6ee7b7" fontSize="7" fontWeight="700">THERMO ROUTE AI</text>
          <text x="57" y="30" textAnchor="middle" fill="#34d399" fontSize="8" fontFamily="monospace">
            {data.wasteHeatAvailable} kWth available
          </text>
          <text x="57" y="44" textAnchor="middle" fill="#a7f3d0" fontSize="7">Waste Heat Recovery</text>
        </g>
        <path d="M647 260 L647 240"
          stroke="#34d399" strokeWidth="2.5" strokeDasharray="4 3"/>

        {/* Scope 1 & 2 indicator */}
        <g transform="translate(730, 100)">
          <rect x="0" y="0" width="110" height="130" rx="8" fill="#0f172a" stroke="#374151" strokeWidth="1"/>
          <text x="55" y="16" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="700">EMISSIONS</text>
          <text x="55" y="36" textAnchor="middle" fill="#ef4444" fontSize="8">Scope 1</text>
          <text x="55" y="50" textAnchor="middle" fill="#fca5a5" fontSize="10" fontFamily="monospace" fontWeight="700">
            {isBaseline ? data.scope1KgPerHr : (data.scope1KgPerHr * 0.15).toFixed(1)} kg/hr
          </text>
          <rect x="15" y="58" width="80" height="6" rx="3" fill="#1e293b"/>
          <rect x="15" y="58" width={isBaseline ? 80 : 12} height="6" rx="3" fill="#ef4444"
            style={{ transition: 'width 1s' }}/>

          <text x="55" y="82" textAnchor="middle" fill="#818cf8" fontSize="8">Scope 2</text>
          <text x="55" y="96" textAnchor="middle" fill="#c7d2fe" fontSize="10" fontFamily="monospace" fontWeight="700">
            {(data.scope2KgPerHr * (isBaseline ? 1 : 1.8) * (isSolar ? 0.15 : 1)).toFixed(1)} kg/hr
          </text>
          <rect x="15" y="104" width="80" height="6" rx="3" fill="#1e293b"/>
          <rect x="15" y="104"
            width={isBaseline ? 20 : isSolar ? 8 : 50} height="6" rx="3" fill="#6366f1"
            style={{ transition: 'width 1s' }}/>

          <text x="55" y="122" textAnchor="middle" fill="#34d399" fontSize="7">
            {!isBaseline ? `▼ ${data.co2ReductionPct}% reduction` : 'Baseline'}
          </text>
        </g>
      </svg>
    </div>
  );
};

// Temperature Ladder visual
const TempLadder: React.FC<{ processTemp: number }> = ({ processTemp }) => {
  const bands = [
    { range: '<150°C', min: 0, max: 150, techs: 'Heat Pump, Solar Thermal, Recovered Heat', color: '#34d399' },
    { range: '150–400°C', min: 150, max: 400, techs: 'Electric Boiler, Resistance Heating, Hybrid', color: '#60a5fa' },
    { range: '400–1200°C', min: 400, max: 1200, techs: 'Induction, Electric Furnace, Biogas, Hybrids', color: '#f97316' },
    { range: '>1200°C', min: 1200, max: 1600, techs: 'Electric Arc, Alternative Fuels, Hydrogen (future)', color: '#ef4444' },
  ];
  const activeBand = bands.find(b => processTemp >= b.min && processTemp < b.max) || bands[3];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
        <Thermometer className="w-4 h-4 text-orange-500"/> Process Temperature Intelligence
        <span className="text-[10px] font-mono-num text-orange-500 ml-auto">{processTemp}°C</span>
      </h3>
      <div className="space-y-2">
        {bands.map(b => (
          <div key={b.range}
            className={`p-2.5 rounded-lg border transition-all ${
              b === activeBand
                ? 'border-2 shadow-sm'
                : 'border opacity-50'
            }`}
            style={{
              borderColor: b === activeBand ? b.color : 'transparent',
              backgroundColor: b === activeBand ? `${b.color}15` : undefined,
            }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: b.color }}>{b.range}</span>
              {b === activeBand && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${b.color}25`, color: b.color }}>
                  YOUR PROCESS
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.techs}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fuel options matrix
const FuelMatrix: React.FC<{ options: FuelOption[] }> = ({ options }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
      <BarChart3 className="w-4 h-4 text-indigo-500"/> Fuel Switching Matrix
    </h3>
    <div className="space-y-2">
      {options.map(opt => (
        <div key={opt.id} className={`p-3 rounded-lg border text-xs ${
          !opt.feasible
            ? 'border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20'
            : opt.id === 'currentFuel'
            ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900'
            : 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20'
        }`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {!opt.feasible
                ? <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5"/>
                : opt.id === 'currentFuel'
                ? <Gauge className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5"/>
                : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5"/>}
              <div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{opt.name}</div>
                {opt.reason && <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">{opt.reason}</div>}
              </div>
            </div>
            {opt.feasible && opt.id !== 'currentFuel' && (
              <div className="text-right shrink-0">
                <div className={`font-bold font-mono-num ${opt.co2Factor < 0.5 ? 'text-emerald-600' : opt.co2Factor < 0.8 ? 'text-amber-600' : 'text-slate-600'}`}>
                  CO₂: {((1 - opt.co2Factor) * 100).toFixed(0)}% ↓
                </div>
                {opt.capexL && <div className="text-[10px] text-slate-400">CAPEX: {opt.capexL}</div>}
                {opt.paybackYears && <div className="text-[10px] text-slate-400">PB: {opt.paybackYears}y</div>}
              </div>
            )}
          </div>
          {opt.feasible && (
            <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                opt.processFit === 'High' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : opt.processFit === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>Process Fit: {opt.processFit}</span>
              <span className="text-[10px] text-slate-500">Retrofit: {opt.retrofitComplexity}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Screen ───────────────────────────────────────────────────────────
export const FuelFlexScreen: React.FC = () => {
  const { tariffRateINR } = useFactory();
  const [scenario, setScenario] = useState('baseline');
  const [industry, setIndustry] = useState('engineering');
  const [autopilot, setAutopilot] = useState('Balanced');
  const [activeTab, setActiveTab] = useState<'overview' | 'ai' | 'analytics' | 'events'>('overview');
  const tickRef = useRef(0);

  const profile = INDUSTRY_PROFILES[industry];

  const [data, setData] = useState<FuelFlexData>({
    processTemp: 650, processHeatDemand: 300, currentFuelConsumption: 120,
    fuelCostPerHr: 3800, scope1KgPerHr: 48, scope2KgPerHr: 12,
    renewableFraction: 62, wasteHeatAvailable: 70, aiConfidence: 87, aiStage: 0,
    recommendation: 'Induction Heating + SolarSync AI',
    recommendedFuel: 'Electric Induction',
    co2ReductionPct: 58, costDeltaPct: -22, paybackYears: 4.5, capex: '₹55–85L',
  });

  const [chartHistory, setChartHistory] = useState<Record<string, number[]>>({
    scope1: Array(30).fill(48),
    scope2: Array(30).fill(12),
    fuelCost: Array(30).fill(3800),
    renewable: Array(30).fill(62),
    co2Reduction: Array(30).fill(58),
  });

  const [events, setEvents] = useState<TimelineEvent[]>([
    { time: '09:10', msg: 'Process profile loaded — Engineering SME, 650°C', type: 'info' },
    { time: '09:12', msg: 'Baseline fuel consumption: 120 L/hr furnace oil', type: 'info' },
    { time: '09:14', msg: '9 alternative energy pathways evaluated', type: 'ok' },
    { time: '09:16', msg: 'Heat pump rejected — 650°C exceeds application range', type: 'warn' },
    { time: '09:17', msg: 'Induction heating ranked feasible (High process fit)', type: 'ok' },
    { time: '09:18', msg: 'SolarSync AI: 62% renewable availability received', type: 'info' },
    { time: '09:20', msg: 'Recommendation: Induction + SolarSync — 58% CO₂ reduction', type: 'ok' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      setData(prev => {
        const next = computeFuelFlexData(profile, scenario, autopilot, prev, tick);
        if (tick % 12 === 0) {
          const now = new Date();
          const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
          const opts: TimelineEvent[] = [
            { time: t, msg: `AI confidence: ${next.aiConfidence}% — ${next.recommendedFuel}`, type: 'info' },
            { time: t, msg: `CO₂ reduction potential: ${next.co2ReductionPct}%`, type: 'ok' },
            { time: t, msg: `Renewable availability: ${next.renewableFraction}% (SolarSync)`, type: 'info' },
            { time: t, msg: `ThermoRoute: ${next.wasteHeatAvailable} kWth waste heat available`, type: 'ok' },
          ];
          setEvents(p => [...p.slice(-20), opts[tick % opts.length]]);
        }
        setChartHistory(h => ({
          scope1:      [...h.scope1.slice(-29),      next.scope1KgPerHr],
          scope2:      [...h.scope2.slice(-29),      next.scope2KgPerHr],
          fuelCost:    [...h.fuelCost.slice(-29),    next.fuelCostPerHr],
          renewable:   [...h.renewable.slice(-29),   next.renewableFraction],
          co2Reduction:[...h.co2Reduction.slice(-29),next.co2ReductionPct],
        }));
        return next;
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [scenario, industry, autopilot, profile]);

  const fuelOptions = buildFuelOptions(profile, scenario, autopilot);

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
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-600"/>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">FuelFlex AI</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-700 uppercase tracking-wide">
              Simulation Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Intelligent Fuel Switching for Industrial Decarbonisation — AI identifies lowest-emission technically viable pathways
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
            ● {data.co2ReductionPct}% CO₂ Reduction
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700">
            ● SolarSync: {data.renewableFraction}% Renewable
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-700">
            AI: {data.aiConfidence}% conf.
          </span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Industry selector */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
            <Settings className="w-3.5 h-3.5"/> Industry Profile
          </label>
          <select className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-200"
            value={industry} onChange={e => setIndustry(e.target.value)}>
            {Object.entries(INDUSTRY_PROFILES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1.5">{profile.notes}</p>
        </div>

        {/* Scenario selector */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
            <Settings className="w-3.5 h-3.5"/> Simulation Scenario
          </label>
          <select className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-200"
            value={scenario} onChange={e => setScenario(e.target.value)}>
            {Object.entries(SCENARIOS_FUEL).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1.5">{SCENARIOS_FUEL[scenario].desc}</p>
        </div>

        {/* Autopilot */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
            <BrainCircuit className="w-3.5 h-3.5"/> Optimisation Objective
          </label>
          <div className="flex flex-wrap gap-1.5">
            {AUTOPILOT_MODES.map(m => (
              <button key={m} onClick={() => setAutopilot(m)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  autopilot === m
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        <KpiCard label="Process Temperature" value={data.processTemp} unit="°C" color="text-orange-600 dark:text-orange-400" icon={<Flame className="w-4 h-4 text-orange-500"/>}/>
        <KpiCard label="Heat Demand" value={data.processHeatDemand} unit="kWth" color="text-blue-600 dark:text-blue-400"/>
        <KpiCard label="Scope 1 Emissions" value={scenario === 'baseline' ? data.scope1KgPerHr : (data.scope1KgPerHr * 0.15).toFixed(1)} unit="kg/hr" color={scenario === 'baseline' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'} icon={<TrendingDown className="w-4 h-4 text-red-500"/>}/>
        <KpiCard label="Renewable Fraction" value={`${data.renewableFraction}%`} color="text-emerald-600 dark:text-emerald-400" icon={<Leaf className="w-4 h-4 text-emerald-500"/>} sub="Via SolarSync"/>
        <KpiCard label="AI Confidence" value={`${data.aiConfidence}%`} color="text-indigo-600 dark:text-indigo-400" icon={<BrainCircuit className="w-4 h-4 text-indigo-500"/>}/>
        <KpiCard label="CO₂ Reduction" value={`${data.co2ReductionPct}%`} color="text-emerald-600 dark:text-emerald-400" sub="vs baseline"/>
        <KpiCard label="Cost Impact" value={`${data.costDeltaPct > 0 ? '+' : ''}${data.costDeltaPct}%`} color={data.costDeltaPct < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'} sub="vs current fuel"/>
        <KpiCard label="CAPEX Estimate" value={data.capex} color="text-slate-700 dark:text-slate-200" sub="Illustrative simulation"/>
        <KpiCard label="Payback" value={data.paybackYears} unit="yrs" color="text-indigo-600 dark:text-indigo-400"/>
        <KpiCard label="Waste Heat Input" value={data.wasteHeatAvailable} unit="kWth" color="text-orange-600 dark:text-orange-400" sub="From ThermoRoute"/>
      </div>

      {/* AI Recommendation Banner */}
      <div className="bg-gradient-to-r from-emerald-50 to-indigo-50 dark:from-emerald-950/30 dark:to-indigo-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5"/> AI Recommendation — Illustrative Simulation
            </div>
            <div className="text-base font-bold text-slate-800 dark:text-white">
              {profile.fuelType} → {data.recommendation}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {data.co2ReductionPct}% CO₂ reduction · {data.costDeltaPct < 0 ? `${Math.abs(data.costDeltaPct)}% cost saving` : `${data.costDeltaPct}% cost increase`} · Payback {data.paybackYears} yrs
            </div>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg border border-emerald-200 dark:border-emerald-700 text-center">
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Renewable</div>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-mono-num">{data.renewableFraction}%</div>
            </div>
            <div className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg border border-indigo-200 dark:border-indigo-700 text-center">
              <div className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">Confidence</div>
              <div className="text-lg font-bold text-indigo-700 dark:text-indigo-300 font-mono-num">{data.aiConfidence}%</div>
            </div>
          </div>
        </div>
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
                <Zap className="w-4 h-4 text-emerald-500"/> Fuel-Switching Digital Twin — Live
              </h2>
              <span className="text-[10px] text-slate-400 font-mono-num animate-pulse">● LIVE SIM</span>
            </div>
            <FuelFlowDiagram data={data} scenario={scenario} profile={profile} tick={tickRef.current}/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TempLadder processTemp={data.processTemp}/>
            <FuelMatrix options={fuelOptions}/>
          </div>

          {/* SolarSync + ThermoRoute integration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 p-4 shadow-sm">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5"/> SolarSync AI — Connected
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Renewable availability</span><span className="font-bold font-mono-num text-amber-600">{data.renewableFraction}%</span></div>
                <div className="flex justify-between"><span className="text-slate-500">FuelFlex recalculates</span><span className="font-bold text-emerald-600">{data.co2ReductionPct}% CO₂ reduction</span></div>
                <p className="text-[10px] text-slate-500 pt-1 border-t border-amber-100 dark:border-amber-900">
                  When SolarSync reports high renewable availability, electrification pathway carbon benefit improves significantly.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-xl border border-orange-200 dark:border-orange-800/40 p-4 shadow-sm">
              <h4 className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5"/> ThermoRoute AI — Connected
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Waste heat available</span><span className="font-bold font-mono-num text-orange-600">{data.wasteHeatAvailable} kWth</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Remaining fuel demand</span><span className="font-bold text-slate-700 dark:text-slate-300">{data.processHeatDemand - data.wasteHeatAvailable} kWth</span></div>
                <p className="text-[10px] text-slate-500 pt-1 border-t border-orange-100 dark:border-orange-900">
                  ThermoRoute supplies {data.wasteHeatAvailable} kWth first. FuelFlex covers remaining {data.processHeatDemand - data.wasteHeatAvailable} kWth.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Engine Tab */}
      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-xl border border-emerald-800/50 p-5 shadow-lg">
            <h3 className="text-sm font-bold text-emerald-300 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4"/> FuelFlex AI — Processing Stages
            </h3>
            <div className="space-y-2.5">
              {AI_STAGES_FUEL.map((stage, i) => (
                <div key={i} className={`p-3 rounded-lg border transition-all duration-400 ${
                  data.aiStage > i ? 'border-emerald-800 bg-emerald-950/40'
                  : data.aiStage === i ? 'border-emerald-500 bg-emerald-950/60 shadow-[0_0_14px_rgba(52,211,153,0.25)]'
                  : 'border-slate-800 bg-slate-900/40'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      data.aiStage > i ? 'bg-emerald-600' : data.aiStage === i ? 'bg-emerald-700 animate-pulse' : 'bg-slate-700'
                    }`}>
                      {data.aiStage > i
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-white"/>
                        : <span className="text-[10px] text-white font-bold">{i + 1}</span>}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${data.aiStage >= i ? 'text-white' : 'text-slate-500'}`}>{stage}</div>
                      {data.aiStage === i && <div className="text-[10px] text-emerald-400 mt-0.5 animate-pulse">Processing…</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 p-4">
              <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">Why FuelFlex selected this pathway</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {autopilot === 'Minimum CAPEX'
                  ? `Minimum CAPEX mode selected. Natural gas retrofit identified as lowest upfront cost pathway. CO₂ reduction is partial but achieved without major capital outlay.`
                  : autopilot === 'Lowest Carbon'
                  ? `Lowest carbon objective. Solar + electrification maximises renewable fraction (${data.renewableFraction}%). Scope 1 nearly eliminated. Scope 2 minimal with solar coverage.`
                  : scenario === 'highTariff'
                  ? 'Electricity tariff spike makes full electrification less economically attractive. Natural gas selected as bridge fuel until tariff normalises.'
                  : `Process temperature (${data.processTemp}°C) is compatible with ${data.recommendedFuel}. Current ${profile.fuelType} produces high Scope 1 emissions. SolarSync confirms ${data.renewableFraction}% renewable electricity during operating hours. Electrification maintains required process temperature. CAPEX and payback remain within plant limits.`
                }
              </p>
              <div className="mt-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                Recommendation: Transition to {data.recommendedFuel}
              </div>
            </div>

            {/* Cement special case */}
            {industry === 'cement' && (
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40 p-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 mb-2"/>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Cement Process Note:</strong> Calcination process emissions (~60% of total) cannot be solved through fuel switching alone. Fuel switching addresses combustion Scope 1 only. Full decarbonisation requires Carbon Capture (CCS), blended cement, or alternative binders in addition to fuel switching.
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wide">Cross-System Integration</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                  <div className="font-semibold text-amber-700 dark:text-amber-400">ThermoRoute AI</div>
                  <div className="text-slate-500">{data.wasteHeatAvailable} kWth waste heat reduces external fuel requirement by {Math.round(data.wasteHeatAvailable / data.processHeatDemand * 100)}%</div>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200 dark:border-indigo-800/30">
                  <div className="font-semibold text-indigo-700 dark:text-indigo-400">SolarSync AI</div>
                  <div className="text-slate-500">{data.renewableFraction}% renewable electricity lowers effective Scope 2 of electrification pathway</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <MiniChart history={chartHistory.scope1} color="#ef4444" label="Scope 1 Emissions" unit="kg/hr"/>
          <MiniChart history={chartHistory.scope2} color="#818cf8" label="Scope 2 Emissions" unit="kg/hr"/>
          <MiniChart history={chartHistory.fuelCost} color="#f97316" label="Fuel / Energy Cost" unit="₹/hr"/>
          <MiniChart history={chartHistory.renewable} color="#34d399" label="Renewable Fraction" unit="%"/>
          <MiniChart history={chartHistory.co2Reduction} color="#10b981" label="CO₂ Reduction Potential" unit="%"/>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-500"/> FuelFlex AI Event Timeline
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
            { name: 'ThermoRoute AI', sub: `${data.wasteHeatAvailable} kWth waste heat`, active: true, color: 'orange' },
            { name: 'SolarSync AI', sub: `${data.renewableFraction}% renewable`, active: true, color: 'amber' },
            { name: 'FuelFlex AI', sub: 'Fuel switching', active: true, color: 'emerald' },
          ].map(m => (
            <div key={m.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium ${
              m.active
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${m.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}/>
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
