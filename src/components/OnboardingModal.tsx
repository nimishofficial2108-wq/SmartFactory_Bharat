import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { LANGUAGE_LABELS } from '../i18n/translations';
import { SupportedLanguage } from '../types';
import { ChakraMotif } from './ChakraMotif';
import {
  LayoutDashboard,
  Bot,
  Radio,
  CheckCircle,
  ArrowRight,
  X,
  Globe,
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    isOnboardingOpen,
    setIsOnboardingOpen,
    language,
    setLanguage,
    t,
    setCurrentNav,
    setIsAiDrawerOpen,
  } = useFactory();

  const [step, setStep] = useState<number>(1); // 1: Language selection, 2: Dashboard tour, 3: AI helper tour, 4: Device pair tour

  if (!isOnboardingOpen) return null;

  const handleFinish = () => {
    setIsOnboardingOpen(false);
    setStep(1);
  };

  const handleGoToPair = () => {
    setIsOnboardingOpen(false);
    setCurrentNav('pair');
  };

  const handleOpenAi = () => {
    setIsOnboardingOpen(false);
    setIsAiDrawerOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Accent Tri-Color Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-white to-emerald-500" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <ChakraMotif size={22} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {step === 1 ? 'Choose Your Language / भाषा चुनें' : 'SmartFactory Bharat Guided Tour'}
              </h2>
              <p className="text-xs text-slate-400">
                {step === 1 ? 'Select your preferred language for machine telemetry' : `Step ${step - 1} of 3`}
              </p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Skip Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-xl">
                <Globe className="w-4 h-4 shrink-0" />
                <span>
                  All metrics, alerts, and AI insights will automatically adapt to your regional language.
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((langKey) => {
                  const isSelected = language === langKey;
                  return (
                    <button
                      key={langKey}
                      onClick={() => setLanguage(langKey)}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-lg">{LANGUAGE_LABELS[langKey].flag}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-amber-400" />}
                      </div>
                      <span className="font-bold text-sm">{LANGUAGE_LABELS[langKey].native}</span>
                      <span className="text-[11px] text-slate-400">{LANGUAGE_LABELS[langKey].label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">This is your Factory Dashboard</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Real-time telemetry showing live Amperes, idle hours, and ₹ saved this month across all connected SME machines in your workshop.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-emerald-400 font-mono-num flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                4 Boxes Telemetry Active · Zero Machine Rewiring
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
                <Bot className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Meet your Factory AI Helper</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Always available on the right edge. Tap <strong>"Take my help"</strong> anytime to ask plain-language questions like "Why is Press 2 vibrating?" or "How much ₹ did we waste on idle motors today?".
                </p>
              </div>
              <button
                onClick={handleOpenAi}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700"
              >
                <span>Try asking a question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <Radio className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Clip & Pair a New Device</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Got a new machine? Clip the magnetic SmartFactory box on the steel frame, clamp the non-invasive CT current ring, and connect over Wi-Fi in under 2 minutes.
                </p>
              </div>
              <button
                onClick={handleGoToPair}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
              >
                <span>Pair First Device Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={handleFinish}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Skip / छोड़ें
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
              >
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
              >
                <span>{step === 1 ? 'Continue / आगे बढ़ें' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
              >
                Done / तैयार
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
