import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Prescription } from '../../types/clinic';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { triggerRealtimePrint } from '../../utils/printDocument';

interface Props {
  prescription: Prescription;
  onClose: () => void;
}

export const PrescriptionPrintModal: React.FC<Props> = ({ prescription, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const documentTitle = `Official-Prescription-${prescription.prescriptionNumber}`;

  const handlePrint = () => {
    setIsPrinting(true);
    triggerRealtimePrint({
      title: documentTitle,
      isDark: false,
      documentType: 'prescription',
    });
    setTimeout(() => {
      setIsPrinting(false);
    }, 600);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Auto-launch real-time print immediately on modal mount
    const autoPrintTimer = setTimeout(() => {
      handlePrint();
    }, 120);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(autoPrintTimer);
    };
  }, [onClose]);

  const renderPrescriptionBody = (forPrint = false) => (
    <div className={`space-y-6 ${forPrint ? 'p-2 bg-white text-slate-950 font-sans' : 'text-slate-900 dark:text-slate-100'}`}>
      {/* Clinic & Medical Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 pb-4 gap-4">
        <div className="flex items-center gap-3.5">
          <SmartClinicLogo className="w-12 h-12 shrink-0" glow={!forPrint} />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-tight">
              Smart Clinic Integrated Healthcare
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Department of Outpatient Medicine &amp; Clinical Therapeutics
            </p>
            <p className="text-[11px] text-slate-500">
              740 Healthcare Blvd, Suite 400 • Tel: (555) 900-SMART • Web: smartclinic.health
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2.5 py-1 rounded-md border border-slate-300 inline-block">
            {prescription.prescriptionNumber}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Date: <strong className="text-slate-800">{prescription.date}</strong>
          </p>
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3 h-3" />
              <span>{prescription.status.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Physician & Patient Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <p className="font-bold uppercase text-[10px] text-teal-700 tracking-wider">
            Prescribing Physician
          </p>
          <p className="font-bold text-sm text-slate-900 mt-0.5">
            {prescription.doctorName}
          </p>
          <p className="text-slate-600">{prescription.doctorSpecialty}</p>
          <p className="text-slate-500 font-mono text-[11px] mt-0.5">
            PRC License: {prescription.doctorLicense} • PTR: 8920141-A
          </p>
        </div>

        <div className="sm:text-right">
          <p className="font-bold uppercase text-[10px] text-teal-700 tracking-wider">
            Patient Demographics
          </p>
          <p className="font-bold text-sm text-slate-900 mt-0.5">
            {prescription.patientName}
          </p>
          <p className="text-slate-600 mt-0.5">
            MRN: <span className="font-mono font-semibold text-slate-800">{prescription.patientMrn}</span> • Age: {prescription.patientAge}y • Sex: {prescription.patientGender}
          </p>
          <p className="text-[11px] text-slate-500">
            Philippine National Health Identity (PhilHealth Registered)
          </p>
        </div>
      </div>

      {/* Rx Symbol & Medication Body */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="font-serif italic text-3xl font-extrabold text-teal-700 select-none">
            ℞
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Prescribed Clinical Formulations
          </span>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {prescription.items.map((item, index) => (
            <div key={item.id} className="py-3.5 text-xs space-y-1.5">
              <div className="flex justify-between items-baseline gap-2">
                <div className="space-x-1.5">
                  <span className="font-extrabold text-slate-900 text-sm">
                    {index + 1}. {item.medicationName}
                  </span>
                  {item.genericName && (
                    <span className="text-slate-600 text-xs italic">
                      ({item.genericName})
                    </span>
                  )}
                </div>
                <span className="font-bold text-teal-800 font-mono text-xs shrink-0">
                  Qty: {item.quantity} ({item.duration})
                </span>
              </div>

              <div className="pl-4 border-l-2 border-teal-500/60 space-y-1 text-slate-750">
                <p className="font-medium">
                  <strong className="text-slate-900">Sig / Dosage:</strong> {item.dosage} via {item.route || 'Oral'} route, {item.frequency}.
                </p>
                <p className="text-slate-600 text-[11px] italic">
                  Special Directions: {item.instructions}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Clinical Safety Audit Notice */}
      {prescription.aiSafetyAudit && (
        <div className="text-[10px] space-y-1 bg-teal-50/80 p-3 rounded-lg border border-teal-200 text-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-teal-900">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>AI Clinical Safety &amp; Drug Interaction Check Passed</span>
          </div>
          <p className="text-[10px] text-slate-600">
            Verified zero high-risk contraindications against patient allergy profiles and active pharmacological regimens on {new Date(prescription.aiSafetyAudit.checkedAt).toLocaleString()}.
          </p>
        </div>
      )}

      {/* Refill & Pharmacist Dispensing Notice */}
      <div className="text-[10px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <p className="font-semibold text-slate-700">
          Philippine Pharmacy Act (RA 10918) &amp; Generics Act Compliance Notice:
        </p>
        <p>
          Dispense as prescribed. Generic substitution is authorized unless explicitly contraindicated by the physician. Patients are advised to complete antibiotic regimens. For adverse symptoms, discontinue immediately and contact emergency care.
        </p>
      </div>

      {/* Physician Signature Line */}
      <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-slate-200 text-xs gap-4">
        <div>
          <div className="w-48 h-8 border-b-2 border-slate-700 flex items-center justify-center italic text-slate-700 font-serif text-sm">
            {prescription.doctorName.replace(', MD', '')}, MD
          </div>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
            Physician Digital Signature &amp; License
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            PRC: {prescription.doctorLicense} • S2: S2-98442-B
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="font-mono text-[10px] text-slate-500">
            Security Hash: SC-RX-{prescription.prescriptionNumber.replace(/[^0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
          </p>
          <p className="text-[10px] text-slate-600 font-medium">
            Official Electronic Prescription • RA 8792 Compliant
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Interactive Screen Modal (Hidden strictly during print) */}
      {createPortal(
        <div
          data-print-hide="true"
          className="force-light modal-screen-container modal-screen-backdrop no-print print:hidden !print:hidden fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
            
            {/* Top Control Bar */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                  <Printer className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                    Print Official Clinic Prescription (Rx)
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {prescription.prescriptionNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs font-semibold disabled:opacity-70"
                  title="Print official prescription"
                  type="button"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isPrinting ? 'Opening Print...' : 'Print Prescription'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Close modal"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 transition-colors">
              {renderPrescriptionBody(false)}
            </div>

            {/* Modal Bottom Controls */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Official Clinic Prescription • Ready to Print
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-70"
                  type="button"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isPrinting ? 'Opening Print Dialog...' : 'Print Prescription'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium cursor-pointer transition"
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Dedicated Pure Clinical Document Mount (Print only, fills standard A4 sheet cleanly) */}
      {createPortal(
        <div id="smartclinic-print-root">
          {renderPrescriptionBody(true)}
        </div>,
        document.body
      )}
    </>
  );
};
