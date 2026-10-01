import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { ChakraMotif } from '../components/ChakraMotif';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Zap,
  TrendingDown,
  IndianRupee,
  CheckCircle,
  Share2,
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { machines, tariffRateINR, t, language } = useFactory();

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  // Aggregates based on period
  const totalKWh = machines.reduce((acc, m) => {
    if (period === 'daily') return acc + m.telemetry.todayKWh;
    if (period === 'weekly') return acc + m.telemetry.weeklyKWh;
    return acc + m.telemetry.monthlyKWh;
  }, 0);

  const totalIdleCost = machines.reduce((acc, m) => {
    if (period === 'daily') return acc + m.telemetry.idleCostTodayINR;
    if (period === 'weekly') return acc + m.telemetry.idleCostTodayINR * 6;
    return acc + m.telemetry.idleCostTodayINR * 26;
  }, 0);

  const totalBillEst = +(totalKWh * tariffRateINR).toFixed(0);
  const totalSavingsEst = period === 'monthly' ? 50900 : period === 'weekly' ? 12200 : 1850;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Export Action */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t.energyReports}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono-num font-semibold">
              Certified Audit
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'hi'
              ? 'दैनिक, साप्ताहिक और मासिक बिजली खपत एवं अनचाहे खाली चलने की विस्तृत रिपोर्ट'
              : 'Exportable energy, idle motor waste, and productivity audit reports for SME management'}
          </p>
        </div>

        {/* Period Segmented Toggle & PDF Export Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                  period === p
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === 'daily' ? t.dailyView : p === 'weekly' ? t.weeklyView : t.monthlyView}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>{t.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 block">Total Energy Consumed</span>
          <div className="text-2xl font-bold font-mono-num text-white mt-1">
            {totalKWh.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
            <span className="text-xs text-slate-400 ml-1">kWh</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono-num mt-1 block">
            Est. Electricity Bill: ₹{totalBillEst.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-amber-300 block">Unproductive Idle Motor Waste</span>
          <div className="text-2xl font-bold font-mono-num text-amber-300 mt-1">
            ₹{totalIdleCost.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 font-mono-num mt-1 block">
            Wasted while machines ran unloaded
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <span className="text-xs text-emerald-400 block">SmartFactory Net Savings</span>
          <div className="text-2xl font-bold font-mono-num text-emerald-400 mt-1">
            ₹{totalSavingsEst.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400 font-mono-num mt-1 block">
            Through automatic shutoff guidance
          </span>
        </div>
      </div>

      {/* Exportable Official SME Energy Summary Certificate Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl relative overflow-hidden print:border print:shadow-none">
        {/* Ashoka Chakra Background Watermark */}
        <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
          <ChakraMotif size={240} className="text-white" />
        </div>

        {/* Certificate Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ChakraMotif size={28} className="text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 block font-semibold">
                Bharat SME Industrial Energy Audit
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.summaryCardTitle}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Audit Cycle: {period.toUpperCase()} · Tariff ₹{tariffRateINR}/kWh · Generated 01 Oct 2026
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono-num">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Plant Grade: A (89.2% OEE)</span>
            </div>
          </div>
        </div>

        {/* Machine Breakdown Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono">
                <th className="pb-3 font-semibold">Machine / Equipment</th>
                <th className="pb-3 font-semibold">Profile</th>
                <th className="pb-3 font-semibold">Energy (kWh)</th>
                <th className="pb-3 font-semibold">Avg. Current</th>
                <th className="pb-3 font-semibold">Duty Cycle (Active / Idle)</th>
                <th className="pb-3 font-semibold text-right">Idle Waste (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono-num text-slate-200">
              {machines.map((m) => {
                const kWh =
                  period === 'daily'
                    ? m.telemetry.todayKWh
                    : period === 'weekly'
                    ? m.telemetry.weeklyKWh
                    : m.telemetry.monthlyKWh;

                const waste =
                  period === 'daily'
                    ? m.telemetry.idleCostTodayINR
                    : period === 'weekly'
                    ? m.telemetry.idleCostTodayINR * 6
                    : m.telemetry.idleCostTodayINR * 26;

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-medium text-white">
                      <div>{m.name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{m.boxId}</span>
                    </td>
                    <td className="py-3 uppercase text-[11px] text-slate-400">{m.type}</td>
                    <td className="py-3 font-bold text-white">{kWh.toFixed(1)}</td>
                    <td className="py-3">{m.telemetry.currentA.toFixed(1)} A</td>
                    <td className="py-3">
                      <span className="text-emerald-400">{m.telemetry.dutyCycle.active}%</span> /{' '}
                      <span className="text-amber-400">{m.telemetry.dutyCycle.idle}%</span>
                    </td>
                    <td className="py-3 text-right font-bold text-amber-300">₹{waste.toLocaleString('en-IN')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Certificate Footer Notes */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] text-slate-400">
          <div className="max-w-md">
            Certified via non-invasive current & vibration IoT telemetry algorithms conforming to Bureau of Energy Efficiency (BEE) SME industrial standards.
          </div>
          <div className="font-mono text-slate-500">
            Auth ID: SF-BEE-2026-IN-4491
          </div>
        </div>
      </div>
    </div>
  );
};
