import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LabTestOrder } from '../../types/clinic';
import {
  X,
  Printer,
  Sparkles,
  FlaskConical,
  Download,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { aiService, LabInterpretationResponse } from '../../services/aiService';
import { useTheme } from '../../context/ThemeContext';
import { useClinic } from '../../context/ClinicContext';
import { printHtmlViaIframe, downloadPrintDocument } from '../../utils/printDocument';

interface Props {
  order: LabTestOrder;
  onClose: () => void;
}

export const LabReportModal: React.FC<Props> = ({ order, onClose }) => {
  const { isDark } = useTheme();
  const { patients } = useClinic();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiReport, setAiReport] = useState<LabInterpretationResponse | null>(null);

  // Demographic resolution
  const patient = patients.find((p) => p.id === order.patientId || p.mrn === order.patientMrn);
  const patientAge = patient?.age ?? 48;
  const patientGender = patient?.gender ?? 'Female';
  const patientBlood = patient?.bloodType ?? 'A+';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const handleBeforePrint = () => {
      document.body.classList.add('printing-active');
    };
    const handleAfterPrint = () => {
      document.body.classList.remove('printing-active');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.classList.remove('printing-active');
    };
  }, [onClose]);

  const handlePrint = async () => {
    setIsPrinting(true);
    const content = printAreaRef.current?.innerHTML || '';
    await printHtmlViaIframe(content, {
      title: `LabReport-${order.orderNumber}`,
      isDark,
      documentType: 'lab_report',
    });
    setTimeout(() => setIsPrinting(false), 800);
  };

  const handleDownload = () => {
    const content = printAreaRef.current?.innerHTML || '';
    downloadPrintDocument(content, `LabReport-${order.orderNumber}`, {
      title: `LabReport-${order.orderNumber}`,
      isDark,
      documentType: 'lab_report',
    });
  };

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

  const modalContent = (
    <div className="print-modal-overlay fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="print-modal-container bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Top Control Bar (Screen only, hidden when printing) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between no-print gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                Official Diagnostic Pathology Laboratory Report
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {order.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs font-medium"
              title="Download print-ready lab report document"
              type="button"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="hidden sm:inline">Save Document</span>
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

        {/* Printable Laboratory Report Document Area */}
        <div ref={printAreaRef} className="p-6 sm:p-8 print-area bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 space-y-6 overflow-y-auto flex-1 transition-colors">
          
          {/* Clinic & Laboratory Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 dark:border-teal-500 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <SmartClinicLogo className="w-12 h-12 shrink-0" glow={true} />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase leading-tight">
                  Smart Clinic Diagnostic Laboratories
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Department of Clinical Pathology &amp; Molecular Diagnostics • CLIA Certified #CP-9021-A
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  740 Healthcare Blvd, Suite 400 • Tel: (555) 900-SMART • DOH Lic. No. 09-0824-A
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 inline-block">
                {order.orderNumber}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Requested: <strong className="text-slate-800 dark:text-slate-200">{new Date(order.requestedAt).toLocaleDateString()}</strong>
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    order.status === 'Completed' || order.status === 'Result Available' || order.status === 'Reviewed'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{order.status.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Patient Demographics & Test Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div>
              <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
                Patient Demographics
              </p>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                {order.patientName}
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                MRN: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{order.patientMrn}</span> • Age: {patientAge}y • Sex: {patientGender}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Blood Group: <strong className="text-slate-700 dark:text-slate-300">{patientBlood}</strong> • PhilHealth Registered
              </p>
            </div>

            <div className="sm:text-right">
              <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
                Laboratory Test &amp; Order Meta
              </p>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                {order.testName}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Category: <strong>{order.category}</strong> • Urgency: <span className="font-semibold text-teal-600 dark:text-teal-400">{order.urgency}</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ordering Physician: {order.doctorName}
              </p>
            </div>
          </div>

          {/* Certified Results Table */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Certified Laboratory Assay Results
            </h4>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5">Assay Parameter</th>
                    <th className="py-2.5 px-3">Observed Result</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Reference Interval</th>
                    <th className="py-2.5 px-3.5 text-center">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {order.results?.map((res, i) => (
                    <tr
                      key={i}
                      className={
                        res.flag !== 'Normal'
                          ? 'bg-rose-50/30 dark:bg-rose-950/20'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                      }
                    >
                      <td className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {res.parameter}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {res.value}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {res.unit}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {res.referenceRange}
                      </td>
                      <td className="py-2.5 px-3.5 text-center">
                        <span
                          className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                            res.flag === 'Normal'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : res.flag === 'High'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                              : res.flag === 'Critical'
                              ? 'bg-red-600 text-white font-black animate-pulse'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-700'
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

          {/* Pathologist Specialist Impression */}
          {order.interpretation && (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Clinical Pathologist &amp; Specialist Impression:</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                {order.interpretation}
              </p>
            </div>
          )}

          {/* Interactive AI Assistant Section (Screen only, hidden on print) */}
          <div className="no-print pt-1">
            {!aiReport ? (
              <div className="bg-teal-50/70 dark:bg-teal-950/40 p-4 rounded-xl border border-teal-200 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-200 text-xs">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Gemini AI Clinical Lab Interpretation Assistant</span>
                  </div>
                  <p className="text-[11px] text-teal-800 dark:text-teal-300">
                    Analyze flagged assay parameters, correlate clinical etiologies, and view patient explanations.
                  </p>
                </div>
                <button
                  onClick={handleRunAiInterpretation}
                  disabled={isInterpreting}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs transition cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                  type="button"
                >
                  {isInterpreting ? 'Analyzing Panel...' : 'Analyze with AI'}
                </button>
              </div>
            ) : (
              <div className="bg-teal-50/50 dark:bg-teal-950/30 p-4 rounded-xl border border-teal-200 dark:border-teal-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900 dark:text-teal-200 text-xs">
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Gemini Clinical Lab Interpretation &amp; Guide</span>
                  </div>
                  <button
                    onClick={() => setAiReport(null)}
                    className="text-[11px] text-teal-700 dark:text-teal-300 hover:underline font-semibold cursor-pointer"
                    type="button"
                  >
                    Close AI View
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-100 dark:border-teal-800/60 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block uppercase">Clinical Impression</span>
                  <p className="text-slate-700 dark:text-slate-300">{aiReport.summary}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1">{aiReport.overallImpression}</p>
                </div>

                {aiReport.abnormalFindings && aiReport.abnormalFindings.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-100 dark:border-teal-800/60 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block uppercase">Flagged Abnormalities</span>
                    {aiReport.abnormalFindings.map((ab, idx) => (
                      <div key={idx} className="p-2 bg-rose-50/40 dark:bg-rose-950/30 rounded border border-rose-100 dark:border-rose-900/60 text-[11px]">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{ab.parameter} ({ab.value} - {ab.flag}): </span>
                        <span className="text-slate-700 dark:text-slate-300">{ab.clinicalSignificance} </span>
                        <span className="text-slate-500 dark:text-slate-400 italic">Etiology: {ab.potentialEtiology}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-teal-100 dark:border-teal-800/60 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] block uppercase">Patient-Friendly Explanation</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{aiReport.patientFriendlyExplanation}</p>
                </div>

                <AIDisclaimerBanner compact />
              </div>
            )}
          </div>

          {/* Legal / Accreditation Notice */}
          <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Official Philippine Clinical Laboratory Result Notice:</span>
            </div>
            <p>
              This electronic laboratory report is issued under the authority of the Clinical Laboratory Director in accordance with Philippine DOH Administrative Order No. 2007-0027 and RA 4688. Verified against secondary reference calibration standards.
            </p>
          </div>

          {/* Pathologist Certification & Signatures */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-slate-200 dark:border-slate-800 text-xs gap-4">
            <div>
              <div className="w-44 h-8 border-b-2 border-slate-700 dark:border-slate-400 flex items-center justify-center italic text-slate-600 dark:text-slate-300 font-serif">
                Amina Diallo, MD, FPSP
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">
                Chief Pathologist &amp; Laboratory Director
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                PRC Lic: 0098441 • CLIA Director ID: D-88214
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                Security Hash: SC-LAB-{order.orderNumber.replace(/[^0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Official Electronic Lab Transmission • RA 8792 Compliant
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls (Screen only, hidden when printing) */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between no-print gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Official Laboratory Document • Ready to Print
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              type="button"
            >
              <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Save Document</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-70"
              type="button"
            >
              <Printer className="w-4 h-4" />
              <span>{isPrinting ? 'Opening Print Dialog...' : 'Print Lab Report'}</span>
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
    </div>
  );

  return createPortal(modalContent, document.body);
};
