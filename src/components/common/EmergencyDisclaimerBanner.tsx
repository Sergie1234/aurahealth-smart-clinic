import React from 'react';
import { AlertOctagon, PhoneCall } from 'lucide-react';

interface Props {
  className?: string;
  compact?: boolean;
}

export const EmergencyDisclaimerBanner: React.FC<Props> = ({ className = '', compact = false }) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-md ${className}`}>
        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
        <span>EMERGENCY ADVISORY: If experiencing severe symptoms, call 911 or go to the nearest ER immediately.</span>
      </div>
    );
  }

  return (
    <div className={`p-3.5 bg-rose-50/95 border border-rose-300 rounded-xl text-rose-950 text-xs flex items-start gap-3 shadow-xs ${className}`}>
      <div className="w-7 h-7 rounded-lg bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5 text-rose-700">
        <AlertOctagon className="w-4 h-4" />
      </div>
      <div className="space-y-1 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold text-rose-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
            <span>Critical Medical Emergency Disclaimer</span>
          </p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900">
            <PhoneCall className="w-3 h-3" /> Call 911 / Go to ER
          </span>
        </div>
        <p className="text-rose-900 leading-relaxed font-medium">
          The SmartClinic AI Triage Chatbot is an automated triage assistant and <strong className="font-bold underline decoration-rose-400">is not a doctor</strong>. It cannot provide definitive medical diagnoses or prescribe medications. If you or someone you are assisting has severe symptoms (such as acute chest pain, difficulty breathing, severe bleeding, sudden weakness, stroke symptoms, or altered consciousness), <strong className="font-bold">please seek immediate emergency medical care</strong>.
        </p>
        <p className="text-rose-700 text-[10px]">
          In the Philippines, call <strong>911</strong> or proceed immediately to the nearest hospital Emergency Department.
        </p>
      </div>
    </div>
  );
};
