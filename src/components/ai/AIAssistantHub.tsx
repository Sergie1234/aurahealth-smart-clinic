import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  User,
  ShieldAlert,
  AlertOctagon,
  Calendar,
  Lock,
  Layers,
  Clock,
  Receipt,
  Users,
  Info,
  Phone,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Globe,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Activity,
  CalendarCheck,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { EmergencyDisclaimerBanner } from '../common/EmergencyDisclaimerBanner';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { aiService } from '../../services/aiService';
import type { UrgencyBand } from '../../types/clinic';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isEmergency?: boolean;
  persona?: string;
  activePage?: string;
  triageDetails?: {
    urgencyScore: number;
    urgencyBand: UrgencyBand;
    urgencyLabel: string;
    suggestedSpecialty: string;
    summary: string;
    timelineStarted: string;
    timelineTrajectory: string;
  };
}

type RoleType = 'patient' | 'provider' | 'admin';
type PatientPage = 'Triage' | 'Dashboard' | 'Appointments' | 'Records';
type ProviderPage = 'Dashboard' | 'Schedule' | 'Patient Records' | 'Clinical Notes';
type AdminPage = 'Dashboard' | 'Master Schedule' | 'Patient Management' | 'Billing';

// High-priority red flag symptoms for emergency takeover
const EMERGENCY_SYMPTOMS_REGEX =
  /(chest pain|crushing pain|heart attack|hirap huminga|shortness of breath|difficulty breathing|stroke|facial droop|slurred speech|arm weakness|ngiwi|matinding pagdurugo|severe bleeding|uncontrolled bleeding|coughing blood|vomiting blood|unconscious|fainted|loss of consciousness|hinimatay|nawalan ng malay|anaphylaxis|throat swelling|severe allergic reaction|worst headache|thunderclap headache|sudden paralysis)/i;

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
    saveTriageRecord,
    openBookAppointmentWithDraft,
    language,
    setLanguage,
  } = useClinic();

  // Resolve strict role from user's authenticated clinic account
  const resolvedRole: RoleType =
    systemRole === 'patient'
      ? 'patient'
      : systemRole === 'admin'
      ? 'admin'
      : 'provider';

  const activeRole: RoleType = resolvedRole;
  const [patientPage, setPatientPage] = useState<PatientPage>('Triage');
  const [providerPage, setProviderPage] = useState<ProviderPage>('Dashboard');
  const [adminPage, setAdminPage] = useState<AdminPage>('Dashboard');
  const [showRulebookModal, setShowRulebookModal] = useState(false);
  const [showERModal, setShowERModal] = useState(false);

  // Active patient for patient role context
  const activePatient =
    patients.find(
      (p) =>
        (linkedPatientId && p.id === linkedPatientId) ||
        p.email.toLowerCase() === currentUser.email?.toLowerCase()
    ) || patients[0];

  const currentPage =
    activeRole === 'patient'
      ? patientPage
      : activeRole === 'provider'
      ? providerPage
      : adminPage;

  // Follow-up triage check: look up previous triage record for this patient
  const previousTriage = useMemo(() => {
    if (!activePatient?.triageHistory || activePatient.triageHistory.length === 0) return null;
    return activePatient.triageHistory[0];
  }, [activePatient]);

  // Symptom Timeline interactive form states
  const [timelineStarted, setTimelineStarted] = useState<string>('1-3 days ago');
  const [timelineTrajectory, setTimelineTrajectory] = useState<'improving' | 'worsening' | 'stable'>('worsening');
  const [previousEpisodes, setPreviousEpisodes] = useState<string>('First time');

  // Emergency takeover flag
  const [emergencyAlertActive, setEmergencyAlertActive] = useState<boolean>(false);
  const [emergencyReason, setEmergencyReason] = useState<string>('');

  // Latest calculated triage result
  const [latestTriageResult, setLatestTriageResult] = useState<{
    urgencyScore: number;
    urgencyBand: UrgencyBand;
    urgencyLabel: string;
    suggestedSpecialty: string;
    summary: string;
    savedAt?: string;
  } | null>(null);

  // Greetings based on language and role
  const getGreeting = (role: RoleType, pageName: string, lang: 'en' | 'fil') => {
    if (role === 'patient' && pageName === 'Triage') {
      if (lang === 'fil') {
        return `Kumusta po! Ako ang inyong SmartClinic AI Triage Assistant.\n\nAno po ang inyong nararamdaman o mga sintomas ngayon? Maaari po ninyong ilarawan ang inyong karamdaman, at bibigyan namin kayo ng Smart Urgency Score, imumungkahing espesyalista, at ihahanda ang inyong appointment.\n\n⚠️ Paunawa: Ako ay isang AI Assistant. Para sa malubhang emerhensya, pumunta agad sa pinakamalapit na ospital o tumawag sa 911.`;
      }
      return `Hello! I am your SmartClinic AI Clinical Triage Assistant.\n\nWhat symptoms or health concerns are you experiencing today? Please describe your condition below, and I will calculate your Smart Urgency Score, suggest the right medical specialty, and prepare your appointment booking.\n\n⚠️ Reminder: I am an AI. For life-threatening emergencies, visit an emergency room immediately or call 911.`;
    }

    return `SmartClinic AI Engine initialized.\n\nRole: ${role}\nPage: ${pageName}\nTask: Active security isolation enabled.`;
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: getGreeting(activeRole, currentPage, language),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      persona: 'SmartClinic AI Triage Assistant',
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
  }, [messages, isLoading, emergencyAlertActive]);

  // Update greeting when global language changes if chat has only initial message
  useEffect(() => {
    if (messages.length === 1 && messages[0].id.startsWith('init-')) {
      setMessages([
        {
          id: `init-${Date.now()}`,
          sender: 'assistant',
          text: getGreeting(activeRole, currentPage, language),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          persona: 'SmartClinic AI Triage Assistant',
          activePage: currentPage,
        },
      ]);
    }
  }, [language]);

  // Automated Urgency Scoring & Auto-Specialty Analysis Engine
  const evaluateSymptomsAndTriage = (
    userText: string,
    started: string,
    trajectory: 'improving' | 'worsening' | 'stable',
    history: string,
    lang: 'en' | 'fil'
  ): {
    urgencyScore: number;
    urgencyBand: UrgencyBand;
    urgencyLabel: string;
    suggestedSpecialty: string;
    summary: string;
    isEmergency: boolean;
  } => {
    const lower = userText.toLowerCase();

    // 1. Red Flag / Emergency Detection
    if (EMERGENCY_SYMPTOMS_REGEX.test(lower)) {
      const specialty =
        lower.includes('chest') || lower.includes('heart')
          ? 'Cardiology'
          : lower.includes('breath') || lower.includes('hinga')
          ? 'Pulmonology'
          : lower.includes('stroke') || lower.includes('ngiwi') || lower.includes('paralysis')
          ? 'Neurology'
          : 'Emergency Medicine';

      return {
        urgencyScore: 9,
        urgencyBand: 'red',
        urgencyLabel:
          lang === 'fil'
            ? 'Red (7-10): Pumunta agad sa ER / Tumawag sa 911'
            : 'Red (7-10): Go to ER / Call 911 immediately',
        suggestedSpecialty: specialty,
        summary:
          lang === 'fil'
            ? `Kritikal na babala: Nakitaan ng mga panganib na sintomas (${userText.slice(0, 100)}). Nangangailangan ng agarang ospital / ER evaluation.`
            : `Critical red flag detected: Patient reported urgent emergency symptoms (${userText.slice(0, 100)}). Immediate physical ER intervention required.`,
        isEmergency: true,
      };
    }

    // 2. Specialty Auto-Suggestion Heuristics
    let specialty = 'General Medicine';
    if (
      lower.includes('heart') ||
      lower.includes('palpitation') ||
      lower.includes('high blood') ||
      lower.includes('hypertension') ||
      lower.includes('blood pressure') ||
      lower.includes('tibok ng puso')
    ) {
      specialty = 'Cardiology';
    } else if (
      lower.includes('cough') ||
      lower.includes('ubo') ||
      lower.includes('asthma') ||
      lower.includes('wheez') ||
      lower.includes('phlegm') ||
      lower.includes('plema') ||
      lower.includes('lungs') ||
      lower.includes('baga') ||
      lower.includes('flu')
    ) {
      specialty = 'Pulmonology';
    } else if (
      lower.includes('skin') ||
      lower.includes('rash') ||
      lower.includes('kati') ||
      lower.includes('itch') ||
      lower.includes('pimple') ||
      lower.includes('acne') ||
      lower.includes('singaw') ||
      lower.includes('eczema') ||
      lower.includes('dermat')
    ) {
      specialty = 'Dermatology';
    } else if (
      lower.includes('child') ||
      lower.includes('baby') ||
      lower.includes('bata') ||
      lower.includes('sanggol') ||
      lower.includes('pediat') ||
      lower.includes('infant')
    ) {
      specialty = 'Pediatrics';
    } else if (
      lower.includes('sugar') ||
      lower.includes('diabetes') ||
      lower.includes('fever') ||
      lower.includes('lagnat') ||
      lower.includes('stomach') ||
      lower.includes('tiyan') ||
      lower.includes('dizzy') ||
      lower.includes('nahihilo') ||
      lower.includes('headache') ||
      lower.includes('sakit ng ulo')
    ) {
      specialty = 'Internal Medicine';
    }

    // 3. Urgency Scoring (1 to 10)
    let score = 2; // Baseline mild

    // Timeline modifier
    if (started.includes('Today') || started.includes('Ngayon')) score += 1;
    else if (started.includes('1-3 days') || started.includes('1-3 araw')) score += 2;
    else if (started.includes('Over a week') || started.includes('Mahigit')) score += 1;

    // Trajectory modifier
    if (trajectory === 'worsening') score += 2;
    else if (trajectory === 'stable') score += 1;
    else if (trajectory === 'improving') score -= 1;

    // Previous episodes modifier
    if (history.includes('Recurring') || history.includes('Chronic')) score += 1;

    // Symptom severity heuristics
    if (
      lower.includes('high fever') ||
      lower.includes('mataas na lagnat') ||
      lower.includes('severe pain') ||
      lower.includes('matinding sakit') ||
      lower.includes('vomit') ||
      lower.includes('nagsusuka')
    ) {
      score += 2;
    }

    // Clamp score to 1-10
    score = Math.max(1, Math.min(score, 6)); // Non-emergencies capped at 6 (Yellow)

    // Urgency Band assignment
    let urgencyBand: UrgencyBand = 'green';
    let urgencyLabel =
      lang === 'fil'
        ? 'Green (1-3): Maaaring maghintay para sa regular na check-up'
        : 'Green (1-3): Can wait for regular appointment';

    if (score >= 4) {
      urgencyBand = 'yellow';
      urgencyLabel =
        lang === 'fil'
          ? 'Yellow (4-6): Kailangang magpatingin ngayong araw'
          : 'Yellow (4-6): Should be seen today';
    }

    const summaryText =
      lang === 'fil'
        ? `Sintomas: "${userText}". Nagsimula: ${started}. Kasalukuyang lagay: ${trajectory}. Kasaysayan: ${history}. Imumungkahing Konsultasyon: ${specialty}. Urgency Score: ${score}/10.`
        : `Reported symptoms: "${userText}". Began: ${started}. Trajectory: ${trajectory}. Episode history: ${history}. Recommended consultation: ${specialty}. Urgency Score: ${score}/10.`;

    return {
      urgencyScore: score,
      urgencyBand,
      urgencyLabel,
      suggestedSpecialty: specialty,
      summary: summaryText,
      isEmergency: false,
    };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    const userText = textToSend.trim();
    if (!customText) setInput('');
    setIsLoading(true);

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      activePage: currentPage,
    };
    setMessages((prev) => [...prev, userMsg]);

    // Check emergency red flags immediately
    if (EMERGENCY_SYMPTOMS_REGEX.test(userText)) {
      setEmergencyAlertActive(true);
      setEmergencyReason(userText);
      setIsLoading(false);

      const emrSummary = `EMERGENCY TRIAGE RED FLAG: Patient reported "${userText}". Normal triage stopped. Emergency room intervention advised.`;
      if (activePatient?.id) {
        saveTriageRecord(activePatient.id, {
          patientId: activePatient.id,
          patientName: activePatient.fullName,
          symptoms: userText,
          timelineStarted,
          timelineTrajectory,
          previousEpisodes,
          urgencyScore: 10,
          urgencyBand: 'red',
          urgencyLabel:
            language === 'fil'
              ? 'Red (7-10): Pumunta agad sa ER / Tumawag sa 911'
              : 'Red (7-10): Go to ER / Call 911 immediately',
          suggestedSpecialty: 'Emergency Medicine',
          summary: emrSummary,
          actionRecommended: 'Call 911 or immediate ambulance transfer to nearest trauma hospital.',
          isEmergency: true,
          language,
        });
      }

      const emergencyReply =
        language === 'fil'
          ? `🚨 BABALA: Nakitaan ng mga kritikal na sintomas sa inyong sinabi:\n"${userText}"\n\nItinigil ang normal na clinic triage. Ang mga sintomas na ito ay nangangailangan ng AGARANG ATENSYONG MEDIKAL sa Emergency Room.\n\n⚠️ Huwag maghintay ng regular appointment. Paki-pindot ang mga emergency buttons sa ibaba o tumawag agad sa 911.\n\nI am an AI. For medical emergencies, visit a hospital immediately.`
          : `🚨 CRITICAL EMERGENCY WARNING: Potential life-threatening red flags detected in your report:\n"${userText}"\n\nStandard clinic triage has been halted. These symptoms require IMMEDIATE physical evaluation in an Emergency Department.\n\n⚠️ Do NOT wait for a regular clinic visit. Please click Call 911 or visit the nearest ER immediately.\n\nI am an AI. For medical emergencies, visit a hospital immediately.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: emergencyReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergency: true,
          persona: 'SmartClinic AI Emergency Sentry',
          activePage: currentPage,
          triageDetails: {
            urgencyScore: 10,
            urgencyBand: 'red',
            urgencyLabel:
              language === 'fil'
                ? 'Red (7-10): Pumunta agad sa ER / Tumawag sa 911'
                : 'Red (7-10): Go to ER / Call 911 immediately',
            suggestedSpecialty: 'Emergency Medicine',
            summary: emrSummary,
            timelineStarted,
            timelineTrajectory,
          },
        },
      ]);
      return;
    }

    try {
      // Evaluate Triage Scoring & Auto-Specialty
      const triage = evaluateSymptomsAndTriage(
        userText,
        timelineStarted,
        timelineTrajectory,
        previousEpisodes,
        language
      );

      // Save Triage Summary directly into Patient's EMR
      let savedRecordId = '';
      if (activePatient?.id) {
        const saved = saveTriageRecord(activePatient.id, {
          patientId: activePatient.id,
          patientName: activePatient.fullName,
          symptoms: userText,
          timelineStarted,
          timelineTrajectory,
          previousEpisodes,
          urgencyScore: triage.urgencyScore,
          urgencyBand: triage.urgencyBand,
          urgencyLabel: triage.urgencyLabel,
          suggestedSpecialty: triage.suggestedSpecialty,
          summary: triage.summary,
          actionRecommended:
            triage.urgencyBand === 'yellow'
              ? 'Same-day clinical evaluation recommended.'
              : 'Routine outpatient consultation recommended.',
          isEmergency: false,
          language,
        });
        savedRecordId = saved.id;
      }

      setLatestTriageResult({
        ...triage,
        savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Query AI Service with structured prompt or localized response
      let responseText = '';
      try {
        const res = await aiService.sendChatMessage({
          message: `${userText} (Timeline: started ${timelineStarted}, progression: ${timelineTrajectory}, previous history: ${previousEpisodes}, Language: ${language === 'fil' ? 'Tagalog/Filipino' : 'English'})`,
          conversationHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
          context: {
            patientId: activePatient?.id,
            patientName: activePatient?.fullName,
            activePage: currentPage,
            triageSummary: triage.summary,
            urgencyScore: triage.urgencyScore,
            suggestedSpecialty: triage.suggestedSpecialty,
          },
          role: activeRole,
          page: currentPage,
          token: authToken,
        });
        responseText = res.reply;
      } catch {
        // Deterministic medical rulebook response
        if (language === 'fil') {
          responseText = `Salamat sa pagbabahagi ng inyong kalagayan.\n\n📊 Smart Urgency Score: ${triage.urgencyScore}/10 [${triage.urgencyBand.toUpperCase()}]\n🩺 Imumungkahing Departamento: ${triage.suggestedSpecialty}\n\n✅ Naitala na po ang buod ng inyong triage sa inyong Electronic Medical Record (EMR) upang masuri ng doktor bago ang konsultasyon.\n\nPwede na po ninyong i-click ang "Mag-book ng Appointment" sa ibaba—nakahanda na po ang inyong datos, pipili na lamang kayo ng petsa at oras.\n\nI am an AI. For medical emergencies, visit a hospital immediately.`;
        } else {
          responseText = `Thank you for sharing your symptoms.\n\n📊 Smart Urgency Score: ${triage.urgencyScore}/10 [${triage.urgencyBand.toUpperCase()}]\n🩺 Suggested Specialty: ${triage.suggestedSpecialty}\n\n✅ A clean triage assessment has been automatically archived into your Electronic Medical Record (EMR) for physician review.\n\nYou can click "Book Pre-filled Appointment" below—your specialty, urgency, and symptom summary are already prepared. You only need to pick a date and time.\n\nI am an AI. For medical emergencies, visit a hospital immediately.`;
        }
      }

      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: false,
        persona: 'SmartClinic AI Triage Assistant',
        activePage: currentPage,
        triageDetails: {
          urgencyScore: triage.urgencyScore,
          urgencyBand: triage.urgencyBand,
          urgencyLabel: triage.urgencyLabel,
          suggestedSpecialty: triage.suggestedSpecialty,
          summary: triage.summary,
          timelineStarted,
          timelineTrajectory,
        },
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Triage error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookWithTriage = (details?: {
    specialty?: string;
    suggestedSpecialty?: string;
    urgencyScore: number;
    urgencyBand: UrgencyBand;
    urgencyLabel: string;
    summary: string;
  }) => {
    const target = details || latestTriageResult;
    if (!target) return;
    const spec = 'suggestedSpecialty' in target && target.suggestedSpecialty ? target.suggestedSpecialty : 'specialty' in target && target.specialty ? target.specialty : 'General Medicine';

    openBookAppointmentWithDraft({
      specialty: spec,
      department: spec,
      urgencyScore: target.urgencyScore,
      urgencyBand: target.urgencyBand,
      urgencyLabel: target.urgencyLabel,
      reason: target.summary,
      symptoms: input || target.summary,
      patientId: activePatient?.id,
    });
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: getGreeting(activeRole, currentPage, language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        persona: 'SmartClinic AI Triage Assistant',
        activePage: currentPage,
      },
    ]);
    setEmergencyAlertActive(false);
    setLatestTriageResult(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Timeline pills translation labels
  const timelineStrings = {
    startedTitle: language === 'fil' ? 'Kailan nagsimula ang mga sintomas?' : 'When did symptoms start?',
    trajectoryTitle: language === 'fil' ? 'Kumusta ang takbo ng karamdaman?' : 'How are symptoms progressing?',
    episodesTitle: language === 'fil' ? 'May ganito na bang naranasan dati?' : 'Any previous similar episodes?',
    startedOptions:
      language === 'fil'
        ? [
            { label: 'Ngayong Araw', value: 'Today' },
            { label: '1-3 Araw Na', value: '1-3 days ago' },
            { label: '1 Linggo Na', value: '1 week ago' },
            { label: 'Mahigit 1 Linggo', value: 'Over a week ago' },
          ]
        : [
            { label: 'Today', value: 'Today' },
            { label: '1-3 days ago', value: '1-3 days ago' },
            { label: '1 week ago', value: '1 week ago' },
            { label: 'Weeks / Months ago', value: 'Over a week ago' },
          ],
    trajectoryOptions:
      language === 'fil'
        ? [
            { label: 'Lumalala', value: 'worsening' },
            { label: 'Pareho pa rin', value: 'stable' },
            { label: 'Gumagaling na', value: 'improving' },
          ]
        : [
            { label: 'Getting Worse', value: 'worsening' },
            { label: 'About the Same', value: 'stable' },
            { label: 'Gradually Improving', value: 'improving' },
          ],
    episodeOptions:
      language === 'fil'
        ? [
            { label: 'Unang Beses', value: 'First time' },
            { label: 'Paulit-ulit na', value: 'Recurring' },
            { label: 'Matagal nang Kundisyon', value: 'Chronic condition' },
          ]
        : [
            { label: 'First Time', value: 'First time' },
            { label: 'Recurring Episodes', value: 'Recurring' },
            { label: 'Chronic / Known Condition', value: 'Chronic condition' },
          ],
  };

  const [showParameters, setShowParameters] = useState<boolean>(true);

  return (
    <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-110px)] font-sans">
      {/* 1. Primary Header Card with Language Toggle & Clean Alignment */}
      <div className="bg-white dark:bg-slate-900 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shrink-0">
        <div className="flex items-center gap-3">
          <SmartClinicLogo className="w-10 h-10" glow={true} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {activeRole === 'patient'
                  ? language === 'fil'
                    ? 'AI Triage Chatbot (Pagsusuri ng Sintomas)'
                    : 'AI Triage Chatbot & Clinical Assistant'
                  : activeRole === 'provider'
                  ? 'Clinical Decision Support AI'
                  : 'Clinic Operations AI'}
              </h1>

              {/* Patient Role Isolation Badge */}
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize border flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                <Lock className="w-3 h-3" />
                <span>{activeRole} Tenant Isolated</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeRole === 'patient'
                ? `Patient EMR: ${activePatient?.fullName || 'Patient'} (${activePatient?.mrn || 'N/A'}). Strictly isolated personal health records.`
                : `Clinical perspective: ${currentUser.name} (${activeRole}).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            onClick={() => setShowRulebookModal(true)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700"
            title="View Strict Clinical Directives"
          >
            <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Rulebook</span>
          </button>

          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{language === 'fil' ? 'I-reset' : 'Clear Chat'}</span>
          </button>
        </div>
      </div>

      {/* 2. Organized Triage Control Hub (Groups Emergency Disclaimer, Follow-up, and Timeline Parameters neatly) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden shrink-0 transition-all">
        {/* Hub Header & Collapse Toggle */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                {language === 'fil' ? 'Triage Parameters at Gabay Pangkalusugan' : 'Triage Configuration & Clinical Parameters'}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {language === 'fil' ? 'Ayusin ang timeline at suriin ang mga babala' : 'Configure symptom timeline, follow-up, and safety notices'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowParameters(!showParameters)}
            className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <span>{showParameters ? (language === 'fil' ? 'Itago ang mga Parameter' : 'Collapse Parameters') : (language === 'fil' ? 'Ipakita ang mga Parameter' : 'Configure Parameters')}</span>
            {showParameters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Content Area */}
        {showParameters && (
          <div className="p-4 space-y-3.5">
            {/* Emergency Disclaimer Banner */}
            <EmergencyDisclaimerBanner />

            {/* Follow-up Triage Card (Feature 8): If patient had previous triage assessment */}
            {previousTriage && activeRole === 'patient' && (
              <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 dark:from-teal-950/40 dark:via-cyan-950/40 dark:to-emerald-950/40 p-3.5 rounded-xl border border-teal-200 dark:border-teal-800 shadow-2xs text-xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="font-bold text-slate-900 dark:text-white">
                      {language === 'fil' ? 'Follow-Up sa Nakaraang Triage:' : 'Follow-Up on Previous Triage:'}
                    </span>
                    <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 px-2 py-0.5 rounded-full font-bold">
                      {new Date(previousTriage.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                      Score: {previousTriage.urgencyScore}/10 ({previousTriage.suggestedSpecialty})
                    </span>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-xs">
                  {language === 'fil'
                    ? `Naitala noong nakaraan: "${previousTriage.symptoms}". Kumusta po ang inyong nararamdaman ngayon simula noong huling pagsusuri?`
                    : `Logged previously: "${previousTriage.symptoms}". How are your symptoms progressing since your last triage?`}
                </p>

                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTimelineTrajectory('improving');
                      handleSendMessage(
                        language === 'fil'
                          ? `[Follow-up update]: Gumagaling na ang dating sintomas (${previousTriage.symptoms}). Nais ko lang magpa-checkup.`
                          : `[Follow-up update]: My previous symptoms (${previousTriage.symptoms}) are getting better. Just checking in.`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer text-[11px] shadow-2xs"
                  >
                    ✓ {language === 'fil' ? 'Gumagaling Na' : 'Getting Better'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimelineTrajectory('stable');
                      handleSendMessage(
                        language === 'fil'
                          ? `[Follow-up update]: Pareho pa rin ang dating sintomas (${previousTriage.symptoms}). Hindi pa nawawala.`
                          : `[Follow-up update]: My previous symptoms (${previousTriage.symptoms}) are about the same as before.`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold hover:bg-amber-50 dark:hover:bg-amber-950/50 transition cursor-pointer text-[11px] shadow-2xs"
                  >
                    = {language === 'fil' ? 'Pareho Pa Rin' : 'About the Same'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTimelineTrajectory('worsening');
                      handleSendMessage(
                        language === 'fil'
                          ? `[Follow-up update]: Lumalala po ang dating sintomas (${previousTriage.symptoms}). Kailangan ko na ng doktor.`
                          : `[Follow-up update]: My previous symptoms (${previousTriage.symptoms}) are getting worse. I need medical review.`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-bold hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer text-[11px] shadow-2xs"
                  >
                    ▲ {language === 'fil' ? 'Lumalala' : 'Getting Worse'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInput(
                        language === 'fil'
                          ? 'Mayroon akong bagong sintomas ngayon: '
                          : 'I have a new / different symptom today: '
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer text-[11px] shadow-2xs"
                  >
                    + {language === 'fil' ? 'May Bagong Sintomas' : 'New / Different Symptoms'}
                  </button>
                </div>
              </div>
            )}

            {/* Feature 5: Strong Red Flag Detection & Forced Emergency Takeover */}
            {emergencyAlertActive && (
              <div className="bg-rose-600 text-white p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-rose-400 animate-pulse space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 shadow-lg font-black text-xl">
                    <AlertOctagon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-black tracking-tight">
                      {language === 'fil'
                        ? '🚨 BABALA: KRITIKAL NA SINTOMAS NAITALA — ITINIGIL ANG TRIAGE'
                        : '🚨 CRITICAL MEDICAL RED FLAG DETECTED — TRIAGE HALTED'}
                    </h3>
                    <p className="text-xs text-rose-100 leading-relaxed">
                      {language === 'fil'
                        ? `Ang iyong iniulat na sintomas ("${emergencyReason}") ay posibleng senyales ng malubha o nakamamatay na kondisyon na hindi dapat hintayin sa regular na clinic appointment. Mangyaring kumilos agad.`
                        : `Your reported symptoms ("${emergencyReason}") indicate a potential emergency that requires immediate physical emergency room care. Normal clinic triage has halted.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap pt-1">
                  <a
                    href="tel:911"
                    className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-700 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition transform hover:scale-105"
                  >
                    <Phone className="w-4 h-4 text-rose-600" />
                    <span>{language === 'fil' ? 'TUMAWAG SA 911' : 'CALL 911 (EMERGENCY)'}</span>
                  </a>

                  <a
                    href="tel:143"
                    className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-rose-400 transition"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Red Cross (143)</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowERModal(true)}
                    className="px-4 py-2.5 bg-rose-950 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-rose-800 transition cursor-pointer"
                  >
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span>{language === 'fil' ? 'Maghanap ng ER' : 'Find Nearest Hospital ER'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Feature 4: Symptom Timeline Interactive Controls */}
            {activeRole === 'patient' && !emergencyAlertActive && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold">
                  <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{language === 'fil' ? 'Pagsusuri ng Timeline ng Sintomas:' : 'Symptom Timeline Parameters:'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      {timelineStrings.startedTitle}
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {timelineStrings.startedOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setTimelineStarted(opt.value)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                            timelineStarted === opt.value
                              ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      {timelineStrings.trajectoryTitle}
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {timelineStrings.trajectoryOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setTimelineTrajectory(opt.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                            timelineTrajectory === opt.value
                              ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      {timelineStrings.episodesTitle}
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {timelineStrings.episodeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setPreviousEpisodes(opt.value)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                            previousEpisodes === opt.value
                              ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Chat Messages Container */}
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
              {/* Avatar Icon */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-slate-800 text-white dark:bg-slate-700'
                    : msg.isEmergency
                    ? 'bg-rose-600 text-white animate-pulse'
                    : activeRole === 'patient'
                    ? 'bg-teal-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : msg.isEmergency ? (
                  <AlertOctagon className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-xs space-y-3 shadow-2xs ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-tr-xs'
                    : msg.isEmergency
                    ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 rounded-tl-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span>{isUser ? currentUser.name : msg.persona || 'SmartClinic AI Triage'}</span>
                    {msg.isEmergency && (
                      <span className="px-2 py-0.2 bg-rose-600 text-white rounded font-black text-[9px] uppercase tracking-wider">
                        CRITICAL RED FLAG
                      </span>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="leading-relaxed whitespace-pre-wrap font-normal text-xs">
                  {msg.text}
                </div>

                {/* Features 1, 2, 3, 6: Structured Triage Card with Urgency Score & Pre-fill CTA */}
                {msg.triageDetails && !isUser && (
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-3">
                    {/* Urgency Score Display (Green 1-3, Yellow 4-6, Red 7-10) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 text-white shadow-md ${
                            msg.triageDetails.urgencyBand === 'red'
                              ? 'bg-rose-600 shadow-rose-600/30'
                              : msg.triageDetails.urgencyBand === 'yellow'
                              ? 'bg-amber-500 shadow-amber-500/30'
                              : 'bg-emerald-600 shadow-emerald-600/30'
                          }`}
                        >
                          <span className="text-sm leading-none">{msg.triageDetails.urgencyScore}</span>
                          <span className="text-[9px] uppercase opacity-90">/ 10</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                msg.triageDetails.urgencyBand === 'red'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                                  : msg.triageDetails.urgencyBand === 'yellow'
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                              }`}
                            >
                              {msg.triageDetails.urgencyBand.toUpperCase()} URGENCY
                            </span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                              {msg.triageDetails.urgencyLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Auto-Suggested Medical Specialty: <strong className="text-teal-700 dark:text-teal-300 font-bold">{msg.triageDetails.suggestedSpecialty}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Feature 6: Auto-Saved to EMR Tag */}
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 self-start sm:self-auto">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Saved to EMR Chart</span>
                      </span>
                    </div>

                    {/* Feature 3: Pre-fill Appointment CTA Button */}
                    {!msg.isEmergency && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {language === 'fil'
                            ? 'Nakahanda na ang iyong specialty, urgency, at buod ng sintomas.'
                            : 'Booking prepared: suggested specialty, urgency, and symptom summary pre-filled.'}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleBookWithTriage({
                              specialty: msg.triageDetails!.suggestedSpecialty,
                              urgencyScore: msg.triageDetails!.urgencyScore,
                              urgencyBand: msg.triageDetails!.urgencyBand,
                              urgencyLabel: msg.triageDetails!.urgencyLabel,
                              summary: msg.triageDetails!.summary,
                            })
                          }
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-teal-900/20 cursor-pointer self-start sm:self-auto"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          <span>
                            {language === 'fil'
                              ? `Mag-book ng Appointment (${msg.triageDetails.suggestedSpecialty})`
                              : `Book Pre-filled Appointment (${msg.triageDetails.suggestedSpecialty})`}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Controls */}
                {!isUser && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="italic">
                      Triage assessment only • Never a substitute for in-person physician evaluation
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
            <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-xs shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
              <span>
                {language === 'fil'
                  ? 'Sinusuri ang mga sintomas, kinakalkula ang urgency score, at inihahanda ang EMR...'
                  : 'Analyzing symptoms, scoring clinical urgency, and saving intake summary to EMR...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Symptom Suggestion Chips for One-Click Triage Entry */}
      {activeRole === 'patient' && !emergencyAlertActive && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
            {language === 'fil' ? 'Mga Karaniwang Sintomas:' : 'Quick Symptoms:'}
          </span>
          {[
            language === 'fil' ? 'Mataas na Lagnat' : 'High Fever',
            language === 'fil' ? 'Paninikip ng Dibdib' : 'Chest Tightness',
            language === 'fil' ? 'Matinding Sakit ng Ulo' : 'Severe Headache',
            language === 'fil' ? 'Ubo at Sipon' : 'Persistent Cough',
            language === 'fil' ? 'Nahihilo / Pagsusuka' : 'Dizziness / Nausea',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 text-teal-700 dark:text-teal-300 rounded-xl border border-teal-200 dark:border-teal-800 font-semibold transition shrink-0 cursor-pointer shadow-2xs"
            >
              + {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input Form with Send Action */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 shrink-0"
      >
        <div className="px-3 py-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-xl text-[10px] font-bold border border-teal-200 dark:border-teal-800 shrink-0 flex items-center gap-1">
          <Stethoscope className="w-3 h-3" />
          <span>{language === 'fil' ? 'Pagsusuri' : 'AI Triage'}</span>
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            language === 'fil'
              ? 'Ilarawan ang inyong nararamdaman (hal. mataas na lagnat, paninikip ng dibdib, ubo)...'
              : 'Describe your symptoms (e.g. mild fever, chest pain, persistent cough, skin rash)...'
          }
          className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900 dark:text-slate-100"
        />

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{language === 'fil' ? 'Ipadala' : 'Send'}</span>
        </button>
      </form>

      {/* Find Nearest ER / Emergency Hospital Modal */}
      {showERModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden font-sans my-auto text-xs text-slate-800 dark:text-slate-100">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-50 dark:bg-rose-950/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-rose-950 dark:text-rose-100">
                    Emergency Trauma Centers & 24/7 ER Directory
                  </h3>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300">
                    Metro Manila & National Emergency Services
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowERModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between gap-2">
                <div>
                  <span className="font-black text-rose-900 dark:text-rose-200 block">National Emergency Hotline</span>
                  <span className="text-slate-600 dark:text-slate-400 text-[11px]">Free nationwide emergency response</span>
                </div>
                <a
                  href="tel:911"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 911</span>
                </a>
              </div>

              {[
                {
                  name: 'Philippine General Hospital (PGH) Trauma Center',
                  address: 'Taft Avenue, Ermita, Manila',
                  phone: '(02) 8554-8400',
                  notes: 'National Government Referral Center (Level 3 Trauma)',
                },
                {
                  name: "St. Luke's Medical Center - Global City ER",
                  address: '32nd St, Bonifacio Global City, Taguig',
                  phone: '(02) 8789-7700',
                  notes: 'Comprehensive Tertiary Emergency & Cardiac Care',
                },
                {
                  name: 'Makati Medical Center Emergency Department',
                  address: 'No. 2 Amorsolo St, Legazpi Village, Makati',
                  phone: '(02) 8888-8999',
                  notes: '24/7 Acute Trauma & Stroke Center',
                },
                {
                  name: 'The Medical City ER',
                  address: 'Ortigas Avenue, Pasig City',
                  phone: '(02) 8988-1000',
                  notes: 'Tertiary Emergency, Stroke & Cardiac Intervention',
                },
                {
                  name: 'Philippine Heart Center Emergency Care',
                  address: 'East Avenue, Diliman, Quezon City',
                  phone: '(02) 8925-2401',
                  notes: 'National Center for Cardiovascular Emergencies',
                },
                {
                  name: 'Lung Center of the Philippines Emergency',
                  address: 'Quezon Avenue, Diliman, Quezon City',
                  phone: '(02) 8924-6101',
                  notes: 'Pulmonary & Severe Respiratory Care',
                },
              ].map((hosp, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{hosp.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{hosp.address}</p>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">{hosp.notes}</span>
                  </div>
                  <a
                    href={`tel:${hosp.phone.replace(/\D/g, '')}`}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold rounded-xl text-[11px] flex items-center gap-1.5 shrink-0 self-start sm:self-auto border border-slate-200 dark:border-slate-600"
                  >
                    <Phone className="w-3 h-3 text-teal-600" />
                    <span>{hosp.phone}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowERModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strict Rulebook Modal */}
      {showRulebookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  SmartClinic AI Directives & Triage Protocols
                </h3>
              </div>
              <button
                onClick={() => setShowRulebookModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-teal-700 dark:text-teal-300 font-bold block mb-1">
                  Urgency Scoring Bands:
                </strong>
                • <strong>Green (1-3):</strong> Can wait for regular appointment.<br />
                • <strong>Yellow (4-6):</strong> Should be seen today by attending outpatient physician.<br />
                • <strong>Red (7-10):</strong> Critical red flag symptoms. Stop triage and call 911 / proceed to ER immediately.
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-emerald-700 dark:text-emerald-300 font-bold block mb-1">
                  EMR & Appointment Integration:
                </strong>
                • Clean triage assessments are automatically logged to the patient&apos;s Electronic Medical Record.<br />
                • Attending physicians can review triage intake prior to entering consultation suite.<br />
                • Pre-fill booking prepares suggested specialty, urgency, and symptom summary so patients only select date and time.
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white font-bold block mb-1">
                  Medical Disclaimer:
                </strong>
                SmartClinic AI Triage is an advisory assistant and not a licensed physician. It never prescribes drugs or issues definitive diagnoses.
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRulebookModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
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
