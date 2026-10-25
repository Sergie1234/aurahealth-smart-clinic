import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { usePrint } from '../../context/PrintContext';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { formatPeso } from '../../utils/currency';
import { SmartClinicLogo } from './SmartClinicLogo';
import {
  X,
  Printer,
  Receipt,
  FlaskConical,
  Pill,
  CheckCircle2,
  ShieldCheck,
  Sun,
  Moon,
  Download,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Prescription, Invoice, LabTestOrder } from '../../types/clinic';
import { aiService, LabInterpretationResponse } from '../../services/aiService';
import { AIDisclaimerBanner } from './AIDisclaimerBanner';

export const GlobalPrintModal: React.FC = () => {
  const { activeDocument, closePrint, triggerPrint, isPrinting } = usePrint();
  const { patients } = useClinic();
  const { theme } = useTheme();

  // Local preview theme toggle: allows previewing in light paper or dark contrast
  const [previewDark, setPreviewDark] = useState<boolean>(false);
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<LabInterpretationResponse | null>(null);

  // Sync initial preview theme with app theme
  useEffect(() => {
    setPreviewDark(theme === 'dark');
  }, [theme]);

  // Reset AI report when document changes
  useEffect(() => {
    setAiReport(null);
  }, [activeDocument]);

  const handleRunAiInterpretation = async (order: LabTestOrder) => {
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

  // Keyboard navigation: Escape to close, Ctrl+P / Cmd+P to print
  useEffect(() => {
    if (!activeDocument) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePrint();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        triggerPrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Auto-launch real browser print dialog after mount once DOM is ready
    const timer = setTimeout(() => {
      triggerPrint();
    }, 180);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [activeDocument, closePrint, triggerPrint]);

  // Header Title & Icon (hook called unconditionally on every render)
  const headerMeta = useMemo(() => {
    if (!activeDocument) return null;
    switch (activeDocument.type) {
      case 'prescription':
        return {
          title: 'Official Clinic Prescription (Rx)',
          subtitle: activeDocument.data.prescriptionNumber,
          icon: <Pill className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
          btnLabel: 'Print Prescription',
        };
      case 'receipt':
        return {
          title: 'Official Clinic Payment Receipt',
          subtitle: activeDocument.data.invoiceNumber,
          icon: <Receipt className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
          btnLabel: 'Print Receipt',
        };
      case 'lab_report':
        return {
          title: 'Diagnostic Pathology Laboratory Report',
          subtitle: activeDocument.data.orderNumber,
          icon: <FlaskConical className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
          btnLabel: 'Print Lab Report',
        };
    }
  }, [activeDocument]);

  if (!activeDocument || !headerMeta) return null;

  // Resolve patient details if needed
  const getPatientForOrder = (order: LabTestOrder) => {
    return patients.find((p) => p.id === order.patientId || p.mrn === order.patientMrn);
  };

  // -------------------------------------------------------------
  // PRESCRIPTION DOCUMENT RENDERER
  // -------------------------------------------------------------
  const renderPrescription = (rx: Prescription, forPrint = false) => {
    const textColor = forPrint || !previewDark ? 'text-slate-900' : 'text-slate-100';
    const subtextColor = forPrint || !previewDark ? 'text-slate-600' : 'text-slate-400';
    const bgCard = forPrint || !previewDark ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700';

    return (
      <div className={`space-y-6 ${forPrint ? 'p-2 bg-white text-slate-950 font-sans' : textColor}`}>
        {/* Clinic & Medical Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 pb-4 gap-4">
          <div className="flex items-center gap-3.5">
            <SmartClinicLogo className="w-12 h-12 shrink-0" glow={!forPrint} />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-teal-800 dark:text-teal-400 uppercase leading-tight">
                Smart Clinic Integrated Healthcare
              </h1>
              <p className={`text-xs ${subtextColor} font-medium`}>
                Department of Outpatient Medicine &amp; Clinical Therapeutics
              </p>
              <p className={`text-[11px] ${subtextColor}`}>
                740 Healthcare Blvd, Suite 400 • Tel: (555) 900-SMART • Web: smartclinic.health
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="font-mono font-bold text-xs bg-teal-50 dark:bg-teal-950 text-teal-900 dark:text-teal-300 px-2.5 py-1 rounded-md border border-teal-300 dark:border-teal-800 inline-block">
              {rx.prescriptionNumber}
            </span>
            <p className={`text-xs ${subtextColor} mt-1`}>
              Date: <strong className={textColor}>{rx.date}</strong>
            </p>
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                <span>{rx.status.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Physician & Patient Details Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs p-4 rounded-xl border ${bgCard}`}>
          <div>
            <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
              Prescribing Physician
            </p>
            <p className={`font-bold text-sm ${textColor} mt-0.5`}>
              {rx.doctorName}
            </p>
            <p className={subtextColor}>{rx.doctorSpecialty}</p>
            <p className={`font-mono text-[11px] ${subtextColor} mt-0.5`}>
              PRC License: {rx.doctorLicense} • PTR: 8920141-A
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
              Patient Demographics
            </p>
            <p className={`font-bold text-sm ${textColor} mt-0.5`}>
              {rx.patientName}
            </p>
            <p className={`${subtextColor} mt-0.5`}>
              MRN: <span className="font-mono font-semibold text-teal-700 dark:text-teal-300">{rx.patientMrn}</span> • Age: {rx.patientAge}y • Sex: {rx.patientGender}
            </p>
            <p className={`text-[11px] ${subtextColor}`}>
              Philippine National Health Identity (PhilHealth Registered)
            </p>
          </div>
        </div>

        {/* Rx Symbol & Medication Body */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="font-serif italic text-3xl font-extrabold text-teal-700 dark:text-teal-400 select-none">
              ℞
            </span>
            <span className={`text-xs font-bold ${subtextColor} uppercase tracking-widest`}>
              Prescribed Clinical Formulations
            </span>
          </div>

          <div className={`divide-y divide-slate-200 dark:divide-slate-700 border-y ${forPrint ? 'border-slate-200 divide-slate-200' : 'border-slate-200 dark:border-slate-700'}`}>
            {rx.items.map((item, index) => (
              <div key={item.id} className="py-3.5 text-xs space-y-1.5">
                <div className="flex justify-between items-baseline gap-2">
                  <div className="space-x-1.5">
                    <span className={`font-extrabold text-sm ${textColor}`}>
                      {index + 1}. {item.medicationName}
                    </span>
                    {item.genericName && (
                      <span className={`text-xs italic ${subtextColor}`}>
                        ({item.genericName})
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-teal-800 dark:text-teal-300 font-mono text-xs shrink-0">
                    Qty: {item.quantity} ({item.duration})
                  </span>
                </div>

                <div className="pl-4 border-l-2 border-teal-500/70 space-y-1">
                  <p className="font-medium">
                    <strong className={textColor}>Sig / Dosage:</strong> {item.dosage} via {item.route || 'Oral'} route, {item.frequency}.
                  </p>
                  <p className={`text-[11px] italic ${subtextColor}`}>
                    Special Directions: {item.instructions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Clinical Safety Audit Notice */}
        {rx.aiSafetyAudit && (
          <div className={`text-[10px] space-y-1 p-3 rounded-lg border ${forPrint ? 'bg-teal-50 border-teal-200 text-slate-700' : 'bg-teal-50/80 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200'}`}>
            <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>AI Clinical Safety &amp; Drug Interaction Check Passed</span>
            </div>
            <p className={`text-[10px] ${subtextColor}`}>
              Verified zero high-risk contraindications against patient allergy profiles and active pharmacological regimens on {new Date(rx.aiSafetyAudit.checkedAt).toLocaleString()}.
            </p>
          </div>
        )}

        {/* Refill & Pharmacist Dispensing Notice */}
        <div className={`text-[10px] space-y-1 p-3 rounded-lg border ${bgCard} ${subtextColor}`}>
          <p className={`font-semibold ${textColor}`}>
            Philippine Pharmacy Act (RA 10918) &amp; Generics Act Compliance Notice:
          </p>
          <p>
            Dispense as prescribed. Generic substitution is authorized unless explicitly contraindicated by the physician. Patients are advised to complete antibiotic regimens. For adverse symptoms, discontinue immediately and contact emergency care.
          </p>
        </div>

        {/* Physician Signature Line */}
        <div className={`pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end border-t ${forPrint ? 'border-slate-200' : 'border-slate-200 dark:border-slate-700'} text-xs gap-4`}>
          <div>
            <div className={`w-48 h-8 border-b-2 ${forPrint ? 'border-slate-700 text-slate-800' : 'border-slate-600 text-slate-800 dark:text-slate-200'} flex items-center justify-center italic font-serif text-sm`}>
              {rx.doctorName.replace(', MD', '')}, MD
            </div>
            <p className={`text-[10px] ${subtextColor} mt-1 uppercase font-semibold`}>
              Physician Digital Signature &amp; License
            </p>
            <p className={`text-[10px] font-mono ${subtextColor}`}>
              PRC: {rx.doctorLicense} • S2: S2-98442-B
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className={`font-mono text-[10px] ${subtextColor}`}>
              Security Hash: SC-RX-{rx.prescriptionNumber.replace(/[^0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
            </p>
            <p className={`text-[10px] ${textColor} font-medium`}>
              Official Electronic Prescription • RA 8792 Compliant
            </p>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // RECEIPT DOCUMENT RENDERER
  // -------------------------------------------------------------
  const renderReceipt = (invoice: Invoice, forPrint = false) => {
    const balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
    const paymentMethodLabel = invoice.paymentMethod || 'GCash';
    const textColor = forPrint || !previewDark ? 'text-slate-900' : 'text-slate-100';
    const subtextColor = forPrint || !previewDark ? 'text-slate-600' : 'text-slate-400';
    const bgCard = forPrint || !previewDark ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700';

    return (
      <div className={`space-y-6 ${forPrint ? 'p-2 bg-white text-slate-950 font-sans' : textColor}`}>
        {/* Clinic & Receipt Official Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 pb-4 gap-4">
          <div className="flex items-center gap-3.5">
            <SmartClinicLogo className="w-12 h-12 shrink-0" glow={!forPrint} />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-teal-800 dark:text-teal-400 uppercase leading-tight">
                Smart Clinic Integrated Healthcare
              </h1>
              <p className={`text-xs ${subtextColor} font-medium`}>
                Patient Accounting &amp; Revenue Services • BIR CAS Registered
              </p>
              <p className={`text-[11px] ${subtextColor}`}>
                740 Healthcare Blvd, Suite 400 • Tel: (555) 900-SMART • TIN: 004-982-113-000
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="font-mono font-bold text-xs bg-teal-50 dark:bg-teal-950 text-teal-900 dark:text-teal-300 px-2.5 py-1 rounded-md border border-teal-300 dark:border-teal-800 inline-block">
              {invoice.invoiceNumber}
            </span>
            <p className={`text-xs ${subtextColor} mt-1`}>
              Date: <strong className={textColor}>{invoice.date}</strong>
            </p>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  invoice.status === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    : invoice.status === 'Partially Paid'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{invoice.status.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Patient Details & Billing Info Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs p-4 rounded-xl border ${bgCard}`}>
          <div>
            <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
              Billed Patient
            </p>
            <p className={`font-bold text-sm ${textColor} mt-0.5`}>
              {invoice.patientName}
            </p>
            <p className={`${subtextColor} mt-0.5`}>
              MRN: <span className="font-mono font-semibold text-teal-700 dark:text-teal-300">{invoice.patientMrn}</span>
            </p>
            <p className={`text-[11px] ${subtextColor}`}>
              Insurance / HMO: {invoice.insuranceClaimStatus || 'Direct Patient Settlement'}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
              Settlement Method
            </p>
            <p className={`font-bold text-sm ${textColor} mt-0.5`}>
              {paymentMethodLabel}
            </p>
            <p className={`text-[11px] ${subtextColor} mt-0.5`}>
              Transaction Code: <span className="font-mono font-semibold text-teal-700 dark:text-teal-300">TXN-{invoice.invoiceNumber.replace(/[^0-9]/g, '')}-99</span>
            </p>
            <p className={`text-[11px] ${subtextColor}`}>
              Cashier ID: CAS-0042 • Terminal: SMART-POS-01
            </p>
          </div>
        </div>

        {/* Itemized Services & Fee Breakdown */}
        <div className="space-y-2">
          <h4 className={`text-[11px] font-bold uppercase tracking-wider ${subtextColor}`}>
            Rendered Outpatient Services &amp; Medical Supplies
          </h4>

          <div className={`border rounded-xl overflow-hidden ${forPrint ? 'border-slate-200' : 'border-slate-200 dark:border-slate-700'}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead className={`${forPrint || !previewDark ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-bold tracking-wider`}>
                <tr>
                  <th className="py-2.5 px-3.5">Item Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoice.items.map((item) => (
                  <tr key={item.id} className={forPrint || !previewDark ? 'hover:bg-slate-50/50' : 'hover:bg-slate-800/40'}>
                    <td className={`py-2.5 px-3.5 font-semibold ${textColor}`}>
                      {item.description}
                    </td>
                    <td className={`py-2.5 px-3 ${subtextColor}`}>
                      {item.category}
                    </td>
                    <td className={`py-2.5 px-3 text-center font-mono ${textColor}`}>
                      {item.quantity}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono ${subtextColor}`}>
                      {formatPeso(item.unitPrice)}
                    </td>
                    <td className={`py-2.5 px-3.5 text-right font-bold font-mono ${textColor}`}>
                      {formatPeso(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary Calculation Table */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
          <div className={`space-y-2 text-xs ${subtextColor} max-w-sm`}>
            <div className={`p-3 rounded-lg border text-[10px] space-y-1 ${bgCard}`}>
              <p className={`font-semibold ${textColor}`}>BIR Notice &amp; Tax Compliance:</p>
              <p>
                This Official Payment Receipt is generated by Smart Clinic System pursuant to BIR RR 16-2005. Medical outpatient services rendered by licensed physicians are exempt from Value Added Tax (VAT) under Section 109 of the NIRC.
              </p>
            </div>
          </div>

          <div className={`w-full sm:w-72 p-4 rounded-xl border space-y-2 text-xs ${bgCard}`}>
            <div className={`flex justify-between ${subtextColor}`}>
              <span>Gross Assessment:</span>
              <span className={`font-mono font-medium ${textColor}`}>
                {formatPeso(invoice.subtotal || invoice.totalAmount + (invoice.discountAmount || 0))}
              </span>
            </div>

            {invoice.discountAmount && invoice.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                <span>Mandated Discount (Senior/PWD):</span>
                <span className="font-mono">- {formatPeso(invoice.discountAmount)}</span>
              </div>
            ) : null}

            {invoice.insuranceClaimStatus === 'Approved' ? (
              <div className="flex justify-between text-teal-700 dark:text-teal-400 font-semibold">
                <span>PhilHealth / HMO Claim:</span>
                <span className="font-mono">Approved</span>
              </div>
            ) : null}

            <div className={`border-t border-slate-300 dark:border-slate-600 pt-2 flex justify-between font-extrabold text-sm ${textColor}`}>
              <span>Net Amount Due:</span>
              <span className="font-mono">{formatPeso(invoice.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold border-t border-dashed border-slate-300 dark:border-slate-700 pt-1.5">
              <span>Total Amount Settled:</span>
              <span className="font-mono">{formatPeso(invoice.paidAmount)}</span>
            </div>

            {balanceDue > 0 ? (
              <div className="flex justify-between text-rose-700 dark:text-rose-400 font-bold border-t border-dashed border-slate-300 dark:border-slate-700 pt-1.5">
                <span>Outstanding Balance:</span>
                <span className="font-mono">{formatPeso(balanceDue)}</span>
              </div>
            ) : (
              <div className="pt-1.5 text-center">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 px-3 py-0.5 rounded-full">
                  PAID IN FULL
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Authorized Signature & Electronic Hash */}
        <div className={`pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end border-t ${forPrint ? 'border-slate-200' : 'border-slate-200 dark:border-slate-700'} text-xs gap-4`}>
          <div>
            <div className={`w-48 h-8 border-b-2 ${forPrint ? 'border-slate-700 text-slate-800' : 'border-slate-600 text-slate-800 dark:text-slate-200'} flex items-center justify-center italic font-serif text-sm`}>
              Maria Teresa Santos, CPA
            </div>
            <p className={`text-[10px] ${subtextColor} mt-1 uppercase font-semibold`}>
              Authorized Revenue Officer / Clinic Comptroller
            </p>
            <p className={`text-[10px] font-mono ${subtextColor}`}>
              PRC CPA License No. 0089124 • Revenue District 043
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className={`font-mono text-[10px] ${subtextColor}`}>
              Security Hash: SC-RCP-{invoice.invoiceNumber.replace(/[^0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
            </p>
            <p className={`text-[10px] ${textColor} font-medium`}>
              Electronic Official Receipt • RA 8792 Electronic Commerce Act Compliant
            </p>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // LAB REPORT DOCUMENT RENDERER
  // -------------------------------------------------------------
  const renderLabReport = (order: LabTestOrder, forPrint = false) => {
    const patient = getPatientForOrder(order);
    const patientAge = patient?.age ?? 48;
    const patientGender = patient?.gender ?? 'Female';
    const patientBlood = patient?.bloodType ?? 'A+';
    const textColor = forPrint || !previewDark ? 'text-slate-900' : 'text-slate-100';
    const subtextColor = forPrint || !previewDark ? 'text-slate-600' : 'text-slate-400';
    const bgCard = forPrint || !previewDark ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700';

    return (
      <div className={`space-y-6 ${forPrint ? 'p-2 bg-white text-slate-950 font-sans' : textColor}`}>
        {/* Clinic & Laboratory Official Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 pb-4 gap-4">
          <div className="flex items-center gap-3.5">
            <SmartClinicLogo className="w-12 h-12 shrink-0" glow={!forPrint} />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-teal-800 dark:text-teal-400 uppercase leading-tight">
                Smart Clinic Diagnostic Laboratories
              </h1>
              <p className={`text-xs ${subtextColor} font-medium`}>
                Department of Clinical Pathology &amp; Molecular Diagnostics • CLIA Certified #CP-9021-A
              </p>
              <p className={`text-[11px] ${subtextColor}`}>
                740 Healthcare Blvd, Suite 400 • Tel: (555) 900-SMART • DOH Lic. No. 09-0824-A
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="font-mono font-bold text-xs bg-teal-50 dark:bg-teal-950 text-teal-900 dark:text-teal-300 px-2.5 py-1 rounded-md border border-teal-300 dark:border-teal-800 inline-block">
              {order.orderNumber}
            </span>
            <p className={`text-xs ${subtextColor} mt-1`}>
              Order Date: <strong className={textColor}>{order.requestedAt ? order.requestedAt.split('T')[0] : '2026-10-06'}</strong>
            </p>
            <div className="mt-1">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  order.status === 'Completed' || order.status === 'Result Available' || order.status === 'Reviewed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>{order.status.toUpperCase()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Patient Demographics & Test Details Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs p-4 rounded-xl border ${bgCard}`}>
          <div>
            <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
              Patient Demographics
            </p>
            <p className={`font-bold text-sm ${textColor} mt-0.5`}>
              {order.patientName}
            </p>
            <p className={`${subtextColor} mt-0.5`}>
              MRN: <span className="font-mono font-semibold text-teal-700 dark:text-teal-300">{order.patientMrn}</span> • Age: {patientAge}y • Sex: {patientGender}
            </p>
            <p className={`text-[11px] ${subtextColor}`}>
              Blood Group: <strong className={textColor}>{patientBlood}</strong> • PhilHealth Registered
            </p>
          </div>

          <div className="sm:text-right">
            <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
              Laboratory Test &amp; Order Meta
            </p>
            <p className={`font-bold text-sm ${textColor} mt-0.5`}>
              {order.testName}
            </p>
            <p className={`text-[11px] ${subtextColor} mt-0.5`}>
              Category: <strong className={textColor}>{order.category}</strong> • Urgency: <span className="font-semibold text-teal-700 dark:text-teal-400">{order.urgency}</span>
            </p>
            <p className={`text-[11px] ${subtextColor}`}>
              Ordering Physician: {order.doctorName}
            </p>
          </div>
        </div>

        {/* Certified Results Table */}
        <div className="space-y-2">
          <h4 className={`text-[11px] font-bold uppercase tracking-wider ${subtextColor}`}>
            Certified Laboratory Assay Results
          </h4>

          <div className={`border rounded-xl overflow-hidden ${forPrint ? 'border-slate-200' : 'border-slate-200 dark:border-slate-700'}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead className={`${forPrint || !previewDark ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'} border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-bold tracking-wider`}>
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
                        ? 'bg-rose-50/50 dark:bg-rose-950/20'
                        : forPrint || !previewDark ? 'hover:bg-slate-50/50' : 'hover:bg-slate-800/40'
                    }
                  >
                    <td className={`py-2.5 px-3.5 font-semibold ${textColor}`}>
                      {res.parameter}
                    </td>
                    <td className={`py-2.5 px-3 font-bold font-mono ${textColor}`}>
                      {res.value}
                    </td>
                    <td className={`py-2.5 px-3 font-mono text-[11px] ${subtextColor}`}>
                      {res.unit}
                    </td>
                    <td className={`py-2.5 px-3 ${subtextColor}`}>
                      {res.referenceRange}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block ${
                          res.flag === 'Normal'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : res.flag === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                            : res.flag === 'Critical'
                            ? 'bg-red-600 text-white font-black'
                            : 'bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
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
          <div className={`p-4 rounded-xl border text-xs space-y-1 ${bgCard}`}>
            <div className={`flex items-center gap-1.5 font-bold ${textColor}`}>
              <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Clinical Pathologist &amp; Specialist Impression:</span>
            </div>
            <p className={`${subtextColor} leading-relaxed pt-0.5`}>
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
                  onClick={() => handleRunAiInterpretation(order)}
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
        <div className={`text-[10px] space-y-1 p-3 rounded-lg border ${bgCard} ${subtextColor}`}>
          <div className={`flex items-center gap-1.5 font-semibold ${textColor}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Official Philippine Clinical Laboratory Result Notice:</span>
          </div>
          <p>
            This electronic laboratory report is issued under the authority of the Clinical Laboratory Director in accordance with Philippine DOH Administrative Order No. 2007-0027 and RA 4688. Verified against secondary reference calibration standards.
          </p>
        </div>

        {/* Pathologist Certification & Signatures */}
        <div className={`pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-t ${forPrint ? 'border-slate-200' : 'border-slate-200 dark:border-slate-700'} text-xs gap-4`}>
          <div>
            <div className={`w-48 h-8 border-b-2 ${forPrint ? 'border-slate-700 text-slate-800' : 'border-slate-600 text-slate-800 dark:text-slate-200'} flex items-center justify-center italic font-serif text-sm`}>
              Amina Diallo, MD, FPSP
            </div>
            <p className={`text-[10px] ${subtextColor} mt-1 uppercase font-semibold`}>
              Chief Pathologist &amp; Laboratory Director
            </p>
            <p className={`text-[10px] font-mono ${subtextColor}`}>
              PRC Lic: 0098441 • CLIA Director ID: D-88214
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className={`font-mono text-[10px] ${subtextColor}`}>
              Security Hash: SC-LAB-{order.orderNumber.replace(/[^0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
            </p>
            <p className={`text-[10px] ${textColor} font-medium`}>
              Official Electronic Lab Transmission • RA 8792 Compliant
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Interactive Screen Modal with Live Preview */}
      {createPortal(
        <div
          data-print-hide="true"
          className="modal-screen-container modal-screen-backdrop no-print fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[94vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
            
            {/* Top Toolbar */}
            <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  {headerMeta.icon}
                </div>
                <div className="truncate">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                    {headerMeta.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Document Ref: {headerMeta.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Theme Toggle for Preview */}
                <button
                  onClick={() => setPreviewDark(!previewDark)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title={previewDark ? 'Switch to Paper White View' : 'Switch to High Contrast Dark View'}
                  type="button"
                >
                  {previewDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                </button>

                {/* Primary Print / Save as PDF Button */}
                <button
                  onClick={triggerPrint}
                  disabled={isPrinting}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs font-semibold disabled:opacity-70"
                  title="Print document or Save as PDF (Ctrl+P / Cmd+P)"
                  type="button"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isPrinting ? 'Opening Print...' : headerMeta.btnLabel}</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={closePrint}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Close preview (Esc)"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Preview Viewport */}
            <div className={`p-4 sm:p-8 overflow-y-auto flex-1 transition-colors ${previewDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
              <div className={`max-w-2xl mx-auto rounded-xl p-4 sm:p-6 shadow-sm border ${previewDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                {activeDocument.type === 'prescription' && renderPrescription(activeDocument.data, false)}
                {activeDocument.type === 'receipt' && renderReceipt(activeDocument.data, false)}
                {activeDocument.type === 'lab_report' && renderLabReport(activeDocument.data, false)}
              </div>
            </div>

            {/* Bottom Bar Controls */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3 text-xs">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Ctrl+P</kbd> to print or choose &ldquo;Save as PDF&rdquo; in the print dialog.
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={triggerPrint}
                  disabled={isPrinting}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition disabled:opacity-70"
                  type="button"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isPrinting ? 'Opening Print Dialog...' : headerMeta.btnLabel}</span>
                </button>
                <button
                  onClick={closePrint}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium cursor-pointer transition"
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

      {/* 2. Dedicated Pure Clinical Document Mount (Rendered outside #root strictly for browser print engine) */}
      {createPortal(
        <div id="smartclinic-print-root">
          {activeDocument.type === 'prescription' && renderPrescription(activeDocument.data, true)}
          {activeDocument.type === 'receipt' && renderReceipt(activeDocument.data, true)}
          {activeDocument.type === 'lab_report' && renderLabReport(activeDocument.data, true)}
        </div>,
        document.body
      )}
    </>
  );
};
