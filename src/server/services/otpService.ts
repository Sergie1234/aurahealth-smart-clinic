/**
 * Smart Clinic — Production OTP delivery (Email SMTP + SMS Twilio)
 * Strictly branded as Smart Clinic.
 * Credentials via environment variables only. Never hardcode secrets.
 */
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import crypto from 'crypto';

export type OtpChannel = 'email' | 'sms';
export type OtpPurpose = 'patient_login' | 'patient_register' | 'admin_2fa';

interface OtpRecord {
  codeHash: string;
  channel: OtpChannel;
  destination: string;
  purpose: OtpPurpose;
  expiresAt: number;
  attempts: number;
}

/** In-memory OTP store (swap for Redis in multi-instance production). */
const otpStore = new Map<string, OtpRecord>();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) return `+63${digits}`;
  if (digits.length === 11 && digits.startsWith('09')) return `+63${digits.slice(1)}`;
  if (digits.startsWith('63') && digits.length >= 12) return `+${digits}`;
  if (phone.trim().startsWith('+')) return `+${digits}`;
  return `+${digits}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function storeKey(channel: OtpChannel, destination: string): string {
  return `${channel}:${destination}`;
}

function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateCode(): string {
  return String(crypto.randomInt(100000, 999999));
}

function createSmtpTransport() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL || 'smartclinicrealacc@gmail.com';
  const pass = process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASS || '';
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  if (!sid || !token || sid.startsWith('ACxxx')) return null;
  return twilio(sid, token);
}

export function getOtpDeliveryStatus() {
  const emailReady = Boolean(
    (process.env.SMTP_USER || process.env.SMTP_EMAIL) &&
      (process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASS)
  );
  const smsReady = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER &&
      !String(process.env.TWILIO_ACCOUNT_SID).startsWith('ACxxx')
  );
  return {
    emailReady,
    smsReady,
    fromEmail:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER ||
      process.env.SMTP_EMAIL ||
      'smartclinicrealacc@gmail.com',
    fromSms: process.env.TWILIO_FROM_NUMBER || null,
  };
}

export async function sendEmailOtp(params: {
  email: string;
  purpose?: OtpPurpose;
}): Promise<{ success: boolean; error?: string; expiresInSec?: number; devNotice?: string }> {
  const email = normalizeEmail(params.email);
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Enter a valid email address.' };
  }

  const code = generateCode();
  const purpose = params.purpose || 'patient_login';
  const transport = createSmtpTransport();
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    'smartclinicrealacc@gmail.com';

  const subject =
    purpose === 'admin_2fa'
      ? 'Smart Clinic — Admin Two-Factor Authentication Security Code'
      : 'Smart Clinic — Your Patient Portal Verification Code';

  const text = [
    'Smart Clinic — Healthcare Verification Code',
    '',
    `Your verification code is: ${code}`,
    '',
    'This security code expires in 10 minutes. Do NOT share it with anyone.',
    'Philippine Health Data Security Standard (RA 10173).',
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Smart Clinic</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Outpatient Management & Healthcare Services</p>
      </div>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 20px;">
        <p style="color: #475569; font-size: 13px; margin: 0 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">${purpose === 'admin_2fa' ? 'Admin 2FA Security Code' : 'One-Time Verification Code'}</p>
        <div style="font-size: 36px; letter-spacing: 8px; font-weight: 800; color: #0f172a; font-family: monospace; background: #ffffff; padding: 12px 20px; border-radius: 8px; border: 1px dashed #cbd5e1; display: inline-block;">${code}</div>
        <p style="color: #94a3b8; font-size: 12px; margin: 12px 0 0;">Valid for 10 minutes. Do not disclose this code.</p>
      </div>
      <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 20px;">
        This email was dispatched securely from <strong style="color: #0f172a;">${from}</strong>. If you did not initiate this request, please contact Smart Clinic Security immediately.
      </p>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">Republic Act No. 10173 • Philippine Health Data Security</p>
      </div>
    </div>
  `;

  if (transport) {
    try {
      await transport.sendMail({
        from: `Smart Clinic Security <${from}>`,
        to: email,
        subject,
        text,
        html,
      });
      console.log(`[Smart Clinic SMTP] Live email dispatched successfully to ${email}`);
    } catch (err: any) {
      console.error('[Smart Clinic SMTP] Live dispatch failed:', err?.message || err);
      // Fallback log
      console.log(`[Smart Clinic SMTP Fallback] Code for ${email}: ${code}`);
    }
  } else {
    // When SMTP credentials are not yet populated in .env, log code to console so local verification functions
    console.log(`[Smart Clinic SMTP Notice] SMTP_APP_PASSWORD not set. Verification code for ${email} is: ${code}`);
  }

  otpStore.set(storeKey('email', email), {
    codeHash: hashCode(code),
    channel: 'email',
    destination: email,
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });

  return {
    success: true,
    expiresInSec: OTP_TTL_MS / 1000,
    devNotice: transport ? undefined : 'Live SMTP pending environment configuration. Development code logged to console.',
  };
}

export async function sendSmsOtp(params: {
  phone: string;
  purpose?: OtpPurpose;
}): Promise<{ success: boolean; error?: string; expiresInSec?: number; devNotice?: string }> {
  const phone = normalizePhone(params.phone);
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return { success: false, error: 'Enter a valid mobile phone number (at least 10 digits).' };
  }

  const code = generateCode();
  const purpose = params.purpose || 'patient_login';
  const client = getTwilioClient();
  const from = process.env.TWILIO_FROM_NUMBER || '';
  const body = `Smart Clinic verification code: ${code}. Valid for 10 minutes. Do not share. RA 10173.`;

  if (client && from) {
    try {
      await client.messages.create({ from, to: phone, body });
      console.log(`[Smart Clinic Twilio] Live SMS dispatched to ${phone}`);
    } catch (err: any) {
      console.error('[Smart Clinic Twilio] SMS send failed:', err?.message || err);
      console.log(`[Smart Clinic Twilio Fallback] Code for ${phone}: ${code}`);
    }
  } else {
    console.log(`[Smart Clinic Twilio Notice] Twilio credentials not set. SMS verification code for ${phone} is: ${code}`);
  }

  otpStore.set(storeKey('sms', phone), {
    codeHash: hashCode(code),
    channel: 'sms',
    destination: phone,
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });

  return {
    success: true,
    expiresInSec: OTP_TTL_MS / 1000,
    devNotice: client ? undefined : 'Twilio SMS pending credentials. Development code logged to console.',
  };
}

export function verifyOtp(params: {
  channel: OtpChannel;
  destination: string;
  code: string;
}): { success: boolean; error?: string } {
  const dest =
    params.channel === 'email'
      ? normalizeEmail(params.destination)
      : normalizePhone(params.destination);
  const key = storeKey(params.channel, dest);
  const record = otpStore.get(key);

  if (!record) {
    return { success: false, error: 'No active OTP found. Please request a new code.' };
  }
  if (record.expiresAt < Date.now()) {
    otpStore.delete(key);
    return { success: false, error: 'Verification code expired. Please request a new code.' };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return { success: false, error: 'Maximum attempts exceeded. Please request a new code.' };
  }

  record.attempts += 1;
  if (record.codeHash !== hashCode(params.code.trim())) {
    return { success: false, error: 'Incorrect verification code. Please try again.' };
  }

  otpStore.delete(key);
  return { success: true };
}
