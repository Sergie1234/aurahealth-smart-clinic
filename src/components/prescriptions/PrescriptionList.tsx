import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Prescription } from '../../types/clinic';
import {
  Pill,
  Plus,
  Printer,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  User,
  Sparkles
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';

interface Props {
  onOpenNewPrescription: () => void;
  onPrintPrescription: (rx: Prescription) => void;
  onVerifySafety?: (rx: Prescription) => void;
}

export const PrescriptionList: React.FC<Props> = ({
  onOpenNewPrescription,
  onPrintPrescription,
  onVerifySafety,
}) => {
  const {
    prescriptions,
    dispenseMedication,
    activeRole,
    currentUser,
    selectPatient,
    setActiveTab,
  } = useClinic();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredRx = prescriptions.filter((rx) => {
    const matchesSearch =
      rx.patientName.toLowerCase().includes(search.toLowerCase()) ||
      rx.prescriptionNumber.toLowerCase().includes(search.toLowerCase()) ||
      rx.items.some((i) => i.medicationName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || rx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">E-Prescription Management</h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
              {prescriptions.length} Issued Prescriptions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Digital prescription registry with automated AI drug-interaction safety audits and pharmacy dispensing.
          </p>
        </div>

        {activeRole !== 'patient' && (
          <button
            onClick={onOpenNewPrescription}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Prescription</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Rx number, patient name, or medication..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Dispensed">Dispensed</option>
            <option value="Partially Dispensed">Partially Dispensed</option>
          </select>
        </div>
      </div>

      {/* Prescription Cards List */}
      <div className="space-y-3">
        {filteredRx.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-400">
            No prescriptions found matching criteria.
          </div>
        ) : (
          filteredRx.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 hover:border-teal-200 transition space-y-3 text-xs"
            >
              {/* Rx Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-extrabold flex items-center justify-center text-sm">
                    Rx
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">{rx.prescriptionNumber}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rx.status === 'Active'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : rx.status === 'Dispensed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rx.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Patient:{' '}
                      <strong
                        onClick={() => {
                          selectPatient(rx.patientId);
                          setActiveTab('patients');
                        }}
                        className="text-slate-800 hover:text-teal-600 cursor-pointer"
                      >
                        {rx.patientName}
                      </strong>{' '}
                      ({rx.patientMrn}) • {rx.patientAge}y {rx.patientGender}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Print Rx */}
                  <button
                    onClick={() => onPrintPrescription(rx)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Rx</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prescribed Items</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {rx.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-bold text-slate-900 text-xs">{item.medicationName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({item.dosage})</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {item.frequency} • {item.duration} (Qty: {item.quantity})
                        </p>
                        <p className="text-[10px] text-slate-400 italic">Sig: {item.instructions}</p>
                      </div>

                      {/* Dispense action for pharmacist */}
                      {(activeRole === 'pharmacist' || activeRole === 'admin') && !item.dispensed && (
                        <button
                          onClick={() => dispenseMedication(rx.id, item.id)}
                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[10px] font-semibold shrink-0 cursor-pointer shadow-2xs"
                        >
                          Dispense
                        </button>
                      )}
                      {item.dispensed && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          Dispensed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Safety & Signature Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  {rx.aiSafetyAudit ? (
                    <div className="flex items-center gap-1 text-teal-700 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>AI Safety Audited: {rx.aiSafetyAudit.warnings[0] || 'No adverse interactions detected.'}</span>
                    </div>
                  ) : (
                    <span>Standard verification completed</span>
                  )}
                </div>

                <div className="text-right">
                  <span>Prescribed by: <strong className="text-slate-800">{rx.doctorName}</strong> ({rx.doctorLicense})</span>
                  <span className="ml-2 text-slate-400">{rx.date}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
