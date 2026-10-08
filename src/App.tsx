/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { ThemeProvider } from './context/ThemeContext';
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

import { Patient, Prescription, LabTestOrder } from './types/clinic';

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
  } = useClinic();

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

      {activeTab === 'home' ? (
        <HomePage onOpenBookAppointment={() => setShowBookAppointment(true)} />
      ) : activeTab === 'login' ? (
        <LoginPage />
      ) : (
        <>
          <Header
            onOpenBookAppointment={() => setShowBookAppointment(true)}
            onOpenNewPatient={() => setShowNewPatient(true)}
            onOpenSupabaseModal={() => setShowSupabaseModal(true)}
          />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === 'dashboard' && primaryRole === 'patient' && (
                <PatientDashboardView onOpenBookAppointment={() => setShowBookAppointment(true)} />
              )}
              {activeTab === 'dashboard' && primaryRole === 'staff' && (
                <StaffDashboardView onOpenBookAppointment={() => setShowBookAppointment(true)} />
              )}
              {activeTab === 'dashboard' && primaryRole === 'doctor' && (
                <DoctorDashboardView onOpenBookAppointment={() => setShowBookAppointment(true)} />
              )}
              {activeTab === 'dashboard' && primaryRole === 'admin' && <AdminDashboardView />}
              {activeTab === 'patients' && (
                <PatientList
                  onSelectPatient={(p) => setDetailPatient(p)}
                  onBookAppointment={(patId) => {
                    selectPatient(patId);
                    setShowBookAppointment(true);
                  }}
                />
              )}
              {activeTab === 'appointments' && (
                <AppointmentCalendar onOpenBookAppointment={() => setShowBookAppointment(true)} />
              )}
              {activeTab === 'queue' && <QueueManager />}
              {activeTab === 'consultations' && (
                <ConsultationWorkspace initialPatientId={consultPatientId} />
              )}
              {activeTab === 'prescriptions' && (
                <PrescriptionList
                  onNew={() => setShowNewPrescription(true)}
                  onPrint={(rx) => setPrintingRx(rx)}
                />
              )}
              {activeTab === 'laboratory' && (
                <LabOrdersList
                  onEnterResults={(o) => setLabOrderForResults(o)}
                  onViewReport={(o) => setLabOrderForReport(o)}
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
        <BookAppointmentModal
          initialPatientId={selectedPatient?.id}
          onClose={() => setShowBookAppointment(false)}
        />
      )}
      {showNewPrescription && <NewPrescriptionModal onClose={() => setShowNewPrescription(false)} />}
      {detailPatient && (
        <PatientDetailModal patient={detailPatient} onClose={() => setDetailPatient(null)} />
      )}
      {qrPatient && <PatientQRModal patient={qrPatient} onClose={() => setQrPatient(null)} />}
      {printingRx && <PrescriptionPrintModal prescription={printingRx} onClose={() => setPrintingRx(null)} />}
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
      <ClinicProvider>
        <ClinicAppContent />
      </ClinicProvider>
    </ThemeProvider>
  );
}
