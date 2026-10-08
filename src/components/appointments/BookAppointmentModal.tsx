import React, { useMemo, useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { X, Calendar, Lock } from 'lucide-react';

interface Props {
  initialPatientId?: string;
  onClose: () => void;
}

const fieldClass =
  'w-full p-2 rounded-lg text-xs border transition ' +
  'bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 ' +
  'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:placeholder:text-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500';

const labelClass =
  'font-semibold text-slate-700 dark:text-slate-200 block mb-1 text-xs';

export const BookAppointmentModal: React.FC<Props> = ({ initialPatientId, onClose }) => {
  const {
    patients,
    users,
    addAppointment,
    isAuthenticated,
    primaryRole,
    linkedPatientId,
    setActiveTab,
    setPendingBooking,
  } = useClinic();

  const isPatient = primaryRole === 'patient';
  const isStaff = primaryRole === 'staff' || primaryRole === 'doctor' || primaryRole === 'admin';

  const visiblePatients = useMemo(() => {
    if (isPatient && linkedPatientId) {
      return patients.filter((p) => p.id === linkedPatientId);
    }
    if (isStaff) return patients;
    return [];
  }, [patients, isPatient, isStaff, linkedPatientId]);

  const defaultPatId = initialPatientId && visiblePatients.some((p) => p.id === initialPatientId)
    ? initialPatientId
    : visiblePatients[0]?.id || '';

  const [selectedPatId, setSelectedPatId] = useState(defaultPatId);
  const [selectedDocId, setSelectedDocId] = useState('usr-1');
  const [date, setDate] = useState('2026-10-08');
  const [time, setTime] = useState('14:30');
  const [duration, setDuration] = useState(30);
  const [department, setDepartment] = useState('Internal Medicine');
  const [type, setType] = useState<'In-Person' | 'Telehealth' | 'Follow-up' | 'Emergency'>('In-Person');
  const [reason, setReason] = useState('');
  const [room, setRoom] = useState('Room 302');

  const doctors = users.filter((u) => u.role === 'doctor');
  const selectedPatient = patients.find((p) => p.id === selectedPatId);
  const selectedDoctor = doctors.find((d) => d.id === selectedDocId);

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Sign in required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
            Please sign in or create a patient account before scheduling an appointment. You will only see your own medical record.
          </p>
          <div className="mt-5 flex gap-2 justify-center">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingBooking(true);
                onClose();
                setActiveTab('login');
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
            >
              Sign in / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isPatient && visiblePatients.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 text-center">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No patient record linked to this account.</p>
          <button type="button" onClick={onClose} className="mt-4 px-4 py-2 bg-teal-600 text-white text-xs rounded-lg cursor-pointer">Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedDoctor) return;
    addAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.fullName,
      patientMrn: selectedPatient.mrn,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.department || department,
      date,
      time,
      durationMinutes: duration,
      reason: reason || 'Scheduled outpatient consultation',
      status: 'Scheduled',
      type,
      room,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Schedule Clinical Appointment</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isPatient ? 'Booking for your linked record only' : 'Staff booking — select patient record'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <label className={labelClass}>Patient Record *</label>
            {isPatient ? (
              <div className={`${fieldClass} flex items-center justify-between`}>
                <span>
                  {selectedPatient
                    ? `${selectedPatient.fullName} (MRN: ${selectedPatient.mrn}) — ${selectedPatient.age}y ${selectedPatient.gender}`
                    : 'No record'}
                </span>
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>
            ) : (
              <select required value={selectedPatId} onChange={(e) => setSelectedPatId(e.target.value)} className={fieldClass}>
                {visiblePatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (MRN: {p.mrn}) - {p.age}y {p.gender}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className={labelClass}>Attending Physician *</label>
            <select required value={selectedDocId} onChange={(e) => setSelectedDocId(e.target.value)} className={fieldClass}>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name} · {d.department || 'General'}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Visit Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={fieldClass}>
                <option value="In-Person">In-Person</option>
                <option value="Telehealth">Telehealth</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className={fieldClass} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Duration</label>
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={fieldClass}>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Room / Suite</label>
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} className={fieldClass} placeholder="e.g. Room 302" />
          </div>

          <div>
            <label className={labelClass}>Chief Reason for Encounter *</label>
            <textarea required rows={2} placeholder="e.g. Follow-up on elevated fasting glucose..." value={reason} onChange={(e) => setReason(e.target.value)} className={fieldClass} />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium cursor-pointer">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer">
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
