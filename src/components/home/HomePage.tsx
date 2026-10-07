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
  Sun,
  Moon,
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
  ArrowRight
} from 'lucide-react';

interface Props {
  onOpenBookAppointment?: () => void;
}

export const HomePage: React.FC<Props> = ({ onOpenBookAppointment }) => {
  const { setActiveTab, isAuthenticated, primaryRole } = useClinic();
  const [isDarkMode, setIsDarkMode] = useState(true);
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
      let reply = 'Thank you for your inquiry. Our clinical coordination desk is available 24/7. ';
      if (userText.toLowerCase().includes('appointment') || userText.toLowerCase().includes('book')) {
        reply += 'You can click "Book an Appointment" at any time to choose your preferred specialist and schedule.';
      } else if (userText.toLowerCase().includes('portal') || userText.toLowerCase().includes('login')) {
        reply += 'You can sign in using your Patient ID or registered email via the Login button in the top menu.';
      } else if (userText.toLowerCase().includes('doctor') || userText.toLowerCase().includes('specialist')) {
        reply += 'Our board-certified physicians specialize in Internal Medicine, Pediatrics, Cardiology, and Endocrinology.';
      } else {
        reply += 'A care coordinator will assist you shortly. You may also contact our hotline at (02) 8888-SMART.';
      }

      setSupportChat((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 600);
  };

  const handlePatientPortalClick = () => {
    if (isAuthenticated && primaryRole === 'patient') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('login');
    }
  };

  const handleLoginClick = () => {
    setActiveTab('login');
  };

  const handleMyDashboardClick = () => {
    if (isAuthenticated) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('login');
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans selection:bg-teal-500 selection:text-white ${
        isDarkMode
          ? 'bg-[#0b1e27] text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Header Navigation Bar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isDarkMode
            ? 'bg-[#0b1e27]/90 border-slate-800/80'
            : 'bg-white/95 border-slate-200 shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Brand Name */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <SmartClinicLogo className="w-10 h-10" glow={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight leading-none">
                  Smart<span className="text-teal-400">Clinic</span>
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold text-slate-400">
                Your Care, Connected
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-teal-400 transition cursor-pointer ${
                isDarkMode ? 'text-teal-300 font-semibold' : 'text-teal-700 font-semibold'
              }`}
            >
              Home
            </button>
            <a
              href="#departments"
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Departments
            </a>
            <a
              href="#services"
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Services
            </a>
            <a
              href="#doctors"
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Doctors
            </a>
            <a
              href="#contact"
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Contact
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSupportModal(true)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Support</span>
            </button>

            <button
              onClick={handleLoginClick}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                isDarkMode
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                if (onOpenBookAppointment) onOpenBookAppointment();
                else setActiveTab('appointments');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition shadow-md shadow-teal-500/20 cursor-pointer"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? 'bg-gradient-to-br from-[#0b1e27] via-[#0e2a35] to-[#0b1e27]'
              : 'bg-gradient-to-br from-teal-50 via-white to-cyan-50'
          }`}
        />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/50 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border ${
                  isDarkMode
                    ? 'bg-teal-500/10 border-teal-400/30 text-teal-300'
                    : 'bg-teal-50 border-teal-200 text-teal-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Philippine Health Data Security & Encryption Standards · RA 10173</span>
              </div>

              <h1
                className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Your Care,{' '}
                <span className="text-teal-400">Connected</span>
                <br />
                Smart Outpatient Clinic for Every Filipino Family
              </h1>

              <p
                className={`text-sm sm:text-base leading-relaxed max-w-xl ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Book appointments, access e-prescriptions, lab results, and digital receipts — secured under National Privacy Commission guidelines with PhilHealth-ready workflows.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    if (onOpenBookAppointment) onOpenBookAppointment();
                    else setActiveTab('appointments');
                  }}
                  className="px-5 py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/25 cursor-pointer transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book an Appointment</span>
                </button>

                <button
                  onClick={handlePatientPortalClick}
                  className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 border transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-white/10 hover:bg-white/15 text-white border-white/20'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>Patient Portal</span>
                </button>

                <button
                  onClick={handleLoginClick}
                  className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2 border transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-transparent hover:bg-white/5 text-slate-200 border-slate-600'
                      : 'bg-transparent hover:bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Staff Login</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4 text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  PhilHealth Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Same-Day Queue
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  AES-256 Encrypted
                </span>
              </div>
            </div>

            {/* Hero right panel - schedule cards */}
            <div className="lg:col-span-5 space-y-3">
              <div
                className={`p-5 rounded-2xl border shadow-xl ${
                  isDarkMode
                    ? 'bg-[#0e242f]/90 border-teal-800/40'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-bold ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}>
                    Today's Clinic Schedule
                  </h3>
                  <span className="text-[10px] font-mono text-teal-400">LIVE</span>
                </div>

                <div className="space-y-3">
                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      isDarkMode
                        ? 'bg-slate-900/50 border-slate-700/60'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-teal-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        Dr. Maria Cristina Reyes, MD
                      </p>
                      <p className="text-[10px] text-teal-400 font-semibold">Internal Medicine · Endocrinology</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">09:00 – 12:00 · Room 302</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                      Open
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      isDarkMode
                        ? 'bg-slate-900/50 border-slate-700/60'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                      <HeartPulse className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        Dr. Juan Miguel Santos, MD
                      </p>
                      <p className="text-[10px] text-cyan-400 font-semibold">Cardiology · Interventional</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">13:00 – 17:00 · Cardiology Suite 1</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                      PM
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onOpenBookAppointment) onOpenBookAppointment();
                    else setActiveTab('appointments');
                  }}
                  className="mt-4 w-full py-2.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <span>View Full Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust / Stats Strip */}
      <section
        className={`border-y ${
          isDarkMode ? 'border-slate-800 bg-[#0e242f]/60' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: Activity, value: '5,200+', label: 'Patients Served' },
            { icon: Clock, value: 'Same-Day', label: 'Queue Access' },
            { icon: Shield, value: 'AES-256', label: 'Data Encryption' },
            { icon: HeartPulse, value: 'PhilHealth', label: 'Accredited' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <Icon className="w-5 h-5 text-teal-400" />
              <span className={`text-lg font-black ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>{value}</span>
              <span className="text-[11px] font-semibold text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Services / Features */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className={`text-2xl sm:text-3xl font-black ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Clinic Services
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            End-to-end outpatient workflows for patients, physicians, and clinical staff
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div
            className={`p-6 sm:p-7 rounded-2xl border transition hover:-translate-y-1 duration-200 ${
              isDarkMode
                ? 'bg-[#0e242f] border-slate-800 hover:border-teal-500/50'
                : 'bg-slate-50 border-slate-200 hover:border-teal-400 shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Appointments & Live Queue
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              Online booking, digital check-in, real-time waiting-room triage, and SMS reminders for every visit.
            </p>
            <button
              onClick={() => {
                if (onOpenBookAppointment) onOpenBookAppointment();
                else setActiveTab('appointments');
              }}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Book now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 2 */}
          <div
            className={`p-6 sm:p-7 rounded-2xl border transition hover:-translate-y-1 duration-200 ${
              isDarkMode
                ? 'bg-[#0e242f] border-slate-800 hover:border-teal-500/50'
                : 'bg-slate-50 border-slate-200 hover:border-teal-400 shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Secure Electronic Medical Records
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              Longitudinal patient health summaries, vital sign trends, diagnostic lab archives, and encrypted e-prescriptions.
            </p>
            <button
              onClick={() => setActiveTab('login')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View EMR system</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 3 */}
          <div
            className={`p-6 sm:p-7 rounded-2xl border transition hover:-translate-y-1 duration-200 ${
              isDarkMode
                ? 'bg-[#0e242f] border-slate-800 hover:border-teal-500/50'
                : 'bg-slate-50 border-slate-200 hover:border-teal-400 shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Video className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Telehealth & Remote Consultations
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              High-definition remote video consultations, secure digital chat, drug allergy screening, and direct e-prescription dispatch.
            </p>
            <button
              onClick={() => setActiveTab('login')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Start telehealth</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 4 */}
          <div
            className={`p-6 sm:p-7 rounded-2xl border transition hover:-translate-y-1 duration-200 ${
              isDarkMode
                ? 'bg-[#0e242f] border-slate-800 hover:border-teal-500/50'
                : 'bg-slate-50 border-slate-200 hover:border-teal-400 shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Laboratory & Diagnostics
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              Specimen tracking, result certification, HbA1c and CMP panels, with patient-facing digital report access.
            </p>
            <button
              onClick={() => setActiveTab('login')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Lab services</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 5 */}
          <div
            className={`p-6 sm:p-7 rounded-2xl border transition hover:-translate-y-1 duration-200 ${
              isDarkMode
                ? 'bg-[#0e242f] border-slate-800 hover:border-teal-500/50'
                : 'bg-slate-50 border-slate-200 hover:border-teal-400 shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              On-Site Pharmacy
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              e-Rx verification, inventory monitoring, and same-visit medication dispensing with GCash / Maya payment support.
            </p>
            <button
              onClick={() => setActiveTab('login')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Pharmacy desk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 6 */}
          <div
            className={`p-6 sm:p-7 rounded-2xl border transition hover:-translate-y-1 duration-200 ${
              isDarkMode
                ? 'bg-[#0e242f] border-slate-800 hover:border-teal-500/50'
                : 'bg-slate-50 border-slate-200 hover:border-teal-400 shadow-xs'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className={`text-base font-bold mb-2 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Privacy & Compliance
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              RA 10173 Data Privacy Act compliance, NPC-aligned audit trails, and Philippine Health Data Security Standards.
            </p>
            <button
              onClick={handleLoginClick}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Security details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. Departments */}
      <section
        id="departments"
        className={`py-16 border-y ${
          isDarkMode ? 'border-slate-800 bg-[#0e242f]/40' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className={`text-2xl sm:text-3xl font-black ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              Clinical Departments
            </h2>
            <p className="text-sm text-slate-400 mt-2">Board-certified specialists across key outpatient disciplines</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div
              className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0b1e27] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <Stethoscope className="w-8 h-8 text-teal-400 mb-4" />
              <h3 className={`font-bold text-sm mb-1 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Internal Medicine</h3>
              <p className="text-xs text-slate-400 mb-3">Diabetes, hypertension, endocrinology, and chronic disease management.</p>
              <span className="text-[11px] font-semibold text-teal-400">Lead: Dr. Maria Cristina Reyes, MD</span>
            </div>

            <div
              className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0b1e27] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <HeartPulse className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className={`font-bold text-sm mb-1 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Cardiology</h3>
              <p className="text-xs text-slate-400 mb-3">Atrial fibrillation, ECG evaluation, and cardiovascular risk assessment.</p>
              <span className="text-[11px] font-semibold text-cyan-400">Lead: Dr. Juan Miguel Santos, MD</span>
            </div>

            <div
              className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-[#0b1e27] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <Activity className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className={`font-bold text-sm mb-1 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Outpatient Triage & Nursing</h3>
              <p className="text-xs text-slate-400 mb-3">Vital signs, pre-consultation readiness, and continuous patient monitoring.</p>
              <span className="text-[11px] font-semibold text-emerald-400">Lead: Nurse Ana Patricia Villanueva, RN</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Doctors section id anchor */}
      <section id="doctors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className={`text-2xl sm:text-3xl font-black ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            Our Attending Physicians
          </h2>
          <p className="text-sm text-slate-400 mt-2">Experienced clinicians practicing in Metro Manila and beyond</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div
            className={`p-6 rounded-2xl border flex gap-4 ${
              isDarkMode ? 'bg-[#0e242f] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80"
              alt="Dr. Maria Cristina Reyes"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
            />
            <div>
              <h3 className={`font-bold text-sm ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Dr. Maria Cristina Reyes, MD</h3>
              <p className="text-xs text-teal-400 font-semibold mt-0.5">Internal Medicine & Endocrinology</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">License MD-892410</p>
            </div>
          </div>

          <div
            className={`p-6 rounded-2xl border flex gap-4 ${
              isDarkMode ? 'bg-[#0e242f] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"
              alt="Dr. Juan Miguel Santos"
              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-700"
            />
            <div>
              <h3 className={`font-bold text-sm ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>Dr. Juan Miguel Santos, MD</h3>
              <p className="text-xs text-cyan-400 font-semibold mt-0.5">Cardiovascular Medicine</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">License MD-741923</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Contact / Footer */}
      <footer
        id="contact"
        className={`border-t ${
          isDarkMode ? 'border-slate-800 bg-[#0b1e27]' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <SmartClinicLogo className="w-8 h-8" />
                <span className="font-extrabold text-sm">
                  Smart<span className="text-teal-400">Clinic</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Outpatient management platform aligned with Philippine Health Data Security & Encryption Standards and the Data Privacy Act of 2012 (RA 10173).
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                <span>742 Mabini Street, Barangay San Antonio, Quezon City, Metro Manila</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>+63 2 8888-SMART</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Mon–Sat · 8:00 AM – 6:00 PM</span>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              <p className={`font-bold mb-2 ${
                isDarkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>Quick Links</p>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => setActiveTab('appointments')} className="hover:text-teal-400 transition cursor-pointer text-left">Appointments</button>
                <button onClick={handlePatientPortalClick} className="hover:text-teal-400 transition cursor-pointer text-left">Patient Portal</button>
                <button onClick={handleLoginClick} className="hover:text-teal-400 transition cursor-pointer text-left">Staff Login</button>
                <button onClick={() => setShowSupportModal(true)} className="hover:text-teal-400 transition cursor-pointer text-left">Support Chat</button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
            <span>© 2026 AuraHealth Smart Clinic. All rights reserved.</span>
            <span className="font-mono">Philippine Health Data Security Standards · RA 10173</span>
          </div>
        </div>
      </footer>

      {/* Support Chat Modal */}
      <div className="fixed bottom-5 right-5 z-50">
        {!showSupportModal && (
          <button
            onClick={() => setShowSupportModal(true)}
            className="w-14 h-14 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-lg shadow-teal-500/30 flex items-center justify-center cursor-pointer transition"
            title="Open Support"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        )}

        {showSupportModal && (
          <div
            className={`w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
              isDarkMode
                ? 'bg-[#0e242f] border-slate-700'
                : 'bg-white border-slate-200'
            }`}
            style={{ height: '420px' }}
          >
            <div className="px-4 py-3 bg-teal-500/15 border-b border-teal-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-300">Smart Clinic Support</span>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {supportChat.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-teal-500 text-slate-950'
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendSupport}
              className={`p-3 border-t flex items-center gap-2 ${
                isDarkMode ? 'border-slate-700' : 'border-slate-200'
              }`}
            >
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Type your question..."
                className={`flex-1 px-3 py-2 rounded-xl text-xs outline-none ${
                  isDarkMode
                    ? 'bg-slate-800 text-slate-100 placeholder:text-slate-500'
                    : 'bg-slate-100 text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <button
                type="submit"
                className="p-1.5 rounded-lg bg-teal-400 text-slate-950 hover:bg-teal-300 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
