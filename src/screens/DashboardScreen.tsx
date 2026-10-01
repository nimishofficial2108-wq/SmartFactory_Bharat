import React, { useState } from 'react';
import { useFactory } from '../context/FactoryContext';
import { Sparkline } from '../components/Sparkline';
import { ChakraMotif } from '../components/ChakraMotif';
import { PredictiveHealthScore } from '../components/PredictiveHealthScore';
import {
  Cpu,
  Zap,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  Activity,
  Layers,
  IndianRupee,
  Sparkles,
  ArrowUp,
  Search,
  Check,
  RotateCcw,
  Sliders,
  ShieldAlert,
} from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const {
    machines,
    setSelectedMachineId,
    setCurrentNav,
    t,
    alerts,
    tariffRateINR,
    language,
    setIsAiDrawerOpen,
    sendChatMessage,
  } = useFactory();

  // Prompt bar state (ChatGPT hero style)
  const [promptText, setPromptText] = useState<string>('');
  const [inlineAiAnswer, setInlineAiAnswer] = useState<{
    query: string;
    answer: string;
    points: string[];
    actionLabel?: string;
    actionNav?: string;
    actionMachineId?: string;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Aggregate factory metrics
  const totalMachines = machines.length;
  const totalTodayKWh = machines.reduce((acc, m) => acc + m.telemetry.todayKWh, 0);
  const totalIdleCostToday = machines.reduce((acc, m) => acc + m.telemetry.idleCostTodayINR, 0);
  const totalMonthlySavings = machines.reduce((acc, m) => acc + m.telemetry.monthlySavingsINR, 0);
  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  const hasWarning = machines.some((m) => m.status === 'warning');
  const hasFault = machines.some((m) => m.status === 'fault');

  const handleOpenMachine = (machineId: string) => {
    setSelectedMachineId(machineId);
    setCurrentNav('machines');
  };

  // Preset ChatGPT prompt chips
  const promptChips =
    language === 'hi'
      ? [
          {
            label: 'कंप्रेसर में चेतावनी क्यों है?',
            query: 'रोटरी स्क्रू कंप्रेसर 45kW में चेतावनी का क्या कारण है और क्या करें?',
            icon: AlertTriangle,
          },
          {
            label: 'आज कितनी बिजली व रुपये बचे?',
            query: 'आज का कुल kWh और इस महीने की बचत कितनी है?',
            icon: Zap,
          },
          {
            label: 'मोटर जलने का खतरा (Longevity)?',
            query: 'सभी 4 मशीनों का प्रेडिक्टिव हेल्थ स्कोर और ब्रेकडाउन का अनुमान बताओ',
            icon: Activity,
          },
          {
            label: 'नया IoT बॉक्स कैसे लगाएं?',
            query: 'नॉन-इन्वेंसिव मैग्नेटिक रेट्रोफिट बॉक्स को मशीन पर कैसे क्लिप करें?',
            icon: Cpu,
          },
        ]
      : [
          {
            label: 'Why is Compressor #2 warning?',
            query: 'Why is the Rotary Screw Compressor 45kW showing a vibration warning?',
            icon: AlertTriangle,
          },
          {
            label: 'Today’s energy & rupee savings?',
            query: 'How much kWh consumed today and how much ₹ saved this month?',
            icon: Zap,
          },
          {
            label: 'Predictive time-to-failure days?',
            query: 'What is the longevity forecast and failure risk across our 4 machines?',
            icon: Activity,
          },
          {
            label: 'How to clip a new retrofit box?',
            query: 'How does universal non-invasive installation work with zero rewiring?',
            icon: Cpu,
          },
        ];

  const handleExecutePrompt = (query: string) => {
    if (!query.trim()) return;
    setIsAiLoading(true);
    setInlineAiAnswer(null);

    // Simulate smart, instant ChatGPT analysis tailored to SME shopfloor
    setTimeout(() => {
      setIsAiLoading(false);
      const q = query.toLowerCase();

      if (q.includes('compressor') || q.includes('vibration') || q.includes('कंप्रेसर') || q.includes('चेतावनी')) {
        setInlineAiAnswer({
          query,
          answer:
            language === 'hi'
              ? 'रोटरी स्क्रू कंप्रेसर (Box ID: SF-BOX-9082) में वाइब्रेशन 4.8 mm/s दर्ज हुआ है, जो सामान्य 4.5 mm/s से 6.7% अधिक है।'
              : 'Rotary Screw Compressor 45kW (Box ID: SF-BOX-9082) reached 4.8 mm/s vibration RMS, exceeding the 4.5 mm/s normal threshold by 6.7%.',
          points:
            language === 'hi'
              ? [
                  'कारण: बेल्ट में ढीलापन या ड्राइव पुली के डैम्पर पैड का घिसाव।',
                  'जोखिम: यदि अनदेखा किया, तो 38 दिनों में बेयरिंग फेलियर की 74% संभावना (अनुमानित मरम्मत लागत ~₹22,000)।',
                  'सलाह: आज शिफ्ट समाप्त होने पर बेल्ट का तनाव कसें और एंटी-वाइब्रेशन पैड बदलें।',
                ]
              : [
                  'Root Cause: Drive belt slack or degraded rubber anti-vibration mount pads.',
                  'Longevity Risk: Bearing failure predicted within ~38 operating days (repair cost ~₹22,000).',
                  'Technician Action: Re-tension drive belt and inspect base dampening pads during shift end.',
                ],
          actionLabel: language === 'hi' ? 'कंप्रेसर 3D मॉडल देखें' : 'Inspect Compressor 3D Twin',
          actionNav: 'machines',
          actionMachineId: 'm2',
        });
      } else if (q.includes('energy') || q.includes('savings') || q.includes('रुपये') || q.includes('बिजली') || q.includes('saving')) {
        setInlineAiAnswer({
          query,
          answer:
            language === 'hi'
              ? `आज कारखाने ने ${totalTodayKWh.toFixed(1)} kWh बिजली का उपभोग किया है (कुल बिजली बिल: ₹${(
                  totalTodayKWh * tariffRateINR
                ).toFixed(0)})।`
              : `Total plant energy today is ${totalTodayKWh.toFixed(1)} kWh, totaling ~₹${(
                  totalTodayKWh * tariffRateINR
                ).toFixed(0)} at ₹${tariffRateINR}/unit tariff.`,
          points:
            language === 'hi'
              ? [
                  `इस महीने की कुल बचत: ₹${totalMonthlySavings.toLocaleString('en-IN')} (आइडल मोटर ऑटो-शटडाउन से)।`,
                  `आज आइडल चलने का नुकसान: ₹${totalIdleCostToday} (विशेषकर कंप्रेसर 3.4 घंटे बिना लोड चला)।`,
                  `स्मार्ट सुझाव: यदि कंप्रेसर पर 5-मिनट ऑटो-ऑफ टाइमर लगाएं, तो हर माह ₹14,200 अतिरिक्त बचेंगे।`,
                ]
              : [
                  `Monthly Savings to Date: ₹${totalMonthlySavings.toLocaleString('en-IN')} achieved via idle motor curbs.`,
                  `Today’s Idle Waste: ₹${totalIdleCostToday} (Compressor ran unloaded 48% of the shift).`,
                  `Energy Tip: Activating auto-standby on unloaded motors will trim ₹14,200 in monthly power bills.`,
                ],
          actionLabel: language === 'hi' ? 'ऊर्जा ऑडिट रिपोर्ट देखें' : 'Open Energy Audit Report',
          actionNav: 'reports',
        });
      } else if (q.includes('failure') || q.includes('health') || q.includes('longevity') || q.includes('मोटर जलने')) {
        setInlineAiAnswer({
          query,
          answer:
            language === 'hi'
              ? 'स्मार्टफैक्ट्री प्रेडिक्टिव एल्गोरिदम ने आपकी सभी 4 मशीनों का विश्लेषण पूरा कर लिया है:'
              : 'SmartFactory Prognostic Algorithm evaluated vibration harmonic trends & current strain across all 4 machines:',
          points:
            language === 'hi'
              ? [
                  'हाइड्रोलिक प्रेस 200T: 91% हेल्थ स्कोर — ~182 दिन बिना किसी खराबी के कार्य करेगा।',
                  'रोटरी स्क्रू कंप्रेसर 45kW: 68% हेल्थ स्कोर — मध्यम जोखिम (~38 दिन में बेयरिंग सर्विस आवश्यक)।',
                  'पॉलिशिंग मोटर 15HP: 94% हेल्थ स्कोर — अत्यधिक स्वस्थ (~210 दिन)।',
                  'मीडियम इंडक्शन फर्नेस: 88% हेल्थ स्कोर — सामान्य (~145 दिन)।',
                ]
              : [
                  'Hydraulic Press 200T: 91% Health Score — ~182 days longevity remaining (Optimal).',
                  'Rotary Screw Compressor: 68% Health Score — Moderate Risk (~38 days to bearing fatigue).',
                  'Polishing Motor 15HP: 94% Health Score — Low Risk (~210 days).',
                  'Induction Furnace 100kW: 88% Health Score — Nominal (~145 days).',
                ],
          actionLabel: language === 'hi' ? 'प्रेडिक्टिव हेल्थ विश्लेषण देखें' : 'View Longevity Prognostics',
          actionNav: 'machines',
          actionMachineId: 'm2',
        });
      } else {
        setInlineAiAnswer({
          query,
          answer:
            language === 'hi'
              ? 'स्मार्टफैक्ट्री रेट्रोफिट बॉक्स मशीन के बाहरी फ्रेम पर मैग्नेटिक क्लैंप और करंट सेंसर (CT) से 5 मिनट में लग जाता है — बिना कोई तार काटे या वारंटी तोड़े।'
              : 'SmartFactory retrofit box installs non-invasively in under 5 minutes using magnetic base mounts and split-core current clamps — zero machine rewiring or downtime.',
          points:
            language === 'hi'
              ? [
                  'मापन: 3-फेज करंट, वाइब्रेशन RMS (mm/s), तापमान और ध्वनि विसंगति।',
                  'कनेक्टिविटी: कारखाने के Wi-Fi या 4G सिम के माध्यम से लाइव क्लाउड सिंक।',
                  'सुरक्षा: 100% गैल्वेनिक आइसोलेशन — मशीन नियंत्रण सर्किट को कोई खतरा नहीं।',
                ]
              : [
                  'Telemetry: 3-Phase RMS Current, Tri-Axial Vibration, Surface Temp & Acoustic Harmonics.',
                  'Connectivity: Factory Wi-Fi or 4G LTE direct cloud gateway.',
                  'Safety: 100% Galvanically isolated — zero interference with machine control circuitry.',
                ],
          actionLabel: language === 'hi' ? 'नया बॉक्स जोड़ें' : 'Pair New Retrofit Box',
          actionNav: 'pair',
        });
      }
    }, 450);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    handleExecutePrompt(promptText);
    setPromptText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* HERO SECTION: ChatGPT Style Prompt & Assistant Workspace                   */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#00000012] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 md:p-8 transition-all">
        <div className="max-w-3xl mx-auto space-y-5 text-center">
          {/* Subtle Logo Badge & Greeting */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
            <div className="w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
              <ChakraMotif size={12} className="text-white" />
            </div>
            <span>SmartFactory Bharat AI Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {language === 'hi'
                ? 'नमस्ते! आज अपनी मशीनों के बारे में क्या जानना चाहते हैं?'
                : 'Good day! What would you like to know about your shopfloor?'}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xl mx-auto">
              {language === 'hi'
                ? 'सरल भाषा में पूछें — बिजली की खपत, मोटर कंपन, या ब्रेकडाउन का पूर्वानुमान'
                : 'Ask in plain language — live current, vibration anomalies, rupee savings, or breakdown forecasts'}
            </p>
          </div>

          {/* ChatGPT Style Central Prompt Input Pill */}
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center bg-[#f7f7f8] dark:bg-slate-800/90 rounded-3xl border border-slate-200/90 dark:border-slate-700 p-2 pl-5 focus-within:border-slate-400 dark:focus-within:border-slate-500 focus-within:bg-white dark:focus-within:bg-slate-850 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mr-2" />
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'कारखाने की किसी भी मशीन या ऊर्जा की स्थिति पूछें...'
                  : 'Message SmartFactory AI... (e.g. why is compressor vibrating, how much ₹ saved)'
              }
              className="flex-1 bg-transparent text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />

            <div className="flex items-center gap-1.5 pr-1">
              <button
                type="submit"
                disabled={!promptText.trim() || isAiLoading}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  promptText.trim() && !isAiLoading
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm hover:scale-105 active:scale-95'
                    : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500 cursor-not-allowed'
                }`}
                aria-label="Send Query"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>

          {/* ChatGPT Prompt Suggestion Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {promptChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleExecutePrompt(chip.query)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Inline AI Answer Card (ChatGPT conversational response) */}
          {isAiLoading && (
            <div className="p-4 rounded-2xl bg-[#f7f7f8] dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 animate-pulse">
              <ChakraMotif size={18} animate={true} />
              <span className="font-mono-num">SmartFactory AI analyzing 4 IoT telemetry streams...</span>
            </div>
          )}

          {inlineAiAnswer && !isAiLoading && (
            <div className="text-left p-5 rounded-2xl bg-[#fafafa] dark:bg-slate-850 border border-slate-200/90 dark:border-slate-700 shadow-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-white">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <span>SmartFactory AI Assistant</span>
                </div>
                <button
                  onClick={() => setInlineAiAnswer(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  Dismiss
                </button>
              </div>

              <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {inlineAiAnswer.answer}
              </p>

              <ul className="space-y-1.5 pl-2 text-xs text-slate-600 dark:text-slate-300">
                {inlineAiAnswer.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                {inlineAiAnswer.actionLabel && (
                  <button
                    onClick={() => {
                      if (inlineAiAnswer.actionNav) setCurrentNav(inlineAiAnswer.actionNav);
                      if (inlineAiAnswer.actionMachineId) setSelectedMachineId(inlineAiAnswer.actionMachineId);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:scale-105 active:scale-95 transition-all shadow-xs"
                  >
                    <span>{inlineAiAnswer.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    sendChatMessage(inlineAiAnswer.query);
                    setIsAiDrawerOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{language === 'hi' ? 'चैट में आगे बात करें' : 'Continue conversation in AI Drawer'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 SUMMARY CARDS: Crisp, Light, High Readability                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Connected Machines */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{t.machinesConnected}</span>
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
              {totalMachines}
              <span className="text-xs text-slate-400 font-normal ml-1">Boxes</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-mono-num font-medium">
              <CheckCircle2 className="w-3 h-3" />
              100% Online · Wi-Fi
            </p>
          </div>
        </div>

        {/* 2. Factory Health Status */}
        <div
          className={`p-4 rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between transition-colors ${
            hasFault
              ? 'bg-red-50/70 border-red-200 dark:bg-red-500/10 dark:border-red-500/30'
              : hasWarning
              ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30'
              : 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">{t.factoryHealth}</span>
            {hasWarning || hasFault ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="mt-2">
            <div
              className={`text-base font-bold tracking-tight ${
                hasFault
                  ? 'text-red-700 dark:text-red-300'
                  : hasWarning
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {hasFault ? t.criticalFault : hasWarning ? t.attentionNeeded : t.allNormal}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {hasWarning ? 'Compressor vibration elevated' : 'All telemetry nominal'}
            </p>
          </div>
        </div>

        {/* 3. Total kWh Today */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{t.totalKWhToday}</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white">
              {totalTodayKWh.toFixed(1)}
              <span className="text-xs text-slate-400 font-normal ml-1">kWh</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono-num">
              ~₹{(totalTodayKWh * tariffRateINR).toFixed(0)} electricity bill
            </p>
          </div>
        </div>

        {/* 4. Est. ₹ Saved This Month */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{t.estSavedThisMonth}</span>
            <IndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono-num text-emerald-600 dark:text-emerald-400">
              ₹{totalMonthlySavings.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-mono-num">
              <TrendingDown className="w-3 h-3 text-emerald-500" />
              -22% idle power curb
            </p>
          </div>
        </div>

        {/* 5. Active Alerts */}
        <div
          onClick={() => setCurrentNav('alerts')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#00000010] dark:border-slate-800 hover:border-amber-400/80 dark:hover:border-amber-500/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-sm flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>{t.activeAlerts}</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono-num text-slate-900 dark:text-white flex items-center justify-between">
              <span>{activeAlertsCount}</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
              {activeAlertsCount > 0 ? 'Click to inspect alerts' : 'No pending warnings'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PREDICTIVE HEALTH SCORE SECTION (Time-to-failure prognostics)             */}
      {/* ========================================================================= */}
      <PredictiveHealthScore />

      {/* ========================================================================= */}
      {/* CONNECTED MACHINES CARDS GRID (ChatGPT-styled white surface cards)         */}
      {/* ========================================================================= */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Shopfloor Telemetry Grid</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'प्रत्येक मशीन के मैग्नेटिक IoT बॉक्स से लाइव करंट और स्वास्थ्य स्थिति'
                : 'Live current draw, vibration status and longevity trends per retrofit box'}
            </p>
          </div>

          <button
            onClick={() => setCurrentNav('pair')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.connectNewDevice}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {machines.map((machine) => {
            const isWarning = machine.status === 'warning';
            const isFault = machine.status === 'fault';
            const trendValues = machine.trendData.map((d) => d.current);

            return (
              <div
                key={machine.id}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] flex flex-col justify-between ${
                  isFault
                    ? 'border-red-300 dark:border-red-500/40'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-500/40'
                    : 'border-[#00000010] dark:border-slate-800'
                }`}
              >
                {/* Card Top: Machine Name, Box ID & Status Badges */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <h3
                        onClick={() => handleOpenMachine(machine.id)}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-amber-600 cursor-pointer transition-colors"
                      >
                        {machine.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Box ID: {machine.boxId} · {machine.location}
                      </p>
                    </div>

                    {/* Color-Coded Health Score & Status Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Health Score Badge */}
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono-num font-semibold transition-all ${
                          machine.healthScore >= 85
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/35'
                            : machine.healthScore >= 70
                            ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/35'
                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/35'
                        }`}
                        title={`Health Score calculated from real-time vibration RMS (${machine.telemetry.vibrationRMS} mm/s) and current trends (${machine.telemetry.currentA} A)`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            machine.healthScore >= 85
                              ? 'bg-emerald-500'
                              : machine.healthScore >= 70
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-red-500 animate-ping'
                          }`}
                        />
                        <span className="text-slate-500 dark:text-slate-400 font-normal">Health:</span>
                        <strong className="text-slate-900 dark:text-white font-bold">{machine.healthScore}%</strong>
                      </div>

                      {/* Operational Status Badge */}
                      <div
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          isFault
                            ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30'
                            : isWarning
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isFault
                              ? 'bg-red-500 animate-ping'
                              : isWarning
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span>
                          {isFault ? t.statusFault : isWarning ? t.statusWarning : t.statusNormal}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Warning message banner if machine has an issue */}
                  {isWarning && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span className="text-[11px] leading-tight font-medium">{machine.statusMessage}</span>
                    </div>
                  )}

                  {/* Machine Longevity & Predictive Prognostics Strip */}
                  <div className="mt-3">
                    <PredictiveHealthScore machine={machine} mode="compact" showInteractiveService={false} />
                  </div>

                  {/* Live Metrics Row & Sparkline */}
                  <div className="mt-3.5 grid grid-cols-3 gap-3 p-3 rounded-xl bg-[#f7f7f8] dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 items-center">
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
                        {t.liveCurrent}
                      </span>
                      <div className="text-xl font-bold font-mono-num text-slate-900 dark:text-white">
                        {machine.telemetry.currentA.toFixed(1)}
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-normal ml-0.5">A</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono-num">
                        {machine.telemetry.powerKW.toFixed(1)} kW
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono">
                        Vibration RMS
                      </span>
                      <div
                        className={`text-xl font-bold font-mono-num ${
                          machine.telemetry.vibrationRMS > 4.5
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {machine.telemetry.vibrationRMS.toFixed(2)}
                        <span className="text-xs text-slate-400 font-normal ml-0.5">mm/s</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono-num">
                        Temp: {machine.telemetry.temperatureC.toFixed(0)}°C
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-mono mb-1">
                        Current Trend
                      </span>
                      <Sparkline
                        data={trendValues}
                        color={isWarning ? '#d97706' : '#059669'}
                        width={95}
                        height={32}
                      />
                    </div>
                  </div>

                  {/* Duty Cycle Mini Bar */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono-num">
                      <span className="text-slate-500 dark:text-slate-400">Shift Duty Cycle</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        Active: <strong className="text-emerald-600 dark:text-emerald-400">{machine.telemetry.dutyCycle.active}%</strong> ·
                        Idle: <strong className="text-amber-600 dark:text-amber-400">{machine.telemetry.dutyCycle.idle}%</strong>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${machine.telemetry.dutyCycle.active}%` }}
                        title={`Active: ${machine.telemetry.dutyCycle.active}%`}
                      />
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${machine.telemetry.dutyCycle.idle}%` }}
                        title={`Idle: ${machine.telemetry.dutyCycle.idle}%`}
                      />
                      <div
                        className="bg-slate-300 dark:bg-slate-700 h-full"
                        style={{ width: `${machine.telemetry.dutyCycle.off}%` }}
                        title={`Off: ${machine.telemetry.dutyCycle.off}%`}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Idle Cost & View Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-slate-400 text-[10px] block">
                      {t.idleCostToday}:
                    </span>
                    <span className="font-mono-num font-bold text-amber-700 dark:text-amber-300">
                      ₹{machine.telemetry.idleCostTodayINR}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenMachine(machine.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-100 transition-all group"
                  >
                    <span>{t.viewDetails}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-600 dark:text-amber-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
