import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { X, UserPlus, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const NewPatientModal: React.FC<Props> = ({ onClose }) => {
  const { addPatient } = useClinic();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('1990-01-01');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [bloodType, setBloodType] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'>('O+');
  const [phone, setPhone] = useState('+1 (555) ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRel, setEmergencyRel] = useState('Spouse');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [allergiesText, setAllergiesText] = useState(''); // e.g. "Penicillin (severe), Latex (mild)"
  const [conditionsText, setConditionsText] = useState(''); // e.g. "Hypertension, Asthma"
  const [medsText, setMedsText] = useState('');
  const [insurance, setInsurance] = useState('BlueCross Care');
  const [insuranceNum, setInsuranceNum] = useState('');

  const calculateAge = (dobString: string) => {
    const birthday = new Date(dobString);
    const today = new Date('2026-10-06');
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return Math.max(1, age);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    // Parse allergies
    const parsedAllergies = allergiesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const isSevere = item.toLowerCase().includes('severe');
        return {
          allergen: item.replace(/\(.*\)/, '').trim(),
          severity: isSevere ? ('severe' as const) : ('moderate' as const),
          reaction: 'Reported allergic symptoms upon exposure',
        };
      });

    // Parse conditions
    const parsedConditions = conditionsText
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    // Parse medications
    const parsedMeds = medsText
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    addPatient({
      fullName,
      dob,
      age: calculateAge(dob),
      gender,
      bloodType,
      phone,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      address: address || '123 Medical Center Ave, Eugene, OR',
      emergencyContact: {
        name: emergencyName || 'Family Member',
        relationship: emergencyRel,
        phone: emergencyPhone || phone,
      },
      allergies: parsedAllergies,
      chronicConditions: parsedConditions,
      currentMedications: parsedMeds,
      primaryDoctorId: 'usr-1',
      insuranceProvider: insurance,
      insurancePolicyNumber: insuranceNum || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
      vitalsHistory: [],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Register New Patient</h2>
              <p className="text-xs text-slate-500">Create electronic medical record profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Section 1: Demographics */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2 text-teal-700">
              1. Patient Demographics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Johnathan Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Biological Sex</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2 text-teal-700">
              2. Contact & Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State, ZIP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2 text-teal-700">
              3. Emergency Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mary Smith"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Relationship</label>
                <input
                  type="text"
                  placeholder="e.g. Spouse / Parent"
                  value={emergencyRel}
                  onChange={(e) => setEmergencyRel(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) ..."
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Clinical History & Allergies */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2 text-teal-700">
              4. Clinical Cautions & History
            </h3>
            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Known Drug & Environmental Allergies (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin (severe), Sulfa drugs, Peanuts"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Chronic Diagnoses / Conditions (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Current Medications (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Metformin 500mg BID, Lisinopril 10mg Daily"
                  value={medsText}
                  onChange={(e) => setMedsText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Insurance */}
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2 text-teal-700">
              5. Insurance Coverage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Insurance Provider</label>
                <input
                  type="text"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Policy / Member ID</label>
                <input
                  type="text"
                  placeholder="e.g. BC-990-210"
                  value={insuranceNum}
                  onChange={(e) => setInsuranceNum(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
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
              Register Patient Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
