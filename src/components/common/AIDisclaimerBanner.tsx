import React from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';

interface Props {
  className?: string;
  compact?: boolean;
}

export const AIDisclaimerBanner: React.FC<Props> = ({ className = '', compact = false }) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/80 rounded-md ${className}`}>
        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>AI Decision Support Only — Requires clinical review</span>
      </div>
    );
  }

  return (
    <div className={`p-3 bg-amber-50/90 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2.5 ${className}`}>
      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="font-semibold text-amber-800">
          Clinical Decision Support Notice
        </p>
        <p className="text-amber-700 leading-relaxed">
          AI-generated insights, notes, interactions, and interpretations are strictly advisory tools intended to support, not replace, the independent professional judgment and diagnostic responsibility of authorized healthcare professionals.
        </p>
      </div>
    </div>
  );
};
