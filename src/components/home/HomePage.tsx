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
  LogOut,
  LayoutDashboard,
  Loader2,
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
  const { setActiveTab, isAuthenticated, authReady, primaryRole, logout } = useClinic();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [supportChat, setSupportChat] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([
    {
      sender: 'bot',
      text: 'Mabuhay! Welcome to Smart Clinic Support. How can we help you today with appointments, doctor schedules, or patient portal access?',
    },
  ]);

  const handleSendSupport = (e?: React.FormEvent) => {
    e?.preventDefault();
    const userText = supportMessage.trim();
    if (!userText) return;
    setSupportChat((prev) => [...prev, { sender: 'user', text: userText }]);
    setSupportMessage('');
    setTimeout(() => {
      const q = userText.toLowerCase();
      let reply = 'Salamat for reaching out. ';
      if (q.includes('appointment') || q.includes('book')) {
        reply += 'You may use Book an Appointment to select a specialist and preferred time slot.';
      } else if (q.includes('schedule') || q.includes('doctor') || q.includes('physician')) {
        reply += 'Scroll to Doctors and availability for clinic hours and open slots.';
      } else if (q.includes('portal') || q.includes('login')) {
        reply += 'Use Sign In to access the patient portal with your Smart Clinic credentials.';
      } else {
        reply += 'Our physicians practice Internal Medicine, Endocrinology, and Cardiovascular Medicine.';
      }
      setSupportChat((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 550);
  };

  const canBook = !isAuthenticated || primaryRole === 'patient';

  const goBook = () => {
    if (!canBook) {
      setActiveTab('dashboard');
      return;
    }
    if (onOpenBookAppointment) onOpenBookAppointment();
    else setActiveTab('appointments');
  };

  const goSchedule = () => {
    const el = document.getElementById('physicians');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goDashboard = () => {
    setActiveTab('dashboard');
  };

  const goPatientPortal = () => {
    if (isAuthenticated) setActiveTab('dashboard');
    else setActiveTab('login');
  };

  const goLogin = () => setActiveTab('login');

  const handleLogout = () => {
    logout();
  };

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
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              type="button"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Support
            </button>
            {!authReady ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Checking…
              </span>
            ) : isAuthenticated ? (
              <>
                <button
                  onClick={goDashboard}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                  type="button"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  My Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-rose-400 hover:text-rose-600"
                  type="button"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
                {canBook && (
                  <button onClick={goBook} className="px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer bg-teal-600 text-white hover:bg-teal-500 shadow-sm" type="button">
                    Book Now
                  </button>
                )}
              </>
            ) : (
              <>
                <button onClick={goLogin} className="px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white" type="button">
                  Login / Register
                </button>
                <button onClick={goBook} className="px-3.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer bg-teal-600 text-white hover:bg-teal-500 shadow-sm" type="button">
                  Book Now
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-300 text-[11px] font-bold mb-5">
                <BadgeCheck className="w-3.5 h-3.5" />
                Philippine outpatient clinic · RA 10173 aligned
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
                Professional outpatient care,{' '}
                <span className="text-teal-500">coordinated end to end</span>
              </h1>
              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300 max-w-xl">
                Book visits, follow your queue, and access clinical updates from one secure Smart Clinic workspace designed for Filipino patients and care teams.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                {canBook ? (
                  <button onClick={goBook} className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm transition" type="button">
                    <Calendar className="w-4 h-4" />
                    Book an Appointment
                  </button>
                ) : (
                  <button onClick={goDashboard} className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm transition" type="button">
                    <LayoutDashboard className="w-4 h-4" />
                    Open Dashboard
                  </button>
                )}
                {isAuthenticated ? (
                  <button onClick={goDashboard} className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-bold flex items-center gap-2 cursor-pointer hover:border-teal-500/50 transition" type="button">
                    <UserCheck className="w-4 h-4 text-teal-500" />
                    My Dashboard
                  </button>
                ) : (
                  <>
                    <button onClick={goPatientPortal} className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-bold flex items-center gap-2 cursor-pointer hover:border-teal-500/50 transition" type="button">
                      <UserCheck className="w-4 h-4 text-teal-500" />
                      Patient Portal
                    </button>
                    <button onClick={goLogin} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 cursor-pointer transition" type="button">
                      Staff / Doctor Sign In
                    </button>
                  </>
                )}
              </div>
              <div className="mt-8 flex flex-wrap gap-5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {['Encrypted records', 'PhilHealth-ready workflows', 'Live clinic queue'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0f1f2a] shadow-xl dark:shadow-none p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/25 text-teal-500 flex items-center justify-center">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Physician Schedule</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="space-y-3">
                  {DOCTORS.map((doc) => (
                    <div key={doc.license} className="p-3.5 rounded-xl border flex items-start gap-3 bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700/50">
                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${doc.statusTone === 'emerald' ? 'bg-teal-500/10 border-teal-500/25 text-teal-500' : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-500'}`}>
                        {doc.icon === 'heart' ? <HeartPulse className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{doc.name}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${doc.statusTone === 'emerald' ? 'text-teal-500' : 'text-cyan-500'}`}>{doc.specialty}</p>
                        <p className="text-[10px] mt-1 text-slate-500 dark:text-slate-400">{doc.schedule} · {doc.room}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${doc.statusTone === 'emerald' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/25'}`}>{doc.status}</span>
                    </div>
                  ))}
                </div>
                <button onClick={goSchedule} className="mt-4 w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm" type="button">
                  View full schedule
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1822]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Building2, value: '12+', label: 'Clinic rooms' },
            { icon: Stethoscope, value: '18', label: 'Attending physicians' },
            { icon: FlaskConical, value: 'Same-day', label: 'Lab turnaround' },
            { icon: Pill, value: 'On-site', label: 'Pharmacy' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-teal-500" />
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{value}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-11">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-500 mb-2">Clinical services</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Coordinated workflows for patients and care teams</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Calendar, tone: 'teal', title: 'Appointments & live queue', desc: 'Online booking, digital check-in, real-time waiting-room updates.', action: 'Book a visit', onClick: goBook },
            { icon: Video, tone: 'indigo', title: 'Telehealth consults', desc: 'Secure video visits for follow-ups and medication reviews.', action: 'Start telehealth', onClick: goBook },
            { icon: FileText, tone: 'amber', title: 'Digital prescriptions', desc: 'E-prescriptions ready for on-site or partner pharmacy fill.', action: 'Learn more', onClick: goSchedule },
            { icon: FlaskConical, tone: 'rose', title: 'Laboratory orders', desc: 'Order tracking and same-day result release to the patient portal.', action: 'View labs', onClick: goLogin },
            { icon: HeartPulse, tone: 'teal', title: 'Chronic care programs', desc: 'Endocrine and cardiovascular follow-up pathways with reminders.', action: 'See programs', onClick: goSchedule },
            { icon: Shield, tone: 'indigo', title: 'Privacy & compliance', desc: 'Built around RA 10173 and Philippine health data security standards.', action: 'Our standards', onClick: goSchedule },
          ].map(({ icon: Icon, tone, title, desc, action, onClick }) => {
            const toneMap: Record<string, string> = {
              teal: 'bg-teal-500/10 border-teal-500/25 text-teal-500',
              indigo: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-500',
              amber: 'bg-amber-500/10 border-amber-500/25 text-amber-500',
              rose: 'bg-rose-500/10 border-rose-500/25 text-rose-500',
            };
            return (
              <div key={title} className="p-6 rounded-2xl border bg-white border-slate-200 shadow-sm dark:bg-[#0f1f2a] dark:border-slate-800/80">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${toneMap[tone]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{title}</h3>
                <p className="text-xs mt-2 leading-relaxed text-slate-500 dark:text-slate-400">{desc}</p>
                <button onClick={onClick} className="mt-4 text-[11px] font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 cursor-pointer" type="button">
                  {action}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section id="departments" className="border-y border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0c1822]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-500 mb-2">Departments</p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Core outpatient units</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Stethoscope, name: 'Internal Medicine' },
              { icon: HeartPulse, name: 'Cardiology' },
              { icon: Activity, name: 'Endocrinology' },
              { icon: FlaskConical, name: 'Laboratory' },
            ].map(({ icon: Icon, name }) => (
              <div key={name} className="p-4 rounded-xl border bg-white border-slate-200 dark:bg-[#0f1f2a] dark:border-slate-800 text-center">
                <Icon className="w-6 h-6 text-teal-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="physicians" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-11">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-500 mb-2">Physician schedule</p>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Doctors & availability</h2>
          <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Clinic hours, rooms, and open slots for attending physicians</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {DOCTORS.map((doc) => (
            <div key={doc.license} className="p-5 sm:p-6 rounded-2xl border bg-white border-slate-200 shadow-sm dark:bg-[#0f1f2a] dark:border-slate-800/80 dark:shadow-none">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-xl border flex items-center justify-center shrink-0 ${doc.statusTone === 'emerald' ? 'bg-teal-500/10 border-teal-500/25 text-teal-500' : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-500'}`}>
                  {doc.icon === 'heart' ? <HeartPulse className="w-6 h-6" /> : <Stethoscope className="w-6 h-6" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{doc.name}</h3>
                      <p className="text-xs text-teal-500 font-semibold mt-0.5">{doc.specialty}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${doc.statusTone === 'emerald' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25 dark:text-emerald-400' : 'bg-cyan-500/10 text-cyan-600 border-cyan-500/25 dark:text-cyan-400'}`}>{doc.status}</span>
                  </div>
                  <p className="text-[11px] mt-2 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400" /> {doc.schedule}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{doc.room} · PRC {doc.license}</p>
                  {canBook && (
                    <button onClick={goBook} className="mt-4 w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer" type="button">
                      Book with this doctor
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1822]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SmartClinicLogo className="w-8 h-8" />
              <span className="font-extrabold text-slate-900 dark:text-white">Smart<span className="text-teal-500">Clinic</span></span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Outpatient care with secure digital workflows for Filipino patients and clinical teams.</p>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-teal-500" /> Metro Manila, Philippines</p>
            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-teal-500" /> +63 2 8123 4567</p>
            <p className="flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-teal-500" /> RA 10173 · PhilHealth-ready</p>
          </div>
          <div className="flex md:justify-end items-start">
            <button onClick={() => setShowSupportModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer" type="button">
              <HelpCircle className="w-3.5 h-3.5" /> Contact support
            </button>
          </div>
        </div>
      </section>

      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Smart Clinic Support</h3>
              <button type="button" onClick={() => setShowSupportModal(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" aria-label="Close">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 h-64 overflow-y-auto space-y-3">
              {supportChat.map((m, i) => (
                <div key={i} className={`text-xs leading-relaxed max-w-[85%] px-3 py-2 rounded-xl ${m.sender === 'user' ? 'ml-auto bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                  {m.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSendSupport} className="p-3 border-t border-slate-200 dark:border-slate-700 flex gap-2">
              <input
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Type your question…"
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs"
              />
              <button type="submit" className="px-3 py-2 rounded-xl bg-teal-600 text-white cursor-pointer">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
