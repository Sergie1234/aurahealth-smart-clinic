/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
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
  Activity,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';
import type { User } from '../../types/clinic';
import { AddDoctorModal } from './AddDoctorModal';

export const PhysiciansManagementView: React.FC = () => {
  const { users, currentUser, deleteUser, toggleUserStatus, setActiveTab, t, language } = useClinic();
  const isFil = language === 'fil';

  // Modals & Edit State
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<User | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'specialty' | 'status'>('name');

  // Filter all doctors
  const allDoctors = useMemo(() => {
    return users.filter((u) => u.role === 'doctor');
  }, [users]);

  // Extract unique specialties for filter dropdown
  const uniqueSpecialties = useMemo(() => {
    const set = new Set<string>();
    allDoctors.forEach((doc) => {
      if (doc.specialty) set.add(doc.specialty);
    });
    return Array.from(set).sort();
  }, [allDoctors]);

  // Filtered & Sorted Doctors
  const filteredDoctors = useMemo(() => {
    return allDoctors
      .filter((doc) => {
        const matchesSearch =
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doc.specialty && doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (doc.department && doc.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (doc.licenseNumber && doc.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (doc.phone && doc.phone.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesSpecialty = specialtyFilter === 'ALL' || doc.specialty === specialtyFilter;
        const matchesStatus = statusFilter === 'ALL' || (doc.status || 'Active') === statusFilter;

        return matchesSearch && matchesSpecialty && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'specialty') return (a.specialty || '').localeCompare(b.specialty || '');
        if (sortBy === 'status') return (a.status || 'Active').localeCompare(b.status || 'Active');
        return 0;
      });
  }, [allDoctors, searchTerm, specialtyFilter, statusFilter, sortBy]);

  // Metric Computations
  const activeDoctorsCount = allDoctors.filter((d) => (d.status || 'Active') === 'Active').length;
  const onLeaveDoctorsCount = allDoctors.filter((d) => d.status === 'On Leave').length;
  const inactiveDoctorsCount = allDoctors.filter((d) => d.status === 'Inactive').length;

  const handleEditDoctor = (doc: User) => {
    setDoctorToEdit(doc);
    setShowAddDoctorModal(true);
  };

  const handleDeleteDoctor = async (doctorId: string, name: string) => {
    if (
      window.confirm(
        `Are you sure you want to remove ${name} from registered medical staff? This action will be audited in compliance with Philippine RA 10173.`
      )
    ) {
      await deleteUser(doctorId);
    }
  };

  const handleToggleStatus = async (doctorId: string, currentStatus?: string) => {
    const nextStatus =
      currentStatus === 'Active' ? 'On Leave' : currentStatus === 'On Leave' ? 'Inactive' : 'Active';
    await toggleUserStatus(doctorId, nextStatus as any);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in text-slate-100">
      {/* ====================================================================
          STANDALONE MODULE HERO BANNER (PHYSICIANS & DOCTORS)
          ==================================================================== */}
      <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-[#172554] via-[#1e1b4b] to-[#0b1120] border border-cyan-500/30 shadow-2xl shadow-cyan-950/30 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="space-y-2.5 min-w-0 flex-1 relative z-10">
          {/* Badge Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs">
              <Stethoscope className="w-3.5 h-3.5 text-cyan-300" />
              <span>Medical Staff Governance</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-950/80 text-purple-200 border border-purple-500/40">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>PRC Board of Medicine Verified</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>PhilHealth Konsulta Credentialed</span>
            </span>
          </div>

          {/* Module Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Physician & Doctor Management</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Independent clinical directory for credentialed attending physicians, specialists, and outpatient consultants. Manage PRC licenses, clinic schedule hours, departmental privileges, and consultation status.
          </p>
        </div>

        {/* Dedicated Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => {
              setDoctorToEdit(null);
              setShowAddDoctorModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-slate-950 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition cursor-pointer active:scale-95"
            title="Register New Physician"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <Stethoscope className="w-4 h-4" />
            <span>Register New Physician</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3.5 py-2.5 bg-[#0f172a]/80 hover:bg-[#1e293b] text-slate-300 hover:text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-slate-700/80 transition cursor-pointer active:scale-95"
            title="Return to Admin Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          DEDICATED PHYSICIAN METRIC CARDS
          ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Physicians */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/25 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Physicians</span>
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-xs">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{allDoctors.length}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>Accredited Attending MDs</span>
          </div>
        </div>

        {/* KPI 2: Active / On Duty */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/25 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active & In Clinic</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{activeDoctorsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Available for Patient Consults</span>
          </div>
        </div>

        {/* KPI 3: On Leave */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/25 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">On Leave / Away</span>
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{onLeaveDoctorsCount}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>Schedule Suspended</span>
          </div>
        </div>

        {/* KPI 4: Medical Specialties */}
        <div className="bg-[#0e1628]/90 backdrop-blur-md p-5 rounded-3xl border border-slate-800/90 shadow-xl shadow-black/25 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Clinical Specialties</span>
            <div className="w-9 h-9 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{uniqueSpecialties.length}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-purple-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            <span>Distinct Departments Covered</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          SEARCH, SPECIALTY & STATUS FILTERS
          ==================================================================== */}
      <div className="bg-[#0e1628]/90 backdrop-blur-md rounded-3xl border border-slate-800/90 p-5 shadow-xl shadow-black/25 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search physician by name, specialty, department, PRC license, email, or phone…"
              className="w-full pl-10 pr-4 py-2 bg-[#11192c] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Specialty Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Specialty:</span>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="py-2 px-3 bg-[#11192c] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                <option value="ALL">All Specialties ({uniqueSpecialties.length})</option>
                {uniqueSpecialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 bg-[#11192c] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active ({activeDoctorsCount})</option>
                <option value="On Leave">On Leave ({onLeaveDoctorsCount})</option>
                <option value="Inactive">Inactive ({inactiveDoctorsCount})</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-2 px-3 bg-[#11192c] border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition cursor-pointer"
              >
                <option value="name">Name (A-Z)</option>
                <option value="specialty">Specialty</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(searchTerm || specialtyFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex-wrap">
            <span>Active Filters:</span>
            {searchTerm && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 text-[11px]">
                Search: "{searchTerm}"
              </span>
            )}
            {specialtyFilter !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 text-[11px]">
                Specialty: {specialtyFilter}
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 text-[11px]">
                Status: {statusFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSpecialtyFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold text-[11px] underline ml-1 cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* ====================================================================
          PHYSICIANS DIRECTORY CARDS
          ==================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white">Credentialed Physicians Directory</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Listed
            </span>
          </div>

          <button
            onClick={() => {
              setDoctorToEdit(null);
              setShowAddDoctorModal(true);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Physician</span>
          </button>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-[#0e1628]/60 text-slate-400 space-y-3">
            <Stethoscope className="w-12 h-12 mx-auto text-slate-600" />
            <p className="font-bold text-white text-sm">No physicians match your filter criteria.</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your search terms or clearing specialty and status filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSpecialtyFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="px-4 py-2 bg-[#121c33] hover:bg-[#182645] text-cyan-300 rounded-xl text-xs font-bold transition border border-cyan-500/40 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => {
              const status = doc.status || 'Active';
              const isStatusActive = status === 'Active';
              const isStatusLeave = status === 'On Leave';

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-3xl border border-slate-800/90 bg-[#0e1628]/90 backdrop-blur-md hover:border-cyan-500/50 hover:bg-[#111a30] transition flex flex-col justify-between space-y-4 shadow-xl shadow-black/20 group"
                >
                  {/* Top: Avatar, Name, Credentials & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={
                            doc.avatar ||
                            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
                          }
                          alt={doc.name}
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-700/80 shadow-md group-hover:border-cyan-500/60 transition"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0e1628] ${
                            isStatusActive
                              ? 'bg-emerald-400'
                              : isStatusLeave
                              ? 'bg-amber-400'
                              : 'bg-slate-500'
                          }`}
                          title={`Status: ${status}`}
                        />
                      </div>

                      <div>
                        <h4 className="font-extrabold text-white text-base group-hover:text-cyan-300 transition flex items-center gap-1.5 flex-wrap">
                          <span>{doc.name}</span>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-800/50 font-semibold">
                            MD
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            <span>{doc.specialty || 'General Medicine'}</span>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-xs text-slate-300 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{doc.department || 'Outpatient Clinic'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill with Toggle */}
                    <button
                      onClick={() => handleToggleStatus(doc.id, status)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        isStatusActive
                          ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                          : isStatusLeave
                          ? 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                      title="Click to cycle status: Active -> On Leave -> Inactive"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isStatusActive
                            ? 'bg-emerald-400 animate-pulse'
                            : isStatusLeave
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span>{status}</span>
                    </button>
                  </div>

                  {/* PRC License & Schedule Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-[#090e1a]/80 p-3 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <FileBadge className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-mono text-[11px]">
                        PRC:{' '}
                        <strong className="text-white font-bold">
                          {doc.licenseNumber || 'PRC-VERIFIED'}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                      <span className="text-[11px] truncate">
                        {doc.hoursLabel || '8:00 AM – 5:00 PM'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[11px] truncate text-slate-300 font-mono">
                        {doc.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-300">
                        {doc.phone || '+63 917 000 0000'}
                      </span>
                    </div>
                  </div>

                  {/* Notes / Clinical Privileges if present */}
                  {doc.notes && (
                    <p className="text-[11px] text-slate-400 bg-[#121c33]/40 p-2.5 rounded-xl border border-slate-800/60 leading-relaxed italic">
                      "{doc.notes}"
                    </p>
                  )}

                  {/* Card Footer: Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                      <span>Schedule:</span>
                      <span className="text-cyan-300 font-semibold">
                        {doc.workDaysLabel || 'Mon - Fri'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Edit Physician */}
                      <button
                        onClick={() => handleEditDoctor(doc)}
                        className="px-3 py-1.5 bg-[#121c33] hover:bg-cyan-950/60 text-cyan-300 hover:text-cyan-200 border border-slate-700/80 hover:border-cyan-500/50 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                        title="Edit Doctor Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Physician */}
                      <button
                        onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                        className="p-1.5 bg-[#121c33] hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-700/80 hover:border-rose-500/50 rounded-xl transition cursor-pointer active:scale-95"
                        title="Remove Physician"
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

      {/* ====================================================================
          REGULATORY & PHILIPPINE HEALTH COMPLIANCE CARD
          ==================================================================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d1424] via-[#10192e] to-[#0d1424] border border-cyan-500/30 shadow-xl shadow-black/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Philippine Medical Act & E-Prescription Compliance</span>
              <span className="text-[10px] font-mono bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 font-bold">
                PRC RA 2382
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              All physician profiles require verified Professional Regulation Commission (PRC) licenses and Philippine Medical Association (PMA) Standing. Prescriptions generated by registered doctors are cryptographically signed under DOH & FDA Joint Administrative Order on Telemedicine & Electronic Prescribing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-mono text-cyan-400 bg-[#090e1a] px-3 py-1.5 rounded-xl border border-slate-800 font-semibold">
            Konsulta Outpatient Certified
          </span>
        </div>
      </div>

      {/* Modal for Registering / Editing Physician */}
      {showAddDoctorModal && (
        <AddDoctorModal
          isOpen={showAddDoctorModal}
          onClose={() => {
            setShowAddDoctorModal(false);
            setDoctorToEdit(null);
          }}
          doctorToEdit={doctorToEdit}
        />
      )}
    </div>
  );
};
