import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Calendar,
  Pill,
  FlaskConical,
  Receipt,
  QrCode,
  Printer,
  ChevronRight,
  Heart,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { formatPeso } from '../../utils/currency';

interface Props {
  onOpenBookAppointment?: () => void;
  onOpenQR?: () => void;
  onOpenLabReport?: (lab: any) => void;
  onOpenPrescription?: (rx: any) => void;
}

export const PatientDashboardView: React.FC<Props> = ({
  onOpenBookAppointment,
  onOpenQR,
  onOpenLabReport,
  onOpenPrescription,
}) => {
  const { patients, appointments, prescriptions, labOrders, invoices, linkedPatientId, currentUser } = useClinic();

  // Active patient (logged-in portal patient)
  const patient =
    patients.find((p) => p.id === linkedPatientId) ||
    patients.find((p) => p.email.toLowerCase() === currentUser.email?.toLowerCase()) ||
    patients[0] || {
      id: 'pat-1',
      mrn: 'MRN-2026-081',
      fullName: 'Elena Vargas',
      dob: '1978-04-12',
      age: 48,
      gender: 'Female' as const,
      bloodType: 'A+' as const,
      phone: '+63 917 823 4410',
      email: 'elena.vargas@example.com',
      allergies: [{ allergen: 'Penicillin', severity: 'severe' as const, reaction: 'Anaphylaxis' }],
      chronicConditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension'],
    };

  const patientAppointments = appointments.filter((a) => a.patientId === patient.id || a.patientName === patient.fullName);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patient.id || p.patientName === patient.fullName);
  const patientLabs = labOrders.filter((l) => l.patientId === patient.id || l.patientName === patient.fullName);
  const patientInvoices = invoices.filter((i) => i.patientId === patient.id || i.patientName === patient.fullName);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs font-sans pb-12">
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-teal-700/40">
        <div className="flex items-center gap-4">
          <SmartClinicLogo className="w-14 h-14" glow={true} />
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-teal-200 border border-white/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Patient Health Portal
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Welcome, {patient.fullName}
            </h1>
            <p className="text-teal-100 text-xs mt-0.5">
              MRN: <span className="font-mono font-bold text-white">{patient.mrn}</span> • Blood Group: <span className="font-bold text-white">{patient.bloodType}</span> • Primary Physician: Dr. Maria Cristina Reyes, MD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onOpenQR && (
            <button
              onClick={onOpenQR}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 border border-white/20 transition cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-teal-300" />
              <span>Digital Health ID</span>
            </button>
          )}

          {onOpenBookAppointment && (
            <button
              onClick={onOpenBookAppointment}
              className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 rounded-xl font-bold flex items-center gap-2 transition shadow-md shadow-teal-500/20 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Latest Blood Pressure</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">138/86 mmHg</p>
          <span className="text-[10px] text-amber-600 font-semibold">Stage 1 Pre-HTN</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Heart Rate</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">74 bpm</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Normal Resting Range</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Oxygen Saturation</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">98% SpO2</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Optimal Oxygenation</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Documented Allergies</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-sm font-bold text-rose-700 truncate">{patient.allergies.join(', ')}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Medical Flagged</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">My Scheduled Visits</h3>
              </div>
              <span className="text-[11px] font-semibold text-teal-700">
                {patientAppointments.length} Booked
              </span>
            </div>

            <div className="space-y-3">
              {patientAppointments.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No upcoming appointments scheduled.</p>
              ) : (
                patientAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{apt.doctorName}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {apt.date} at {apt.time} • {apt.reason}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-slate-600 font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                      #{apt.queueNumber || 'Q-10'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Active e-Prescriptions</h3>
              </div>
              <span className="text-[11px] font-semibold text-teal-700">
                {patientPrescriptions.length} Records
              </span>
            </div>

            <div className="space-y-3">
              {patientPrescriptions.slice(0, 3).map((rx) => (
                <div
                  key={rx.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{rx.items[0]?.medicationName}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {rx.items[0]?.dosage} • {rx.items[0]?.frequency} • {rx.items[0]?.instructions}
                    </p>
                    <p className="text-[10px] text-teal-700 font-semibold mt-1">
                      Prescribed by {rx.doctorName} on {rx.date}
                    </p>
                  </div>
                  {onOpenPrescription && (
                    <button
                      onClick={() => onOpenPrescription(rx)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-400 rounded-lg text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-600" />
                      <span>Print Rx</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Diagnostic Laboratory Results</h3>
              </div>
            </div>

            <div className="space-y-3">
              {patientLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between gap-2"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{lab.testName}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Ordered: {new Date(lab.requestedAt).toLocaleDateString()}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {lab.status}
                    </span>
                  </div>
                  {onOpenLabReport && (
                    <button
                      onClick={() => onOpenLabReport(lab)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-teal-400 rounded-lg text-slate-700 dark:text-slate-200 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
                      <span>View Report</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Statements & Receipts</h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {patientInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between text-[11px]"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</span>
                    <p className="text-slate-500 text-[10px]">{inv.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{formatPeso(inv.totalAmount)}</span>
                    <span className="block text-[10px] font-semibold text-emerald-700">{inv.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
