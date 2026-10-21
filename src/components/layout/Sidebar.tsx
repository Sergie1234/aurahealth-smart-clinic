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
  QrCode,
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

  // Strict Role Classification
  const isPatient = activeRole === 'patient';
  const isAdmin = activeRole === 'admin';
  const isProvider = !isPatient && !isAdmin; // doctor, nurse, receptionist, pharmacist, lab_technician

  // Exact navigation item registry with strict role-based access control (RBAC)
  const navItems: NavItem[] = [
    // 1. PATIENT MODULES (Strictly for Patient role)
    {
      id: 'dashboard',
      label: 'My Health Portal',
      icon: LayoutDashboard,
      roles: ['patient'],
    },
    {
      id: 'appointments',
      label: 'My Appointments',
      icon: Calendar,
      roles: ['patient'],
    },
    {
      id: 'queue',
      label: 'Live Queue & Waiting Room',
      icon: Layers,
      badge: waitingCount > 0 ? waitingCount : undefined,
      roles: ['patient'],
    },
    {
      id: 'emr',
      label: 'My Medical Records',
      icon: FileText,
      roles: ['patient'],
    },
    {
      id: 'prescriptions',
      label: 'My Prescriptions',
      icon: Pill,
      roles: ['patient'],
    },
    {
      id: 'laboratory',
      label: 'My Diagnostic Lab',
      icon: FlaskConical,
      roles: ['patient'],
    },
    {
      id: 'billing',
      label: 'My Billing & Invoices',
      icon: Receipt,
      roles: ['patient'],
    },
    {
      id: 'ai-assistant',
      label: 'AI Triage Chatbot',
      icon: Sparkles,
      roles: ['patient'],
    },

    // 2. PROVIDER MODULES (Doctor, Nurse, Staff)
    {
      id: 'dashboard',
      label: 'Provider Dashboard',
      icon: LayoutDashboard,
      roles: ['doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician'],
    },
    {
      id: 'patients',
      label: 'Patient List & Search',
      icon: Users,
      roles: ['doctor', 'nurse', 'receptionist'],
    },
    {
      id: 'appointments',
      label: 'Appointment Management',
      icon: Calendar,
      roles: ['doctor', 'nurse', 'receptionist'],
    },
    {
      id: 'queue',
      label: 'Triage Review & Queue',
      icon: Layers,
      badge: waitingCount > 0 ? waitingCount : undefined,
      roles: ['doctor', 'nurse', 'receptionist'],
    },
    {
      id: 'scan-qr',
      label: 'Scan Health ID (QR)',
      icon: QrCode,
      roles: ['nurse', 'receptionist'],
    },
    {
      id: 'consultations',
      label: 'Clinical Notes & Charting',
      icon: Stethoscope,
      roles: ['doctor', 'nurse'],
    },
    {
      id: 'prescriptions',
      label: 'Prescription Writing',
      icon: Pill,
      roles: ['doctor', 'pharmacist'],
    },
    {
      id: 'laboratory',
      label: 'Lab Orders',
      icon: FlaskConical,
      badge: pendingLabs > 0 ? pendingLabs : undefined,
      roles: ['doctor', 'lab_technician', 'nurse'],
    },
    {
      id: 'inventory',
      label: 'Medication Formulary',
      icon: PackageCheck,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      roles: ['pharmacist', 'doctor'],
    },
    {
      id: 'ai-assistant',
      label: 'Clinical AI Assistant',
      icon: Sparkles,
      roles: ['doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician'],
    },

    // 3. ADMIN MODULES (Strictly for Executive Admin - No QR scanner access)
    {
      id: 'dashboard',
      label: 'Executive Overview',
      icon: LayoutDashboard,
      roles: ['admin'],
    },
    {
      id: 'patients',
      label: 'User & Patient Management',
      icon: Users,
      roles: ['admin'],
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs & Compliance',
      icon: ShieldAlert,
      roles: ['admin'],
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['admin'],
    },
    {
      id: 'predictive-analytics',
      label: 'Clinic Predictive Analytics',
      icon: TrendingUp,
      roles: ['admin'],
    },
    {
      id: 'billing',
      label: 'Clinic Billing & Revenue',
      icon: Receipt,
      roles: ['admin'],
    },
    {
      id: 'inventory',
      label: 'Supply & Stock Management',
      icon: PackageCheck,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      roles: ['admin'],
    },
    {
      id: 'ai-assistant',
      label: 'Clinic Operations AI',
      icon: Sparkles,
      roles: ['admin'],
    },
  ];

  // Apply strict role filter: a user ONLY sees items mapped to their active role
  const visibleItems = navItems.filter((item) => item.roles.includes(activeRole));

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
              : isAdmin
              ? 'Executive administration session. Full audit trail and facility configuration active.'
              : 'Clinical provider session. Patient care, charting, and diagnostic orders active.'}
          </p>
        </div>
      </div>
    </aside>
  );
};
