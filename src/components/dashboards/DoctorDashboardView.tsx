import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Stethoscope,
  Calendar,
  Layers,
  FileText,
  Pill,
  Sparkles,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';

interface Props {
  onStartConsultation: (patientId: string) => void;
  onOpenBookAppointment?: () => void;
}

export const DoctorDashboardView: React.FC<Props> = ({
  onStartConsultation,
  onOpenBookAppointment,
}) => {
  const {
    currentUser,
    appointments,
    patients,
    consultations,
    prescriptions,
    setActiveTab,
  } = useClinic();

  const [searchPatient, setSearchPatient] = useState('');

  const activeQueue = appointments.filter(
    (a) => a.status === 'Checked In' || a.status === 'In Consultation'
  );

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchPatient.toLowerCase()) ||
      p.mrn.toLowerCase().includes(searchPatient.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs font-sans pb-12">
      {/* Doctor Header Hero */}
      <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-teal-800/40">
        <div className="flex items-center gap-4">
          <SmartClinicLogo className="w-14 h-14" glow={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40">
                Attending Physician Workspace
              </span>
              <span className="text-[10px] text-teal-300 font-mono">MD-892410</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-slate-300 text-xs mt-0.5">
              Department of Outpatient Medicine & Endocrinology. {activeQueue.length} patients ready in consultation triage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('consultations')}
            className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl font-bold flex items-center gap-2 transition shadow-md shadow-teal-500/20 cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Open Consultation Room</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 border border-white/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>AI Decision Support</span>
          </button>
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Patients Waiting in Triage</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{activeQueue.length}</p>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">Immediate Care Ready</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Scheduled Today</span>
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{appointments.length}</p>
          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">Clinic Appointments</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Consultations Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{consultations.length}</p>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">Care Encounters Documented</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Prescriptions Authored</span>
            <Pill className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{prescriptions.length}</p>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">e-Rx Formularies</span>
        </div>
      </div>

      {/* Main Clinical Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Live Consultation Queue</h3>
            </div>
            <span className="text-xs text-teal-700 dark:text-teal-400 font-semibold">{activeQueue.length} In Waiting</span>
          </div>

          <div className="space-y-3">
            {activeQueue.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">No patients currently in triage queue.</p>
            ) : (
              activeQueue.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm text-slate-900 dark:text-slate-100">{apt.patientName}</span>
                      <span className="font-mono text-xs font-bold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                        #{apt.queueNumber || 'Q-10'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                      Reason: <strong className="text-slate-900 dark:text-slate-100">{apt.reason}</strong>
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Check-in: {apt.time} • Scheduled with {apt.doctorName}
                    </p>
                  </div>

                  <button
                    onClick={() => onStartConsultation(apt.patientId)}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Begin Visit</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Patient Longitudinal EMR Chart</h3>
            </div>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name or MRN..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {filteredPatients.map((pat) => (
              <div
                key={pat.id}
                className="p-3 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/30 transition flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{pat.fullName}</h4>
                  <p className="text-slate-500 text-[11px] font-mono">
                    {pat.mrn} • Blood {pat.bloodType} • {pat.gender}
                  </p>
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold mt-0.5">
                    Allergies: {Array.isArray(pat.allergies) ? (pat.allergies.length ? pat.allergies.map((a: any) => typeof a === 'string' ? a : a.allergen).join(', ') : 'NKDA') : 'NKDA'}
                  </p>
                </div>

                <button
                  onClick={() => onStartConsultation(pat.id)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-400 hover:border-teal-500 cursor-pointer transition"
                  title="Open Clinical Chart"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
