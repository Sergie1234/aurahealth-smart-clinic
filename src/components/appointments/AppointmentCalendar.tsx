import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Appointment, AppointmentStatus } from '../../types/clinic';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Lock,
  User,
  AlertCircle
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

  const isPatient = activeRole === 'patient';

  const [selectedDate, setSelectedDate] = useState('2026-10-06');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');

  // Reschedule state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [newReschedDate, setNewReschedDate] = useState('');
  const [newReschedTime, setNewReschedTime] = useState('10:00');

  const doctors = users.filter((u) => u.role === 'doctor');

  // Appointments are already strictly isolated in ClinicContext for patients;
  // apply date & status filters. For patients, allow viewing all their appointments or filtered by date.
  const [dateFilterActive, setDateFilterActive] = useState<boolean>(!isPatient);

  const filteredAppointments = appointments.filter((a) => {
    const matchesDate = dateFilterActive ? a.date === selectedDate : true;
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesDoctor = !isPatient && doctorFilter !== 'ALL' ? a.doctorId === doctorFilter : true;
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
    <div className="space-y-4 max-w-6xl mx-auto text-xs font-sans pb-10">
      {/* Page Task & Security Directive Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isPatient ? 'My Outpatient Appointments' : 'Clinical Appointment Management'}
            </h1>
            <span className="text-xs bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? 'Visit' : 'Visits'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isPatient
              ? 'Specific Task: View, book, reschedule, or cancel your personal outpatient appointments. All patient data is strictly isolated.'
              : 'Specific Task: Provider schedule oversight, visit confirmation, triage arrival tracking, and consultation initiation.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Strictly conditional: Shared queue links NEVER render for Patient */}
          {!isPatient && (
            <button
              onClick={() => setActiveTab('queue')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <span>Live Queue</span>
            </button>
          )}

          <button
            onClick={onOpenBookAppointment}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
        </div>
      </div>

      {/* Specific Privacy & Security Enforcement Notice */}
      <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {isPatient
              ? 'Data Privacy Enforced: You are viewing solely your verified appointments. Provider directories and other patient records are strictly blocked.'
              : 'HIPAA & RA 10173 Audit Active: Provider access to appointment records is logged with immutable timestamping.'}
          </span>
        </div>
        <span className="font-mono text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-bold">
          SECURE RLS
        </span>
      </div>

      {/* Filter Navigation */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Date Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
              setDateFilterActive(true);
            }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">
            <CalendarIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setDateFilterActive(true);
              }}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
              setDateFilterActive(true);
            }}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSelectedDate('2026-10-06');
              setDateFilterActive(true);
            }}
            className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
              dateFilterActive && selectedDate === '2026-10-06'
                ? 'bg-teal-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Today
          </button>

          {isPatient && (
            <button
              onClick={() => setDateFilterActive(false)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                !dateFilterActive
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All My Visits
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Checked In">Checked In</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Provider Directory Filter: STRICT CONDITIONAL RENDERING - NEVER rendered in DOM for Patient */}
          {!isPatient && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Doctor:</span>
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {isPatient ? 'No Scheduled Visits Found' : 'No Appointments on Selected Date'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
              {isPatient
                ? 'You have no outpatient appointments matching this filter. Click below to book an appointment.'
                : 'There are no patient bookings matching your filter parameters.'}
            </p>
            <button
              onClick={onOpenBookAppointment}
              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Outpatient Visit</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Time & Information */}
                <div className="flex items-start gap-4">
                  <div className="w-20 text-center py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0">
                    <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400 block font-mono">
                      {apt.time}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {apt.durationMinutes || 30} mins
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono block mt-1">
                      {apt.date}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {apt.patientName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">({apt.patientMrn})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(apt.status)}`}>
                        {apt.status}
                      </span>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {apt.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Reason: <span className="font-normal text-slate-600 dark:text-slate-400">{apt.reason}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Doctor: <strong className="text-slate-700 dark:text-slate-300">{apt.doctorName}</strong></span>
                      <span>•</span>
                      <span>Dept: {apt.department}</span>
                      <span>•</span>
                      <span>Location: {apt.room || 'Clinic Suite 302'}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center">
                  {/* Staff Clinical Workflow Buttons - STRICT CONDITIONAL RENDERING - NEVER rendered in DOM for Patient */}
                  {!isPatient && (
                    <>
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
                    </>
                  )}

                  {/* Reschedule & Cancel actions (available for Patient on their own visits and Staff) */}
                  {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        setReschedulingApt(apt);
                        setNewReschedDate(apt.date);
                        setNewReschedTime(apt.time);
                      }}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium transition cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 max-w-sm w-full text-xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Reschedule Appointment</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Visit with <strong>{reschedulingApt.doctorName}</strong> ({reschedulingApt.department})
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={newReschedDate}
                  onChange={(e) => setNewReschedDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">New Time</label>
                <input
                  type="time"
                  required
                  value={newReschedTime}
                  onChange={(e) => setNewReschedTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingApt(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium cursor-pointer"
                >
                  Close
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
