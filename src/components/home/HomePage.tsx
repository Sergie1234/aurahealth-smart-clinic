import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  Calendar,
  Clock,
  Stethoscope,
  Activity,
  FileText,
  Pill,
  Microscope,
  ShieldCheck,
  ArrowRight,
  Phone,
  MapPin,
  Building2,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  HeartPulse,
  UserCheck,
  Award,
  Users,
  Search,
  LogIn,
  Hospital,
  BadgeCheck
} from 'lucide-react';
import { INITIAL_USERS } from '../../data/mockData';

interface HomePageProps {
  onOpenBookAppointment?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenBookAppointment }) => {
  const { setActiveTab, appointments, patients, isAuthenticated, currentUser } = useClinic();

  const doctors = INITIAL_USERS.filter((u) => u.role === 'doctor');
  
  // Real-time queue calculations
  const activeInConsult = appointments.filter((a) => a.status === 'In Consultation').length;
  const waitingInQueue = appointments.filter((a) => a.status === 'Checked In').length;
  const totalToday = appointments.filter((a) => a.status !== 'Cancelled').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Banner / Announcement */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 text-white text-xs py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase">
              Notice
            </span>
            <span>Accredited with PhilHealth & Major HMOs • Data Privacy Act (RA 10173) Certified</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] opacity-90">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Mon - Sat: 8:00 AM - 6:00 PM
            </span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> Emergency Hotline: (02) 8888-7627 (SMART)
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SmartClinicLogo className="w-10 h-10" glow={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-700 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Smart Clinic
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold">
                Outpatient & Clinical Management
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#services" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Services</a>
            <a href="#specialties" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Clinical Specialties</a>
            <a href="#queue-status" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Live Queue</a>
            <a href="#portals" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Clinic Portals</a>
            <a href="#compliance" className="hover:text-teal-600 dark:hover:text-teal-400 transition">Privacy & Standards</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={() => setActiveTab('dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm transition cursor-pointer"
              >
                <span>My Dashboard</span>
                <span className="text-xs font-normal opacity-90 capitalize">({currentUser.role})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
                <button
                  onClick={onOpenBookAppointment}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-lg shadow-sm hover:shadow transition cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-teal-50/60 via-slate-50 to-white dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines & Action */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100/80 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Next-Gen Smart Outpatient Clinic Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Modern Outpatient Care, <br />
                <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                  Intelligent Clinical Flow.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Streamline patient consults, electronic health records (EMR), live triage queueing, 
                e-prescriptions, and diagnostic laboratory tracking — backed by Philippine Health Data 
                Security Standards (RA 10173).
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={onOpenBookAppointment}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Outpatient Appointment</span>
                </button>
                <button
                  onClick={() => setActiveTab('login')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm transition-all"
                >
                  <UserCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <span>Sign In to Clinic Portal</span>
                </button>
              </div>

              {/* Badges / Micro Proof */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">100%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Digital Health Records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">12 min</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Avg. Outpatient Wait</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">RA 10173</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Data Privacy Certified</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Status & Queue Snapshot Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Clinic Operations</span>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Open Now
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Waiting in Queue</span>
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {waitingInQueue} <span className="text-xs font-normal text-slate-500">patients</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>In Consultation</span>
                      <Activity className="w-3.5 h-3.5 text-cyan-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {activeInConsult} <span className="text-xs font-normal text-slate-500">active</span>
                    </div>
                  </div>
                </div>

                {/* Queue Snapshot Table */}
                <div className="space-y-2 mt-4">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Recent Outpatient Queue (Privacy Anonymized)
                  </div>
                  {appointments.slice(0, 3).map((apt, idx) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-1.5 py-0.5 rounded">
                          {apt.queueNumber || `Q-${101 + idx}`}
                        </span>
                        <div>
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            Ticket #{apt.queueNumber || `Q-${101 + idx}`}
                          </div>
                          <div className="text-[10px] text-slate-400">{apt.department} • {apt.time}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        apt.status === 'In Consultation'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : apt.status === 'Checked In'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Registered Today: {totalToday}</span>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>View Full Live Queue</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 md:py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Clinical Excellence
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Comprehensive Outpatient & Diagnostic Services
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-3">
              Full-service ambulatory care equipped with computerized health records, instant diagnostics, and integrated pharmacy dispensing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-teal-500/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Internal Medicine & Primary Care</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Comprehensive adult evaluations, chronic illness management (diabetes, hypertension), preventive wellness, and routine medical consultations.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Routine Medical Checkups</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Diabetic & Hypertensive Care</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-teal-500/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cardiovascular & Metabolic Care</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Cardiac risk assessments, 12-lead ECG, blood pressure monitoring, cholesterol profiling, and cardiovascular disease prevention.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Resting 12-Lead ECG</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Dyslipidemia Management</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-teal-500/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Diagnostic Pathology & Lab</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Complete Blood Count (CBC), Fasting Blood Sugar, HbA1c, Lipid Panels, Urinalysis, and rapid diagnostic panels with direct digital delivery.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Rapid Digital Results</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Direct EMR Integration</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-teal-500/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Clinic Pharmacy & E-Prescriptions</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Computerized physician order entry (CPOE) with instant drug-allergy and drug-interaction screening, and verified barcode dispensing.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> QR-Verifiable E-Prescriptions</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Automated Safety Checks</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-teal-500/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Medical Certificates & Clearances</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Fit-to-work examinations, school clearances, pre-employment checkups, and verified electronic medical certificates with anti-fraud signatures.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Anti-Fraud Digitally Signed</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Fast Same-Day Issuance</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-teal-500/50 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">PhilHealth & HMO Billing Support</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                Seamless claim processing for PhilHealth Konsulta members, Maxicare, Intellicare, Medicard, and major health maintenance organizations.
              </p>
              <ul className="text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Instant Eligibility Verification</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Itemized Official Receipts</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Clinical Specialties & Medical Staff Section (No Doctor Pictures/Assets) */}
      <section id="specialties" className="py-16 md:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Clinical Leadership & Governance
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Board-Certified Clinical Specialties
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-3">
              Licensed healthcare professionals and outpatient specialists practicing under strict Philippine medical board and RA 10173 data privacy protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {doctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-sm hover:shadow-md transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <div className="text-left space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                      {doc.department}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{doc.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{doc.specialty}</p>
                  <div className="text-[11px] text-slate-400 font-mono">
                    PRC License: {doc.licenseNumber || 'Active Clinical License'}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={onOpenBookAppointment}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 hover:underline cursor-pointer"
                    >
                      <span>Book Outpatient Visit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Portals Showcase */}
      <section id="portals" className="py-16 md:py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Role-Based Portals
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Dedicated Workspaces for Every Role
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-3">
              Secure, role-tailored interfaces ensuring confidentiality, operational efficiency, and rapid care delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Patient Portal Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-3">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Patient Portal</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Self-service booking, digital lab reports, prescription QR codes, and personal consultation history.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('login')}
                className="mt-6 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition"
              >
                Patient Access
              </button>
            </div>

            {/* Doctor Portal Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Physician Workspace</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Structured SOAP clinical notes, ICD diagnosis coding, lab requisitions, and instant prescription generation.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('login')}
                className="mt-6 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Physician Sign In
              </button>
            </div>

            {/* Staff / Nurse Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinical Staff & Triage</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Patient check-in, vitals measurement, live triage queue management, and pharmacy inventory handling.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('login')}
                className="mt-6 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                Staff Access
              </button>
            </div>

            {/* Admin Portal Card */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 mb-3">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Administrator</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Audit logs, user access permissions, billing oversight, predictive analytics, and system synchronization.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('login')}
                className="mt-6 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 transition"
              >
                Admin Sign In
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Compliance & Standards */}
      <section id="compliance" className="py-14 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 rounded-xl shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">RA 10173 Compliance</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Compliant with Philippine Data Privacy Act of 2012 for patient consent and health record security.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 rounded-xl shrink-0">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">End-to-End Audit Trail</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Every chart view, prescription write, and lab access is timestamped with user credentials.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Standard Clinical Coding</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    ICD-10 clinical diagnostic codes and international medication safety cross-referencing.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <SmartClinicLogo className="w-7 h-7" />
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Smart Clinic</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Outpatient Management & Intelligent Clinical Decision Support Platform.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2.5">Operating Hours</h5>
              <p className="text-xs">Monday to Saturday: 8:00 AM - 6:00 PM</p>
              <p className="text-xs mt-1">Sundays: Urgent Care Only (9:00 AM - 2:00 PM)</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2.5">Clinic Location</h5>
              <p className="text-xs flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-teal-600" /> Metro Manila Healthcare Hub</p>
              <p className="text-xs mt-1">Quezon City & Makati Satellite Clinics</p>
            </div>

            <div>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-2.5">Contact</h5>
              <p className="text-xs flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-teal-600" /> Trunkline: (02) 8888-7627 (SMART)</p>
              <p className="text-xs mt-1">Email: contact@smartclinic.ph</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div>
              © {new Date().getFullYear()} Smart Clinic. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Republic Act No. 10173</span>
              <span>•</span>
              <span>DOH Outpatient Standards</span>
              <span>•</span>
              <button
                onClick={() => setActiveTab('login')}
                className="text-teal-600 dark:text-teal-400 hover:underline"
              >
                Staff Portal
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
