import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import {
  LayoutDashboard,
  Cpu,
  Radio,
  Activity,
  AlertTriangle,
  FileText,
  Settings,
  Wifi,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Search,
  Gauge,
  BrainCircuit,
  Sparkles,
  Leaf,
  Sun,
  Flame,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  collapsed = false,
  onToggleCollapse,
}) => {
  const {
    currentNav,
    setCurrentNav,
    t,
    alerts,
    machines,
    tariffRateINR,
    selectedMachineId,
    setSelectedMachineId,
  } = useFactory();

  const [machineSearch, setMachineSearch] = useState<string>('');

  const navItems = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'machinemonitor',
      label: 'Machine Monitor',
      icon: Gauge,
      badge: 'Live',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'aidigitaltwin',
      label: 'AI Digital Twin',
      icon: BrainCircuit,
      badge: 'AI Core',
      badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
    },
    {
      id: 'carbonmonitor',
      label: 'Carbon Monitor',
      icon: Leaf,
      badge: 'ESG',
      badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
    },
    {
      id: 'solarsync',
      label: 'SolarSync AI',
      icon: Sun,
      badge: 'Smart Energy',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    },
    {
      id: 'thermoroute',
      label: 'ThermoRoute AI',
      icon: Flame,
      badge: 'Heat Recovery',
      badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
    },
    {
      id: 'fuelflex',
      label: 'FuelFlex AI',
      icon: Leaf,
      badge: 'Decarbonisation',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'machines',
      label: t.navMachines,
      icon: Cpu,
      badge: `${machines.length}`,
    },
    {
      id: 'pair',
      label: t.navPairDevice,
      icon: Radio,
      badge: 'Clip',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    },
    {
      id: 'digitaltwin',
      label: t.navDigitalTwin,
      icon: Activity,
      badge: 'Sim',
      badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    },
    {
      id: 'alerts',
      label: t.navAlerts,
      icon: AlertTriangle,
      badge:
        alerts.filter((a) => !a.acknowledged).length > 0
          ? `${alerts.filter((a) => !a.acknowledged).length}`
          : null,
      badgeColor: 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-800',
    },
    {
      id: 'reports',
      label: t.navReports,
      icon: FileText,
      badge: null,
    },
    {
      id: 'settings',
      label: t.navSettings,
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelect = (id: string) => {
    setCurrentNav(id);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSelectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    setCurrentNav('machines');
    if (onCloseMobile) onCloseMobile();
  };

  const filteredMachines = machines.filter(
    (m) =>
      m.name.toLowerCase().includes(machineSearch.toLowerCase()) ||
      m.boxId.toLowerCase().includes(machineSearch.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container with ChatGPT clean look */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 ${
          collapsed ? 'w-16' : 'w-64'
        } bg-[#f9f9fb] dark:bg-slate-900 border-r border-[#00000010] dark:border-slate-800 flex flex-col justify-between transition-all duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: "+ New Machine Box" button (like ChatGPT's "+ New chat") */}
        <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
          <div className="flex items-center justify-between px-1">
            {!collapsed && (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                Plant Workspaces
              </span>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-auto"
                title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}
          </div>

          {/* ChatGPT style "+ Connect New Device" button */}
          <button
            onClick={() => handleSelect('pair')}
            className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)] font-semibold text-xs transition-all hover:border-slate-300 ${
              collapsed ? 'px-2' : 'px-3'
            }`}
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            {!collapsed && <span>{t.connectNewDevice}</span>}
          </button>

          {/* Nav Items List */}
          <div className="space-y-0.5 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'
                  } rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-slate-900 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ChatGPT style "History / Connected Machines" List in Sidebar */}
          {!collapsed && (
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                  Connected Machines
                </span>
                <span className="text-[10px] font-mono-num text-slate-400">{machines.length} active</span>
              </div>

              {/* Quick Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={machineSearch}
                  onChange={(e) => setMachineSearch(e.target.value)}
                  placeholder="Filter machines..."
                  className="w-full text-[11px] pl-7 pr-2 py-1.5 rounded-lg bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Machine list items */}
              <div className="space-y-0.5 max-h-48 overflow-y-auto pr-0.5">
                {filteredMachines.map((m) => {
                  const isSelected = currentNav === 'machines' && selectedMachineId === m.id;
                  const isWarn = m.status === 'warning';
                  const isFault = m.status === 'fault';

                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMachine(m.id)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] text-left transition-all group ${
                        isSelected
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs border border-slate-200/80 dark:border-slate-700'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            isFault
                              ? 'bg-red-500 animate-ping'
                              : isWarn
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span className="truncate">{m.name}</span>
                      </div>
                      <span className="font-mono-num text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0">
                        {m.telemetry.currentA.toFixed(1)}A
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Profile & Hardware Mesh (ChatGPT-style User Footnote) */}
        <div className="p-3 border-t border-[#00000010] dark:border-slate-800 bg-[#f9f9fb] dark:bg-slate-900">
          {!collapsed ? (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    SF
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                      Shree Ganesh Works
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono-num font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Pune MIDC · 4 Boxes
                    </span>
                  </div>
                </div>
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono-num pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-slate-500 dark:text-slate-400">
                <span className="text-[10px]">Commercial Tariff</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">₹{tariffRateINR.toFixed(2)}/kWh</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div
                className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer"
                title="Shree Ganesh Works - Pune MIDC"
              >
                SF
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
