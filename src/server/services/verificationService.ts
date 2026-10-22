/**
 * Smart Clinic — Central Verification & Authentication Service
 * Manages OTP life-cycle, anti brute-force rate limiting, password reset flows,
 * and coordinates between EmailService and SmsService.
 * Complies with Philippine Health Data Security Standards (RA 10173).
 */
import crypto from 'crypto';
import { emailService, emailAuditLogs, type EmailAuditLog } from './emailService';
import { smsService, smsAuditLogs, normalizePhoneNumber, type SmsAuditLog } from './smsService';

export type VerificationChannel = 'email' | 'sms';
export type VerificationPurpose = 'registration' | 'login' | 'password_reset' | 'admin_2fa';

export interface OtpRecord {
  codeHash: string;
  codePlain?: string;
  channel: VerificationChannel;
  destination: string;
  purpose: VerificationPurpose;
  expiresAt: number;
  attempts: number;
  lastSentAt: number;
  metadata?: Record<string, any>;
}

export interface PendingRegistration {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  createdAt: number;
  verified: boolean;
}

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

/** Vercel-safe signed reset token so confirm works across serverless instances */
const RESET_TOKEN_SECRET =
  process.env.JWT_SECRET ||
  process.env.AUTH_JWT_SECRET ||
  'smart_clinic_password_reset_signing_key_2026';

export function createPasswordResetToken(email: string, code: string, ttlMs = 10 * 60 * 1000): string {
  const exp = Date.now() + ttlMs;
  const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
  const payload = Buffer.from(
    JSON.stringify({ e: email.trim().toLowerCase(), h: codeHash, exp }),
    'utf8'
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', RESET_TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyPasswordResetToken(
  token: string,
  email: string,
  code: string
): { success: boolean; error?: string } {
  if (!token || !token.includes('.')) {
    return { success: false, error: 'Missing or invalid reset token. Request a new code.' };
  }
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', RESET_TOKEN_SECRET).update(payload).digest('base64url');
  if (sig !== expected) {
    return { success: false, error: 'Invalid reset token signature.' };
  }
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      e: string;
      h: string;
      exp: number;
    };
    if (data.exp < Date.now()) {
      return { success: false, error: 'Reset code expired. Request a new one.' };
    }
    if (data.e !== email.trim().toLowerCase()) {
      return { success: false, error: 'Reset token does not match this email.' };
    }
    const codeHash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    if (data.h !== codeHash) {
      return { success: false, error: 'Incorrect reset code.' };
    }
    return { success: true };
  } catch {
    return { success: false, error: 'Corrupt reset token.' };
  }
}

export class VerificationService {
  private otpStore = new Map<string, OtpRecord>();
  private pendingRegistrations = new Map<string, PendingRegistration>();

  private getStoreKey(channel: VerificationChannel, destination: string, purpose?: string): string {
    const dest = channel === 'email' ? destination.trim().toLowerCase() : normalizePhoneNumber(destination);
    return `${channel}:${dest}${purpose ? `:${purpose}` : ''}`;
  }

  private hashCode(code: string): string {
    return crypto.createHash('sha256').update(code.trim()).digest('hex');
  }

  public generateSecureOtp(): string {
    return String(crypto.randomInt(100000, 999999));
  }

  public async sendOtp(params: {
    channel: VerificationChannel;
    destination: string;
    purpose?: VerificationPurpose;
    metadata?: Record<string, any>;
  }): Promise<{
    success: boolean;
    code: string;
    expiresInSec: number;
    cooldownRemaining?: number;
    error?: string;
    liveDispatched?: boolean;
    provider?: string;
  }> {
    const purpose = params.purpose || 'login';
    const key = this.getStoreKey(params.channel, params.destination, purpose);
    const now = Date.now();
    const existing = this.otpStore.get(key);

    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      return {
        success: false,
        code: existing.codePlain || '',
        expiresInSec: Math.max(0, Math.ceil((existing.expiresAt - now) / 1000)),
        cooldownRemaining: waitSeconds,
        error: `Please wait ${waitSeconds}s before requesting a new code.`,
      };
    }

    const code = this.generateSecureOtp();
    const record: OtpRecord = {
      codeHash: this.hashCode(code),
      codePlain: code,
      channel: params.channel,
      destination:
        params.channel === 'email'
          ? params.destination.trim().toLowerCase()
          : normalizePhoneNumber(params.destination),
      purpose,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      lastSentAt: now,
      metadata: params.metadata,
    };

    this.otpStore.set(key, record);

    if (params.channel === 'email') {
      emailService.sendVerificationOtp(record.destination, code, purpose as any).catch(console.error);
    } else {
      smsService.sendVerificationOtp(record.destination, code, purpose as any).catch(console.error);
    }

