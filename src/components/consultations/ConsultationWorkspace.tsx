import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient, Vitals, Consultation, PrescriptionItem } from '../../types/clinic';
import {
  Stethoscope,
  Sparkles,
  Activity,
  AlertTriangle,
  Pill,
  FlaskConical,
  FileCheck,
  Calendar,
  Save,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  User
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { aiService, SOAPResponse } from '../../services/aiService';

interface Props {
  initialPatientId?: string;
  onFinish?: () => void;
}

export const ConsultationWorkspace: React.FC<Props> = ({ initialPatientId, onFinish }) => {
  const {
    patients,
    currentUser,
    addConsultation,
    addPrescription,
    addLabOrder,
    setActiveTab,
    selectPatient,
  } = useClinic();

  const [selectedPatId, setSelectedPatId] = useState<string>(
    initialPatientId || patients[0]?.id || ''
  );

  const patient = patients.find((p) => p.id === selectedPatId) || patients[0];

  // Consultation SOAP States
  const [chiefComplaint, setChiefComplaint] = useState(
    'Quarterly evaluation of blood pressure and glycemic markers. Mild morning fatigue.'
  );
  const [doctorRawNotes, setDoctorRawNotes] = useState(
    'Patient feels generally well, taking oral meds regularly. Occasional fatigue. Denies chest pain or shortness of breath. Lungs clear, heart sounds normal.'
  );
  const [hpi, setHpi] = useState('');
  const [ros, setRos] = useState('');
  const [exam, setExam] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Diagnoses
  const [diagnoses, setDiagnoses] = useState<{ code: string; description: string; type: 'Primary' | 'Secondary' }[]>([
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', type: 'Primary' },
    { code: 'I10', description: 'Essential (primary) hypertension', type: 'Secondary' },
  ]);
  const [newDiagCode, setNewDiagCode] = useState('');
  const [newDiagDesc, setNewDiagDesc] = useState('');

  // Vitals for current consultation
  const [bpSys, setBpSys] = useState('130');
  const [bpDia, setBpDia] = useState('84');
  const [hr, setHr] = useState('74');
  const [rr, setRr] = useState('16');
  const [temp, setTemp] = useState('36.8');
  const [spo2, setSpo2] = useState('98');
  const [weight, setWeight] = useState(String(patient?.vitalsHistory[0]?.weight || 72));
  const [height, setHeight] = useState(String(patient?.vitalsHistory[0]?.height || 165));

  // Prescriptions created in this consult
  const [prescriptionsToAdd, setPrescriptionsToAdd] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      medicationName: 'Metformin HCl 850mg',
      genericName: 'Metformin',
      dosage: '850mg',
      frequency: 'Twice daily with meals',
      route: 'Oral',
      duration: '90 days',
      quantity: 180,
      instructions: 'Take with food to minimize GI side effects.',
    },
  ]);
  const [newDrugName, setNewDrugName] = useState('');
  const [newDrugDosage, setNewDrugDosage] = useState('');
  const [newDrugFreq, setNewDrugFreq] = useState('');

  // Lab Orders created in this consult
  const [labOrdersToAdd, setLabOrdersToAdd] = useState<string[]>([
    'Comprehensive Metabolic Panel (CMP) & HbA1c',
  ]);
  const [newLabTest, setNewLabTest] = useState('');

  // Follow-up & Medical Certificate
  const [followUpDate, setFollowUpDate] = useState('2026-11-06');
  const [followUpNotes, setFollowUpNotes] = useState('Return in 4 weeks for repeat fasting glucose & BP review.');
  const [issueMedCert, setIssueMedCert] = useState(false);
  const [certStartDate, setCertStartDate] = useState('2026-10-06');
  const [certEndDate, setCertEndDate] = useState('2026-10-08');

  // AI Generation State
  const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);
  const [showAiDraftModal, setShowAiDraftModal] = useState(false);
  const [aiGeneratedSoap, setAiGeneratedSoap] = useState<SOAPResponse | null>(null);

  // Compute BMI
  const computedBmi =
    Number(height) > 0
      ? Number((Number(weight) / ((Number(height) / 100) * (Number(height) / 100))).toFixed(1))
      : 24.5;

  // Generate Structured SOAP Note using Gemini
  const handleGenerateAiSoap = async () => {
    setIsGeneratingSoap(true);
    try {
      const currentVitals: Vitals = {
        recordedAt: new Date().toISOString(),
        recordedBy: currentUser.name,
        bloodPressureSystolic: Number(bpSys),
        bloodPressureDiastolic: Number(bpDia),
        heartRate: Number(hr),
        respiratoryRate: Number(rr),
        temperature: Number(temp),
        oxygenSaturation: Number(spo2),
        height: Number(height),
        weight: Number(weight),
        bmi: computedBmi,
      };

      const res = await aiService.generateClinicalNotes({
        patientInfo: patient,
        rawNotes: doctorRawNotes,
        vitals: currentVitals,
        chiefComplaint,
      });

      setAiGeneratedSoap(res.data);
      setShowAiDraftModal(true);
    } catch (err) {
      console.error('Failed to generate AI SOAP:', err);
    } finally {
      setIsGeneratingSoap(false);
    }
  };

  // Adopt AI Draft into form
  const handleApplyAiSoap = () => {
    if (!aiGeneratedSoap) return;
    if (aiGeneratedSoap.chiefComplaint) setChiefComplaint(aiGeneratedSoap.chiefComplaint);
    if (aiGeneratedSoap.historyOfPresentIllness) setHpi(aiGeneratedSoap.historyOfPresentIllness);
    if (aiGeneratedSoap.reviewOfSystems) setRos(aiGeneratedSoap.reviewOfSystems);
    if (aiGeneratedSoap.physicalExamination) setExam(aiGeneratedSoap.physicalExamination);
    if (aiGeneratedSoap.assessment) setAssessment(aiGeneratedSoap.assessment);
    if (aiGeneratedSoap.treatmentPlan) setPlan(aiGeneratedSoap.treatmentPlan);

    if (aiGeneratedSoap.suggestedDiagnoses && aiGeneratedSoap.suggestedDiagnoses.length > 0) {
      setDiagnoses(
        aiGeneratedSoap.suggestedDiagnoses.map((d) => ({
          code: d.code,
          description: d.description,
          type: (d.type as any) || 'Primary',
        }))
      );
    }

    setShowAiDraftModal(false);
  };

  // Add diagnosis
  const handleAddDiagnosis = () => {
    if (newDiagCode.trim() && newDiagDesc.trim()) {
      setDiagnoses((prev) => [
        ...prev,
        {
          code: newDiagCode.trim().toUpperCase(),
          description: newDiagDesc.trim(),
          type: prev.length === 0 ? 'Primary' : 'Secondary',
        },
      ]);
      setNewDiagCode('');
      setNewDiagDesc('');
    }
  };

  // Add medication
  const handleAddMedication = () => {
    if (newDrugName.trim()) {
      setPrescriptionsToAdd((prev) => [
        ...prev,
        {
          id: `item-${Date.now()}`,
          medicationName: newDrugName.trim(),
          genericName: newDrugName.trim(),
          dosage: newDrugDosage.trim() || 'Standard Dose',
          frequency: newDrugFreq.trim() || 'Once daily',
          route: 'Oral',
          duration: '30 days',
          quantity: 30,
          instructions: 'Take as directed by physician.',
        },
      ]);
      setNewDrugName('');
      setNewDrugDosage('');
      setNewDrugFreq('');
    }
  };

  // Finalize consultation
  const handleFinalizeConsultation = () => {
    if (!patient) return;

    const consultVitals: Vitals = {
      recordedAt: new Date().toISOString(),
      recordedBy: currentUser.name,
      bloodPressureSystolic: Number(bpSys),
      bloodPressureDiastolic: Number(bpDia),
      heartRate: Number(hr),
      respiratoryRate: Number(rr),
      temperature: Number(temp),
      oxygenSaturation: Number(spo2),
      height: Number(height),
      weight: Number(weight),
      bmi: computedBmi,
    };

    // 1. Create prescription if items exist
    let createdRxId: string | undefined;
    if (prescriptionsToAdd.length > 0) {
      const rx = addPrescription({
        patientId: patient.id,
        patientName: patient.fullName,
        patientMrn: patient.mrn,
        patientAge: patient.age,
        patientGender: patient.gender,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        doctorSpecialty: currentUser.specialty || 'General Medicine',
        doctorLicense: currentUser.licenseNumber || 'MD-88190',
        date: '2026-10-06',
        items: prescriptionsToAdd,
        status: 'Active',
      });
      createdRxId = rx.id;
    }

    // 2. Create Lab Orders if any
    const createdLabIds: string[] = [];
    labOrdersToAdd.forEach((testName) => {
      const lab = addLabOrder({
        patientId: patient.id,
        patientName: patient.fullName,
        patientMrn: patient.mrn,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        testName,
        category: 'Biochemistry',
        urgency: 'Routine',
        status: 'Requested',
      });
      createdLabIds.push(lab.id);
    });

    // 3. Save Consultation
    addConsultation({
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      date: '2026-10-06',
      chiefComplaint,
      historyOfPresentIllness: hpi || doctorRawNotes,
      reviewOfSystems: ros,
      physicalExamination: exam || `Vitals reviewed: BP ${bpSys}/${bpDia}, HR ${hr}. Alert and oriented.`,
      vitals: consultVitals,
      diagnoses,
      treatmentPlan: plan || 'Adherence counseling reinforced. Regular outpatient follow-up.',
      prescriptionsCreated: createdRxId ? [createdRxId] : [],
      labOrdersCreated: createdLabIds,
      followUpDate,
      followUpInstructions: followUpNotes,
      medicalCertificateIssued: issueMedCert,
      certificateDetails: issueMedCert
        ? {
            diagnosis: diagnoses[0]?.description || 'Acute medical condition',
            leaveStartDate: certStartDate,
            leaveEndDate: certEndDate,
            recommendation: 'Patient advised complete rest from work/school duties.',
          }
        : undefined,
    });

    if (onFinish) onFinish();
    else setActiveTab('emr');
  };

  return (
    <div className="space-y-4">
      {/* Consultation Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">Clinical Consultation Suite</h1>
              <span className="bg-teal-50 text-teal-700 font-bold text-xs px-2 py-0.5 rounded border border-teal-200">
                Dr. Mode Active
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Exam documentation, vitals assessment, AI-assisted SOAP scribe, e-prescriptions & lab ordering.
            </p>
          </div>
        </div>

        {/* Patient Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Select Patient:</span>
          <select
            value={selectedPatId}
            onChange={(e) => {
              setSelectedPatId(e.target.value);
              selectPatient(e.target.value);
            }}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName} ({p.mrn})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Clinical Caution Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 font-bold flex items-center justify-center text-sm border border-teal-500/40">
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{patient.fullName}</span>
              <span className="text-slate-400 font-mono text-[11px]">{patient.mrn}</span>
              <span className="bg-rose-500/20 text-rose-300 font-bold px-2 py-0.2 rounded text-[10px] border border-rose-500/30">
                {patient.bloodType}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              {patient.age}y {patient.gender} • Known Conditions: {patient.chronicConditions.join(', ') || 'None'}
            </p>
          </div>
        </div>

        <div className="text-right sm:text-right">
          {patient.allergies.length > 0 ? (
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs justify-end">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ALLERGIC: {patient.allergies.map((a) => a.allergen).join(', ')}</span>
            </div>
          ) : (
            <span className="text-emerald-400 font-semibold text-xs">No known drug allergies (NKDA)</span>
          )}
          <span className="text-slate-400 text-[10px] block mt-0.5">
            Primary Physician: {currentUser.name}
          </span>
        </div>
      </div>

      <AIDisclaimerBanner />

      {/* Consultation 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-xs">
        {/* Left Column (2 spans): Clinical Notes & SOAP */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section 1: Chief Complaint & AI Generator Trigger */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xs">1. Chief Complaint & Clinical Notes</h2>
              <button
                type="button"
                onClick={handleGenerateAiSoap}
                disabled={isGeneratingSoap}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingSoap ? 'AI Scribing Note...' : 'Generate Structured SOAP with Gemini'}</span>
              </button>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Chief Complaint</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Physician's Dictation / Raw Findings (AI will structure into SOAP format)
              </label>
              <textarea
                rows={3}
                value={doctorRawNotes}
                onChange={(e) => setDoctorRawNotes(e.target.value)}
                placeholder="Enter symptoms, patient statements, exam bullet points, or dictation..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Section 2: Structured SOAP Documentation */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-slate-800 text-xs">2. Structured Clinical Record (SOAP)</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Subjective (HPI)</label>
                <textarea
                  rows={3}
                  value={hpi}
                  onChange={(e) => setHpi(e.target.value)}
                  placeholder="History of present illness..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Review of Systems (ROS)</label>
                <textarea
                  rows={3}
                  value={ros}
                  onChange={(e) => setRos(e.target.value)}
                  placeholder="Cardiovascular, Respiratory, Endocrine, GI..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Objective (Physical Examination)</label>
                <textarea
                  rows={3}
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  placeholder="Physical exam findings, auscultation, palpation..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assessment & Differential</label>
                <textarea
                  rows={3}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Diagnostic impression and clinical reasoning..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Plan & Management Protocol</label>
              <textarea
                rows={3}
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Numbered treatment plan, lifestyle education, safety net..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Section 3: Diagnoses (ICD) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-slate-800 text-xs">3. Diagnoses (ICD-10)</h2>

            <div className="space-y-1.5">
              {diagnoses.map((diag, index) => (
                <div
                  key={index}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {diag.code}
                    </span>
                    <span className="font-semibold text-slate-800">{diag.description}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                      {diag.type}
                    </span>
                  </div>
                  <button
                    onClick={() => setDiagnoses((prev) => prev.filter((_, i) => i !== index))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="ICD Code (e.g. E11.9)"
                value={newDiagCode}
                onChange={(e) => setNewDiagCode(e.target.value)}
                className="w-28 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs uppercase font-mono"
              />
              <input
                type="text"
                placeholder="Diagnosis Description (e.g. Type 2 Diabetes Mellitus)"
                value={newDiagDesc}
                onChange={(e) => setNewDiagDesc(e.target.value)}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddDiagnosis}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Vitals, Prescriptions, Labs & Finalize */}
        <div className="space-y-4">
          {/* Consultation Vitals */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Today's Vitals</span>
              </h2>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                BMI: {computedBmi}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">BP Systolic</label>
                <input
                  type="number"
                  value={bpSys}
                  onChange={(e) => setBpSys(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">BP Diastolic</label>
                <input
                  type="number"
                  value={bpDia}
                  onChange={(e) => setBpDia(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2}
                  onChange={(e) => setSpo2(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
            </div>
          </div>

          {/* E-Prescriptions */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>Digital Prescriptions</span>
            </h2>

            <div className="space-y-1.5">
              {prescriptionsToAdd.map((rxItem, i) => (
                <div key={rxItem.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800">{rxItem.medicationName}</span>
                    <button
                      onClick={() => setPrescriptionsToAdd((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {rxItem.dosage} • {rxItem.frequency} • {rxItem.duration}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick add drug inputs */}
            <div className="space-y-1.5 pt-1">
              <input
                type="text"
                placeholder="Drug name (e.g. Amoxicillin 500mg)"
                value={newDrugName}
                onChange={(e) => setNewDrugName(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Dosage (500mg)"
                  value={newDrugDosage}
                  onChange={(e) => setNewDrugDosage(e.target.value)}
                  className="w-1/2 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
                <input
                  type="text"
                  placeholder="Freq (TID x 7d)"
                  value={newDrugFreq}
                  onChange={(e) => setNewDrugFreq(e.target.value)}
                  className="w-1/2 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMedication}
                className="w-full py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] cursor-pointer"
              >
                + Add Medication
              </button>
            </div>
          </div>

          {/* Lab Orders */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h2 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
              <span>Laboratory Orders</span>
            </h2>

            <div className="space-y-1">
              {labOrdersToAdd.map((test, i) => (
                <div key={i} className="flex justify-between items-center p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px]">
                  <span className="font-medium text-slate-800">{test}</span>
                  <button
                    onClick={() => setLabOrdersToAdd((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                placeholder="Test panel name..."
                value={newLabTest}
                onChange={(e) => setNewLabTest(e.target.value)}
                className="flex-1 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (newLabTest.trim()) {
                    setLabOrdersToAdd((prev) => [...prev, newLabTest.trim()]);
                    setNewLabTest('');
                  }
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>

          {/* Follow-up & Medical Sick Certificate */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
            <h2 className="font-bold text-slate-800 text-xs">Follow-up & Sick Certificate</h2>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Return Visit Date</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={issueMedCert}
                  onChange={(e) => setIssueMedCert(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Issue Medical Sick Leave Certificate</span>
              </label>

              {issueMedCert && (
                <div className="mt-2 grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div>
                    <label className="text-[10px] text-slate-500 block">From</label>
                    <input
                      type="date"
                      value={certStartDate}
                      onChange={(e) => setCertStartDate(e.target.value)}
                      className="w-full p-1 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">To</label>
                    <input
                      type="date"
                      value={certEndDate}
                      onChange={(e) => setCertEndDate(e.target.value)}
                      className="w-full p-1 bg-white border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Finalize Button */}
          <button
            type="button"
            onClick={handleFinalizeConsultation}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-teal-700/20 transition cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete & Sign Consultation Record</span>
          </button>
        </div>
      </div>

      {/* AI SOAP Review & Adoption Modal */}
      {showAiDraftModal && aiGeneratedSoap && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 bg-teal-50/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Clinical Decision Support — SOAP Draft</h3>
                  <p className="text-[10px] text-slate-500">Automated medical scribe & differential suggestions • Physician review required</p>
                </div>
              </div>
              <button onClick={() => setShowAiDraftModal(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-3.5 text-xs">
              {/* Mandatory Review Prompt Banner */}
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[11px] uppercase tracking-wide text-amber-900">
                    Mandatory Attending Physician Review & Approval
                  </p>
                  <p className="text-amber-800 text-[11px] leading-relaxed mt-0.5">
                    The Clinical Decision Support Assistant operates strictly as analytical decision support to improve clinical efficiency. It cannot finalize a diagnosis or issue a prescription autonomously. Please review, edit as appropriate, and explicitly approve this note before committing it to the medical record.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 text-[11px] block uppercase">Chief Complaint</span>
                <p className="text-slate-700">{aiGeneratedSoap.chiefComplaint}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 text-[11px] block uppercase">History of Present Illness</span>
                <p className="text-slate-700 leading-relaxed">{aiGeneratedSoap.historyOfPresentIllness}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 text-[11px] block uppercase">Physical Examination</span>
                <p className="text-slate-700">{aiGeneratedSoap.physicalExamination}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 text-[11px] block uppercase">Assessment</span>
                <p className="text-slate-700">{aiGeneratedSoap.assessment}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 text-[11px] block uppercase">Plan</span>
                <p className="text-slate-700 whitespace-pre-line">{aiGeneratedSoap.treatmentPlan}</p>
              </div>

              {aiGeneratedSoap.suggestedDiagnoses && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 text-[11px] block uppercase">Suggested Diagnoses</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiGeneratedSoap.suggestedDiagnoses.map((d, i) => (
                      <span key={i} className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-mono text-[10px]">
                        {d.code}: {d.description}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Physician must verify accuracy before applying</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAiDraftModal(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="button"
                  onClick={handleApplyAiSoap}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Insert into Clinical Note</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
