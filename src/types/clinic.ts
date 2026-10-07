export type UserRole = 
  | 'admin'
  | 'doctor'
  | 'nurse'
  | 'receptionist'
  | 'pharmacist'
  | 'lab_technician'
  | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  specialty?: string;
  licenseNumber?: string;
}

export interface Vitals {
  id?: string;
  recordedAt: string;
  recordedBy: string;
  bloodPressureSystolic: number; // mmHg
  bloodPressureDiastolic: number; // mmHg
  heartRate: number; // bpm
  respiratoryRate: number; // breaths/min
  temperature: number; // °C
  oxygenSaturation: number; // %
  height: number; // cm
  weight: number; // kg
  bmi: number; // kg/m²
  notes?: string;
}

export interface Allergy {
  allergen: string;
  severity: 'mild' | 'moderate' | 'severe';
  reaction: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. MRN-2026-081
  fullName: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  allergies: Allergy[];
  chronicConditions: string[];
  currentMedications: string[];
  primaryDoctorId: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  createdAt: string;
  vitalsHistory: Vitals[];
  tags?: string[];
}

export type AppointmentStatus =
  | 'Scheduled'
  | 'Confirmed'
  | 'Checked In'
  | 'In Consultation'
  | 'Completed'
  | 'Cancelled'
  | 'No Show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  reason: string;
  status: AppointmentStatus;
  type: 'In-Person' | 'Telehealth' | 'Follow-up' | 'Emergency';
  queueNumber?: string;
  room?: string;
  notes?: string;
  createdAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  genericName: string;
  dosage: string;
  frequency: string; // e.g. "Twice daily after meals"
  route: 'Oral' | 'Sublingual' | 'Topical' | 'Inhalation' | 'Intravenous' | 'Intramuscular';
  duration: string; // e.g. "7 days"
  quantity: number;
  instructions: string;
  dispensed?: boolean;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientAge: number;
  patientGender: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorLicense: string;
  consultationId?: string;
  date: string;
  items: PrescriptionItem[];
  status: 'Active' | 'Dispensed' | 'Partially Dispensed' | 'Discontinued';
  aiSafetyAudit?: {
    checkedAt: string;
    warnings: string[];
    safe: boolean;
  };
  notes?: string;
}

export interface LabTestOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  doctorId: string;
  doctorName: string;
  consultationId?: string;
  testName: string;
  category: 'Hematology' | 'Biochemistry' | 'Microbiology' | 'Endocrinology' | 'Urinalysis' | 'Imaging';
  urgency: 'Routine' | 'Urgent' | 'STAT';
  status: 'Requested' | 'Sample Collected' | 'Processing' | 'Result Available' | 'Reviewed';
  requestedAt: string;
  collectedAt?: string;
  completedAt?: string;
  notes?: string;
  results?: LabResultItem[];
  interpretation?: string;
  aiSummary?: string;
}

export interface LabResultItem {
  parameter: string;
  value: string | number;
  unit: string;
  referenceRange: string;
  flag: 'Normal' | 'High' | 'Low' | 'Critical';
}

export interface Consultation {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems?: string;
  physicalExamination: string;
  vitals?: Vitals;
  diagnoses: {
    code: string; // ICD code
    description: string;
    type: 'Primary' | 'Secondary';
  }[];
  treatmentPlan: string;
  prescriptionsCreated?: string[]; // IDs
  labOrdersCreated?: string[]; // IDs
  followUpDate?: string;
  followUpInstructions?: string;
  referral?: {
    specialty: string;
    reason: string;
    facility?: string;
  };
  medicalCertificateIssued?: boolean;
  certificateDetails?: {
    diagnosis: string;
    leaveStartDate: string;
    leaveEndDate: string;
    recommendation: string;
  };
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  genericName: string;
  brand: string;
  category: 'Antibiotics' | 'Analgesics' | 'Cardiovascular' | 'Antidiabetic' | 'Respiratory' | 'Vitamins' | 'Medical Supplies';
  batchNumber: string;
  expirationDate: string;
  supplier: string;
  stockQuantity: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  unit: 'Tablets' | 'Capsules' | 'Bottles' | 'Vials' | 'Boxes' | 'Packs';
  location: string;
  lastUpdated: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Laboratory' | 'Pharmacy' | 'Procedure' | 'Other';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'Unpaid' | 'Partially Paid' | 'Paid' | 'Cancelled';
  paymentMethod?: 'Cash' | 'Credit Card' | 'Debit Card' | 'Insurance' | 'Bank Transfer';
  paymentDate?: string;
  insuranceClaimStatus?: 'Not Filed' | 'Pending' | 'Approved' | 'Rejected';
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'appointment' | 'lab' | 'prescription' | 'inventory' | 'billing' | 'system';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resourceType: 'Patient' | 'Appointment' | 'Consultation' | 'Prescription' | 'Laboratory' | 'Inventory' | 'Billing' | 'Security' | 'System';
  resourceId: string;
  description: string;
  ipAddress?: string;
}
