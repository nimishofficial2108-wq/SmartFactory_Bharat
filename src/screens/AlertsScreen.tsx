import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Zap,
  Wrench,
  IndianRupee,
} from 'lucide-react';

export const AlertsScreen: React.FC = () => {
  const { alerts, acknowledgeAlert, machines, setSelectedMachineId, setCurrentNav, t, language } = useFactory();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'warning' | 'fault'>('all');
  const [machineFilter, setMachineFilter] = useState<string>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (machineFilter !== 'all' && a.machineId !== machineFilter) return false;
    return true;
  });

  const handleInspectMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    setCurrentNav('machines');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t.alertsFeed}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 font-mono-num font-semibold">
              {alerts.filter((a) => !a.acknowledged).length} Pending
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'मशीनों की खराबी, अत्यधिक खाली चलने और असामान्य कंपन की पूरी सूची'
              : 'Chronological timeline of abnormal sensor spikes, idle waste, and mechanical faults'}
          </p>
        </div>

        {/* Severity counts */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300 text-xs font-mono-num font-semibold">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{alerts.filter((a) => a.severity === 'warning').length} Warnings</span>
          </div>
        </div>
      </div>

      {/* Filter Controls: Severity & Machine Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {/* Severity Segmented Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-full border border-slate-200/80 dark:border-slate-800">
          {(['all', 'warning', 'fault'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 text-xs font-semibold rounded-full capitalize transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {sev === 'all' ? t.allAlerts : sev}
            </button>
          ))}
        </div>

        {/* Machine Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400 font-medium"
          >
            <option value="all">All Machines / सभी मशीनें</option>
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chronological Alert Cards */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No active alerts match this filter</h3>
            <p className="text-xs text-slate-500">All sensor telemetry is operating within nominal thresholds.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isFault = alert.severity === 'fault';
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-xs hover:shadow-sm flex flex-col justify-between ${
                  alert.acknowledged
                    ? 'border-slate-200/60 dark:border-slate-800/80 opacity-75'
                    : isFault
                    ? 'border-red-300 dark:border-red-500/50 bg-red-50/20 dark:bg-red-500/5'
                    : 'border-amber-300 dark:border-amber-500/40 bg-amber-50/20 dark:bg-amber-500/5'
                }`}
              >
                <div>
                  {/* Top Bar: Severity Badge, Machine Name & Timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          isFault
                            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/40'
                            : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{isFault ? t.statusFault : t.statusWarning}</span>
                      </span>

                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {alert.machineName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono-num text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>

                  {/* Title & Plain-Language Explanation */}
                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <span>{alert.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">[{alert.code}]</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800">
                      {alert.plainDescription}
                    </p>
                  </div>

                  {/* Troubleshooting & Cost impact tags */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono-num">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2">
                      <Wrench className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[10px] block">RECOMMENDED TECHNICIAN ACTION:</span>
                        <span className="text-slate-700 dark:text-slate-200 font-medium">{alert.suggestedAction}</span>
                      </div>
                    </div>

                    {alert.costImpactEst && (
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2">
                        <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 text-[10px] block">ESTIMATED FINANCIAL IMPACT:</span>
                          <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{alert.costImpactEst}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions: Acknowledge & View Machine */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    {alert.acknowledged ? (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-4 h-4" />
                        {t.acknowledged}
                      </span>
                    ) : (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 transition-colors"
                      >
                        {t.acknowledge}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleInspectMachine(alert.machineId)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold transition-all shadow-xs group"
                  >
                    <span>Inspect 3D Machine</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
