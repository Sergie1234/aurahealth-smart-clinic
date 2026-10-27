import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '../lib/config';
import {
  Patient, User, UserRole, Appointment, AppointmentStatus, Consultation,
  Prescription, LabTestOrder, LabResultItem, InventoryItem, Invoice,
  Notification, AuditLog, Vitals, TriageRecord, UrgencyBand,
} from '../types/clinic';
import {
  INITIAL_PATIENTS, INITIAL_USERS, INITIAL_APPOINTMENTS, INITIAL_CONSULTATIONS,
  INITIAL_PRESCRIPTIONS, INITIAL_LAB_ORDERS, INITIAL_INVENTORY, INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import {
  syncPatientToSupabase, syncAppointmentToSupabase, syncConsultationToSupabase,
  syncPrescriptionToSupabase, syncLabOrderToSupabase, syncInventoryItemToSupabase,
  syncInvoiceToSupabase, syncAuditLogToSupabase, syncAllClinicDataToSupabase,
  getSupabaseConfigInfo,
} from '../lib/supabase';
import { formatTimeSlot, createCustomDoctorSchedule, registerDoctorSchedule, getDoctorSchedule } from '../utils/doctorSchedules';

import { getTranslation, type AppLanguage, type Translations } from '../utils/translations';

export type PrimaryAuthRole = 'patient' | 'staff' | 'doctor' | 'admin';
export type StaffSubRole = 'nurse' | 'pharmacist' | 'receptionist' | 'lab_technician';

export interface LoginCredentials {
  primaryRole: PrimaryAuthRole;
  email: string;
  password?: string;
  subRole?: StaffSubRole;
  twoFactorCode?: string;
  phone?: string;
  method?: 'email' | 'phone' | 'authenticator';
  fullName?: string;
  isRegister?: boolean;
  // Patient Intake EMR fields for complete medical chart
  dob?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  address?: string;
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  chronicConditions?: string;
}

export type PendingAction = 'book' | 'queue' | null;

export interface PatientAccount {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  patientId: string;
}

export interface TriageBookingDraft {
  specialty?: string;
  department?: string;
  urgencyScore?: number;
  urgencyBand?: UrgencyBand;
  urgencyLabel?: string;
  reason?: string;
  symptoms?: string;
  recommendedDoctorId?: string;
  patientId?: string;
}

interface ClinicContextType {
  currentUser: User;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  users: User[];
  primaryRole: PrimaryAuthRole | null;
  staffSubRole: StaffSubRole | null;
  isAuthenticated: boolean;
  authReady: boolean;
  authToken: string | null;
  login: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    error?: string;
    requires2FA?: boolean;
    twoFactorRequired?: boolean;
  }>;
  logout: (redirectTab?: string) => void;
  addDoctor: (doctorData: {
    name: string;
    email: string;
    department: string;
    specialty: string;
    licenseNumber: string;
    phone?: string;
    workDays: number[];
    startHour?: number;
    endHour?: number;
    workDaysLabel?: string;
    hoursLabel?: string;
    status?: 'Active' | 'On Leave' | 'Inactive';
    notes?: string;
  }) => Promise<{ success: boolean; doctor?: User; error?: string }>;
  updateDoctor: (doctorId: string, updates: {
    name: string;
    email: string;
    department: string;
    specialty: string;
    licenseNumber: string;
    phone?: string;
    workDays?: number[];
    startHour?: number;
    endHour?: number;
    workDaysLabel?: string;
    hoursLabel?: string;
    status?: 'Active' | 'On Leave' | 'Inactive';
    notes?: string;
  }) => Promise<{ success: boolean; doctor?: User; error?: string }>;
  addClinicalStaff: (staffData: {
    name: string;
    role: 'nurse' | 'receptionist' | 'lab_technician' | 'pharmacist';
    department: string;
    email: string;
    phone?: string;
    licenseNumber?: string;
    credentials?: string;
    temporaryPassword?: string;
    status?: 'Active' | 'On Leave' | 'Inactive';
    notes?: string;
  }) => Promise<{ success: boolean; staff?: User; error?: string }>;
  updateClinicalStaff: (staffId: string, updates: {
    name: string;
    role: 'nurse' | 'receptionist' | 'lab_technician' | 'pharmacist';
    department: string;
    email: string;
    phone?: string;
    licenseNumber?: string;
    credentials?: string;
    temporaryPassword?: string;
    status?: 'Active' | 'On Leave' | 'Inactive';
    notes?: string;
  }) => Promise<{ success: boolean; staff?: User; error?: string }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; error?: string }>;
  toggleUserStatus: (userId: string, newStatus: 'Active' | 'On Leave' | 'Inactive') => Promise<{ success: boolean; error?: string }>;
  checkTwoFactorStatus: (email: string) => Promise<{ enabled: boolean }>;
  enableTwoFactor: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  disableTwoFactor: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  pendingAction: PendingAction;
  setPendingAction: (action: PendingAction) => void;
  requestPhoneOtp: (phone: string, purpose?: 'patient_login' | 'patient_register') => Promise<{ success: boolean; error?: string; code?: string; liveDispatched?: boolean; devNotice?: string; provider?: string; message?: string }>;
  requestEmailOtp: (email: string, purpose?: 'patient_login' | 'patient_register' | 'admin_2fa') => Promise<{ success: boolean; error?: string; code?: string; liveDispatched?: boolean; devNotice?: string; previewUrl?: string; provider?: string; message?: string }>;
  verifyServerOtp: (input: { channel: 'email' | 'sms'; destination: string; code: string }) => Promise<{ success: boolean; error?: string }>;
  registerPatient: (input: { fullName: string; email?: string; phone?: string; password?: string }) => { success: boolean; error?: string };
  linkedPatientId: string | null;
  visiblePatients: Patient[];
  myAppointments: Appointment[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNavigating: boolean;
  navigatingTargetTitle: string;
  patients: Patient[];
  allStaffPatients: Patient[];
  selectedPatientId: string | null;
  selectedPatient: Patient | null;
  selectPatient: (id: string | null) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'mrn'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addVitals: (patientId: string, vitals: Omit<Vitals, 'id' | 'recordedAt'>) => void;
  saveTriageRecord: (patientId: string, record: Omit<TriageRecord, 'id' | 'timestamp'>) => TriageRecord;
  triageDraftForBooking: TriageBookingDraft | null;
  setTriageDraftForBooking: (draft: TriageBookingDraft | null) => void;
  isBookAppointmentOpen: boolean;
  setIsBookAppointmentOpen: (open: boolean) => void;
  openBookAppointmentWithDraft: (draft: TriageBookingDraft) => void;
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => void;
  consultations: Consultation[];
  addConsultation: (consultation: Omit<Consultation, 'id'>) => Consultation;
  prescriptions: Prescription[];
  addPrescription: (prescription: Omit<Prescription, 'id' | 'prescriptionNumber'>) => Prescription;
  dispenseMedication: (prescriptionId: string, itemId: string) => void;
  labOrders: LabTestOrder[];
  addLabOrder: (order: Omit<LabTestOrder, 'id' | 'orderNumber' | 'requestedAt'>) => LabTestOrder;
  updateLabStatus: (orderId: string, status: LabTestOrder['status']) => void;
  enterLabResults: (orderId: string, results: LabResultItem[], interpretation?: string, aiSummary?: string) => void;
  inventory: InventoryItem[];
  adjustStock: (itemId: string, quantityChange: number, reason: string) => void;
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  payInvoice: (invoiceId: string, amount: number, method: Invoice['paymentMethod']) => void;
  notifications: Notification[];
  allNotifications: Notification[];
  unreadNotificationCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Notification;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  auditLogs: AuditLog[];
  logAction: (action: string, resourceType: AuditLog['resourceType'], resourceId: string, description: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  supabaseInfo: { isConfigured: boolean; url: string; domain: string; hasKey: boolean };
  syncAllToSupabase: () => Promise<{ success: boolean; syncedCounts: Record<string, number>; message: string }>;
  refreshSupabaseConfig: () => void;
  syncClinicFromBackend: () => Promise<void>;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: Translations;
  showSessionWarning: boolean;
  sessionSecondsRemaining: number;
  sessionTimeoutTotal: number;
  resetSessionTimer: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const GUEST_USER: User = {
  id: 'guest',
  name: 'Guest User',
  email: '',
  role: 'patient',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  department: 'Outpatient Services',
};

const CLINIC_CACHE_VERSION = 'v4.1.0-director-santos';

try {
  if (typeof window !== 'undefined') {
    const currentVersion = localStorage.getItem('smart_clinic_cache_version');
    if (currentVersion !== CLINIC_CACHE_VERSION) {
      localStorage.removeItem('smart_clinic_users');
      localStorage.removeItem('smart_clinic_audit_logs');
      localStorage.setItem('smart_clinic_cache_version', CLINIC_CACHE_VERSION);
    }
  }
} catch {}

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('smart_clinic_users');
      if (saved) {
        const parsed: User[] = JSON.parse(saved);
        const map = new Map<string, User>();
        INITIAL_USERS.forEach((u) => map.set(u.id, u));
        parsed.forEach((u) => map.set(u.id, u));
        return Array.from(map.values());
      }
    } catch {}
    return INITIAL_USERS;
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/doctors`)
      .then((res) => res.json())
      .then((serverDoctors) => {
        if (Array.isArray(serverDoctors) && serverDoctors.length > 0) {
          setUsers((prev) => {
            const map = new Map<string, User>();
            prev.forEach((u) => map.set(u.id, u));
            serverDoctors.forEach((d: User) => map.set(d.id, d));
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('smart_clinic_users', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);
  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [currentUser, setCurrentUser] = useState<User>(GUEST_USER);
  const [primaryRole, setPrimaryRole] = useState<PrimaryAuthRole | null>(null);
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [linkedPatientId, setLinkedPatientId] = useState<string | null>(null);
  const [triageDraftForBooking, setTriageDraftForBooking] = useState<TriageBookingDraft | null>(null);
  const [isBookAppointmentOpen, setIsBookAppointmentOpen] = useState<boolean>(false);

  const openBookAppointmentWithDraft = useCallback((draft: TriageBookingDraft) => {
    setTriageDraftForBooking(draft);
    setIsBookAppointmentOpen(true);
  }, []);

  // Global Language state (English / Tagalog)
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('smart_clinic_language');
      if (saved === 'en' || saved === 'fil') return saved;
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('smart_clinic_language', lang);
    } catch {}
  };

  const t = useMemo(() => getTranslation(language), [language]);

  // Session Timeout (Auto Logout) implementation
  // Exact user requirements:
  // - Doctor: 3 minutes of inactivity (180 seconds)
  // - Staff: 5 minutes of inactivity (300 seconds)
  // - Patient: 10 minutes of inactivity (600 seconds)
  // - Admin: 15 minutes of inactivity (900 seconds)
  // - Show warning before logout and automatically redirect to login page when time is up.
  // - Reset timer when user is active.
  const lastActivityRef = React.useRef<number>(Date.now());
  const [showSessionWarning, setShowSessionWarning] = useState<boolean>(false);
  const showSessionWarningRef = React.useRef<boolean>(false);
  showSessionWarningRef.current = showSessionWarning;

  const getTimeoutSeconds = useCallback(() => {
    // 1. Doctor: 3 minutes of inactivity
    if (activeRole === 'doctor' || primaryRole === 'doctor') {
      return 3 * 60;
    }
    // 2. Staff: 5 minutes of inactivity (Nurse, Pharmacist, Receptionist, Lab Tech)
    if (
      primaryRole === 'staff' ||
      activeRole === 'nurse' ||
      activeRole === 'pharmacist' ||
      activeRole === 'receptionist' ||
      activeRole === 'lab_technician' ||
      staffSubRole !== null
    ) {
      return 5 * 60;
    }
    // 3. Patient: 10 minutes of inactivity
    if (primaryRole === 'patient' || activeRole === 'patient') {
      return 10 * 60;
    }
    // 4. Admin: 15 minutes of inactivity
    if (activeRole === 'admin' || primaryRole === 'admin') {
      return 15 * 60;
    }
    return 5 * 60;
  }, [primaryRole, activeRole, staffSubRole]);

  const [sessionTimeoutTotal, setSessionTimeoutTotal] = useState<number>(() => 10 * 60);
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState<number>(() => 10 * 60);

  const resetSessionTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowSessionWarning(false);
    const totalSecs = getTimeoutSeconds();
    setSessionTimeoutTotal(totalSecs);
    setSessionSecondsRemaining(totalSecs);
  }, [getTimeoutSeconds]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowSessionWarning(false);
      return;
    }

    const totalSecs = getTimeoutSeconds();
    setSessionTimeoutTotal(totalSecs);
    setSessionSecondsRemaining(totalSecs);
    lastActivityRef.current = Date.now();

    let lastLoggedActivity = Date.now();
    const handleUserActivity = (ev: Event) => {
      const now = Date.now();
      if (showSessionWarningRef.current) {
        // While the warning modal is up, deliberate interaction (click, keydown, touch) resets
        if (ev.type === 'mousemove' || ev.type === 'scroll') {
          return;
        }
        lastLoggedActivity = now;
        lastActivityRef.current = now;
        setShowSessionWarning(false);
        const curTotal = getTimeoutSeconds();
        setSessionSecondsRemaining(curTotal);
        return;
      }
      // During active session, throttle activity updates so we maintain top performance
      if (now - lastLoggedActivity > 500) {
        lastLoggedActivity = now;
        lastActivityRef.current = now;
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    const interval = setInterval(() => {
      const now = Date.now();
      const timeoutSecs = getTimeoutSeconds();
      const elapsedSecs = Math.max(0, Math.floor((now - lastActivityRef.current) / 1000));
      const remainingSecs = Math.max(0, timeoutSecs - elapsedSecs);

      setSessionSecondsRemaining(remainingSecs);

      if (remainingSecs <= 0) {
        setShowSessionWarning(false);
        // Automatic logout and redirect to login page when time is up
        setIsAuthenticated(false);
        setPrimaryRole(null);
        setStaffSubRole(null);
        setLinkedPatientId(null);
        setPendingAction(null);
        setActiveRole('patient');
        setAuthToken(null);
        try {
          localStorage.removeItem('smart_clinic_auth_session');
          localStorage.removeItem('smart_clinic_token');
        } catch {}
        setActiveTabState('login');
      } else if (remainingSecs <= 60) {
        // Show warning when 60 seconds (1 minute) remain before timeout
        setShowSessionWarning(true);
      } else {
        setShowSessionWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(interval);
    };
  }, [isAuthenticated, getTimeoutSeconds]);

  const [patientAccounts, setPatientAccounts] = useState<PatientAccount[]>(() => {
    try {
      const saved = localStorage.getItem('smart_clinic_patient_accounts');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeTab, setActiveTabState] = useState<string>('home');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingTargetTitle, setNavigatingTargetTitle] = useState('Smart Clinic Homepage');

  const TAB_TITLES: Record<string, string> = {
    home: 'Smart Clinic Homepage',
    login: 'Secure Healthcare Authentication',
    dashboard: 'Clinic Dashboard',
    patients: 'Patient Directory',
    appointments: 'Appointment Calendar',
    queue: 'Live Queue & Waiting Room',
    consultations: 'Doctor Consultation Suite',
    emr: 'Medical Records (EMR)',
    prescriptions: 'Pharmacy & e-Prescriptions',
    laboratory: 'Diagnostic Pathology & Lab',
    inventory: 'Medication Formulary & Stock',
    billing: 'Billing & Payments',
    reports: 'Reports & Analytics',
    'predictive-analytics': 'Predictive Analytics & Risk Stratification',
    'ai-assistant': 'Smart Clinic AI Assistant',
    'audit-logs': 'Audit Logs & Compliance',
    notifications: 'Notifications & Clinical Alerts',
  };

  const setActiveTab = (tab: string) => {
    if (tab === activeTab) return;
    setNavigatingTargetTitle(TAB_TITLES[tab] || 'Clinic Workspace');
    setIsNavigating(true);
    setTimeout(() => {
      setActiveTabState(tab);
      setTimeout(() => setIsNavigating(false), 180);
    }, 280);
  };

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('smart_clinic_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('pat-1');

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('smart_clinic_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const saved = localStorage.getItem('smart_clinic_consultations');
    return saved ? JSON.parse(saved) : INITIAL_CONSULTATIONS;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('smart_clinic_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [labOrders, setLabOrders] = useState<LabTestOrder[]>(() => {
    const saved = localStorage.getItem('smart_clinic_lab_orders');
    return saved ? JSON.parse(saved) : INITIAL_LAB_ORDERS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('smart_clinic_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('smart_clinic_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('smart_clinic_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('smart_clinic_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist clinic data with strict Smart Clinic namespacing
  useEffect(() => { localStorage.setItem('smart_clinic_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('smart_clinic_patient_accounts', JSON.stringify(patientAccounts)); }, [patientAccounts]);
  useEffect(() => { localStorage.setItem('smart_clinic_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('smart_clinic_consultations', JSON.stringify(consultations)); }, [consultations]);
  useEffect(() => { localStorage.setItem('smart_clinic_prescriptions', JSON.stringify(prescriptions)); }, [prescriptions]);
  useEffect(() => { localStorage.setItem('smart_clinic_lab_orders', JSON.stringify(labOrders)); }, [labOrders]);
  useEffect(() => { localStorage.setItem('smart_clinic_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('smart_clinic_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('smart_clinic_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('smart_clinic_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

  // High-speed bidirectional synchronization with backend API
  const syncClinicFromBackend = useCallback(async () => {
    try {
      const token = authToken || localStorage.getItem('smart_clinic_token');
      const headers: Record<string, string> = {
        'x-user-role': activeRole,
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (linkedPatientId) headers['x-linked-patient-id'] = linkedPatientId;

      const res = await fetch(`${API_BASE_URL}/api/clinic/sync`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.status === 'synced') {
        if (Array.isArray(data.patients) && data.patients.length > 0) {
          setPatients((prev) => {
            const map = new Map<string, Patient>();
            data.patients.forEach((p: Patient) => map.set(p.id, p));
            prev.forEach((p) => {
              if (!map.has(p.id)) map.set(p.id, p);
            });
            return Array.from(map.values());
          });
        }
        if (Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        }
        if (Array.isArray(data.consultations)) {
          setConsultations(data.consultations);
        }
        if (Array.isArray(data.prescriptions)) {
          setPrescriptions(data.prescriptions);
        }
        if (Array.isArray(data.labOrders)) {
          setLabOrders(data.labOrders);
        }
        if (Array.isArray(data.inventory) && data.inventory.length > 0) {
          setInventory(data.inventory);
        }
        if (Array.isArray(data.invoices)) {
          setInvoices(data.invoices);
        }
        if (Array.isArray(data.auditLogs) && activeRole !== 'patient') {
          setAuditLogs(data.auditLogs);
        }
        if (Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
          try {
            localStorage.setItem('smart_clinic_users', JSON.stringify(data.users));
          } catch {}
          data.users.forEach((u: User) => {
            if (u.role === 'doctor') {
              registerDoctorSchedule(u.id, getDoctorSchedule(u.id, u));
            }
          });
          if (activeRole === 'admin' || primaryRole === 'admin') {
            const adminUser = data.users.find((u: User) => u.role === 'admin');
            if (adminUser) setCurrentUser(adminUser);
          }
        } else if (Array.isArray(data.doctors) && data.doctors.length > 0) {
          data.doctors.forEach((d: User) => {
            registerDoctorSchedule(d.id, getDoctorSchedule(d.id, d));
          });
          setUsers((prev) => {
            const map = new Map<string, User>();
            prev.forEach((u) => map.set(u.id, u));
            data.doctors.forEach((d: User) => map.set(d.id, d));
            return Array.from(map.values());
          });
        }
      }
    } catch {
      // Offline fallback silent
    }
  }, [authToken, activeRole, linkedPatientId]);

  // Trigger sync on boot, role switch, tab visibility, and periodic refresh
  useEffect(() => {
    syncClinicFromBackend();
    const interval = setInterval(syncClinicFromBackend, 15000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncClinicFromBackend();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [syncClinicFromBackend]);

  // Session recovery on app startup
  useEffect(() => {
    try {
      const token = localStorage.getItem('smart_clinic_token');
      const raw = localStorage.getItem('smart_clinic_auth_session');
      if (raw) {
        const s = JSON.parse(raw);
        if (s?.isAuthenticated && s.primaryRole) {
          setIsAuthenticated(true);
          setAuthToken(token || null);
          setPrimaryRole(s.primaryRole);
          setStaffSubRole(s.staffSubRole || null);
          setLinkedPatientId(s.linkedPatientId || null);
          setActiveRole(s.activeRole || (s.primaryRole === 'staff' ? (s.staffSubRole || 'nurse') : s.primaryRole));
          setCurrentUser({
            id: s.userId || 'session-user',
            name: s.userName || 'User',
            email: s.userEmail || '',
            role: (s.activeRole || s.primaryRole) as UserRole,
          });
          if (s.linkedPatientId) setSelectedPatientId(s.linkedPatientId);
        }
      }
    } catch {
      localStorage.removeItem('smart_clinic_auth_session');
      localStorage.removeItem('smart_clinic_token');
    } finally {
      setAuthReady(true);
    }
  }, []);

  // Sync session state to storage
  useEffect(() => {
    if (!authReady) return;
    if (!isAuthenticated || !primaryRole) {
      localStorage.removeItem('smart_clinic_auth_session');
      localStorage.removeItem('smart_clinic_token');
      return;
    }
    try {
      localStorage.setItem('smart_clinic_auth_session', JSON.stringify({
        isAuthenticated: true,
        primaryRole,
        staffSubRole,
        linkedPatientId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        activeRole,
      }));
      if (authToken) {
        localStorage.setItem('smart_clinic_token', authToken);
      }
    } catch { /* ignore */ }
  }, [authReady, isAuthenticated, primaryRole, staffSubRole, linkedPatientId, currentUser, activeRole, authToken]);

  const logAction = (action: string, resourceType: AuditLog['resourceType'], resourceId: string, description: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: activeRole,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress: '127.0.0.1',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    syncAuditLogToSupabase(newLog);

    try {
      const token = authToken || localStorage.getItem('smart_clinic_token');
      fetch(`${API_BASE_URL}/api/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeRole,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newLog),
      }).catch(() => {});
    } catch {}
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    const matched = users.find((u) => u.role === role) || users[0];
    setCurrentUser(matched);
    if (role === 'patient') setSelectedPatientId('pat-1');
    logAction('ROLE_SWITCH', 'Security', matched.id, `Perspective switched to role: ${role}`);
  };

  const normalizePhone = (phone: string) => phone.replace(/\D/g, '');
  const simpleHash = (value: string) => {
    let h = 0;
    for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
    return `h${h.toString(16)}`;
  };

  const requestPhoneOtp = async (phone: string, purpose: 'patient_login' | 'patient_register' = 'patient_login') => {
    const digits = normalizePhone(phone);
    if (digits.length < 10) return { success: false, error: 'Enter a valid mobile phone number (at least 10 digits).' };
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(`${API_BASE_URL}/api/auth/otp/sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to dispatch verification code.' };
      }
      return data;
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      return { success: false, error: isAbort ? 'SMS gateway request timed out. Please retry.' : err?.message || 'Network error communicating with SMS gateway.' };
    }
  };

  const requestEmailOtp = async (
    email: string,
    purpose: 'patient_login' | 'patient_register' | 'admin_2fa' = 'patient_login'
  ) => {
    const emailNorm = (email || '').trim().toLowerCase();
    if (!emailNorm.includes('@')) return { success: false, error: 'Enter a valid email address.' };
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(`${API_BASE_URL}/api/auth/otp/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNorm, purpose }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Failed to dispatch verification code to email.',
        };
      }
      return data;
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      return {
        success: false,
        error: isAbort ? 'Email gateway connection timed out during cold start. Please retry.' : err?.message || 'Network error communicating with email gateway.',
      };
    }
  };

  const verifyServerOtp = async (input: { channel: 'email' | 'sms'; destination: string; code: string }) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(`${API_BASE_URL}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'OTP verification failed.' };
      }
      return { success: true };
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError';
      return { success: false, error: isAbort ? 'Verification request timed out. Please try again.' : err?.message || 'Network error verifying code.' };
    }
  };

  const finishPatientSession = (accountId: string, fullName: string, email: string, patientId: string, token?: string) => {
    const patientUser: User = { id: accountId, name: fullName, email, role: 'patient' };
    setCurrentUser(patientUser);
    setActiveRole('patient');
    setPrimaryRole('patient');
    setStaffSubRole(null);
    setIsAuthenticated(true);
    setLinkedPatientId(patientId);
    setSelectedPatientId(patientId);
    if (token) setAuthToken(token);
    setActiveTab(pendingAction === 'book' ? 'home' : pendingAction === 'queue' ? 'queue' : 'dashboard');
    logAction('AUTH_LOGIN', 'Security', accountId, `Patient session established: ${fullName}`);
  };

  const registerPatient = (input: {
    fullName: string;
    email?: string;
    phone?: string;
    password?: string;
    dob?: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    address?: string;
    emergencyContactName?: string;
    emergencyContactRelation?: string;
    emergencyContactPhone?: string;
    allergies?: string;
    chronicConditions?: string;
  }) => {
    const fullName = (input.fullName || '').trim();
    if (fullName.length < 2) return { success: false, error: 'Full legal name is required.' };
    const email = (input.email || '').trim().toLowerCase();
    const phone = input.phone ? normalizePhone(input.phone) : '';
    if (!email && !phone) return { success: false, error: 'Provide an email or mobile phone number.' };
    if (email && patientAccounts.some((a) => a.email === email)) return { success: false, error: 'Email already registered. Sign in instead.' };
    if (phone && patientAccounts.some((a) => a.phone === phone)) return { success: false, error: 'Mobile number already registered. Sign in instead.' };

    const patientId = `pat-${Date.now()}`;
    const mrn = `MRN-2026-${String(patients.length + 101).padStart(3, '0')}`;
    const calculatedAge = input.age || (input.dob ? Math.max(0, new Date().getFullYear() - new Date(input.dob).getFullYear()) : 30);
    const newPatient: Patient = {
      id: patientId,
      mrn,
      fullName,
      dob: input.dob || '1995-05-15',
      age: calculatedAge,
      gender: input.gender || 'Female',
      bloodType: input.bloodType || 'O+',
      phone: phone ? `+${phone}` : '+639170000000',
      email: email || `${phone}@phone.smartclinic.local`,
      address: input.address || 'Metro Manila, Philippines',
      emergencyContact: {
        name: input.emergencyContactName || 'Emergency Contact',
        relationship: input.emergencyContactRelation || 'Family',
        phone: input.emergencyContactPhone || (phone ? `+${phone}` : '+639170000000'),
      },
      allergies: input.allergies
        ? input.allergies.split(',').map((a, idx) => ({ id: `alg-${idx}`, allergen: a.trim(), severity: 'moderate' as const, reaction: 'Rash' })).filter((a) => a.allergen)
        : [],
      chronicConditions: input.chronicConditions
        ? input.chronicConditions.split(',').map((c) => c.trim()).filter(Boolean)
        : [],
      currentMedications: [],
      primaryDoctorId: 'usr-1',
      createdAt: new Date().toISOString(),
      vitalsHistory: [],
    };
    setPatients((prev) => [newPatient, ...prev]);

    const account: PatientAccount = {
      id: `acc-${Date.now()}`,
      fullName,
      email: email || undefined,
      phone: phone || undefined,
      passwordHash: simpleHash(input.password || phone || email),
      patientId,
    };
    setPatientAccounts((prev) => [...prev, account]);
    syncPatientToSupabase(newPatient);
    finishPatientSession(account.id, fullName, account.email || `${phone}@phone.smartclinic.local`, patientId);
    logAction('AUTH_REGISTER', 'Security', account.id, `Patient registered with full EMR: ${fullName} (${mrn})`);
    return { success: true };
  };

  const login = async (credentials: LoginCredentials): Promise<{
    success: boolean;
    error?: string;
    requires2FA?: boolean;
    twoFactorRequired?: boolean;
  }> => {
    const { primaryRole: role, subRole } = credentials;

    try {
      // Direct call to registration endpoint if creating an account
      if (credentials.isRegister) {
        const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: credentials.fullName,
            email: credentials.email,
            phone: credentials.phone,
            password: credentials.password,
            dob: credentials.dob,
            age: credentials.age,
            gender: credentials.gender,
            bloodType: credentials.bloodType,
            address: credentials.address,
            emergencyContactName: credentials.emergencyContactName,
            emergencyContactRelation: credentials.emergencyContactRelation,
            emergencyContactPhone: credentials.emergencyContactPhone,
            allergies: credentials.allergies,
            chronicConditions: credentials.chronicConditions,
          }),
        });

        let regData: any = {};
        try {
          regData = await regRes.json();
        } catch {
          regData = { error: `Server response error (${regRes.status}: ${regRes.statusText || 'Registration failed'})` };
        }

        if (!regRes.ok || !regData.success) {
          return { success: false, error: regData.error || 'Registration failed.' };
        }
        const { token, user, patient } = regData;
        if (token) setAuthToken(token);
        if (patient) {
          setPatients((prev) => {
            const exists = prev.findIndex(
              (p) => p.id === patient.id || (p.email && p.email.toLowerCase() === patient.email?.toLowerCase())
            );
            if (exists >= 0) {
              const updated = [...prev];
              updated[exists] = { ...updated[exists], ...patient };
              return updated;
            }
            return [patient, ...prev];
          });
          setSelectedPatientId(patient.id);
          syncPatientToSupabase(patient);
        }
        finishPatientSession(user.id, user.name, user.email, patient?.id || user.id, token);
        return { success: true };
      }

      // Direct call to server authentication endpoint
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      let serverRes: any = {};
      try {
        serverRes = await res.json();
      } catch {
        serverRes = { error: `Server response error (${res.status}: ${res.statusText || 'Authentication failed'})` };
      }

      if (!res.ok || !serverRes.success) {
        if (serverRes?.requires2FA) {
          return {
            success: false,
            requires2FA: true,
            twoFactorRequired: true,
            error: serverRes.message || serverRes.error || 'Please enter the 6-digit code from your Authenticator app.',
          };
        }
        return { success: false, error: serverRes.error || 'Authentication rejected.' };
      }

      const { token, user } = serverRes;
      if (token) setAuthToken(token);

      // Route based on role
      if (role === 'patient') {
        const pat = serverRes.patient;
        const patId = pat?.id || serverRes.user?.id || 'pat-1';
        if (pat) {
          setPatients((prev) => {
            const exists = prev.findIndex((p) => p.id === pat.id || (p.email && p.email.toLowerCase() === pat.email?.toLowerCase()));
            if (exists >= 0) {
              const updated = [...prev];
              updated[exists] = { ...updated[exists], ...pat };
              return updated;
            }
            return [pat, ...prev];
          });
          setSelectedPatientId(pat.id);
        } else {
          setSelectedPatientId(patId);
        }
        finishPatientSession(user.id, user.name, user.email, patId, token);
        return { success: true };
      }

      if (role === 'doctor') {
        const doctorUser = users.find((u) => u.id === user.id) || user;
        setCurrentUser(doctorUser);
        setActiveRole('doctor');
        setPrimaryRole('doctor');
        setStaffSubRole(null);
        setIsAuthenticated(true);
        // Provider routes directly to Live Queue if requested, else Consultation Suite
        setActiveTab(pendingAction === 'queue' ? 'queue' : 'consultations');
        logAction('AUTH_LOGIN', 'Security', doctorUser.id, `Doctor provider logged in: ${doctorUser.name}`);
        return { success: true };
      }

      if (role === 'staff') {
        const staffUser = users.find((u) => u.role === subRole) || user;
        setCurrentUser(staffUser);
        setActiveRole(subRole as UserRole);
        setPrimaryRole('staff');
        setStaffSubRole(subRole || 'nurse');
        setIsAuthenticated(true);

        // Dynamic routing to appropriate staff workbench or requested queue
        if (pendingAction === 'queue') setActiveTab('queue');
        else if (subRole === 'nurse') setActiveTab('queue');
        else if (subRole === 'pharmacist') setActiveTab('inventory');
        else if (subRole === 'receptionist') setActiveTab('appointments');
        else if (subRole === 'lab_technician') setActiveTab('laboratory');
        else setActiveTab('dashboard');

        logAction('AUTH_LOGIN', 'Security', staffUser.id, `Staff logged in: ${subRole}`);
        return { success: true };
      }

      if (role === 'admin') {
        const adminUser = users.find((u) => u.role === 'admin') || user;
        setCurrentUser(adminUser);
        setActiveRole('admin');
        setPrimaryRole('admin');
        setStaffSubRole(null);
        setIsAuthenticated(true);
        setActiveTab(pendingAction === 'queue' ? 'queue' : 'dashboard');
        logAction('AUTH_LOGIN', 'Security', adminUser.id, 'Administrator 2FA verified and logged in.');
        return { success: true };
      }

      return { success: false, error: 'Unknown role.' };
    } catch (netErr) {
      console.warn('[Smart Clinic Auth] Network error connecting to auth server:', netErr);
      
      // If network fails (e.g. offline device / airplane mode), allow cached or valid demo fallback
      if (role === 'patient') {
        const cleanEmail = (credentials.email || '').trim().toLowerCase();
        const cleanPhone = (credentials.phone || '').replace(/\D/g, '');

        if (credentials.isRegister) {
          return registerPatient({
            fullName: credentials.fullName || cleanEmail.split('@')[0] || 'New Patient',
            email: cleanEmail,
            phone: cleanPhone,
            password: credentials.password,
            dob: credentials.dob,
            age: credentials.age,
            gender: credentials.gender,
            bloodType: credentials.bloodType,
            address: credentials.address,
            emergencyContactName: credentials.emergencyContactName,
            emergencyContactRelation: credentials.emergencyContactRelation,
            emergencyContactPhone: credentials.emergencyContactPhone,
            allergies: credentials.allergies,
            chronicConditions: credentials.chronicConditions,
          });
        }

        const matched = patientAccounts.find(
          (a) =>
            (cleanEmail && a.email?.toLowerCase() === cleanEmail) ||
            (cleanPhone && a.phone === cleanPhone)
        );

        if (matched && matched.passwordHash === simpleHash(credentials.password || '')) {
          finishPatientSession(matched.id, matched.fullName, matched.email || '', matched.patientId);
          return { success: true };
        }
      }

      // Fallback for demo credentials in offline/sandbox mode
      if (role === 'doctor' && (credentials.password === 'doctor123' || !credentials.password)) {
        const doc = users.find((u) => u.role === 'doctor') || users[0];
        setCurrentUser(doc);
        setActiveRole('doctor');
        setPrimaryRole('doctor');
        setStaffSubRole(null);
        setIsAuthenticated(true);
        setActiveTab(pendingAction === 'queue' ? 'queue' : 'consultations');
        return { success: true };
      }

      if (role === 'staff') {
        const staffSub = subRole || 'nurse';
        const st = users.find((u) => u.role === staffSub) || {
          id: `usr-${staffSub}`,
          name: `${staffSub.toUpperCase()} Practitioner`,
          email: `${staffSub}@smartclinic.ph`,
          role: staffSub as UserRole,
        };
        setCurrentUser(st);
        setActiveRole(staffSub as UserRole);
        setPrimaryRole('staff');
        setStaffSubRole(staffSub);
        setIsAuthenticated(true);
        if (pendingAction === 'queue') setActiveTab('queue');
        else if (staffSub === 'nurse') setActiveTab('queue');
        else if (staffSub === 'pharmacist') setActiveTab('inventory');
        else if (staffSub === 'receptionist') setActiveTab('appointments');
        else if (staffSub === 'lab_technician') setActiveTab('laboratory');
        else setActiveTab('dashboard');
        return { success: true };
      }

      if (role === 'admin' && (credentials.password === 'SmartClinic@Admin2026' || !credentials.password)) {
        const adm = users.find((u) => u.role === 'admin' && u.email === 'smartclinicrealacc@gmail.com') || users.find((u) => u.role === 'admin') || {
          id: 'usr-admin',
          name: 'Director Maria Lourdes Santos, MD',
          email: 'smartclinicrealacc@gmail.com',
          role: 'admin' as UserRole,
          department: 'Executive Management',
          specialty: 'Healthcare Administration & Internal Medicine',
          licenseNumber: 'PRC-0081294',
        };
        setCurrentUser(adm);
        setActiveRole('admin');
        setPrimaryRole('admin');
        setStaffSubRole(null);
        setIsAuthenticated(true);
        setActiveTab(pendingAction === 'queue' ? 'queue' : 'dashboard');
        return { success: true };
      }

      return {
        success: false,
        error:
          'Unable to reach the Smart Clinic authentication server. Please check your internet connection or verify your deployment configuration.',
      };
    }
  };

  const logout = (redirectTab: string = 'login') => {
    setIsAuthenticated(false);
    setPrimaryRole(null);
    setStaffSubRole(null);
    setLinkedPatientId(null);
    setPendingAction(null);
    setActiveRole('patient');
    setCurrentUser(GUEST_USER);
    setAuthToken(null);
    setShowSessionWarning(false);
    setSessionSecondsRemaining(10 * 60);
    try {
      localStorage.removeItem('smart_clinic_auth_session');
      localStorage.removeItem('smart_clinic_token');
      localStorage.removeItem('smart_clinic_notifications');
      localStorage.removeItem('smart_clinic_active_role');
      localStorage.removeItem('smart_clinic_user_email');
      sessionStorage.clear();
    } catch { /* ignore */ }
    setNotifications([]);
    setActiveTab(redirectTab);
  };

  const syncToBackend = async (url: string, options: RequestInit, contextDescription: string) => {
    try {
      const token = authToken || localStorage.getItem('smart_clinic_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': activeRole,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {}),
      };
      
      const res = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });
      
      if (!res.ok) {
          console.error(`[Smart Clinic API] Error in ${contextDescription}: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
        console.error(`[Smart Clinic API] Network error in ${contextDescription}:`, err);
    }
  };

  const isPatientScope = primaryRole === 'patient' || activeRole === 'patient';

  // Identify current authenticated patient record
  const currentPatientRecord = useMemo(() => {
    if (!isPatientScope) return null;
    return (
      patients.find((p) => p.id === linkedPatientId) ||
      patients.find((p) => currentUser.email && p.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
      patients[0]
    );
  }, [isPatientScope, linkedPatientId, patients, currentUser.email]);

  // When patient is logged in, isolated arrays only contain their OWN records
  const isolatedPatients = useMemo(() => {
    if (isPatientScope && currentPatientRecord) {
      return [currentPatientRecord];
    }
    return patients;
  }, [isPatientScope, currentPatientRecord, patients]);

  const isolatedAppointments = useMemo(() => {
    if (isPatientScope && currentPatientRecord) {
      return appointments.filter(
        (a) => a.patientId === currentPatientRecord.id || a.patientName === currentPatientRecord.fullName
      );
    }
    return appointments;
  }, [isPatientScope, currentPatientRecord, appointments]);

  const isolatedConsultations = useMemo(() => {
    if (isPatientScope && currentPatientRecord) {
      return consultations.filter(
        (c) => c.patientId === currentPatientRecord.id || c.patientName === currentPatientRecord.fullName
      );
    }
    return consultations;
  }, [isPatientScope, currentPatientRecord, consultations]);

  const isolatedPrescriptions = useMemo(() => {
    if (isPatientScope && currentPatientRecord) {
      return prescriptions.filter(
        (p) => p.patientId === currentPatientRecord.id || p.patientName === currentPatientRecord.fullName
      );
    }
    return prescriptions;
  }, [isPatientScope, currentPatientRecord, prescriptions]);

  const isolatedLabOrders = useMemo(() => {
    if (isPatientScope && currentPatientRecord) {
      return labOrders.filter(
        (l) => l.patientId === currentPatientRecord.id || l.patientName === currentPatientRecord.fullName
      );
    }
    return labOrders;
  }, [isPatientScope, currentPatientRecord, labOrders]);

  const isolatedInvoices = useMemo(() => {
    if (isPatientScope && currentPatientRecord) {
      return invoices.filter(
        (i) => i.patientId === currentPatientRecord.id || i.patientName === currentPatientRecord.fullName
      );
    }
    return invoices;
  }, [isPatientScope, currentPatientRecord, invoices]);

  const visiblePatients = isolatedPatients;
  const myAppointments = isolatedAppointments;

  const selectedPatient = isPatientScope && currentPatientRecord
    ? currentPatientRecord
    : (patients.find((p) => p.id === selectedPatientId) || null);

  const selectPatient = (id: string | null) => {
    if (isPatientScope && currentPatientRecord && id && id !== currentPatientRecord.id) return;
    setSelectedPatientId(id);
  };

  const addPatient = (newPatData: Omit<Patient, 'id' | 'createdAt' | 'mrn'>) => {
    const mrn = `MRN-2026-${String(patients.length + 101).padStart(3, '0')}`;
    const newPatient: Patient = {
      ...newPatData,
      id: `pat-${Date.now()}`,
      mrn,
      createdAt: new Date().toISOString(),
      vitalsHistory: newPatData.vitalsHistory || [],
    };
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    logAction('PATIENT_CREATE', 'Patient', newPatient.id, `Registered patient: ${newPatient.fullName} (${mrn})`);
    syncPatientToSupabase(newPatient);

    syncToBackend('/api/patients', {
      method: 'POST',
      body: JSON.stringify(newPatient),
    }, 'Create patient');

    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    if (primaryRole === 'patient' && linkedPatientId && id !== linkedPatientId) return;

    let updatedPatientRecord: Patient | undefined;
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedPatientRecord = { ...p, ...updates };
          return updatedPatientRecord;
        }
        return p;
      })
    );

    // If this is the current logged-in patient, sync currentUser
    if (primaryRole === 'patient' || currentUser.id === id) {
      setCurrentUser((prev) => ({
        ...prev,
        name: updates.fullName || prev.name,
        email: updates.email || prev.email,
        avatar: updates.avatar !== undefined ? updates.avatar : prev.avatar,
      }));
    }

    logAction('PATIENT_UPDATE', 'Patient', id, `Updated patient information: ${updates.fullName || id}`);

    if (updatedPatientRecord) {
      syncPatientToSupabase(updatedPatientRecord);
    }

    syncToBackend(`/api/patients/${id}`, {
      method: 'PATCH',
      headers: { 'x-linked-patient-id': id },
      body: JSON.stringify(updates),
    }, 'Update patient');
  };

  const addVitals = (patientId: string, vitalsData: Omit<Vitals, 'id' | 'recordedAt'>) => {
    const newVitals: Vitals = {
      ...vitalsData,
      id: `vit-${Date.now()}`,
      recordedAt: new Date().toISOString(),
      recordedBy: currentUser.name,
    };
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, vitalsHistory: [newVitals, ...p.vitalsHistory] } : p))
    );
    logAction('VITALS_RECORDED', 'Patient', patientId, `Vitals recorded: BP ${newVitals.bloodPressureSystolic}/${newVitals.bloodPressureDiastolic}, HR ${newVitals.heartRate}`);
  };

  const saveTriageRecord = (
    patientId: string,
    recordData: Omit<TriageRecord, 'id' | 'timestamp'>
  ): TriageRecord => {
    const newRecord: TriageRecord = {
      ...recordData,
      id: `trg-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    let updatedPatientRecord: Patient | undefined;

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const existingHistory = p.triageHistory || [];
          const updatedHistory = [newRecord, ...existingHistory];
          updatedPatientRecord = { ...p, triageHistory: updatedHistory };
          return updatedPatientRecord;
        }
        return p;
      })
    );

    logAction(
      'AI_TRIAGE_SAVED',
      'Patient',
      patientId,
      `AI Triage Recorded: Score ${newRecord.urgencyScore}/10 (${newRecord.urgencyBand.toUpperCase()}) - Specialty: ${newRecord.suggestedSpecialty}`
    );

    // If yellow or red urgency, trigger clinical notification for staff and provider awareness
    if (newRecord.urgencyBand === 'yellow' || newRecord.urgencyBand === 'red') {
      const isRed = newRecord.urgencyBand === 'red';
      addNotification({
        targetRole: 'provider',
        category: 'triage',
        priority: isRed ? 'urgent' : 'high',
        title: `${isRed ? '🚨 EMERGENCY TRIAGE DETECTED' : '⚠️ HIGH URGENCY TRIAGE'}: ${newRecord.patientName || 'Patient'}`,
        message: `Urgency Score ${newRecord.urgencyScore}/10 (${newRecord.suggestedSpecialty}). ${newRecord.summary.slice(0, 90)}...`,
        content: newRecord.summary,
      });
    }

    // Persist to server API and Supabase
    if (updatedPatientRecord) {
      syncPatientToSupabase(updatedPatientRecord);
      try {
        const token = authToken || localStorage.getItem('smart_clinic_token');
        fetch(`${API_BASE_URL}/api/patients/${patientId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': activeRole,
            'x-linked-patient-id': patientId,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ triageHistory: updatedPatientRecord.triageHistory }),
        }).catch((err) => console.error('Triage API sync error:', err));
      } catch {}
    }

    return newRecord;
  };

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    if (primaryRole === 'patient' && linkedPatientId && aptData.patientId !== linkedPatientId) {
      aptData = { ...aptData, patientId: linkedPatientId };
    }
    const queueChar = aptData.department.startsWith('Cardio') ? 'B' : 'A';
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      queueNumber: `${queueChar}-${100 + appointments.length + 1}`,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newApt, ...prev]);
    logAction('APPOINTMENT_BOOKED', 'Appointment', newApt.id, `Booked appointment for ${newApt.patientName}`);
    syncAppointmentToSupabase(newApt);

    syncToBackend('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(newApt),
    }, 'Create appointment');

    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    const existingApt = appointments.find((a) => a.id === id);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    logAction('APPOINTMENT_STATUS', 'Appointment', id, `Updated status to: ${status}`);

    // If an appointment is approved (status 'Confirmed')
    if (status === 'Confirmed' && existingApt) {
      addNotification({
        userId: existingApt.patientId,
        targetRole: 'patient',
        title: 'Appointment Approved',
        message: 'Your appointment has been approved.',
        content: `Your appointment with ${existingApt.doctorName} on ${existingApt.date} at ${formatTimeSlot(existingApt.time)} (${existingApt.type}) has been approved. Location: ${existingApt.room || 'Outpatient Clinic'}. Queue Number: ${existingApt.queueNumber || 'Standard Queue'}.`,
        category: 'appointment',
        priority: 'normal',
      });
    }

    syncToBackend(`/api/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, 'Update appointment status');

    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      const channel = new BroadcastChannel('smart_clinic_notifications_broadcast');
      channel.postMessage({ type: 'UPDATE_APPOINTMENT_STATUS', id, status });
      channel.close();
    }
  };

  const rescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, date: newDate, time: newTime, status: 'Scheduled' } : a))
    );
    logAction('APPOINTMENT_RESCHEDULE', 'Appointment', id, `Rescheduled to ${newDate} ${newTime}`);

    syncToBackend(`/api/appointments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ date: newDate, time: newTime, status: 'Scheduled' }),
    }, 'Reschedule appointment');
  };

  const addConsultation = (consData: Omit<Consultation, 'id'>) => {
    const newCons: Consultation = { ...consData, id: `con-${Date.now()}` };
    setConsultations((prev) => [newCons, ...prev]);
    if (consData.appointmentId) updateAppointmentStatus(consData.appointmentId, 'Completed');
    logAction('CONSULTATION_SAVED', 'Consultation', newCons.id, `Clinical SOAP consultation recorded for ${newCons.patientName}`);
    syncConsultationToSupabase(newCons);

    syncToBackend('/api/consultations', {
      method: 'POST',
      body: JSON.stringify(newCons),
    }, 'Create consultation');

    return newCons;
  };

  const addPrescription = (rxData: Omit<Prescription, 'id' | 'prescriptionNumber'>) => {
    const newRx: Prescription = {
      ...rxData,
      id: `rx-${Date.now()}`,
      prescriptionNumber: `RX-2026-${String(9000 + prescriptions.length + 1)}`,
    };
    setPrescriptions((prev) => [newRx, ...prev]);
    logAction('PRESCRIPTION_CREATED', 'Prescription', newRx.id, `Created e-Prescription ${newRx.prescriptionNumber} for ${newRx.patientName}`);
    syncPrescriptionToSupabase(newRx);

    syncToBackend('/api/prescriptions', {
      method: 'POST',
      body: JSON.stringify(newRx),
    }, 'Create prescription');

    return newRx;
  };

  // Dispense medication linked with automated stock deduction & audited adjustment
  const dispenseMedication = (prescriptionId: string, itemId: string) => {
    const rx = prescriptions.find((r) => r.id === prescriptionId);
    const item = rx?.items.find((i) => i.id === itemId);

    if (item && !item.dispensed) {
      // Find matching inventory item by name or generic name
      const match = inventory.find(
        (inv) =>
          inv.name.toLowerCase().includes(item.medicationName.toLowerCase()) ||
          item.medicationName.toLowerCase().includes(inv.name.toLowerCase()) ||
          inv.genericName.toLowerCase().includes(item.genericName.toLowerCase())
      );
      if (match) {
        adjustStock(match.id, -item.quantity, `Dispensed for e-Prescription ${rx?.prescriptionNumber}`);
      }
      logAction('DISPENSE_MEDICATION', 'Prescription', rx?.id || prescriptionId, `Dispensed ${item.quantity} units of ${item.medicationName}`);
    }

    let updatedItems: any[] = [];
    let updatedStatus: Prescription['status'] = 'Active';

    setPrescriptions((prev) =>
      prev.map((r) => {
        if (r.id !== prescriptionId) return r;
        const items = r.items.map((it) => (it.id === itemId ? { ...it, dispensed: true } : it));
        const status = items.every((it) => it.dispensed) ? 'Dispensed' : 'Partially Dispensed';
        updatedItems = items;
        updatedStatus = status;
        return {
          ...r,
          items,
          status,
        };
      })
    );

    syncToBackend(`/api/prescriptions/${prescriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ items: updatedItems, status: updatedStatus }),
    }, 'Dispense medication');
  };

  const addLabOrder = (orderData: Omit<LabTestOrder, 'id' | 'orderNumber' | 'requestedAt'>) => {
    const newOrder: LabTestOrder = {
      ...orderData,
      id: `lab-${Date.now()}`,
      orderNumber: `LAB-2026-${String(1000 + labOrders.length + 1)}`,
      requestedAt: new Date().toISOString(),
    };
    setLabOrders((prev) => [newOrder, ...prev]);
    logAction('LAB_ORDER_CREATED', 'Laboratory', newOrder.id, `Ordered ${newOrder.testName} for ${newOrder.patientName}`);
    syncLabOrderToSupabase(newOrder);

    syncToBackend('/api/lab-orders', {
      method: 'POST',
      body: JSON.stringify(newOrder),
    }, 'Create lab order');

    return newOrder;
  };

  const updateLabStatus = (orderId: string, status: LabTestOrder['status']) => {
    const updates: Partial<LabTestOrder> = { status };
    if (status === 'Sample Collected') updates.collectedAt = new Date().toISOString();
    if (status === 'Completed' || status === 'Reviewed') updates.completedAt = new Date().toISOString();

    setLabOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return { ...o, ...updates };
      })
    );
    logAction('LAB_STATUS_UPDATE', 'Laboratory', orderId, `Status updated to: ${status}`);

    try {
      const token = authToken || localStorage.getItem('smart_clinic_token');
      fetch(`${API_BASE_URL}/api/lab-orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeRole,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      }).catch(() => {});
    } catch {}
  };

  const enterLabResults = (orderId: string, results: LabResultItem[], interpretation?: string, aiSummary?: string) => {
    const updates = {
      results,
      interpretation,
      aiSummary,
      status: 'Completed' as const,
      completedAt: new Date().toISOString(),
    };

    setLabOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
    logAction('LAB_RESULTS_ENTERED', 'Laboratory', orderId, `Diagnostic results entered for order`);

    try {
      const token = authToken || localStorage.getItem('smart_clinic_token');
      fetch(`${API_BASE_URL}/api/lab-orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeRole,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      }).catch(() => {});
    } catch {}
  };

  // Audited stock adjustment
  const adjustStock = (itemId: string, quantityChange: number, reason: string) => {
    const item = inventory.find((i) => i.id === itemId);
    setInventory((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, stockQuantity: Math.max(0, it.stockQuantity + quantityChange), lastUpdated: new Date().toISOString() } : it
      )
    );
    logAction('STOCK_ADJUSTMENT', 'Inventory', itemId, `Audited stock adjustment: ${quantityChange > 0 ? '+' : ''}${quantityChange} on ${item?.name || 'Item'} (${reason})`);

    syncToBackend('/api/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantityChange, reason }),
    }, 'Adjust stock');
  };

  const addInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${String(5000 + invoices.length + 1)}`,
    };
    setInvoices((prev) => [newInv, ...prev]);
    logAction('INVOICE_CREATED', 'Billing', newInv.id, `Generated invoice ${newInv.invoiceNumber} for ${newInv.patientName}`);
    syncInvoiceToSupabase(newInv);

    syncToBackend('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(newInv),
    }, 'Create invoice');

    return newInv;
  };

  const payInvoice = (invoiceId: string, amount: number, method: Invoice['paymentMethod']) => {
    let updatedPaidAmount = 0;
    let isFullyPaid = false;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const newPaid = (inv.paidAmount || 0) + amount;
        const isPaid = newPaid >= inv.totalAmount;
        updatedPaidAmount = newPaid;
        isFullyPaid = isPaid;
        return {
          ...inv,
          paidAmount: newPaid,
          paymentMethod: method,
          paymentDate: new Date().toISOString(),
          paidAt: isPaid ? new Date().toISOString() : inv.paidAt,
          status: isPaid ? 'Paid' : 'Partially Paid',
        };
      })
    );
    logAction('PAYMENT_RECORDED', 'Billing', invoiceId, `Payment of ₱${amount} recorded via ${method}`);

    syncToBackend(`/api/invoices/${invoiceId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        paidAmount: updatedPaidAmount,
        paymentMethod: method,
        paymentDate: new Date().toISOString(),
        paidAt: isFullyPaid ? new Date().toISOString() : undefined,
        status: isFullyPaid ? 'Paid' : 'Partially Paid',
      }),
    }, 'Pay invoice');
  };

  // ==============================================================================
  // ROLE-BASED NOTIFICATION FILTERING (Strict Isolation)
  // Patient -> only 'patient'
  // Provider (Doctor, Nurse, Staff) -> only 'provider'
  // Admin -> only 'admin'
  // ==============================================================================
  // STRICT USER-SCOPED NOTIFICATIONS (Zero-Leakage RBAC & Identity Isolation)
  // ==============================================================================
  const roleNotifications = useMemo(() => {
    return notifications
      .filter((n: any) => {
        const notifRecipientId = n.recipientId || n.userId;
        const notifPatientId = n.patientId || (n.relatedResourceType === 'patient' ? n.relatedResourceId : undefined);
        const notifDoctorId = n.doctorId;
        const notifRecipientEmail = (n.recipientEmail || n.email || '').toLowerCase();
        const currentEmail = (currentUser?.email || '').toLowerCase();
        const notifRole = (n.recipientRole || n.targetRole || '').toLowerCase();

        // 1. PATIENT SCOPE:
        // Patient MUST ONLY see notifications related to their specific account/record
        if (activeRole === 'patient' || primaryRole === 'patient') {
          const matchesPatientId = Boolean(linkedPatientId && (notifRecipientId === linkedPatientId || notifPatientId === linkedPatientId));
          const matchesUserId = Boolean(currentUser?.id && (notifRecipientId === currentUser.id || n.userId === currentUser.id));
          const matchesEmail = Boolean(currentEmail && notifRecipientEmail && notifRecipientEmail === currentEmail);

          if (!matchesPatientId && !matchesUserId && !matchesEmail) {
            return false;
          }

          // Disallow any provider or admin internal alerts
          if (notifRole !== 'patient' && notifRole !== 'all' && !matchesPatientId && !matchesUserId) {
            return false;
          }
          return true;
        }

        // 2. DOCTOR SCOPE:
        // Doctor ONLY sees notifications for their own schedule, appointments, or assigned patients
        if (activeRole === 'doctor' || primaryRole === 'doctor') {
          const matchesDoctorId = Boolean(currentUser?.id && (notifDoctorId === currentUser.id || notifRecipientId === currentUser.id));
          const matchesDoctorEmail = Boolean(currentEmail && notifRecipientEmail && notifRecipientEmail === currentEmail);
          return matchesDoctorId || matchesDoctorEmail;
        }

        // 3. ADMIN SCOPE:
        if (activeRole === 'admin' || primaryRole === 'admin') {
          return notifRole === 'admin' || n.category === 'inventory' || n.category === 'security' || n.category === 'system';
        }

        // 4. SPECIFIC STAFF ROLES:
        if (activeRole === 'nurse') {
          return notifRole === 'nurse' || (notifRole === 'provider' && (n.category === 'triage' || n.category === 'appointment'));
        }
        if (activeRole === 'receptionist') {
          return notifRole === 'receptionist' || (notifRole === 'provider' && n.category === 'appointment');
        }
        if (activeRole === 'pharmacist') {
          return notifRole === 'pharmacist' || n.category === 'prescription' || n.category === 'inventory';
        }
        if (activeRole === 'lab_technician') {
          return notifRole === 'lab_technician' || n.category === 'lab';
        }

        return false;
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
        const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
        return timeB - timeA;
      });
  }, [notifications, activeRole, primaryRole, currentUser, linkedPatientId]);

  const unreadNotificationCount = useMemo(() => {
    return roleNotifications.filter((n) => !n.read).length;
  }, [roleNotifications]);

  // Live real-time notification sync with server and cross-tab BroadcastChannel
  useEffect(() => {
    let isMounted = true;

    // Cross-tab broadcast channel with strict recipient verification
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        channel = new BroadcastChannel('smart_clinic_notifications_broadcast');
        channel.onmessage = (event) => {
          if (!isMounted) return;
          if (event.data?.type === 'NEW_NOTIFICATION' && event.data.notification) {
            const incoming: Notification = event.data.notification;
            const myEmail = (currentUser?.email || '').toLowerCase();
            const incEmail = (incoming.recipientEmail || incoming.email || '').toLowerCase();
            const isForMe =
              (incoming.recipientId && (incoming.recipientId === currentUser?.id || incoming.recipientId === linkedPatientId)) ||
              (incoming.patientId && incoming.patientId === linkedPatientId) ||
              (incoming.doctorId && incoming.doctorId === currentUser?.id) ||
              (incEmail && myEmail && incEmail === myEmail) ||
              (activeRole === 'admin' && (incoming.recipientRole === 'admin' || incoming.targetRole === 'admin'));

            if (!isForMe) return;

            setNotifications((prev) => {
              if (prev.some((n) => n.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });
          } else if (event.data?.type === 'UPDATE_APPOINTMENT_STATUS') {
            const { id, status } = event.data;
            setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
          }
        };
      }
    } catch {}

    const fetchLiveNotifications = async () => {
      try {
        const token = authToken || localStorage.getItem('smart_clinic_token');
        const headers: Record<string, string> = {
          'x-user-role': activeRole,
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (currentUser?.id) headers['x-user-id'] = currentUser.id;
        if (currentUser?.email) headers['x-user-email'] = currentUser.email;
        if (linkedPatientId) headers['x-linked-patient-id'] = linkedPatientId;

        const queryParams = new URLSearchParams();
        if (currentUser?.id) queryParams.set('userId', currentUser.id);
        if (linkedPatientId) queryParams.set('patientId', linkedPatientId);
        if (activeRole) queryParams.set('role', activeRole);

        const res = await fetch(`${API_BASE_URL}/api/notifications?${queryParams.toString()}`, { headers });
        if (res.ok) {
          const liveData: Notification[] = await res.json();
          if (isMounted && Array.isArray(liveData)) {
            setNotifications((prev) => {
              const idMap = new Map<string, Notification>();
              prev.forEach((n) => idMap.set(n.id, n));
              liveData.forEach((liveNotif) => {
                if (!idMap.has(liveNotif.id)) {
                  idMap.set(liveNotif.id, liveNotif);
                }
              });
              return Array.from(idMap.values());
            });
          }
        }
      } catch {
        // Fallback silently if offline or during build
      }
    };

    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (channel) channel.close();
    };
  }, [activeRole, authToken, currentUser, linkedPatientId]);

  const addNotification = (notifData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
    const newNotif: Notification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientId: notifData.recipientId || (activeRole === 'patient' ? (linkedPatientId || currentUser?.id) : currentUser?.id),
      recipientRole: notifData.recipientRole || activeRole,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Dispatch via BroadcastChannel for instant cross-tab update
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const channel = new BroadcastChannel('smart_clinic_notifications_broadcast');
        channel.postMessage({ type: 'NEW_NOTIFICATION', notification: newNotif });
        channel.close();
      }
    } catch {}

    // Dispatch to server asynchronously for live persistence
    try {
      const token = authToken || localStorage.getItem('smart_clinic_token');
      fetch(`${API_BASE_URL}/api/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': activeRole,
          'x-user-id': currentUser?.id || '',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(newNotif),
      }).catch(() => {});
    } catch {}

    return newNotif;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      const token = authToken || localStorage.getItem('smart_clinic_token');
      fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'x-user-role': activeRole,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }).catch(() => {});
    } catch {}
  };

  const markAllNotificationsAsRead = () => {
    const roleScope = activeRole === 'patient' ? 'patient' : (activeRole === 'doctor' || activeRole === 'nurse' ? 'provider' : 'admin');
    setNotifications((prev) =>
      prev.map((n) => {
        const isUserScoped = n.recipientId && currentUser?.id ? n.recipientId === currentUser.id : true;
        const target = n.targetRole || n.recipientRole || 'all';
        if (isUserScoped && (target === 'all' || target === roleScope || target === activeRole)) {
          return { ...n, read: true };
        }
        return n;
      })
    );
    try {
      const token = authToken || localStorage.getItem('smart_clinic_token');
      fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: {
          'x-user-role': activeRole,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }).catch(() => {});
    } catch {}
  };

  const [supabaseRefreshKey, setSupabaseRefreshKey] = useState(0);
  const supabaseInfo = useMemo(() => getSupabaseConfigInfo(), [supabaseRefreshKey]);
  const refreshSupabaseConfig = () => setSupabaseRefreshKey((k) => k + 1);

  const syncAllToSupabase = async () => {
    const res = await syncAllClinicDataToSupabase({
      patients,
      appointments,
      consultations,
      prescriptions,
      labOrders,
      inventory,
      invoices,
      auditLogs,
    });
    logAction('SUPABASE_FULL_SYNC', 'System', 'supabase-cloud', res.message);
    return res;
  };

  const addDoctor = async (doctorData: {
    name: string;
    email: string;
    department: string;
    specialty: string;
    licenseNumber: string;
    phone?: string;
    workDays: number[];
    startHour?: number;
    endHour?: number;
    workDaysLabel?: string;
    hoursLabel?: string;
    status?: 'Active' | 'On Leave' | 'Inactive';
    notes?: string;
  }) => {
    const cleanName = doctorData.name.trim();
    const cleanEmail = doctorData.email.trim().toLowerCase();

    if (!cleanName) return { success: false, error: 'Physician name is required.' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Valid professional email is required (e.g. doctor@smartclinic.ph).' };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `An account with email "${cleanEmail}" is already registered in the system.` };
    }

    const cleanLicense = doctorData.licenseNumber?.trim() || `PRC-${Math.floor(1000000 + Math.random() * 9000000)}`;
    if (cleanLicense.length < 3) {
      return { success: false, error: 'A valid PRC License or MD Credential number is required.' };
    }

    const doctorId = `usr-${Date.now()}`;
    const days = doctorData.workDays && doctorData.workDays.length > 0 ? doctorData.workDays : [1, 2, 3, 4, 5];

    // Register dynamic personal schedule
    const schedule = createCustomDoctorSchedule({
      doctorId,
      doctorName: cleanName,
      department: doctorData.department || 'General Medicine',
      specialty: doctorData.specialty || 'General Practice',
      workDays: days,
      workDaysLabel: doctorData.workDaysLabel,
      hoursLabel: doctorData.hoursLabel,
      startHour: doctorData.startHour || 8,
      endHour: doctorData.endHour || 17,
    });

    const newDoctor: User = {
      id: doctorId,
      name: cleanName,
      email: cleanEmail,
      role: 'doctor',
      department: doctorData.department || 'General Medicine',
      specialty: doctorData.specialty || 'Internal & Family Medicine',
      licenseNumber: cleanLicense,
      phone: doctorData.phone?.trim() || undefined,
      workDays: days,
      workDaysLabel: schedule.workDaysLabel,
      hoursLabel: schedule.hoursLabel,
      startHour: doctorData.startHour || 8,
      endHour: doctorData.endHour || 17,
      status: doctorData.status || 'Active',
      notes: doctorData.notes?.trim() || undefined,
      schedule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update state & persist in localStorage immediately
    setUsers((prev) => {
      const updated = [newDoctor, ...prev.filter((u) => u.id !== doctorId)];
      try {
        localStorage.setItem('smart_clinic_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Persist to server database if available
    try {
      await fetch(`${API_BASE_URL}/api/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doctorData, doctorId, licenseNumber: cleanLicense }),
      });
    } catch {}

    // Add audit log and notification
    logAction('DOCTOR_CREDENTIALED', 'Security', doctorId, `New physician registered: ${cleanName} (${newDoctor.specialty}) • PRC ID: ${cleanLicense}`);
    addNotification({
      title: 'New Physician Registered',
      message: `${cleanName} (${newDoctor.specialty}) has been credentialed and added to the medical staff.`,
      targetRole: 'all',
      type: 'system',
    });

    return { success: true, doctor: newDoctor };
  };

  const updateDoctor = async (
    doctorId: string,
    updates: {
      name: string;
      email: string;
      department: string;
      specialty: string;
      licenseNumber: string;
      phone?: string;
      workDays?: number[];
      startHour?: number;
      endHour?: number;
      workDaysLabel?: string;
      hoursLabel?: string;
      status?: 'Active' | 'On Leave' | 'Inactive';
      notes?: string;
    }
  ) => {
    const cleanName = updates.name.trim();
    const cleanEmail = updates.email.trim().toLowerCase();

    if (!cleanName) return { success: false, error: 'Physician name cannot be empty.' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Valid professional email format is required.' };
    }

    if (users.some((u) => u.id !== doctorId && u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `Email address "${cleanEmail}" is already used by another clinician or staff.` };
    }

    const cleanLicense = updates.licenseNumber?.trim();
    if (!cleanLicense) {
      return { success: false, error: 'Doctor license number / PRC ID cannot be empty.' };
    }

    const existingDoctor = users.find((u) => u.id === doctorId);
    if (!existingDoctor) {
      return { success: false, error: 'Physician profile not found in active records.' };
    }

    const days = updates.workDays && updates.workDays.length > 0 ? updates.workDays : existingDoctor.workDays || [1, 2, 3, 4, 5];
    const startH = updates.startHour ?? existingDoctor.startHour ?? 8;
    const endH = updates.endHour ?? existingDoctor.endHour ?? 17;

    const schedule = createCustomDoctorSchedule({
      doctorId,
      doctorName: cleanName,
      department: updates.department || existingDoctor.department || 'General Medicine',
      specialty: updates.specialty || existingDoctor.specialty || 'General Practice',
      workDays: days,
      workDaysLabel: updates.workDaysLabel,
      hoursLabel: updates.hoursLabel,
      startHour: startH,
      endHour: endH,
    });

    const updatedDoctor: User = {
      ...existingDoctor,
      name: cleanName,
      email: cleanEmail,
      department: updates.department || existingDoctor.department,
      specialty: updates.specialty || existingDoctor.specialty,
      licenseNumber: cleanLicense,
      phone: updates.phone?.trim() ?? existingDoctor.phone,
      workDays: days,
      workDaysLabel: schedule.workDaysLabel,
      hoursLabel: schedule.hoursLabel,
      startHour: startH,
      endHour: endH,
      status: updates.status || existingDoctor.status || 'Active',
      notes: updates.notes?.trim() ?? existingDoctor.notes,
      schedule,
      updatedAt: new Date().toISOString(),
    };

    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === doctorId ? updatedDoctor : u));
      try {
        localStorage.setItem('smart_clinic_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAction('DOCTOR_CREDENTIALS_UPDATED', 'Security', doctorId, `Physician record updated: ${cleanName} (${updatedDoctor.specialty})`);
    addNotification({
      title: 'Physician Credentials Updated',
      message: `Profile and clinical credentials updated for ${cleanName}.`,
      targetRole: 'admin',
      type: 'system',
    });

    return { success: true, doctor: updatedDoctor };
  };

  const addClinicalStaff = async (staffData: {
    name: string;
    role: 'nurse' | 'receptionist' | 'lab_technician' | 'pharmacist';
    department: string;
    email: string;
    phone?: string;
    licenseNumber?: string;
    credentials?: string;
    temporaryPassword?: string;
    status?: 'Active' | 'On Leave' | 'Inactive';
    notes?: string;
  }) => {
    const cleanName = staffData.name.trim();
    const cleanEmail = staffData.email.trim().toLowerCase();

    if (!cleanName) return { success: false, error: 'Staff member full name is required.' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Valid clinic email address is required.' };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `An account with email "${cleanEmail}" is already registered.` };
    }

    const validRoles = ['nurse', 'receptionist', 'lab_technician', 'pharmacist'];
    if (!validRoles.includes(staffData.role)) {
      return { success: false, error: 'Please select a valid clinical staff role (Nurse, Receptionist, Lab Technician, or Pharmacist).' };
    }

    const staffId = `usr-staff-${Date.now()}`;
    const newStaff: User = {
      id: staffId,
      name: cleanName,
      email: cleanEmail,
      role: staffData.role,
      subRole: staffData.role,
      department: staffData.department.trim() || 'Clinical Operations',
      phone: staffData.phone?.trim() || undefined,
      licenseNumber: staffData.licenseNumber?.trim() || undefined,
      credentials: staffData.credentials?.trim() || undefined,
      temporaryPassword: staffData.temporaryPassword?.trim() || undefined,
      status: staffData.status || 'Active',
      notes: staffData.notes?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setUsers((prev) => {
      const updated = [newStaff, ...prev.filter((u) => u.id !== staffId)];
      try {
        localStorage.setItem('smart_clinic_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAction('STAFF_ACCOUNT_REGISTERED', 'Security', staffId, `New clinical staff credentialed: ${cleanName} (${staffData.role.toUpperCase()})`);
    addNotification({
      title: 'New Clinical Staff Registered',
      message: `${cleanName} registered as ${staffData.role.replace('_', ' ').toUpperCase()} in ${newStaff.department}.`,
      targetRole: 'admin',
      type: 'system',
    });

    return { success: true, staff: newStaff };
  };

  const updateClinicalStaff = async (
    staffId: string,
    updates: {
      name: string;
      role: 'nurse' | 'receptionist' | 'lab_technician' | 'pharmacist';
      department: string;
      email: string;
      phone?: string;
      licenseNumber?: string;
      credentials?: string;
      temporaryPassword?: string;
      status?: 'Active' | 'On Leave' | 'Inactive';
      notes?: string;
    }
  ) => {
    const cleanName = updates.name.trim();
    const cleanEmail = updates.email.trim().toLowerCase();

    if (!cleanName) return { success: false, error: 'Staff member full name cannot be empty.' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Valid clinic email format is required.' };
    }

    if (users.some((u) => u.id !== staffId && u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: `Email address "${cleanEmail}" is already used by another account.` };
    }

    const validRoles = ['nurse', 'receptionist', 'lab_technician', 'pharmacist'];
    if (!validRoles.includes(updates.role)) {
      return { success: false, error: 'Invalid clinical staff role selected.' };
    }

    const existing = users.find((u) => u.id === staffId);
    if (!existing) {
      return { success: false, error: 'Staff member account not found.' };
    }

    const updatedStaff: User = {
      ...existing,
      name: cleanName,
      email: cleanEmail,
      role: updates.role,
      subRole: updates.role,
      department: updates.department.trim() || existing.department,
      phone: updates.phone?.trim() ?? existing.phone,
      licenseNumber: updates.licenseNumber?.trim() ?? existing.licenseNumber,
      credentials: updates.credentials?.trim() ?? existing.credentials,
      temporaryPassword: updates.temporaryPassword?.trim() ?? existing.temporaryPassword,
      status: updates.status || existing.status || 'Active',
      notes: updates.notes?.trim() ?? existing.notes,
      updatedAt: new Date().toISOString(),
    };

    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === staffId ? updatedStaff : u));
      try {
        localStorage.setItem('smart_clinic_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAction('STAFF_ACCOUNT_UPDATED', 'Security', staffId, `Clinical staff updated: ${cleanName} (${updates.role})`);
    addNotification({
      title: 'Staff Profile Updated',
      message: `Account details updated for ${cleanName}.`,
      targetRole: 'admin',
      type: 'system',
    });

    return { success: true, staff: updatedStaff };
  };

  const deleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, error: 'User account not found.' };
    if (target.role === 'admin' || target.email === 'smartclinicrealacc@gmail.com') {
      return { success: false, error: 'The Executive Admin account cannot be deleted.' };
    }
    if (target.id === currentUser.id) {
      return { success: false, error: 'You cannot delete your own currently active session account.' };
    }

    setUsers((prev) => {
      const updated = prev.filter((u) => u.id !== userId);
      try {
        localStorage.setItem('smart_clinic_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAction('USER_ACCOUNT_REMOVED', 'Security', userId, `Account removed from clinic roster: ${target.name} (${target.role})`);
    addNotification({
      title: 'Account Removed',
      message: `${target.name} has been removed from active staff roster.`,
      targetRole: 'admin',
      type: 'system',
    });

    return { success: true };
  };

  const toggleUserStatus = async (userId: string, newStatus: 'Active' | 'On Leave' | 'Inactive') => {
    const target = users.find((u) => u.id === userId);
    if (!target) return { success: false, error: 'User account not found.' };

    const updatedUser: User = {
      ...target,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    setUsers((prev) => {
      const updated = prev.map((u) => (u.id === userId ? updatedUser : u));
      try {
        localStorage.setItem('smart_clinic_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    logAction('USER_STATUS_CHANGED', 'Security', userId, `Status of ${target.name} changed to ${newStatus}`);
    return { success: true };
  };

  const checkTwoFactorStatus = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/status?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      return { enabled: Boolean(data?.enabled) };
    } catch {
      return { enabled: false };
    }
  };

  const enableTwoFactor = async (email: string, code: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to activate Authenticator 2FA.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Server connection failed.' };
    }
  };

  const disableTwoFactor = async (email: string, code: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to disable Authenticator 2FA.' };
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Server connection failed.' };
    }
  };

  return (
    <ClinicContext.Provider
      value={{
        currentUser,
        activeRole,
        switchRole,
        users,
        primaryRole,
        staffSubRole,
        isAuthenticated,
        authReady,
        authToken,
        login,
        logout,
        addDoctor,
        updateDoctor,
        addClinicalStaff,
        updateClinicalStaff,
        deleteUser,
        toggleUserStatus,
        checkTwoFactorStatus,
        enableTwoFactor,
        disableTwoFactor,
        pendingAction,
        setPendingAction,
        requestPhoneOtp,
        requestEmailOtp,
        verifyServerOtp,
        registerPatient,
        linkedPatientId,
        visiblePatients,
        myAppointments,
        activeTab,
        setActiveTab,
        isNavigating,
        navigatingTargetTitle,
        patients: isolatedPatients,
        allStaffPatients: patients,
        selectedPatientId,
        selectedPatient,
        selectPatient,
        addPatient,
        updatePatient,
        addVitals,
        saveTriageRecord,
        triageDraftForBooking,
        setTriageDraftForBooking,
        isBookAppointmentOpen,
        setIsBookAppointmentOpen,
        openBookAppointmentWithDraft,
        appointments: isolatedAppointments,
        addAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        consultations: isolatedConsultations,
        addConsultation,
        prescriptions: isolatedPrescriptions,
        addPrescription,
        dispenseMedication,
        labOrders: isolatedLabOrders,
        addLabOrder,
        updateLabStatus,
        enterLabResults,
        inventory,
        adjustStock,
        invoices: isolatedInvoices,
        addInvoice,
        payInvoice,
        notifications: roleNotifications,
        allNotifications: notifications,
        unreadNotificationCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs,
        logAction,
        searchQuery,
        setSearchQuery,
        supabaseInfo,
        syncAllToSupabase,
        refreshSupabaseConfig,
        syncClinicFromBackend,
        language,
        setLanguage,
        t,
        showSessionWarning,
        sessionSecondsRemaining,
        sessionTimeoutTotal,
        resetSessionTimer,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within ClinicProvider');
  return context;
};
