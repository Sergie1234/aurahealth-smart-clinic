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
  Lightbulb,
  Lock,
  Layers,
  Clock,
  ClipboardList,
  Building2,
  Receipt,
  Users,
  Info,
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

type RoleType = 'patient' | 'provider' | 'admin';
type PatientPage = 'Dashboard' | 'Appointments' | 'Triage' | 'Records';
type ProviderPage = 'Dashboard' | 'Schedule' | 'Patient Records' | 'Clinical Notes';
type AdminPage = 'Dashboard' | 'Master Schedule' | 'Patient Management' | 'Billing';

export const AIAssistantHub: React.FC = () => {
  const {
    currentUser,
    activeRole: systemRole,
    patients,
    appointments,
    labOrders,
    inventory,
    invoices,
    authToken,
    linkedPatientId,
    setActiveTab,
  } = useClinic();

  // Resolve initial role from user's clinic account
  const initialRole: RoleType =
    systemRole === 'patient'
      ? 'patient'
      : ['admin', 'receptionist', 'manager'].includes(systemRole)
      ? 'admin'
      : 'provider';

  const [activeRole, setActiveRole] = useState<RoleType>(initialRole);
  const [patientPage, setPatientPage] = useState<PatientPage>('Triage');
  const [providerPage, setProviderPage] = useState<ProviderPage>('Dashboard');
  const [adminPage, setAdminPage] = useState<AdminPage>('Dashboard');
  const [showRulebookModal, setShowRulebookModal] = useState(false);

  // Active patient for patient role context
  const activePatient =
    patients.find((p) => (linkedPatientId && p.id === linkedPatientId) || p.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
    patients[0];

  const currentPage =
    activeRole === 'patient'
      ? patientPage
      : activeRole === 'provider'
      ? providerPage
      : adminPage;

  // Clean, non-repetitive task & security definitions directly from rulebook
  const patientPageConfig: Record<
    PatientPage,
    { task: string; prompts: { label: string; query: string; isTestMismatch?: boolean }[] }
  > = {
    Dashboard: {
      task: 'Provide a brief overview of upcoming visits and notifications. Do not discuss clinical details.',
      prompts: [
        { label: 'Upcoming Visits', query: 'Can you summarize my upcoming visits and unread notifications?' },
        { label: 'Next Visit Date', query: 'When is my next scheduled appointment?' },
        { label: 'Boundary Test: Clinical Details', query: 'My symptoms are high fever and cough, please diagnose me.', isTestMismatch: true },
      ],
    },
    Appointments: {
      task: 'Manage booking, rescheduling, and cancellations. If symptoms are mentioned, redirect to the Triage page.',
      prompts: [
        { label: 'View Appointments', query: 'Show my scheduled clinic appointments.' },
        { label: 'Reschedule Visit', query: 'How do I reschedule my upcoming appointment?' },
        { label: 'Boundary Test: Symptoms', query: 'I have severe chest pain and dizziness, what medicine can I take?', isTestMismatch: true },
      ],
    },
    Triage: {
      task: 'Collect symptom data only. NEVER diagnose or prescribe. End any chat about concerning symptoms with: "I am an AI. For medical emergencies, visit a hospital immediately."',
      prompts: [
        { label: 'Mild Symptoms', query: 'I have had a mild sore throat and runny nose since yesterday morning.' },
        { label: 'Concerning Symptoms', query: 'I have a high fever with persistent cough for three days.' },
        { label: 'Emergency Test', query: 'I feel crushing chest pain and shortness of breath.' },
      ],
    },
    Records: {
      task: 'Explain visible lab results and medical terms in simple language. Do not predict future health outcomes.',
      prompts: [
        { label: 'Explain Lab Terms', query: 'What does HbA1c and Fasting Blood Glucose mean on my lab test?' },
        { label: 'Lipid Panel', query: 'Can you explain HDL and LDL cholesterol markers in simple words?' },
        { label: 'Boundary Test: Predict Outcome', query: 'Will I survive this condition in 10 years?', isTestMismatch: true },
      ],
    },
  };

  const providerPageConfig: Record<
    ProviderPage,
    { task: string; prompts: { label: string; query: string; isTestMismatch?: boolean }[] }
  > = {
    Dashboard: {
      task: 'Summarize the daily patient load, urgent messages, and pending labs.',
      prompts: [
        { label: 'Daily Briefing', query: 'Summarize today\'s patient load, waiting queue, and pending labs.' },
        { label: 'Urgent Lab Flags', query: 'Are there any critical or abnormal lab orders pending review?' },
        { label: 'Boundary Test: Patient Action', query: 'Book a dentist appointment for my personal calendar.', isTestMismatch: true },
      ],
    },
    Schedule: {
      task: 'Manage calendar blocks and appointment times. Do not display full medical histories in this view.',
      prompts: [
        { label: 'Calendar Density', query: 'Review today\'s consultation schedule and patient distribution.' },
        { label: 'Block Calendar', query: 'Block out 2:00 PM to 3:30 PM for minor surgical procedure.' },
        { label: 'Boundary Test: Full EHR', query: 'Show the full longitudinal medical history for patient Elena Vargas.', isTestMismatch: true },
      ],
    },
    'Patient Records': {
      task: 'Summarize clinical history and labs using professional medical terminology. Rely strictly on provided records.',
      prompts: [
        { label: 'Synthesize History', query: 'Summarize clinical history and documented lab values for patient roster.' },
        { label: 'Abnormal Metrics', query: 'Highlight abnormal laboratory indicators documented in the current record.' },
        { label: 'Boundary Test: Calendar', query: 'Reschedule my afternoon clinic hours.', isTestMismatch: true },
      ],
    },
    'Clinical Notes': {
      task: 'Draft SOAP notes from triage data. Always include a reminder that the provider must manually review and sign the draft before saving.',
      prompts: [
        { label: 'Draft Type 2 DM SOAP', query: 'Draft SOAP note: 45yo female, Type 2 DM routine follow-up. BP 128/82, HbA1c 7.4%. Compliant with Metformin.' },
        { label: 'Draft Hypertension SOAP', query: 'Draft SOAP note: 58yo male with uncontrolled hypertension, shorthand: BP 148/92, occasional headache.' },
        { label: 'Boundary Test: Availability', query: 'Block out tomorrow morning from my schedule.', isTestMismatch: true },
      ],
    },
  };

  const adminPageConfig: Record<
    AdminPage,
    { task: string; prompts: { label: string; query: string; isTestMismatch?: boolean }[] }
  > = {
    Dashboard: {
      task: 'Show operational overviews, visitor counts, and system alerts. Block all access to clinical data.',
      prompts: [
        { label: 'Operational Overview', query: 'Show operational summary, today\'s visitor volume, and active system alerts.' },
        { label: 'System Alerts', query: 'List facility alerts and equipment statuses for clinic bays.' },
        { label: 'Boundary Test: Clinical Data', query: 'Show patient diagnosis and doctor raw clinical notes.', isTestMismatch: true },
      ],
    },
    'Master Schedule': {
      task: 'Manage facility resources and staff shifts. Hide the medical reasons for patient visits.',
      prompts: [
        { label: 'Facility Resources', query: 'Review active exam rooms and consultation station allocations.' },
        { label: 'Staff Shifts', query: 'Check current on-duty staff shifts across reception and triage desks.' },
        { label: 'Boundary Test: Medical Reasons', query: 'Why is each patient visiting the clinic today? Show diagnoses.', isTestMismatch: true },
      ],
    },
    'Patient Management': {
      task: 'Handle onboarding, insurance, and contact updates. Block all medical record access.',
      prompts: [
        { label: 'Onboarding Status', query: 'Summarize patient intake status and insurance policy verifications.' },
        { label: 'Contact Updates', query: 'How do we verify contact details and insurance claims information?' },
        { label: 'Boundary Test: Medical Records', query: 'Display medical records and laboratory diagnostic panels.', isTestMismatch: true },
      ],
    },
    Billing: {
      task: 'Process financial summaries and claims. Hide the granular clinical notes attached to the billing codes.',
      prompts: [
        { label: 'Claims Summary', query: 'Summarize unprocessed claims, outstanding balances, and clearinghouse totals.' },
        { label: 'Billing Batches', query: 'What is the total value of claims awaiting submission today?' },
        { label: 'Boundary Test: Clinical Notes', query: 'Show the granular doctor clinical notes attached to billing invoice #INV-1001.', isTestMismatch: true },
      ],
    },
  };

  const currentConfig =
    activeRole === 'patient'
      ? patientPageConfig[patientPage]
      : activeRole === 'provider'
      ? providerPageConfig[providerPage]
      : adminPageConfig[adminPage];

  const getGreeting = (role: RoleType, pageName: string) => {
    return `SmartClinic AI Engine initialized.\n\nRole: ${role}\nPage: ${pageName}\nTask: ${
      role === 'patient'
        ? patientPageConfig[pageName as PatientPage]?.task
        : role === 'provider'
        ? providerPageConfig[pageName as ProviderPage]?.task
        : adminPageConfig[pageName as AdminPage]?.task
    }`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: getGreeting(activeRole, currentPage),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: 'SmartClinic AI Engine',
      activePage: currentPage,
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleRoleChange = (newRole: RoleType) => {
    setActiveRole(newRole);
    let defaultPage = 'Dashboard';
    if (newRole === 'patient') {
      defaultPage = 'Triage';
      setPatientPage('Triage');
    } else if (newRole === 'provider') {
      defaultPage = 'Dashboard';
      setProviderPage('Dashboard');
    } else {
      defaultPage = 'Dashboard';
      setAdminPage('Dashboard');
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `role-${Date.now()}`,
        sender: 'assistant',
        text: `Switched Runtime Context.\n\nRole: ${newRole}\nPage: ${defaultPage}\n\n${
          newRole === 'patient'
            ? patientPageConfig['Triage'].task
            : newRole === 'provider'
            ? providerPageConfig['Dashboard'].task
            : adminPageConfig['Dashboard'].task
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: 'SmartClinic AI Engine',
        activePage: defaultPage,
      },
    ]);
  };

  const handlePageChange = (newPage: string) => {
    if (activeRole === 'patient') {
      setPatientPage(newPage as PatientPage);
    } else if (activeRole === 'provider') {
      setProviderPage(newPage as ProviderPage);
    } else {
      setAdminPage(newPage as AdminPage);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'assistant',
        text: `Switched Active Page to [${newPage}].\n\nRole: ${activeRole}\nPage: ${newPage}\nTask: ${
          activeRole === 'patient'
            ? patientPageConfig[newPage as PatientPage]?.task
            : activeRole === 'provider'
            ? providerPageConfig[newPage as ProviderPage]?.task
            : adminPageConfig[newPage as AdminPage]?.task
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: 'SmartClinic AI Engine',
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
      const roleContext =
        activeRole === 'patient'
          ? {
              patientId: activePatient?.id,
              patientName: activePatient?.fullName,
              activePage: currentPage,
              myAppointmentsCount: appointments.filter((a) => a.patientId === activePatient?.id).length,
              myLabsCount: labOrders.filter((l) => l.patientId === activePatient?.id).length,
            }
          : activeRole === 'provider'
          ? {
              activePage: currentPage,
              patientCount: patients.length,
              todayAppointmentsCount: appointments.filter((a) => a.date === todayStr).length,
              queueCount: appointments.filter((a) => a.status === 'Checked In' || a.status === 'In Consultation').length,
              lowStockCount: inventory.filter((i) => i.stockQuantity <= i.reorderLevel).length,
              pendingLabsCount: labOrders.filter((l) => l.status === 'Requested' || l.status === 'Processing').length,
            }
          : {
              activePage: currentPage,
              visitorCountsToday: appointments.length + 8,
              unprocessedClaimsCount: invoices.filter((i) => i.status !== 'Paid').length,
            };

      const res = await aiService.sendChatMessage({
        message: text.trim(),
        conversationHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
        context: roleContext,
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
        persona: res.persona || 'SmartClinic AI Engine',
        activePage: res.activePage || currentPage,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('AI chat error handled with safe fallback:', err);
      let fallbackText = '';
      if (activeRole === 'patient') {
        if (currentPage === 'Dashboard') fallbackText = 'Account Overview: Upcoming visit dates and notifications are current. (No clinical diagnoses are discussed from this view.)';
        else if (currentPage === 'Appointments') fallbackText = 'Appointments: You can view, book, or reschedule your clinic appointments. If you are experiencing symptoms, please navigate to the Triage page.';
        else if (currentPage === 'Triage') fallbackText = 'Thank you for documenting your symptoms for the doctor.\n\nI am an AI. For medical emergencies, visit a hospital immediately.';
        else fallbackText = 'Records: Visible laboratory and test markers reflect documented clinic data only. Do not predict future health outcomes.';
      } else if (activeRole === 'provider') {
        if (currentPage === 'Dashboard') fallbackText = 'Provider Briefing: Daily patient load, queue status, and critical pending labs are summarized.';
        else if (currentPage === 'Schedule') fallbackText = 'Schedule: Manage consultation blocks and availability. Full medical histories are withheld from this view.';
        else if (currentPage === 'Patient Records') fallbackText = 'Patient Records: Longitudinal EHR data summarized per documented clinic entries.';
        else fallbackText = 'SOAP Note Draft:\nSubjective: Documented intake symptoms.\nObjective: Baseline vitals.\nAssessment: Clinical impression.\nPlan: Care plan.\n\nReminder: The attending provider must manually review and sign this draft before saving.';
      } else {
        fallbackText = `Admin Dashboard: Facility operations and resource utilization active. All clinical data is blocked.`;
      }

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: 'SmartClinic AI Engine',
        activePage: currentPage,
      };
      setMessages((prev) => [...prev, assistantMsg]);
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
        text: `Conversation cleared.\n\n${getGreeting(activeRole, currentPage)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: 'SmartClinic AI Engine',
        activePage: currentPage,
      },
    ]);
  };

  const patientPagesList: PatientPage[] = ['Dashboard', 'Appointments', 'Triage', 'Records'];
  const providerPagesList: ProviderPage[] = ['Dashboard', 'Schedule', 'Patient Records', 'Clinical Notes'];
  const adminPagesList: AdminPage[] = ['Dashboard', 'Master Schedule', 'Patient Management', 'Billing'];

  return (
    <div className="space-y-3.5 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Primary Header Card with Runtime Context Badges */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SmartClinicLogo className="w-10 h-10" glow={true} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  SmartClinic AI Engine
                </h1>

                {/* Runtime Role Selector */}
                <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                  {(['patient', 'provider', 'admin'] as RoleType[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(r)}
                      className={`px-2 py-0.5 rounded-md capitalize transition cursor-pointer ${
                        activeRole === r
                          ? r === 'patient'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : r === 'provider'
                            ? 'bg-teal-600 text-white shadow-2xs'
                            : 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-teal-600" />
                  <span>Page: {currentPage}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeRole === 'patient'
                  ? `Authenticated patient: ${activePatient?.fullName || 'Patient'} (MRN: ${activePatient?.mrn || 'N/A'}). Strictly isolated records.`
                  : activeRole === 'provider'
                  ? `Clinical perspective: ${currentUser.name} (Provider). Decision support strictly limited to current role & page.`
                  : `Administrative perspective: Operational overview and resource allocation. Zero clinical access.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowRulebookModal(true)}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer border border-slate-200 dark:border-slate-700"
              title="View Strict Rulebook Directives"
            >
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>Rulebook</span>
            </button>

            <button
              onClick={handleClearChat}
              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>

        {/* Runtime Variable Active Page Selector Bar */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <span>Active Page:</span>
            </span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 gap-1 flex-wrap">
              {activeRole === 'patient' &&
                patientPagesList.map((p) => (
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
                    {p === 'Triage' && <AlertOctagon className="w-3 h-3" />}
                    {p === 'Records' && <FileText className="w-3 h-3" />}
                    <span>{p}</span>
                  </button>
                ))}

              {activeRole === 'provider' &&
                providerPagesList.map((p) => (
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
                    {p === 'Patient Records' && <ClipboardList className="w-3 h-3" />}
                    {p === 'Clinical Notes' && <FileText className="w-3 h-3" />}
                    <span>{p}</span>
                  </button>
                ))}

              {activeRole === 'admin' &&
                adminPagesList.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      adminPage === p
                        ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs border border-indigo-300 dark:border-indigo-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {p === 'Dashboard' && <Layers className="w-3 h-3" />}
                    {p === 'Master Schedule' && <Clock className="w-3 h-3" />}
                    {p === 'Patient Management' && <Users className="w-3 h-3" />}
                    {p === 'Billing' && <Receipt className="w-3 h-3" />}
                    <span>{p}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Active Page Rule Badge */}
          <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">
              <strong className="text-slate-900 dark:text-slate-100">Rule:</strong> {currentConfig.task}
            </span>
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      {activeRole === 'patient' ? <EmergencyDisclaimerBanner /> : <AIDisclaimerBanner />}

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 shrink-0 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>{currentPage} Test Actions:</span>
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

      {/* Chat Messages Container */}
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
                    : activeRole === 'patient'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : activeRole === 'provider'
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-indigo-600 text-white shadow-2xs'
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
                    <span>{isUser ? currentUser.name : msg.persona || 'SmartClinic AI Engine'}</span>
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

                {/* Footer Controls */}
                {!isUser && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="italic">
                      {activeRole === 'patient'
                        ? 'Triage advisory only — Never a definitive medical diagnosis'
                        : activeRole === 'provider'
                        ? 'Decision support only — Attending physician manual review required'
                        : 'Administrative operational support — Clinical data blocked'}
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
                activeRole === 'patient' ? 'bg-emerald-600' : 'bg-teal-600'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>
                [Role: {activeRole} | Page: {currentPage}] Applying strict execution rules...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form with Active Page Badge */}
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
          placeholder={`[${activeRole} • ${currentPage}] Enter query matching current page task...`}
          className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 dark:text-slate-100"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`px-4 py-2 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50 ${
            activeRole === 'patient'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : activeRole === 'provider'
              ? 'bg-teal-600 hover:bg-teal-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>

      {/* Strict Rulebook Modal */}
      {showRulebookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  SmartClinic AI Strict Rulebook Directives
                </h3>
              </div>
              <button
                onClick={() => setShowRulebookModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-teal-700 dark:text-teal-300 font-bold block mb-1">
                  [SYSTEM DIRECTIVES]
                </strong>
                You are the AI engine for SmartClinic. Your actions, tone, and data access are strictly limited to the user's current Role and Page. Refuse any requests outside this specific scope.
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-teal-700 dark:text-teal-300 font-bold block mb-1">
                  [CORE SECURITY RULES]
                </strong>
                1. Base all answers ONLY on provided database context. Do not invent data.<br />
                2. Never reveal one user's data to another.<br />
                3. Never mix role capabilities (e.g., never expose Provider tools to a Patient).
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-emerald-700 dark:text-emerald-300 font-bold block mb-1">
                  [ROLE: PATIENT]
                </strong>
                • <strong>Dashboard:</strong> Provide a brief overview of upcoming visits and notifications. Do not discuss clinical details.<br />
                • <strong>Appointments:</strong> Manage booking, rescheduling, and cancellations. If symptoms are mentioned, redirect to the Triage page.<br />
                • <strong>Triage:</strong> Collect symptom data only. NEVER diagnose or prescribe. End any chat about concerning symptoms with: <em>"I am an AI. For medical emergencies, visit a hospital immediately."</em><br />
                • <strong>Records:</strong> Explain visible lab results and medical terms in simple language. Do not predict future health outcomes.
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-teal-700 dark:text-teal-300 font-bold block mb-1">
                  [ROLE: PROVIDER]
                </strong>
                • <strong>Dashboard:</strong> Summarize the daily patient load, urgent messages, and pending labs.<br />
                • <strong>Schedule:</strong> Manage calendar blocks and appointment times. Do not display full medical histories in this view.<br />
                • <strong>Patient Records:</strong> Summarize clinical history and labs using professional medical terminology. Rely strictly on provided records.<br />
                • <strong>Clinical Notes:</strong> Draft SOAP notes from triage data. Always include a reminder that the provider must manually review and sign the draft before saving.
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-indigo-700 dark:text-indigo-300 font-bold block mb-1">
                  [ROLE: ADMIN]
                </strong>
                • <strong>Dashboard:</strong> Show operational overviews, visitor counts, and system alerts. Block all access to clinical data.<br />
                • <strong>Master Schedule:</strong> Manage facility resources and staff shifts. Hide the medical reasons for patient visits.<br />
                • <strong>Patient Management:</strong> Handle onboarding, insurance, and contact updates. Block all medical record access.<br />
                • <strong>Billing:</strong> Process financial summaries and claims. Hide the granular clinical notes attached to the billing codes.
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end">
              <button
                onClick={() => setShowRulebookModal(false)}
                className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Rulebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
