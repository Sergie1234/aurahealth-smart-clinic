import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  Heart,
  Calendar,
  Pill,
  FlaskConical,
  Receipt,
  Sparkles,
  QrCode,
  AlertCircle,
  Clock,
  Printer,
  ChevronRight
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';

interface Props {
  onOpenBookAppointment: () => void;
  onOpenQR: () => void;
  onOpenLabReport: (lab: any) => void;
  onOpenPrescription: (rx: any) => void;
}

export const PatientPortalDashboard: React.FC<Props> = ({
  onOpenBookAppointment,
  onOpenQR,
  onOpenLabReport,
  onOpenPrescription,
}) => {
  const { patients, appointments, prescriptions, labOrders, invoices, setActiveTab } = useClinic();

  // Eleanor Vance is default patient profile
  const patient = patients[0];

  const myAppointments = appointments.filter((a) => a.patientId === patient.id);
  const myPrescriptions = prescriptions.filter((p) => p.patientId === patient.id);
  const myLabs = labOrders.filter((l) => l.patientId === patient.id);
  const myInvoices = invoices.filter((i) => i.patientId === patient.id);

  return (
    <div className="space-y-5 max-w-5xl mx-auto text-xs">
      {/* Patient Welcome Hero */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <SmartClinicLogo className="w-12 h-12" glow={true} />
          <div>
            <span className="bg-white/10 text-teal-200 font-semibold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20">
              Smart Clinic Patient Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5">
              Welcome, {patient.fullName}
            </h1>
            <p className="text-teal-100 text-xs mt-1">
              MRN: {patient.mrn} • Blood Type: {patient.bloodType} • Primary Care: Dr. Sarah Lin, MD
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onOpenQR}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
          >
            <QrCode className="w-4 h-4" />
            <span>Digital ID Card</span>
          </button>
          <button
            onClick={onOpenBookAppointment}
            className="px-3.5 py-2 bg-white text-teal-900 hover:bg-teal-50 rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-teal-700" />
            <span>Book Visit</span>
          </button>
        </div>
      </div>

      <AIDisclaimerBanner />

      {/* 3 Quick Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next Visit Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" />
              <span>Next Appointment</span>
            </span>
            <span className="text-[10px] bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded border border-teal-200">
              Confirmed
            </span>
          </div>
          {myAppointments[0] ? (
            <div className="pt-1">
              <p className="font-bold text-slate-900 text-sm">{myAppointments[0].date} at {myAppointments[0].time}</p>
              <p className="text-slate-600 mt-0.5">With {myAppointments[0].doctorName}</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Room: {myAppointments[0].room || 'Suite 302'}</p>
            </div>
          ) : (
            <p className="text-slate-400 italic">No upcoming appointments.</p>
          )}
        </div>

        {/* Active Prescriptions Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-teal-600" />
              <span>Active Medications</span>
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
              {patient.currentMedications.length} Active
            </span>
          </div>
          <div className="space-y-1 pt-1">
            {patient.currentMedications.slice(0, 2).map((med, i) => (
              <p key={i} className="text-slate-700 font-medium truncate">• {med}</p>
            ))}
          </div>
        </div>

        {/* Latest Lab Results Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              <span>Diagnostic Lab Results</span>
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
              Available
            </span>
          </div>
          {myLabs[0] ? (
            <div className="pt-1">
              <p className="font-bold text-slate-900 truncate">{myLabs[0].testName}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Completed {new Date(myLabs[0].requestedAt).toLocaleDateString()}</p>
              <button
                onClick={() => onOpenLabReport(myLabs[0])}
                className="mt-2 text-teal-600 hover:text-teal-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <span>Read Doctor's Lab Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <p className="text-slate-400 italic">No lab tests on file.</p>
          )}
        </div>
      </div>

      {/* Detailed Sections: My Medications & My Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800 text-xs">My Prescriptions & Instructions</h2>
            <span className="text-[10px] text-slate-400">Electronic Clinic Rx</span>
          </div>

          <div className="space-y-2">
            {myPrescriptions.map((rx) => (
              <div key={rx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{rx.prescriptionNumber}</span>
                  <button
                    onClick={() => onOpenPrescription(rx)}
                    className="text-[11px] font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>View / Print</span>
                  </button>
                </div>
                <div className="space-y-1">
                  {rx.items.map((it) => (
                    <div key={it.id} className="bg-white p-2 rounded border border-slate-100 text-[11px]">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{it.medicationName} ({it.dosage})</span>
                        <span className="text-slate-500 font-normal">{it.frequency}</span>
                      </div>
                      <p className="text-slate-500 text-[10px] mt-0.5">Instructions: {it.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Invoices & Payments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="font-bold text-slate-800 text-xs">My Billing History</h2>
            <span className="text-[10px] text-slate-400">Electronic Statements</span>
          </div>

          <div className="space-y-2">
            {myInvoices.map((inv) => (
              <div key={inv.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block font-mono">{inv.invoiceNumber}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Date: {inv.date}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{inv.items.map((i) => i.description).join(', ')}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm block">${inv.totalAmount.toFixed(2)}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
