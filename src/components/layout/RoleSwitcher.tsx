import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { UserRole } from '../../types/clinic';
import { Stethoscope, Activity, UserCheck, Pill, FlaskConical, User, ShieldCheck } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { activeRole, switchRole, currentUser } = useClinic();

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
    <div className="bg-slate-900 border-b border-slate-800 text-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Active Role Perspective:</span>
        <span className="font-medium text-teal-400 flex items-center gap-1.5 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          {currentUser.name} ({activeRole.replace('_', ' ').toUpperCase()})
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        <span className="text-slate-400 mr-1 hidden sm:inline">Switch view:</span>
        {roles.map(({ role, label, icon: Icon }) => {
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              onClick={() => switchRole(role)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded transition font-medium cursor-pointer ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
              title={`Switch perspective to ${label}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
