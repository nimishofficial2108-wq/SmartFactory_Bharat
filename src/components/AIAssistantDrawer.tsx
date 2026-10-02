import React, { useState, useRef, useEffect } from 'react';
import { useFactory } from '../context/FactoryContext';
import { ChakraMotif } from './ChakraMotif';
import {
  X,
  ArrowUp,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  HelpCircle,
  Zap,
  Activity,
  AlertTriangle,
  Paperclip,
  Mic,
  Copy,
  Check,
} from 'lucide-react';

export const AIAssistantDrawer: React.FC = () => {
  const {
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    chatMessages,
    sendChatMessage,
    isAiThinking,
    t,
    language,
    setCurrentNav,
    setSelectedMachineId,
  } = useFactory();

  const [inputVal, setInputVal] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions in ChatGPT-style prompt chips
  const quickQuestions =
    language === 'hi'
      ? [
          { text: 'मशीन 2 में चेतावनी क्यों है?', icon: AlertTriangle },
          { text: 'इस महीने कितने रुपये बचे?', icon: Zap },
          { text: 'Vibration RMS क्या है?', icon: Activity },
          { text: 'नया बॉक्स कैसे लगाएं?', icon: HelpCircle },
        ]
      : [
          { text: 'Why is Machine 2 showing a warning?', icon: AlertTriangle },
          { text: 'How much ₹ saved this month?', icon: Zap },
          { text: 'What does Vibration RMS mean?', icon: Activity },
          { text: 'How to pair a new retrofit box?', icon: HelpCircle },
        ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isAiThinking) return;
    sendChatMessage(inputVal);
    setInputVal('');
  };

  const handleQuickClick = (q: string) => {
    sendChatMessage(q);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (isAiDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiDrawerOpen]);

  if (!isAiDrawerOpen) {
    return (
      /* Floating trigger pill (bottom-right) */
      <button
        onClick={() => setIsAiDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all group"
        aria-label={t.takeMyHelp}
      >
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </div>
        <span>{t.takeMyHelp}</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 transition-colors">
      {/* Header (ChatGPT style) */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                SmartFactory Assistant
              </h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                4.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'hi'
                ? 'सरल भाषा में कारखाने की वास्तविक जानकारी'
                : 'Intelligent industrial telemetry assistance'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close Assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f9f9fb] dark:bg-slate-950/50">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#f4f4f4] dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl rounded-br-xs px-4 py-3 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-3xl rounded-bl-xs p-4 shadow-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      SmartFactory AI
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Quick Action Button inside message */}
                {msg.quickAction && (
                  <button
                    onClick={() => {
                      if (msg.quickAction?.targetScreen) setCurrentNav(msg.quickAction.targetScreen);
                      if (msg.quickAction?.machineId) setSelectedMachineId(msg.quickAction.machineId);
                      setIsAiDrawerOpen(false);
                    }}
                    className="mt-3 w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white text-[11px] font-semibold transition-all group"
                  >
                    <span>{msg.quickAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-600 dark:text-amber-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isAiThinking && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-300 w-44 shadow-xs">
            <ChakraMotif size={16} className="text-slate-800 dark:text-amber-400" animate={true} />
            <span className="font-mono-num text-[11px]">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ChatGPT-style Prompt Chips & Composer Capsule */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => {
            const Icon = q.icon;
            return (
              <button
                key={idx}
                onClick={() => handleQuickClick(q.text)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-all text-left"
              >
                <Icon className="w-3 h-3 text-slate-500 dark:text-amber-400 shrink-0" />
                <span className="truncate max-w-[170px]">{q.text}</span>
              </button>
            );
          })}
        </div>

        {/* ChatGPT Style Input Pill Capsule */}
        <form onSubmit={handleSend} className="relative flex items-center bg-[#f4f4f4] dark:bg-slate-800 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 p-1.5 pl-4 focus-within:border-slate-400 dark:focus-within:border-slate-500 focus-within:bg-white dark:focus-within:bg-slate-850 shadow-xs transition-all">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={language === 'hi' ? 'स्मार्टफैक्ट्री AI से कुछ भी पूछें...' : 'Ask SmartFactory AI anything...'}
            className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isAiThinking}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              inputVal.trim() && !isAiThinking
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-xs hover:scale-105 active:scale-95'
                : 'bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-500 opacity-60'
            }`}
            aria-label="Send query"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <p className="text-[10px] text-center text-slate-400 font-mono-num">
          SmartFactory AI can analyze live current, vibration, and thermal harmonics.
        </p>
      </div>
    </div>
  );
};
