import {
  Patient,
  User,
  Appointment,
  Consultation,
  Prescription,
  LabTestOrder,
  InventoryItem,
  Invoice,
  Notification,
  AuditLog
} from '../types/clinic';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Dr. Maria Cristina Reyes, MD',
    email: 'maria.reyes@aurahealth.clinic',
    role: 'doctor',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    department: 'Internal Medicine',
    specialty: 'Internal Medicine & Endocrinology',
    licenseNumber: 'MD-892410'
  },
  {
    id: 'usr-2',
    name: 'Dr. Juan Miguel Santos, MD',
    email: 'juan.santos@aurahealth.clinic',
    role: 'doctor',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    department: 'Cardiology',
    specialty: 'Cardiovascular Medicine',
    licenseNumber: 'MD-741923'
  },
  {
    id: 'usr-3',
    name: 'Nurse Ana Patricia Villanueva, RN',
    email: 'ana.villanueva@aurahealth.clinic',
    role: 'nurse',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
    department: 'Outpatient Triage',
    licenseNumber: 'RN-382914'
  },
  {
    id: 'usr-4',
    name: 'Claire Mendoza',
    email: 'reception@aurahealth.clinic',
    role: 'receptionist',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    department: 'Front Desk & Patient Access'
  },
  {
    id: 'usr-5',
    name: 'Julian Dela Cruz, RPh',
    email: 'pharmacy@aurahealth.clinic',
    role: 'pharmacist',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    department: 'Clinic Pharmacy & Dispensary',
    licenseNumber: 'RPh-102948'
  },
  {
    id: 'usr-6',
    name: 'Amina Bautista, RMT',
    email: 'lab@aurahealth.clinic',
    role: 'lab_technician',
    avatar: 'https://images.unsplash.com/photo-1594824813682-beec138c5ec1?w=150&auto=format&fit=crop&q=80',
    department: 'Diagnostic Pathology & Laboratory',
    licenseNumber: 'RMT-559102'
  },
  {
    id: 'usr-7',
    name: 'Admin Smart Clinic',
    email: 'smartclinicrealacc@gmail.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    department: 'Clinical Operations Administration'
  },
  {
    id: 'usr-8',
    name: 'Elena Vargas (Patient)',
    email: 'elena.vargas@example.com',
    role: 'patient',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    department: 'Patient Portal'
  }
];
