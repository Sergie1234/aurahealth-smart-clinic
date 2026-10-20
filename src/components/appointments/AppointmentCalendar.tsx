import React, { useState, useMemo } from 'react';
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
  AlertCircle,
  History,
  CalendarCheck,
  CalendarDays,
  Filter,
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
  const todayStr = '2026-10-06'; // Clinic standard reference date

  // View & Filter States
  const [selectedDate, setSelectedDate] = useState<string>(''); // empty string means all dates visible
  const [timeframeFilter, setTimeframeFilter] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [doctorFilter, setDoctorFilter] = useState<string>('ALL');
  const [showMonthGrid, setShowMonthGrid] = useState<boolean>(true);

  // Calendar monthly navigation: defaults to October 2026
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date(2026, 9, 1));

  // Reschedule state
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [newReschedDate, setNewReschedDate] = useState('');
  const [newReschedTime, setNewReschedTime] = useState('10:00');

  const doctors = users.filter((u) => u.role === 'doctor');

  // Helper to determine whether an appointment is Past
  const isPastAppointment = (apt: Appointment): boolean => {
    return apt.date < todayStr || apt.status === 'Completed';
  };

  // Month navigation helpers
  const prevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar Monthly Grid Generation
  const calendarGrid = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isToday: boolean;
      isPastDate: boolean;
      dayAppointments: Appointment[];
      hasUpcoming: boolean;
      hasPast: boolean;
    }> = [];

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = dateString === todayStr;
      const isPastDate = dateString < todayStr;

      // Filter appointments on this day
      const dayAppointments = appointments.filter((a) => a.date === dateString);
      const hasUpcoming = dayAppointments.some((a) => !isPastAppointment(a));
      const hasPast = dayAppointments.some((a) => isPastAppointment(a));

      days.push({
        dateString,
        dayNumber: day,
        isToday,
        isPastDate,
        dayAppointments,
        hasUpcoming,
        hasPast,
      });
    }

    return { firstDayIndex, days };
  }, [calendarMonth, appointments]);

  // Overall counts for summary
  const upcomingCount = useMemo(
    () => appointments.filter((a) => !isPastAppointment(a)).length,
    [appointments]
  );
  const pastCount = useMemo(
    () => appointments.filter((a) => isPastAppointment(a)).length,
    [appointments]
  );

  // Filtered appointments list
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        // Date filter
        const matchesDate = selectedDate ? a.date === selectedDate : true;

        // Timeframe filter (Upcoming vs Past vs All)
        const isPast = isPastAppointment(a);
        const matchesTimeframe =
          timeframeFilter === 'ALL'
            ? true
            : timeframeFilter === 'PAST'
            ? isPast
            : !isPast;

        // Status filter
        const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;

        // Doctor filter (staff only)
        const matchesDoctor =
          !isPatient && doctorFilter !== 'ALL' ? a.doctorId === doctorFilter : true;

        return matchesDate && matchesTimeframe && matchesStatus && matchesDoctor;
      })
      .sort((a, b) => {
        // Sort descending by date so most relevant are easy to view
        const dateA = `${a.date} ${a.time}`;
        const dateB = `${b.date} ${b.time}`;
        return dateB.localeCompare(dateA);
      });
  }, [appointments, selectedDate, timeframeFilter, statusFilter, doctorFilter, isPatient]);

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'In Consultation':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 animate-pulse';
      case 'Checked In':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      case 'Confirmed':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      case 'No Show':
        return 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
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
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              ? 'View, book, reschedule, or cancel your personal outpatient appointments. Both upcoming and past visits are displayed with clear distinction.'
              : 'Specific Task: Provider schedule oversight, visit confirmation, triage arrival tracking, and consultation initiation.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isPatient && (
            <button
              onClick={() => setActiveTab('queue')}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
            >
              <span>Live Queue</span>
            </button>
          )}

          <button
            onClick={() => setShowMonthGrid(!showMonthGrid)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              showMonthGrid
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{showMonthGrid ? 'Hide Calendar' : 'Show Calendar'}</span>
          </button>

          <button
            onClick={onOpenBookAppointment}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer transition"
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
              ? 'Data Privacy Enforced: You are viewing solely your verified appointments. Provider directories and other patient records are strictly isolated.'
              : 'HIPAA & RA 10173 Audit Active: Provider access to appointment records is logged with immutable timestamping.'}
          </span>
        </div>
        <span className="font-mono text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-bold">
          SECURE RLS
        </span>
      </div>

      {/* Monthly Interactive Calendar View */}
      {showMonthGrid && (
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          {/* Calendar Header with Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-300 flex items-center justify-center font-bold">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Select a date to inspect visits or view all dates below
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Legend */}
              <div className="hidden sm:flex items-center gap-3 text-[11px] mr-2">
                <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  Upcoming Visit
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500"></span>
                  Past Visit
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCalendarMonth(new Date(2026, 9, 1));
                    setSelectedDate(todayStr);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Current
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Monthly Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Leading padding */}
            {Array.from({ length: calendarGrid.firstDayIndex }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-16 sm:h-20 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 border border-transparent"
              />
            ))}

            {calendarGrid.days.map((dayItem) => {
              const isSelected = selectedDate === dayItem.dateString;
              const hasApts = dayItem.dayAppointments.length > 0;

              return (
                <button
                  key={dayItem.dateString}
                  type="button"
                  onClick={() => {
                    if (selectedDate === dayItem.dateString) {
                      setSelectedDate(''); // toggle off date filter
                    } else {
                      setSelectedDate(dayItem.dateString);
                    }
                  }}
                  className={`h-16 sm:h-20 rounded-xl p-1 sm:p-1.5 flex flex-col justify-between items-start transition border text-left cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 ring-2 ring-teal-400'
                      : dayItem.isToday
                      ? 'bg-teal-50/30 dark:bg-teal-950/20 border-teal-300 dark:border-teal-700'
                      : hasApts
                      ? dayItem.hasUpcoming
                        ? 'bg-white dark:bg-slate-800/90 border-teal-200 dark:border-teal-900/60 hover:border-teal-400'
                        : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-400'
                      : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'text-teal-700 dark:text-teal-300'
                          : dayItem.isToday
                          ? 'text-teal-600 dark:text-teal-400 font-extrabold'
                          : dayItem.isPastDate
                          ? 'text-slate-400 dark:text-slate-500'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dayItem.dayNumber}
                    </span>

                    {dayItem.isToday && (
                      <span className="text-[9px] font-bold px-1 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Day Appointment Indicator Tags */}
                  <div className="w-full space-y-0.5 mt-auto">
                    {dayItem.hasUpcoming && (
                      <div className="text-[9px] font-bold px-1 py-0.5 rounded bg-teal-500 text-white flex items-center justify-between truncate shadow-2xs">
                        <span className="truncate">Upcoming</span>
                        <span className="text-[8px] opacity-90">
                          {dayItem.dayAppointments.filter((a) => !isPastAppointment(a)).length}
                        </span>
                      </div>
                    )}
                    {dayItem.hasPast && (
                      <div className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-between truncate">
                        <span className="truncate">Past Visit</span>
                        <span className="text-[8px] opacity-80">
                          {dayItem.dayAppointments.filter((a) => isPastAppointment(a)).length}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Navigation & Timeframe Tabs */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Timeframe Tabs: All, Upcoming, Past */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTimeframeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              timeframeFilter === 'ALL'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>All Visits</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {appointments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTimeframeFilter('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              timeframeFilter === 'UPCOMING'
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Upcoming</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTimeframeFilter('PAST')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              timeframeFilter === 'PAST'
                ? 'bg-slate-700 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Appointments</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {pastCount}
            </span>
          </button>
        </div>

        {/* Date Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedDate && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 rounded-lg text-xs font-semibold border border-teal-200 dark:border-teal-800">
              <span>Date: {selectedDate}</span>
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="hover:text-teal-900 dark:hover:text-white cursor-pointer ml-1 font-bold"
                title="Clear date filter"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-xl">
            <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            />
          </div>

          {selectedDate && (
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium transition cursor-pointer"
            >
              Show All Dates
            </button>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
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

          {/* Doctor filter (Provider / Staff only) */}
          {!isPatient && (
            <div className="flex items-center gap-1.5">
              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer font-medium"
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

      {/* Appointments List Display (Upcoming & Past clearly marked) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {isPatient ? 'No Appointments Found' : 'No Appointments Matching Filter'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mx-auto">
              {isPatient
                ? 'No appointments found for the selected timeframe. You can book a new consultation or view all your appointments above.'
                : 'There are no patient bookings matching your current filter parameters.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {(selectedDate || timeframeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSelectedDate('');
                    setTimeframeFilter('ALL');
                    setStatusFilter('ALL');
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs transition cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={onOpenBookAppointment}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm cursor-pointer transition"
              >
                <Plus className="w-4 h-4" />
                <span>Book Outpatient Visit</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAppointments.map((apt) => {
              const isPast = isPastAppointment(apt);

              return (
                <div
                  key={apt.id}
                  className={`p-4 transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPast
                      ? 'border-l-4 border-l-slate-400 dark:border-l-slate-600 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      : 'border-l-4 border-l-teal-500 bg-white dark:bg-slate-900 hover:bg-teal-50/30 dark:hover:bg-teal-950/20'
                  }`}
                >
                  {/* Left: Time & Information */}
                  <div className="flex items-start gap-4">
                    {/* Date & Time Block */}
                    <div
                      className={`w-24 text-center py-2.5 px-1.5 rounded-2xl border shrink-0 ${
                        isPast
                          ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          : 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300'
                      }`}
                    >
                      <span className="text-sm font-extrabold block font-mono">
                        {apt.time}
                      </span>
                      <span className="text-[11px] font-semibold block mt-0.5 font-mono">
                        {apt.date}
                      </span>
                      <span className="text-[9px] opacity-75 block mt-0.5">
                        {apt.durationMinutes || 30} mins
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {/* Past / Upcoming Label & Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Clear Past vs Upcoming Badge */}
                        {isPast ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                            <History className="w-3 h-3 text-slate-500" />
                            <span>Past Appointment</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1 shadow-2xs">
                            <CalendarCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                            <span>Upcoming Appointment</span>
                          </span>
                        )}

                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {apt.patientName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({apt.patientMrn})
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            apt.status
                          )}`}
                        >
                          {apt.status}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            apt.type === 'Emergency'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {apt.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        Reason:{' '}
                        <span className="font-normal text-slate-600 dark:text-slate-400">
                          {apt.reason}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>
                          Doctor:{' '}
                          <strong className="text-slate-700 dark:text-slate-300">
                            {apt.doctorName}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>Dept: {apt.department}</span>
                        <span>•</span>
                        <span>Location: {apt.room || 'Clinic Suite 302'}</span>
                        {apt.queueNumber && (
                          <>
                            <span>•</span>
                            <span>
                              Queue:{' '}
                              <strong className="text-teal-600 dark:text-teal-400 font-mono">
                                {apt.queueNumber}
                              </strong>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center">
                    {/* Staff Clinical Workflow Buttons */}
                    {!isPatient && (
                      <>
                        {apt.status === 'Scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')}
                            className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:hover:bg-teal-900/80 dark:text-teal-300 rounded-lg font-semibold text-[11px] border border-teal-200 dark:border-teal-800 transition cursor-pointer"
                          >
                            Confirm
                          </button>
                        )}

                        {(apt.status === 'Scheduled' || apt.status === 'Confirmed') && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-300 rounded-lg font-semibold text-[11px] border border-amber-200 dark:border-amber-800 transition cursor-pointer"
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

                    {/* Reschedule & Cancel actions (available for upcoming visits) */}
                    {!isPast && apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                      <>
                        <button
                          onClick={() => {
                            setReschedulingApt(apt);
                            setNewReschedDate(apt.date);
                            setNewReschedTime(apt.time);
                          }}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-medium transition cursor-pointer"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'Cancelled')}
                          className="px-2.5 py-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg text-[11px] font-medium transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {/* For past appointments: show completed/review label */}
                    {isPast && (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 italic">
                        Archived in EMR
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 max-w-sm w-full text-xs space-y-3 font-sans animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Reschedule Appointment
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Visit with <strong>{reschedulingApt.doctorName}</strong> ({reschedulingApt.department})
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  required
                  value={newReschedDate}
                  onChange={(e) => setNewReschedDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  New Time
                </label>
                <input
                  type="time"
                  required
                  value={newReschedTime}
                  onChange={(e) => setNewReschedTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingApt(null)}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium cursor-pointer transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold cursor-pointer shadow-sm transition"
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
