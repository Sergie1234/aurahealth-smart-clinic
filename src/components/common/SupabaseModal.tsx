import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Database,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  X,
  Server,
  ShieldCheck,
  Layers
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const SupabaseModal: React.FC<Props> = ({ onClose }) => {
  const { supabaseInfo, syncAllToSupabase } = useClinic();
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    syncedCounts: Record<string, number>;
    message: string;
  } | null>(null);

  const handleCopySchema = () => {
    const sqlNotice = `-- AuraHealth Supabase (PostgreSQL) Schema
-- Execute in your Supabase SQL Editor:
-- File is located at /supabase/schema.sql in the repository.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Tables: patients, appointments, consultations, prescriptions, lab_orders, inventory_items, invoices, audit_logs`;
    navigator.clipboard.writeText(sqlNotice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    try {
      const res = await syncAllToSupabase();
      setSyncResult(res);
    } catch (err: any) {
      setSyncResult({
        success: false,
        syncedCounts: {},
        message: err?.message || 'Sync encountered an error',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Supabase & Vercel Backend Hub
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  PostgreSQL
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Cloud persistence, serverless functions, and production readiness
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Supabase Status Card */}
            <div className={`p-4 rounded-xl border ${
              supabaseInfo.isConfigured
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-amber-50/40 border-amber-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className={`w-4 h-4 ${
                    supabaseInfo.isConfigured ? 'text-emerald-600' : 'text-amber-600'
                  }`} />
                  <span className="font-bold text-xs text-slate-800">Supabase Database</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  supabaseInfo.isConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {supabaseInfo.isConfigured ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> Live Connected
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Standby (Demo Mode)
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {supabaseInfo.isConfigured
                  ? `Connected to Supabase project: ${supabaseInfo.domain}`
                  : 'Operating with responsive local state & full Express backend fallback. Connect credentials to sync to cloud PostgreSQL.'}
              </p>
            </div>

            {/* Vercel Status Card */}
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-sky-600" />
                  <span className="font-bold text-xs text-slate-800">Vercel Deployment</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configured with <code className="text-slate-800 font-mono text-[11px]">vercel.json</code>, zero-config build, and serverless API handlers in <code className="text-slate-800 font-mono text-[11px]">/api/index.ts</code>.
              </p>
            </div>
          </div>

          {/* Sync Action Area */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Direct Supabase Synchronization</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Push all current patients, appointments, prescriptions, labs, inventory & billing statements to Supabase tables.
              </p>
            </div>
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync All to Supabase'}</span>
            </button>
          </div>

          {/* Sync Result Feedback */}
          {syncResult && (
            <div className={`p-3.5 rounded-xl border text-xs ${
              syncResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="font-semibold flex items-center gap-1.5">
                {syncResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {syncResult.message}
              </div>
              {syncResult.success && syncResult.syncedCounts && (
                <div className="mt-2 grid grid-cols-4 gap-2 text-[10px] text-emerald-700 font-medium">
                  <div>Patients: {syncResult.syncedCounts.patients || 0}</div>
                  <div>Appointments: {syncResult.syncedCounts.appointments || 0}</div>
                  <div>Prescriptions: {syncResult.syncedCounts.prescriptions || 0}</div>
                  <div>Lab Orders: {syncResult.syncedCounts.labOrders || 0}</div>
                </div>
              )}
            </div>
          )}

          {/* Table Schema Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                Integrated Supabase PostgreSQL Tables
              </h4>
              <button
                onClick={handleCopySchema}
                className="text-[11px] text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied Notice!' : 'Copy Schema Info'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { name: 'patients', desc: 'Demographics, vitals & conditions' },
                { name: 'appointments', desc: 'Outpatient visits & queue' },
                { name: 'consultations', desc: 'SOAP notes & diagnoses' },
                { name: 'prescriptions', desc: 'E-prescribing & dispensing' },
                { name: 'lab_orders', desc: 'Pathology & AI analysis' },
                { name: 'inventory_items', desc: 'Pharmacy & stock levels' },
                { name: 'invoices', desc: 'Billing, taxes & payments' },
                { name: 'audit_logs', desc: 'HIPAA tamper-evident logs' },
              ].map((table) => (
                <div key={table.name} className="p-2.5 rounded-lg border border-slate-200 bg-white">
                  <div className="font-mono font-semibold text-[11px] text-emerald-700">
                    {table.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                    {table.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deployment Quick Guide */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                Quick Deploy to Vercel
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                Node.js + Edge
              </span>
            </div>
            <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
              <li>
                <strong className="text-slate-300">Run SQL:</strong> Open Supabase SQL Editor and execute <code className="text-emerald-400">/supabase/schema.sql</code>.
              </li>
              <li>
                <strong className="text-slate-300">Set Vercel Environment Variables:</strong> Add <code className="text-sky-300">GEMINI_API_KEY</code>, <code className="text-emerald-300">VITE_SUPABASE_URL</code>, and <code className="text-emerald-300">VITE_SUPABASE_ANON_KEY</code>.
              </li>
              <li>
                <strong className="text-slate-300">Deploy:</strong> Push repo to GitHub and import directly to Vercel for instant deployment.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Row Level Security (RLS) & HIPAA audit logs enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
