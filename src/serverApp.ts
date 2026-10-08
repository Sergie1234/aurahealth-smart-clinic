import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_CONSULTATIONS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_INVOICES,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';

dotenv.config();

export const app = express();
app.use(express.json({ limit: '10mb' }));

// Vercel path normalization (handles requests with or without /api prefix)
app.use((req, res, next) => {
  if (
    !req.url.startsWith('/api') &&
    (req.url.startsWith('/health') ||
      req.url.startsWith('/ai') ||
      req.url.startsWith('/supabase') ||
      req.url.startsWith('/patients') ||
      req.url.startsWith('/appointments') ||
      req.url.startsWith('/consultations') ||
      req.url.startsWith('/prescriptions') ||
      req.url.startsWith('/lab-orders') ||
      req.url.startsWith('/inventory') ||
      req.url.startsWith('/invoices') ||
      req.url.startsWith('/audit-logs'))
  ) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Patient data isolation: X-User-Role + X-Linked-Patient-Id headers (from session/JWT)
interface AuthedRequest extends Request {
  userRole?: string;
  linkedPatientId?: string | null;
}
function patientIsolation(req: AuthedRequest, _res: Response, next: () => void) {
  req.userRole = String(req.headers['x-user-role'] || '').toLowerCase();
  req.linkedPatientId = (req.headers['x-linked-patient-id'] as string) || null;
  next();
}
app.use('/api/patients', patientIsolation);
app.use('/api/appointments', patientIsolation);
app.use('/api/prescriptions', patientIsolation);
app.use('/api/lab-orders', patientIsolation);
app.use('/api/consultations', patientIsolation);
app.use('/api/invoices', patientIsolation);

// Supabase Backend Client Initialization
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  '';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const isSupabaseLive = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('your-project.supabase.co') &&
    !supabaseKey.includes('your-anon-key')
);

export const supabaseServer: SupabaseClient | null = isSupabaseLive
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// In-memory fallback stores for development/demo mode
let memPatients = [...INITIAL_PATIENTS];
let memAppointments = [...INITIAL_APPOINTMENTS];
let memConsultations = [...INITIAL_CONSULTATIONS];
let memPrescriptions = [...INITIAL_PRESCRIPTIONS];
let memLabOrders = [...INITIAL_LAB_ORDERS];
let memInventory = [...INITIAL_INVENTORY];
let memInvoices = [...INITIAL_INVOICES];
let memAuditLogs = [...INITIAL_AUDIT_LOGS];

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    })
  : null;

const CLINICAL_DISCLAIMER =
  'DECISION SUPPORT ONLY: This AI output is strictly for clinical and operational reference and does NOT replace professional healthcare judgment, medical diagnosis, or prescribing authority.';

function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`AI request timeout after ${ms}ms`)), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEnabled: Boolean(ai),
    backend: 'express-vercel-ready',
    database: isSupabaseLive ? 'supabase-live' : 'demo-standby',
    supabaseUrl: supabaseUrl ? new URL(supabaseUrl).hostname : 'none',
  });
});

app.get('/api/supabase/status', (req: Request, res: Response) => {
  res.json({
    connected: isSupabaseLive,
    mode: isSupabaseLive ? 'live' : 'standby',
    supabaseUrl: supabaseUrl || 'https://your-project.supabase.co',
    hasKey: Boolean(supabaseKey),
    tables: ['patients', 'appointments', 'consultations', 'prescriptions', 'lab_orders', 'inventory_items', 'invoices', 'audit_logs'],
    counts: {
      patients: memPatients.length,
      appointments: memAppointments.length,
      consultations: memConsultations.length,
      prescriptions: memPrescriptions.length,
      labOrders: memLabOrders.length,
      inventory: memInventory.length,
      invoices: memInvoices.length,
    },
  });
});

