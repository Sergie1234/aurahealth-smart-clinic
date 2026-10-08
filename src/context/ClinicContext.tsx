import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  User,
  UserRole,
  Appointment,
  AppointmentStatus,
  Consultation,
  Prescription,
  LabTestOrder,
  LabResultItem,
  InventoryItem,
  Invoice,
  Notification,
  AuditLog,
  Vitals,
} from '../types/clinic';
import {
  INITIAL_PATIENTS,
  INITIAL_USERS,
  INITIAL_APPOINTMENTS,
  INITIAL_CONSULTATIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import {
  syncPatientToSupabase,
  syncAppointmentToSupabase,
  syncConsultationToSupabase,
  syncPrescriptionToSupabase,
  syncLabOrderToSupabase,
  syncInventoryItemToSupabase,
  syncInvoiceToSupabase,
  syncAuditLogToSupabase,
  syncAllClinicDataToSupabase,
  getSupabaseConfigInfo,
} from '../lib/supabase';

export type PrimaryAuthRole = 'patient' | 'staff' | 'doctor' | 'admin';
export type StaffSubRole = 'nurse' | 'pharmacist' | 'receptionist' | 'lab_technician';

export interface LoginCredentials {
  primaryRole: PrimaryAuthRole;
  email: string;
  password?: string;
  subRole?: StaffSubRole;
  twoFactorCode?: string;
}

interface ClinicContextType {
  currentUser: User;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  users: User[];
  primaryRole: PrimaryAuthRole | null;
  staffSubRole: StaffSubRole | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => { success: boolean; error?: string };
  logout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNavigating: boolean;
  navigatingTargetTitle: string;
  patients: Patient[];
  selectedPatientId: string | null;
  selectedPatient: Patient | null;
  selectPatient: (id: string | null) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'mrn'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addVitals: (patientId: string, vitals: Omit<Vitals, 'id' | 'recordedAt'>) => void;
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
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  auditLogs: AuditLog[];
  logAction: (action: string, resourceType: AuditLog['resourceType'], resourceId: string, description: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  supabaseInfo: { isConfigured: boolean; url: string; domain: string; hasKey: boolean };
  syncAllToSupabase: () => Promise<{ success: boolean; syncedCounts: Record<string, number>; message: string }>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [activeRole, setActiveRole] = useState<UserRole>('doctor');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [primaryRole, setPrimaryRole] = useState<PrimaryAuthRole | null>(null);
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const ADMIN_EMAIL = 'smartclinicrealacc@gmail.com';
  const ADMIN_PASSWORD = 'SmartClinic@Admin2026';

  const [activeTab, setActiveTabState] = useState<string>('home');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingTargetTitle, setNavigatingTargetTitle] = useState('Smart Clinic Homepage');

  const TAB_TITLES: Record<string, string> = {
    home: 'Smart Clinic Homepage',
    login: 'Secure Healthcare Authentication',
    dashboard: 'Clinic Dashboard',
    patients: 'Patient Directory',
    appointments: 'Appointment Calendar',
    queue: 'Live Queue & Triage',
    consultations: 'Consultation Workspace',
    emr: 'Medical Records (EMR)',
    prescriptions: 'Pharmacy & e-Prescriptions',
    laboratory: 'Diagnostic Laboratory',
    inventory: 'Medication Stock & Inventory',
    billing: 'Billing & Revenue',
    reports: 'Reports & Analytics',
    'predictive-analytics': 'Predictive Analytics & Risk Stratification',
    'ai-assistant': 'Smart Clinic AI Assistant',
    'audit-logs': 'Audit Logs & Compliance',
  };

  const setActiveTab = (tab: string) => {
    if (tab === activeTab) return;
    const title = TAB_TITLES[tab] || 'Clinic Workspace';
    setNavigatingTargetTitle(title);
    setIsNavigating(true);
    setTimeout(() => {
      setActiveTabState(tab);
      setTimeout(() => setIsNavigating(false), 180);
    }, 380);
  };

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('aura_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('pat-1');
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('aura_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });
  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const saved = localStorage.getItem('aura_consultations');
    return saved ? JSON.parse(saved) : INITIAL_CONSULTATIONS;
  });
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('aura_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });
  const [labOrders, setLabOrders] = useState<LabTestOrder[]>(() => {
    const saved = localStorage.getItem('aura_lab_orders');
    return saved ? JSON.parse(saved) : INITIAL_LAB_ORDERS;
  });
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('aura_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('aura_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('aura_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('aura_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => { localStorage.setItem('aura_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('aura_appointments', JSON.stringify(appointments)); }, [appointments]);
  useEffect(() => { localStorage.setItem('aura_consultations', JSON.stringify(consultations)); }, [consultations]);
  useEffect(() => { localStorage.setItem('aura_prescriptions', JSON.stringify(prescriptions)); }, [prescriptions]);
  useEffect(() => { localStorage.setItem('aura_lab_orders', JSON.stringify(labOrders)); }, [labOrders]);
  useEffect(() => { localStorage.setItem('aura_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('aura_invoices', JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem('aura_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('aura_audit_logs', JSON.stringify(auditLogs)); }, [auditLogs]);

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
      ipAddress: '192.168.1.104',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    syncAuditLogToSupabase(newLog);
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    const matched = users.find((u) => u.role === role) || users[0];
    setCurrentUser(matched);
    if (role === 'patient') setSelectedPatientId('pat-1');
    logAction('ROLE_SWITCH', 'Security', matched.id, `User switched perspective to role: ${role}`);
  };

  const login = (credentials: LoginCredentials) => {
    const { primaryRole: role, subRole } = credentials;

    if (role === 'patient') {
      const patientUser = users.find((u) => u.role === 'patient') || users[users.length - 1];
      setCurrentUser(patientUser);
      setActiveRole('patient');
      setPrimaryRole('patient');
      setStaffSubRole(null);
      setIsAuthenticated(true);
      setSelectedPatientId('pat-1');
      setActiveTab('dashboard');
      logAction('AUTH_LOGIN', 'Security', patientUser.id, 'Patient authenticated.');
      return { success: true };
    }

    if (role === 'doctor') {
      const doctorUser = users.find((u) => u.role === 'doctor') || users[0];
      setCurrentUser(doctorUser);
      setActiveRole('doctor');
      setPrimaryRole('doctor');
      setStaffSubRole(null);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      logAction('AUTH_LOGIN', 'Security', doctorUser.id, 'Doctor authenticated.');
      return { success: true };
    }

    if (role === 'staff') {
      if (!subRole || !['nurse', 'pharmacist', 'receptionist', 'lab_technician'].includes(subRole)) {
        return { success: false, error: 'Mandatory sub-role required.' };
      }
      const staffUser = users.find((u) => u.role === subRole) || {
        id: `usr-${subRole}`,
        name: `${subRole.replace('_', ' ').toUpperCase()} Practitioner`,
        email: `${subRole}@smartclinic.ph`,
        role: subRole as UserRole,
      };
      setCurrentUser(staffUser);
      setActiveRole(subRole as UserRole);
      setPrimaryRole('staff');
      setStaffSubRole(subRole);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      logAction('AUTH_LOGIN', 'Security', staffUser.id, `Staff logged in: ${subRole}`);
      return { success: true };
    }

    if (role === 'admin') {
      const emailNorm = (credentials.email || '').trim().toLowerCase();
      const pass = credentials.password || '';
      if (emailNorm !== ADMIN_EMAIL) {
        return { success: false, error: 'Admin access restricted to smartclinicrealacc@gmail.com' };
      }
      if (pass !== ADMIN_PASSWORD) {
        return { success: false, error: 'Incorrect admin password.' };
      }
      const adminUser = users.find((u) => u.role === 'admin') || {
        id: 'usr-7',
        name: 'System Administrator',
        email: ADMIN_EMAIL,
        role: 'admin' as UserRole,
      };
      setCurrentUser({ ...adminUser, email: ADMIN_EMAIL });
      setActiveRole('admin');
      setPrimaryRole('admin');
      setStaffSubRole(null);
      setIsAuthenticated(true);
      setActiveTab('dashboard');
      logAction('AUTH_LOGIN', 'Security', adminUser.id, 'Admin authenticated.');
      return { success: true };
    }

    return { success: false, error: 'Unknown role specified.' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPrimaryRole(null);
    setStaffSubRole(null);
    setActiveRole('patient');
    setActiveTab('login');
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  const selectPatient = (id: string | null) => {
    setSelectedPatientId(id);
  };

  const addPatient = (newPatData: Omit<Patient, 'id' | 'createdAt' | 'mrn'>) => {
    const patNum = patients.length + 101;
    const mrn = `MRN-2026-${String(patNum).padStart(3, '0')}`;
    const newPatient: Patient = {
      ...newPatData,
      id: `pat-${Date.now()}`,
      mrn,
      createdAt: new Date().toISOString(),
      vitalsHistory: newPatData.vitalsHistory || [],
    };
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    logAction('PATIENT_CREATE', 'Patient', newPatient.id, `Registered ${newPatient.fullName}`);
    syncPatientToSupabase(newPatient);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addVitals = (patientId: string, vitalsData: Omit<Vitals, 'id' | 'recordedAt'>) => {
    const newVitals: Vitals = { ...vitalsData, id: `vit-${Date.now()}`, recordedAt: new Date().toISOString(), recordedBy: currentUser.name };
    setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, vitalsHistory: [newVitals, ...p.vitalsHistory] } : p)));
  };

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const queueChar = aptData.department.startsWith('Cardio') ? 'B' : 'A';
    const queueNum = `${queueChar}-${100 + appointments.length + 1}`;
    const newApt: Appointment = { ...aptData, id: `apt-${Date.now()}`, queueNumber: queueNum, createdAt: new Date().toISOString() };
    setAppointments((prev) => [newApt, ...prev]);
    logAction('APPOINTMENT_BOOKED', 'Appointment', newApt.id, `Booked for ${newApt.patientName}`);
    syncAppointmentToSupabase(newApt);
    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const rescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, date: newDate, time: newTime, status: 'Scheduled' } : a)));
  };

  const addConsultation = (consData: Omit<Consultation, 'id'>) => {
    const newCons: Consultation = { ...consData, id: `con-${Date.now()}` };
    setConsultations((prev) => [newCons, ...prev]);
    if (consData.appointmentId) updateAppointmentStatus(consData.appointmentId, 'Completed');
    syncConsultationToSupabase(newCons);
    return newCons;
  };

  const addPrescription = (rxData: Omit<Prescription, 'id' | 'prescriptionNumber'>) => {
    const prescriptionNumber = `RX-2026-${String(9000 + prescriptions.length + 1)}`;
    const newRx: Prescription = { ...rxData, id: `rx-${Date.now()}`, prescriptionNumber };
    setPrescriptions((prev) => [newRx, ...prev]);
    syncPrescriptionToSupabase(newRx);
    return newRx;
  };

  const dispenseMedication = (prescriptionId: string, itemId: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id !== prescriptionId) return rx;
        const items = rx.items.map((it) => (it.id === itemId ? { ...it, dispensed: true } : it));
        const allDone = items.every((it) => it.dispensed);
        return { ...rx, items, status: allDone ? 'Dispensed' : 'Partially Dispensed' };
      })
    );
  };

  const addLabOrder = (orderData: Omit<LabTestOrder, 'id' | 'orderNumber' | 'requestedAt'>) => {
    const orderNumber = `LAB-2026-${String(1000 + labOrders.length + 1)}`;
    const newOrder: LabTestOrder = { ...orderData, id: `lab-${Date.now()}`, orderNumber, requestedAt: new Date().toISOString() };
    setLabOrders((prev) => [newOrder, ...prev]);
    syncLabOrderToSupabase(newOrder);
    return newOrder;
  };

  const updateLabStatus = (orderId: string, status: LabTestOrder['status']) => {
    setLabOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const enterLabResults = (orderId: string, results: LabResultItem[], interpretation?: string, aiSummary?: string) => {
    setLabOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, results, interpretation, aiSummary, status: 'Completed', completedAt: new Date().toISOString() }
          : o
      )
    );
  };

  const adjustStock = (itemId: string, quantityChange: number, reason: string) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + quantityChange) } : item))
    );
  };

  const addInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const invoiceNumber = `INV-2026-${String(5000 + invoices.length + 1)}`;
    const newInv: Invoice = { ...invData, id: `inv-${Date.now()}`, invoiceNumber };
    setInvoices((prev) => [newInv, ...prev]);
    syncInvoiceToSupabase(newInv);
    return newInv;
  };

  const payInvoice = (invoiceId: string, amount: number, method: Invoice['paymentMethod']) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              amountPaid: (inv.amountPaid || 0) + amount,
              paymentMethod: method,
              status: (inv.amountPaid || 0) + amount >= inv.total ? 'Paid' : 'Partial',
            }
          : inv
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const supabaseInfo = getSupabaseConfigInfo();

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
        login,
        logout,
        activeTab,
        setActiveTab,
        isNavigating,
        navigatingTargetTitle,
        patients,
        selectedPatientId,
        selectedPatient,
        selectPatient,
        addPatient,
        updatePatient,
        addVitals,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        rescheduleAppointment,
        consultations,
        addConsultation,
        prescriptions,
        addPrescription,
        dispenseMedication,
        labOrders,
        addLabOrder,
        updateLabStatus,
        enterLabResults,
        inventory,
        adjustStock,
        invoices,
        addInvoice,
        payInvoice,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs,
        logAction,
        searchQuery,
        setSearchQuery,
        supabaseInfo,
        syncAllToSupabase,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) throw new Error('useClinic must be used within a ClinicProvider');
  return context;
};
