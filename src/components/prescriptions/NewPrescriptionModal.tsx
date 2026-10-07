import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { PrescriptionItem, Patient } from '../../types/clinic';
import {
  X,
  Pill,
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';
import { aiService, MedicationSafetyResponse } from '../../services/aiService';

interface Props {
  onClose: () => void;
}

export const NewPrescriptionModal: React.FC<Props> = ({ onClose }) => {
  const { patients, currentUser, addPrescription } = useClinic();

  const [selectedPatId, setSelectedPatId] = useState(patients[0]?.id || '');
  const patient = patients.find((p) => p.id === selectedPatId) || patients[0];

  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      id: 'it-1',
      medicationName: 'Amoxicillin Trihydrate 500mg',
      genericName: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Every 8 hours with water',
      route: 'Oral',
      duration: '7 days',
      quantity: 21,
      instructions: 'Complete full course even if symptoms resolve.',
    },
  ]);

  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('500mg');
  const [newFreq, setNewFreq] = useState('Twice daily');
  const [newRoute, setNewRoute] = useState<'Oral' | 'Sublingual' | 'Topical' | 'Inhalation' | 'Intravenous' | 'Intramuscular'>('Oral');
  const [newDuration, setNewDuration] = useState('14 days');
  const [newQty, setNewQty] = useState(28);
  const [newInstructions, setNewInstructions] = useState('Take with food.');

  // AI Safety Audit State
  const [isCheckingSafety, setIsCheckingSafety] = useState(false);
  const [safetyReport, setSafetyReport] = useState<MedicationSafetyResponse | null>(null);

  const handleAddItem = () => {
    if (!newMedName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `it-${Date.now()}`,
        medicationName: newMedName.trim(),
        genericName: newMedName.trim(),
        dosage: newDosage,
        frequency: newFreq,
        route: newRoute,
        duration: newDuration,
        quantity: Number(newQty),
        instructions: newInstructions,
      },
    ]);
    setNewMedName('');
    setSafetyReport(null); // Reset audit since items changed
  };

  const handleCheckSafety = async () => {
    if (!patient || items.length === 0) return;
    setIsCheckingSafety(true);
    try {
      const res = await aiService.checkMedicationSafety({
        proposedItems: items,
        currentMedications: patient.currentMedications,
        allergies: patient.allergies,
        conditions: patient.chronicConditions,
      });
      setSafetyReport(res.data);
    } catch (err) {
      console.error('Safety audit failed:', err);
    } finally {
      setIsCheckingSafety(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !patient) return;

    addPrescription({
      patientId: patient.id,
      patientName: patient.fullName,
      patientMrn: patient.mrn,
      patientAge: patient.age,
      patientGender: patient.gender,
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      doctorSpecialty: currentUser.specialty || 'General Practice',
      doctorLicense: currentUser.licenseNumber || 'MD-77192',
      date: '2026-10-06',
      items,
      status: 'Active',
      aiSafetyAudit: safetyReport
        ? {
            checkedAt: new Date().toISOString(),
            warnings: safetyReport.warnings,
            safe: safetyReport.safe,
          }
        : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Issue Electronic Prescription</h2>
              <p className="text-[11px] text-slate-500">With Gemini AI Drug-Allergy & Interaction Verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Patient Selection & Warnings */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Patient *</label>
            <select
              value={selectedPatId}
              onChange={(e) => {
                setSelectedPatId(e.target.value);
                setSafetyReport(null);
              }}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.mrn}) - {p.age}y {p.gender}
                </option>
              ))}
            </select>

            {patient?.allergies.length > 0 && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Patient Allergies:</strong> {patient.allergies.map((a) => a.allergen).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Current Prescribed Items */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Prescription Items ({items.length})
              </label>
              <button
                type="button"
                onClick={handleCheckSafety}
                disabled={isCheckingSafety || items.length === 0}
                className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-teal-200 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>{isCheckingSafety ? 'Analyzing Drugs...' : 'Run AI Safety Audit'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 text-xs">
                      {item.medicationName} ({item.dosage})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setItems((prev) => prev.filter((_, idx) => idx !== index));
                        setSafetyReport(null);
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-slate-600">
                    Route: {item.route} • {item.frequency} • {item.duration} (Qty: {item.quantity})
                  </p>
                  <p className="text-[11px] text-slate-500 italic">Instructions: {item.instructions}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Safety Report Box */}
          {safetyReport && (
            <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Gemini Pharmacovigilance Safety Report</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    safetyReport.safe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  Risk: {safetyReport.overallRiskLevel}
                </span>
              </div>

              {safetyReport.allergyAlerts.length > 0 && (
                <div className="p-2 bg-rose-100/80 border border-rose-300 rounded text-rose-900 font-medium">
                  {safetyReport.allergyAlerts.map((a, i) => (
                    <p key={i}>⚠️ {a}</p>
                  ))}
                </div>
              )}

              <div className="space-y-1 text-[11px] text-slate-700">
                {safetyReport.warnings.map((w, i) => (
                  <p key={i} className="flex items-start gap-1">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{w}</span>
                  </p>
                ))}
              </div>

              <AIDisclaimerBanner compact />
            </div>
          )}

          {/* Add Medication Form */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <h3 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">+ Add Drug Item</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Medication Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lisinopril or Atorvastatin"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. 10mg or 20mg"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. Once daily at bedtime"
                  value={newFreq}
                  onChange={(e) => setNewFreq(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Route</label>
                <select
                  value={newRoute}
                  onChange={(e) => setNewRoute(e.target.value as any)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                >
                  <option value="Oral">Oral</option>
                  <option value="Inhalation">Inhalation</option>
                  <option value="Sublingual">Sublingual</option>
                  <option value="Topical">Topical</option>
                  <option value="Intravenous">Intravenous</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 30 days"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Quantity (Units)</label>
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Patient Sig / Directions</label>
              <input
                type="text"
                placeholder="e.g. Take with plenty of fluids. Do not discontinue abruptly."
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs cursor-pointer"
            >
              + Append Medication to Prescription
            </button>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
            >
              Issue Digital Prescription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
