/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// Views
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
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
import { PatientPortalDashboard } from './components/patient_portal/PatientPortalDashboard';
import { SupabaseModal } from './components/common/SupabaseModal';

import { Patient, Prescription, LabTestOrder } from './types/clinic';

const ClinicAppContent: React.FC = () => {
  const { activeTab, setActiveTab, activeRole, patients, selectedPatient, selectPatient } = useClinic();

  // Modals state
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

  const handleSelectPatientProfile = (patientId: string) => {
    const pat = patients.find((p) => p.id === patientId);
    if (pat) {
      setDetailPatient(pat);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. Fast Role Perspective Switcher Bar */}
      <RoleSwitcher />

      {/* 2. Top Header Navigation */}
      <Header
        onOpenBookAppointment={() => setShowBookAppointment(true)}
        onOpenNewPatient={() => setShowNewPatient(true)}
        onOpenSupabaseModal={() => setShowSupabaseModal(true)}
      />

      {/* 3. Main Body: Sidebar + Dynamic Module Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Dynamic Role-Filtered Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Workspace Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {activeRole === 'patient' ? (
                <PatientPortalDashboard
                  onOpenBookAppointment={() => setShowBookAppointment(true)}
                  onOpenQR={() => setQrPatient(patients[0])}
                  onOpenLabReport={(lab) => setLabOrderForReport(lab)}
                  onOpenPrescription={(rx) => setPrintingRx(rx)}
                />
              ) : (
                <OverviewDashboard
                  onStartConsultation={handleStartConsultation}
                  onOpenBookAppointment={() => setShowBookAppointment(true)}
                />
              )}
            </>
          )}

          {/* Patients Tab */}
          {activeTab === 'patients' && (
            <PatientList
              onSelectPatient={handleSelectPatientProfile}
              onOpenNewPatient={() => setShowNewPatient(true)}
              onOpenQR={(pat) => setQrPatient(pat)}
              onOpenAISummary={(pat) => setDetailPatient(pat)}
              onStartConsultation={handleStartConsultation}
              onBookAppointment={(patId) => {
                selectPatient(patId);
                setShowBookAppointment(true);
              }}
            />
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <AppointmentCalendar
              onOpenBookAppointment={() => setShowBookAppointment(true)}
              onStartConsultation={handleStartConsultation}
            />
          )}

          {/* Queue Tab */}
          {activeTab === 'queue' && (
            <QueueManager onStartConsultation={handleStartConsultation} />
          )}

          {/* Consultation Workspace Tab */}
          {activeTab === 'consultations' && (
            <ConsultationWorkspace
              initialPatientId={consultPatientId}
              onFinish={() => setActiveTab('emr')}
            />
          )}

          {/* EMR / Medical Records Tab */}
          {activeTab === 'emr' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h1 className="text-base font-bold text-slate-900">Electronic Medical Records (EMR)</h1>
                  <p className="text-xs text-slate-500">Patient Longitudinal History, Chronological Care & Diagnoses</p>
                </div>
              </div>
              <PatientList
                onSelectPatient={handleSelectPatientProfile}
                onOpenNewPatient={() => setShowNewPatient(true)}
                onOpenQR={(pat) => setQrPatient(pat)}
                onOpenAISummary={(pat) => setDetailPatient(pat)}
                onStartConsultation={handleStartConsultation}
                onBookAppointment={(patId) => {
                  selectPatient(patId);
                  setShowBookAppointment(true);
                }}
              />
            </div>
          )}

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <PrescriptionList
              onOpenNewPrescription={() => setShowNewPrescription(true)}
              onPrintPrescription={(rx) => setPrintingRx(rx)}
            />
          )}

          {/* Laboratory Tab */}
          {activeTab === 'laboratory' && (
            <LabOrdersList
              onOpenEnterResults={(order) => setLabOrderForResults(order)}
              onOpenReport={(order) => setLabOrderForReport(order)}
            />
          )}

          {/* Pharmacy & Stock Inventory Tab */}
          {activeTab === 'inventory' && <InventoryList />}

          {/* Billing & Invoices Tab */}
          {activeTab === 'billing' && <BillingList />}

          {/* Reports & Analytics Tab */}
          {activeTab === 'reports' && <ReportsAnalytics />}

          {/* Predictive Analytics & Risk Stratification Tab */}
          {activeTab === 'predictive-analytics' && <PredictiveAnalyticsDashboard />}

          {/* Dedicated AI Clinical & Admin Assistant Chat */}
          {activeTab === 'ai-assistant' && <AIAssistantHub />}

          {/* Audit Logs Tab */}
          {activeTab === 'audit-logs' && <AuditLogsView />}
        </main>
      </div>

      {/* Global Interactive Modals */}
      {showNewPatient && (
        <NewPatientModal onClose={() => setShowNewPatient(false)} />
      )}

      {showBookAppointment && (
        <BookAppointmentModal
          initialPatientId={selectedPatient?.id}
          onClose={() => setShowBookAppointment(false)}
        />
      )}

      {detailPatient && (
        <PatientDetailModal
          patient={detailPatient}
          onClose={() => setDetailPatient(null)}
          onStartConsultation={handleStartConsultation}
          onOpenQR={(pat) => setQrPatient(pat)}
        />
      )}

      {qrPatient && (
        <PatientQRModal
          patient={qrPatient}
          onClose={() => setQrPatient(null)}
        />
      )}

      {showNewPrescription && (
        <NewPrescriptionModal onClose={() => setShowNewPrescription(false)} />
      )}

      {printingRx && (
        <PrescriptionPrintModal
          prescription={printingRx}
          onClose={() => setPrintingRx(null)}
        />
      )}

      {labOrderForResults && (
        <EnterLabResultsModal
          order={labOrderForResults}
          onClose={() => setLabOrderForResults(null)}
        />
      )}

      {labOrderForReport && (
        <LabReportModal
          order={labOrderForReport}
          onClose={() => setLabOrderForReport(null)}
        />
      )}

      {showSupabaseModal && (
        <SupabaseModal onClose={() => setShowSupabaseModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <ClinicProvider>
      <ClinicAppContent />
    </ClinicProvider>
  );
}
