import React, { useState, useRef, useEffect } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { NotificationDetailModal } from '../notifications/NotificationDetailModal';
import { canUserScanQR } from '../../utils/qrPermissions';
import type { Notification } from '../../types/clinic';
import {
  Search, Bell, Clock, CheckCircle2, AlertTriangle, User, X, Plus, Database, LogOut, Lock, ShieldCheck, QrCode, Menu
} from 'lucide-react';

interface Props {
  onOpenBookAppointment?: () => void;
  onOpenNewPatient?: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenScanQR?: (mode?: 'checkin' | 'emergency') => void;
  onOpenProfileSettings?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<Props> = ({
  onOpenBookAppointment,
  onOpenNewPatient,
  onOpenSupabaseModal,
  onOpenScanQR,
  onOpenProfileSettings,
  onToggleMobileMenu,
}) => {
  const {
    currentUser, activeRole, primaryRole, staffSubRole, notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead,
    searchQuery, setSearchQuery, patients, appointments, inventory, selectPatient, setActiveTab, logout,
    language, t, sessionSecondsRemaining, isAuthenticated
  } = useClinic();

  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotifModal, setSelectedNotifModal] = useState<Notification | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = unreadNotificationCount;

  const isPatient = activeRole === 'patient';
  const isAdmin = activeRole === 'admin';

