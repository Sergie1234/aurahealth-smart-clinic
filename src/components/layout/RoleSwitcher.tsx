import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { UserRole } from '../../types/clinic';
import {
  Stethoscope,
  Activity,
  UserCheck,
  Pill,
  FlaskConical,
  User,
  ShieldCheck,
  Home,
  LogIn
} from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { activeRole, switchRole, currentUser, activeTab, setActiveTab } = useClinic();

  const roles: { role: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { role: 'doctor', label: 'Doctor', icon: Stethoscope },
    { role: 'nurse', label: 'Nurse', icon: Activity },
    { role: 'receptionist', label: 'Receptionist', icon: UserCheck },
    { role: 'pharmacist', label: 'Pharmacist', icon: Pill },
    { role: 'lab_technician', label: 'Lab Staff', icon: FlaskConical },
    { role: 'patient', label: 'Patient Portal', icon: User },
    { role: 'admin', label: 'Admin', icon: ShieldCheck },
  ];

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-slate-200 px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2 sticky top-0 z-50">
      {/* 1. Direct Page Switchers */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
            activeTab === 'home'
              ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
              : 'bg-teal-950/80 text-teal-300 border border-teal-700/60 hover:bg-teal-900'
          }`}
          title="Return to Public Homepage"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Public Homepage</span>
        </button>

        <button
          onClick={() => setActiveTab('login')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
            activeTab === 'login'
              ? 'bg-teal-400 text-slate-950 shadow-md shadow-teal-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
          title="Open Secure Login Page"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Secure Login</span>
        </button>

        <div className="h-4 w-px bg-slate-800 hidden sm:block mx-1" />

        <div className="hidden md:flex items-center gap-2">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
            Perspective:
          </span>
          <span className="font-medium text-teal-400 flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            {currentUser.name} ({activeRole.replace('_', ' ').toUpperCase()})
          </span>
        </div>
      </div>

      {/* 2. Direct Clinical Role Perspectives */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-full">
        <span className="text-slate-400 mr-1 hidden lg:inline text-[11px]">Clinic Modules:</span>
        {roles.map(({ role, label, icon: Icon }) => {
          const isActive =
            activeRole === role && activeTab !== 'home' && activeTab !== 'login';
          return (
            <button
              key={role}
              onClick={() => {
                switchRole(role);
                setActiveTab('dashboard');
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition font-medium text-[11px] cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
              title={`Switch perspective to ${label} Dashboard`}
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