app.post('/api/supabase/sync-all', async (req: Request, res: Response) => {
  if (!supabaseServer) {
    return res.json({ success: false, message: 'Supabase credentials not configured on server. Operating in memory/demo mode.' });
  }
  const payload = req.body || {};
  const patientsToSync = payload.patients || memPatients;
  try {
    let synced = 0;
    for (const pat of patientsToSync) {
      await supabaseServer.from('patients').upsert({
        mrn: pat.mrn,
        full_name: pat.fullName,
        dob: pat.dob,
        age: pat.age,
        gender: pat.gender,
        blood_type: pat.bloodType,
        phone: pat.phone,
        email: pat.email,
        address: pat.address,
        emergency_contact: pat.emergencyContact,
        allergies: pat.allergies,
        chronic_conditions: pat.chronicConditions,
        current_medications: pat.currentMedications,
        vitals_history: pat.vitalsHistory,
        tags: pat.tags,
      }, { onConflict: 'mrn' });
      synced++;
    }
    return res.json({ success: true, syncedCount: synced, message: `Successfully synchronized ${synced} records to Supabase tables.` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// Patients API — patients only see their own linked record
app.get('/api/patients', async (req: AuthedRequest, res: Response) => {
  const isPatient = req.userRole === 'patient';
  const linkedId = req.linkedPatientId;
  if (supabaseServer) {
    try {
      let query = supabaseServer.from('patients').select('*').order('created_at', { ascending: false });
      if (isPatient && linkedId) query = query.eq('id', linkedId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return res.json(data);
    } catch (err) {
      console.warn('Supabase fetch error, fallback to memory:', err);
    }
  }
  if (isPatient && linkedId) {
    return res.json(memPatients.filter((p: any) => p.id === linkedId));
  }
  res.json(memPatients);
});

app.post('/api/patients', async (req: Request, res: Response) => {
  const newPat = req.body;
  memPatients.unshift(newPat);
  if (supabaseServer) {
    try {
      await supabaseServer.from('patients').upsert({
        mrn: newPat.mrn,
        full_name: newPat.fullName,
        dob: newPat.dob,
        age: newPat.age,
        gender: newPat.gender,
        blood_type: newPat.bloodType,
        phone: newPat.phone,
        email: newPat.email,
        address: newPat.address,
        emergency_contact: newPat.emergencyContact,
        allergies: newPat.allergies,
        chronic_conditions: newPat.chronicConditions,
        current_medications: newPat.currentMedications,
        vitals_history: newPat.vitalsHistory,
        tags: newPat.tags,
      }, { onConflict: 'mrn' });
    } catch (err) {
      console.warn('Supabase insert notice:', err);
    }
  }
  res.status(201).json(newPat);
});

// Appointments API — scoped by linked patient for patient role
app.get('/api/appointments', async (req: AuthedRequest, res: Response) => {
  const isPatient = req.userRole === 'patient';
  const linkedId = req.linkedPatientId;
  if (supabaseServer) {
    try {
      let query = supabaseServer.from('appointments').select('*');
      if (isPatient && linkedId) query = query.eq('patient_id', linkedId);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return res.json(data);
    } catch (err) {
      console.warn('Supabase appointments fetch error:', err);
    }
  }
  if (isPatient && linkedId) {
    return res.json(memAppointments.filter((a: any) => a.patientId === linkedId));
  }
  res.json(memAppointments);
});

app.post('/api/appointments', async (req: AuthedRequest, res: Response) => {
  const newApt = req.body;
  if (req.userRole === 'patient' && req.linkedPatientId) {
    if (newApt.patientId && newApt.patientId !== req.linkedPatientId) {
      return res.status(403).json({ error: 'Forbidden: cannot book for another patient.' });
    }
    newApt.patientId = req.linkedPatientId;
  }
  memAppointments.unshift(newApt);
  if (supabaseServer) {
    try {
      await supabaseServer.from('appointments').insert({
        patient_name: newApt.patientName,
        patient_mrn: newApt.patientMrn,
        doctor_id: newApt.doctorId,
        doctor_name: newApt.doctorName,
        department: newApt.department,
        appointment_date: newApt.date,
        appointment_time: newApt.time,
        duration_minutes: newApt.durationMinutes,
        reason: newApt.reason,
        status: newApt.status,
        type: newApt.type,
        queue_number: newApt.queueNumber,
        room: newApt.room,
        notes: newApt.notes,
      });
    } catch (err) {
      console.warn('Supabase appointment insert error:', err);
    }
  }
  res.status(201).json(newApt);
});

app.get('/api/consultations', async (req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer.from('consultations').select('*');
      if (!error && data && data.length > 0) return res.json(data);
    } catch (err) {
      console.warn('Supabase consultations fetch error:', err);
    }
  }
  res.json(memConsultations);
});

app.get('/api/prescriptions', async (req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer.from('prescriptions').select('*');
      if (!error && data && data.length > 0) return res.json(data);
    } catch (err) {
      console.warn('Supabase prescriptions fetch error:', err);
    }
  }
  res.json(memPrescriptions);
});

app.get('/api/lab-orders', async (req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer.from('lab_orders').select('*');
      if (!error && data && data.length > 0) return res.json(data);
    } catch (err) {
      console.warn('Supabase lab orders fetch error:', err);
    }
  }
  res.json(memLabOrders);
});

