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
  Volume2
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
    <div className="space-y-4">
      {/* Header and Queue Metrics */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Live Waiting Room & Queue</h1>
            <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
              {checkedInCount} Patients Waiting
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time outpatient reception queue, triage prioritization, and consultation calling display.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-semibold">
            {inConsultCount} In Consultation
          </div>
        </div>
      </div>

      {/* Broadcast Calling Banner if triggered */}
      {lastCalled && (
        <div className="bg-teal-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-teal-200">Public Display Broadcast</p>
              <p className="text-sm font-extrabold">{lastCalled}</p>
            </div>
          </div>
          <button
            onClick={() => setLastCalled(null)}
            className="text-xs bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg font-semibold cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {queueList.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-400">
            Waiting room is currently clear. No patients waiting in queue.
          </div>
        ) : (
          queueList.map((apt) => {
            const isWaiting = apt.status === 'Checked In';
            const isInConsult = apt.status === 'In Consultation';
            const isScheduled = apt.status === 'Scheduled' || apt.status === 'Confirmed';

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-xl border p-4 shadow-xs transition space-y-3 relative overflow-hidden ${
                  isInConsult
                    ? 'border-blue-300 ring-2 ring-blue-500/20 bg-blue-50/20'
                    : isWaiting
                    ? 'border-amber-300 ring-1 ring-amber-500/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Status accent bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isInConsult ? 'bg-blue-600' : isWaiting ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 font-extrabold text-sm text-teal-800 flex items-center justify-center">
                      {apt.queueNumber || 'Q'}
                    </div>
                    <div>
                      <h3
                        onClick={() => {
                          selectPatient(apt.patientId);
                          setActiveTab('patients');
                        }}
                        className="font-bold text-slate-900 text-xs hover:text-teal-600 cursor-pointer"
                      >
                        {apt.patientName}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">{apt.patientMrn}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isInConsult
                        ? 'bg-blue-100 text-blue-700'
                        : isWaiting
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg text-slate-600 text-[11px] space-y-1">
                  <p className="line-clamp-1 font-medium">{apt.reason}</p>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Slot: {apt.time} ({apt.durationMinutes}m)</span>
                    <span className="font-semibold text-slate-700">{apt.room || 'Room 302'}</span>
                  </div>
                  <p className="text-[10px] text-teal-700 font-medium">Physician: {apt.doctorName}</p>
                </div>

                {/* Queue Action Controls */}
                <div className="pt-1 flex items-center justify-between gap-2 text-xs">
                  {isScheduled && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                      className="w-full py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-lg text-xs border border-amber-200 transition cursor-pointer"
                    >
                      Check-In to Queue
                    </button>
                  )}

                  {isWaiting && (
                    <>
                      <button
                        onClick={() => handleCallPatient(apt)}
                        className="flex-1 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer shadow-xs"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Call to Room</span>
                      </button>
                      <button
                        onClick={() => {
                          updateAppointmentStatus(apt.id, 'In Consultation');
                          onStartConsultation(apt.patientId);
                        }}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition cursor-pointer"
                        title="Enter Consultation Suite"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {isInConsult && (
                    <>
                      <button
                        onClick={() => onStartConsultation(apt.patientId)}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>In Room (Open)</span>
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
                        title="Complete Encounter"
                      >
                        Done
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
