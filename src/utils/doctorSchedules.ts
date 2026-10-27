import type { Appointment, User } from '../types/clinic';

export interface DoctorSchedule {
  doctorId: string;
  doctorName: string;
  department: string;
  specialty: string;
  workDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  workDaysLabel: string;
  hoursLabel: string;
  slots: string[]; // Fixed 30-min time slots in 'HH:mm' 24-hr format
}

/**
 * Individual clinical working schedules for each doctor:
 * - Dr. Santos: Monday–Friday 8:00 AM – 12:00 PM and 1:00 PM – 5:00 PM
 * - Dr. Reyes: Tuesday–Saturday 9:00 AM – 3:00 PM
 * - Dr. Gomez: Monday, Wednesday, Friday 10:00 AM – 4:00 PM
 * - Dr. Lee: Monday–Thursday 1:00 PM – 6:00 PM
 * - Dr. Tan: Wednesday–Saturday 8:00 AM – 1:00 PM
 */
export const DOCTOR_SCHEDULES: Record<string, DoctorSchedule> = {
  // Dr. Juan Miguel Santos, MD (Cardiology)
  'usr-2': {
    doctorId: 'usr-2',
    doctorName: 'Dr. Juan Miguel Santos, MD',
    department: 'Cardiology',
    specialty: 'Cardiovascular Medicine',
    workDays: [1, 2, 3, 4, 5], // Monday to Friday (Closed Sat & Sun)
    workDaysLabel: 'Monday – Friday',
    hoursLabel: '8:00 AM – 12:00 PM & 1:00 PM – 5:00 PM',
    slots: [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
    ],
  },

  // Dr. Maria Cristina Reyes, MD (Internal Medicine & Endocrinology)
  'usr-1': {
    doctorId: 'usr-1',
    doctorName: 'Dr. Maria Cristina Reyes, MD',
    department: 'Internal Medicine',
    specialty: 'Internal Medicine & Endocrinology',
    workDays: [2, 3, 4, 5, 6], // Tuesday to Saturday (Closed Sun & Mon)
    workDaysLabel: 'Tuesday – Saturday',
    hoursLabel: '9:00 AM – 3:00 PM',
    slots: [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
    ],
  },

  // Dr. Patricia Gomez, MD (Pediatrics & Adolescent Medicine)
  'usr-9': {
    doctorId: 'usr-9',
    doctorName: 'Dr. Patricia Gomez, MD',
    department: 'Pediatrics',
    specialty: 'Pediatrics & Adolescent Care',
    workDays: [1, 3, 5], // Monday, Wednesday, Friday
    workDaysLabel: 'Monday, Wednesday, Friday',
    hoursLabel: '10:00 AM – 4:00 PM',
    slots: [
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
    ],
  },

  // Dr. Anthony Lee, MD (Dermatology & Skin Clinic)
  'usr-10': {
    doctorId: 'usr-10',
    doctorName: 'Dr. Anthony Lee, MD',
    department: 'Dermatology',
    specialty: 'Clinical & Cosmetic Dermatology',
    workDays: [1, 2, 3, 4], // Monday to Thursday
    workDaysLabel: 'Monday – Thursday',
    hoursLabel: '1:00 PM – 6:00 PM',
    slots: [
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
    ],
  },

  // Dr. Roberto Tan, MD (Pulmonology & Respiratory Care)
  'usr-11': {
    doctorId: 'usr-11',
    doctorName: 'Dr. Roberto Tan, MD',
    department: 'Pulmonology',
    specialty: 'Pulmonology & Respiratory Medicine',
    workDays: [3, 4, 5, 6], // Wednesday to Saturday
    workDaysLabel: 'Wednesday – Saturday',
    hoursLabel: '8:00 AM – 1:00 PM',
    slots: [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
    ],
  },

  // Dr. Sofia Ramos, MD (Neurology & Neurovascular Care)
  'usr-12': {
    doctorId: 'usr-12',
    doctorName: 'Dr. Sofia Ramos, MD',
    department: 'Neurology',
    specialty: 'Neurology',
    workDays: [1, 2, 4, 5], // Monday, Tuesday, Thursday, Friday
    workDaysLabel: 'Monday, Tuesday, Thursday, Friday',
    hoursLabel: '9:00 AM – 3:00 PM',
    slots: [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
    ],
  },

  // Dr. Gabriel Castro, MD (Orthopedics & Sports Medicine)
  'usr-13': {
    doctorId: 'usr-13',
    doctorName: 'Dr. Gabriel Castro, MD',
    department: 'Orthopedics',
    specialty: 'Orthopedics',
    workDays: [1, 3, 5], // Monday, Wednesday, Friday
    workDaysLabel: 'Monday, Wednesday, Friday',
    hoursLabel: '8:00 AM – 2:00 PM',
    slots: [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '13:00',
      '13:30',
    ],
  },

  // Dr. Elena Torres, MD (Obstetrics & Gynecology)
  'usr-14': {
    doctorId: 'usr-14',
    doctorName: 'Dr. Elena Torres, MD',
    department: 'Obstetrics & Gynecology',
    specialty: 'Obstetrics & Gynecology',
    workDays: [2, 3, 4, 6], // Tuesday, Wednesday, Thursday, Saturday
    workDaysLabel: 'Tuesday – Thursday, Saturday',
    hoursLabel: '10:00 AM – 4:00 PM',
    slots: [
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
    ],
  },
};

