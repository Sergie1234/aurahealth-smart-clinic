import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { LabTestOrder } from '../../types/clinic';
import {
  FlaskConical,
  Plus,
  FileText,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Play
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';

interface Props {
  onOpenEnterResults: (order: LabTestOrder) => void;
  onOpenReport: (order: LabTestOrder) => void;
  onOpenNewLabOrder?: () => void;
}

export const LabOrdersList: React.FC<Props> = ({
  onOpenEnterResults,
  onOpenReport,
  onOpenNewLabOrder,
}) => {
  const { labOrders, updateLabStatus, activeRole, selectPatient, setActiveTab } = useClinic();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = labOrders.filter((order) => {
    const matchesSearch =
      order.patientName.toLowerCase().includes(search.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.testName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LabTestOrder['status']) => {
    switch (status) {
      case 'Result Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Reviewed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Processing':
        return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
      case 'Sample Collected':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Diagnostic Laboratory</h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
              {labOrders.length} Test Orders
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pathology tracking: Requested → Sample Collected → Processing → Result Available → Reviewed.
          </p>
        </div>

        {activeRole !== 'patient' && onOpenNewLabOrder && (
          <button
            onClick={onOpenNewLabOrder}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Order New Lab Test</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient, order #, or test name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Requested">Requested</option>
            <option value="Sample Collected">Sample Collected</option>
            <option value="Processing">Processing</option>
            <option value="Result Available">Result Available</option>
            <option value="Reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {/* Lab Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-400">
            No laboratory requests match the search criteria.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 hover:border-teal-200 transition space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-extrabold flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{order.testName}</span>
                      <span className="font-mono text-[11px] text-slate-400">({order.orderNumber})</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                          order.urgency === 'STAT'
                            ? 'bg-rose-100 text-rose-800'
                            : order.urgency === 'Urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {order.urgency}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Patient:{' '}
                      <strong
                        onClick={() => {
                          selectPatient(order.patientId);
                          setActiveTab('patients');
                        }}
                        className="text-slate-800 hover:text-teal-600 cursor-pointer"
                      >
                        {order.patientName}
                      </strong>{' '}
                      ({order.patientMrn}) • Ordering Physician: {order.doctorName}
                    </p>
                  </div>
                </div>

                {/* Status Transitions & Report Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                  {/* Workflow steps for lab staff */}
                  {(activeRole === 'lab_technician' || activeRole === 'admin') && (
                    <>
                      {order.status === 'Requested' && (
                        <button
                          onClick={() => updateLabStatus(order.id, 'Sample Collected')}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-[11px] border border-indigo-200 cursor-pointer"
                        >
                          Collect Sample
                        </button>
                      )}
                      {order.status === 'Sample Collected' && (
                        <button
                          onClick={() => updateLabStatus(order.id, 'Processing')}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-[11px] border border-blue-200 cursor-pointer"
                        >
                          Start Processing
                        </button>
                      )}
                      {(order.status === 'Processing' || order.status === 'Requested' || order.status === 'Sample Collected') && (
                        <button
                          onClick={() => onOpenEnterResults(order)}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer shadow-xs"
                        >
                          Enter Results
                        </button>
                      )}
                    </>
                  )}

                  {/* Doctor mark reviewed */}
                  {order.status === 'Result Available' && activeRole === 'doctor' && (
                    <button
                      onClick={() => updateLabStatus(order.id, 'Reviewed')}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer shadow-xs"
                    >
                      Sign & Certify
                    </button>
                  )}

                  {/* View Full Report */}
                  {order.results && (
                    <button
                      onClick={() => onOpenReport(order)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                      <span>Lab Report & AI Interpretation</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Lab Parameters Preview if results exist */}
              {order.results && (
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Certified Parameters</span>
                    <span>Reference Standard</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {order.results.map((r, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded border text-xs flex justify-between items-center ${
                          r.flag !== 'Normal'
                            ? 'bg-rose-50/70 border-rose-200 text-rose-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <span className="block text-[11px]">{r.parameter}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Ref: {r.referenceRange}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold">
                            {r.value} {r.unit}
                          </span>
                          {r.flag !== 'Normal' && (
                            <span className="block text-[9px] font-extrabold uppercase text-rose-600">
                              {r.flag}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
