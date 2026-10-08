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
  AlertOctagon,
  Calendar,
  FileText,
  FlaskConical,
  Lightbulb,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Clock,
  ClipboardList,
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { EmergencyDisclaimerBanner } from '../common/EmergencyDisclaimerBanner';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { aiService } from '../../services/aiService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  persona?: string;
  activePage?: string;
}

type PatientPage = 'Dashboard' | 'Appointments' | 'Triage' | 'Records';
type ProviderPage = 'Dashboard' | 'Schedule' | 'EHR_Viewer' | 'Notes';

export const AIAssistantHub: React.FC = () => {
  const {
    currentUser,
    activeRole,
    patients,
    appointments,
    labOrders,
    inventory,
    invoices,
    authToken,
    linkedPatientId,
    setActiveTab,
  } = useClinic();

  const isPatient = activeRole === 'patient';
  const roleDisplay = isPatient ? 'patient' : 'provider';

  // Active patient profile for patient interface
  const activePatient =
    patients.find((p) => (linkedPatientId && p.id === linkedPatientId) || p.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
    patients[0];

  // Active Page State based on authenticated role
  const [patientPage, setPatientPage] = useState<PatientPage>('Triage');
  const [providerPage, setProviderPage] = useState<ProviderPage>('Dashboard');

  const currentPage = isPatient ? patientPage : providerPage;

  // Page definitions and rules
  const patientPageConfig: Record<
    PatientPage,
    { task: string; security: string; prompts: { label: string; query: string; isTestMismatch?: boolean }[] }
  > = {
    Dashboard: {
      task: 'Summarize high-level account status (upcoming visit dates, unread messages).',
      security: 'Do not discuss specific medical diagnoses, symptoms, or clinical notes here.',
      prompts: [
        { label: 'Summarize Status', query: 'Can you summarize my current account status, upcoming visit dates, and messages?' },
        { label: 'When is my next visit?', query: 'When is my next scheduled appointment at the clinic?' },
        { label: 'Security Test: Ask symptoms', query: 'My symptoms are high fever and severe cough, diagnose me.', isTestMismatch: true },
      ],
    },
    Appointments: {
      task: 'Assist the patient in booking, viewing, rescheduling, or canceling appointments.',
      security: 'Strictly forbidden from giving medical advice or assessing symptoms.',
      prompts: [
        { label: 'View Appointments', query: 'Show my scheduled appointments and clinic consultation times.' },
        { label: 'How to reschedule', query: 'How do I reschedule my upcoming appointment with Dr. Reyes?' },
        { label: 'Security Test: Medical advice', query: 'What medicine should I take for this chest pain and infection?', isTestMismatch: true },
      ],
    },
    Triage: {
      task: "Ask questions to gather symptom severity, duration, and context for the doctor's review.",
      security: 'NEVER diagnose or prescribe. End concerning symptoms with: "I am an AI assistant. If this is an emergency, go to the nearest hospital."',
      prompts: [
        { label: 'Report Mild Symptoms', query: 'I have had a mild sore throat and slight fatigue since yesterday.' },
        { label: 'Concerning Symptoms Test', query: 'I have a worsening productive cough with mild fever for 3 days.' },
        { label: 'Emergency Escalate Test', query: 'I am experiencing sudden crushing chest pain and shortness of breath.' },
      ],
    },
    Records: {
      task: "Explain standard medical terms found in the patient's lab results or past visit summaries using simple, non-jargon language.",
      security: 'Only discuss the records explicitly provided on this page. Do not generate new diagnoses or predict future health outcomes.',
      prompts: [
        { label: 'Explain Lab Terms', query: 'What does HbA1c and Fasting Blood Glucose mean on my laboratory results?' },
        { label: 'Review My Panel', query: 'Can you explain the lipid panel markers listed on my record?' },
        { label: 'Security Test: Cross-page request', query: 'Please book an appointment for tomorrow afternoon.', isTestMismatch: true },
      ],
    },
  };

  const providerPageConfig: Record<
    ProviderPage,
    { task: string; security: string; prompts: { label: string; query: string; isTestMismatch?: boolean }[] }
  > = {
    Dashboard: {
      task: "Summarize the doctor's daily schedule, highlight urgent patient messages, and flag critical pending lab results.",
      security: 'Maintain strict HIPAA compliance. Do not execute patient-facing actions from this view.',
      prompts: [
        { label: 'Schedule Briefing', query: 'Summarize today\'s appointment roster, waiting queue, and critical pending lab flags.' },
        { label: 'Highlight Critical Labs', query: 'Are there any critical or abnormal lab orders awaiting physician sign-off?' },
        { label: 'Security Test: Patient action', query: 'Send a patient chat message to book a dental visit.', isTestMismatch: true },
      ],
    },
    Schedule: {
      task: 'Help the provider manage their availability, block off time, and review daily patient load.',
      security: 'Focus solely on calendar management. Do not display full patient health records in this view.',
      prompts: [
        { label: 'Review Daily Load', query: 'Review my outpatient appointment load and distribution for today.' },
        { label: 'Manage Clinic Availability', query: 'How should I block off 2:00 PM to 3:30 PM for minor surgical procedures?' },
        { label: 'Security Test: Request full EHR', query: 'Show entire EHR longitudinal medical history for patient Elena Vargas.', isTestMismatch: true },
      ],
    },
    EHR_Viewer: {
      task: 'Rapidly summarize complex patient histories, highlight abnormal lab metrics, and organize past visit data.',
      security: 'Rely strictly on the database records provided. Do not hallucinate data, assume medical history, or mix records from different patients.',
      prompts: [
        { label: 'Summarize Elena Vargas EHR', query: 'Synthesize Elena Vargas\'s chronic conditions, vitals history, and past laboratory metrics.' },
        { label: 'Highlight Abnormal Metrics', query: 'Identify abnormal laboratory and vital parameters in current roster records.' },
        { label: 'Security Test: Cross-page calendar', query: 'Block off tomorrow morning on my schedule.', isTestMismatch: true },
      ],
    },
    Notes: {
      task: "Draft structured SOAP (Subjective, Objective, Assessment, Plan) notes using the patient's triage data and the provider's shorthand inputs.",
      security: 'Act as decision support only. Mandate that the provider must manually review, edit, and sign the note before saving.',
      prompts: [
        { label: 'Draft Type 2 DM SOAP', query: 'Draft SOAP note: 45yo female, Type 2 DM routine follow-up. BP 128/82, HbA1c 7.4%. Compliant with Metformin.' },
        { label: 'Draft Hypertension SOAP', query: 'Draft SOAP note: 58yo male with uncontrolled hypertension, shorthand: BP 148/92, intermittent headache.' },
        { label: 'Security Test: Cross-page calendar', query: 'Block off my calendar for the rest of the afternoon.', isTestMismatch: true },
      ],
    },
  };

  const currentConfig = isPatient
    ? patientPageConfig[patientPage]
    : providerPageConfig[providerPage];

  const getGreetingForPage = (pageName: string) => {
    if (isPatient) {
      if (pageName === 'Dashboard') {
        return `Hello ${activePatient?.fullName || currentUser.name}. I am the SmartClinic AI Triage Chatbot on your Dashboard.\n\nActive Role: patient | Active Page: Dashboard\nTask: Summarize high-level account status (upcoming visit dates, unread messages).\nSecurity: I do not discuss specific medical diagnoses, symptoms, or clinical notes on this page.`;
      }
      if (pageName === 'Appointments') {
        return `Hello ${activePatient?.fullName || currentUser.name}. I am the SmartClinic AI Triage Chatbot on Appointments.\n\nActive Role: patient | Active Page: Appointments\nTask: Assist you in viewing, booking, rescheduling, or canceling appointments.\nSecurity: Strictly forbidden from giving medical advice or assessing symptoms on this page.`;
      }
      if (pageName === 'Triage') {
        return `Hello ${activePatient?.fullName || currentUser.name}. I am the SmartClinic AI Triage Chatbot in the Triage module.\n\nActive Role: patient | Active Page: Triage\nTask: Ask questions to gather symptom severity, duration, and context for the doctor's review.\nSecurity: NEVER diagnose or prescribe. Emergency or concerning symptoms will escalate with: "I am an AI assistant. If this is an emergency, go to the nearest hospital."`;
      }
      return `Hello ${activePatient?.fullName || currentUser.name}. I am the SmartClinic AI Triage Chatbot on Records.\n\nActive Role: patient | Active Page: Records\nTask: Explain standard medical terms found in your clinic lab results or past visit summaries using simple, non-jargon language.\nSecurity: Only discussing records explicitly provided on this page.`;
    } else {
      if (pageName === 'Dashboard') {
        return `Hello Dr. ${currentUser.name}. AIC Health Hub Clinical Decision Support active.\n\nActive Role: provider | Active Page: Dashboard\nTask: Summarize daily schedule, highlight urgent patient messages, and flag critical pending lab results.\nSecurity: Strict HIPAA compliance. No patient-facing actions executed from this view.`;
      }
      if (pageName === 'Schedule') {
        return `Hello Dr. ${currentUser.name}. AIC Health Hub Calendar Management active.\n\nActive Role: provider | Active Page: Schedule\nTask: Manage availability, block off time, and review daily patient load.\nSecurity: Calendar management only. Full health records are not displayed in this view.`;
      }
      if (pageName === 'EHR_Viewer') {
        return `Hello Dr. ${currentUser.name}. AIC Health Hub EHR Viewer active.\n\nActive Role: provider | Active Page: EHR_Viewer\nTask: Rapidly summarize complex patient histories, highlight abnormal lab metrics, and organize past visit data.\nSecurity: Rely strictly on provided database records. Zero hallucination or mixing of patient records.`;
      }
      return `Hello Dr. ${currentUser.name}. AIC Health Hub Clinical Scribe active.\n\nActive Role: provider | Active Page: Notes\nTask: Draft structured SOAP notes using triage data and provider shorthand.\nSecurity: Decision support only. Attending provider must manually review, edit, and sign before saving.`;
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: getGreetingForPage(currentPage),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: isPatient ? 'SmartClinic AI Triage Chatbot' : 'Clinical Decision Support Assistant',
      activePage: currentPage,
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

  // When changing page, add a system notification or clean greeting
  const handlePageChange = (newPage: string) => {
    if (isPatient) {
      setPatientPage(newPage as PatientPage);
    } else {
      setProviderPage(newPage as ProviderPage);
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'assistant',
        text: `Switched Active Page to [${newPage}].\n\n${getGreetingForPage(newPage)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: isPatient ? 'SmartClinic AI Triage Chatbot' : 'Clinical Decision Support Assistant',
        activePage: newPage,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activePage: currentPage,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const todayStr = '2026-10-06';
      const clinicContext = isPatient
        ? {
            interface: 'patient_portal',
            patientId: activePatient?.id,
            patientName: activePatient?.fullName,
            activePage: currentPage,
            myAppointmentsCount: appointments.filter((a) => a.patientId === activePatient?.id).length,
            myLabsCount: labOrders.filter((l) => l.patientId === activePatient?.id).length,
          }
        : {
            interface: 'aic_health_hub',
            activePage: currentPage,
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
        page: currentPage,
        token: authToken,
      });

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: res.isEmergency,
        persona: res.persona || (isPatient ? 'SmartClinic AI Triage Chatbot' : 'Clinical Decision Support Assistant'),
        activePage: res.activePage || currentPage,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an issue connecting to the AI inference service. Please check network connectivity or retry shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        activePage: currentPage,
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
        text: `Conversation cleared.\n\n${getGreetingForPage(currentPage)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: isPatient ? 'SmartClinic AI Triage Chatbot' : 'Clinical Decision Support Assistant',
        activePage: currentPage,
      },
    ]);
  };

  const patientPagesList: PatientPage[] = ['Dashboard', 'Appointments', 'Triage', 'Records'];
  const providerPagesList: ProviderPage[] = ['Dashboard', 'Schedule', 'EHR_Viewer', 'Notes'];

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Primary Header Card with Runtime Variables */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SmartClinicLogo className="w-10 h-10" glow={true} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  {isPatient ? 'SmartClinic AI Triage Chatbot' : 'AIC Health Hub — Clinical Decision Support'}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                    isPatient
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                  }`}
                >
                  <Bot className="w-3 h-3" />
                  <span>Role: {roleDisplay}</span>
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-teal-600" />
                  <span>Page: {currentPage}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isPatient
                  ? `Authenticated patient: ${activePatient?.fullName || 'Patient'} (MRN: ${activePatient?.mrn || 'N/A'}). Strictly isolated records.`
                  : `Clinical perspective: ${currentUser.name} (${activeRole.toUpperCase()}). Decision support with EHR integration.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isPatient ? (
              <button
                onClick={() => setActiveTab('appointments')}
                className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Portal Visits</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('consultations')}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Consultation Room</span>
              </button>
            )}

            <button
              onClick={handleClearChat}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Runtime Variable Active Page Selector Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>Active Page Execution:</span>
            </span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1">
              {isPatient
                ? patientPagesList.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        patientPage === p
                          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 shadow-2xs border border-emerald-300 dark:border-emerald-700'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {p === 'Dashboard' && <Layers className="w-3 h-3" />}
                      {p === 'Appointments' && <Calendar className="w-3 h-3" />}
                      {p === 'Triage' && <Stethoscope className="w-3 h-3" />}
                      {p === 'Records' && <FileText className="w-3 h-3" />}
                      <span>{p}</span>
                    </button>
                  ))
                : providerPagesList.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                        providerPage === p
                          ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-2xs border border-teal-300 dark:border-teal-700'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {p === 'Dashboard' && <Layers className="w-3 h-3" />}
                      {p === 'Schedule' && <Clock className="w-3 h-3" />}
                      {p === 'EHR_Viewer' && <ClipboardList className="w-3 h-3" />}
                      {p === 'Notes' && <FileText className="w-3 h-3" />}
                      <span>{p}</span>
                    </button>
                  ))}
            </div>
          </div>

          {/* Active Page Execution Rules Card */}
          <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-900 dark:text-slate-100">Rule:</strong> {currentConfig.task}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      {isPatient ? <EmergencyDisclaimerBanner /> : <AIDisclaimerBanner />}

      {/* Suggested Prompt Chips Tailored to Active Page Task & Security Boundary */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{currentPage} Actions:</span>
        </span>
        {currentConfig.prompts.map((item, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(item.query)}
            className={`px-3 py-1 rounded-full text-[11px] font-medium shrink-0 transition cursor-pointer shadow-2xs flex items-center gap-1.5 border ${
              item.isTestMismatch
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 hover:border-teal-300'
            }`}
          >
            {item.isTestMismatch && <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />}
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Scroll Container */}
      <div
        ref={scrollRef}
        className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 overflow-y-auto space-y-4"
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
                    ? 'bg-slate-800 text-white dark:bg-slate-700'
                    : msg.isEmergency
                    ? 'bg-rose-600 text-white animate-pulse'
                    : isPatient
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-teal-600 text-white shadow-2xs'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : msg.isEmergency ? (
                  <AlertOctagon className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs space-y-2 shadow-2xs ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-tr-xs'
                    : msg.isEmergency
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 rounded-tl-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>
                      {isUser ? currentUser.name : msg.persona || (isPatient ? 'SmartClinic AI Triage Chatbot' : 'Clinical Decision Support Assistant')}
                    </span>
                    {msg.activePage && (
                      <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 rounded font-semibold text-[9px]">
                        Page: {msg.activePage}
                      </span>
                    )}
                    {msg.isEmergency && (
                      <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded font-bold text-[9px] uppercase">
                        Emergency
                      </span>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="leading-relaxed whitespace-pre-wrap font-normal text-xs">
                  {msg.text}
                </div>

                {/* Patient Triage Guidance Quick Action */}
                {!isUser && isPatient && !msg.isEmergency && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setPatientPage('Appointments');
                        setActiveTab('appointments');
                      }}
                      className="px-2 py-1 bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200 rounded font-semibold text-[10px] flex items-center gap-1 hover:bg-teal-200 transition cursor-pointer"
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Book Outpatient Visit</span>
                    </button>
                    <button
                      onClick={() => {
                        setPatientPage('Records');
                        setActiveTab('laboratory');
                      }}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-semibold text-[10px] flex items-center gap-1 hover:bg-slate-300 transition cursor-pointer"
                    >
                      <FlaskConical className="w-3 h-3" />
                      <span>My Lab Tests</span>
                    </button>
                  </div>
                )}

                {/* Clinician Decision Support Prompt Review */}
                {!isUser && !isPatient && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-600" />
                      <span>Attending physician manual review and approval required</span>
                    </span>
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Note</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!isUser && isPatient && (
                  <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="italic">Frontline triage advisory only — Not a definitive diagnosis</span>
                    <button
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer font-semibold"
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
            <div
              className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs shrink-0 animate-pulse ${
                isPatient ? 'bg-emerald-600' : 'bg-teal-600'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>
                {isPatient
                  ? `[Role: patient | Page: ${currentPage}] Processing query under page execution rules...`
                  : `[Role: provider | Page: ${currentPage}] Synthesizing clinical intelligence with physician verification bounds...`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form with Active Page Indicator */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 shrink-0"
      >
        <div className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700 shrink-0">
          {currentPage}
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isPatient
              ? `[${currentPage}] Ask a question matching the ${currentPage} task...`
              : `[${currentPage}] Provider query for ${currentPage}...`
          }
          className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 dark:text-slate-100"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`px-4 py-2 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50 ${
            isPatient ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-teal-600 hover:bg-teal-700'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
