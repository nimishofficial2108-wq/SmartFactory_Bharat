import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { Machine, MaintenanceRecord, PartReplacement } from '../types';
import {
  Wrench,
  Calendar,
  User,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
  Package,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Tag,
  Filter,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface MaintenanceLogProps {
  machine: Machine;
}

export const MaintenanceLog: React.FC<MaintenanceLogProps> = ({ machine }) => {
  const { maintenanceLogs, addMaintenanceRecord, language, t } = useFactory();

  // Filter & Search states
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  // Form states for logging new maintenance
  const [formDate, setFormDate] = useState<string>(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [formType, setFormType] = useState<MaintenanceRecord['serviceType']>('routine');
  const [formTechName, setFormTechName] = useState<string>('');
  const [formTechRole, setFormTechRole] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formDowntime, setFormDowntime] = useState<number>(2.0);
  const [formNextDate, setFormNextDate] = useState<string>('In 90 Days');
  const [formParts, setFormParts] = useState<PartReplacement[]>([
    { partName: '', partNumber: '', quantity: 1, costINR: 0 },
  ]);

  // Filter logs for current machine
  const machineLogs = maintenanceLogs.filter((log) => log.machineId === machine.id);

  // Computed summary metrics
  const totalServiceCount = machineLogs.length;
  const totalSpendINR = machineLogs.reduce((acc, log) => acc + log.totalCostINR, 0);
  const totalPartsReplaced = machineLogs.reduce(
    (acc, log) => acc + log.partReplacements.reduce((pAcc, p) => pAcc + p.quantity, 0),
    0
  );
  const lastService = machineLogs[0];

  // Apply filters & search
  const filteredLogs = machineLogs.filter((log) => {
    const matchesType = selectedTypeFilter === 'all' || log.serviceType === selectedTypeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      log.technicianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.technicianNotes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.partReplacements.some((p) => p.partName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.serviceDate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddPartRow = () => {
    setFormParts([...formParts, { partName: '', partNumber: '', quantity: 1, costINR: 0 }]);
  };

  const handleRemovePartRow = (index: number) => {
    if (formParts.length === 1) return;
    setFormParts(formParts.filter((_, i) => i !== index));
  };

  const handlePartChange = (index: number, field: keyof PartReplacement, value: any) => {
    const updated = [...formParts];
    updated[index] = { ...updated[index], [field]: value };
    setFormParts(updated);
  };

  const handleSaveServiceLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTechName.trim() || !formNotes.trim()) return;

    // Filter valid parts
    const validParts = formParts.filter((p) => p.partName.trim().length > 0);
    const calculatedPartsCost = validParts.reduce((acc, p) => acc + (p.costINR * p.quantity || 0), 0);
    const serviceLabourCost = 2500;
    const totalCalculatedCost = calculatedPartsCost > 0 ? calculatedPartsCost + serviceLabourCost : 3500;

    addMaintenanceRecord({
      machineId: machine.id,
      serviceDate: formDate,
      technicianName: formTechName.trim(),
      technicianRole: formTechRole.trim() || 'Plant Maintenance Technician',
      serviceType: formType,
      technicianNotes: formNotes.trim(),
      partReplacements: validParts,
      totalCostINR: totalCalculatedCost,
      downtimeHours: formDowntime,
      healthScoreBefore: machine.healthScore,
      healthScoreAfter: Math.min(98, machine.healthScore + 14),
      nextScheduledDate: formNextDate,
      status: 'completed',
    });

    // Reset form
    setFormTechName('');
    setFormTechRole('');
    setFormNotes('');
    setFormParts([{ partName: '', partNumber: '', quantity: 1, costINR: 0 }]);
    setIsModalOpen(false);

    // Show toast
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const getServiceTypeBadge = (type: MaintenanceRecord['serviceType']) => {
    switch (type) {
      case 'routine':
        return {
          label: language === 'hi' ? 'नियमित सर्विस' : 'Routine PM',
          classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30',
        };
      case 'predictive':
        return {
          label: language === 'hi' ? 'प्रेडिक्टिव सर्विस' : 'Condition Based',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
        };
      case 'emergency':
        return {
          label: language === 'hi' ? 'आपातकालीन मरम्मत' : 'Emergency Repair',
          classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30',
        };
      case 'overhaul':
        return {
          label: language === 'hi' ? 'मेजर ओवरहाल' : 'Major Overhaul',
          classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30',
        };
      default:
        return {
          label: 'Service',
          classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:border-emerald-700/60 dark:text-emerald-200 flex items-center justify-between text-xs shadow-md animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-semibold">
              {language === 'hi'
                ? 'नया सर्विस लॉग सफलतापूर्वक दर्ज हुआ! मशीन का हेल्थ स्कोर अपडेट हो गया।'
                : 'Maintenance log recorded successfully! Machine health score updated.'}
            </span>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Container Card (ChatGPT light surface style) */}
      <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 transition-all">
        {/* Header & Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-amber-400 shadow-2xs">
                <Wrench className="w-4 h-4" />
              </div>
              <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {language === 'hi' ? 'रखरखाव एवं सर्विस लॉग' : 'Maintenance & Service Log'}
              </h2>
              <span className="text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {totalServiceCount} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'hi'
                ? `मशीन '${machine.name}' के पिछले सर्विस इतिहास, तकनीशियन नोट्स और बदले गए स्पेयर पार्ट्स का विवरण`
                : `Past service dates, technician diagnostic notes, and part replacements for ${machine.name}`}
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'hi' ? 'नया सर्विस लॉग जोड़ें' : '+ Log Service'}</span>
          </button>
        </div>

        {/* 4 Quick Stat Summary Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Total Spend */}
          <div className="p-3.5 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
              Total Maint. Spend
            </span>
            <div className="text-xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              ₹{totalSpendINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 font-mono-num">Across lifetime of box</span>
          </div>

          {/* 2. Parts Replaced */}
          <div className="p-3.5 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
              Parts Replaced
            </span>
            <div className="text-xl font-bold font-mono-num text-slate-900 dark:text-white mt-1">
              {totalPartsReplaced}
              <span className="text-xs text-slate-400 font-normal ml-1">items</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono-num">OEM & certified spares</span>
          </div>

          {/* 3. Last Service Date */}
          <div className="p-3.5 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
              Last Serviced
            </span>
            <div className="text-sm font-bold font-mono-num text-slate-900 dark:text-white mt-1.5 truncate">
              {lastService ? lastService.serviceDate : 'None yet'}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono-num font-medium">
              By {lastService ? lastService.technicianName.split(' ')[0] : 'N/A'}
            </span>
          </div>

          {/* 4. Next Inspection */}
          <div className="p-3.5 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
              Next Scheduled PM
            </span>
            <div className="text-sm font-bold font-mono-num text-amber-600 dark:text-amber-400 mt-1.5 truncate">
              {lastService?.nextScheduledDate || 'In 90 Days'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono-num">Condition monitored</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: language === 'hi' ? 'सभी' : 'All' },
              { id: 'routine', label: language === 'hi' ? 'नियमित' : 'Routine PM' },
              { id: 'predictive', label: language === 'hi' ? 'प्रेडिक्टिव' : 'Condition Based' },
              { id: 'overhaul', label: language === 'hi' ? 'ओवरहाल' : 'Overhaul' },
              { id: 'emergency', label: language === 'hi' ? 'आपातकालीन' : 'Emergency' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedTypeFilter === f.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-slate-900 dark:border-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'नोट्स, तकनीशियन या पार्ट खोजें...' : 'Search notes, tech, or parts...'}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {/* Maintenance Records List */}
        <div className="space-y-3.5">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-[#fafafa] dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700">
              <Wrench className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'कोई सर्विस रिकॉर्ड नहीं मिला' : 'No service records match your criteria'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {language === 'hi' ? 'फ़िल्टर बदलें या नया सर्विस लॉग दर्ज करें।' : 'Try clearing your search or add a new maintenance record above.'}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const badge = getServiceTypeBadge(log.serviceType);
              const isExpanded = expandedRecordId === log.id;

              return (
                <div
                  key={log.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-xs transition-all p-4 md:p-5 space-y-4"
                >
                  {/* Top Row: Date, Service Type, Status & Invoice */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Date Badge */}
                      <div className="flex items-center gap-1.5 text-xs font-mono-num font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.serviceDate}</span>
                      </div>

                      {/* Type Badge */}
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${badge.classes}`}>
                        {badge.label}
                      </span>

                      {/* Status */}
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    </div>

                    {/* Spend & Downtime */}
                    <div className="flex items-center gap-3 text-xs font-mono-num self-start sm:self-auto">
                      {log.downtimeHours && (
                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3" />
                          {log.downtimeHours}h downtime
                        </span>
                      )}
                      <div className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                        ₹{log.totalCostINR.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Technician Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        {log.technicianName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{log.technicianName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({log.technicianRole || 'Service Engineer'})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: TECH-{log.id.slice(-4).toUpperCase()} · Verified Plant Service
                        </span>
                      </div>
                    </div>

                    {/* Health Impact Pill */}
                    {log.healthScoreBefore && log.healthScoreAfter && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono-num bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-slate-400">Health:</span>
                        <span className="text-slate-600 dark:text-slate-300">{log.healthScoreBefore}%</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {log.healthScoreAfter}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Technician Notes Box */}
                  <div className="p-3.5 rounded-xl bg-[#f9f9fb] dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 font-mono">
                      <FileText className="w-3 h-3 text-amber-500" />
                      Technician Diagnosis & Action Notes
                    </div>
                    <p className="whitespace-pre-wrap">{log.technicianNotes}</p>
                  </div>

                  {/* Part Replacements Chips */}
                  {log.partReplacements && log.partReplacements.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-amber-500" />
                          <span>Part Replacements ({log.partReplacements.length} items)</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {log.partReplacements.map((part, pIdx) => (
                          <div
                            key={pIdx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
                          >
                            <div className="truncate pr-2">
                              <div className="font-semibold text-slate-900 dark:text-white truncate">
                                {part.partName}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {part.partNumber ? `P/N: ${part.partNumber} · ` : ''}Qty: {part.quantity}
                              </div>
                            </div>
                            <span className="font-mono-num font-bold text-slate-800 dark:text-slate-200 text-xs shrink-0">
                              ₹{(part.costINR * part.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer note: Next Service Schedule */}
                  {log.nextScheduledDate && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono-num">
                      <span>Next Inspection Target: {log.nextScheduledDate}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Signed off by Shop Supervisor
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Log New Maintenance Record (ChatGPT Light Modal)                   */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-amber-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'नया सर्विस लॉग दर्ज करें' : 'Log Maintenance & Service'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {machine.name} (Box ID: {machine.boxId})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveServiceLog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Service Date / तारीख
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono-num"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Service Type / प्रकार
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  >
                    <option value="routine">Routine PM / नियमित</option>
                    <option value="predictive">Condition Based / प्रेडिक्टिव</option>
                    <option value="overhaul">Major Overhaul / ओवरहाल</option>
                    <option value="emergency">Emergency Repair / आपातकालीन</option>
                  </select>
                </div>

                {/* Technician Name */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Technician Name / तकनीशियन का नाम *
                  </label>
                  <input
                    type="text"
                    value={formTechName}
                    onChange={(e) => setFormTechName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    required
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>

                {/* Technician Role */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Role or Vendor / पद या एजेंसी
                  </label>
                  <input
                    type="text"
                    value={formTechRole}
                    onChange={(e) => setFormTechRole(e.target.value)}
                    placeholder="e.g. Senior Hydraulics Specialist"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Downtime & Next Inspection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Downtime (Hours) / मशीन रुकावट (घंटे)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formDowntime}
                    onChange={(e) => setFormDowntime(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono-num"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                    Next Inspection Date / अगली जांच
                  </label>
                  <input
                    type="text"
                    value={formNextDate}
                    onChange={(e) => setFormNextDate(e.target.value)}
                    placeholder="e.g. 15 Dec 2026"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono-num"
                  />
                </div>
              </div>

              {/* Technician Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                  Technician Diagnostic Notes / कार्य व निष्कर्ष *
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe the diagnosis, adjustments made, oil flushed, alignment, or condition of machine..."
                  required
                  className="w-full text-xs p-3 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 leading-relaxed"
                />
              </div>

              {/* Part Replacements Dynamic Section */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Replaced Spare Parts / बदले गए पार्ट्स
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPartRow}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3 h-3" />
                    + Add Part
                  </button>
                </div>

                <div className="space-y-2">
                  {formParts.map((part, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Part name (e.g. O-Ring Kit)"
                        value={part.partName}
                        onChange={(e) => handlePartChange(idx, 'partName', e.target.value)}
                        className="flex-1 text-xs px-3 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="P/N (Optional)"
                        value={part.partNumber || ''}
                        onChange={(e) => handlePartChange(idx, 'partNumber', e.target.value)}
                        className="w-24 text-xs px-2.5 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={part.quantity}
                        onChange={(e) => handlePartChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 text-xs px-2.5 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono-num text-center"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="₹ Cost"
                        value={part.costINR || ''}
                        onChange={(e) => handlePartChange(idx, 'costINR', parseFloat(e.target.value) || 0)}
                        className="w-24 text-xs px-2.5 py-2 rounded-xl bg-[#f7f7f8] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 font-mono-num"
                      />
                      {formParts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePartRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs transition-all"
                >
                  Save Maintenance Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
