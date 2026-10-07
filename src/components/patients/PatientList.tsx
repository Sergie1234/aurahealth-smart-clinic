import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Patient } from '../../types/clinic';
import {
  Search,
  Filter,
  Plus,
  QrCode,
  Sparkles,
  Stethoscope,
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { AIDisclaimerBanner } from '../common/AIDisclaimerBanner';

interface Props {
  onSelectPatient: (patientId: string) => void;
  onOpenNewPatient: () => void;
  onOpenQR: (patient: Patient) => void;
  onOpenAISummary: (patient: Patient) => void;
  onStartConsultation: (patientId: string) => void;
  onBookAppointment: (patientId: string) => void;
}

export const PatientList: React.FC<Props> = ({
  onSelectPatient,
  onOpenNewPatient,
  onOpenQR,
  onOpenAISummary,
  onStartConsultation,
  onBookAppointment,
}) => {
  const { patients, activeRole } = useClinic();
  const [filterSearch, setFilterSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [bloodFilter, setBloodFilter] = useState('ALL');

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      p.mrn.toLowerCase().includes(filterSearch.toLowerCase()) ||
      p.phone.includes(filterSearch) ||
      (p.chronicConditions || []).some((c) => c.toLowerCase().includes(filterSearch.toLowerCase()));

    const matchesGender = genderFilter === 'ALL' || p.gender === genderFilter;
    const matchesBlood = bloodFilter === 'ALL' || p.bloodType === bloodFilter;

    return matchesSearch && matchesGender && matchesBlood;
  });

  return (
    <div className="space-y-4">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900">Patient Directory</h1>
            <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
              {patients.length} Active Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Electronic Medical Records with allergies, vital histories, and integrated AI synopsis.
          </p>
        </div>

        {activeRole !== 'patient' && (
          <button
            onClick={onOpenNewPatient}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm shadow-teal-700/20 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, MRN, phone, or condition..."
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Gender:</span>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <span className="text-slate-400 font-medium ml-2">Blood:</span>
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Blood Types</option>
            <option value="A+">A+</option>
            <option value="O+">O+</option>
            <option value="B+">B+</option>
            <option value="AB+">AB+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>

      {/* Patients Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Patient & MRN</th>
                <th className="py-3 px-3">Age / Sex</th>
                <th className="py-3 px-3">Blood Type</th>
                <th className="py-3 px-4">Conditions & Allergies</th>
                <th className="py-3 px-4">Latest Vitals</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No patients match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((pat) => {
                  const latestVitals = pat.vitalsHistory[0];

                  return (
                    <tr
                      key={pat.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Name & MRN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {pat.fullName.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => onSelectPatient(pat.id)}
                              className="font-bold text-slate-900 hover:text-teal-600 text-xs transition cursor-pointer text-left block"
                            >
                              {pat.fullName}
                            </button>
                            <span className="text-[11px] font-mono text-slate-400 block">{pat.mrn}</span>
                          </div>
                        </div>
                      </td>

                      {/* Age / Sex */}
                      <td className="py-3.5 px-3">
                        <span className="text-slate-800 font-medium">{pat.age} yrs</span>
                        <span className="text-[11px] text-slate-500 block">{pat.gender}</span>
                      </td>

                      {/* Blood Type */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                          {pat.bloodType}
                        </span>
                      </td>

                      {/* Chronic conditions & Allergies */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1">
                            {pat.chronicConditions.slice(0, 2).map((c, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2 rounded font-medium truncate max-w-[140px]"
                              >
                                {c}
                              </span>
                            ))}
                            {pat.chronicConditions.length > 2 && (
                              <span className="text-[10px] text-slate-400">
                                +{pat.chronicConditions.length - 2}
                              </span>
                            )}
                          </div>

                          {pat.allergies.length > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-700 font-semibold">
                              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">
                                Allergies: {pat.allergies.map((a) => a.allergen).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Latest Vitals */}
                      <td className="py-3.5 px-4">
                        {latestVitals ? (
                          <div className="text-[11px] text-slate-600 space-y-0.5">
                            <div>
                              <span className="font-semibold text-slate-800">
                                BP {latestVitals.bloodPressureSystolic}/{latestVitals.bloodPressureDiastolic}
                              </span>{' '}
                              mmHg
                            </div>
                            <div className="text-[10px] text-slate-400">
                              HR {latestVitals.heartRate} bpm • SpO2 {latestVitals.oxygenSaturation}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No vitals logged</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* AI Summary Button */}
                          <button
                            onClick={() => onOpenAISummary(pat)}
                            className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                            title="Generate AI Clinical Summary"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {/* QR Code Pass */}
                          <button
                            onClick={() => onOpenQR(pat)}
                            className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="View Patient QR / Barcode ID"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {activeRole === 'doctor' && (
                            <button
                              onClick={() => onStartConsultation(pat.id)}
                              className="px-2 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Start Consultation"
                            >
                              <Stethoscope className="w-3 h-3" />
                              <span className="hidden sm:inline">Consult</span>
                            </button>
                          )}

                          <button
                            onClick={() => onSelectPatient(pat.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                            title="Open Patient Profile"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
