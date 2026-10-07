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
  isSupabaseConfigured
} from '../lib/supabase';

interface ClinicContextType {
  // Authentication & Role
  currentUser: User;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  users: User[];

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isNavigating: boolean;
  navigatingTargetTitle: string;

  // Patients
  patients: Patient[];
  selectedPatientId: string | null;
  selectedPatient: Patient | null;
  selectPatient: (id: string | null) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'mrn'>) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  addVitals: (patientId: string, vitals: Omit<Vitals, 'id' | 'recordedAt'>) => void;

  // Appointments & Queue
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => void;

  // Consultations
  consultations: Consultation[];
  addConsultation: (consultation: Omit<Consultation, 'id'>) => Consultation;

  // Prescriptions
  prescriptions: Prescription[];
  addPrescription: (prescription: Omit<Prescription, 'id' | 'prescriptionNumber'>) => Prescription;
  dispenseMedication: (prescriptionId: string, itemId: string) => void;

  // Laboratory
  labOrders: LabTestOrder[];
  addLabOrder: (order: Omit<LabTestOrder, 'id' | 'orderNumber' | 'requestedAt'>) => LabTestOrder;
  updateLabStatus: (orderId: string, status: LabTestOrder['status']) => void;
  enterLabResults: (orderId: string, results: LabResultItem[], interpretation?: string, aiSummary?: string) => void;

  // Inventory & Pharmacy
  inventory: InventoryItem[];
  adjustStock: (itemId: string, quantityChange: number, reason: string) => void;

  // Billing
  invoices: Invoice[];
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  payInvoice: (invoiceId: string, amount: number, method: Invoice['paymentMethod']) => void;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, resourceType: AuditLog['resourceType'], resourceId: string, description: string) => void;

  // Global Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Supabase Backend Sync Status & Trigger
  supabaseInfo: { isConfigured: boolean; url: string; domain: string; hasKey: boolean };
  syncAllToSupabase: () => Promise<{ success: boolean; syncedCounts: Record<string, number>; message: string }>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [activeRole, setActiveRole] = useState<UserRole>('doctor');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [activeTab, setActiveTabState] = useState<string>('dashboard');
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingTargetTitle, setNavigatingTargetTitle] = useState('Clinic Dashboard');

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

    // Calculate dynamic duration based on browser Network Information API
    const nav = typeof navigator !== 'undefined' ? (navigator as any) : null;
    const conn = nav?.connection || nav?.mozConnection || nav?.webkitConnection;
    let transitionTime = 380; // Fast 4G / broadband default
    if (conn) {
      if (
        conn.effectiveType === 'slow-2g' ||
        conn.effectiveType === '2g' ||
        (typeof conn.downlink === 'number' && conn.downlink < 1.5) ||
        (typeof conn.rtt === 'number' && conn.rtt > 300)
      ) {
        transitionTime = 1350;
      } else if (
        conn.effectiveType === '3g' ||
        (typeof conn.downlink === 'number' && conn.downlink < 5) ||
        (typeof conn.rtt === 'number' && conn.rtt > 150)
      ) {
        transitionTime = 700;
      }
    }

    setTimeout(() => {
      setActiveTabState(tab);
      setTimeout(() => {
        setIsNavigating(false);
      }, 180);
    }, transitionTime);
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

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('aura_patients', JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem('aura_appointments', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem('aura_consultations', JSON.stringify(consultations));
  }, [consultations]);
  useEffect(() => {
    localStorage.setItem('aura_prescriptions', JSON.stringify(prescriptions));
  }, [prescriptions]);
  useEffect(() => {
    localStorage.setItem('aura_lab_orders', JSON.stringify(labOrders));
  }, [labOrders]);
  useEffect(() => {
    localStorage.setItem('aura_inventory', JSON.stringify(inventory));
  }, [inventory]);
  useEffect(() => {
    localStorage.setItem('aura_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('aura_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('aura_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Switch role helper
  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    const matched = users.find((u) => u.role === role) || users[0];
    setCurrentUser(matched);

    // If patient role, select patient 1
    if (role === 'patient') {
      setSelectedPatientId('pat-1');
    }

    logAction('ROLE_SWITCH', 'Security', matched.id, `User switched perspective to role: ${role}`);
  };

  const logAction = (
    action: string,
    resourceType: AuditLog['resourceType'],
    resourceId: string,
    description: string
  ) => {
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

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  const selectPatient = (id: string | null) => {
    setSelectedPatientId(id);
    if (id) {
      const p = patients.find((x) => x.id === id);
      if (p) {
        logAction('PATIENT_VIEW', 'Patient', p.id, `Accessed medical profile for ${p.fullName} (${p.mrn})`);
      }
    }
  };

  // Add Patient
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

    logAction('PATIENT_CREATE', 'Patient', newPatient.id, `Registered new patient record: ${newPatient.fullName} (${mrn})`);
    syncPatientToSupabase(newPatient);

    // Notify staff
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'New Patient Registered',
      message: `${newPatient.fullName} registered with MRN ${mrn}.`,
      category: 'system',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return newPatient;
  };

  // Update Patient
  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    logAction('PATIENT_UPDATE', 'Patient', id, `Updated demographic/clinical record fields.`);
  };

  // Add Vitals
  const addVitals = (patientId: string, vitalsData: Omit<Vitals, 'id' | 'recordedAt'>) => {
    const newVitals: Vitals = {
      ...vitalsData,
      id: `vit-${Date.now()}`,
      recordedAt: new Date().toISOString(),
      recordedBy: currentUser.name,
    };

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          return {
            ...p,
            vitalsHistory: [newVitals, ...p.vitalsHistory],
          };
        }
        return p;
      })
    );

    logAction('VITALS_RECORDED', 'Patient', patientId, `Logged vital signs: BP ${newVitals.bloodPressureSystolic}/${newVitals.bloodPressureDiastolic}, HR ${newVitals.heartRate}, SpO2 ${newVitals.oxygenSaturation}%.`);
  };

  // Appointments
  const addAppointment = (aptData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const queueChar = aptData.department.startsWith('Cardio') ? 'B' : 'A';
    const queueNum = `${queueChar}-${100 + appointments.length + 1}`;
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      queueNumber: queueNum,
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newApt, ...prev]);

    logAction('APPOINTMENT_BOOKED', 'Appointment', newApt.id, `Booked ${newApt.type} appointment for ${newApt.patientName} on ${newApt.date} at ${newApt.time}.`);
    syncAppointmentToSupabase(newApt);

    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    logAction('APPOINTMENT_STATUS_CHANGE', 'Appointment', id, `Updated status to: ${status}.`);
  };

  const rescheduleAppointment = (id: string, newDate: string, newTime: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, date: newDate, time: newTime, status: 'Scheduled' } : a))
    );
    logAction('APPOINTMENT_RESCHEDULED', 'Appointment', id, `Rescheduled to ${newDate} at ${newTime}.`);
  };

  // Consultations
  const addConsultation = (consData: Omit<Consultation, 'id'>) => {
    const newCons: Consultation = {
      ...consData,
      id: `con-${Date.now()}`,
    };
    setConsultations((prev) => [newCons, ...prev]);

    // If attached to an appointment, mark as Completed
    if (consData.appointmentId) {
      updateAppointmentStatus(consData.appointmentId, 'Completed');
    }

    logAction('CONSULTATION_COMPLETE', 'Consultation', newCons.id, `Completed consultation for ${newCons.patientName} with diagnoses: ${newCons.diagnoses.map((d) => d.code).join(', ')}.`);
    syncConsultationToSupabase(newCons);

    return newCons;
  };

  // Prescriptions
  const addPrescription = (rxData: Omit<Prescription, 'id' | 'prescriptionNumber'>) => {
    const rxNumber = `RX-2026-${String(900 + prescriptions.length + 1)}`;
    const newRx: Prescription = {
      ...rxData,
      id: `rx-${Date.now()}`,
      prescriptionNumber: rxNumber,
    };
    setPrescriptions((prev) => [newRx, ...prev]);

    logAction('PRESCRIPTION_CREATED', 'Prescription', newRx.id, `Issued digital prescription ${rxNumber} with ${newRx.items.length} items for ${newRx.patientName}.`);
    syncPrescriptionToSupabase(newRx);

    // Notify pharmacy
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'New Prescription Issued',
      message: `${rxNumber} for ${newRx.patientName} sent to clinic dispensary.`,
      category: 'prescription',
      priority: 'normal',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);

    return newRx;
  };

  const dispenseMedication = (prescriptionId: string, itemId: string) => {
    let dispensedMedName = '';
    let quantityToDeduct = 0;

    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === prescriptionId) {
          const updatedItems = rx.items.map((it) => {
            if (it.id === itemId) {
              dispensedMedName = it.medicationName;
              quantityToDeduct = it.quantity;
              return { ...it, dispensed: true };
            }
            return it;
          });
          const allDispensed = updatedItems.every((it) => it.dispensed);
          return {
            ...rx,
            items: updatedItems,
            status: allDispensed ? 'Dispensed' : 'Partially Dispensed',
          };
        }
        return rx;
      })
    );

    // Deduct from inventory if matching item found
    if (dispensedMedName) {
      setInventory((prev) =>
        prev.map((inv) => {
          if (
            inv.name.toLowerCase().includes(dispensedMedName.toLowerCase().slice(0, 5)) ||
            dispensedMedName.toLowerCase().includes(inv.genericName.toLowerCase().slice(0, 5))
          ) {
            const newQty = Math.max(0, inv.stockQuantity - quantityToDeduct);
            return { ...inv, stockQuantity: newQty, lastUpdated: new Date().toISOString() };
          }
          return inv;
        })
      );
    }

    logAction('MEDICATION_DISPENSED', 'Prescription', prescriptionId, `Dispensed ${dispensedMedName} (Qty: ${quantityToDeduct}) by ${currentUser.name}.`);
  };

  // Laboratory
  const addLabOrder = (orderData: Omit<LabTestOrder, 'id' | 'orderNumber' | 'requestedAt'>) => {
    const orderNum = `LAB-2026-${String(1040 + labOrders.length + 1)}`;
    const newOrder: LabTestOrder = {
      ...orderData,
      id: `lab-${Date.now()}`,
      orderNumber: orderNum,
      requestedAt: new Date().toISOString(),
    };
    setLabOrders((prev) => [newOrder, ...prev]);

    logAction('LAB_ORDER_CREATED', 'Laboratory', newOrder.id, `Created laboratory test request: ${newOrder.testName} (${newOrder.urgency}) for ${newOrder.patientName}.`);
    syncLabOrderToSupabase(newOrder);

    return newOrder;
  };

  const updateLabStatus = (orderId: string, status: LabTestOrder['status']) => {
    setLabOrders((prev) =>
      prev.map((l) => {
        if (l.id === orderId) {
          const updates: Partial<LabTestOrder> = { status };
          if (status === 'Sample Collected') updates.collectedAt = new Date().toISOString();
          if (status === 'Result Available') updates.completedAt = new Date().toISOString();
          return { ...l, ...updates };
        }
        return l;
      })
    );
    logAction('LAB_STATUS_UPDATED', 'Laboratory', orderId, `Lab status changed to: ${status}.`);
  };

  const enterLabResults = (
    orderId: string,
    results: LabResultItem[],
    interpretation?: string,
    aiSummary?: string
  ) => {
    setLabOrders((prev) =>
      prev.map((l) => {
        if (l.id === orderId) {
          return {
            ...l,
            results,
            interpretation,
            aiSummary,
            status: 'Result Available',
            completedAt: new Date().toISOString(),
          };
        }
        return l;
      })
    );

    const order = labOrders.find((l) => l.id === orderId);
    logAction('LAB_RESULTS_ENTERED', 'Laboratory', orderId, `Entered certified results for order ${order?.orderNumber || orderId}.`);

    // Notify doctor
    const notif: Notification = {
      id: `notif-${Date.now()}`,
      title: 'Lab Results Ready',
      message: `Results for ${order?.patientName || 'Patient'} (${order?.testName}) are now available for review.`,
      category: 'lab',
      priority: 'high',
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Inventory
  const adjustStock = (itemId: string, quantityChange: number, reason: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(0, item.stockQuantity + quantityChange);
          return {
            ...item,
            stockQuantity: newQty,
            lastUpdated: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    const item = inventory.find((i) => i.id === itemId);
    logAction('INVENTORY_ADJUSTED', 'Inventory', itemId, `Adjusted stock for ${item?.name} by ${quantityChange > 0 ? `+${quantityChange}` : quantityChange} units. Reason: ${reason}.`);
  };

  // Billing
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber'>) => {
    const invNum = `INV-2026-${String(700 + invoices.length + 1)}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNum,
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    logAction('INVOICE_GENERATED', 'Billing', newInvoice.id, `Generated invoice ${invNum} for ${newInvoice.patientName} totaling $${newInvoice.totalAmount.toFixed(2)}.`);
    syncInvoiceToSupabase(newInvoice);

    return newInvoice;
  };

  const payInvoice = (invoiceId: string, amount: number, method: Invoice['paymentMethod']) => {
    let updatedInv: Invoice | null = null;
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const totalPaid = inv.paidAmount + amount;
          const status = totalPaid >= inv.totalAmount ? 'Paid' : 'Partially Paid';
          updatedInv = {
            ...inv,
            paidAmount: totalPaid,
            status,
            paymentMethod: method,
            paymentDate: new Date().toISOString(),
          };
          return updatedInv;
        }
        return inv;
      })
    );

    logAction('PAYMENT_RECEIVED', 'Billing', invoiceId, `Recorded payment of $${amount.toFixed(2)} via ${method}.`);
    if (updatedInv) syncInvoiceToSupabase(updatedInv);
  };

  // Batch sync all data to Supabase
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
    logAction(
      'SUPABASE_FULL_SYNC',
      'System',
      'supabase-cloud',
      `Manual full synchronization to Supabase executed. Result: ${res.message}`
    );
    return res;
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const supabaseInfo = getSupabaseConfigInfo();

  return (
    <ClinicContext.Provider
      value={{
        currentUser,
        activeRole,
        switchRole,
        users,
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
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};
