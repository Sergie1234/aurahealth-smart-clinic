import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  ShieldAlert,
  Users,
  Receipt,
  TrendingUp,
  CheckCircle2,
  Lock,
  KeyRound,
  Plus,
  Stethoscope,
} from 'lucide-react';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { formatPeso } from '../../utils/currency';
import { AddDoctorModal } from './AddDoctorModal';

export const AdminDashboardView: React.FC = () => {
  const {
    currentUser,
    users,
    patients,
    invoices,
    auditLogs,
    setActiveTab,
    t,
    language,
  } = useClinic();

  const isFil = language === 'fil';
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const outstandingRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-xs font-sans pb-12">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 border border-indigo-800/40">
        <div className="flex items-center gap-4">
          <SmartClinicLogo className="w-14 h-14" glow={true} />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isFil ? 'Tagapamahala ng Klinika' : 'Executive Clinic Director'}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFil ? 'Ligtas na Sesyon' : 'Secure Session'} • smartclinicrealacc@gmail.com</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {t.common.welcome}, {currentUser.name}
            </h1>
            <p className="text-slate-300 text-xs mt-0.5 max-w-xl">
              {isFil
                ? 'Operasyon ng Klinika, Pananalapi, at Audit Trail alinsunod sa Philippine Data Privacy Act (RA 10173).'
                : 'Clinic Operations, Financial Oversight & Cryptographic Audit Trails. Adheres to Philippine National Privacy Commission (RA 10173).'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('audit-logs')}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold flex items-center gap-2 transition shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{t.admin.complianceAudit}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>{t.admin.revenueToday}</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{formatPeso(totalRevenue)}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">{isFil ? 'Nasingil na Halaga (PHP)' : 'Active Fiscal Cycle (PHP)'}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>{isFil ? 'Natitirang Balanse' : 'Outstanding Balances'}</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{formatPeso(outstandingRevenue)}</p>
          <span className="text-[10px] text-amber-700 font-semibold">{isFil ? 'Nakahandang Bayarin' : 'Pending Settlement'}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>{t.admin.totalPatients}</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{patients.length}</p>
          <span className="text-[10px] text-teal-700 font-semibold">{isFil ? 'Aktibong Talaan ng Pasyente' : 'Active Clinical Records'}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span>{t.admin.systemLogs}</span>
            <Lock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">{auditLogs.length}</p>
          <span className="text-[10px] text-indigo-700 font-semibold">{isFil ? 'Mga Tala ng Seguridad' : 'Tamper-evident Entries'}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Admin Authentication Governance</span>
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                Secure Admin Session
              </span>
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Admin session locked to authorized email <span className="font-mono font-bold text-indigo-700">smartclinicrealacc@gmail.com</span> with password verification and AES-256 session tokens under Philippine Health Data Security Standards.
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 shrink-0">
          Source: smartclinicrealacc@gmail.com
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.admin.manageStaff}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-sm shadow-teal-600/20 cursor-pointer"
                title={t.admin.addDoctorBtn}
              >
                <Plus className="w-3.5 h-3.5" />
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{t.admin.addDoctorBtn}</span>
              </button>
              <span className="text-xs text-slate-500">{users.length} {isFil ? 'Awtorisado' : 'Authorized'}</span>
            </div>
          </div>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{u.name}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {u.email} • {u.department || 'Outpatient Clinic'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono">
                  {u.role.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.admin.complianceAudit}</h3>
            </div>
            <button
              onClick={() => setActiveTab('audit-logs')}
              className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              {isFil ? 'Tingnan ang Lahat ng Tala' : 'View Full Logs'}
            </button>
          </div>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 font-mono text-[11px]">
            {auditLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-indigo-700">{log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-sans text-xs">{log.description}</p>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Actor: {log.userName}</span>
                  <span>IP: {log.ipAddress || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AddDoctorModal
        isOpen={showAddDoctorModal}
        onClose={() => setShowAddDoctorModal(false)}
      />
    </div>
  );
};