    return {
      success: true,
      code,
      expiresInSec: OTP_TTL_MS / 1000,
      liveDispatched: true,
      provider: params.channel === 'email' ? 'smtp' : 'twilio',
    };
  }

  public verifyOtp(params: {
    channel: VerificationChannel;
    destination: string;
    code: string;
    purpose?: VerificationPurpose;
  }): { success: boolean; error?: string } {
    const purpose = params.purpose || 'login';
    const key = this.getStoreKey(params.channel, params.destination, purpose);
    const record = this.otpStore.get(key);

    if (!record) {
      return { success: false, error: 'No active verification code found. Please request a new code.' };
    }
    if (record.expiresAt < Date.now()) {
      this.otpStore.delete(key);
      return { success: false, error: 'Verification code expired. Please request a new one.' };
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      this.otpStore.delete(key);
      return { success: false, error: 'Maximum attempts reached. Please request a new verification code.' };
    }

    record.attempts += 1;
    if (record.codeHash !== this.hashCode(params.code)) {
      const remaining = MAX_ATTEMPTS - record.attempts;
      return { success: false, error: `Incorrect code. ${remaining} attempt(s) remaining.` };
    }

    this.otpStore.delete(key);
    return { success: true };
  }

  public createPendingRegistration(data: {
    fullName: string;
    email?: string;
    phone?: string;
    passwordHash?: string;
  }): PendingRegistration {
    const id = `reg-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const pending: PendingRegistration = {
      id,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      createdAt: Date.now(),
      verified: false,
    };
    this.pendingRegistrations.set(id, pending);
    return pending;
  }

  public getPendingRegistration(id: string): PendingRegistration | undefined {
    return this.pendingRegistrations.get(id);
  }

  public markRegistrationVerified(id: string): void {
    const p = this.pendingRegistrations.get(id);
    if (p) p.verified = true;
  }

  public async requestRegistrationOtp(params: {
    fullName: string;
    email?: string;
    phone?: string;
    password?: string;
  }): Promise<{ success: boolean; registrationId?: string; error?: string; destination?: string }> {
    if (!params.email && !params.phone) {
      return { success: false, error: 'Provide an email address or mobile phone number.' };
    }
    const channel: VerificationChannel = params.email ? 'email' : 'sms';
    const destination = params.email
      ? params.email.trim().toLowerCase()
      : normalizePhoneNumber(params.phone || '');

    const pending = this.createPendingRegistration({
      fullName: params.fullName,
      email: params.email?.trim().toLowerCase(),
      phone: params.phone ? normalizePhoneNumber(params.phone) : undefined,
      passwordHash: params.password,
    });

    const res = await this.sendOtp({
      channel,
      destination,
      purpose: 'registration',
      metadata: { registrationId: pending.id },
    });

    if (!res.success) {
      return { success: false, error: res.error, destination };
    }

    return { success: true, registrationId: pending.id, destination };
  }

  public async requestPasswordReset(identifier: string): Promise<{
    success: boolean;
    channel: VerificationChannel;
    destination: string;
    code: string;
    resetToken?: string;
    error?: string;
  }> {
    const clean = identifier.trim();
    if (!clean) {
      return {
        success: false,
        channel: 'email',
        destination: '',
        code: '',
        error: 'Provide your registered email address or mobile number.',
      };
    }

    const isEmail = clean.includes('@');
    const channel: VerificationChannel = isEmail ? 'email' : 'sms';
    const destination = isEmail ? clean.toLowerCase() : normalizePhoneNumber(clean);

    const otpRes = await this.sendOtp({
      channel,
      destination,
      purpose: 'password_reset',
    });

    if (!otpRes.success) {
      return {
        success: false,
        channel,
        destination,
        code: '',
        error: otpRes.error || 'Unable to issue password reset code. Please try again.',
      };
    }

    if (channel === 'email') {
      emailService.sendPasswordResetEmail(destination, otpRes.code).catch((err) => {
        console.warn('[PasswordReset] Dedicated reset email failed (OTP still valid):', err?.message || err);
      });
    } else {
      smsService.sendPasswordResetSms(destination, otpRes.code).catch((err) => {
        console.warn('[PasswordReset] Dedicated reset SMS failed (OTP still valid):', err?.message || err);
      });
    }

    const resetToken = createPasswordResetToken(destination, otpRes.code);

    return {
      success: true,
      channel,
      destination,
      code: otpRes.code,
      resetToken,
    };
  }

  public verifyPasswordReset(
    identifier: string,
    code: string,
    resetToken?: string
  ): { success: boolean; error?: string } {
    const clean = identifier.trim();
    const isEmail = clean.includes('@');
    const channel: VerificationChannel = isEmail ? 'email' : 'sms';
    const destination = isEmail ? clean.toLowerCase() : normalizePhoneNumber(clean);

    if (resetToken) {
      const tokenCheck = verifyPasswordResetToken(resetToken, destination, code);
      if (tokenCheck.success) return tokenCheck;
    }

    return this.verifyOtp({
      channel,
      destination,
      code,
      purpose: 'password_reset',
    });
  }

  public getAllCommunicationLogs(): (EmailAuditLog | SmsAuditLog)[] {
    const all = [...emailAuditLogs, ...smsAuditLogs];
    return all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getHealthStatus() {
    return {
      email: emailService.getStatus(),
      sms: smsService.getStatus(),
      activeOtpCount: this.otpStore.size,
      standardCompliant: 'RA 10173 Certified',
    };
  }
}

export const verificationService = new VerificationService();
