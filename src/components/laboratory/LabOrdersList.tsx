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
  Play,
  ShieldCheck,
  Lock
} from 'lucide-react';

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
  const isPatient = activeRole === 'patient';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredOrders = labOrders.filter((order) => {
    const matchesSearch =
      (isPatient ? true : order.patientName.toLowerCase().includes(search.toLowerCase())) &&
      (order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.testName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: LabTestOrder['status']) => {
    switch (status) {
      case 'Result Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800';
      case 'Reviewed':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 animate-pulse';
      case 'Sample Collected':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto text-xs font-sans pb-10">
      {/* Header and Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isPatient ? 'My Diagnostic Lab Results' : 'Diagnostic Pathology & Lab'}
            </h1>
            <span className="text-xs bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-semibold px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'Test Order' : 'Test Orders'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isPatient
              ? 'Specific Task: View your digital diagnostic laboratory reports, pathology findings, and clinician interpretations.'
              : 'Specific Task: Outpatient laboratory workflow: specimen logging, technician result entry, and pathologist sign-off.'}
          </p>
        </div>

        {/* Strictly conditional: Order Lab is NEVER rendered for Patient */}
        {!isPatient && onOpenNewLabOrder && (
          <button
            onClick={onOpenNewLabOrder}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Order New Lab Test</span>
          </button>
        )}
      </div>

      {/* Security & Privacy Notice */}
      <div className="p-3 bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/60 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200">
          <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {isPatient
              ? 'Diagnostic Confidentiality: You are viewing only your official diagnostic panels. Other patient results remain encrypted and blocked.'
              : 'RA 10173 Audit Active: Lab orders and result entries are authenticated with clinical technician signatures.'}
          </span>
        </div>
        <span className="font-mono text-[10px] bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded font-bold">
          LAB AUDIT ACTIVE
        </span>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isPatient ? 'Search test name or order number...' : 'Search by test name or order #...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
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
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            {isPatient ? 'No diagnostic laboratory records found.' : 'No laboratory requests match the search criteria.'}
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 hover:border-teal-200 dark:hover:border-teal-800 transition space-y-3 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-extrabold flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{order.testName}</span>
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
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : order.urgency === 'Urgent'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {order.urgency}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Patient: <strong className="text-slate-800 dark:text-slate-200">{order.patientName}</strong> ({order.patientMrn}) • Ordering Physician: {order.doctorName}
                    </p>
                  </div>
                </div>

                {/* Status Transitions & Report Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                  {/* Workflow steps for authorized lab staff ONLY */}
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
                  {activeRole === 'doctor' && order.status === 'Result Available' && (
                    <button
                      onClick={() => updateLabStatus(order.id, 'Reviewed')}
                      className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                    >
                      Sign Off / Review
                    </button>
                  )}

                  {/* View digital report */}
                  {(order.status === 'Result Available' || order.status === 'Reviewed') && (
                    <button
                      onClick={() => onOpenReport(order)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-200 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Official Report</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Result Summary Preview if Available */}
              {order.results && order.results.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      Test Parameters ({order.results.length} Analyzed)
                    </span>
                    {order.interpretation && (
                      <span className="text-[10px] text-teal-700 dark:text-teal-300 font-medium bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
                        {order.interpretation}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {order.results.slice(0, 4).map((r, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] text-slate-400 block truncate">{r.parameter}</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className={`font-mono font-bold text-xs ${r.flag === 'Critical' || r.flag === 'High' || r.flag === 'Low' ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                            {r.value}
                          </span>
                          <span className="text-[9px] text-slate-400">{r.unit}</span>
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
