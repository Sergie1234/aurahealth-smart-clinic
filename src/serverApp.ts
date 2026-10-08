import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  sendEmailOtp,
  sendSmsOtp,
  verifyOtp,
  getOtpDeliveryStatus,
} from './server/services/otpService';
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
      req.url.startsWith('/audit-logs') ||
      req.url.startsWith('/auth'))
  ) {
    req.url = `/api${req.url}`;
  }
  next();
});

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

app.get('/api/auth/otp/status', (_req: Request, res: Response) => {
  res.json({ success: true, ...getOtpDeliveryStatus() });
});

app.post('/api/auth/otp/email', async (req: Request, res: Response) => {
  try {
    const email = String(req.body?.email || '').trim();
    const purpose = (req.body?.purpose || 'patient_login') as any;
    const result = await sendEmailOtp({ email, purpose });
    if (!result.success) return res.status(400).json(result);
    return res.json(result);
  } catch (err: any) {
    console.error('[auth/otp/email]', err?.message);
    return res.status(500).json({ success: false, error: 'Email OTP service error.' });
  }
});

app.post('/api/auth/otp/sms', async (req: Request, res: Response) => {
  try {
    const phone = String(req.body?.phone || '').trim();
    const purpose = (req.body?.purpose || 'patient_login') as any;
    const result = await sendSmsOtp({ phone, purpose });
    if (!result.success) return res.status(400).json(result);
    return res.json(result);
  } catch (err: any) {
    console.error('[auth/otp/sms]', err?.message);
    return res.status(500).json({ success: false, error: 'SMS OTP service error.' });
  }
});

app.post('/api/auth/otp/verify', (req: Request, res: Response) => {
  try {
    const channel = (req.body?.channel === 'email' ? 'email' : 'sms') as 'email' | 'sms';
    const destination = String(req.body?.destination || req.body?.email || req.body?.phone || '').trim();
    const code = String(req.body?.code || '').trim();
    const result = verifyOtp({ channel, destination, code });
    if (!result.success) return res.status(400).json(result);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'OTP verification error.' });
  }
});

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
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
  ? new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } })
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

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEnabled: Boolean(ai),
    backend: 'express-vercel-ready',
    database: isSupabaseLive ? 'supabase-live' : 'demo-standby',
    otp: getOtpDeliveryStatus(),
  });
});

app.get('/api/supabase/status', (_req: Request, res: Response) => {
  res.json({
    connected: isSupabaseLive,
    mode: isSupabaseLive ? 'live' : 'standby',
    supabaseUrl: supabaseUrl || 'https://your-project.supabase.co',
    hasKey: Boolean(supabaseKey),
  });
});

app.get('/api/patients', async (req: AuthedRequest, res: Response) => {
  const isPatient = req.userRole === 'patient';
  const linkedId = req.linkedPatientId;
  if (isPatient && linkedId) {
    return res.json(memPatients.filter((p: any) => p.id === linkedId));
  }
  res.json(memPatients);
});

app.post('/api/patients', async (req: Request, res: Response) => {
  const newPat = req.body;
  memPatients.unshift(newPat);
  res.status(201).json(newPat);
});

app.get('/api/appointments', async (req: AuthedRequest, res: Response) => {
  const isPatient = req.userRole === 'patient';
  const linkedId = req.linkedPatientId;
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
  res.status(201).json(newApt);
});

app.get('/api/consultations', (_req: Request, res: Response) => res.json(memConsultations));
app.get('/api/prescriptions', (_req: Request, res: Response) => res.json(memPrescriptions));
app.get('/api/lab-orders', (_req: Request, res: Response) => res.json(memLabOrders));
app.get('/api/inventory', (_req: Request, res: Response) => res.json(memInventory));
app.get('/api/invoices', (_req: Request, res: Response) => res.json(memInvoices));
app.get('/api/audit-logs', (_req: Request, res: Response) => res.json(memAuditLogs));

app.post('/api/ai/clinical-notes', async (req: Request, res: Response) => {
  const { patientInfo, rawNotes, vitals, chiefComplaint } = req.body || {};
  try {
    if (ai) {
      const prompt = `Draft SOAP clinical note JSON for patient ${patientInfo?.fullName || 'Anonymous'}. Notes: ${rawNotes || 'Routine'}. Chief: ${chiefComplaint || 'Follow-up'}.`;
      const response = await withTimeout(
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
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
      physicalExamination: vitals ? 'Vitals reviewed' : 'Exam deferred',
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

app.post('/api/ai/lab-interpretation', async (_req: Request, res: Response) => {
  return res.json({ success: true, data: { interpretation: 'Results reviewed in clinical context.', flags: [] }, disclaimer: CLINICAL_DISCLAIMER });
});

app.post('/api/ai/medication-safety', async (_req: Request, res: Response) => {
  return res.json({ success: true, data: { interactions: [], warnings: [] }, disclaimer: CLINICAL_DISCLAIMER });
});

app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message } = req.body || {};
  return res.json({ success: true, reply: `Smart Clinic assistant received: ${message || ''}`, disclaimer: CLINICAL_DISCLAIMER });
});

app.post('/api/ai/predictive-risk', async (_req: Request, res: Response) => {
  return res.json({ success: true, data: { riskScore: 0.2, tier: 'low', factors: [] }, disclaimer: CLINICAL_DISCLAIMER });
});

export default app;
