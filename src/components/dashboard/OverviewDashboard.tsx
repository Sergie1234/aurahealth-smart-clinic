import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Users,
  Calendar,
  Clock,
  FlaskConical,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Pill,
  Sparkles
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';

interface Props {
  onStartConsultation?: (patientId: string) => void;
  onOpenBookAppointment?: () => void;
}

export const OverviewDashboard: React.FC<Props> = ({ onStartConsultation, onOpenBookAppointment }) => {
  const {
    activeRole,
    currentUser,
    patients,
    appointments,
    consultations,
    labOrders,
    inventory,
    invoices,
    setActiveTab,
    selectPatient,
    updateAppointmentStatus,
  } = useClinic();

  // Metrics
  const todayStr = '2026-10-06';
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const waitingPatients = appointments.filter((a) => a.status === 'Checked In' || a.status === 'In Consultation');
  const completedToday = appointments.filter((a) => a.status === 'Completed').length;
  const pendingLabs = labOrders.filter((l) => l.status === 'Requested' || l.status === 'Processing');
  const lowStockItems = inventory.filter((i) => i.stockQuantity <= i.reorderLevel);
  const nearExpiryItems = inventory.filter((i) => {
    const exp = new Date(i.expirationDate).getTime();
    const now = new Date(todayStr).getTime();
    const days = (exp - now) / (1000 * 3600 * 24);
    return days <= 30 && days >= 0;
  });

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const outstandingRevenue = invoices.filter((i) => i.status === 'Unpaid' || i.status === 'Partially Paid')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  return (
    <div className="space-y-6">
      {/* Welcome & Role Context Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/20 text-teal-300 font-semibold text-xs px-2.5 py-0.5 rounded-full border border-teal-500/30">
                Clinic Operational Dashboard
              </span>
              <span className="text-slate-400 text-xs">Tuesday, Oct 6, 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-2">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              {activeRole === 'doctor' && 'You have 3 patient consultations scheduled today. 1 patient is currently triaged and waiting.'}
              {activeRole === 'nurse' && '2 patients are currently in the waiting lobby awaiting vital sign triage and room placement.'}
              {activeRole === 'receptionist' && 'Today has 5 total booked appointments with 2 check-ins and 1 pending invoice collection.'}
              {activeRole === 'pharmacist' && 'Dispensary active: 1 low-stock medication and 1 batch expiring within 30 days require attention.'}
              {activeRole === 'lab_technician' && 'Pathology active: 2 sample panels currently under processing or awaiting certification.'}
              {activeRole === 'patient' && 'Access your personalized health records, diagnostic lab reports, and medication instructions.'}
              {activeRole === 'admin' && 'Clinic operations running smoothly. Overall patient volume is up 14% this month.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Ask AI Assistant</span>
            </button>
            {activeRole !== 'patient' && onOpenBookAppointment && (
              <button
                onClick={onOpenBookAppointment}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 transition cursor-pointer"
              >
                + Schedule Visit
              </button>
            )}
          </div>
        </div>

        {/* Subtle geometric bg decoration */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      </div>

      <AIDisclaimerBanner />

      {/* Predictive Analytics Integration Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-xl p-4 text-white shadow-xs border border-indigo-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-white">Predictive Health & Operational Risk Model</span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.2 rounded-full border border-emerald-500/30">
                Active Surveillance
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              2 patients flagged with elevated chronic deterioration risk • 1 high-probability appointment no-show • 1 medication approaching 5-day depletion buffer.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('predictive-analytics')}
          className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <span>View Predictive Analytics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Appointments */}
        <div
          onClick={() => setActiveTab('appointments')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Today's Visits</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{todayAppointments.length}</span>
            <span className="text-xs text-slate-500 font-medium">scheduled</span>
          </div>
          <div className="mt-2 text-[11px] text-teal-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{completedToday} completed today</span>
          </div>
        </div>

        {/* Card 2: Waiting Queue */}
        <div
          onClick={() => setActiveTab('queue')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Patients Waiting</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{waitingPatients.length}</span>
            <span className="text-xs text-amber-600 font-medium">in queue / triage</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Avg wait: 12 minutes</span>
          </div>
        </div>

        {/* Card 3: Pending Diagnostic Labs */}
        <div
          onClick={() => setActiveTab('laboratory')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Lab Tests</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{pendingLabs.length}</span>
            <span className="text-xs text-indigo-600 font-medium">in pathology</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>1 result certified today</span>
          </div>
        </div>

        {/* Card 4: Inventory / Revenue depending on role */}
        {activeRole === 'pharmacist' ? (
          <div
            onClick={() => setActiveTab('inventory')}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Stock Alerts</span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{lowStockItems.length + nearExpiryItems.length}</span>
              <span className="text-xs text-rose-600 font-medium">action needed</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              {lowStockItems.length} low stock, {nearExpiryItems.length} near expiry
            </div>
          </div>
        ) : (
          <div
            onClick={() => setActiveTab('billing')}
            className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-teal-500/50 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Revenue (Collected)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(0)}</span>
              <span className="text-xs text-slate-500 font-medium">collected</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              ${outstandingRevenue.toFixed(0)} pending payment
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Workflow Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Queue & Action Center */}
        <div className="lg:col-span-2 space-y-6">
          {/* Waiting Room & Queue Status */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-600" />
                <h2 className="font-bold text-slate-800 text-sm">Today's Appointment Queue</h2>
                <span className="text-xs font-medium text-slate-400">({todayAppointments.length} total)</span>
              </div>
              <button
                onClick={() => setActiveTab('queue')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {todayAppointments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No appointments scheduled for today.
                </div>
              ) : (
                todayAppointments.map((apt) => {
                  const patient = patients.find((p) => p.id === apt.patientId);
                  const isWaiting = apt.status === 'Checked In';
                  const isInConsult = apt.status === 'In Consultation';

                  return (
                    <div
                      key={apt.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 font-bold text-xs flex flex-col items-center justify-center text-slate-700 shrink-0 border border-slate-200">
                          <span className="text-[10px] text-slate-400">TICKET</span>
                          <span className="text-teal-700 font-extrabold">{apt.queueNumber || 'N/A'}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              onClick={() => {
                                selectPatient(apt.patientId);
                                setActiveTab('patients');
                              }}
                              className="font-bold text-slate-900 text-xs hover:text-teal-600 cursor-pointer"
                            >
                              {apt.patientName}
                            </span>
                            <span className="text-[11px] text-slate-400">{apt.patientMrn}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                apt.status === 'In Consultation'
                                  ? 'bg-blue-100 text-blue-700 animate-pulse'
                                  : apt.status === 'Checked In'
                                  ? 'bg-amber-100 text-amber-700'
                                  : apt.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{apt.reason}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span>Time: {apt.time}</span>
                            <span>•</span>
                            <span>Physician: {apt.doctorName}</span>
                            <span>•</span>
                            <span>{apt.room || 'Waiting Lounge'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {isWaiting && (
                          <button
                            onClick={() => {
                              updateAppointmentStatus(apt.id, 'In Consultation');
                              if (onStartConsultation) onStartConsultation(apt.patientId);
                              else setActiveTab('consultations');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Call to Consult</span>
                          </button>
                        )}
                        {isInConsult && (
                          <button
                            onClick={() => {
                              selectPatient(apt.patientId);
                              setActiveTab('consultations');
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition cursor-pointer"
                          >
                            Open Consultation
                          </button>
                        )}
                        {apt.status === 'Scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                            className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            Check-in
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Shortcuts & Department Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-800 text-xs">Recent Consultations</span>
                <button
                  onClick={() => setActiveTab('emr')}
                  className="text-[11px] font-semibold text-teal-600 hover:text-teal-800 cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2.5">
                {consultations.slice(0, 3).map((cons) => (
                  <div
                    key={cons.id}
                    onClick={() => {
                      selectPatient(cons.patientId);
                      setActiveTab('emr');
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-xs text-slate-900">{cons.patientName}</p>
                      <span className="text-[10px] text-slate-400">{cons.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                      {cons.chiefComplaint}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                        {cons.diagnoses[0]?.code}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">{cons.diagnoses[0]?.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-800 text-xs">Active Prescriptions</span>
                <button
                  onClick={() => setActiveTab('prescriptions')}
                  className="text-[11px] font-semibold text-teal-600 hover:text-teal-800 cursor-pointer"
                >
                  View All
                </button>
              </div>
              <div className="space-y-2.5">
                {inventory.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 text-xs">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.category} • Batch: {item.batchNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${item.stockQuantity <= item.reorderLevel ? 'text-rose-600' : 'text-slate-700'}`}>
                        {item.stockQuantity}
                      </span>
                      <p className="text-[10px] text-slate-400">{item.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Teaser & Pharmacy Alerts */}
        <div className="space-y-6">
          {/* AI Clinical Decision Support Assistant Card */}
          <div className="bg-gradient-to-br from-teal-50 via-teal-100/40 to-emerald-50 rounded-xl border border-teal-200/80 p-4 shadow-xs">
            <div className="flex items-center gap-2 text-teal-800 mb-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-xs uppercase tracking-wider">AI Medical & Ops Assistant</span>
            </div>
            <p className="text-xs text-teal-900 leading-relaxed">
              Powered by Google Gemini. Instantly summarize complex patient histories, verify drug-drug interactions, draft structured SOAP notes, and interpret lab panels.
            </p>

            <div className="mt-3 space-y-1.5">
              <button
                onClick={() => setActiveTab('ai-assistant')}
                className="w-full text-left text-[11px] p-2 bg-white/80 hover:bg-white rounded-lg border border-teal-200/60 text-slate-700 transition flex items-center justify-between cursor-pointer"
              >
                <span>"Summarize Eleanor Vance's recent lab results"</span>
                <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
              </button>
              <button
                onClick={() => setActiveTab('ai-assistant')}
                className="w-full text-left text-[11px] p-2 bg-white/80 hover:bg-white rounded-lg border border-teal-200/60 text-slate-700 transition flex items-center justify-between cursor-pointer"
              >
                <span>"Check drug interactions for Lisinopril + Metformin"</span>
                <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
              </button>
              <button
                onClick={() => setActiveTab('ai-assistant')}
                className="w-full text-left text-[11px] p-2 bg-white/80 hover:bg-white rounded-lg border border-teal-200/60 text-slate-700 transition flex items-center justify-between cursor-pointer"
              >
                <span>"Show patients requiring follow-up this week"</span>
                <ArrowRight className="w-3 h-3 text-teal-600 shrink-0" />
              </button>
            </div>

            <button
              onClick={() => setActiveTab('ai-assistant')}
              className="mt-3.5 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition text-center shadow-xs cursor-pointer"
            >
              Launch AI Assistant Chat
            </button>
          </div>

          {/* Pharmacy & Stock Alerts */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-xs text-slate-800">Pharmacy Warnings</span>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-[11px] font-semibold text-teal-600 hover:text-teal-800 cursor-pointer"
              >
                Manage
              </button>
            </div>

            {lowStockItems.length === 0 && nearExpiryItems.length === 0 ? (
              <p className="text-xs text-slate-500">All medications within normal safety stock levels.</p>
            ) : (
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-xs flex items-start gap-2 text-rose-900"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-[11px]">{item.name}</p>
                      <p className="text-[10px] text-rose-700">
                        Low Stock: {item.stockQuantity} remaining (Reorder: {item.reorderLevel})
                      </p>
                    </div>
                  </div>
                ))}

                {nearExpiryItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs flex items-start gap-2 text-amber-900"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-[11px]">{item.name}</p>
                      <p className="text-[10px] text-amber-700">
                        Near Expiry: {item.expirationDate} (Batch {item.batchNumber})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
