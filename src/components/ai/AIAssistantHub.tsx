import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  User,
  Bot,
  ShieldAlert,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { aiService } from '../../services/aiService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantHub: React.FC = () => {
  const {
    currentUser,
    activeRole,
    patients,
    appointments,
    labOrders,
    inventory,
    invoices,
  } = useClinic();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello ${currentUser.name}. I am AuraHealth's clinical and administrative decision support assistant. You are currently in the ${activeRole.replace('_', ' ').toUpperCase()} perspective.\n\nI can help you review patient timelines, check drug safety interactions, analyze laboratory assays, draft consultation notes, and summarize clinic operational metrics. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const suggestedPrompts = [
    "How many appointments are scheduled for today?",
    "Which medicines are currently below reorder stock?",
    "Summarize Eleanor Vance's recent laboratory results and history.",
    "Explain abnormal HbA1c and fasting glucose in simple patient language.",
    "Draft a consultation SOAP note for a patient with hypertension and fatigue.",
    "Check potential drug interactions between Lisinopril and Metformin.",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const todayStr = '2026-10-06';
      const clinicContext = {
        patientCount: patients.length,
        todayAppointmentsCount: appointments.filter((a) => a.date === todayStr).length,
        queueCount: appointments.filter((a) => a.status === 'Checked In' || a.status === 'In Consultation').length,
        lowStockCount: inventory.filter((i) => i.stockQuantity <= i.reorderLevel).length,
        pendingLabsCount: labOrders.filter((l) => l.status === 'Requested' || l.status === 'Processing').length,
        unpaidInvoicesCount: invoices.filter((i) => i.status !== 'Paid').length,
      };

      const res = await aiService.sendChatMessage({
        message: text.trim(),
        conversationHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
        context: clinicContext,
        role: activeRole,
      });

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an issue connecting to the AI inference service. Please check network connectivity or retry shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. How can I help you, ${currentUser.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">AuraHealth AI Clinical Assistant</h1>
              <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                Gemini 3.8 Flash Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive clinical decision support & clinic management intelligence.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      <AIDisclaimerBanner />

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Suggested:</span>
        </span>
        {suggestedPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-900 border border-slate-200 hover:border-teal-300 rounded-full text-[11px] font-medium shrink-0 transition cursor-pointer shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Scroll Container */}
      <div
        ref={scrollRef}
        className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 overflow-y-auto space-y-4"
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-teal-600 text-white shadow-2xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-xs space-y-1.5 shadow-2xs ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 border border-slate-200/90 text-slate-900 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                  <span className="font-semibold">{isUser ? currentUser.name : 'AuraHealth Assistant'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="leading-relaxed whitespace-pre-wrap font-normal text-xs">
                  {msg.text}
                </div>

                {!isUser && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="italic">Advisory decision support</span>
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>Analyzing clinical records and formulating response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a medical or administrative question (e.g., summarize patient vitals, check interactions)..."
          className="flex-1 px-3 py-2 text-xs bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