export const DEFAULT_DOCTOR_SCHEDULE: Omit<DoctorSchedule, 'doctorId' | 'doctorName'> = {
  department: 'General Outpatient Clinic',
  specialty: 'Family & Internal Medicine',
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
  workDaysLabel: 'Monday – Friday',
  hoursLabel: '9:00 AM – 4:00 PM',
  slots: [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
  ],
};

/**
 * Retrieve the individual working schedule for a doctor.
 * Matches by ID or name substring.
 */
export function getDoctorSchedule(doctorId: string, fallbackUser?: User): DoctorSchedule {
  if (doctorId && DOCTOR_SCHEDULES[doctorId]) {
    return DOCTOR_SCHEDULES[doctorId];
  }

  // Lookup by name if id format varies or custom doctor
  const queryName = (fallbackUser?.name || doctorId || '').toLowerCase();
  const foundByName = Object.values(DOCTOR_SCHEDULES).find((s) => {
    const sName = s.doctorName.toLowerCase();
    return (
      s.doctorId === doctorId ||
      sName.includes(queryName) ||
      queryName.includes(sName) ||
      (queryName.includes('santos') && s.doctorId === 'usr-2') ||
      (queryName.includes('reyes') && s.doctorId === 'usr-1') ||
      (queryName.includes('gomez') && s.doctorId === 'usr-9') ||
      (queryName.includes('lee') && s.doctorId === 'usr-10') ||
      (queryName.includes('tan') && s.doctorId === 'usr-11') ||
      (queryName.includes('ramos') && s.doctorId === 'usr-12') ||
      (queryName.includes('castro') && s.doctorId === 'usr-13') ||
      (queryName.includes('torres') && s.doctorId === 'usr-14')
    );
  });

  if (foundByName) return foundByName;

  return {
    doctorId: doctorId || 'usr-1',
    doctorName: fallbackUser?.name || 'Attending Physician',
    department: fallbackUser?.department || DEFAULT_DOCTOR_SCHEDULE.department,
    specialty: fallbackUser?.specialty || DEFAULT_DOCTOR_SCHEDULE.specialty,
    workDays: DEFAULT_DOCTOR_SCHEDULE.workDays,
    workDaysLabel: DEFAULT_DOCTOR_SCHEDULE.workDaysLabel,
    hoursLabel: DEFAULT_DOCTOR_SCHEDULE.hoursLabel,
    slots: DEFAULT_DOCTOR_SCHEDULE.slots,
  };
}

/**
 * Check if a doctor is working on a given date (YYYY-MM-DD)
 */
export function isDoctorWorkingOnDate(doctorId: string, dateStr: string): boolean {
  if (!dateStr) return false;
  const schedule = getDoctorSchedule(doctorId);
  // Parse YYYY-MM-DD cleanly in local timezone
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();
  return schedule.workDays.includes(dayOfWeek);
}

/**
 * Formats a 24-hr time string ('HH:mm') to 'h:mm AM/PM'
 */
