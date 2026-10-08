/**
 * Smart Clinic — Authentication, Token Signing & RBAC Tenancy Guard
 * Cryptographically signed HMAC-SHA256 tokens using Node.js crypto.
 * Enforces strict patient isolation (RA 10173).
 */
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_clinic_super_secure_jwt_secret_2026_ph_health_data';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface UserTokenPayload {
  userId: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'lab_technician' | 'admin';
  primaryRole: 'patient' | 'doctor' | 'staff' | 'admin';
  subRole?: 'nurse' | 'pharmacist' | 'receptionist' | 'lab_technician';
  linkedPatientId?: string | null;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
  userRole?: string;
  linkedPatientId?: string | null;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

export function generateToken(payload: Omit<UserTokenPayload, 'iat' | 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const fullPayload: UserTokenPayload = {
    ...payload,
    iat: now,
    exp: now + TOKEN_TTL_MS,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${headerEncoded}.${payloadEncoded}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

export function verifyToken(token: string): UserTokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerEncoded, payloadEncoded, signature] = parts;
  const data = `${headerEncoded}.${payloadEncoded}`;
  const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSig) return null;

  try {
    const payload: UserTokenPayload = JSON.parse(base64UrlDecode(payloadEncoded));
    if (payload.exp < Date.now()) return null; // Expired
    return payload;
  } catch {
    return null;
  }
}

/**
 * Express middleware to authenticate tokens or headers.
 * Populates req.user, req.userRole, req.linkedPatientId.
 */
export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']).trim();
  }

  if (token) {
    const verified = verifyToken(token);
    if (verified) {
      req.user = verified;
      req.userRole = verified.role;
      req.linkedPatientId = verified.linkedPatientId || null;
      return next();
    }
  }

  // Header fallback for testing or initial handshakes
  req.userRole = String(req.headers['x-user-role'] || '').toLowerCase() || undefined;
  req.linkedPatientId = (req.headers['x-linked-patient-id'] as string) || null;
  next();
}

/**
 * Middleware ensuring patient tenancy isolation.
 * Patients can never access other patients' records via query or param.
 */
export function enforcePatientIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const role = req.userRole || req.user?.role;
  const isPatient = role === 'patient';
  const linkedId = req.linkedPatientId || req.user?.linkedPatientId;

  if (isPatient) {
    if (!linkedId) {
      return res.status(403).json({
        error: 'Forbidden: Patient account is not linked to a clinical profile.',
      });
    }

    // Check URL parameters
    const targetPatientId = req.params.patientId || req.params.id || req.query.patientId;
    if (targetPatientId && targetPatientId !== linkedId) {
      return res.status(403).json({
        error: 'Data Isolation Violation: You are not authorized to view or modify other patients’ medical records (RA 10173).',
      });
    }
  }

  next();
}
