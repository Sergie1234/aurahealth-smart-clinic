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
              href="#contact"
              className="hover:text-teal-400 transition cursor-pointer"
            >
              Contact
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Theme Toggle Button (matching screenshot) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dark mode</span>
                </>
              )}
            </button>

            {/* Login Button */}
            <button
              onClick={handleLoginClick}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-teal-500 hover:text-white'
                  : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
              }`}
            >
              Login
            </button>

            {/* My Dashboard CTA Button */}
            <button
              onClick={handleMyDashboardClick}
              className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 flex items-center gap-1.5 transition shadow-sm shadow-teal-500/20 cursor-pointer"
            >
              <span>My dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-teal-900/40 border border-teal-500/30 text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                A Simpler Clinic Experience
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                More care.{' '}
                <span className="text-cyan-300 block sm:inline">
                  Less waiting around.
                </span>
              </h1>

              {/* Compassionate Clinical Copy */}
              <p
                className={`text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed ${
                  isDarkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Find a doctor’s schedule, request your visit, and stay informed from appointment to consultation. Dedicated Philippine clinicians empowered by modern medical surveillance—compassionate healthcare, one connection away.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (onOpenBookAppointment) onOpenBookAppointment();
                    else setActiveTab('appointments');
                  }}
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-teal-400 hover:bg-teal-300 text-slate-950 flex items-center gap-2 transition shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  <span>Book an appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handlePatientPortalClick}
                  className={`px-5 py-3.5 rounded-xl font-semibold text-sm border transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-900/80 border-slate-700 hover:border-teal-400 text-slate-200'
                      : 'bg-white border-slate-300 hover:border-teal-500 text-slate-800'
                  }`}
                >
                  Patient Portal
                </button>

                <a
                  href="#doctors"
                  className={`px-5 py-3.5 rounded-xl font-semibold text-sm border transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Find a doctor
                </a>
              </div>

              {/* Subtext Prompt */}
              <div className="pt-1 text-xs text-slate-400 flex items-center gap-1.5">
                <span>Already registered?</span>
                <button
                  onClick={handleLoginClick}
                  className="text-teal-400 hover:underline font-semibold cursor-pointer"
                >
                  Sign in to your patient portal
                </button>
              </div>
            </div>

            {/* Right Hero Schedule Card (matching Screenshot 1256) */}
            <div className="lg:col-span-5">
              <div
                className={`p-6 sm:p-7 rounded-3xl border transition shadow-2xl relative ${
                  isDarkMode
                    ? 'bg-[#0f2933]/90 border-teal-900/50 shadow-teal-950/40'
                    : 'bg-white border-slate-200 shadow-slate-200'
                }`}
              >
                {/* Header Badge & Date */}
                <div className="flex items-center justify-between pb-4 border-b border-teal-900/40">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span>Patient services</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Oct 7, 2026</span>
                </div>

                {/* Subheading */}
                <h3 className="text-xl font-bold mt-4 mb-5 text-white">
                  Your next visit starts here.
                </h3>

                {/* Verified Doctor Schedule Cards */}
                <div className="space-y-3.5">
                  {/* Doctor A */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition ${
                      isDarkMode
                        ? 'bg-[#123440]/80 border-teal-800/40 hover:border-teal-600/60'
                        : 'bg-slate-50 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 font-extrabold flex items-center justify-center shrink-0">
                      D
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        Dr. Sarah Lin, MD
                      </h4>
                      <p className="text-xs text-slate-400">General & Internal Medicine</p>
                      <p className="text-[11px] font-mono text-teal-300 mt-0.5">
                        Thu, Oct 8 • 9:00 AM
                      </p>
                    </div>
                  </div>

                  {/* Doctor B */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center gap-3.5 transition ${
                      isDarkMode
                        ? 'bg-[#123440]/80 border-teal-800/40 hover:border-teal-600/60'
                        : 'bg-slate-50 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 font-extrabold flex items-center justify-center shrink-0">
                      D
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-100 truncate">
                        Dr. Marcus Vance, MD
                      </h4>
                      <p className="text-xs text-slate-400">Cardiology & Intensive Care</p>
                      <p className="text-[11px] font-mono text-teal-300 mt-0.5">
                        Thu, Oct 8 • 10:30 AM
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Validation Checkmark */}
                <div className="mt-5 pt-3.5 border-t border-teal-900/40 flex items-center justify-between text-xs text-teal-300 font-medium">
                  <span>Appointments confirmed by your clinic</span>
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Feature Highlights (Three-Column Grid - Services) */}
      <section
        id="services"
        className={`py-16 border-t ${
          isDarkMode ? 'bg-[#081820] border-slate-800/80' : 'bg-white border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Modern Clinical Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              Clinical Excellence Built for Patient Well-Being
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Engineered for seamless hospital-grade care coordination, compliance, and instant communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Feature 1: 24/7 Appointment Scheduling */}
            <div
              className={`p-6 sm:p-7 rounded-2xl border transition hover:-translate-y-1 duration-200 ${
                isDarkMode
                  ? 'bg-[#0e242f] border-slate-800 hover:border-teal-500/50'
                  : 'bg-slate-50 border-slate-200 hover:border-teal-400 shadow-xs'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold mb-2 text-slate-100">
                24/7 Appointment Scheduling
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Real-time doctor calendar availability, automated triage queue slotting, no-show predictive prevention, and SMS appointment confirmations.
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

            {/* Feature 2: Secure Electronic Medical Records (EMR) */}
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
              <h3 className="text-base font-bold mb-2 text-slate-100">
                Secure Electronic Medical Records (EMR)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                Longitudinal patient health summaries, vital sign trend tracking, diagnostic lab result archives, and encrypted e-prescriptions.
              </p>
              <button
                onClick={() => setActiveTab('login')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Access EMR portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Feature 3: Telehealth & Remote Consultations */}
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
              <h3 className="text-base font-bold mb-2 text-slate-100">
                Telehealth & Remote Consultations
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                High-definition remote video consultations, secure digital chat, drug allergy screening, and direct e-prescription pharmacy dispatch.
              </p>
              <button
                onClick={() => {
                  if (onOpenBookAppointment) onOpenBookAppointment();
                  else setActiveTab('appointments');
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Request teleconsultation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Specialized Hospital Departments */}
      <section
        id="departments"
        className={`py-16 border-t ${
          isDarkMode ? 'bg-[#091e28] border-slate-800/80' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
              Clinical Specializations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
              Hospital & Ambulatory Departments
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Comprehensive outpatient care, diagnostic pathology, and licensed specialist clinics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dept 1 */}
            <div
              className={`p-6 rounded-2xl border transition hover:border-teal-500/60 ${
                isDarkMode ? 'bg-[#0f2a36] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Internal & Preventive Medicine</h4>
                  <p className="text-[10px] text-teal-300 font-mono">Dept ID: MED-101</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Chronic illness management (Diabetes, Hypertension), executive health exams, and longitudinal primary care.
              </p>
              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-800 text-slate-400">
                <span>Lead: Dr. Sarah Lin, MD</span>
                <span className="text-emerald-400 font-semibold">Available Mon-Sat</span>
              </div>
            </div>

            {/* Dept 2 */}
            <div
              className={`p-6 rounded-2xl border transition hover:border-teal-500/60 ${
                isDarkMode ? 'bg-[#0f2a36] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Cardiovascular Medicine</h4>
                  <p className="text-[10px] text-rose-300 font-mono">Dept ID: CARD-202</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Electrocardiography (ECG), coronary assessment, echocardiograms, and preventive cardiovascular surveillance.
              </p>
              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-800 text-slate-400">
                <span>Lead: Dr. Marcus Vance, MD</span>
                <span className="text-emerald-400 font-semibold">Available Daily</span>
              </div>
            </div>

            {/* Dept 3 */}
            <div
              className={`p-6 rounded-2xl border transition hover:border-teal-500/60 ${
                isDarkMode ? 'bg-[#0f2a36] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Pathology & Diagnostics</h4>
                  <p className="text-[10px] text-amber-300 font-mono">Dept ID: LAB-303</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Full-spectrum automated hematology, HbA1c panels, lipid profiles, urinalysis, and rapid PCR molecular testing.
              </p>
              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-800 text-slate-400">
                <span>Lead: Dr. Arthur Chen, MD</span>
                <span className="text-emerald-400 font-semibold">24/7 Lab Operation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Philippine Security & Medical Encryption Trust Marks */}
      <section
        className={`py-10 border-t ${
          isDarkMode ? 'bg-[#0b1e27] border-slate-800' : 'bg-slate-100/60 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-teal-950/30 border border-teal-800/40">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Philippine Health Data Security & Encryption Standards</span>
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded font-mono">
                    RA 10173 NPC Compliant
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Adheres strictly to the National Privacy Commission (NPC) Data Privacy Act of 2012, Philippine Health Information Exchange (PHIE), and DOH/PhilHealth 256-bit AES cryptographic protocols.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-teal-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>PH Health Cloud 256-Bit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer
        id="contact"
        className={`py-12 border-t text-xs ${
          isDarkMode
            ? 'bg-[#07141b] border-slate-800/80 text-slate-400'
            : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <SmartClinicLogo className="w-7 h-7" />
                <span className="font-extrabold text-base text-white">SmartClinic</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Smart Clinic Healthcare System. Providing compassionate, continuous, and technology-driven patient care across the Philippines.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Clinical Portals</h5>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={handlePatientPortalClick} className="hover:text-teal-400 transition cursor-pointer">
                    Patient Health Portal
                  </button>
                </li>
                <li>
                  <button onClick={handleLoginClick} className="hover:text-teal-400 transition cursor-pointer">
                    Staff & Provider Sign In
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('appointments')} className="hover:text-teal-400 transition cursor-pointer">
                    Appointment Calendar
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Clinic Branches</h5>
              <p className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>BGC Taguig • Metro Manila</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Ayala Center • Makati City</span>
              </p>
              <p className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>IT Park • Cebu City</span>
              </p>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider">Emergency & Contact</h5>
              <p className="flex items-center gap-1.5 text-slate-400">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Hotline: (02) 8888-SMART (7627)</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Emergency 24/7 Hotline: Dial 911 or visit your nearest Smart Clinic Urgent Care.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 Smart Clinic Integrated Healthcare System. All rights reserved.</p>
            <p className="text-slate-500">
              Compliant with Republic Act No. 10173 • Philippine Health Information Exchange (PHIE)
            </p>
          </div>
        </div>
      </footer>

      {/* 6. Sticky Floating Action Button (FAB) in Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowSupportModal(!showSupportModal)}
          className="w-14 h-14 rounded-full bg-teal-400 hover:bg-teal-300 text-slate-950 shadow-xl shadow-teal-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer relative group"
          title="Immediate Clinic Support & FAQ"
        >
          {showSupportModal ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
          {/* Notification Ping */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-cyan-600 border-2 border-slate-950 animate-pulse" />
        </button>

        {/* Immediate Help & FAQ Chat Modal Popover */}
        {showSupportModal && (
          <div className="absolute bottom-16 right-0 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 text-xs text-slate-200 animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SmartClinicLogo className="w-6 h-6" />
                <div>
                  <h4 className="font-bold text-white text-xs">Smart Clinic Assistant</h4>
                  <p className="text-[10px] text-teal-400">Immediate Clinical Help & FAQs</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick FAQ Pills */}
            <div className="py-2.5 flex flex-wrap gap-1.5 border-b border-slate-800">
              <button
                onClick={() => {
                  setSupportChat((prev) => [
                    ...prev,
                    { sender: 'user', text: 'How do I schedule an appointment?' },
                    {
                      sender: 'bot',
                      text: 'Click "Book an appointment" on the home banner or select your doctor from the schedule card to choose a clinic slot.',
                    },
                  ]);
                }}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 cursor-pointer"
              >
                🗓️ How to book?
              </button>
              <button
                onClick={() => {
                  setSupportChat((prev) => [
                    ...prev,
                    { sender: 'user', text: 'Where is the patient portal?' },
                    {
                      sender: 'bot',
                      text: 'Click "Patient Portal" or the Login button at the top to access your medical records, test results, and prescriptions.',
                    },
                  ]);
                }}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 cursor-pointer"
              >
                🏥 Patient Portal
              </button>
              <button
                onClick={() => {
                  setSupportChat((prev) => [
                    ...prev,
                    { sender: 'user', text: 'Emergency contacts' },
                    {
                      sender: 'bot',
                      text: 'For emergency assistance, call our 24/7 hotline at (02) 8888-SMART or dial 911 immediately.',
                    },
                  ]);
                }}
                className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 cursor-pointer"
              >
                🚨 Emergency
              </button>
            </div>

            {/* Chat Body */}
            <div className="h-56 overflow-y-auto py-2 space-y-2.5 pr-1">
              {supportChat.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-teal-600 text-white rounded-br-xs'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendSupport} className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Ask about clinic services, hours..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
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
