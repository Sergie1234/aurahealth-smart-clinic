/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, ToastViewport } from './context/ToastContext';
import { PrintProvider, usePrint } from './context/PrintContext';
import { GlobalPrintModal } from './components/common/GlobalPrintModal';
import { GlobalSystemControls } from './components/common/GlobalSystemControls';
import { SessionWarningModal } from './components/common/SessionWarningModal';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SmartClinicLogo } from './components/common/SmartClinicLogo';

import { PatientList } from './components/patients/PatientList';
import { PatientDetailModal } from './components/patients/PatientDetailModal';
import { NewPatientModal } from './components/patients/NewPatientModal';
import { PatientQRModal } from './components/patients/PatientQRModal';
import { AppointmentCalendar } from './components/appointments/AppointmentCalendar';
import { BookAppointmentModal } from './components/appointments/BookAppointmentModal';
import { QueueManager } from './components/appointments/QueueManager';
import { ConsultationWorkspace } from './components/consultations/ConsultationWorkspace';
import { PrescriptionList } from './components/prescriptions/PrescriptionList';
import { NewPrescriptionModal } from './components/prescriptions/NewPrescriptionModal';
import { LabOrdersList } from './components/laboratory/LabOrdersList';
import { EnterLabResultsModal } from './components/laboratory/EnterLabResultsModal';
import { InventoryList } from './components/pharmacy/InventoryList';
import { BillingList } from './components/billing/BillingList';
import { ReportsAnalytics } from './components/reports/ReportsAnalytics';
import { PredictiveAnalyticsDashboard } from './components/analytics/PredictiveAnalyticsDashboard';
import { AIAssistantHub } from './components/ai/AIAssistantHub';
import { AuditLogsView } from './components/audit/AuditLogsView';
import { SupabaseModal } from './components/common/SupabaseModal';
import { NetworkAwarePageTransition } from './components/common/NetworkAwarePageTransition';
import { HomePage } from './components/home/HomePage';
import { LoginPage } from './components/auth/LoginPage';
import { PatientDashboardView } from './components/dashboards/PatientDashboardView';
import { StaffDashboardView } from './components/dashboards/StaffDashboardView';
import { DoctorDashboardView } from './components/dashboards/DoctorDashboardView';
import { AdminDashboardView } from './components/dashboards/AdminDashboardView';
import { NotificationsPage } from './components/notifications/NotificationsPage';
import { ScanHealthIdModal } from './components/patients/ScanHealthIdModal';
import { ScanHealthIdPage } from './components/patients/ScanHealthIdPage';
import { PatientProfileSettingsModal } from './components/patient_portal/PatientProfileSettingsModal';
import { canUserScanQR } from './utils/qrPermissions';
import type { Patient, Prescription, LabTestOrder } from './types/clinic';

const ClinicAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    primaryRole,
    staffSubRole,
    patients,
    linkedPatientId,
    selectPatient,
    isNavigating,
    navigatingTargetTitle,
    isAuthenticated,
    authReady,
    pendingAction,
    setPendingAction,
    isBookAppointmentOpen,
    setIsBookAppointmentOpen,
  } = useClinic();
  const { printPrescription, printLabReport, printReceipt } = usePrint();

  const [pendingBook, setPendingBook] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showBookAppointment, setShowBookAppointment] = useState(false);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showScanQRModal, setShowScanQRModal] = useState(false);
  const [scanQRMode, setScanQRMode] = useState<'checkin' | 'emergency'>('checkin');
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [qrPatient, setQrPatient] = useState<Patient | null>(null);
  const [labOrderForResults, setLabOrderForResults] = useState<LabTestOrder | null>(null);
  const [consultPatientId, setConsultPatientId] = useState<string | undefined>(undefined);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const openBookAppointment = () => {
    if (!isAuthenticated) {
      setPendingBook(true);
      setPendingAction('book');
      setActiveTab('login');
      return;
    }
    if (primaryRole && primaryRole !== 'patient') {
      setActiveTab('dashboard');
      return;
    }
    setShowBookAppointment(true);
  };

  // 'Book Now' Auth-Gate auto-redirect to booking modal upon successful login
  useEffect(() => {
    if (isAuthenticated && (pendingBook || pendingAction === 'book')) {
      if (!primaryRole || primaryRole === 'patient') {
        setShowBookAppointment(true);
      } else {
        setActiveTab('dashboard');
      }
      setPendingBook(false);
      setPendingAction(null);
    }
  }, [isAuthenticated, pendingBook, pendingAction, primaryRole, setPendingAction, setActiveTab]);

  // 'View Live Queue' Auth-Gate auto-redirect to queue upon successful login
  useEffect(() => {
    if (isAuthenticated && pendingAction === 'queue') {
      setActiveTab('queue');
      setPendingAction(null);
    }
  }, [isAuthenticated, pendingAction, setPendingAction, setActiveTab]);

  // Live Queue Gate: Require authentication to access Live Queue
  useEffect(() => {
    if (!isAuthenticated && activeTab === 'queue') {
      setPendingAction('queue');
      setActiveTab('login');
    }
  }, [activeTab, isAuthenticated, setPendingAction, setActiveTab]);

  // Strict Role Route & Tab Isolation Guard (Enforce RA 10173 and strip unauthorized modules)
  useEffect(() => {
    if (!isAuthenticated) return;
    const isPatient = activeRole === 'patient';
    const isAdmin = activeRole === 'admin';

    if (isPatient) {
      // Patient is strictly whitelisted to patient-authorized modules only
      const authorizedPatientTabs = [
        'home',
        'dashboard',
        'appointments',
        'queue',
        'emr',
        'prescriptions',
        'laboratory',
        'billing',
        'ai-assistant',
        'notifications',
      ];
      if (!authorizedPatientTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else if (isAdmin) {
      // Admin is strictly whitelisted to executive administrative modules only (No QR scanner access)
      const authorizedAdminTabs = [
        'home',
        'dashboard',
        'patients',
        'audit-logs',
        'reports',
        'predictive-analytics',
        'billing',
        'inventory',
        'ai-assistant',
        'notifications',
      ];
      if (!authorizedAdminTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    } else {
      // Provider (Doctor, Nurse, Staff) is strictly whitelisted to clinical modules only
      // Only Receptionist and Nurse have scan-qr tab access
      const canScan = canUserScanQR(activeRole, primaryRole, staffSubRole);
      const authorizedProviderTabs = [
        'home',
        'dashboard',
        'patients',
        ...(canScan ? ['scan-qr'] : []),
        'appointments',
        'queue',
        'consultations',
        'prescriptions',
        'laboratory',
        'inventory',
        'ai-assistant',
        'notifications',
      ];
      if (!authorizedProviderTabs.includes(activeTab)) {
        setActiveTab('dashboard');
      }
    }
  }, [isAuthenticated, activeRole, primaryRole, staffSubRole, activeTab, setActiveTab]);

  const handleStartConsultation = (patientId: string) => {
    setConsultPatientId(patientId);
    selectPatient(patientId);
    setActiveTab('consultations');
  };

  // Eliminate UI flashing by rendering loading skeleton during session verification
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center animate-pulse">
          <SmartClinicLogo className="w-10 h-10" glow={true} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Smart Clinic</p>
          <p className="text-xs text-slate-400">Verifying secure healthcare session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      <GlobalSystemControls />
      <SessionWarningModal />
      <NetworkAwarePageTransition
        isNavigating={isNavigating}
        destinationTitle={navigatingTargetTitle}
      />

      {activeTab === 'home' && <HomePage onOpenBookAppointment={openBookAppointment} />}
      {activeTab === 'login' && <LoginPage />}

      {activeTab !== 'home' && activeTab !== 'login' && isAuthenticated && (
        <>
          <Header
            onOpenBookAppointment={openBookAppointment}
            onOpenNewPatient={() => setShowNewPatient(true)}
            onOpenSupabaseModal={() => setShowSupabaseModal(true)}
            onOpenScanQR={(mode) => {
              setScanQRMode(mode || 'checkin');
              setShowScanQRModal(true);
            }}
            onOpenProfileSettings={() => setShowProfileSettings(true)}
            onToggleMobileMenu={() => setIsMobileNavOpen((prev) => !prev)}
          />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              isOpen={isMobileNavOpen}
              onClose={() => setIsMobileNavOpen(false)}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {activeTab === 'dashboard' && primaryRole === 'patient' && (
                <PatientDashboardView
                  onOpenBookAppointment={openBookAppointment}
                  onOpenQR={() => {
                    const p = patients.find((pat) => pat.id === linkedPatientId) || patients[0];
                    setQrPatient(p);
                  }}
                  onOpenLabReport={printLabReport}
                  onOpenPrescription={printPrescription}
                  onOpenProfileSettings={() => setShowProfileSettings(true)}
                />
              )}
              {activeTab === 'dashboard' && primaryRole === 'staff' && (
                <StaffDashboardView
                  subRole={staffSubRole || 'nurse'}
                  onOpenBookAppointment={openBookAppointment}
                  onOpenNewPatient={() => setShowNewPatient(true)}
                />
              )}
              {activeTab === 'dashboard' && (primaryRole === 'doctor' || activeRole === 'doctor') && (
                <DoctorDashboardView
                  onStartConsultation={handleStartConsultation}
                  onOpenBookAppointment={openBookAppointment}
                />
              )}
              {activeTab === 'dashboard' && primaryRole === 'admin' && (
                <AdminDashboardView />
              )}
              {activeTab === 'patients' && activeRole !== 'patient' && (
                <PatientList
                  onSelectPatient={(id) => {
                    selectPatient(id);
                    setDetailPatient(patients.find((p) => p.id === id) || null);
                  }}
                  onOpenNewPatient={() => setShowNewPatient(true)}
                  onOpenQR={(p) => setQrPatient(p)}
                  onOpenAISummary={() => {}}
                  onStartConsultation={handleStartConsultation}
                  onBookAppointment={(id) => {
                    selectPatient(id);
                    openBookAppointment();
                  }}
                  onOpenScanQR={() => {
                    setScanQRMode('checkin');
                    setShowScanQRModal(true);
                  }}
                />
              )}
              {activeTab === 'scan-qr' && (
                <ScanHealthIdPage
                  onOpenScanner={(mode) => {
                    setScanQRMode(mode);
                    setShowScanQRModal(true);
                  }}
                  onStartConsultation={handleStartConsultation}
                />
              )}
              {activeTab === 'emr' && (
                <PatientList
                  onSelectPatient={(id) => {
                    if (activeRole === 'patient') return;
                    selectPatient(id);
                    setDetailPatient(patients.find((p) => p.id === id) || null);
                  }}
                  onOpenNewPatient={() => setShowNewPatient(true)}
                  onOpenQR={(p) => setQrPatient(p)}
                  onOpenAISummary={() => {}}
                  onStartConsultation={handleStartConsultation}
                  onBookAppointment={(id) => {
                    selectPatient(id);
                    openBookAppointment();
                  }}
                  onOpenScanQR={() => {
                    setScanQRMode('checkin');
                    setShowScanQRModal(true);
                  }}
                />
              )}
              {activeTab === 'appointments' && (
                <AppointmentCalendar
                  onOpenBookAppointment={openBookAppointment}
                  onStartConsultation={handleStartConsultation}
                />
              )}
              {activeTab === 'queue' && <QueueManager onStartConsultation={handleStartConsultation} />}
              {activeTab === 'consultations' && (
                <ConsultationWorkspace initialPatientId={consultPatientId} />
              )}
              {activeTab === 'prescriptions' && (
                <PrescriptionList
                  onOpenNewPrescription={() => setShowNewPrescription(true)}
                  onPrintPrescription={printPrescription}
                />
              )}
              {activeTab === 'laboratory' && (
                <LabOrdersList
                  onOpenEnterResults={(o: LabTestOrder) => setLabOrderForResults(o)}
                  onOpenReport={printLabReport}
                />
              )}
              {activeTab === 'inventory' && <InventoryList />}
              {activeTab === 'billing' && <BillingList />}
              {activeTab === 'reports' && <ReportsAnalytics />}
              {activeTab === 'predictive-analytics' && <PredictiveAnalyticsDashboard />}
              {activeTab === 'ai-assistant' && <AIAssistantHub />}
              {activeTab === 'audit-logs' && <AuditLogsView />}
              {activeTab === 'notifications' && <NotificationsPage />}
            </main>
          </div>
        </>
      )}

      {showNewPatient && <NewPatientModal onClose={() => setShowNewPatient(false)} />}
      {(showBookAppointment || isBookAppointmentOpen) && (
        <BookAppointmentModal
          onClose={() => {
            setShowBookAppointment(false);
            setIsBookAppointmentOpen(false);
          }}
        />
      )}
      {showNewPrescription && (
        <NewPrescriptionModal onClose={() => setShowNewPrescription(false)} />
      )}
      {detailPatient && (
        <PatientDetailModal patient={detailPatient} onClose={() => setDetailPatient(null)} />
      )}
      {qrPatient && <PatientQRModal patient={qrPatient} onClose={() => setQrPatient(null)} />}
      {labOrderForResults && (
        <EnterLabResultsModal order={labOrderForResults} onClose={() => setLabOrderForResults(null)} />
      )}
      {showSupabaseModal && <SupabaseModal onClose={() => setShowSupabaseModal(false)} />}
      <ScanHealthIdModal
        isOpen={showScanQRModal}
        onClose={() => setShowScanQRModal(false)}
        initialMode={scanQRMode}
        onStartConsultation={handleStartConsultation}
      />
      {showProfileSettings && (
        <PatientProfileSettingsModal onClose={() => setShowProfileSettings(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ClinicProvider>
          <PrintProvider>
            <ClinicAppContent />
            <GlobalPrintModal />
            <ToastViewport />
          </PrintProvider>
        </ClinicProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
