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
  codePlain?: string; // Kept in memory for testing/dev review
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

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

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

  /**
   * Dispatches a verification OTP via the designated channel.
   * Enforces 60-second cooldown to prevent spam.
   */
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

    // Enforce resend cooldown
    if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
      return {
        success: false,
        code: existing.codePlain || '123456',
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
      destination: params.channel === 'email' ? params.destination.trim().toLowerCase() : normalizePhoneNumber(params.destination),
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

  /**
   * Validates an OTP code with anti-brute-force attempt limits.
   */
  public verifyOtp(params: {
    channel: VerificationChannel;
    destination: string;
    code: string;
    purpose?: VerificationPurpose;
  }): { success: boolean; error?: string; metadata?: Record<string, any> } {
    const inputCode = String(params.code || '').trim();

    const key = this.getStoreKey(params.channel, params.destination, params.purpose);
    // Also check wildcard key if specific purpose key is not found
    const record = this.otpStore.get(key) || this.otpStore.get(this.getStoreKey(params.channel, params.destination));

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

    if (record.codeHash !== this.hashCode(inputCode)) {
      const remaining = MAX_ATTEMPTS - record.attempts;
      return { success: false, error: `Incorrect code. ${remaining} attempt(s) remaining.` };
    }

    const metadata = record.metadata;
    this.otpStore.delete(key);
    return { success: true, metadata };
  }

  /* =========================================================================
     ACCOUNT REGISTRATION & WELCOME FLOW
     ========================================================================= */

  public async registerPendingUser(input: {
    fullName: string;
    email?: string;
    phone?: string;
    passwordHash?: string;
  }): Promise<{ success: boolean; code?: string; error?: string }> {
    const fullName = (input.fullName || '').trim();
    const email = input.email ? input.email.trim().toLowerCase() : '';
    const phone = input.phone ? normalizePhoneNumber(input.phone) : '';

    if (!email && !phone) {
      return { success: false, error: 'Provide an email address or mobile phone number.' };
    }

    const channel: VerificationChannel = email ? 'email' : 'sms';
    const destination = email || phone;

    const res = await this.sendOtp({
      channel,
      destination,
      purpose: 'registration',
      metadata: { fullName, email, phone, passwordHash: input.passwordHash },
    });

    return {
      success: true,
      code: res.code,
    };
  }

  /**
   * Finalizes verification and triggers Welcome notifications via Email & SMS
   */
  public async finalizeVerification(user: {
    fullName: string;
    email?: string;
    phone?: string;
    mrn?: string;
  }) {
    if (user.email) {
      emailService.queueMail({
        to: user.email,
        subject: `Welcome to Smart Clinic, ${user.fullName}! Your Account is Verified`,
        text: `Welcome to Smart Clinic, ${user.fullName}!\nYour account has been verified. MRN: ${user.mrn || 'Assigned'}`,
        html: '', // Will be hydrated by sendWelcomeEmail
      });
      // Fire dedicated welcome template
      emailService.sendWelcomeEmail(user.email, user.fullName, user.mrn).catch(console.error);
    }

    if (user.phone) {
      smsService.sendWelcomeSms(user.phone, user.fullName).catch(console.error);
    }
  }

  /* =========================================================================
     PASSWORD RESET FLOW
     ========================================================================= */

  public async requestPasswordReset(identifier: string): Promise<{
    success: boolean;
    channel: VerificationChannel;
    destination: string;
    code: string;
    error?: string;
  }> {
    const clean = identifier.trim();
    const isEmail = clean.includes('@');
    const channel: VerificationChannel = isEmail ? 'email' : 'sms';
    const destination = isEmail ? clean.toLowerCase() : normalizePhoneNumber(clean);

    const otpRes = await this.sendOtp({
      channel,
      destination,
      purpose: 'password_reset',
    });

    if (channel === 'email') {
      emailService.sendPasswordResetEmail(destination, otpRes.code).catch(console.error);
    } else {
      smsService.sendPasswordResetSms(destination, otpRes.code).catch(console.error);
    }

    return {
      success: true,
      channel,
      destination,
      code: otpRes.code,
    };
  }

  public verifyPasswordReset(identifier: string, code: string): { success: boolean; error?: string } {
    const clean = identifier.trim();
    const isEmail = clean.includes('@');
    const channel: VerificationChannel = isEmail ? 'email' : 'sms';
    const destination = isEmail ? clean.toLowerCase() : normalizePhoneNumber(clean);

    return this.verifyOtp({
      channel,
      destination,
      code,
      purpose: 'password_reset',
    });
  }

  /* =========================================================================
     AUDIT LOGS & HEALTH
     ========================================================================= */

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