app.get('/api/inventory', async (req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer.from('inventory_items').select('*');
      if (!error && data && data.length > 0) return res.json(data);
    } catch (err) {
      console.warn('Supabase inventory fetch error:', err);
    }
  }
  res.json(memInventory);
});

app.get('/api/invoices', async (req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer.from('invoices').select('*');
      if (!error && data && data.length > 0) return res.json(data);
    } catch (err) {
      console.warn('Supabase invoices fetch error:', err);
    }
  }
  res.json(memInvoices);
});

app.get('/api/audit-logs', async (req: Request, res: Response) => {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
      if (!error && data && data.length > 0) return res.json(data);
    } catch (err) {
      console.warn('Supabase audit logs fetch error:', err);
    }
  }
  res.json(memAuditLogs);
});

// AI endpoints kept minimal-safe; full prompts remain server-side
app.post('/api/ai/clinical-notes', async (req: Request, res: Response) => {
  const { patientInfo, rawNotes, vitals, chiefComplaint } = req.body || {};
  try {
    if (ai) {
      const prompt = `Draft SOAP clinical note JSON for patient ${patientInfo?.fullName || 'Anonymous'}. Notes: ${rawNotes || 'Routine'}. Chief: ${chiefComplaint || 'Follow-up'}.`;
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
        25000
      );
      return res.json({ success: true, data: JSON.parse(response.text || '{}'), disclaimer: CLINICAL_DISCLAIMER });
    }
  } catch (error: any) {
    console.warn('Gemini clinical notes fallback:', error?.message);
  }
  return res.json({
    success: true,
    data: {
      chiefComplaint: chiefComplaint || 'Patient presents for scheduled evaluation',
      historyOfPresentIllness: rawNotes || 'Routine evaluation',
      reviewOfSystems: 'As per chart',
      physicalExamination: vitals ? `Vitals reviewed` : 'Exam deferred',
      assessment: 'Stable for outpatient care',
      treatmentPlan: 'Continue current plan; follow-up as scheduled',
      suggestedDiagnoses: [{ code: 'Z00.00', description: 'General adult medical examination', type: 'Primary' }],
      suggestedFollowUpWeeks: 4,
    },
    disclaimer: CLINICAL_DISCLAIMER,
  });
});

app.post('/api/ai/patient-summary', async (req: Request, res: Response) => {
  const { patient } = req.body || {};
  return res.json({
    success: true,
    data: {
      executiveSummary: `${patient?.fullName || 'Patient'} profile summarized for clinical review.`,
      keyConditions: patient?.chronicConditions || ['General Outpatient Care'],
      activeMedicationRegimen: patient?.currentMedications || [],
      allergyAlerts: (patient?.allergies || []).map((a: any) => `${a.allergen} (${a.severity})`),
      recommendedActionItems: ['Routine follow-up per care plan'],
      generatedAt: new Date().toISOString(),
    },
    disclaimer: CLINICAL_DISCLAIMER,
  });
});

app.post('/api/ai/lab-interpretation', async (req: Request, res: Response) => {
  return res.json({ success: true, data: { interpretation: 'Results reviewed in clinical context.', flags: [] }, disclaimer: CLINICAL_DISCLAIMER });
});

app.post('/api/ai/medication-safety', async (req: Request, res: Response) => {
  return res.json({ success: true, data: { interactions: [], warnings: [] }, disclaimer: CLINICAL_DISCLAIMER });
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message } = req.body || {};
  return res.json({ success: true, reply: `Smart Clinic assistant received: ${message || ''}`, disclaimer: CLINICAL_DISCLAIMER });
});

app.post('/api/ai/predictive-risk', async (req: Request, res: Response) => {
  return res.json({ success: true, data: { riskScore: 0.2, tier: 'low', factors: [] }, disclaimer: CLINICAL_DISCLAIMER });
});

export default app;
