import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Invoice, InvoiceItem } from '../../types/clinic';
import {
  Receipt,
  Plus,
  DollarSign,
  Printer,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  X,
  FileText
} from 'lucide-react';
import { formatPeso } from '../../utils/currency';

export const BillingList: React.FC = () => {
  const { invoices, payInvoice, addInvoice, patients, activeRole } = useClinic();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<Invoice['paymentMethod']>('GCash');

  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newPatId, setNewPatId] = useState(patients[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('2026-10-20');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Physician Outpatient Consultation', category: 'Consultation', quantity: 1, unitPrice: 800.00, total: 800.00 },
  ]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('500');
  const [newItemCategory, setNewItemCategory] = useState<InvoiceItem['category']>('Laboratory');

  const [viewReceipt, setViewReceipt] = useState<Invoice | null>(null);

  const isPatient = activeRole === 'patient';

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (isPatient ? true : inv.patientName.toLowerCase().includes(search.toLowerCase())) &&
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== 'Cancelled')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  const patientPaid = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const patientBalance = filteredInvoices
    .filter((i) => i.status !== 'Cancelled')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    payInvoice(payingInvoice.id, payAmount, payMethod);
    setPayingInvoice(null);
  };

  const handleAddItem = () => {
    if (!newItemDesc.trim()) return;
    const price = Number(newItemPrice) || 0;
    setInvoiceItems((prev) => [
      ...prev,
      {
        id: `ii-${Date.now()}`,
        description: newItemDesc.trim(),
        category: newItemCategory,
        quantity: 1,
        unitPrice: price,
        total: price,
      },
    ]);
    setNewItemDesc('');
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === newPatId);
    if (!pat || invoiceItems.length === 0) return;

    const subtotal = invoiceItems.reduce((sum, i) => sum + i.total, 0);
    const discAmount = (subtotal * discountPercent) / 100;
    const total = subtotal - discAmount;

    addInvoice({
      patientId: pat.id,
      patientName: pat.fullName,
      patientMrn: pat.mrn,
      date: '2026-10-06',
      dueDate: newDueDate,
      items: invoiceItems,
      subtotal,
      discountPercentage: discountPercent,
      discountAmount: discAmount,
      taxAmount: 0,
      totalAmount: total,
      paidAmount: 0,
      status: 'Unpaid',
      insuranceClaimStatus: 'Pending',
    });

    setShowNewInvoice(false);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto text-xs font-sans pb-10">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {isPatient ? 'My Billing & Payment Statements' : 'Billing & Payment Invoices'}
            </h1>
            {isPatient ? (
              <>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {formatPeso(patientPaid)} Total Paid
                </span>
                <span className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  {formatPeso(patientBalance)} Outstanding Balance
                </span>
              </>
            ) : (
              <>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {formatPeso(totalCollected)} Collected
                </span>
                <span className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  {formatPeso(totalOutstanding)} Outstanding
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isPatient
              ? 'Specific Task: Review personal clinic statements, official receipts (OR), and online payment options (PHP).'
              : 'Specific Task: Point of Service (POS) collection, PhilHealth Konsulta claims, and revenue reconciliation.'}
          </p>
        </div>

        {/* Generate Invoice: STRICTLY CONDITIONAL - NEVER rendered for Patient */}
        {!isPatient && (
          <button
            onClick={() => setShowNewInvoice(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        )}
      </div>

      {/* Security & Isolation Notice */}
      <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200">
          <Receipt className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            {isPatient
              ? 'Financial Privacy Enforced: You are viewing solely your verified billing transactions. Other patient records are strictly isolated.'
              : 'Financial Audit Active: All invoice creations, discount overrides, and collections are timestamped.'}
          </span>
        </div>
        <span className="font-mono text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-bold">
          FINANCIAL RLS
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number or patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs focus:outline-none dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Invoice # & Date</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Paid Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No billing records found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block font-mono">{inv.invoiceNumber}</span>
                      <span className="text-[10px] text-slate-400">Date: {inv.date}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">{inv.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{inv.patientMrn}</span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="text-slate-600 truncate block">
                        {inv.items.map((it) => it.description).join(', ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {inv.items.length} item(s) • Claim: {inv.insuranceClaimStatus || 'None'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatPeso(inv.totalAmount)}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-emerald-700">{formatPeso(inv.paidAmount)}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.status !== 'Paid' && (activeRole === 'receptionist' || activeRole === 'admin') && (
                          <button
                            onClick={() => {
                              setPayingInvoice(inv);
                              setPayAmount(inv.totalAmount - inv.paidAmount);
                            }}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-semibold text-xs cursor-pointer shadow-2xs"
                          >
                            Collect Payment
                          </button>
                        )}

                        {inv.status !== 'Paid' && isPatient && (
                          <button
                            onClick={() => {
                              setPayingInvoice(inv);
                              setPayAmount(inv.totalAmount - inv.paidAmount);
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs cursor-pointer shadow-2xs"
                          >
                            Pay Online
                          </button>
                        )}

                        <button
                          onClick={() => setViewReceipt(inv)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition cursor-pointer"
                          title="View & Print Official Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {payingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 max-w-sm w-full text-xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Process Patient Payment</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Invoice <strong>{payingInvoice.invoiceNumber}</strong> for {payingInvoice.patientName}
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Amount to Pay (₱)</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={payingInvoice.totalAmount - payingInvoice.paidAmount}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs"
                >
                  <option value="GCash">GCash</option>
                  <option value="Maya">Maya</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Insurance">PhilHealth / HMO</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-between no-print">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Clinic Payment Receipt</span>
              <button onClick={() => setViewReceipt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 print-area bg-white dark:bg-slate-900 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-black text-sm uppercase text-slate-900 dark:text-slate-100">Smart Clinic Receipt</h2>
                <p className="text-[10px] text-slate-500">Official Patient Billing Statement (PHP)</p>
                <p className="font-mono text-[11px] font-bold text-teal-700 mt-1">{viewReceipt.invoiceNumber}</p>
              </div>

              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <div>
                  <p><strong>Patient:</strong> {viewReceipt.patientName}</p>
                  <p><strong>MRN:</strong> {viewReceipt.patientMrn}</p>
                </div>
                <div className="text-right">
                  <p><strong>Date:</strong> {viewReceipt.date}</p>
                  <p><strong>Status:</strong> <span className="font-bold text-emerald-700">{viewReceipt.status}</span></p>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {viewReceipt.items.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2 px-3">{it.description}</td>
                        <td className="py-2 px-3 text-right">{it.quantity}</td>
                        <td className="py-2 px-3 text-right font-medium">{formatPeso(it.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-right text-xs">
                <p className="text-slate-500">Subtotal: {formatPeso(viewReceipt.subtotal)}</p>
                {viewReceipt.discountAmount > 0 && (
                  <p className="text-teal-600 font-semibold">Discount ({viewReceipt.discountPercentage}%): -{formatPeso(viewReceipt.discountAmount)}</p>
                )}
                <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 pt-1">
                  Total Billed: {formatPeso(viewReceipt.totalAmount)}
                </p>
                <p className="font-bold text-emerald-700">
                  Amount Paid: {formatPeso(viewReceipt.paidAmount)} ({viewReceipt.paymentMethod || 'GCash'})
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex justify-between items-center no-print">
              <span className="text-[11px] text-slate-400">Electronic Clinic Receipt • Philippine Peso</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setViewReceipt(null)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 max-w-md w-full text-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Generate Patient Invoice</h3>
              <button onClick={() => setShowNewInvoice(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Patient</label>
                <select
                  value={newPatId}
                  onChange={(e) => setNewPatId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-xs"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block text-[10px] uppercase">Invoice Items</label>
                {invoiceItems.map((item) => (
                  <div key={item.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600 flex justify-between items-center">
                    <span>{item.description} ({item.category})</span>
                    <span className="font-bold">{formatPeso(item.total)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-600 space-y-2">
                <input
                  type="text"
                  placeholder="Item description (e.g. ECG Analysis, CBC Lab Panel)"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Price (₱)"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-24 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs"
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="flex-1 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-xs"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Procedure">Procedure</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-2.5 py-1 bg-slate-800 text-white rounded font-semibold text-xs cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Discount %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowNewInvoice(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