export function formatTimeSlot(timeStr: string): string {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return timeStr;
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${ampm}`;
}

export interface SlotAvailability {
  slot: string;
  formatted: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookedAppointment?: Appointment;
}

/**
 * Compute the slot availability for a doctor on a specific date.
 * Times outside the doctor's personal schedule are NOT returned.
 * Slots booked by other patients are marked unavailable (prevent double booking).
 */
export function getDoctorSlotAvailability(
  doctorId: string,
  dateStr: string,
  appointments: Appointment[],
  excludeAppointmentId?: string
): SlotAvailability[] {
  if (!doctorId || !dateStr) return [];

  const isWorking = isDoctorWorkingOnDate(doctorId, dateStr);
  if (!isWorking) {
    return []; // Doctor is off; no slots available
  }

  const schedule = getDoctorSchedule(doctorId);

  // Find all active booked appointments for this doctor on this date
  const bookedOnDate = appointments.filter((a) => {
    if (a.date !== dateStr) return false;
    if (a.status === 'Cancelled') return false;
    if (excludeAppointmentId && a.id === excludeAppointmentId) return false;

    const matchesId = a.doctorId === doctorId || a.doctorId === schedule.doctorId;
    const matchesName =
      a.doctorName &&
      (a.doctorName.toLowerCase().includes(schedule.doctorName.toLowerCase()) ||
        schedule.doctorName.toLowerCase().includes(a.doctorName.toLowerCase()));

    return matchesId || matchesName;
  });

  const bookedMap = new Map<string, Appointment>();
  bookedOnDate.forEach((a) => {
    bookedMap.set(a.time, a);
  });

  return schedule.slots.map((slot) => {
    const bookedAppointment = bookedMap.get(slot);
    const isBooked = !!bookedAppointment;
    return {
      slot,
      formatted: formatTimeSlot(slot),
      isAvailable: !isBooked,
      isBooked,
      bookedAppointment,
    };
  });
}

/**
 * In-memory and persisted dynamic schedules for newly added doctors
 */
export function registerDoctorSchedule(doctorId: string, schedule: DoctorSchedule) {
  DOCTOR_SCHEDULES[doctorId] = schedule;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('smart_clinic_custom_schedules');
      const map = saved ? JSON.parse(saved) : {};
      map[doctorId] = schedule;
      localStorage.setItem('smart_clinic_custom_schedules', JSON.stringify(map));
    }
  } catch {}
}

/**
 * Constructs and registers a DoctorSchedule from custom days and hours
 */
export function createCustomDoctorSchedule(params: {
  doctorId: string;
  doctorName: string;
  department: string;
  specialty: string;
  workDays: number[];
  workDaysLabel?: string;
  hoursLabel?: string;
  startHour?: number;
  endHour?: number;
}): DoctorSchedule {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const workDaysLabel =
    params.workDaysLabel ||
    (params.workDays.length === 5 && params.workDays.every((d, i) => d === i + 1)
      ? 'Monday – Friday'
      : params.workDays.length === 5 && params.workDays[0] === 2
      ? 'Tuesday – Saturday'
      : params.workDays.map((d) => dayNames[d]).join(', '));

  const startHour = params.startHour || 8;
  const endHour = params.endHour || 17;
  const hoursLabel =
    params.hoursLabel ||
    `${startHour > 12 ? startHour - 12 : startHour}:00 ${startHour >= 12 ? 'PM' : 'AM'} – ${
      endHour > 12 ? endHour - 12 : endHour
    }:00 ${endHour >= 12 ? 'PM' : 'AM'}`;

  // Generate 30-min slots
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    // Standard 12:00-13:00 lunch gap if full-day 8-17
    if (h === 12 && endHour >= 16 && startHour <= 9) continue;
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }

  const schedule: DoctorSchedule = {
    doctorId: params.doctorId,
    doctorName: params.doctorName,
    department: params.department,
    specialty: params.specialty,
    workDays: params.workDays,
    workDaysLabel,
    hoursLabel,
    slots,
  };

  registerDoctorSchedule(params.doctorId, schedule);
  return schedule;
}

// On module load in browser, hydrate custom schedules from localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const saved = localStorage.getItem('smart_clinic_custom_schedules');
    if (saved) {
      const map = JSON.parse(saved);
      Object.assign(DOCTOR_SCHEDULES, map);
    }
  } catch {}
}
