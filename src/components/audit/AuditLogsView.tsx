import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { ShieldCheck, Search, Filter, Clock, User, ShieldAlert, FileText } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useClinic();
  const [filterAction, setFilterAction] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(search.toLowerCase());

    const matchesAction = filterAction === 'ALL' || log.resourceType === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes('VIEW')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (action.includes('CREATE') || action.includes('ENTERED')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (action.includes('DISPENSED')) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (action.includes('SECURITY')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-4">
      {/* Header and Compliance Status */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Security & Clinical Audit Logs</h1>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immutable Ledger Active</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            HIPAA/HITECH compliant tamper-evident audit trail tracking all clinical access, electronic prescriptions, and modifications.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, user, patient ID, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Resource:</span>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Resources</option>
            <option value="Patient">Patient</option>
            <option value="Consultation">Consultation</option>
            <option value="Prescription">Prescription</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Billing">Billing</option>
            <option value="Security">Security</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Timestamp & IP</th>
                <th className="py-3 px-3">Staff Member & Role</th>
                <th className="py-3 px-3">Event Action</th>
                <th className="py-3 px-3">Resource Target</th>
                <th className="py-3 px-4">Audited Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records match the search filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-slate-900 block font-medium">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleDateString()} • {log.ipAddress || '127.0.0.1'}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{log.userName}</span>
                      <span className="text-[10px] text-teal-700 font-semibold uppercase">
                        {log.userRole.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800">{log.resourceType}</span>
                      <span className="text-[10px] font-mono text-slate-400 block">{log.resourceId}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 leading-relaxed">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