  // Search filtered results for staff roles ONLY
  const filteredPatients = !isPatient && searchQuery.trim()
    ? patients.filter((p) => p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone.includes(searchQuery))
    : [];
  const filteredAppointments = !isPatient && searchQuery.trim()
    ? appointments.filter((a) => a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) || a.reason.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredInventory = !isPatient && activeRole !== 'pharmacist' && (activeRole as string) !== 'pharmacy' && searchQuery.trim()
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
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 select-none">
      <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              type="button"
              className="lg:hidden p-1.5 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer active:scale-95"
              aria-label="Toggle navigation menu"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
          )}
          <div onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition select-none" title="Go to Dashboard">
            <SmartClinicLogo className="w-8 h-8 sm:w-9 sm:h-9" glow={true} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base tracking-tight leading-none">Smart Clinic</span>
                <span className="bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-semibold text-[10px] px-1.5 py-0.5 rounded border border-teal-200/60 uppercase">
                  {isPatient ? 'Patient Portal' : 'Clinical Hub'}
                </span>
                <span className="hidden lg:inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Server (RA 10173)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                {isPatient ? 'Confidential Patient Health Portal' : 'Outpatient Healthcare Management'}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar: STRICT CONDITIONAL RENDERING - NEVER rendered in DOM for Patient role */}
        {!isPatient ? (
          <div className="flex-1 max-w-lg relative" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search authorized clinical records..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(Boolean(e.target.value.trim())); }}
                onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
                className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
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
                  <span>Authorized Search results for "{searchQuery}"</span>
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
                {filteredAppointments.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Appointments</p>
                    {filteredAppointments.map((apt) => (
                      <button key={apt.id} onClick={() => { setActiveTab('appointments'); setShowSearchDropdown(false); setSearchQuery(''); }} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50/70 dark:hover:bg-slate-800 text-xs transition">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{apt.patientName}</span>
                        <span className="ml-2 text-slate-500 text-[11px]">{apt.doctorName} · {apt.reason}</span>
                      </button>
                    ))}
                  </div>
                )}
                {filteredInventory.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Inventory</p>
                    {filteredInventory.map((item) => (
                      <button key={item.id} onClick={() => { setActiveTab('inventory'); setShowSearchDropdown(false); setSearchQuery(''); }} className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-teal-50/70 dark:hover:bg-slate-800 text-xs transition">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</span>
                        <span className="ml-2 text-slate-500 text-[11px]">{item.genericName}</span>
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
        ) : (
          /* Patient Privacy Banner in place of global search bar */
          <div className="flex-1 max-w-lg hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-800/40 text-teal-800 dark:text-teal-200 text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="truncate">Data Privacy Act (RA 10173) Isolated Session · Personal Record Access Only</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Inactivity Session Timer Indicator */}
          {isAuthenticated && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                sessionSecondsRemaining <= 60
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-400 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
              title={`${t.common.sessionRemaining}: ${Math.floor(sessionSecondsRemaining / 60)}m ${sessionSecondsRemaining % 60}s. (${t.common.inactivityNotice})`}
            >
              <Clock className={`w-3.5 h-3.5 ${sessionSecondsRemaining <= 60 ? 'text-amber-600 animate-spin' : 'text-teal-600 dark:text-teal-400'}`} />
              <span>
                {Math.floor(sessionSecondsRemaining / 60)}:{sessionSecondsRemaining % 60 < 10 ? '0' : ''}{sessionSecondsRemaining % 60}
              </span>
            </div>
          )}

          {/* Staff Quick Actions - Never rendered for Patient */}
          {!isPatient && (
            <div className="hidden md:flex items-center gap-1.5">
              {onOpenScanQR && canUserScanQR(activeRole, primaryRole, staffSubRole) && (
                <button
                  onClick={() => onOpenScanQR('checkin')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-700/80 rounded-lg transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Scan Patient Electronic Health ID QR Code (Receptionist & Nurse Only)"
                >
                  <QrCode className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{t.nav.scanHealthId}</span>
                </button>
              )}
            </div>
          )}

          {/* Supabase Hub: STRICT CONDITIONAL RENDERING - ONLY for Admin role */}
          {isAdmin && onOpenSupabaseModal && (
            <button onClick={onOpenSupabaseModal} className="p-1.5 text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/80 dark:border-emerald-700/50 rounded-lg transition flex items-center gap-1.5 text-xs font-medium cursor-pointer" title="Open Supabase Hub">
              <Database className="w-3.5 h-3.5 text-emerald-600" /><span className="hidden sm:inline text-[11px] font-semibold">Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition relative cursor-pointer"
              title={t.nav.notifications}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-teal-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      Notifications
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                      {isPatient ? 'Patient' : isAdmin ? 'Admin' : 'Provider'}
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                      <p className="font-medium text-slate-600 dark:text-slate-300">No notifications</p>
                      <p className="text-[11px] text-slate-400">All caught up for your role!</p>
                    </div>
                  ) : (
                    notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          setSelectedNotifModal(notif);
                          setShowNotifications(false);
                        }}
                        className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 ${
                          !notif.read ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate text-xs">
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-slate-400 text-[10px] mt-1">
                          {notif.createdAt || notif.timestamp
                            ? new Date(notif.createdAt || notif.timestamp || '').toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Just now'}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Clear "See All" Button */}
                <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      setActiveTab('notifications');
                    }}
                    className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>See All Notifications ({notifications.length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Profile Settings / Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            {isPatient ? (
              <button
                type="button"
                onClick={onOpenProfileSettings}
                className="flex items-center gap-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 p-1 -m-1 transition cursor-pointer group"
                title="Click to view & edit Profile Settings"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold text-[10px] flex items-center justify-center border border-teal-200/60 dark:border-teal-700/50 shadow-2xs group-hover:border-teal-500 transition">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    initials || <User className="w-4 h-4" />
                  )}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 leading-tight font-medium">
                    {t.nav.profileSettings}
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-bold text-[10px] flex items-center justify-center border border-teal-200/60 dark:border-teal-700/50 shadow-2xs" title={currentUser.name}>
                  {initials || <User className="w-4 h-4" />}
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight capitalize">
                    {currentUser.department || t.roles[activeRole] || activeRole}
                  </p>
                </div>
              </div>
            )}
            <button onClick={() => logout('home')} className="ml-1 p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition flex items-center gap-1 cursor-pointer" title={t.nav.signOut}>
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hidden md:inline">{t.nav.signOut}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Centered Popup Modal */}
      {selectedNotifModal && (
        <NotificationDetailModal
          notification={selectedNotifModal}
          onClose={() => setSelectedNotifModal(null)}
          onMarkAsRead={(id) => {
            markNotificationAsRead(id);
            setSelectedNotifModal((prev) => (prev ? { ...prev, read: true } : null));
          }}
        />
      )}
    </header>
  );
};
