import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Invoice } from '../../types/clinic';
import { X, Printer, Receipt, CheckCircle2 } from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { formatPeso } from '../../utils/currency';
import { triggerRealtimePrint } from '../../utils/printDocument';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<Props> = ({ invoice, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const documentTitle = `Official-Receipt-${invoice.invoiceNumber}`;

  const handlePrint = () => {
    setIsPrinting(true);
    triggerRealtimePrint({
      title: documentTitle,
      isDark: false,
      documentType: 'receipt',
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

  const balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const paymentMethodLabel = invoice.paymentMethod || 'GCash';

  const renderReceiptBody = (forPrint = false) => (
    <div className={`space-y-6 ${forPrint ? 'p-2 bg-white text-slate-950 font-sans' : 'text-slate-900 dark:text-slate-100'}`}>
      {/* Clinic & Receipt Official Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-teal-600 pb-4 gap-4">
        <div className="flex items-center gap-3.5">
          <SmartClinicLogo className="w-12 h-12 shrink-0" glow={!forPrint} />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-tight">
              Smart Clinic Integrated Healthcare
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              Patient Accounting &amp; Revenue Services • BIR CAS Registered
            </p>
            <p className="text-[11px] text-slate-500">
              740 Healthcare Blvd, Suite 400 • Tel: (555) 900-SMART • TIN: 004-982-113-000
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="font-mono font-bold text-xs bg-slate-100 text-slate-900 px-2.5 py-1 rounded-md border border-slate-300 inline-block">
            {invoice.invoiceNumber}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            Date: <strong className="text-slate-800">{invoice.date}</strong>
          </p>
          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                invoice.status === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : invoice.status === 'Partially Paid'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>{invoice.status.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Patient Details & Billing Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <p className="font-bold uppercase text-[10px] text-teal-700 tracking-wider">
            Billed Patient
          </p>
          <p className="font-bold text-sm text-slate-900 mt-0.5">
            {invoice.patientName}
          </p>
          <p className="text-slate-600 mt-0.5">
            MRN: <span className="font-mono font-semibold text-slate-800">{invoice.patientMrn}</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Insurance / HMO: {invoice.insuranceClaimStatus || 'Direct Patient Settlement'}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="font-bold uppercase text-[10px] text-teal-700 tracking-wider">
            Settlement Method
          </p>
          <p className="font-bold text-sm text-slate-900 mt-0.5">
            {paymentMethodLabel}
          </p>
          <p className="text-slate-600 text-[11px] mt-0.5">
            Transaction Code: <span className="font-mono font-semibold text-slate-800">TXN-{invoice.invoiceNumber.replace(/[^0-9]/g, '')}-99</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Cashier ID: CAS-0042 • Terminal: SMART-POS-01
          </p>
        </div>
      </div>

      {/* Itemized Services & Fee Breakdown */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Rendered Outpatient Services &amp; Medical Supplies
        </h4>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 border-b border-slate-200 text-[10px] text-slate-600 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Item Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Rate</th>
                <th className="py-2.5 px-3.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3.5 font-semibold text-slate-900">
                    {item.description}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500">
                    {item.category}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600 font-mono">
                    {formatPeso(item.unitPrice)}
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 font-mono">
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
        <div className="space-y-2 text-xs text-slate-500 max-w-sm">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] space-y-1">
            <p className="font-semibold text-slate-700">BIR Notice &amp; Tax Compliance:</p>
            <p>
              This Official Payment Receipt is generated by Smart Clinic System pursuant to BIR RR 16-2005. Medical outpatient services rendered by licensed physicians are exempt from Value Added Tax (VAT) under Section 109 of the NIRC.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Gross Assessment:</span>
            <span className="font-mono font-medium">{formatPeso(invoice.subtotal || invoice.totalAmount + (invoice.discountAmount || 0))}</span>
          </div>

          {invoice.discountAmount && invoice.discountAmount > 0 ? (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Mandated Discount (Senior/PWD):</span>
              <span className="font-mono">- {formatPeso(invoice.discountAmount)}</span>
            </div>
          ) : null}

          {invoice.insuranceClaimStatus === 'Approved' ? (
            <div className="flex justify-between text-teal-700 font-semibold">
              <span>PhilHealth / HMO Claim:</span>
              <span className="font-mono">Approved</span>
            </div>
          ) : null}

          <div className="border-t border-slate-300 pt-2 flex justify-between font-extrabold text-sm text-slate-950">
            <span>Net Amount Due:</span>
            <span className="font-mono">{formatPeso(invoice.totalAmount)}</span>
          </div>

          <div className="flex justify-between text-emerald-700 font-bold border-t border-dashed border-slate-200 pt-1.5">
            <span>Total Amount Settled:</span>
            <span className="font-mono">{formatPeso(invoice.paidAmount)}</span>
          </div>

          {balanceDue > 0 ? (
            <div className="flex justify-between text-rose-700 font-bold border-t border-dashed border-slate-200 pt-1.5">
              <span>Outstanding Balance:</span>
              <span className="font-mono">{formatPeso(balanceDue)}</span>
            </div>
          ) : (
            <div className="pt-1.5 text-center">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-0.5 rounded-full">
                PAID IN FULL
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Authorized Signature & Electronic Hash */}
      <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end border-t border-slate-200 text-xs gap-4">
        <div>
          <div className="w-48 h-8 border-b-2 border-slate-700 flex items-center justify-center italic text-slate-700 font-serif text-sm">
            Maria Teresa Santos, CPA
          </div>
          <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
            Authorized Revenue Officer / Clinic Comptroller
          </p>
          <p className="text-[10px] text-slate-500 font-mono">
            PRC CPA License No. 0089124 • Revenue District 043
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="font-mono text-[10px] text-slate-500">
            Security Hash: SC-RCP-{invoice.invoiceNumber.replace(/[^0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
          </p>
          <p className="text-[10px] text-slate-600 font-medium">
            Electronic Official Receipt • RA 8792 Electronic Commerce Act Compliant
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Interactive Screen Modal (Strictly hidden during print) */}
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
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs flex items-center gap-1.5 cursor-pointer transition shadow-2xs font-semibold disabled:opacity-70"
                  title="Print official receipt"
                  type="button"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isPrinting ? 'Opening Print...' : 'Print Receipt'}</span>
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

            {/* Modal Scrollable Receipt View */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 transition-colors">
              {renderReceiptBody(false)}
            </div>

            {/* Modal Bottom Controls */}
            <div className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Official Clinic Payment Receipt • Ready to Print
              </span>
              <div className="flex items-center gap-2 ml-auto">
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
        </div>,
        document.body
      )}

      {/* Dedicated Pure Clinical Document Mount (Print only, fills standard A4 sheet cleanly) */}
      {createPortal(
        <div id="smartclinic-print-root">
          {renderReceiptBody(true)}
        </div>,
        document.body
      )}
    </>
  );
};
