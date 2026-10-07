import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  ShieldAlert,
  Users,
  Receipt,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Lock,
  Mail,
  AlertCircle,
  Database,
  Calendar,
  Layers,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';

export const AdminDashboardView: React.FC = () => {
  const {
    currentUser,
    users,
    patients,
    appointments,
    invoices,
    auditLogs,
    setActiveTab,
  } = useClinic();

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const outstandingRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs font-sans pb-12">
      {/* 1. Header Hero with 2FA Trust Mark */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-indigo-800/40">
        <div className="flex items-center gap-4">
          <SmartClinicLogo className="w-14 h-14" glow={true} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>Executive Clinic Director</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>2FA Authenticated via smartclinicrealacc@gmail.com</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              Welcome, {currentUser.name}
            </h1>
            <p className="text-slate-300 text-xs mt-0.5 max-w-xl">
              Clinic Operations, Financial Oversight & Cryptographic Audit Trails. Adheres to Philippine National Privacy Commission (RA 10173).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('audit-logs')}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit & Compliance Logs</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Collected Revenue</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">${totalRevenue.toFixed(2)}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Active Fiscal Cycle</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Outstanding Balances</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">${outstandingRevenue.toFixed(2)}</p>
          <span className="text-[10px] text-amber-700 font-semibold">Pending Settlement</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Registered Patients</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">{patients.length}</p>
          <span className="text-[10px] text-teal-700 font-semibold">Active Clinical Records</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>Security Audit Events</span>
            <Lock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 font-mono">{auditLogs.length}</p>
          <span className="text-[10px] text-indigo-700 font-semibold">Tamper-evident Entries</span>
        </div>
      </div>

      {/* 3. 2FA Verification & Security Governance Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Admin Authentication Governance</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                2FA Verified Session
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Admin session is locked to authorized email confirmation via <span className="font-mono font-bold text-indigo-700">smartclinicrealacc@gmail.com</span> with 256-bit AES cryptographic tokenization.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 shrink-0">
          Source: smartclinicrealacc@gmail.com
        </div>
      </div>

      {/* 4. Staff Directory & Recent Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Staff Directory & Role Access Matrix */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900">Hospital Staff Access Matrix</h3>
            </div>
            <span className="text-xs text-slate-500">{users.length} Authorized Users</span>
          </div>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{u.name}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {u.email} • {u.department || 'Outpatient Clinic'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800 font-mono">
                  {u.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cryptographic Audit Trail Preview */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">Tamper-Evident Security Log</h3>
            </div>
            <button
              onClick={() => setActiveTab('audit-logs')}
              className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              View Full Logs
            </button>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 font-mono text-[11px]">
            {auditLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold text-indigo-700">{log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-600 font-sans text-xs">{log.description}</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Actor: {log.userName}</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
