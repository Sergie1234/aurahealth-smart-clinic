import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Layers,
  BellRing,
  Stethoscope,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Volume2,
  ShieldAlert,
  ShieldCheck,
  Lock
} from 'lucide-react';

interface Props {
  onStartConsultation: (patientId: string) => void;
}

export const QueueManager: React.FC<Props> = ({ onStartConsultation }) => {
  const {
    appointments,
    updateAppointmentStatus,
    activeRole,
    selectPatient,
    setActiveTab,
  } = useClinic();

  const [lastCalled, setLastCalled] = useState<string | null>(null);

  // STRICT ACCESS CONTROL: Patient and Pharmacy roles are strictly unauthorized for Live Queue
  if (activeRole === 'patient' || activeRole === 'pharmacist' || (activeRole as string) === 'pharmacy') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 shadow-sm text-xs font-sans">
        <div className="w-12 h-12 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Access Restricted — Module Not Authorized
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The Live Queue and waiting room display is restricted to authorized outpatient reception and triage personnel.
          In accordance with RA 10173 and clinic security protocols, access is strictly blocked for your role.
        </p>
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Return to Authorized Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Today's active queue
  const queueList = appointments.filter(
    (a) => a.date === '2026-10-06' && a.status !== 'Cancelled' && a.status !== 'Completed'
  );

  const checkedInCount = queueList.filter((a) => a.status === 'Checked In').length;
  const inConsultCount = queueList.filter((a) => a.status === 'In Consultation').length;

  const handleCallPatient = (apt: typeof appointments[0]) => {
    setLastCalled(`Ticket ${apt.queueNumber}: ${apt.patientName} please proceed to ${apt.room || 'Room 302'}`);
    updateAppointmentStatus(apt.id, 'In Consultation');
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto text-xs font-sans pb-10">
      {/* Header and Queue Metrics */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Live Waiting Room & Queue</h1>
            <span className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              {checkedInCount} Patients Waiting
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Specific Task: Real-time outpatient reception queue, triage prioritization, room calling broadcast, and consultation progression.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 font-semibold">
            {inConsultCount} In Consultation
          </div>
        </div>
      </div>

      {/* Audit & Security Banner */}
      <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Triage Access Active: Patient arrival and room calling are tracked with automated queue number logs.</span>
        </div>
        <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-bold">
          TRIAGE ACCESS
        </span>
      </div>

      {/* Broadcast Calling Banner if triggered */}
      {lastCalled && (
        <div className="bg-teal-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-200 block">
                Public Announcement Active
              </span>
              <span className="font-bold text-sm">{lastCalled}</span>
            </div>
          </div>
          <button
            onClick={() => setLastCalled(null)}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Queue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Waiting to be called */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">
                Checked-In & Waiting ({checkedInCount})
              </h2>
            </div>
            <span className="text-[10px] text-slate-400">Order of Arrival</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {queueList
              .filter((a) => a.status === 'Checked In')
              .map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 font-extrabold flex items-center justify-center font-mono text-sm shrink-0">
                      {apt.queueNumber}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">{apt.patientName}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {apt.department} • Dr. {apt.doctorName}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">Arrived: {apt.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCallPatient(apt)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-xs"
                    >
                      <BellRing className="w-3.5 h-3.5" />
                      <span>Call Next</span>
                    </button>
                  </div>
                </div>
              ))}

            {checkedInCount === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Waiting room is currently clear.
              </div>
            )}
          </div>
        </div>

        {/* Currently in Consultation */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              <h2 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide">
                In Consultation Rooms ({inConsultCount})
              </h2>
            </div>
            <span className="text-[10px] text-slate-400">Active Consults</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {queueList
              .filter((a) => a.status === 'In Consultation')
              .map((apt) => (
                <div
                  key={apt.id}
                  className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-extrabold flex items-center justify-center font-mono text-sm shrink-0">
                      {apt.queueNumber}
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs">{apt.patientName}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {apt.department} • Room {apt.room || '302'}
                      </p>
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">Physician Active</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {activeRole === 'doctor' && (
                      <button
                        onClick={() => {
                          selectPatient(apt.patientId);
                          onStartConsultation(apt.patientId);
                        }}
                        className="px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Open SOAP</span>
                      </button>
                    )}
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Complete
                    </button>
                  </div>
                </div>
              ))}

            {inConsultCount === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active doctor consultations at this moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
