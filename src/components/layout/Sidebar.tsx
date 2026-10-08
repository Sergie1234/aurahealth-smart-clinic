import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Layers,
  Stethoscope,
  FileText,
  Pill,
  FlaskConical,
  PackageCheck,
  Receipt,
  BarChart3,
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Home,
  LogIn
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles: string[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeRole, appointments, labOrders, inventory } = useClinic();

  const waitingCount = appointments.filter((a) => a.status === 'Checked In' || a.status === 'In Consultation').length;
  const pendingLabs = labOrders.filter((l) => l.status === 'Requested' || l.status === 'Processing').length;
  const lowStockCount = inventory.filter((i) => i.stockQuantity <= i.reorderLevel).length;

  const navItems: NavItem[] = [
    { id: 'home', label: 'Public Homepage', icon: Home, badge: 'Home', roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'patient'] },
    { id: 'login', label: 'Secure Login', icon: LogIn, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'patient'] },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'patient'] },
    { id: 'patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'] },
    { id: 'queue', label: 'Live Queue & Triage', icon: Layers, badge: waitingCount > 0 ? waitingCount : undefined, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { id: 'consultations', label: 'Consultation Room', icon: Stethoscope, roles: ['admin', 'doctor', 'nurse'] },
    { id: 'emr', label: 'Medical Records', icon: FileText, roles: ['admin', 'doctor', 'nurse', 'patient'] },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill, roles: ['admin', 'doctor', 'pharmacist', 'patient'] },
    { id: 'laboratory', label: 'Diagnostic Lab', icon: FlaskConical, badge: pendingLabs > 0 ? pendingLabs : undefined, roles: ['admin', 'doctor', 'lab_technician', 'patient'] },
    { id: 'inventory', label: 'Pharmacy & Stock', icon: PackageCheck, badge: lowStockCount > 0 ? lowStockCount : undefined, roles: ['admin', 'pharmacist', 'doctor'] },
    { id: 'billing', label: 'Billing & Payments', icon: Receipt, roles: ['admin', 'receptionist', 'patient'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['admin', 'doctor'] },
    { id: 'predictive-analytics', label: 'Predictive Analytics', icon: TrendingUp, roles: ['admin', 'doctor', 'nurse'] },
    {
      id: 'ai-assistant',
      label: activeRole === 'patient' ? 'AI Triage' : 'SmartClinic AI Engine',
      icon: Sparkles,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'patient'],
    },
    { id: 'audit-logs', label: 'Audit & Compliance', icon: ShieldAlert, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(activeRole));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen text-slate-300">
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <SmartClinicLogo className="w-8 h-8" glow={true} />
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">Smart Clinic Center</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-slate-400 font-medium">Outpatient Service Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm shadow-teal-900/40'
                  : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-teal-700' : 'bg-slate-800 text-teal-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px]">
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-300">
            <span>PH Health Data Security</span>
            <span className="text-teal-400">v3.2.1</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Philippine Health Data Security & Encryption Standards · RA 10173 NPC
          </p>
        </div>
      </div>
    </aside>
  );
};
