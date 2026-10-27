/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  FileBadge,
  ShieldCheck,
  Building2,
  Edit2,
  Trash2,
  ArrowLeft,
  KeyRound,
  Sparkles,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import type { User } from '../../types/clinic';
import { AddStaffModal } from './AddStaffModal';

export const ClinicalStaffManagementView: React.FC = () => {
  const { users, currentUser, deleteUser, toggleUserStatus, setActiveTab, t, language } = useClinic();
  const isFil = language === 'fil';

  // Modals & Edit State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<User | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Filter clinical staff (nurses, receptionists, lab techs, pharmacists)
  const clinicalStaffList = useMemo(() => {
    return users.filter((u) => ['nurse', 'receptionist', 'lab_technician', 'pharmacist'].includes(u.role));
  }, [users]);

  // Extract unique departments
  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    clinicalStaffList.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set).sort();
  }, [clinicalStaffList]);

  // Filtered Clinical Staff
  const filteredStaff = useMemo(() => {
    return clinicalStaffList.filter((staff) => {
      const matchSearch =
        staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (staff.department && staff.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (staff.licenseNumber && staff.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (staff.phone && staff.phone.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchRole = roleFilter === 'ALL' || staff.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || (staff.status || 'Active') === statusFilter;
      const matchDept = departmentFilter === 'ALL' || staff.department === departmentFilter;

      return matchSearch && matchRole && matchStatus && matchDept;
    });
  }, [clinicalStaffList, searchTerm, roleFilter, statusFilter, departmentFilter]);

  // KPI computations
  const nursesCount = clinicalStaffList.filter((s) => s.role === 'nurse').length;
  const receptionistsCount = clinicalStaffList.filter((s) => s.role === 'receptionist').length;
  const labTechsCount = clinicalStaffList.filter((s) => s.role === 'lab_technician').length;
  const pharmacistsCount = clinicalStaffList.filter((s) => s.role === 'pharmacist').length;

  const handleEditStaff = (stf: User) => {
    setStaffToEdit(stf);
    setShowAddStaffModal(true);
  };

  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${name} from clinical staff? This action will be recorded in the audit log.`
      )
    ) {
      await deleteUser(staffId);
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus?: string) => {
    const nextStatus =
      currentStatus === 'Active' ? 'On Leave' : currentStatus === 'On Leave' ? 'Inactive' : 'Active';
    await toggleUserStatus(staffId, nextStatus as any);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'nurse':
        return { label: 'Registered Nurse', color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' };
      case 'receptionist':
        return { label: 'Front Desk Access', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'lab_technician':
        return { label: 'Medical Technologist', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
      case 'pharmacist':
        return { label: 'Clinical Pharmacist', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'Clinical Staff', color: 'bg-slate-500/15 text-slate-300 border-slate-500/30' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in text-slate-100">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#1e1b4b] via-[#0f172a] to-[#080d1a] border border-cyan-500/30 shadow-2xl shadow-purple-950/30 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-2.5 min-w-0 flex-1 relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs">
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>Clinical Operations Staff</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-teal-950/80 text-teal-200 border border-teal-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>Role-Based Access Control</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Clinical Staff Directory & Access Management
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Manage credentials, departmental assignments, and operational permissions for Nurses, Receptionists, Laboratory Medical Technologists, and Pharmacists.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => {
              setStaffToEdit(null);
              setShowAddStaffModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Register New Clinical Staff</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3.5 py-2.5 bg-[#0f172a]/80 hover:bg-[#1e293b] text-slate-300 hover:text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700/80 transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Staff KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nurses */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/25 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Registered Nurses</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-xs">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{nursesCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            <span>Triage & Patient Vitals</span>
          </div>
        </div>

        {/* Receptionists */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/25 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Front Desk & Intake</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{receptionistsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Queue & Patient Intake</span>
          </div>
        </div>

        {/* Lab Techs */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/25 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Lab Medical Techs</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{labTechsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Diagnostic Pathology</span>
          </div>
        </div>

        {/* Pharmacists */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/25 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Clinical Pharmacists</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{pharmacistsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Formulary & Dispensation</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1628]/90 backdrop-blur-md rounded-3xl border border-slate-800/90 p-5 shadow-xl shadow-black/25 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff by name, department, role, email, or credentials…"
              className="w-full pl-10 pr-4 py-2 bg-[#11192c] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="py-2 px-3 bg-[#11192c] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                <option value="ALL">All Roles ({clinicalStaffList.length})</option>
                <option value="nurse">Nurse ({nursesCount})</option>
                <option value="receptionist">Receptionist ({receptionistsCount})</option>
                <option value="lab_technician">Lab Technician ({labTechsCount})</option>
                <option value="pharmacist">Pharmacist ({pharmacistsCount})</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 bg-[#11192c] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Directory Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white">Authorized Clinical Staff Directory</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
            {filteredStaff.length} Members
          </span>
        </div>

        {filteredStaff.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-[#0e1628]/60 text-slate-400 space-y-3">
            <Users className="w-12 h-12 mx-auto text-slate-600" />
            <p className="font-bold text-white text-sm">No staff members match your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredStaff.map((staff) => {
              const roleBadge = getRoleBadge(staff.role);
              const status = staff.status || 'Active';
              const isStatusActive = status === 'Active';

              return (
                <div
                  key={staff.id}
                  className="p-5 rounded-3xl border border-slate-800/90 bg-[#0e1628]/90 backdrop-blur-md hover:border-cyan-500/40 transition flex flex-col justify-between space-y-4 shadow-xl shadow-black/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={
                          staff.avatar ||
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={staff.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700/80 shadow-md"
                      />
                      <div>
                        <h4 className="font-extrabold text-white text-base">{staff.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleBadge.color}`}
                          >
                            {roleBadge.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {staff.department || 'Outpatient'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(staff.id, status)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                        isStatusActive
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isStatusActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                        }`}
                      />
                      <span>{status}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-[#090e1a]/80 p-3 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[11px] truncate text-slate-300 font-mono">
                        {staff.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-300">
                        {staff.phone || '+63 917 000 0000'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FileBadge className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-[11px] truncate">
                        {staff.licenseNumber || staff.credentials || 'Certified Staff'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="text-[11px] truncate">
                        {staff.department || 'Clinical Operations'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Account ID: {staff.id}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditStaff(staff)}
                        className="px-3 py-1.5 bg-[#121c33] hover:bg-cyan-950/60 text-cyan-300 border border-slate-700/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteStaff(staff.id, staff.name)}
                        className="p-1.5 bg-[#121c33] hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-700/80 rounded-xl transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddStaffModal && (
        <AddStaffModal
          isOpen={showAddStaffModal}
          onClose={() => {
            setShowAddStaffModal(false);
            setStaffToEdit(null);
          }}
          staffToEdit={staffToEdit}
        />
      )}
    </div>
  );
};
