/**
 * Smart Clinic — Production OTP delivery (Email SMTP + SMS Twilio)
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

const OTP_TTL_MS = 10 * 60 * 1000;
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
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL || '';
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
    fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.SMTP_EMAIL || 'smartclinicrealacc@gmail.com',
    fromSms: process.env.TWILIO_FROM_NUMBER || null,
  };
}

export async function sendEmailOtp(params: {
  email: string;
  purpose?: OtpPurpose;
}): Promise<{ success: boolean; error?: string; expiresInSec?: number }> {
  const email = normalizeEmail(params.email);
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Enter a valid email address.' };
  }
  const transport = createSmtpTransport();
  if (!transport) {
    return {
      success: false,
      error:
        'Email OTP is not configured. Set SMTP_USER and SMTP_APP_PASSWORD (Gmail App Password) on the server.',
    };
  }
  const code = generateCode();
  const purpose = params.purpose || 'patient_login';
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    process.env.SMTP_EMAIL ||
    'smartclinicrealacc@gmail.com';
  const subject =
    purpose === 'admin_2fa'
      ? 'Smart Clinic Admin security code'
      : 'Smart Clinic verification code';
  const text = [
    'Smart Clinic — One-Time Password',
    '',
    `Your verification code is: ${code}`,
    '',
    'This code expires in 10 minutes. Do not share it with anyone.',
    'If you did not request this, ignore this email.',
    '',
    'Philippine Health Data Security · RA 10173',
  ].join('\n');
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="color:#0d9488;margin:0 0 8px">Smart Clinic</h2>
      <p style="color:#475569;font-size:14px">Your verification code</p>
      <p style="font-size:28px;letter-spacing:6px;font-weight:700;color:#0f172a;margin:16px 0">${code}</p>
      <p style="color:#64748b;font-size:12px">Expires in 10 minutes. Do not share this code.</p>
      <p style="color:#94a3b8;font-size:11px;margin-top:24px">RA 10173 · Philippine Health Data Security</p>
    </div>
  `;
  try {
    await transport.sendMail({
      from: `Smart Clinic <${from}>`,
      to: email,
      subject,
      text,
      html,
    });
  } catch (err: any) {
    console.error('[OTP] Email send failed:', err?.message || err);
    return { success: false, error: 'Failed to send email OTP. Check SMTP credentials.' };
  }
  otpStore.set(storeKey('email', email), {
    codeHash: hashCode(code),
    channel: 'email',
    destination: email,
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return { success: true, expiresInSec: OTP_TTL_MS / 1000 };
}

export async function sendSmsOtp(params: {
  phone: string;
  purpose?: OtpPurpose;
}): Promise<{ success: boolean; error?: string; expiresInSec?: number }> {
  const phone = normalizePhone(params.phone);
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return { success: false, error: 'Enter a valid mobile number (at least 10 digits).' };
  }
  const client = getTwilioClient();
  const from = process.env.TWILIO_FROM_NUMBER || '';
  if (!client || !from) {
    return {
      success: false,
      error:
        'SMS OTP is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER on the server.',
    };
  }
  const code = generateCode();
  const purpose = params.purpose || 'patient_login';
  const body = `Smart Clinic code: ${code}. Valid 10 minutes. Do not share.`;
  try {
    await client.messages.create({ from, to: phone, body });
  } catch (err: any) {
    console.error('[OTP] SMS send failed:', err?.message || err);
    return { success: false, error: 'Failed to send SMS OTP. Check Twilio credentials and sender number.' };
  }
  otpStore.set(storeKey('sms', phone), {
    codeHash: hashCode(code),
    channel: 'sms',
    destination: phone,
    purpose,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  });
  return { success: true, expiresInSec: OTP_TTL_MS / 1000 };
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
    return { success: false, error: 'No active code. Request a new OTP.' };
  }
  if (record.expiresAt < Date.now()) {
    otpStore.delete(key);
    return { success: false, error: 'Code expired. Request a new OTP.' };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(key);
    return { success: false, error: 'Too many attempts. Request a new OTP.' };
  }
  record.attempts += 1;
  if (record.codeHash !== hashCode(params.code.trim())) {
    return { success: false, error: 'Incorrect OTP code.' };
  }
  otpStore.delete(key);
  return { success: true };
}
