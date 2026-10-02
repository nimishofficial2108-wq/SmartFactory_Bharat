import React, { useState, useEffect } from 'react';
import { useFactory } from '../context/FactoryContext';
import { 
  Sun,
  Battery,
  Zap,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Info,
  ChevronDown,
  BarChart3
} from 'lucide-react';

export const SolarSyncScreen: React.FC = () => {
  const { theme } = useFactory();
  
  // Simulation State
  const [scenario, setScenario] = useState('sunny'); // 'sunny', 'cloudy', 'highDemand', 'soiling'
  const [aiMode, setAiMode] = useState('balanced'); // 'savings', 'carbon', 'production', 'balanced'
  const [time, setTime] = useState(new Date());

  // Simulation Data (Dynamic based on scenario)
  const [data, setData] = useState({
    sunlightIntensity: 82,
    solarGeneration: 176,
    factoryDemand: 151,
    selfConsumption: 146,
    gridExport: 30,
    gridImport: 0,
    expectedGeneration: 184,
    soilingLoss: 0,
    surplus: 25,
    history: Array.from({length: 24}, (_, i) => ({
      time: `${i}:00`,
      gen: Math.round(Math.max(0, Math.sin((i - 6) * Math.PI / 12) * 200)),
      demand: Math.round(100 + Math.random() * 80)
    }))
  });

  useEffect(() => {
    // Basic simulation loop to make values feel alive
    const interval = setInterval(() => {
      setTime(new Date());
      let baseGeneration = 180;
      let baseDemand = 150;
      let intensity = 85;
      let soiling = 0;

      if (scenario === 'cloudy') {
        baseGeneration = 80 + Math.random() * 20;
        intensity = 40 + Math.random() * 10;
      } else if (scenario === 'highDemand') {
        baseDemand = 220 + Math.random() * 30;
      } else if (scenario === 'soiling') {
        soiling = 25;
        baseGeneration = 150 - soiling;
      }

      const fluctuate = () => (Math.random() - 0.5) * 5;
      const gen = Math.max(0, baseGeneration + fluctuate());
      const demand = Math.max(0, baseDemand + fluctuate());
      
      let selfCons = Math.min(gen, demand);
      let exportGrid = Math.max(0, gen - demand);
      let importGrid = Math.max(0, demand - gen);

      setData(prev => ({
        sunlightIntensity: intensity,
        solarGeneration: Math.round(gen),
        factoryDemand: Math.round(demand),
        selfConsumption: Math.round(selfCons),
        gridExport: Math.round(exportGrid),
        gridImport: Math.round(importGrid),
        expectedGeneration: Math.round(baseGeneration + soiling),
        soilingLoss: soiling,
        surplus: Math.max(0, gen - demand),
        history: prev.history
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [scenario]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="w-6 h-6 text-amber-500" />
            SolarSync AI
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Production-Aware Solar Energy Management for Smart Factories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            SIMULATION MODE
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            AI Optimization: Active
          </span>
        </div>
      </div>

      {/* Hero Visual - Energy Flow (Simplified representation) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
           <Sun className="w-32 h-32 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Real-Time Energy Flow</h2>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          {/* Solar Source */}
          <div className="flex flex-col items-center gap-3">
             <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200 dark:border-amber-500/30 flex flex-col items-center justify-center">
                <Sun className="w-8 h-8 text-amber-500" />
             </div>
             <div className="text-center">
               <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Solar Generation</div>
               <div className="text-2xl font-bold text-slate-800 dark:text-white">{data.solarGeneration} <span className="text-sm text-slate-500">kW</span></div>
             </div>
          </div>

          {/* Flow Indicator */}
          <div className="flex-1 flex flex-col items-center justify-center relative min-w-[150px]">
             <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                <div 
                  className="absolute top-0 bottom-0 left-0 bg-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (data.solarGeneration / 250) * 100)}%` }}
                />
             </div>
             <div className="text-xs font-mono mt-2 text-amber-600 dark:text-amber-400">
               {data.sunlightIntensity}% Intensity
             </div>
          </div>

          {/* Factory Node */}
          <div className="flex flex-col items-center gap-3">
             <div className="w-24 h-24 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border-2 border-indigo-200 dark:border-indigo-500/30 flex flex-col items-center justify-center">
                <Activity className="w-8 h-8 text-indigo-500 mb-1" />
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">SMART FACTORY</span>
             </div>
             <div className="text-center">
               <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Building Demand</div>
               <div className="text-2xl font-bold text-slate-800 dark:text-white">{data.factoryDemand} <span className="text-sm text-slate-500">kW</span></div>
             </div>
          </div>
          
           {/* Flow Indicator Grid */}
          <div className="flex-1 flex flex-col items-center justify-center relative min-w-[100px]">
             {data.gridExport > 0 ? (
                 <>
                   <ArrowRight className="w-6 h-6 text-emerald-500 animate-pulse" />
                   <div className="text-xs text-emerald-600 font-medium">Exporting</div>
                 </>
             ) : (
                 <>
                   <ArrowRight className="w-6 h-6 text-rose-500 rotate-180 animate-pulse" />
                   <div className="text-xs text-rose-600 font-medium">Importing</div>
                 </>
             )}
          </div>

           {/* Grid Node */}
           <div className="flex flex-col items-center gap-3">
             <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center">
                <Zap className="w-8 h-8 text-slate-500 dark:text-slate-400" />
             </div>
             <div className="text-center">
               <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Grid Exchange</div>
               <div className="text-xl font-bold text-slate-800 dark:text-white">
                 {data.gridExport > 0 ? (
                   <span className="text-emerald-600 dark:text-emerald-400">+{data.gridExport} kW</span>
                 ) : (
                   <span className="text-rose-600 dark:text-rose-400">-{data.gridImport} kW</span>
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Self-Consumption', value: `${Math.round((data.selfConsumption / Math.max(1, data.solarGeneration)) * 100)}%`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Surplus Solar', value: `${data.surplus} kW`, icon: Sun, color: 'text-amber-500' },
          { label: 'Grid Import', value: `${data.gridImport} kW`, icon: Zap, color: 'text-rose-500' },
          { label: 'Daily Savings', value: '₹4,250', icon: CheckCircle2, color: 'text-indigo-500' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-900 ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">{kpi.label}</div>
              <div className="text-lg font-bold text-slate-800 dark:text-white">{kpi.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - AI Decision & Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* AI Decision Engine */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
             <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wide">AI Decision Engine</h3>
             </div>
             
             <div className="space-y-4">
                <div className="bg-white/60 dark:bg-slate-900/40 p-3 rounded-xl border border-white/40 dark:border-slate-700/50">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Current Situation</div>
                  <div className="text-sm text-slate-700 dark:text-slate-200">
                    {data.surplus > 0 
                      ? `Solar surplus of ${data.surplus} kW detected. High likelihood of export.` 
                      : `Factory load exceeds solar generation by ${data.gridImport} kW.`}
                  </div>
                </div>

                <div className="bg-indigo-600 text-white p-3 rounded-xl shadow-md">
                  <div className="text-xs font-semibold text-indigo-200 mb-1">AI Recommendation</div>
                  <div className="text-sm font-medium">
                    {data.surplus > 10 
                      ? 'Advance Polishing Batch P4 to absorb surplus solar.' 
                      : data.gridImport > 20 
                      ? 'Defer auxiliary pump operations to reduce grid import cost.'
                      : 'Maintain current operations. Balanced load.'}
                  </div>
                </div>
             </div>
          </div>

          {/* Scenario Simulation Controls */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Simulation Controls
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Weather & Condition</label>
                <select 
                  className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-200"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                >
                  <option value="sunny">Clear Sunny Day</option>
                  <option value="cloudy">Cloud Cover / Fluctuating</option>
                  <option value="highDemand">High Factory Demand</option>
                  <option value="soiling">Panel Soiling / Dust</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">AI Autopilot Mode</label>
                <select 
                  className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-slate-700 dark:text-slate-200"
                  value={aiMode}
                  onChange={(e) => setAiMode(e.target.value)}
                >
                  <option value="balanced">Balanced (Cost + Carbon)</option>
                  <option value="savings">Maximum Savings (₹)</option>
                  <option value="carbon">Minimum Carbon (CO₂)</option>
                  <option value="production">Maximum Production</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Charts and Analysis */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Flexible Load Orchestration */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center justify-between">
              <span>Flexible Load Optimization</span>
              <span className="text-xs font-normal text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">2 Opportunities Found</span>
            </h3>

            <div className="space-y-3">
              {/* Load 1 */}
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Polishing Batch P4</div>
                  <div className="text-xs text-slate-500">Demand: 28 kW | Flexibility: Medium</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Advance to Now</div>
                  <div className="text-[10px] text-slate-500">Absorbs 25kW surplus</div>
                </div>
              </div>
              
              {/* Load 2 */}
              <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Air Compressor C2</div>
                  <div className="text-xs text-slate-500">Demand: 45 kW | Flexibility: High</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400">Keep Running</div>
                  <div className="text-[10px] text-slate-500">Matches current load profile</div>
                </div>
              </div>
            </div>
          </div>

          {/* Soiling & Performance Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Performance Alert */}
             <div className={`p-5 rounded-2xl border shadow-sm ${scenario === 'soiling' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/50' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${scenario === 'soiling' ? 'text-amber-500' : 'text-slate-400'}`} />
                  Expected vs Actual Output
                </h3>
                
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="text-xs text-slate-500">Actual</div>
                    <div className="text-xl font-bold text-slate-800 dark:text-white">{data.solarGeneration} kW</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Expected</div>
                    <div className="text-xl font-bold text-slate-400">{data.expectedGeneration} kW</div>
                  </div>
                </div>

                {scenario === 'soiling' && (
                  <div className="mt-3 p-2 bg-amber-100/50 dark:bg-amber-900/30 rounded-lg text-xs text-amber-800 dark:text-amber-300 font-medium">
                    Alert: Underperforming by {Math.round((data.soilingLoss / data.expectedGeneration) * 100)}%. Probable cause: Panel soiling/dust.
                  </div>
                )}
             </div>

             {/* Soiling ROI Engine */}
             <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Soiling ROI Engine
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lost Value Today:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">₹{scenario === 'soiling' ? '1,450' : '120'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Cleaning Cost:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">₹3,500</span>
                  </div>
                  
                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700">
                     {scenario === 'soiling' ? (
                       <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                         Recommendation: CLEAN NOW (Payback: 2.4 days)
                       </div>
                     ) : (
                       <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                         Recommendation: Cleaning Not Yet Justified
                       </div>
                     )}
                  </div>
                </div>
             </div>
             {/* Charts Section */}
             <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-1 md:col-span-2">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  Solar Generation vs Factory Demand (24h)
                </h3>
                
                <div className="relative w-full h-48 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2">
                  <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[25, 50, 75].map((y) => (
                      <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="rgba(150,150,150,0.1)" strokeDasharray="2 2" />
                    ))}
                    
                    {/* Demand Area */}
                    <path 
                      d={`M 0 100 ${data.history.map((d, i) => `L ${i * (400/23)} ${100 - (d.demand / 300) * 100}`).join(' ')} L 400 100 Z`}
                      fill="rgba(99, 102, 241, 0.1)"
                    />
                    {/* Demand Line */}
                    <path 
                      d={data.history.map((d, i) => `${i===0?'M':'L'} ${i * (400/23)} ${100 - (d.demand / 300) * 100}`).join(' ')}
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />

                    {/* Solar Generation Area */}
                    <path 
                      d={`M 0 100 ${data.history.map((d, i) => `L ${i * (400/23)} ${100 - (d.gen / 300) * 100}`).join(' ')} L 400 100 Z`}
                      fill="rgba(245, 158, 11, 0.15)"
                    />
                    {/* Solar Generation Line */}
                    <path 
                      d={data.history.map((d, i) => `${i===0?'M':'L'} ${i * (400/23)} ${100 - (d.gen / 300) * 100}`).join(' ')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  
                  {/* Legend */}
                  <div className="absolute top-2 right-2 flex gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur px-2 py-1 rounded text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Solar</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Demand</span>
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-6 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  Grid Import vs Export (24h)
                </h3>
                
                <div className="relative w-full h-32 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2">
                  <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                     {/* Zero Line */}
                     <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(150,150,150,0.3)" strokeWidth="1" />
                     
                     {/* Export Area (Top half, Green) */}
                     <path 
                      d={`M 0 50 ${data.history.map((d, i) => `L ${i * (400/23)} ${50 - Math.max(0, (d.gen - d.demand) / 100) * 50}`).join(' ')} L 400 50 Z`}
                      fill="rgba(16, 185, 129, 0.2)"
                    />
                    <path 
                      d={data.history.map((d, i) => `${i===0?'M':'L'} ${i * (400/23)} ${50 - Math.max(0, (d.gen - d.demand) / 100) * 50}`).join(' ')}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />

                    {/* Import Area (Bottom half, Red) */}
                     <path 
                      d={`M 0 50 ${data.history.map((d, i) => `L ${i * (400/23)} ${50 + Math.max(0, (d.demand - d.gen) / 100) * 50}`).join(' ')} L 400 50 Z`}
                      fill="rgba(244, 63, 94, 0.2)"
                    />
                    <path 
                      d={data.history.map((d, i) => `${i===0?'M':'L'} ${i * (400/23)} ${50 + Math.max(0, (d.demand - d.gen) / 100) * 50}`).join(' ')}
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                  
                  {/* Legend */}
                  <div className="absolute top-2 right-2 flex gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur px-2 py-1 rounded text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Export</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Import</span>
                  </div>
                </div>
             </div>

          </div>
          
        </div>
      </div>
    </div>
  );
};
