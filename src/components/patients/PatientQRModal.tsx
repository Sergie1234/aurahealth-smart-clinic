import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Patient } from '../../types/clinic';
import { X, Printer, Shield, HeartPulse } from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';

interface Props {
  patient: Patient;
  onClose: () => void;
}

export const PatientQRModal: React.FC<Props> = ({ patient, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const payload = JSON.stringify({
      type: 'SMARTCLINIC_HEALTH_ID',
      mrn: patient.mrn,
      id: patient.id,
      name: patient.fullName,
      bloodType: patient.bloodType,
    });

    QRCode.toDataURL(payload, {
      width: 200,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then(setQrDataUrl)
      .catch((err) => {
        console.warn('QR code generation error:', err);
      });
  }, [patient]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-xs">Patient Digital ID Card</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Printable ID Card */}
        <div className="p-6 print-area bg-gradient-to-b from-white to-slate-50 flex flex-col items-center text-center">
          {/* Card Frame */}
          <div className="w-full bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SmartClinicLogo className="w-7 h-7" glow={true} />
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-xs leading-none">Smart Clinic</p>
                  <p className="text-[9px] text-slate-400">Electronic Health Identification</p>
                </div>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-200">
                {patient.bloodType}
              </span>
            </div>

            {/* Avatar & Name */}
            <div>
              <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-800 font-extrabold text-2xl flex items-center justify-center mx-auto border-2 border-teal-200 mb-2">
                {patient.fullName.charAt(0)}
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{patient.fullName}</h2>
              <p className="font-mono text-xs font-semibold text-teal-700 tracking-wider mt-0.5">
                {patient.mrn}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {patient.age} yrs • {patient.gender} • DOB: {patient.dob}
              </p>
            </div>

            {/* Simulated QR Code & Barcode */}
            <div className="py-2 flex flex-col items-center justify-center space-y-2">
              {/* Genuine Generated QR Code */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Electronic Health ID QR Code for ${patient.fullName}`}
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-slate-400">
                    <HeartPulse className="w-8 h-8 animate-pulse text-teal-600" />
                  </div>
                )}
              </div>

              {/* Barcode line representation */}
              <div className="w-48 flex items-center justify-center gap-[2px] h-8 pt-1">
                <span className="w-[3px] h-full bg-slate-900"></span>
                <span className="w-[1px] h-full bg-slate-900"></span>
                <span className="w-[4px] h-full bg-slate-900"></span>
                <span className="w-[2px] h-full bg-slate-900"></span>
                <span className="w-[1px] h-full bg-slate-900"></span>
                <span className="w-[3px] h-full bg-slate-900"></span>
                <span className="w-[5px] h-full bg-slate-900"></span>
                <span className="w-[2px] h-full bg-slate-900"></span>
                <span className="w-[1px] h-full bg-slate-900"></span>
                <span className="w-[4px] h-full bg-slate-900"></span>
                <span className="w-[2px] h-full bg-slate-900"></span>
                <span className="w-[3px] h-full bg-slate-900"></span>
                <span className="w-[1px] h-full bg-slate-900"></span>
                <span className="w-[4px] h-full bg-slate-900"></span>
                <span className="w-[2px] h-full bg-slate-900"></span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">*{patient.mrn}*</span>
            </div>

            {/* Emergency & Allergies Alert */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-left text-[10px] space-y-1">
              <div className="flex justify-between text-slate-600">
                <span className="font-semibold text-slate-700">Emerg. Contact:</span>
                <span>{patient.emergencyContact?.name} ({patient.emergencyContact?.phone})</span>
              </div>
              {patient.allergies.length > 0 && (
                <div className="text-amber-800 font-medium">
                  <span className="font-bold">Allergies:</span> {patient.allergies.map((a) => a.allergen).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <p className="text-[11px] text-slate-500">Scan at clinic self check-in kiosk</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
