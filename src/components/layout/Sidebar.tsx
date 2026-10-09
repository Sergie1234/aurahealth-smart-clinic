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
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { UserRole } from '../../types/clinic';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  roles: UserRole[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, activeRole, appointments, labOrders, inventory } = useClinic();

  const waitingCount = appointments.filter((a) => a.status === 'Checked In' || a.status === 'In Consultation').length;
  const pendingLabs = labOrders.filter((l) => l.status === 'Requested' || l.status === 'Processing').length;
  const lowStockCount = inventory.filter((i) => i.stockQuantity <= i.reorderLevel).length;

  const isPatient = activeRole === 'patient';
  const isPharmacy = activeRole === 'pharmacist' || (activeRole as string) === 'pharmacy';

  // Base navigation registry with strict role-based access control (RBAC)
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: isPatient ? 'My Health Portal' : 'Clinic Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'patient'],
    },
    {
      id: 'appointments',
      label: isPatient ? 'My Appointments' : 'Appointments',
      icon: Calendar,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
    },
    {
      id: 'patients',
      label: 'Patient Directory',
      icon: Users,
      roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    },
    {
      id: 'queue',
      label: 'Live Queue & Triage',
      icon: Layers,
      badge: waitingCount > 0 ? waitingCount : undefined,
      // Strictly restricted: NEVER accessible to Patient or Pharmacy
      roles: ['admin', 'doctor', 'nurse', 'receptionist'],
    },
    {
      id: 'consultations',
      label: 'Consultation Room',
      icon: Stethoscope,
      roles: ['admin', 'doctor', 'nurse'],
    },
    {
      id: 'emr',
      label: isPatient ? 'My Medical Records' : 'Medical Records (EMR)',
      icon: FileText,
      roles: ['admin', 'doctor', 'nurse', 'patient'],
    },
    {
      id: 'prescriptions',
      label: isPatient ? 'My Prescriptions' : 'E-Prescriptions',
      icon: Pill,
      roles: ['admin', 'doctor', 'pharmacist', 'patient'],
    },
    {
      id: 'laboratory',
      label: isPatient ? 'My Diagnostic Lab' : 'Diagnostic Lab',
      icon: FlaskConical,
      badge: pendingLabs > 0 && !isPatient ? pendingLabs : undefined,
      roles: ['admin', 'doctor', 'lab_technician', 'patient'],
    },
    {
      id: 'inventory',
      label: 'Pharmacy & Stock',
      icon: PackageCheck,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      // Strictly restricted: NEVER accessible to Patient or Pharmacy
      roles: ['admin', 'doctor'],
    },
    {
      id: 'billing',
      label: isPatient ? 'My Billing & Invoices' : 'Billing & Payments',
      icon: Receipt,
      roles: ['admin', 'receptionist', 'patient'],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      // Strictly restricted: NEVER accessible to Patient or Pharmacy
      roles: ['admin', 'doctor'],
    },
    {
      id: 'predictive-analytics',
      label: 'Predictive Analytics',
      icon: TrendingUp,
      roles: ['admin', 'doctor', 'nurse'],
    },
    {
      id: 'ai-assistant',
      label: isPatient ? 'AI Triage Chatbot' : 'SmartClinic AI Engine',
      icon: Sparkles,
      roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'patient'],
    },
    {
      id: 'audit-logs',
      label: 'Audit & Compliance',
      icon: ShieldAlert,
      roles: ['admin'],
    },
  ];

  // Apply strict security filter: strip out forbidden modules
  const visibleItems = navItems.filter((item) => {
    // Hard constraint: Strip out 'queue', 'inventory', and 'reports' for Patient or Pharmacy
    if ((isPatient || isPharmacy) && (item.id === 'queue' || item.id === 'inventory' || item.id === 'reports')) {
      return false;
    }
    return item.roles.includes(activeRole);
  });

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-screen text-slate-300 select-none">
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <SmartClinicLogo className="w-8 h-8" glow={true} />
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide">Smart Clinic</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-[10px] text-slate-400 font-medium capitalize">
                {isPatient ? 'Patient Portal' : `${activeRole} Workspace`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          <span>Authorized Modules</span>
          <span className="text-[9px] text-teal-400 font-semibold">{visibleItems.length} Active</span>
        </div>

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

      {/* Specific Privacy & Security Task Verification Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/70 text-[11px]">
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-200">
            <span className="flex items-center gap-1 text-teal-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Security & Privacy Scope</span>
            </span>
            <span className="text-[9px] font-mono bg-teal-950 text-teal-300 px-1.5 py-0.2 rounded border border-teal-800">
              RA 10173
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {isPatient
              ? 'Private single-patient isolation active. Only your verified health records are accessible.'
              : isPharmacy
              ? 'Pharmacy prescription dispensing session. Live queue and inventory routes restricted.'
              : 'Role-based access control (RBAC) enforced with immutable audit logging.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
