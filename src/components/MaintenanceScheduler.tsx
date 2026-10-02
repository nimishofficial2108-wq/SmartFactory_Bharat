import React, { useState, useMemo } from 'react';
import { useFactory } from '../context/FactoryContext';
import { Machine, MaintenanceScheduleItem, RecurringIntervalUnit } from '../types';
import {
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Layers,
  Tag,
  IndianRupee,
  User,
  Package,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Edit3,
  Trash2,
  Check,
  X,
  ChevronDown,
  CalendarDays,
  SlidersHorizontal,
  Info,
  CheckSquare,
} from 'lucide-react';

interface MaintenanceSchedulerProps {
  machine: Machine;
}

// Preset recommended parts for quick selection by machine type
const RECOMMENDED_PARTS: Record<
  string,
  { name: string; partNumber: string; category: MaintenanceScheduleItem['partCategory'] }[]
> = {
  press: [
    { name: 'Suction Line Return Oil Filter Element', partNumber: 'HY-200T-04', category: 'Hydraulic' },
    { name: 'Ram Guide Bushings & Bronze Gibs', partNumber: 'RGB-200', category: 'Mechanical' },
    { name: 'Main Cylinder Gland Packing Kit', partNumber: 'CGP-44', category: 'Hydraulic' },
    { name: 'Proportional Directional Solenoid Valve', partNumber: 'REX-4WE', category: 'Electrical' },
    { name: 'Drive Motor Bearings (Drive End / Non-Drive End)', partNumber: 'SKF 6312-2Z', category: 'Mechanical' },
    { name: 'High-Pressure Relief Valve Spring', partNumber: 'HPR-350', category: 'Hydraulic' },
    { name: 'Hydraulic Fluid Reservoir ISO VG 68', partNumber: 'IOC-VG68', category: 'Lubrication' },
    { name: 'Inductive Proximity Sensor M18', partNumber: 'PRX-18-NPN', category: 'Electrical' },
  ],
  compressor: [
    { name: 'Air-Oil Separator Element', partNumber: 'AOS-450', category: 'Pneumatic' },
    { name: 'Drive V-Belts Set (Gates Poly-V 8PK)', partNumber: 'GATES-8PK-1550', category: 'Mechanical' },
    { name: 'Air Intake Heavy-Duty Filter Cartridge', partNumber: 'AIF-88', category: 'Pneumatic' },
    { name: 'Thermostatic Oil Valve Core (71°C)', partNumber: 'TVC-71', category: 'Thermal' },
    { name: 'Minimum Pressure Valve Kit (MPV-45)', partNumber: 'MPV-45-KIT', category: 'Pneumatic' },
    { name: 'Motor Drive-End Heavy Duty Bearing', partNumber: 'SKF 6314/C3', category: 'Mechanical' },
    { name: 'Synthetic Rotary Screw Lubricant 46', partNumber: 'ROTAIR-PLUS-46', category: 'Lubrication' },
  ],
  motor: [
    { name: 'Dynamic Rotor High-Speed Bearings', partNumber: 'SKF 6205-2Z', category: 'Mechanical' },
    { name: 'Carbon Brush Assembly & Springs', partNumber: 'CB-15H', category: 'Electrical' },
    { name: 'Spindle Collet Chuck & Nut (ER-32)', partNumber: 'COLLET-ER32', category: 'Mechanical' },
    { name: 'Thermal Overload Bimetal Relay (TOR-25A)', partNumber: 'TOR-25A', category: 'Electrical' },
    { name: 'External Cooling Fan Impeller', partNumber: 'CF-180', category: 'Thermal' },
    { name: 'Rubber Anti-Vibration Mount Pads', partNumber: 'AVM-60', category: 'Mechanical' },
  ],
  furnace: [
    { name: 'Water-Cooling Manifold & Reinforced Hoses', partNumber: 'WCM-100', category: 'Thermal' },
    { name: 'Alumina Refractory Crucible Lining', partNumber: 'RCL-Alumina-88', category: 'Structural' },
    { name: 'SCR Phase-Control Thyristor Module', partNumber: 'SCR-1600V', category: 'Electrical' },
    { name: 'High-Current Flexible Busbar Clamps', partNumber: 'BB-400A', category: 'Electrical' },
    { name: 'Type-K Mineral Insulated Thermocouple', partNumber: 'TC-K-1200C', category: 'Thermal' },
    { name: 'Magnetic Core Lamination Tie Rods', partNumber: 'MCL-CORE-M16', category: 'Structural' },
  ],
  other: [
    { name: 'Standard Drive Roller Bearings', partNumber: 'SKF-GEN-6204', category: 'Mechanical' },
    { name: 'Motor Contactor & Overload Relay', partNumber: 'LC1D25', category: 'Electrical' },
    { name: 'Gearbox Lubricant EP ISO 320', partNumber: 'EP-320', category: 'Lubrication' },
  ],
};

