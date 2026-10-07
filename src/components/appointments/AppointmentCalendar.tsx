import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus } from '../../types/clinic';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  PlayCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle
} from 'lucide-react';

interface Props {
  onOpenBookAppointment: () => void;
  onStartConsultation: (patientId: string) => void;
}

export const AppointmentCalendar: React.FC<Props> = ({
  onOpenBookAppointment,
  onStartConsultation,
}) => {
  const {
    appointments,
    updateAppointmentStatus,
    rescheduleAppointment,
    users,
    activeRole,
    currentUser,
    selectPatient,
    setActiveTab,
  } = useClinic();

  const [selectedDate, setSelectedDate] = useState('2026-10-06');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');

  // Reschedule state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [newReschedDate, setNewReschedDate] = useState('');
  const [newReschedTime, setNewReschedTime] = useState('10:00');

  const doctors = users.filter((u) => u.role === 'doctor');

  // Filter appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesDate = a.date === selectedDate;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesDoctor = doctorFilter === 'ALL' || a.doctorId === doctorFilter;
    return matchesDate && matchesStatus && matchesDoctor;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'In Consultation':
        return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
      case 'Checked In':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Confirmed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'No Show':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (reschedulingApt && newReschedDate) {
      rescheduleAppointment(reschedulingApt.id, newReschedDate, newReschedTime);
      setReschedulingApt(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Appointment Management</h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
              {filteredAppointments.length} for Selected Date
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule visits, track live patient check-ins, manage room placements, and monitor consultation status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeRole !== 'patient' && (
            <button
              onClick={() => setActiveTab('queue')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Live Queue</span>
            </button>
          )}

          <button
            onClick={onOpenBookAppointment}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Date & Filter Navigation */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <CalendarIcon className="w-4 h-4 text-teal-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate('2026-10-06')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
              selectedDate === '2026-10-06' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Today
          </button>
        </div>

        {/* Status and Doctor Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Doctor:</span>
            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appointment List / Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">No appointments scheduled for {selectedDate}</p>
            <p>Try picking another date or click "Book Appointment" to schedule a visit.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                {/* Left: Time & Ticket Badge */}
                <div className="flex items-start gap-3.5">
                  <div className="w-14 text-center shrink-0">
                    <span className="text-sm font-extrabold text-slate-900 block">{apt.time}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">{apt.durationMinutes} mins</span>
                    {apt.queueNumber && (
                      <span className="mt-1 inline-block bg-teal-50 text-teal-700 font-extrabold px-1.5 py-0.2 rounded border border-teal-200 text-[10px]">
                        {apt.queueNumber}
                      </span>
                    )}
                  </div>

                  {/* Middle: Patient & Doctor Info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          selectPatient(apt.patientId);
                          setActiveTab('patients');
                        }}
                        className="font-bold text-slate-900 text-xs hover:text-teal-600 transition cursor-pointer"
                      >
                        {apt.patientName}
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">({apt.patientMrn})</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {apt.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      Reason: <span className="font-normal text-slate-600">{apt.reason}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>Doctor: <strong className="text-slate-700">{apt.doctorName}</strong></span>
                      <span>•</span>
                      <span>Dept: {apt.department}</span>
                      <span>•</span>
                      <span>Location: {apt.room || 'Clinic Suite'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center">
                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')}
                      className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg font-semibold text-[11px] border border-teal-200 transition cursor-pointer"
                    >
                      Confirm
                    </button>
                  )}

                  {(apt.status === 'Scheduled' || apt.status === 'Confirmed') && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-semibold text-[11px] border border-amber-200 transition cursor-pointer"
                    >
                      Check-In
                    </button>
                  )}

                  {apt.status === 'Checked In' && activeRole === 'doctor' && (
                    <button
                      onClick={() => {
                        updateAppointmentStatus(apt.id, 'In Consultation');
                        onStartConsultation(apt.patientId);
                      }}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-xs"
                    >
                      <Stethoscope className="w-3 h-3" />
                      <span>Start Consult</span>
                    </button>
                  )}

                  {apt.status === 'In Consultation' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  )}

                  {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        setReschedulingApt(apt);
                        setNewReschedDate(apt.date);
                        setNewReschedTime(apt.time);
                      }}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition cursor-pointer"
                    >
                      Reschedule
                    </button>
                  )}

                  {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                      className="px-2 py-1 hover:bg-rose-50 text-rose-600 hover:text-rose-800 rounded-lg text-[11px] font-medium transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-sm w-full text-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Reschedule Appointment</h3>
            <p className="text-slate-500">
              Patient: <strong>{reschedulingApt.patientName}</strong> with {reschedulingApt.doctorName}
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={newReschedDate}
                  onChange={(e) => setNewReschedDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Time</label>
                <input
                  type="time"
                  required
                  value={newReschedTime}
                  onChange={(e) => setNewReschedTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingApt(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Save Reschedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
