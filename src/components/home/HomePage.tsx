import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  Calendar,
  Clock,
  Shield,
  Video,
  FileText,
  UserCheck,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  X,
  Send,
  Phone,
  MapPin,
  CheckCircle2,
  Stethoscope,
  Activity,
  HeartPulse,
  Lock,
  ArrowRight,
  BadgeCheck,
  Building2,
  FlaskConical,
  Pill,
} from 'lucide-react';

interface Props {
  onOpenBookAppointment?: () => void;
}

const DOCTORS = [
  {
    name: 'Dr. Maria Cristina Reyes, MD',
    specialty: 'Internal Medicine & Endocrinology',
    license: 'MD-892410',
    schedule: 'Mon–Fri · 09:00–12:00',
    room: 'Room 302',
    icon: 'stethoscope' as const,
    status: 'Open',
    statusTone: 'emerald' as const,
  },
  {
    name: 'Dr. Juan Miguel Santos, MD',
    specialty: 'Cardiovascular Medicine',
    license: 'MD-741923',
    schedule: 'Mon–Fri · 13:00–17:00',
    room: 'Cardiology Suite 1',
    icon: 'heart' as const,
    status: 'PM Clinic',
    statusTone: 'cyan' as const,
  },
];

export const HomePage: React.FC<Props> = ({ onOpenBookAppointment }) => {
  const { setActiveTab, isAuthenticated, primaryRole } = useClinic();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportChat, setSupportChat] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Mabuhay! Welcome to Smart Clinic Support. How can we help you today with appointments, doctor schedules, or patient portal access?',
    },
  ]);

  const handleSendSupport = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!supportMessage.trim()) return;

    const userText = supportMessage.trim();
    setSupportChat((prev) => [...prev, { sender: 'user', text: userText }]);
    setSupportMessage('');

    setTimeout(() => {
      let reply = 'Thank you for your inquiry. Our clinical coordination desk is available during clinic hours. ';
      const q = userText.toLowerCase();
      if (q.includes('appointment') || q.includes('book')) {
        reply += 'You may use “Book an Appointment” to select a specialist and preferred time slot.';
      } else if (q.includes('portal') || q.includes('login')) {
        reply += 'Sign in with your registered email via the Login button. Patients may access the Patient Portal after authentication.';
      } else if (q.includes('doctor') || q.includes('specialist')) {
        reply += 'Our physicians practice Internal Medicine, Endocrinology, and Cardiovascular Medicine.';
      } else if (q.includes('philhealth') || q.includes('insurance')) {
        reply += 'We support PhilHealth claims and major HMOs. Present your membership card at the front desk.';
      } else {
        reply += 'A care coordinator will assist you shortly. Hotline: (02) 8888-SMART.';
      }
      setSupportChat((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 550);
  };

  const goBook = () => {
    if (onOpenBookAppointment) onOpenBookAppointment();
    else setActiveTab('appointments');
  };

  const goPatientPortal = () => {
    if (isAuthenticated && primaryRole === 'patient') setActiveTab('dashboard');
    else setActiveTab('login');
  };

  const goLogin = () => setActiveTab('login');

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans antialiased selection:bg-teal-500 selection:text-white bg-slate-50 text-slate-900 dark:bg-[#0a1620] dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b backdrop-blur-xl transition-colors bg-white/95 border-slate-200/80 shadow-sm dark:bg-[#0a1620]/92 dark:border-slate-800/70 dark:shadow-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div onClick={() => setActiveTab('home')} className="flex items-center gap-3 cursor-pointer select-none">
            <SmartClinicLogo className="w-9 h-9" glow={true} />
            <div>
              <div className="font-extrabold text-base sm:text-lg tracking-tight leading-none text-slate-900 dark:text-slate-100">
                Smart<span className="text-teal-500">Clinic</span>
              </div>
              <p className="text-[9px] tracking-[0.12em] uppercase font-semibold text-slate-500 dark:text-slate-400">
                Clinical Excellence · Philippines
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-[13px] font-medium text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-teal-500 transition">Services</a>
            <a href="#departments" className="hover:text-teal-500 transition">Departments</a>
            <a href="#physicians" className="hover:text-teal-500 transition">Physicians</a>
            <a href="#contact" className="hover:text-teal-500 transition">Contact</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => setShowSupportModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
              type="button"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Support
            </button>

            <button
              onClick={goLogin}
              className="px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/15 dark:border dark:border-white/12"
              type="button"
            >
              Sign In
            </button>

            <button
              onClick={goBook}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white transition shadow-md shadow-teal-600/25 cursor-pointer"
              type="button"
            >
              Book Visit
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/80 via-white to-cyan-50/60 dark:from-[#0a1620] dark:via-[#0d2430] dark:to-[#0a1620]" />
        <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-500/10 dark:border-teal-400/25 dark:text-teal-300">
                <BadgeCheck className="w-3.5 h-3.5" />
                RA 10173 · Philippine Health Data Security Standards
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white">
                Professional outpatient care,{' '}
                <span className="text-teal-500">securely connected</span>
              </h1>

              <p className="text-sm sm:text-[15px] leading-relaxed max-w-xl text-slate-500 dark:text-slate-400">
                Book consultations, access e-prescriptions and laboratory results, and manage receipts —
                under National Privacy Commission guidelines with PhilHealth-ready clinical workflows.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  onClick={goBook}
                  className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-600/30 cursor-pointer transition"
                  type="button"
                >
                  <Calendar className="w-4 h-4" />
                  Book an Appointment
                </button>

                <button
                  onClick={goPatientPortal}
                  className="px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 border transition cursor-pointer bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm dark:bg-white/8 dark:hover:bg-white/12 dark:text-white dark:border-white/15 dark:shadow-none"
                  type="button"
                >
                  <UserCheck className="w-4 h-4 text-teal-500" />
                  Patient Portal
                </button>

                <button
                  onClick={goLogin}
                  className="px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 border transition cursor-pointer bg-transparent hover:bg-slate-100 text-slate-700 border-slate-300 dark:hover:bg-white/5 dark:text-slate-200 dark:border-slate-600"
                  type="button"
                >
                  <Lock className="w-4 h-4" />
                  Clinical Staff
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {['PhilHealth accredited workflows', 'Same-day queue access', 'AES-256 session security'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="p-5 sm:p-6 rounded-2xl border bg-white border-slate-200 shadow-sm dark:bg-[#0f1f2a] dark:border-slate-800/80 dark:shadow-none">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Physician Schedule</h3>
                    <p className="text-[10px] mt-0.5 text-slate-500 dark:text-slate-400">Outpatient clinic · Quezon City</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="space-y-3">
                  {DOCTORS.map((doc) => (
                    <div
                      key={doc.license}
                      className="p-3.5 rounded-xl border flex items-start gap-3 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700/50"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                          doc.statusTone === 'emerald'
                            ? 'bg-teal-500/10 border-teal-500/25 text-teal-500'
                            : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-500'
                        }`}
                      >
                        {doc.icon === 'heart' ? <HeartPulse className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{doc.name}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${doc.statusTone === 'emerald' ? 'text-teal-500' : 'text-cyan-500'}`}>
                          {doc.specialty}
                        </p>
                        <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">
                          {doc.schedule} · {doc.room}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          doc.statusTone === 'emerald'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25'
                            : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/25'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={goBook}
                  className="mt-4 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm"
                  type="button"
                >
                  View full schedule
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white dark:border-slate-800/80 dark:bg-[#0f1f2a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { icon: Activity, value: '5,200+', label: 'Patients served' },
            { icon: Clock, value: 'Same-day', label: 'Queue access' },
            { icon: Shield, value: 'AES-256', label: 'Data encryption' },
            { icon: HeartPulse, value: 'PhilHealth', label: 'Ready workflows' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center">
              <Icon className="w-5 h-5 text-teal-500" />
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">{value}</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-11">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-500 mb-2">Clinical services</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">End-to-end outpatient care</h2>
          <p className="text-sm mt-2 max-w-lg mx-auto text-slate-500 dark:text-slate-400">
            Coordinated workflows for patients, physicians, nursing, laboratory, and pharmacy
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Calendar, tone: 'teal', title: 'Appointments & live queue', desc: 'Online booking, digital check-in, real-time waiting-room triage, and visit reminders.', action: 'Book now', onClick: goBook },
            { icon: FileText, tone: 'cyan', title: 'Electronic medical records', desc: 'Longitudinal charts, vital trends, diagnostic archives, and encrypted e-prescriptions.', action: 'Access EMR', onClick: goLogin },
            { icon: Video, tone: 'emerald', title: 'Telehealth consultations', desc: 'Secure remote visits, clinical chat, allergy screening, and pharmacy dispatch.', action: 'Start telehealth', onClick: goLogin },
            { icon: FlaskConical, tone: 'indigo', title: 'Laboratory & diagnostics', desc: 'Specimen tracking, certified results, and patient-facing digital lab reports.', action: 'Lab services', onClick: goLogin },
            { icon: Pill, tone: 'amber', title: 'On-site pharmacy', desc: 'e-Rx verification, inventory control, and same-visit dispensing with GCash / Maya.', action: 'Pharmacy desk', onClick: goLogin },
            { icon: Shield, tone: 'rose', title: 'Privacy & compliance', desc: 'RA 10173 alignment, NPC-ready audit trails, and Philippine Health Data Security Standards.', action: 'Security overview', onClick: goLogin },
          ].map(({ icon: Icon, tone, title, desc, action, onClick }) => {
            const toneMap: Record<string, string> = {
              teal: 'bg-teal-500/10 border-teal-500/25 text-teal-500',
              cyan: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-500',
              emerald: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500',
              indigo: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-500',
              amber: 'bg-amber-500/10 border-amber-500/25 text-amber-500',
              rose: 'bg-rose-500/10 border-rose-500/25 text-rose-500',
            };
            const linkTone: Record<string, string> = {
              teal: 'text-teal-700 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 font-bold',
              cyan: 'text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 font-semibold',
              emerald: 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold',
              indigo: 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold',
              amber: 'text-amber-700 dark:text-amber-400 hover:text-amber-600 font-semibold',
              rose: 'text-rose-600 dark:text-rose-400 hover:text-rose-500 font-semibold',
            };
            return (
              <div key={title} className="p-6 rounded-2xl border transition duration-200 hover:-translate-y-0.5 hover:shadow-md bg-white border-slate-200 shadow-sm dark:bg-[#0f1f2a] dark:border-slate-800/80 dark:shadow-none">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${toneMap[tone]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-bold mb-2 text-slate-900 dark:text-white">{title}</h3>
                <p className="text-xs leading-relaxed mb-4 text-slate-500 dark:text-slate-400">{desc}</p>
                <button onClick={onClick} className={`text-xs flex items-center gap-1 cursor-pointer ${linkTone[tone]}`} type="button">
                  {action}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section id="departments" className="py-16 sm:py-20 border-y border-slate-200 bg-slate-50/80 dark:border-slate-800/80 dark:bg-[#0f1f2a]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-11">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-500 mb-2">Departments</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Clinical specialties</h2>
            <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Board-certified coverage across core outpatient disciplines</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { icon: Stethoscope, color: 'text-teal-500', title: 'Internal Medicine', desc: 'Diabetes, hypertension, endocrinology, and chronic disease management.', lead: 'Dr. Maria Cristina Reyes, MD' },
              { icon: HeartPulse, color: 'text-cyan-500', title: 'Cardiology', desc: 'Atrial fibrillation, ECG evaluation, and cardiovascular risk assessment.', lead: 'Dr. Juan Miguel Santos, MD' },
              { icon: Activity, color: 'text-emerald-500', title: 'Outpatient Triage & Nursing', desc: 'Vital signs, pre-consultation readiness, and continuous patient monitoring.', lead: 'Nurse Ana Patricia Villanueva, RN' },
            ].map(({ icon: Icon, color, title, desc, lead }) => (
              <div key={title} className="p-6 rounded-2xl border bg-white border-slate-200 shadow-sm dark:bg-[#0a1620] dark:border-slate-800 dark:shadow-none">
                <Icon className={`w-7 h-7 ${color} mb-4`} />
                <h3 className="font-bold text-sm mb-1.5 text-slate-900 dark:text-white">{title}</h3>
                <p className="text-xs leading-relaxed mb-3 text-slate-500 dark:text-slate-400">{desc}</p>
                <p className={`text-[11px] font-semibold ${color}`}>Lead: {lead}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="physicians" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-11">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-500 mb-2">Medical staff</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Attending physicians</h2>
          <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Licensed clinicians practicing in Metro Manila</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {DOCTORS.map((doc) => (
            <div key={doc.license} className="p-5 sm:p-6 rounded-2xl border flex gap-4 bg-white border-slate-200 shadow-sm dark:bg-[#0f1f2a] dark:border-slate-800/80 dark:shadow-none">
              <div
                className={`w-16 h-16 rounded-xl border flex items-center justify-center shrink-0 ${
                  doc.statusTone === 'emerald'
                    ? 'bg-teal-500/10 border-teal-500/25 text-teal-500'
                    : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-500'
                }`}
              >
                {doc.icon === 'heart' ? <HeartPulse className="w-7 h-7" /> : <Stethoscope className="w-7 h-7" />}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</h3>
                <p className="text-xs text-teal-500 font-semibold mt-0.5">{doc.specialty}</p>
                <p className="text-[10px] font-mono mt-1.5 text-slate-500 dark:text-slate-400">PRC License {doc.license}</p>
                <button onClick={goBook} className="mt-3 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:text-teal-600 flex items-center gap-1 cursor-pointer" type="button">
                  Book with this physician
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer id="contact" className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0a1620]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <SmartClinicLogo className="w-8 h-8" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Smart<span className="text-teal-500">Clinic</span>
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                Outpatient platform aligned with Philippine Health Data Security & Encryption Standards
                and the Data Privacy Act of 2012 (RA 10173).
              </p>
            </div>
            <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-500 mt-0.5 shrink-0" />
                <span>742 Mabini Street, Barangay San Antonio, Quezon City, Metro Manila</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>+63 2 8888-SMART</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>Monday–Saturday · 8:00 AM – 6:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>PhilHealth · GCash · Maya · Cash</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <p className="font-bold mb-2 text-slate-700 dark:text-slate-200">Quick links</p>
              <div className="flex flex-col gap-1.5">
                <button onClick={goBook} className="hover:text-teal-500 transition cursor-pointer text-left" type="button">Book appointment</button>
                <button onClick={goPatientPortal} className="hover:text-teal-500 transition cursor-pointer text-left" type="button">Patient portal</button>
                <button onClick={goLogin} className="hover:text-teal-500 transition cursor-pointer text-left" type="button">Clinical staff sign-in</button>
                <button onClick={() => setShowSupportModal(true)} className="hover:text-teal-500 transition cursor-pointer text-left" type="button">Support chat</button>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
            <span>© 2026 Smart Clinic. All rights reserved.</span>
            <span className="font-mono">v3.2.8 · RA 10173 · Philippine Health Data Security Standards</span>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-5 right-5 z-50">
        {!showSupportModal && (
          <button
            onClick={() => setShowSupportModal(true)}
            className="rounded-full bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30 flex items-center justify-center cursor-pointer transition"
            title="Open support"
            type="button"
            style={{ width: 52, height: 52 }}
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        )}
        {showSupportModal && (
          <div className="w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden flex flex-col bg-white border-slate-200 dark:bg-[#0f1f2a] dark:border-slate-700" style={{ height: 420 }}>
            <div className="px-4 py-3 bg-teal-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs font-bold">Smart Clinic Support</span>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="p-1 rounded-lg hover:bg-white/20 cursor-pointer" type="button">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {supportChat.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}>{msg.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendSupport} className="p-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-3 py-2 rounded-xl text-xs outline-none bg-slate-100 text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button type="submit" className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-500 cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