const FREQUENCY_PRESETS = [
  { label: 'Weekly', frequency: 7, unit: 'days' as RecurringIntervalUnit, desc: '7 Days' },
  { label: 'Bi-Weekly', frequency: 14, unit: 'days' as RecurringIntervalUnit, desc: '14 Days' },
  { label: 'Monthly', frequency: 30, unit: 'days' as RecurringIntervalUnit, desc: '30 Days' },
  { label: 'Bi-Monthly', frequency: 60, unit: 'days' as RecurringIntervalUnit, desc: '60 Days' },
  { label: 'Quarterly', frequency: 90, unit: 'days' as RecurringIntervalUnit, desc: '90 Days' },
  { label: 'Semi-Annual', frequency: 180, unit: 'days' as RecurringIntervalUnit, desc: '180 Days' },
  { label: 'Annual', frequency: 365, unit: 'days' as RecurringIntervalUnit, desc: '365 Days' },
];

export const MaintenanceScheduler: React.FC<MaintenanceSchedulerProps> = ({ machine }) => {
  const {
    maintenanceSchedules,
    addMaintenanceSchedule,
    updateMaintenanceSchedule,
    deleteMaintenanceSchedule,
    completeMaintenanceSchedule,
    rescheduleMaintenanceItem,
    language,
  } = useFactory();

  // View state: 'timeline' vs 'calendar'
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');

  // Filters & search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'overdue' | 'due_soon' | 'upcoming'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Calendar month state (defaults to October 2026 based on mock clock)
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date('2026-10-01'));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Modal states for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MaintenanceScheduleItem | null>(null);

  // Complete confirmation modal
  const [completingItem, setCompletingItem] = useState<MaintenanceScheduleItem | null>(null);
  const [completionNotes, setCompletionNotes] = useState<string>('');

  // Postpone dropdown
  const [postponeDropdownId, setPostponeDropdownId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState<string>('');
  const [formPartName, setFormPartName] = useState<string>('');
  const [formPartNumber, setFormPartNumber] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MaintenanceScheduleItem['partCategory']>('Mechanical');
  const [formServiceType, setFormServiceType] = useState<MaintenanceScheduleItem['serviceType']>('routine');
  const [formPriority, setFormPriority] = useState<MaintenanceScheduleItem['priority']>('medium');
  const [formFrequency, setFormFrequency] = useState<number>(30);
  const [formFrequencyUnit, setFormFrequencyUnit] = useState<RecurringIntervalUnit>('days');
  const [formRecurrenceLabel, setFormRecurrenceLabel] = useState<string>('Monthly (30 Days)');
  const [formNextDueDate, setFormNextDueDate] = useState<string>('2026-10-15');
  const [formTechnician, setFormTechnician] = useState<string>('Ramesh Patil');
  const [formDowntime, setFormDowntime] = useState<number>(2.0);
  const [formCost, setFormCost] = useState<number>(3500);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formChecklist, setFormChecklist] = useState<string[]>([
    'Inspect component condition',
    'Verify bolt torque and alignment',
  ]);
  const [newChecklistText, setNewChecklistText] = useState<string>('');

  // Filter schedules for the active machine
  const machineSchedules = useMemo(() => {
    return maintenanceSchedules.filter((s) => s.machineId === machine.id);
  }, [maintenanceSchedules, machine.id]);

  // Compute status helpers using current simulated date (2026-10-01)
  const todaySimulated = new Date('2026-10-01');

  const getDaysUntilDue = (dueDateStr: string): number => {
    const due = new Date(dueDateStr);
    const diff = due.getTime() - todaySimulated.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDynamicStatus = (dueDateStr: string): MaintenanceScheduleItem['status'] => {
    const days = getDaysUntilDue(dueDateStr);
    if (days < 0) return 'overdue';
    if (days <= 7) return 'due_soon';
    return 'upcoming';
  };

  // Filtered schedules for display
  const filteredSchedules = useMemo(() => {
    return machineSchedules.filter((item) => {
      const currentStatus = getDynamicStatus(item.nextDueDate);
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.partCategory === categoryFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.partName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.partNumber && item.partNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.assignedTechnician && item.assignedTechnician.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDate = !selectedCalendarDate || item.nextDueDate === selectedCalendarDate;

      return matchesStatus && matchesCategory && matchesSearch && matchesDate;
    });
  }, [machineSchedules, statusFilter, categoryFilter, searchQuery, selectedCalendarDate]);

  // Summary Metrics
  const overdueCount = machineSchedules.filter((s) => getDynamicStatus(s.nextDueDate) === 'overdue').length;
  const dueSoonCount = machineSchedules.filter((s) => getDynamicStatus(s.nextDueDate) === 'due_soon').length;
  const upcomingCount = machineSchedules.filter((s) => getDynamicStatus(s.nextDueDate) === 'upcoming').length;
  const totalAnnualBudgetINR = machineSchedules.reduce((acc, s) => {
    let occurrencesPerYear = 1;
    if (s.recurrence.unit === 'days') occurrencesPerYear = Math.max(1, Math.round(365 / s.recurrence.frequency));
    else if (s.recurrence.unit === 'weeks') occurrencesPerYear = Math.max(1, Math.round(52 / s.recurrence.frequency));
    else if (s.recurrence.unit === 'months') occurrencesPerYear = Math.max(1, Math.round(12 / s.recurrence.frequency));
    return acc + s.estimatedCostINR * occurrencesPerYear;
  }, 0);

  // Grouped for Timeline View
  const overdueItems = filteredSchedules.filter((s) => getDynamicStatus(s.nextDueDate) === 'overdue');
  const dueSoonItems = filteredSchedules.filter((s) => getDynamicStatus(s.nextDueDate) === 'due_soon');
  const regularUpcomingItems = filteredSchedules.filter((s) => getDynamicStatus(s.nextDueDate) === 'upcoming');

  // Open modal in create mode
  const handleOpenCreateModal = (defaultDate?: string) => {
    setEditingItem(null);
    setFormTitle('');
    const recParts = RECOMMENDED_PARTS[machine.type] || RECOMMENDED_PARTS.press;
    const defaultPart = recParts[0];
    setFormPartName(defaultPart?.name || '');
    setFormPartNumber(defaultPart?.partNumber || '');
    setFormCategory(defaultPart?.category || 'Mechanical');
    setFormServiceType('routine');
    setFormPriority('medium');
    setFormFrequency(30);
    setFormFrequencyUnit('days');
    setFormRecurrenceLabel('Monthly (30 Days)');
    setFormNextDueDate(defaultDate || '2026-10-15');
    setFormTechnician('Ramesh Patil');
    setFormDowntime(2.0);
    setFormCost(3200);
    setFormNotes('');
    setFormChecklist(['Inspect mechanical tolerances', 'Clean and degrease mating surfaces', 'Verify torque specifications']);
    setNewChecklistText('');
    setIsModalOpen(true);
  };

  // Open modal in edit mode
  const handleOpenEditModal = (item: MaintenanceScheduleItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormPartName(item.partName);
    setFormPartNumber(item.partNumber || '');
    setFormCategory(item.partCategory);
    setFormServiceType(item.serviceType);
    setFormPriority(item.priority);
    setFormFrequency(item.recurrence.frequency);
    setFormFrequencyUnit(item.recurrence.unit);
    setFormRecurrenceLabel(item.recurrence.label);
    setFormNextDueDate(item.nextDueDate);
    setFormTechnician(item.assignedTechnician || '');
    setFormDowntime(item.estimatedDowntimeHours);
    setFormCost(item.estimatedCostINR);
    setFormNotes(item.notes || '');
    setFormChecklist([...item.checklist]);
    setNewChecklistText('');
    setIsModalOpen(true);
  };

  // Save (Create or Update)
  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPartName.trim()) return;

    const status = getDynamicStatus(formNextDueDate);

    const scheduleData: Omit<MaintenanceScheduleItem, 'id'> = {
      machineId: machine.id,
      title: formTitle.trim(),
      partName: formPartName.trim(),
      partNumber: formPartNumber.trim(),
      partCategory: formCategory,
      serviceType: formServiceType,
      priority: formPriority,
      recurrence: {
        frequency: Number(formFrequency) || 30,
        unit: formFrequencyUnit,
        label: formRecurrenceLabel || `Every ${formFrequency} ${formFrequencyUnit}`,
      },
      lastServicedDate: editingItem?.lastServicedDate || '2026-09-01',
      nextDueDate: formNextDueDate,
      assignedTechnician: formTechnician.trim(),
      estimatedDowntimeHours: Number(formDowntime) || 1.0,
      estimatedCostINR: Number(formCost) || 0,
      checklist: formChecklist.filter((c) => c.trim().length > 0),
      status,
      notes: formNotes.trim(),
    };

    if (editingItem) {
      updateMaintenanceSchedule(editingItem.id, scheduleData);
    } else {
      addMaintenanceSchedule(scheduleData);
    }

    setIsModalOpen(false);
  };

  // Part quick selector in form
  const handleSelectCatalogPart = (part: { name: string; partNumber: string; category: MaintenanceScheduleItem['partCategory'] }) => {
    setFormPartName(part.name);
    setFormPartNumber(part.partNumber);
    setFormCategory(part.category);
    if (!formTitle) {
      setFormTitle(`${part.name} Service`);
    }
  };

  // Add checklist item
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setFormChecklist([...formChecklist, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setFormChecklist(formChecklist.filter((_, i) => i !== idx));
  };

  // Execute complete
  const handleConfirmCompletion = () => {
    if (!completingItem) return;
    completeMaintenanceSchedule(completingItem.id, completionNotes);
    setCompletingItem(null);
    setCompletionNotes('');
  };

  // Calendar generation helpers
  const calendarYear = currentMonthDate.getFullYear();
  const calendarMonthIndex = currentMonthDate.getMonth(); // 0-based
  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(calendarYear, calendarMonthIndex, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(calendarYear, calendarMonthIndex - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(calendarYear, calendarMonthIndex + 1, 1));
  };

  const handleTodayMonth = () => {
    setCurrentMonthDate(new Date('2026-10-01'));
    setSelectedCalendarDate('2026-10-01');
  };

  // Group schedules by date key "YYYY-MM-DD"
  const schedulesByDate = useMemo(() => {
    const map: Record<string, MaintenanceScheduleItem[]> = {};
    machineSchedules.forEach((item) => {
      if (!map[item.nextDueDate]) {
        map[item.nextDueDate] = [];
      }
      map[item.nextDueDate].push(item);
    });
    return map;
  }, [machineSchedules]);

  return (
    <div className="p-5 md:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6 transition-all">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Maintenance Scheduler</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({machine.name})
              </span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold flex items-center gap-1">
              <Repeat className="w-2.5 h-2.5" />
              Recurring Preventive Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set recurring service intervals, link them to specific machine parts, and visualize deadlines on a chronological timeline or monthly calendar view.
          </p>
        </div>

        {/* Action Bar: View Switcher + New Schedule Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segmented View Mode Toggle */}
          <div className="flex items-center p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => {
                setViewMode('timeline');
                setSelectedCalendarDate(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Timeline View</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-purple-500" />
              <span>Calendar View</span>
            </button>
          </div>

          {/* Schedule Service CTA Button */}
          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Schedule Service</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Overdue */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            overdueCount > 0
              ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-300'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          } ${statusFilter === 'overdue' ? 'ring-2 ring-red-500' : ''}`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>Overdue Deadlines</span>
            </span>
            {overdueCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono-num mt-1 text-red-600 dark:text-red-400">
            {overdueCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            Requires immediate shift intervention
          </span>
        </div>

        {/* Due Soon (Next 7 Days) */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'due_soon' ? 'all' : 'due_soon')}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            dueSoonCount > 0
              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
          } ${statusFilter === 'due_soon' ? 'ring-2 ring-amber-500' : ''}`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Due in Next 7 Days</span>
            </span>
          </div>
          <div className="text-2xl font-bold font-mono-num mt-1 text-amber-600 dark:text-amber-400">
            {dueSoonCount}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            Parts and technician reserved
          </span>
        </div>

        {/* Monitored Machine Parts */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <Package className="w-3.5 h-3.5 text-blue-500" />
              <span>Linked Machine Parts</span>
            </span>
          </div>
          <div className="text-2xl font-bold font-mono-num mt-1 text-slate-900 dark:text-white">
            {machineSchedules.length}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Active recurring intervals assigned
          </span>
        </div>

        {/* Estimated Annual Budget */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              <span>Estimated Annual Budget</span>
            </span>
          </div>
          <div className="text-2xl font-bold font-mono-num mt-1 text-emerald-600 dark:text-emerald-400">
            ₹{totalAnnualBudgetINR.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            Scheduled PM & parts spend
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#f9fafb] dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by part, service title, SKU, or technician..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[11px] text-slate-400 font-semibold shrink-0 pl-1">Status:</span>
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'due_soon', label: 'Due Soon' },
              { id: 'upcoming', label: 'Upcoming' },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}

          {/* Part Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Part Types</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Hydraulic">Hydraulic</option>
            <option value="Electrical">Electrical</option>
            <option value="Pneumatic">Pneumatic</option>
            <option value="Thermal">Thermal</option>
            <option value="Lubrication">Lubrication</option>
            <option value="Structural">Structural</option>
          </select>
        </div>
      </div>

      {/* Date Filter Tag if selected from Calendar */}
      {selectedCalendarDate && (
        <div className="flex items-center justify-between p-2.5 px-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>
              Showing services scheduled on: <strong>{selectedCalendarDate}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedCalendarDate(null)}
            className="text-purple-700 dark:text-purple-300 font-semibold hover:underline flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Show All Dates</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 1: TIMELINE VIEW                                                     */}
      {/* ========================================================================= */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {filteredSchedules.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-850 border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No scheduled maintenance items match your current filter.
              </p>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                  setSelectedCalendarDate(null);
                }}
                className="text-xs text-emerald-600 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. OVERDUE SECTION */}
              {overdueItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>OVERDUE DEADLINES ({overdueItems.length})</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      — Service deadline has passed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {overdueItems.map((item) => (
                      <ScheduleCard
                        key={item.id}
                        item={item}
                        daysUntilDue={getDaysUntilDue(item.nextDueDate)}
                        dynamicStatus="overdue"
                        onComplete={() => setCompletingItem(item)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => deleteMaintenanceSchedule(item.id)}
                        onReschedule={(days) => rescheduleMaintenanceItem(item.id, days)}
                        isPostponeOpen={postponeDropdownId === item.id}
                        setIsPostponeOpen={(open) => setPostponeDropdownId(open ? item.id : null)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 2. DUE SOON SECTION (NEXT 7 DAYS) */}
              {dueSoonItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>DUE SOON · NEXT 7 DAYS ({dueSoonItems.length})</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      — Imminent scheduled recurrence
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dueSoonItems.map((item) => (
                      <ScheduleCard
                        key={item.id}
                        item={item}
                        daysUntilDue={getDaysUntilDue(item.nextDueDate)}
                        dynamicStatus="due_soon"
                        onComplete={() => setCompletingItem(item)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => deleteMaintenanceSchedule(item.id)}
                        onReschedule={(days) => rescheduleMaintenanceItem(item.id, days)}
                        isPostponeOpen={postponeDropdownId === item.id}
                        setIsPostponeOpen={(open) => setPostponeDropdownId(open ? item.id : null)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 3. REGULAR UPCOMING SCHEDULES */}
              {regularUpcomingItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>UPCOMING SCHEDULED DEADLINES ({regularUpcomingItems.length})</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      — Operating normally within interval threshold
                    </span>
                  </div>

                  <div className="space-y-3">
                    {regularUpcomingItems.map((item) => (
                      <ScheduleCard
                        key={item.id}
                        item={item}
                        daysUntilDue={getDaysUntilDue(item.nextDueDate)}
                        dynamicStatus="upcoming"
                        onComplete={() => setCompletingItem(item)}
                        onEdit={() => handleOpenEditModal(item)}
                        onDelete={() => deleteMaintenanceSchedule(item.id)}
                        onReschedule={(days) => rescheduleMaintenanceItem(item.id, days)}
                        isPostponeOpen={postponeDropdownId === item.id}
                        setIsPostponeOpen={(open) => setPostponeDropdownId(open ? item.id : null)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CALENDAR VIEW                                                     */}
      {/* ========================================================================= */}
      {viewMode === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Navigation Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {monthName} {calendarYear}
              </h3>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                · {machineSchedules.length} scheduled intervals
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleTodayMonth}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors"
              >
                Today (Oct 2026)
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Weekday Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs font-bold text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>SUN</span>
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
                <span>FRI</span>
                <span>SAT</span>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {/* Empty leading padding cells */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="h-24 sm:h-28 rounded-xl bg-slate-50/40 dark:bg-slate-900/30 border border-transparent"
                  />
                ))}

                {/* Actual Month Days */}
                {Array.from({ length: daysInMonth }).map((_, dayIdx) => {
                  const dayNum = dayIdx + 1;
                  const dateStr = `${calendarYear}-${String(calendarMonthIndex + 1).padStart(2, '0')}-${String(
                    dayNum
                  ).padStart(2, '0')}`;
                  const daySchedules = schedulesByDate[dateStr] || [];

                  const isToday =
                    calendarYear === 2026 && calendarMonthIndex === 9 && dayNum === 1; // 2026-10-01
                  const isSelected = selectedCalendarDate === dateStr;

                  return (
                    <div
                      key={dateStr}
                      onClick={() => {
                        if (daySchedules.length > 0) {
                          setSelectedCalendarDate(isSelected ? null : dateStr);
                        } else {
                          handleOpenCreateModal(dateStr);
                        }
                      }}
                      className={`h-24 sm:h-28 p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800'
                          : isToday
                          ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-300 dark:border-amber-700/60'
                          : 'bg-white dark:bg-slate-850 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-md ${
                            isToday
                              ? 'bg-amber-500 text-white shadow-2xs'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {isToday && (
                          <span className="text-[9px] font-mono uppercase text-amber-600 dark:text-amber-400 font-bold hidden sm:inline">
                            Today
                          </span>
                        )}

                        {/* Quick add plus button on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCreateModal(dateStr);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-opacity"
                          title="Schedule service on this day"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Day Maintenance Pills */}
                      <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none pr-0.5">
                        {daySchedules.map((item) => {
                          const status = getDynamicStatus(item.nextDueDate);
                          const isOver = status === 'overdue';
                          const isSoon = status === 'due_soon';

                          return (
                            <div
                              key={item.id}
                              className={`px-1.5 py-0.5 rounded text-[10px] truncate font-medium border flex items-center gap-1 ${
                                isOver
                                  ? 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                                  : isSoon
                                  ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                              }`}
                              title={`${item.title} (${item.partName}) · Due ${item.nextDueDate}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  isOver ? 'bg-red-500' : isSoon ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              />
                              <span className="truncate">{item.partName.split(' ')[0]}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer indicator if empty */}
                      {daySchedules.length === 0 && (
                        <span className="text-[9px] text-slate-300 dark:text-slate-700 font-mono">
                          -
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Calendar Quick Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Overdue Service</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Due in Next 7 Days</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Upcoming Scheduled</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Click any date to filter tasks or click (+) to schedule service on that day
            </span>
          </div>

          {/* If a date with items is selected, show list below calendar */}
          {selectedCalendarDate && filteredSchedules.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-purple-600" />
                <span>Services Scheduled for {selectedCalendarDate}</span>
              </h4>
              <div className="space-y-3">
                {filteredSchedules.map((item) => (
                  <ScheduleCard
                    key={item.id}
                    item={item}
                    daysUntilDue={getDaysUntilDue(item.nextDueDate)}
                    dynamicStatus={getDynamicStatus(item.nextDueDate)}
                    onComplete={() => setCompletingItem(item)}
                    onEdit={() => handleOpenEditModal(item)}
                    onDelete={() => deleteMaintenanceSchedule(item.id)}
                    onReschedule={(days) => rescheduleMaintenanceItem(item.id, days)}
                    isPostponeOpen={postponeDropdownId === item.id}
                    setIsPostponeOpen={(open) => setPostponeDropdownId(open ? item.id : null)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT SCHEDULED MAINTENANCE RECURRENCE                     */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 md:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-amber-50/50 via-white to-transparent dark:from-amber-950/20 dark:via-slate-900 dark:to-transparent">
              <div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold uppercase tracking-wider">
                  {editingItem ? 'Edit Service Schedule' : 'New Recurring Maintenance'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {editingItem ? 'Update Service Interval' : `Schedule Maintenance for ${machine.name}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Establish recurring maintenance intervals linked to physical machinery parts and tracking telemetry.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveSchedule} className="p-5 md:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Quick Recommended Parts Strip */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-500" />
                  <span>Quick-Select Machine Part:</span>
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  {(RECOMMENDED_PARTS[machine.type] || RECOMMENDED_PARTS.press).map((part, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCatalogPart(part)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-all ${
                        formPartName === part.name
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs font-semibold'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{part.name}</span>
                      <span className="text-[9px] opacity-75 font-mono ml-1">({part.category})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Part Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Service Title / Task Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Suction Filter Swap & Pressure Check"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Linked Machine Part *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPartName}
                    onChange={(e) => setFormPartName(e.target.value)}
                    placeholder="e.g. Return Oil Filter Element"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Part SKU & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Part Number / OEM SKU
                  </label>
                  <input
                    type="text"
                    value={formPartNumber}
                    onChange={(e) => setFormPartNumber(e.target.value)}
                    placeholder="e.g. HY-200T-04"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Part Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="Mechanical">Mechanical</option>
                    <option value="Hydraulic">Hydraulic</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Pneumatic">Pneumatic</option>
                    <option value="Thermal">Thermal</option>
                    <option value="Lubrication">Lubrication</option>
                    <option value="Structural">Structural</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Service Type
                  </label>
                  <select
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="routine">Routine PM</option>
                    <option value="lubrication">Lubrication / Greasing</option>
                    <option value="inspection">Inspection / Gauge Check</option>
                    <option value="replacement">Part Replacement</option>
                    <option value="predictive">Predictive Condition-Based</option>
                    <option value="overhaul">Major Overhaul</option>
                  </select>
                </div>
              </div>

              {/* Recurring Frequency Configuration */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-amber-600" />
                    <span>Set Recurring Interval Frequency</span>
                  </span>
                  <span className="text-[11px] font-mono text-amber-800 dark:text-amber-400 font-semibold">
                    {formRecurrenceLabel}
                  </span>
                </div>

                {/* Preset Capsules */}
                <div className="flex flex-wrap gap-1.5">
                  {FREQUENCY_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setFormFrequency(preset.frequency);
                        setFormFrequencyUnit(preset.unit);
                        setFormRecurrenceLabel(`${preset.label} (${preset.desc})`);

                        // Automatically advance next due date
                        const d = new Date('2026-10-01');
                        d.setDate(d.getDate() + preset.frequency);
                        setFormNextDueDate(d.toISOString().split('T')[0]);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        formFrequency === preset.frequency && formFrequencyUnit === preset.unit
                          ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-2xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom frequency inputs */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">
                      Custom Interval Number:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formFrequency}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setFormFrequency(val);
                        setFormRecurrenceLabel(`Every ${val} ${formFrequencyUnit}`);
                      }}
                      className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Interval Unit:</label>
                    <select
                      value={formFrequencyUnit}
                      onChange={(e) => {
                        const u = e.target.value as RecurringIntervalUnit;
                        setFormFrequencyUnit(u);
                        setFormRecurrenceLabel(`Every ${formFrequency} ${u}`);
                      }}
                      className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="operating_hours">Operating Hours</option>
                      <option value="cycles">Production Cycles</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Next Due Date, Priority, Technician */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Next Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formNextDueDate}
                    onChange={(e) => setFormNextDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="low">Low (Standard)</option>
                    <option value="medium">Medium (Preventative)</option>
                    <option value="high">High (Bottleneck Asset)</option>
                    <option value="critical">Critical (Zero Failure Tolerance)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Assigned Technician
                  </label>
                  <input
                    type="text"
                    value={formTechnician}
                    onChange={(e) => setFormTechnician(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Downtime & Cost Estimates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Downtime (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={formDowntime}
                    onChange={(e) => setFormDowntime(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Cost per Service (₹ INR)
                  </label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={formCost}
                    onChange={(e) => setFormCost(parseInt(e.target.value) || 0)}
                    className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Checklist Builder */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Service Inspection Checklist:</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {formChecklist.length} checkpoints
                  </span>
                </label>

                <div className="space-y-1.5">
                  {formChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs"
                    >
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200 truncate">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add checkpoint input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem();
                        }
                      }}
                      placeholder="Add an inspection checkpoint (e.g. Check hydraulic valve seal for leaks)..."
                      className="flex-1 text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    />
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Technician Instructions & Failure Mode Prevention
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Special instructions, torque specifications, safety lockout requirements..."
                  className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>

              {/* Footer Save Button */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{editingItem ? 'Save Changes' : 'Activate Service Schedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPLETE SERVICE CONFIRMATION                                      */}
      {/* ========================================================================= */}
      {completingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div
            className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 md:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Confirm Service Completion
                </h3>
                <p className="text-xs text-slate-500">
                  {completingItem.title} ({completingItem.partName})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Marking this maintenance as complete will record today's date (<strong>2026-10-01</strong>) as completed, append an entry to the permanent Maintenance Log, and automatically roll forward the next deadline by{' '}
              <strong>{completingItem.recurrence.label}</strong>.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Service Completion Notes (Optional):
              </label>
              <textarea
                rows={2}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Checkpoints verified. Torque verified. Replaced O-rings..."
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompletingItem(null)}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCompletion}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Completed & Roll Forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// SUBCOMPONENT: SCHEDULE CARD (Timeline View)
// =============================================================================
interface ScheduleCardProps {
  item: MaintenanceScheduleItem;
  daysUntilDue: number;
  dynamicStatus: MaintenanceScheduleItem['status'];
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReschedule: (days: number) => void;
  isPostponeOpen: boolean;
  setIsPostponeOpen: (open: boolean) => void;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  item,
  daysUntilDue,
  dynamicStatus,
  onComplete,
  onEdit,
  onDelete,
  onReschedule,
  isPostponeOpen,
  setIsPostponeOpen,
}) => {
  const isOverdue = dynamicStatus === 'overdue';
  const isDueSoon = dynamicStatus === 'due_soon';

  // Compute recurrence cycle progress bar
  const totalCycleDays =
    item.recurrence.unit === 'weeks'
      ? item.recurrence.frequency * 7
      : item.recurrence.unit === 'months'
      ? item.recurrence.frequency * 30
      : item.recurrence.frequency;

  const daysPassed = Math.max(0, totalCycleDays - daysUntilDue);
  const cycleProgressPct = Math.min(100, Math.round((daysPassed / totalCycleDays) * 100));

  // Category badge styling
  const categoryStyles: Record<string, string> = {
    Mechanical: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    Hydraulic: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
    Electrical: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    Pneumatic: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800',
    Thermal: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
    Lubrication: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    Structural: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  };

  return (
    <div
      className={`p-4 md:p-5 rounded-2xl border transition-all ${
        isOverdue
          ? 'bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-red-300 dark:border-red-900/60 shadow-xs'
          : isDueSoon
          ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-900/60 shadow-xs'
          : 'bg-[#fcfcfd] dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Column: Title, Part Linkage, Badges */}
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Countdown / Due Status Badge */}
            {isOverdue ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-600 text-white font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <AlertTriangle className="w-3 h-3" />
                Overdue by {Math.abs(daysUntilDue)} days
              </span>
            ) : isDueSoon ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                <Clock className="w-3 h-3" />
                Due in {daysUntilDue === 0 ? 'Today' : `${daysUntilDue} days`}
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due in {daysUntilDue} days
              </span>
            )}

            {/* Recurrence Interval Badge */}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 font-semibold flex items-center gap-1">
              <Repeat className="w-3 h-3 text-amber-500" />
              {item.recurrence.label}
            </span>

            {/* Part Category Badge */}
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                categoryStyles[item.partCategory] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {item.partCategory}
            </span>

            {/* Priority */}
            <span
              className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase font-bold ${
                item.priority === 'critical'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  : item.priority === 'high'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}
            >
              {item.priority}
            </span>
          </div>

          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-tight">
              {item.title}
            </h3>
            {/* Linked Machine Part row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 mt-1">
              <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                <Package className="w-3.5 h-3.5 text-blue-500" />
                <span>Linked Part: {item.partName}</span>
              </span>
              {item.partNumber && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.2 rounded">
                  SKU: {item.partNumber}
                </span>
              )}
            </div>
          </div>

          {/* Notes preview */}
          {item.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
              "{item.notes}"
            </p>
          )}

          {/* Recurrence Cycle Progress Bar */}
          <div className="space-y-1 max-w-md pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Last: {item.lastServicedDate}</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {cycleProgressPct}% Interval Elapsed
              </span>
              <span>Due: {item.nextDueDate}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isOverdue
                    ? 'bg-red-500'
                    : isDueSoon
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${cycleProgressPct}%` }}
              />
            </div>
          </div>

          {/* Checkpoints pills preview */}
          {item.checklist && item.checklist.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-mono">Checkpoints:</span>
              {item.checklist.slice(0, 3).map((chk, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 truncate max-w-[220px]"
                >
                  <CheckSquare className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{chk}</span>
                </span>
              ))}
              {item.checklist.length > 3 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  +{item.checklist.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Key Details & Quick Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          {/* Metadata Specs (Tech, Downtime, Cost) */}
          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs font-mono-num text-slate-500 dark:text-slate-400">
            {item.assignedTechnician && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.assignedTechnician}
                </span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Est. {item.estimatedDowntimeHours}h downtime</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <IndianRupee className="w-3 h-3" />
              <span>₹{item.estimatedCostINR.toLocaleString('en-IN')}</span>
            </span>
          </div>

          {/* Action Button Row */}
          <div className="flex items-center gap-2 relative">
            {/* Complete Button */}
            <button
              onClick={onComplete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-semibold shadow-xs hover:scale-105 active:scale-95 transition-all"
              title="Record service completion and auto-advance to next interval"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Complete</span>
            </button>

            {/* Postpone Dropdown Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsPostponeOpen(!isPostponeOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                title="Postpone / Delay service deadline"
              >
                <span>Postpone</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isPostponeOpen && (
                <div className="absolute right-0 bottom-full mb-1 z-30 w-36 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1 text-xs space-y-0.5">
                  <button
                    onClick={() => {
                      onReschedule(7);
                      setIsPostponeOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    +7 Days
                  </button>
                  <button
                    onClick={() => {
                      onReschedule(14);
                      setIsPostponeOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    +14 Days
                  </button>
                  <button
                    onClick={() => {
                      onReschedule(30);
                      setIsPostponeOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                  >
                    +30 Days (1 Mo)
                  </button>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={onEdit}
              className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors"
              title="Edit schedule"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* Delete Button */}
            <button
              onClick={onDelete}
              className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 transition-colors"
              title="Delete schedule"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
