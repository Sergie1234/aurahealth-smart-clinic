import React, { useState } from 'react';
import { LabTestOrder } from '../../types/clinic';
import {
  X,
  Printer,
  Sparkles,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { aiService, LabInterpretationResponse } from '../../services/aiService';

interface Props {
  order: LabTestOrder;
  onClose: () => void;
}

export const LabReportModal: React.FC<Props> = ({ order, onClose }) => {
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiReport, setAiReport] = useState<LabInterpretationResponse | null>(null);

  const handleRunAiInterpretation = async () => {
    setIsInterpreting(true);
    try {
      const res = await aiService.interpretLabResults({
        testName: order.testName,
        category: order.category,
        results: order.results || [],
        patientContext: {
          name: order.patientName,
          mrn: order.patientMrn,
        },
      });
      setAiReport(res.data);
    } catch (err) {
      console.error('Failed to interpret lab results with AI:', err);
    } finally {
      setIsInterpreting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-xs">Diagnostic Pathology Laboratory Report</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Report Content */}
        <div className="p-6 sm:p-8 print-area bg-white text-slate-900 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Clinic & Lab Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-black flex items-center justify-center text-sm">
                  A+
                </div>
                <h1 className="text-base font-black tracking-tight text-slate-950 uppercase">
                  AuraHealth Diagnostic Laboratories
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Clinical Pathology • CLIA Certified • Accreditation #CP-9021-A
              </p>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200 block">
                {order.orderNumber}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Requested: {new Date(order.requestedAt).toLocaleDateString()}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                Certified: {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'Released'}
              </span>
            </div>
          </div>

          {/* Patient Demographics & Test Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-[10px] uppercase text-slate-400 block">Patient Information</span>
              <p className="font-bold text-sm text-slate-900">{order.patientName}</p>
              <p className="font-mono text-slate-600 text-[11px]">MRN: {order.patientMrn}</p>
            </div>

            <div>
              <span className="font-bold text-[10px] uppercase text-slate-400 block">Test Details</span>
              <p className="font-bold text-xs text-slate-900">{order.testName}</p>
              <p className="text-slate-600">Category: {order.category} • Urgency: {order.urgency}</p>
              <p className="text-slate-500 text-[10px]">Ordering Physician: {order.doctorName}</p>
            </div>
          </div>

          {/* Certified Results Table */}
          <div className="space-y-2">
            <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Laboratory Assay Results</h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 text-[10px] uppercase">
                    <th className="py-2.5 px-3">Test Parameter</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Reference Interval</th>
                    <th className="py-2.5 px-3 text-center">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.results?.map((res, i) => (
                    <tr key={i} className={res.flag !== 'Normal' ? 'bg-rose-50/40 font-semibold' : ''}>
                      <td className="py-2 px-3 text-slate-800">{res.parameter}</td>
                      <td className="py-2 px-3 text-slate-900 font-bold">{res.value}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{res.unit}</td>
                      <td className="py-2 px-3 text-slate-500">{res.referenceRange}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            res.flag === 'Normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : res.flag === 'High'
                              ? 'bg-rose-100 text-rose-800'
                              : res.flag === 'Critical'
                              ? 'bg-red-600 text-white'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {res.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pathologist Impression if present */}
          {order.interpretation && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-0.5">Laboratory Specialist Impression:</span>
              <p className="text-slate-600 leading-relaxed">{order.interpretation}</p>
            </div>
          )}

          {/* AI Lab Result Assistant Section */}
          <div className="no-print pt-2">
            {!aiReport ? (
              <div className="bg-teal-50/70 p-4 rounded-xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900 text-xs">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Gemini AI Lab Result Assistant</span>
                  </div>
                  <p className="text-[11px] text-teal-800">
                    Analyze abnormal values, correlate clinical etiologies, and generate a patient-friendly summary.
                  </p>
                </div>
                <button
                  onClick={handleRunAiInterpretation}
                  disabled={isInterpreting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                >
                  {isInterpreting ? 'Analyzing Panel...' : 'Analyze with AI Assistant'}
                </button>
              </div>
            ) : (
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    <span>Gemini Clinical Lab Interpretation & Patient Guide</span>
                  </div>
                  <button
                    onClick={() => setAiReport(null)}
                    className="text-[11px] text-teal-700 hover:underline font-semibold"
                  >
                    Close AI View
                  </button>
                </div>

                <div className="bg-white p-3 rounded-lg border border-teal-100 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block uppercase">Clinical Impression for Doctor</span>
                  <p className="text-slate-700">{aiReport.summary}</p>
                  <p className="text-slate-600 text-[11px] mt-1">{aiReport.overallImpression}</p>
                </div>

                {aiReport.abnormalFindings && aiReport.abnormalFindings.length > 0 && (
                  <div className="bg-white p-3 rounded-lg border border-teal-100 space-y-1.5">
                    <span className="font-bold text-slate-800 text-[11px] block uppercase">Flagged Abnormalities & Etiology</span>
                    {aiReport.abnormalFindings.map((ab, idx) => (
                      <div key={idx} className="p-2 bg-rose-50/40 rounded border border-rose-100 text-[11px]">
                        <span className="font-bold text-slate-900">{ab.parameter} ({ab.value} - {ab.flag}): </span>
                        <span className="text-slate-700">{ab.clinicalSignificance} </span>
                        <span className="text-slate-500 italic">Etiology: {ab.potentialEtiology}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white p-3 rounded-lg border border-teal-100 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block uppercase">Patient-Friendly Explanation</span>
                  <p className="text-slate-700 leading-relaxed">{aiReport.patientFriendlyExplanation}</p>
                </div>

                <AIDisclaimerBanner compact />
              </div>
            )}
          </div>

          {/* Pathologist Certification Signature */}
          <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
            <div>
              <p className="font-cursive text-sm text-slate-700 italic">Amina Diallo, MLS</p>
              <div className="w-36 h-0.5 bg-slate-400 mt-1" />
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase">Certified Medical Laboratory Technologist</p>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              <p>Electronic Lab Transmission Certified</p>
              <p>HIPAA Security Compliance Verified</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print">
          <span className="text-xs text-slate-500">Official Laboratory Document</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Lab Report</span>
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
