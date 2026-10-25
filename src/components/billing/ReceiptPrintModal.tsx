import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Invoice } from '../../types/clinic';
import { X, Printer, Receipt, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { useTheme } from '../../context/ThemeContext';
import { formatPeso } from '../../utils/currency';
import { printHtmlViaIframe, downloadPrintDocument } from '../../utils/printDocument';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<Props> = ({ invoice, onClose }) => {
  const { isDark } = useTheme();
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

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
      title: `Receipt-${invoice.invoiceNumber}`,
      isDark,
      documentType: 'receipt',
    });
    setTimeout(() => setIsPrinting(false), 800);
  };

  const handleDownload = () => {
    const content = printAreaRef.current?.innerHTML || '';
    downloadPrintDocument(content, `Receipt-${invoice.invoiceNumber}`, {
      title: `Receipt-${invoice.invoiceNumber}`,
      isDark,
      documentType: 'receipt',
    });
  };

  const balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const paymentMethodLabel = invoice.paymentMethod || 'GCash';

  const modalContent = (
    <div className="print-modal-overlay fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="print-modal-container bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        
        {/* Modal Top Control Bar (Screen only, hidden when printing) */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between no-print gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm truncate">
                Official Clinic Payment Receipt
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs font-medium"
              title="Download print-ready receipt document"
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

        {/* Printable Receipt Document Area */}
        <div ref={printAreaRef} className="p-6 sm:p-8 print-area bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 space-y-6 overflow-y-auto flex-1 transition-colors">
          
          {/* Clinic & Receipt Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 dark:border-teal-500 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <SmartClinicLogo className="w-12 h-12 shrink-0" glow={true} />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white uppercase leading-tight">
                  Smart Clinic Integrated Healthcare
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Patient Accounting &amp; Revenue Services • BIR CAS Registered
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  740 Healthcare Blvd, Suite 400 • Tel: (555) 900-SMART • TIN: 004-982-113-000
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 inline-block">
                {invoice.invoiceNumber}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Date: <strong className="text-slate-800 dark:text-slate-200">{invoice.date}</strong>
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    invoice.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : invoice.status === 'Partially Paid'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{invoice.status.toUpperCase()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Patient Details & Billing Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div>
              <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
                Billed Patient
              </p>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                {invoice.patientName}
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                MRN: <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{invoice.patientMrn}</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Insurance / HMO: {invoice.insuranceClaimStatus || 'Direct Patient Settlement'}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="font-bold uppercase text-[10px] text-teal-700 dark:text-teal-400 tracking-wider">
                Settlement Details
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                Method: <span className="text-teal-600 dark:text-teal-400">{paymentMethodLabel}</span>
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Settled Date: {invoice.paidAt || invoice.paymentDate || invoice.date}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Currency: Philippine Peso (PHP ₱)
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Itemized Medical &amp; Clinical Charges
            </h4>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3">Service / Medication Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoice.items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {it.description}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          {it.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300 font-mono">
                        {formatPeso(it.unitPrice)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 dark:text-slate-300 font-semibold font-mono">
                        {it.quantity}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {formatPeso(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary Calculation Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1.5 text-right text-xs">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Gross Subtotal:</span>
              <span className="font-mono font-medium">{formatPeso(invoice.subtotal)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between items-center text-teal-600 dark:text-teal-400">
                <span>Senior / PWD / HMO Discount ({invoice.discountPercentage}%):</span>
                <span className="font-mono font-bold">-{formatPeso(invoice.discountAmount)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-slate-100">
              <span>Total Billed Amount:</span>
              <span className="font-mono text-base">{formatPeso(invoice.totalAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>Amount Paid ({paymentMethodLabel}):</span>
              <span className="font-mono">{formatPeso(invoice.paidAmount)}</span>
            </div>

            {balanceDue > 0 ? (
              <div className="flex justify-between items-center text-xs font-bold text-rose-600 dark:text-rose-400 pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                <span>Outstanding Balance:</span>
                <span className="font-mono">{formatPeso(balanceDue)}</span>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
                ✓ Account fully settled. Thank you for choosing Smart Clinic!
              </div>
            )}
          </div>

          {/* Legal / Compliance Notice */}
          <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Official Philippine Electronic Billing &amp; Tax Receipt Notice:</span>
            </div>
            <p>
              This electronic document serves as an official proof of payment for outpatient clinical consultations, diagnostic laboratory procedures, and pharmacy dispensations. Valid for tax deductions and PhilHealth/HMO benefit reimbursements.
            </p>
          </div>

          {/* Digital Signature & Cryptographic Hash */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-slate-200 dark:border-slate-800 text-xs gap-4">
            <div>
              <div className="w-40 h-8 border-b-2 border-slate-700 dark:border-slate-400 flex items-center justify-center italic text-slate-600 dark:text-slate-300 font-serif">
                A. Santos, CPA
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-semibold">
                Authorized Clinic Cashier / Revenue Officer
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                Security Hash: SC-RCPT-{invoice.invoiceNumber.replace(/[^0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Official Electronic Clinic Receipt • PhilHealth Accredited
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Controls (Screen only, hidden when printing) */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between no-print gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Official Clinic Payment Receipt • Ready to Print
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
              <span>{isPrinting ? 'Opening Print Dialog...' : 'Print Receipt'}</span>
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
