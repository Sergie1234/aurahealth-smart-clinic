/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, ToastViewport } from './context/ToastContext';
import { ThemeToggle } from './components/common/ThemeToggle';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

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
import { PrescriptionPrintModal } from './components/prescriptions/PrescriptionPrintModal';
import { LabOrdersList } from './components/laboratory/LabOrdersList';
import { EnterLabResultsModal } from './components/laboratory/EnterLabResultsModal';
import { LabReportModal } from './components/laboratory/LabReportModal';
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
import type { Patient, Prescription, LabTestOrder } from './types/clinic';

const ClinicAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeRole,
    primaryRole,
    staffSubRole,
    patients,
    selectedPatient,
    selectPatient,
    isNavigating,
    navigatingTargetTitle,
    isAuthenticated,
    setPendingAction,
  } = useClinic();
  const [pendingBook, setPendingBook] = useState(false);

  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showBookAppointment, setShowBookAppointment] = useState(false);
  const [showNewPrescription, setShowNewPrescription] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [detailPatient, setDetailPatient] = useState<Patient | null>(null);
  const [qrPatient, setQrPatient] = useState<Patient | null>(null);
  const [printingRx, setPrintingRx] = useState<Prescription | null>(null);
  const [labOrderForResults, setLabOrderForResults] = useState<LabTestOrder | null>(null);
  const [labOrderForReport, setLabOrderForReport] = useState<LabTestOrder | null>(null);
  const [consultPatientId, setConsultPatientId] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    if (isAuthenticated && pendingBook) {
      if (!primaryRole || primaryRole === 'patient') {
        setShowBookAppointment(true);
      } else {
        setActiveTab('dashboard');
      }
      setPendingBook(false);
      setPendingAction(null);
    }
  }, [isAuthenticated, pendingBook, primaryRole, setPendingAction, setActiveTab]);

  const handleStartConsultation = (patientId: string) => {
    setConsultPatientId(patientId);
    selectPatient(patientId);
    setActiveTab('consultations');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      <ThemeToggle />
      <NetworkAwarePageTransition
        isNavigating={isNavigating}
        destinationTitle={navigatingTargetTitle}
      />

      {activeTab === 'home' && <HomePage onOpenBookAppointment={openBookAppointment} />}
      {activeTab === 'login' && <LoginPage />}

      {activeTab !== 'home' && activeTab !== 'login' && isAuthenticated && (
        <>
          <Header onOpenSupabaseModal={() => setShowSupabaseModal(true)} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {activeTab === 'dashboard' && primaryRole === 'patient' && (
                <PatientDashboardView onOpenBookAppointment={openBookAppointment} />
              )}
              {activeTab === 'dashboard' && primaryRole === 'staff' && (
                <StaffDashboardView subRole={staffSubRole || 'nurse'} onOpenBookAppointment={openBookAppointment} />
              )}
              {activeTab === 'dashboard' && (primaryRole === 'doctor' || activeRole === 'doctor') && (
                <DoctorDashboardView onStartConsultation={handleStartConsultation} onOpenBookAppointment={openBookAppointment} />
              )}
              {activeTab === 'dashboard' && primaryRole === 'admin' && (
                <AdminDashboardView />
              )}
              {activeTab === 'patients' && (
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
                  onPrintPrescription={(rx: Prescription) => setPrintingRx(rx)}
                />
              )}
              {activeTab === 'laboratory' && (
                <LabOrdersList
                  onOpenEnterResults={(o: LabTestOrder) => setLabOrderForResults(o)}
                  onOpenReport={(o: LabTestOrder) => setLabOrderForReport(o)}
                />
              )}
              {activeTab === 'inventory' && <InventoryList />}
              {activeTab === 'billing' && <BillingList />}
              {activeTab === 'reports' && <ReportsAnalytics />}
              {activeTab === 'predictive-analytics' && <PredictiveAnalyticsDashboard />}
              {activeTab === 'ai-assistant' && <AIAssistantHub />}
              {activeTab === 'audit-logs' && <AuditLogsView />}
            </main>
          </div>
        </>
      )}

      {showNewPatient && <NewPatientModal onClose={() => setShowNewPatient(false)} />}
      {showBookAppointment && (
        <BookAppointmentModal onClose={() => setShowBookAppointment(false)} />
      )}
      {showNewPrescription && (
        <NewPrescriptionModal onClose={() => setShowNewPrescription(false)} />
      )}
      {detailPatient && (
        <PatientDetailModal patient={detailPatient} onClose={() => setDetailPatient(null)} />
      )}
      {qrPatient && <PatientQRModal patient={qrPatient} onClose={() => setQrPatient(null)} />}
      {printingRx && (
        <PrescriptionPrintModal prescription={printingRx} onClose={() => setPrintingRx(null)} />
      )}
      {labOrderForResults && (
        <EnterLabResultsModal order={labOrderForResults} onClose={() => setLabOrderForResults(null)} />
      )}
      {labOrderForReport && (
        <LabReportModal order={labOrderForReport} onClose={() => setLabOrderForReport(null)} />
      )}
      {showSupabaseModal && <SupabaseModal onClose={() => setShowSupabaseModal(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ClinicProvider>
          <ClinicAppContent />
          <ToastViewport />
        </ClinicProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
