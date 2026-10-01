import React, { useState, useEffect } from 'react';
import { useFactory } from '../context/FactoryContext';
import { ChakraMotif } from './ChakraMotif';
import { LANGUAGE_LABELS } from '../i18n/translations';
import { SupportedLanguage } from '../types';
import {
  Globe,
  Bot,
  Sparkles,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Menu,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    language,
    setLanguage,
    t,
    machines,
    alerts,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    replayPreloader,
    setIsOnboardingOpen,
    theme,
    toggleTheme,
  } = useFactory();

  const [timeStr, setTimeStr] = useState<string>('');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasFault = machines.some((m) => m.status === 'fault');
  const hasWarning = machines.some((m) => m.status === 'warning');
  const unackAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Mobile Menu + ChatGPT-style Model / Plant Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white shadow-xs">
            <ChakraMotif size={18} className="text-white" animate={false} />
            {/* Subtle tri-color pip */}
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">
              {t.appName}
            </span>
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              <span>v5.0 Pro</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Factory Overall Health & Live Clock */}
      <div className="hidden md:flex items-center gap-3">
        {/* Plant Status Indicator */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            hasFault
              ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300'
              : hasWarning
              ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
          }`}
        >
          {hasFault ? (
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-bounce" />
          ) : hasWarning ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>
            {hasFault
              ? t.criticalFault
              : hasWarning
              ? `${unackAlerts} ${t.attentionNeeded}`
              : t.allNormal}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping ml-0.5" />
        </div>

        {/* Live IST Plant Clock */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono-num bg-slate-100/80 dark:bg-slate-950 px-2.5 py-1.5 rounded-full border border-slate-200/80 dark:border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-slate-400 font-mono text-[10px]">IST</span>
          <span className="text-slate-700 dark:text-slate-200 font-medium">{timeStr || '12:00:00 PM'}</span>
        </div>
      </div>

      {/* Right side: Language Switcher, Theme Toggle, Guided Tour, ChatGPT-style AI Button */}
      <div className="flex items-center gap-2">
        {/* Replay Namaste Intro */}
        <button
          onClick={replayPreloader}
          title="Replay Namaste Welcome"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">नमस्ते</span>
        </button>

        {/* Theme Toggle (Light / Dark) */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Guided Tour Trigger */}
        <button
          onClick={() => setIsOnboardingOpen(true)}
          title="Guided Onboarding Tour"
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Guided Tour"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
            aria-expanded={isLangMenuOpen}
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-medium">{LANGUAGE_LABELS[language].flag}</span>
            <span className="hidden sm:inline">{LANGUAGE_LABELS[language].native}</span>
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Select Language / भाषा चुनें
              </div>
              {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((langKey) => (
                <button
                  key={langKey}
                  onClick={() => {
                    setLanguage(langKey);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                    language === langKey
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{LANGUAGE_LABELS[langKey].flag}</span>
                    <span>{LANGUAGE_LABELS[langKey].native}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {LANGUAGE_LABELS[langKey].label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ChatGPT Style "Take my help" Button */}
        <button
          onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all ${
            isAiDrawerOpen
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 ring-2 ring-slate-400'
              : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 hover:scale-[1.02]'
          }`}
          aria-label={t.takeMyHelp}
        >
          <div className="relative">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span>{t.takeMyHelp}</span>
        </button>
      </div>
    </header>
  );
};
