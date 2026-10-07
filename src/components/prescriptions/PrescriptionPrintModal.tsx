import React from 'react';
import { Prescription } from '../../types/clinic';
import { X, Printer, Shield, HeartPulse } from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';

interface Props {
  prescription: Prescription;
  onClose: () => void;
}

export const PrescriptionPrintModal: React.FC<Props> = ({ prescription, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-xs">Print Official Clinic Prescription</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Printable Area */}
        <div className="p-8 print-area bg-white text-slate-900 space-y-6 overflow-y-auto flex-1">
          {/* Clinic Header */}
          <div className="flex justify-between items-start border-b-2 border-teal-700 pb-4">
            <div className="flex items-center gap-3">
              <SmartClinicLogo className="w-12 h-12" glow={true} />
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                  Smart Clinic Integrated Healthcare
                </h1>
                <p className="text-xs text-slate-600 font-medium">Department of Outpatient Medicine & Therapeutics</p>
                <p className="text-[11px] text-slate-500">
                  740 Healthcare Blvd, Suite 400 • Phone: (555) 900-SMART • Web: smartclinic.health
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 block">
                {prescription.prescriptionNumber}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">Date: {prescription.date}</span>
            </div>
          </div>

          {/* Physician & Patient Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900 uppercase text-[10px] text-teal-700 tracking-wider">
                Prescribing Physician
              </p>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{prescription.doctorName}</p>
              <p className="text-slate-600">{prescription.doctorSpecialty}</p>
              <p className="text-slate-500 font-mono text-[11px]">License: {prescription.doctorLicense}</p>
            </div>

            <div>
              <p className="font-bold text-slate-900 uppercase text-[10px] text-teal-700 tracking-wider">
                Patient Demographics
              </p>
              <p className="font-bold text-sm text-slate-900 mt-0.5">{prescription.patientName}</p>
              <p className="text-slate-600">
                MRN: <span className="font-mono font-semibold">{prescription.patientMrn}</span> • Age: {prescription.patientAge}y • Sex: {prescription.patientGender}
              </p>
            </div>
          </div>

          {/* Rx Symbol & Medication Body */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-serif italic text-3xl font-extrabold text-teal-800">℞</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prescribed Medications</span>
            </div>

            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {prescription.items.map((item, index) => (
                <div key={item.id} className="py-3 text-xs space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">
                      {index + 1}. {item.medicationName}
                    </span>
                    <span className="font-semibold text-slate-700">
                      Qty: {item.quantity} ({item.duration})
                    </span>
                  </div>
                  <div className="text-slate-700 pl-4 space-y-0.5">
                    <p>
                      <strong>Sig:</strong> {item.dosage} via {item.route} route, {item.frequency}.
                    </p>
                    <p className="text-slate-600 text-[11px] italic">Directions: {item.instructions}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Safety Disclaimer & Instructions */}
          <div className="text-[10px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-700">Refill & Pharmacist Dispensing Notice:</p>
            <p>
              Dispense as written unless generic substitution is authorized. In case of unexpected adverse reactions, discontinue medication immediately and notify emergency services or the clinic.
            </p>
          </div>

          {/* Signature Line */}
          <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-xs">
            <div>
              <div className="w-36 h-8 border-b-2 border-slate-800 flex items-center justify-center font-cursive text-slate-600 italic">
                Dr. Lin, MD
              </div>
              <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Physician Digital Signature</p>
            </div>

            <div className="text-right">
              <p className="font-mono text-[10px] text-slate-400">Security Hash: SHA256-AURA-{prescription.prescriptionNumber.replace(/[^0-9]/g, '')}</p>
              <p className="text-[10px] text-slate-500">Official Electronic Prescription</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">Ready for high-resolution printing / PDF export</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Prescription</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
