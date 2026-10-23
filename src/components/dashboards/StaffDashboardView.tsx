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
  UserPlus,
} from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { RoleHeroBanner } from '../common/RoleHeroBanner';

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
    t,
    language,
  } = useClinic();
  const { info: toastInfo } = useToast();

  const isFil = language === 'fil';

  const roleLabels: Record<StaffSubRole, { title: string; badge: string; desc: string }> = {
    nurse: {
      title: isFil ? 'Pangangalagang Pang-nars at Triage' : 'Clinical Nursing & Outpatient Triage',
      badge: t.roles.nurse,
      desc: isFil
        ? 'Pagtatala ng vital signs, pagsubaybay sa outpatient, at paghahanda sa pasyente bago ang konsultasyon.'
        : 'Triage vital sign evaluations, outpatient monitoring, and pre-consultation patient readiness.',
    },
    pharmacist: {
      title: isFil ? 'Parmasya at Pamamahagi ng Gamot' : 'Pharmacy Formulary & Dispensary Operations',
      badge: t.roles.pharmacist,
      desc: isFil
        ? 'Pagsubaybay sa imbentaryo ng gamot, pagsusuri ng reseta, at pag-dispense ng gamot.'
        : 'Drug inventory monitoring, prescription review, compounding validation, and dispensing dispatch.',
    },
    receptionist: {
      title: isFil ? 'Pagtanggap ng Pasyente at Pamamahala ng Pila' : 'Patient Intake & Queue Management Desk',
      badge: t.roles.receptionist,
      desc: isFil
        ? 'Pagtanggap sa front desk, pag-iskedyul ng appointment, check-in ng pasyente, at triage sa pila.'
        : 'Front desk intake, appointment calendar scheduling, patient check-ins, and queue triage.',
    },
    lab_technician: {
      title: isFil ? 'Laboratoryo ng Diagnostics at Pagsusuri' : 'Diagnostic Laboratory & Specimen Processing',
      badge: t.roles.labTechnician,
      desc: isFil
        ? 'Pagsusuri ng biyolohikal na ispesimen, sertipikasyon ng lab assay, at paglalabas ng resulta.'
        : 'Biological specimen processing, laboratory assay certification, and diagnostics turnaround.',
    },
  };

  const subRoleGradients: Record<StaffSubRole, string> = {
    nurse: 'bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-emerald-800/40',
    pharmacist: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-800/40',
    receptionist: 'bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border-sky-800/40',
    lab_technician: 'bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-amber-800/40',
  };

  const subRoleBadgeColors: Record<StaffSubRole, string> = {
    nurse: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    pharmacist: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    receptionist: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    lab_technician: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  };

  const subRolePulseColors: Record<StaffSubRole, string> = {
    nurse: 'bg-emerald-400',
    pharmacist: 'bg-indigo-400',
    receptionist: 'bg-sky-400',
    lab_technician: 'bg-amber-400',
  };

  const currentMeta = roleLabels[subRole] || roleLabels.nurse;

  const waitingPatients = appointments.filter((a) => a.status === 'Checked In' || a.status === 'In Consultation');
  const pendingRx = prescriptions.filter((p) => p.status === 'Active');
  const lowStock = inventory.filter((i) => i.stockQuantity <= i.reorderLevel);
  const pendingLabs = labOrders.filter((l) => l.status === 'Requested' || l.status === 'Processing');

  const cardClass = 'bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1';
  const panelClass = 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4';
  const rowClass = 'p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3';

  // Dynamic actions based on subRole
  const staffActions = [
    ...(onOpenNewPatient
      ? [
          {
            label: isFil ? 'Bagong Pasyente' : 'New Patient',
            onClick: onOpenNewPatient,
            icon: <UserPlus className="w-4 h-4 text-slate-200" />,
            variant: 'secondary' as const,
            ariaLabel: isFil ? 'Magrehistro ng bagong pasyente' : 'Register new clinic patient',
            title: isFil ? 'Magrehistro ng bagong pasyente' : 'Register a new patient into EMR',
          },
        ]
      : []),
    ...(onOpenBookAppointment && subRole === 'receptionist'
      ? [
          {
            label: t.common.bookAppointment,
            onClick: onOpenBookAppointment,
            icon: <Calendar className="w-4 h-4 text-slate-950" />,
            variant: 'primary' as const,
            primaryColor: 'bg-sky-400 hover:bg-sky-300 text-slate-950 shadow-md shadow-sky-500/20 focus-visible:ring-sky-300',
            ariaLabel: t.common.bookAppointment,
            title: isFil ? 'Mag-iskedyul ng appointment' : 'Schedule appointment for patient',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs font-sans pb-12">
      {/* Unified Staff Hero Banner */}
      <RoleHeroBanner
        badges={[
          {
            text: currentMeta.badge,
            pulseDot: true,
            pulseColor: subRolePulseColors[subRole] || 'bg-teal-400',
            className: subRoleBadgeColors[subRole] || 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          },
          {
            text: isFil ? 'Aktibong Departamento' : 'Department Active',
            className: 'bg-white/10 text-slate-300 border-white/20 font-mono',
          },
        ]}
        title={currentMeta.title}
        meta={
          <span className="max-w-2xl block">
            {currentMeta.desc}{' '}
            <span className="text-white/80">
              {isFil ? 'Naka-authenticate bilang' : 'Authenticated as'}{' '}
              <strong className="text-white font-bold">{currentUser.name}</strong>.
            </span>
          </span>
        }
        gradientClass={subRoleGradients[subRole] || 'bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border-teal-800/40'}
        actions={staffActions}
      />

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-500">
            <span>{t.staff.waitingPatients}</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{waitingPatients.length}</p>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">{t.home.waitingInQueue}</span>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-500">
            <span>{t.staff.pharmacyStock}</span>
            <Pill className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{pendingRx.length}</p>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold">{t.nav.prescriptions}</span>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-500">
            <span>{t.admin.lowStockAlerts}</span>
            <PackageCheck className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{lowStock.length}</p>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">{t.nav.inventory}</span>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between text-slate-500">
            <span>{t.staff.labPending}</span>
            <FlaskConical className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{pendingLabs.length}</p>
          <span className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold">{t.nav.laboratory}</span>
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
                    {t.staff.recordVitals}
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
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{isFil ? 'Pila ng Pagbibigay ng Gamot sa Parmasya' : 'Pharmacy Prescription Dispense Queue'}</h3>
            </div>
            <span className="text-xs text-slate-500">{isFil ? 'Beripikasyon at Pag-iimpake ng Gamot' : 'Batch Verification & Barcode Packaging'}</span>
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
                      <span>{isFil ? 'Ibigay ang Gamot' : 'Dispense Medication'}</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isFil ? 'Naibigay at Beripikado' : 'Dispensed & Verified'}</span>
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
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{isFil ? 'Front Desk ng Klinika at Pila ng Pasyente' : 'Clinic Front Desk & Waiting Room Queue'}</h3>
            </div>
            <span className="text-xs text-slate-500">{isFil ? 'Live Intake at Pagtawag sa Pasyente' : 'Live Intake & Consultation Call Dispatch'}</span>
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
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'Confirmed')}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950 dark:hover:bg-teal-900 dark:text-teal-300 font-bold cursor-pointer transition text-xs border border-teal-200 dark:border-teal-800 flex items-center gap-1 shadow-2xs"
                        title={isFil ? 'Aprubahan ang appointment' : 'Approve appointment'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>{isFil ? 'Aprubahan' : 'Approve'}</span>
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'Checked In')}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition text-xs"
                      >
                        {t.staff.checkInPatient}
                      </button>
                    </div>
                  )}
                  {apt.status === 'Checked In' && (
                    <button
                      onClick={() => updateAppointmentStatus(apt.id, 'In Consultation')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition text-xs"
                    >
                      {t.staff.callNextPatient}
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
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{isFil ? 'Pagsusuri ng Diagnostic Specimen' : 'Diagnostic Specimen Intake & Analysis Desk'}</h3>
            </div>
            <span className="text-xs text-slate-500">{isFil ? 'Akreditadong Klinikal na Laboratoryo' : 'CLIA Accredited Clinical Pathology Laboratory'}</span>
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
                      {isFil ? 'Iproseso ang Ispesimen' : 'Process Specimen'}
                    </button>
                  )}
                  {lab.status === 'Processing' && (
                    <button
                      onClick={() => updateLabStatus(lab.id, 'Result Available')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition text-xs"
                    >
                      {isFil ? 'Sertipikahan ang Resulta' : 'Certify Results'}
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
