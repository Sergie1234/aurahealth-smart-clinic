import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  TrendingUp,
} from 'lucide-react';
import { formatPeso } from '../../utils/currency';

export const ReportsAnalytics: React.FC = () => {
  const { patients, appointments, consultations, labOrders, invoices } = useClinic();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const totalPatients = patients.length;
  const totalRevenue = invoices.reduce((acc, i) => acc + i.paidAmount, 0);

  const completedCount = appointments.filter((a) => a.status === 'Completed').length;
  const noShowCount = appointments.filter((a) => a.status === 'No Show').length;
  const totalApts = appointments.length || 1;
  const noShowRate = ((noShowCount / totalApts) * 100).toFixed(1);
  const completionRate = (((completedCount + 1) / totalApts) * 100).toFixed(1);

  const departments = [
    { name: 'Internal Medicine', count: 4, percentage: 55 },
    { name: 'Cardiology', count: 2, percentage: 30 },
    { name: 'Pathology & Triage', count: 1, percentage: 15 },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Clinic Analytics & Performance</h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
              Executive View
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational throughput, appointment completion metrics, and revenue cycle reporting (PHP).
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                timeRange === range ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Patient Population</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalPatients}</span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">80% returning, 20% newly registered</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Encounter Completion</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{completionRate}%</span>
            <span className="text-xs text-teal-600 font-medium">on schedule</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Average consultation: 26 mins</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">No-Show Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{noShowRate}%</span>
            <span className="text-xs text-emerald-600 font-medium">industry benchmark: 8%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Reduced via automated SMS/email reminders</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Net Clinic Collections</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatPeso(totalRevenue, { compact: true })}</span>
            <span className="text-xs text-emerald-600 font-semibold">+18.4%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Consultations & Laboratory billings (PHP)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Encounter Volume by Specialty</span>
            <span className="text-slate-400 font-normal">Active Month</span>
          </h2>

          <div className="space-y-3">
            {departments.map((dept, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{dept.name}</span>
                  <span className="text-slate-500">{dept.percentage}% ({dept.count} visits)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-teal-600 h-2.5 rounded-full"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Avg Wait</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">12 mins</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Lab Turnaround</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">45 mins</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Rx Filled</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">94%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center justify-between">
            <span>Prevalent Chronic Diagnoses</span>
            <span className="text-slate-400 font-normal">ICD-10 Index</span>
          </h2>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Type 2 Diabetes Mellitus (E11.9)</span>
                <span className="text-[10px] text-slate-500">Regular HbA1c surveillance required</span>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                3 Patients
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Essential Hypertension (I10)</span>
                <span className="text-[10px] text-slate-500">ACE inhibitor / ARB therapy monitoring</span>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                2 Patients
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 block">Bronchial Asthma & Allergies (J45)</span>
                <span className="text-[10px] text-slate-500">Rescue inhaler action plan</span>
              </div>
              <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                1 Patient
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
