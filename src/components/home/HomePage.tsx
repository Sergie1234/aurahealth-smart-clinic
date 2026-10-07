import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Stethoscope,
  Calendar,
  Shield,
  Sparkles,
  Users,
  Clock,
  ChevronRight,
  HeartPulse,
  Building2,
  Phone,
  MapPin,
} from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';

interface Props {
  onOpenBookAppointment?: () => void;
}

const FEATURED_DOCTORS = [
  {
    name: 'Dr. Maria Cristina Reyes, MD',
    specialty: 'Internal Medicine & Endocrinology',
    license: 'MD-892410',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Dr. Juan Miguel Santos, MD',
    specialty: 'Cardiovascular Medicine',
    license: 'MD-741923',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
  },
];

export const HomePage: React.FC<Props> = ({ onOpenBookAppointment }) => {
  const { setActiveTab } = useClinic();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SmartClinicLogo className="w-9 h-9" />
            <div>
              <span className="font-black text-sm tracking-tight">AuraHealth</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">Smart Clinic · Philippines</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('login')}
              className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onOpenBookAppointment}
              className="px-4 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition shadow-sm cursor-pointer"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/40 via-transparent to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-200 text-[11px] font-bold mb-5">
            <Shield className="w-3.5 h-3.5" />
            Philippine Health Data Security & Encryption Standards · RA 10173
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight max-w-2xl">
            Modern outpatient care for every Filipino family
          </h1>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Book visits, view e-prescriptions, lab results, and receipts — all secured under National Privacy Commission guidelines and DOH-aligned clinic workflows.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onOpenBookAppointment}
              className="px-5 py-3 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer transition"
            >
              <Calendar className="w-4 h-4" />
              Schedule a Visit
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm flex items-center gap-2 border border-white/20 cursor-pointer transition"
            >
              <Stethoscope className="w-4 h-4" />
              Staff / Doctor Portal
            </button>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: Users, label: '5,200+ Patients Served' },
            { icon: Clock, label: 'Same-Day Queue' },
            { icon: HeartPulse, label: 'PhilHealth Ready' },
            { icon: Shield, label: 'AES-256 Encrypted' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured doctors */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">Our Attending Physicians</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Board-certified specialists practicing in Metro Manila & beyond</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURED_DOCTORS.map((doc) => (
            <div
              key={doc.license}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex gap-4 shadow-xs hover:shadow-md transition"
            >
              <img
                src={doc.image}
                alt={doc.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{doc.name}</h3>
                <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold mt-0.5">{doc.specialty}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">License {doc.license}</p>
                <button
                  onClick={onOpenBookAppointment}
                  className="mt-3 text-[11px] font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Book with this doctor <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Clinic Services</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-8">End-to-end outpatient workflows for patients and clinical staff</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Calendar, title: 'Appointments & Queue', desc: 'Online booking, digital check-in, and live waiting-room triage.' },
              { icon: Stethoscope, title: 'Consultation & EMR', desc: 'Longitudinal charts, e-prescriptions, and AI clinical decision support.' },
              { icon: Sparkles, title: 'Lab & Pharmacy', desc: 'Specimen tracking, result certification, and on-site dispensary.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SmartClinicLogo className="w-8 h-8" />
              <span className="font-black text-sm">AuraHealth Smart Clinic</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Outpatient management platform aligned with Philippine Health Data Security & Encryption Standards and the Data Privacy Act of 2012 (RA 10173).
            </p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
              <span>742 Mabini Street, Barangay San Antonio, Quezon City, Metro Manila</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>+63 2 8123 4567</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Mon–Sat · 8:00 AM – 6:00 PM</span>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">Compliance</p>
            <p>NPC Registration · DOH-PHIE ready · PhilHealth accredited workflows · GCash / Maya / Cash accepted</p>
          </div>
        </div>
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 AuraHealth Smart Clinic. All rights reserved.</span>
          <span className="font-mono">v3.2.3 · Philippine Health Data Security Standards</span>
        </div>
      </footer>
    </div>
  );
};
