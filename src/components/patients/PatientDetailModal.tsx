import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient, Vitals } from '../../types/clinic';
import {
  X,
  Sparkles,
  Heart,
  Activity,
  AlertTriangle,
  Pill,
  FileText,
  Calendar,
  Clock,
  Plus,
  ShieldCheck,
  Stethoscope,
  QrCode,
  DollarSign
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { aiService, PatientSummaryResponse } from '../../services/aiService';

interface Props {
  patient: Patient;
  onClose: () => void;
  onStartConsultation?: (patientId: string) => void;
  onOpenQR?: (patient: Patient) => void;
}

export const PatientDetailModal: React.FC<Props> = ({
  patient,
  onClose,
  onStartConsultation,
  onOpenQR,
}) => {
  const {
    consultations,
    labOrders,
    prescriptions,
    invoices,
    addVitals,
    activeRole,
    setActiveTab,
  } = useClinic();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'timeline' | 'vitals' | 'meds'>('overview');
  const [showAddVitals, setShowAddVitals] = useState(false);

  // Vitals form state
  const [newSystolic, setNewSystolic] = useState('120');
  const [newDiastolic, setNewDiastolic] = useState('80');
  const [newHr, setNewHr] = useState('72');
  const [newRr, setNewRr] = useState('16');
  const [newTemp, setNewTemp] = useState('36.8');
  const [newSpo2, setNewSpo2] = useState('98');
  const [newHeight, setNewHeight] = useState(String(patient.vitalsHistory[0]?.height || 170));
  const [newWeight, setNewWeight] = useState(String(patient.vitalsHistory[0]?.weight || 70));
  const [vitalsNotes, setVitalsNotes] = useState('');

  // AI Summary State
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<PatientSummaryResponse | null>(null);

  // Related patient records
  const patientConsultations = consultations.filter((c) => c.patientId === patient.id);
  const patientLabs = labOrders.filter((l) => l.patientId === patient.id);
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patient.id);
  const patientInvoices = invoices.filter((i) => i.patientId === patient.id);

  // Handle vitals submission
  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const h = Number(newHeight);
    const w = Number(newWeight);
    const bmiVal = h > 0 ? Number((w / ((h / 100) * (h / 100))).toFixed(1)) : 22;

    addVitals(patient.id, {
      recordedBy: 'Clinical Nurse',
      bloodPressureSystolic: Number(newSystolic),
      bloodPressureDiastolic: Number(newDiastolic),
      heartRate: Number(newHr),
      respiratoryRate: Number(newRr),
      temperature: Number(newTemp),
      oxygenSaturation: Number(newSpo2),
      height: h,
      weight: w,
      bmi: bmiVal,
      notes: vitalsNotes || 'Routine triage vitals recorded.',
    });

    setShowAddVitals(false);
    setVitalsNotes('');
  };

  // Generate AI Summary
  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await aiService.generatePatientSummary({
        patient,
        consultations: patientConsultations,
        labOrders: patientLabs,
        prescriptions: patientPrescriptions,
      });
      setAiSummary(res.data);
    } catch (err) {
      console.error('Error generating AI patient summary:', err);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-xs">
              {patient.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {patient.fullName}
                </h2>
                <span className="font-mono text-xs text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded font-medium">
                  {patient.mrn}
                </span>
                <span className="bg-rose-50 text-rose-700 font-bold text-xs px-2 py-0.5 rounded border border-rose-200">
                  {patient.bloodType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {patient.age} yrs • {patient.gender} • DOB: {patient.dob} • Phone: {patient.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{isGeneratingSummary ? 'Analyzing...' : 'AI Summary'}</span>
            </button>

            {onOpenQR && (
              <button
                onClick={() => onOpenQR(patient)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg text-xs transition cursor-pointer"
                title="View Digital QR ID Card"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}

            {activeRole === 'doctor' && onStartConsultation && (
              <button
                onClick={() => onStartConsultation(patient.id)}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Start Consult</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Allergy Warning Banner if any */}
        {patient.allergies.length > 0 && (
          <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold">KNOWN ALLERGIES:</span>
              <span className="font-medium">
                {patient.allergies.map((a) => `${a.allergen} (${a.severity}: ${a.reaction})`).join('; ')}
              </span>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase">
              Caution Advised
            </span>
          </div>
        )}

        {/* AI Patient Summary Box (Expanded if available) */}
        {aiSummary && (
          <div className="p-4 bg-teal-50/60 border-b border-teal-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Gemini Clinical Summary Snapshot</span>
                <span className="text-[10px] text-teal-600 font-normal">
                  (Generated at {new Date(aiSummary.generatedAt).toLocaleTimeString()})
                </span>
              </div>
              <button
                onClick={() => setAiSummary(null)}
                className="text-[11px] text-teal-700 hover:underline font-semibold"
              >
                Dismiss
              </button>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {aiSummary.executiveSummary}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
                <span className="font-bold text-slate-700 block">Vital Trends:</span>
                <span className="text-slate-600">{aiSummary.vitalTrends}</span>
              </div>
              <div className="bg-white/80 p-2 rounded-lg border border-teal-100">
                <span className="font-bold text-slate-700 block">Recommended Action Items:</span>
                <span className="text-slate-600">{aiSummary.recommendedActionItems?.join(' • ')}</span>
              </div>
            </div>
            <AIDisclaimerBanner compact />
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-200 bg-white flex items-center gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-3 border-b-2 cursor-pointer transition ${
              activeSubTab === 'overview'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Clinical Overview
          </button>
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`py-3 border-b-2 cursor-pointer transition ${
              activeSubTab === 'timeline'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Medical Timeline ({patientConsultations.length + patientLabs.length + patientPrescriptions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('vitals')}
            className={`py-3 border-b-2 cursor-pointer transition ${
              activeSubTab === 'vitals'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Vitals History ({patient.vitalsHistory.length})
          </button>
          <button
            onClick={() => setActiveSubTab('meds')}
            className={`py-3 border-b-2 cursor-pointer transition ${
              activeSubTab === 'meds'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Medications & Invoices
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
          {activeSubTab === 'overview' && (
            <div className="space-y-5">
              {/* Row 1: Demographics & Insurance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-800 text-xs">Contact & Emergency Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Address</span>
                      <span className="font-medium text-slate-800">{patient.address}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                      <span className="font-medium text-slate-800">{patient.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Emergency Contact</span>
                      <span className="font-medium text-slate-800">
                        {patient.emergencyContact?.name} ({patient.emergencyContact?.relationship})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Emergency Phone</span>
                      <span className="font-medium text-slate-800">{patient.emergencyContact?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                  <h3 className="font-bold text-slate-800 text-xs">Insurance & Billing Coverage</h3>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Primary Payer</span>
                      <span className="font-medium text-slate-800">{patient.insuranceProvider || 'Self-Pay / Cash'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Policy #</span>
                      <span className="font-mono font-medium text-slate-800">{patient.insurancePolicyNumber || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Billing Status</span>
                      <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified & Active
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Registered Since</span>
                      <span className="font-medium text-slate-800">{new Date(patient.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Chronic Conditions & Current Regimen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <h3 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Chronic Diagnoses</span>
                    <span className="text-[10px] text-slate-400">{patient.chronicConditions.length} documented</span>
                  </h3>
                  <div className="space-y-1.5">
                    {patient.chronicConditions.map((cond, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{cond}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                          ICD Active
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <h3 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Current Active Medications</span>
                    <span className="text-[10px] text-slate-400">{patient.currentMedications.length} therapies</span>
                  </h3>
                  <div className="space-y-1.5">
                    {patient.currentMedications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-teal-50/50 border border-teal-100 flex items-center gap-2 text-teal-900"
                      >
                        <Pill className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span className="font-medium text-slate-800">{med}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Latest Vitals Snapshot */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <h3 className="font-bold text-slate-800 text-xs">Latest Baseline Vitals</h3>
                  </div>
                  <button
                    onClick={() => setShowAddVitals(true)}
                    className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record New Vitals</span>
                  </button>
                </div>

                {patient.vitalsHistory[0] ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Blood Pressure</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {patient.vitalsHistory[0].bloodPressureSystolic}/{patient.vitalsHistory[0].bloodPressureDiastolic}
                        <span className="text-xs text-slate-500 font-normal ml-1">mmHg</span>
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Heart Rate</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {patient.vitalsHistory[0].heartRate}
                        <span className="text-xs text-slate-500 font-normal ml-1">bpm</span>
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Oxygen Saturation</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {patient.vitalsHistory[0].oxygenSaturation}%
                        <span className="text-xs text-slate-500 font-normal ml-1">SpO2</span>
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">BMI / Body Mass</span>
                      <p className="text-base font-bold text-slate-900 mt-0.5">
                        {patient.vitalsHistory[0].bmi}
                        <span className="text-xs text-slate-500 font-normal ml-1">({patient.vitalsHistory[0].weight}kg)</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No vitals recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeSubTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-xs">Chronological Clinical Care Events</h3>

              <div className="relative pl-6 border-l-2 border-teal-200 space-y-6">
                {patientConsultations.map((c) => (
                  <div key={c.id} className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-teal-600 border-2 border-white" />
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-xs">Consultation with {c.doctorName}</span>
                        <span className="text-[10px] text-slate-400">{c.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{c.chiefComplaint}</p>
                      <p className="text-[11px] text-slate-500">{c.treatmentPlan}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-mono">
                          Diagnoses: {c.diagnoses.map((d) => d.code).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {patientLabs.map((l) => (
                  <div key={l.id} className="relative">
                    <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-2 border-white" />
                    <div className="bg-indigo-50/40 p-3.5 rounded-xl border border-indigo-200 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-indigo-950 text-xs">{l.testName}</span>
                        <span className="text-[10px] text-indigo-500">{new Date(l.requestedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-700">Status: <span className="font-bold">{l.status}</span></p>
                      {l.results && (
                        <div className="text-[11px] text-slate-600">
                          {l.results.map((r) => `${r.parameter}: ${r.value} ${r.unit} (${r.flag})`).join(' • ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vitals Tab */}
          {activeSubTab === 'vitals' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-xs">Vital Signs Trend Log</h3>
                <button
                  onClick={() => setShowAddVitals(true)}
                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Vitals</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                {patient.vitalsHistory.map((vit, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-slate-50 transition flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-xs">
                          BP: {vit.bloodPressureSystolic}/{vit.bloodPressureDiastolic} mmHg
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-700">HR: {vit.heartRate} bpm</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-700">SpO2: {vit.oxygenSaturation}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Temp: {vit.temperature}°C • RR: {vit.respiratoryRate}/min • Height: {vit.height}cm • Weight: {vit.weight}kg • BMI: {vit.bmi}
                      </p>
                      {vit.notes && <p className="text-[11px] text-slate-600 italic mt-0.5">Notes: {vit.notes}</p>}
                    </div>
                    <div className="text-right text-[11px] text-slate-400 self-start sm:self-center">
                      <span>{new Date(vit.recordedAt).toLocaleString()}</span>
                      <span className="block text-[10px] text-slate-500">by {vit.recordedBy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meds & Invoices Tab */}
          {activeSubTab === 'meds' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-bold text-slate-800 text-xs mb-2">Prescription History</h3>
                <div className="space-y-2">
                  {patientPrescriptions.map((rx) => (
                    <div key={rx.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-900">{rx.prescriptionNumber}</span>
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">
                          {rx.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Prescribed by {rx.doctorName} on {rx.date}</p>
                      <div className="mt-2 space-y-1">
                        {rx.items.map((it) => (
                          <div key={it.id} className="flex justify-between text-[11px] bg-white p-1.5 rounded border border-slate-100">
                            <span className="font-medium text-slate-800">{it.medicationName} ({it.dosage})</span>
                            <span className="text-slate-500">{it.frequency} - {it.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-xs mb-2">Billing & Invoices</h3>
                <div className="space-y-2">
                  {patientInvoices.map((inv) => (
                    <div key={inv.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900">{inv.invoiceNumber}</span>
                        <p className="text-[11px] text-slate-500">{inv.items.map((i) => i.description).join(', ')}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">${inv.totalAmount.toFixed(2)}</span>
                        <span className={`block text-[10px] font-bold ${inv.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Vitals Sub-modal Overlay */}
        {showAddVitals && (
          <div className="fixed inset-0 z-60 bg-slate-900/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 max-w-md w-full text-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-900 text-sm">Record Patient Vital Signs</h3>
                <button onClick={() => setShowAddVitals(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVitals} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">BP Systolic (mmHg)</label>
                    <input
                      type="number"
                      value={newSystolic}
                      onChange={(e) => setNewSystolic(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">BP Diastolic (mmHg)</label>
                    <input
                      type="number"
                      value={newDiastolic}
                      onChange={(e) => setNewDiastolic(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      value={newHr}
                      onChange={(e) => setNewHr(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">SpO2 Oxygen (%)</label>
                    <input
                      type="number"
                      value={newSpo2}
                      onChange={(e) => setNewSpo2(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newTemp}
                      onChange={(e) => setNewTemp(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-600 font-semibold block mb-1">Clinical Observations</label>
                  <textarea
                    rows={2}
                    value={vitalsNotes}
                    onChange={(e) => setVitalsNotes(e.target.value)}
                    placeholder="Patient presentation, posture, comments..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddVitals(false)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Save Vitals
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
