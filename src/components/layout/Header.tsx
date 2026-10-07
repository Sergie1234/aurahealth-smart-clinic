import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Search,
  Bell,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  X,
  Plus,
  Database
} from 'lucide-react';

interface Props {
  onOpenBookAppointment?: () => void;
  onOpenNewPatient?: () => void;
  onOpenSupabaseModal?: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenBookAppointment,
  onOpenNewPatient,
  onOpenSupabaseModal,
}) => {
  const {
    currentUser,
    activeRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchQuery,
    setSearchQuery,
    patients,
    appointments,
    inventory,
    selectPatient,
    setActiveTab
  } = useClinic();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter search results
  const filteredPatients = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone.includes(searchQuery)
      )
    : [];

  const filteredAppointments = searchQuery.trim()
    ? appointments.filter(
        (a) =>
          a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.reason.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredInventory = searchQuery.trim()
    ? inventory.filter(
        (i) =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.genericName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-teal-700/20">
              <span className="font-extrabold tracking-tighter">A+</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight leading-none">AuraHealth</span>
                <span className="bg-teal-50 text-teal-700 font-semibold text-[10px] px-1.5 py-0.5 rounded border border-teal-200/60 uppercase">Clinic AI</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight">Smart Clinical Management</p>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-lg relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patients, MRN, appointments, drugs, doctors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(Boolean(e.target.value.trim()));
              }}
              onFocus={() => {
                if (searchQuery.trim()) setShowSearchDropdown(true);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 flex justify-between items-center">
                <span>Search results for "{searchQuery}"</span>
                <button
                  onClick={() => setShowSearchDropdown(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              {/* Patients */}
              {filteredPatients.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Patients</p>
                  {filteredPatients.map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => {
                        selectPatient(pat.id);
                        setActiveTab('patients');
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50/70 flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{pat.fullName}</span>
                        <span className="ml-2 text-slate-500 text-[11px]">{pat.mrn}</span>
                      </div>
                      <span className="text-[11px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded font-medium">
                        {pat.age}y • {pat.gender}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Appointments */}
              {filteredAppointments.length > 0 && (
                <div className="p-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Appointments</p>
                  {filteredAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => {
                        setActiveTab('appointments');
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50/70 flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-medium text-slate-800">{apt.patientName}</span>
                        <span className="ml-2 text-slate-500 text-[11px]">with {apt.doctorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-600">{apt.date} {apt.time}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Inventory */}
              {filteredInventory.length > 0 && (
                <div className="p-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Medications</p>
                  {filteredInventory.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        setActiveTab('inventory');
                        setShowSearchDropdown(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50/70 flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-medium text-slate-800">{inv.name}</span>
                        <span className="ml-2 text-slate-500 text-[11px]">({inv.genericName})</span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-semibold">{inv.stockQuantity} {inv.unit}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredPatients.length === 0 && filteredAppointments.length === 0 && filteredInventory.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">
                  No matching records found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick actions, notifications, user badge */}
        <div className="flex items-center gap-2.5">
          {/* Quick Create Buttons depending on role */}
          {activeRole !== 'patient' && (
            <div className="hidden md:flex items-center gap-1.5">
              {onOpenNewPatient && (
                <button
                  onClick={onOpenNewPatient}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Patient</span>
                </button>
              )}
              {onOpenBookAppointment && (
                <button
                  onClick={onOpenBookAppointment}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Book Visit</span>
                </button>
              )}
            </div>
          )}

          {/* Supabase & Cloud Backend Hub Trigger */}
          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              className="p-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Open Supabase Database & Vercel Deployment Hub"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline text-[11px] font-semibold">Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}

          {/* AI Quick Tab Trigger */}
          <button
            onClick={() => setActiveTab('ai-assistant')}
            className="p-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-lg transition flex items-center gap-1 text-xs font-medium cursor-pointer"
            title="Open AI Medical & Administrative Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden lg:inline text-[11px]">AI Assistant</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No current notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                          !notif.read ? 'bg-teal-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {notif.priority === 'urgent' || notif.priority === 'high' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{notif.title}</p>
                            <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            {currentUser.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold text-xs flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 leading-tight capitalize">{currentUser.department || activeRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
