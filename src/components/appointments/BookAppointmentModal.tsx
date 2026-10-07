import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { X, Calendar, Clock, User, Stethoscope } from 'lucide-react';

interface Props {
  initialPatientId?: string;
  onClose: () => void;
}

export const BookAppointmentModal: React.FC<Props> = ({ initialPatientId, onClose }) => {
  const { patients, users, addAppointment } = useClinic();

  const [selectedPatId, setSelectedPatId] = useState(initialPatientId || patients[0]?.id || '');
  const [selectedDocId, setSelectedDocId] = useState('usr-1');
  const [date, setDate] = useState('2026-10-06');
  const [time, setTime] = useState('14:30');
  const [duration, setDuration] = useState(30);
  const [department, setDepartment] = useState('Internal Medicine');
  const [type, setType] = useState<'In-Person' | 'Telehealth' | 'Follow-up' | 'Emergency'>('In-Person');
  const [reason, setReason] = useState('');
  const [room, setRoom] = useState('Room 302');

  const doctors = users.filter((u) => u.role === 'doctor');
  const selectedPatient = patients.find((p) => p.id === selectedPatId);
  const selectedDoctor = doctors.find((d) => d.id === selectedDocId);

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Schedule Clinical Appointment</h2>
              <p className="text-[11px] text-slate-500">Book visit with doctor availability slot</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {/* Patient Selection */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Patient Record *</label>
            <select
              value={selectedPatId}
              onChange={(e) => setSelectedPatId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              required
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.mrn}) - {p.age}y {p.gender}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Attending Physician *</label>
              <select
                value={selectedDocId}
                onChange={(e) => {
                  setSelectedDocId(e.target.value);
                  const doc = doctors.find((d) => d.id === e.target.value);
                  if (doc?.department) setDepartment(doc.department);
                }}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                required
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Visit Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="In-Person">In-Person Consultation</option>
                <option value="Follow-up">Chronic Disease Follow-up</option>
                <option value="Telehealth">Telehealth Video Call</option>
                <option value="Emergency">Urgent Care / Emergency</option>
              </select>
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Time Slot *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          {/* Room Allocation */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Room / Suite</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              placeholder="e.g. Room 302, Cardiology Suite 1"
            />
          </div>

          {/* Chief Reason for Visit */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Chief Reason for Encounter *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Follow-up on elevated fasting glucose and mild dizziness..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
