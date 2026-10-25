import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LabTestOrder } from '../../types/clinic';
import {
  X,
  Printer,
  Sparkles,
  FlaskConical,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { aiService, LabInterpretationResponse } from '../../services/aiService';
import { useClinic } from '../../context/ClinicContext';
import { triggerRealtimePrint } from '../../utils/printDocument';

interface Props {
  order: LabTestOrder;
  onClose: () => void;
}

export const LabReportModal: React.FC<Props> = ({ order, onClose }) => {
  const { patients } = useClinic();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [aiReport, setAiReport] = useState<LabInterpretationResponse | null>(null);

  const documentTitle = `Official-LabReport-${order.orderNumber}`;

  // Demographic resolution
  const patient = patients.find((p) => p.id === order.patientId || p.mrn === order.patientMrn);
  const patientAge = patient?.age ?? 48;
  const patientGender = patient?.gender ?? 'Female';
  const patientBlood = patient?.bloodType ?? 'A+';

  const handlePrint = () => {
    setIsPrinting(true);
    triggerRealtimePrint({
      title: documentTitle,
      isDark: false,
      documentType: 'lab_report',
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

  const renderLabReportBody = (forPrint = false) => (
    <div className={`space-y-6 ${forPrint ? 'p-2 bg-white text-slate-950 font-sans' : 'text-slate-900 dark:text-slate-100'}`}>
      {/* Clinic & Laboratory Official Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 pb-4 gap-4">
        <div className="flex items-center gap-3.5">
          <SmartClinicLogo className="w-12 h-12 shrink-0" glow={!forPrint} />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-tight">
              Smart Clinic Diagnostic Laboratories
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Department of Clinical Pathology &amp; Molecular Diagnostics • CLIA Certified #CP-9021-A
            </p>
            <p className="text-[11px] text-slate-500">
              740 Healthcare Blvd, Suite 400 • Tel: (555) 900-SMART • DOH Lic. No. 09-0824-A
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2.5 py-1 rounded-md border border-slate-300 inline-block">
            {order.orderNumber}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Order Date: <strong className="text-slate-800">{order.requestedAt ? order.requestedAt.split('T')[0] : '2026-10-06'}</strong>
          </p>
          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                order.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{order.status.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Patient Demographics & Test Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <p className="font-bold uppercase text-[10px] text-teal-700 tracking-wider">
            Patient Demographics
          </p>
          <p className="font-bold text-sm text-slate-900 mt-0.5">
            {order.patientName}
          </p>
          <p className="text-slate-600 mt-0.5">
            MRN: <span className="font-mono font-semibold text-slate-800">{order.patientMrn}</span> • Age: {patientAge}y • Sex: {patientGender}
          </p>
          <p className="text-[11px] text-slate-500">
            Blood Group: <strong className="text-slate-700">{patientBlood}</strong> • PhilHealth Registered
          </p>
        </div>

        <div className="sm:text-right">
          <p className="font-bold uppercase text-[10px] text-teal-700 tracking-wider">
            Laboratory Test &amp; Order Meta
          </p>
          <p className="font-bold text-sm text-slate-900 mt-0.5">
            {order.testName}
          </p>
          <p className="text-slate-600 text-[11px] mt-0.5">
            Category: <strong>{order.category}</strong> • Urgency: <span className="font-semibold text-teal-700">{order.urgency}</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Ordering Physician: {order.doctorName}
          </p>
        </div>
      </div>

      {/* Certified Results Table */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Certified Laboratory Assay Results
        </h4>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Assay Parameter</th>
                <th className="py-2.5 px-3">Observed Result</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Reference Interval</th>
                <th className="py-2.5 px-3.5 text-center">Status Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {order.results?.map((res, i) => (
                <tr
                  key={i}
                  className={
                    res.flag !== 'Normal'
                      ? 'bg-rose-50/40'
                      : 'hover:bg-slate-50/50'
                  }
                >
                  <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                    {res.parameter}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                    {res.value}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {res.unit}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {res.referenceRange}
                  </td>
                  <td className="py-2.5 px-3.5 text-center">
                    <span
                      className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                        res.flag === 'Normal'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : res.flag === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : res.flag === 'Critical'
                          ? 'bg-red-600 text-white font-black'
                          : 'bg-sky-100 text-sky-800 border border-sky-300'
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
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Clinical Pathologist &amp; Specialist Impression:</span>
          </div>
          <p className="text-slate-600 leading-relaxed pt-0.5">
            {order.interpretation}
          </p>
        </div>
      )}

      {/* Interactive AI Assistant Section (Screen only, strictly suppressed on print) */}
      {!forPrint && (
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
      )}

      {/* Legal / Accreditation Notice */}
      <div className="text-[10px] text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
          <span>Official Philippine Clinical Laboratory Result Notice:</span>
        </div>
        <p>
          This electronic laboratory report is issued under the authority of the Clinical Laboratory Director in accordance with Philippine DOH Administrative Order No. 2007-0027 and RA 4688. Verified against secondary reference calibration standards.
        </p>
      </div>

      {/* Pathologist Certification & Signatures */}
      <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-slate-200 text-xs gap-4">
        <div>
          <div className="w-48 h-8 border-b-2 border-slate-700 flex items-center justify-center italic text-slate-700 font-serif text-sm">
            Amina Diallo, MD, FPSP
          </div>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
            Chief Pathologist &amp; Laboratory Director
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            PRC Lic: 0098441 • CLIA Director ID: D-88214
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="font-mono text-[10px] text-slate-500">
            Security Hash: SC-LAB-{order.orderNumber.replace(/[^0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
          </p>
          <p className="text-[10px] text-slate-600 font-medium">
            Official Electronic Lab Transmission • RA 8792 Compliant
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Interactive Screen Modal (Hidden during print) */}
      {createPortal(
        <div
          data-print-hide="true"
          className="force-light modal-screen-container modal-screen-backdrop no-print print:hidden !print:hidden fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
            
            {/* Top Control Bar */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2">
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
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs font-semibold disabled:opacity-70"
                  title="Print official laboratory report"
                  type="button"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isPrinting ? 'Opening Print...' : 'Print Lab Report'}</span>
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
              {renderLabReportBody(false)}
            </div>

            {/* Modal Bottom Controls */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Official Laboratory Document • Ready to Print
              </span>
              <div className="flex items-center gap-2 ml-auto">
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
        </div>,
        document.body
      )}

      {/* Dedicated Pure Clinical Document Mount (Print only, fills standard A4 sheet cleanly) */}
      {createPortal(
        <div id="smartclinic-print-root">
          {renderLabReportBody(true)}
        </div>,
        document.body
      )}
    </>
  );
};
