import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { StaffSubRole } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Activity,
  Calendar,
  Pill,
  FlaskConical,
  PackageCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';

interface Props {
  subRole: StaffSubRole;
  onOpenBookAppointment?: () => void;
  onOpenNewPatient?: () => void;
}

export const StaffDashboardView: React.FC<Props> = ({
  subRole,
  onOpenBookAppointment,
  onOpenNewPatient,
}) => {
  const {
    currentUser,
    appointments,
    patients,
    inventory,
    prescriptions,
    labOrders,
    updateAppointmentStatus,
    dispenseMedication,
    updateLabStatus,
  } = useClinic();
  const { info: toastInfo } = useToast();

  const roleLabels: Record<StaffSubRole, { title: string; badge: string; color: string; desc: string }> = {
    nurse: {
      title: 'Clinical Nursing & Outpatient Triage',
      badge: 'Nurse Practitioner',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      desc: 'Triage vital sign evaluations, outpatient monitoring, and pre-consultation patient readiness.',
    },
    pharmacist: {
      title: 'Pharmacy Formulary & Dispensary Operations',
      badge: 'Licensed Pharmacist',
      color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      desc: 'Drug inventory monitoring, prescription review, compounding validation, and dispensing dispatch.',
    },
    receptionist: {
      title: 'Patient Intake & Queue Management Desk',
      badge: 'Clinic Receptionist',
      color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
      desc: 'Front desk intake, appointment calendar scheduling, patient check-ins, and queue triage.',
    },
    lab_technician: {
      title: 'Diagnostic Laboratory & Specimen Processing',
      badge: 'Medical Lab Technologist',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      desc: 'Biological specimen processing, laboratory assay certification, and diagnostics turnaround.',
    },
  };

  const currentMeta = roleLabels[subRole] || roleLabels.nurse;

  const waitingPatients = appointments.filter((a) => a.status === 'Checked In' || a.status === 'In Consultation');
  const pendingRx = prescriptions.filter((p) => p.status === 'Active');
  const lowStock = inventory.filter((i) => i.stockQuantity <= i.reorderLevel);
  const pendingLabs = labOrders.filter((l) => l.status === 'Requested' || l.status === 'Processing');

  const cardClass = 'bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1';
  const panelClass = 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4';
  const rowClass = 'p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3';

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs font-sans pb-12">
      {/* Staff Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-teal-800/40">
        <div className="flex items-center gap-4">
          <SmartClinicLogo className="w-14 h-14" glow={true} />
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${currentMeta.color}`}>
                {currentMeta.badge}
              </span>
              <span className="text-[10px] text-teal-300 font-mono">Department Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {currentMeta.title}
            </h1>
            <p className="text-slate-300 text-xs mt-0.5 max-w-xl">
              {currentMeta.desc} Authenticated as <span className="font-bold text-white">{currentUser.name}</span>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onOpenNewPatient && (
            <button
              onClick={onOpenNewPatient}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2 border border-white/20 transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-teal-300" />
              <span>Register Patient</span>
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

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-500">
            <span>Waiting Room Queue</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{waitingPatients.length}</p>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">Active in Clinic</span>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-500">
            <span>Pending Dispensary Rx</span>
            <Pill className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{pendingRx.length}</p>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">Ready for Dispense</span>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-500">
            <span>Low Stock Reorders</span>
            <PackageCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{lowStock.length}</p>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">Items below threshold</span>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-500">
            <span>Specimens in Lab</span>
            <FlaskConical className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{pendingLabs.length}</p>
          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">Processing Assays</span>
        </div>
      </div>

      {/* Nurse workspace */}
      {subRole === 'nurse' && (
        <div className={panelClass}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Nurse Triage & Pre-Consultation Vitals Desk</h3>
            </div>
            <span className="text-xs text-slate-500">Continuous Vital Sign Surveillance</span>
          </div>

          <div className="space-y-3">
            {patients.map((pat) => (
              <div key={pat.id} className={rowClass}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{pat.fullName}</span>
                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded">
                      {pat.mrn}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      Blood {pat.bloodType}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Allergies: <strong className="text-rose-600 dark:text-rose-400">{Array.isArray(pat.allergies) && pat.allergies.length ? pat.allergies.map((a: any) => typeof a === 'string' ? a : a.allergen).join(', ') : 'NKDA'}</strong>
                    {' • Conditions: '}{Array.isArray(pat.chronicConditions) ? pat.chronicConditions.join(', ') || 'None documented' : 'None'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      BP 138/86 • HR 74
                    </span>
                    <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      SpO2 98% • Temp 36.8°C
                    </span>
                  </div>
                  <button
                    onClick={() => toastInfo(`Nurse vitals checklist opened for ${pat.fullName}`)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition text-xs"
                  >
                    Log Vitals
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pharmacist workspace */}
      {subRole === 'pharmacist' && (
        <div className={panelClass}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Pharmacy Prescription Dispense Queue</h3>
            </div>
            <span className="text-xs text-slate-500">Batch Verification & Barcode Packaging</span>
          </div>

          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <div key={rx.id} className={rowClass}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{rx.prescriptionNumber}</span>
                    <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {rx.status}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold mt-1">
                    Patient: {rx.patientName} • Doctor: {rx.doctorName}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Drug: {rx.items[0]?.medicationName} ({rx.items[0]?.dosage}, {rx.items[0]?.frequency})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {rx.status !== 'Dispensed' ? (
                    <button
                      onClick={() => dispenseMedication(rx.id, rx.items[0]?.id || '')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dispense Medication</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Dispensed & Verified</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receptionist workspace */}
      {subRole === 'receptionist' && (
        <div className={panelClass}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Clinic Front Desk & Waiting Room Queue</h3>
            </div>
            <span className="text-xs text-slate-500">Live Intake & Consultation Call Dispatch</span>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className={rowClass}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm text-slate-900 dark:text-slate-100">{apt.patientName}</span>
                    <span className="font-mono text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                      #{apt.queueNumber || 'Q-10'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {apt.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Physician: {apt.doctorName} • Scheduled: {apt.date} at {apt.time} • {apt.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {apt.status === 'Scheduled' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition text-xs"
                    >
                      Check-In Patient
                    </button>
                  )}
                  {apt.status === 'Checked In' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'In Consultation')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition text-xs"
                    >
                      Call to Doctor
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lab technician workspace */}
      {subRole === 'lab_technician' && (
        <div className={panelClass}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Diagnostic Specimen Intake & Analysis Desk</h3>
            </div>
            <span className="text-xs text-slate-500">CLIA Accredited Clinical Pathology Laboratory</span>
          </div>

          <div className="space-y-3">
            {labOrders.map((lab) => (
              <div key={lab.id} className={rowClass}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{lab.testName}</span>
                    <span className="font-mono text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {lab.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {lab.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    Patient: {lab.patientName} • Ordered by: {lab.doctorName} • Urgency: <strong className="text-rose-600 dark:text-rose-400">{lab.urgency}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {lab.status === 'Requested' && (
                    <button
                      onClick={() => updateLabStatus(lab.id, 'Processing')}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition text-xs"
                    >
                      Process Specimen
                    </button>
                  )}
                  {lab.status === 'Processing' && (
                    <button
                      onClick={() => updateLabStatus(lab.id, 'Result Available')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition text-xs"
                    >
                      Certify Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
