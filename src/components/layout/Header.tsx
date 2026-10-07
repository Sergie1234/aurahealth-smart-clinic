import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  Search, Bell, Clock, Sparkles, CheckCircle2, AlertTriangle, User, X, Plus, Database, Home, LogIn, LogOut, Sun, Moon
} from 'lucide-react';

interface Props {
  onOpenBookAppointment?: () => void;
  onOpenNewPatient?: () => void;
  onOpenSupabaseModal?: () => void;
}

export const Header: React.FC<Props> = ({ onOpenBookAppointment, onOpenNewPatient, onOpenSupabaseModal }) => {
  const {
    currentUser, activeRole, notifications, markNotificationAsRead, markAllNotificationsAsRead,
    searchQuery, setSearchQuery, patients, appointments, inventory, selectPatient, setActiveTab, logout
  } = useClinic();
  const { isDark, toggleTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredPatients = searchQuery.trim()
    ? patients.filter((p) => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery))
    : [];
  const filteredAppointments = searchQuery.trim()
    ? appointments.filter((a) => a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) || a.reason.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredInventory = searchQuery.trim()
    ? inventory.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.genericName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearchDropdown(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div onClick={() => setActiveTab('home')} className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition select-none" title="Go to Smart Clinic Homepage">
            <SmartClinicLogo className="w-9 h-9" glow={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight leading-none">Smart Clinic</span>
                <span className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold text-[10px] px-1.5 py-0.5 rounded border border-teal-200/60 uppercase">Clinic AI</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">Advanced Healthcare Management</p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-lg relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patients, MRN, appointments, drugs, doctors..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(Boolean(e.target.value.trim())); }}
              onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
              className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 flex justify-between items-center">
                <span>Search results for "{searchQuery}"</span>
                <button onClick={() => setShowSearchDropdown(false)} className="text-slate-400 hover:text-slate-600">Close</button>
              </div>
              {filteredPatients.length > 0 && (
                <div className="p-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Patients</p>
                  {filteredPatients.map((pat) => (
                    <button key={pat.id} onClick={() => { selectPatient(pat.id); setActiveTab('patients'); setShowSearchDropdown(false); setSearchQuery(''); }} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50/70 dark:hover:bg-slate-800 flex items-center justify-between text-xs transition">
                      <div><span className="font-semibold text-slate-800 dark:text-slate-100">{pat.fullName}</span><span className="ml-2 text-slate-500 text-[11px]">{pat.mrn}</span></div>
                      <span className="text-[11px] text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded font-medium">{pat.age}y • {pat.gender}</span>
                    </button>
                  ))}
                </div>
              )}
              {filteredPatients.length === 0 && filteredAppointments.length === 0 && filteredInventory.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500">No matching records found for "{searchQuery}".</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {activeRole !== 'patient' && (
            <div className="hidden md:flex items-center gap-1.5">
              {onOpenNewPatient && (
                <button onClick={onOpenNewPatient} className="px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /><span>Register Patient</span>
                </button>
              )}
              {onOpenBookAppointment && (
                <button onClick={onOpenBookAppointment} className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <Clock className="w-3.5 h-3.5" /><span>Book Visit</span>
                </button>
              )}
            </div>
          )}

          <button onClick={toggleTheme} className="p-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition flex items-center gap-1 text-xs font-semibold cursor-pointer" title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
            <span className="hidden sm:inline text-[11px]">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          <button onClick={() => setActiveTab('home')} className="p-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition flex items-center gap-1 text-xs font-semibold cursor-pointer" title="Go to Public Homepage">
            <Home className="w-3.5 h-3.5 text-teal-600" /><span className="hidden sm:inline text-[11px]">Home</span>
          </button>

          <button onClick={() => setActiveTab('login')} className="p-1.5 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg transition flex items-center gap-1 text-xs font-semibold cursor-pointer" title="Switch User / Sign In">
            <LogIn className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" /><span className="hidden lg:inline text-[11px]">Sign In</span>
          </button>

          {onOpenSupabaseModal && (
            <button onClick={onOpenSupabaseModal} className="p-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-700/50 rounded-lg transition flex items-center gap-1.5 text-xs font-medium cursor-pointer" title="Open Supabase Hub">
              <Database className="w-3.5 h-3.5 text-emerald-600" /><span className="hidden sm:inline text-[11px] font-semibold">Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}

          <button onClick={() => setActiveTab('ai-assistant')} className="p-1.5 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200/80 dark:border-teal-700/50 rounded-lg transition flex items-center gap-1 text-xs font-medium cursor-pointer" title="AI Assistant">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" /><span className="hidden lg:inline text-[11px]">AI Assistant</span>
          </button>

          <div className="relative" ref={notifRef}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition cursor-pointer" title="Notifications">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">Notifications</span>
                  {unreadCount > 0 && <button onClick={markAllNotificationsAsRead} className="text-[11px] text-teal-600 font-semibold cursor-pointer">Mark all read</button>}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">No current notifications</div>
                  ) : notifications.map((notif) => (
                    <div key={notif.id} onClick={() => markNotificationAsRead(notif.id)} className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${!notif.read ? 'bg-teal-50/30 dark:bg-teal-900/20' : ''}`}>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{notif.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold text-[10px] flex items-center justify-center border border-teal-200/60 dark:border-teal-700/50" title={currentUser.name}>
              {initials || <User className="w-4 h-4" />}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight capitalize">{currentUser.department || activeRole}</p>
            </div>
            <button onClick={logout} className="ml-1 p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition flex items-center gap-1 cursor-pointer" title="Sign Out">
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
