import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { LANGUAGE_LABELS } from '../i18n/translations';
import { SupportedLanguage } from '../types';
import {
  Globe,
  IndianRupee,
  Cpu,
  Bell,
  Trash2,
  Edit2,
  Check,
  Save,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    tariffRateINR,
    setTariffRateINR,
    machines,
    disconnectMachine,
    renameMachine,
    t,
  } = useFactory();

  const [inputTariff, setInputTariff] = useState<string>(tariffRateINR.toString());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState<string>('');
  const [whatsappAlerts, setWhatsappAlerts] = useState<boolean>(true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [savedBanner, setSavedBanner] = useState<boolean>(false);

  const handleSaveTariff = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputTariff);
    if (!isNaN(parsed) && parsed > 0) {
      setTariffRateINR(parsed);
      setSavedBanner(true);
      setTimeout(() => setSavedBanner(false), 2500);
    }
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setRenameText(currentName);
  };

  const handleConfirmRename = (id: string) => {
    if (renameText.trim()) {
      renameMachine(id, renameText.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{t.navSettings}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure language, commercial electricity tariff, paired hardware, and owner alerts
          </p>
        </div>

        {savedBanner && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
            <Check className="w-3.5 h-3.5" />
            <span>Settings Saved!</span>
          </div>
        )}
      </div>

      {/* 1. Language Preference */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">App Language / भाषा</h2>
            <p className="text-xs text-slate-400">Switch dashboard interface language anytime</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((langKey) => {
            const isSelected = language === langKey;
            return (
              <button
                key={langKey}
                onClick={() => setLanguage(langKey)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="font-bold text-xs block">{LANGUAGE_LABELS[langKey].native}</span>
                  <span className="text-[10px] text-slate-400">{LANGUAGE_LABELS[langKey].label}</span>
                </div>
                <span className="text-base">{LANGUAGE_LABELS[langKey].flag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Electricity Tariff Rate */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{t.tariffRate}</h2>
            <p className="text-xs text-slate-400">{t.tariffExpl}</p>
          </div>
        </div>

        <form onSubmit={handleSaveTariff} className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono font-bold">
              ₹
            </span>
            <input
              type="number"
              step="0.1"
              min="1"
              max="25"
              value={inputTariff}
              onChange={(e) => setInputTariff(e.target.value)}
              className="w-40 pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono-num font-bold text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Update Tariff</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono-num">
            Currently: <strong>₹{tariffRateINR.toFixed(2)}</strong> per kWh
          </span>
        </form>
      </div>

      {/* 3. Connected Hardware Boxes Management */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t.pairedDevices}</h2>
              <p className="text-xs text-slate-400">Manage paired SmartFactory boxes</p>
            </div>
          </div>

          <span className="text-xs font-mono-num text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
            {machines.length} Boxes Online
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
          {machines.map((m) => (
            <div key={m.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[200px]">
                {editingId === m.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-400 text-xs text-white"
                    />
                    <button
                      onClick={() => handleConfirmRename(m.id)}
                      className="p-1 rounded bg-amber-500 text-slate-950"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-xs text-white">{m.name}</span>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>Box: {m.boxId}</span>
                      <span>·</span>
                      <span className="uppercase text-amber-400">{m.type}</span>
                      <span>·</span>
                      <span>{m.location}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartRename(m.id, m.name)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors"
                  title={t.renameDevice}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => disconnectMachine(m.id)}
                  disabled={machines.length <= 1}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-30 text-xs transition-colors"
                  title={t.disconnectDevice}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Notification Preferences */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{t.notificationPreferences}</h2>
            <p className="text-xs text-slate-400">Get urgent alerts before motors burn out</p>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  {t.smsWhatsappAlerts}
                </span>
                <span className="text-[11px] text-slate-400">
                  Instant message when current spikes &gt; 25% or vibration exceeds threshold
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={whatsappAlerts}
              onChange={(e) => setWhatsappAlerts(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Weekly Energy & Idle Waste Summary Digest
                </span>
                <span className="text-[11px] text-slate-400">
                  Automated PDF report dispatched every Monday 8:00 AM IST
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="accent-amber-500 w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
