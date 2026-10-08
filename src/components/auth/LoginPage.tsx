/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Stethoscope,
  UserRound,
  ShieldCheck,
  ArrowRight,
  Lock,
  AlertCircle,
  Phone,
  Mail,
  UserPlus,
  Send,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useClinic, type PrimaryAuthRole, type StaffSubRole } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';

type AuthMode = 'login' | 'register';
type ContactMethod = 'email' | 'phone';

export const LoginPage: React.FC = () => {
  const { login, requestPhoneOtp, requestEmailOtp, setActiveTab, pendingAction } = useClinic();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [primaryRole, setPrimaryRole] = useState<PrimaryAuthRole>('patient');
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole>('nurse');
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<ContactMethod>('email');

  // Input states
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // UI state
  const [otpSent, setOtpSent] = useState(false);
  const [admin2FaSent, setAdmin2FaSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLiveDispatched, setIsLiveDispatched] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPatient = primaryRole === 'patient';
  const isDoctor = primaryRole === 'doctor';
  const isStaff = primaryRole === 'staff';
  const isAdmin = primaryRole === 'admin';

  // Send Patient OTP (Email or Phone SMS)
  const handleSendPatientOtp = async () => {
    setError('');
    setLoading(true);

    if (method === 'phone') {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setError('Please enter a valid mobile number (at least 10 digits).');
        setLoading(false);
        return;
      }
      const res = await requestPhoneOtp(cleanPhone, mode === 'register' ? 'patient_register' : 'patient_login');
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to dispatch SMS OTP.');
        toastError(res.error || 'Failed to dispatch SMS OTP.');
        return;
      }
      setOtpSent(true);
      if (res.code) {
        setOtpCode(res.code);
        setGeneratedCode(res.code);
      }
      setIsLiveDispatched(Boolean(res.liveDispatched));
      if (res.liveDispatched) {
        toastSuccess(`SMS verification code dispatched via carrier to ${cleanPhone}.`);
      } else {
        toastInfo(`Code generated: ${res.code || '123456'} (auto-filled for instant verification).`);
      }
    } else {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setError('Please enter a valid email address.');
        setLoading(false);
        return;
      }
      const res = await requestEmailOtp(cleanEmail, mode === 'register' ? 'patient_register' : 'patient_login');
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to dispatch Email OTP.');
        toastError(res.error || 'Failed to dispatch Email OTP.');
        return;
      }
      setOtpSent(true);
      if (res.code) {
        setOtpCode(res.code);
        setGeneratedCode(res.code);
      }
      setIsLiveDispatched(Boolean(res.liveDispatched));
      if (res.liveDispatched) {
        toastSuccess(`Verification email dispatched from smartclinicrealacc@gmail.com to ${cleanEmail}.`);
      } else {
        toastInfo(`Code generated: ${res.code || '123456'} (auto-filled for instant verification).`);
      }
    }
  };

  // Send Admin 2FA Code
  const handleSendAdmin2FA = async () => {
    setError('');
    setLoading(true);
    const res = await requestEmailOtp('smartclinicrealacc@gmail.com', 'admin_2fa');
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Failed to send Admin 2FA code.');
      toastError(res.error || 'Failed to send Admin 2FA code.');
      return;
    }
    setAdmin2FaSent(true);
    if (res.code) {
      setTwoFactorCode(res.code);
      setGeneratedCode(res.code);
    }
    setIsLiveDispatched(Boolean(res.liveDispatched));
    if (res.liveDispatched) {
      toastSuccess('Real 2FA Security Code dispatched to smartclinicrealacc@gmail.com.');
    } else {
      toastInfo(`Admin 2FA code ${res.code || '123456'} generated and auto-filled.`);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Patient Validation
    if (isPatient) {
      const finalCode = (otpCode || generatedCode || '123456').trim();

      const res = await login({
        primaryRole: 'patient',
        email: method === 'email' ? email : `${phone}@phone.smartclinic.local`,
        phone: method === 'phone' ? phone : undefined,
        method,
        password: password || undefined,
        twoFactorCode: finalCode,
        fullName: mode === 'register' ? fullName : undefined,
        isRegister: mode === 'register',
      });

      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Patient verification failed.');
        toastError(res.error || 'Patient verification failed.');
        return;
      }

      toastSuccess(
        pendingAction === 'book'
          ? 'Authenticated successfully! Redirecting directly to appointment booking...'
          : 'Welcome to your Smart Clinic Health Portal.'
      );
      return;
    }

    // Doctor Provider Login
    if (isDoctor) {
      const res = await login({
        primaryRole: 'doctor',
        email: email || 'maria.reyes@smartclinic.ph',
        password: password || 'doctor123',
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Doctor authentication failed.');
        toastError(res.error || 'Doctor authentication failed.');
        return;
      }
      toastSuccess('Provider authenticated. Routing to Doctor Consultation Suite.');
      return;
    }

    // Staff Login (Nurse, Pharmacist, Receptionist, Lab Tech)
    if (isStaff) {
      const res = await login({
        primaryRole: 'staff',
        email: email || `${staffSubRole}@smartclinic.ph`,
        password: password || 'staff123',
        subRole: staffSubRole,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Staff authentication failed.');
        toastError(res.error || 'Staff authentication failed.');
        return;
      }
      toastSuccess(`Staff authenticated. Routing to ${staffSubRole.replace('_', ' ').toUpperCase()} workbench.`);
      return;
    }

    // Admin Login with 2FA
    if (isAdmin) {
      const finalAdminCode = (twoFactorCode || generatedCode || '123456').trim();

      const res = await login({
        primaryRole: 'admin',
        email: 'smartclinicrealacc@gmail.com',
        password: password || 'SmartClinic@Admin2026',
        twoFactorCode: finalAdminCode,
      });

      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Admin 2FA verification failed.');
        toastError(res.error || 'Admin 2FA verification failed.');
        return;
      }
      toastSuccess('Admin Two-Factor Authentication verified. Access granted.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-teal-50/40 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans">
      <div className="w-full max-w-lg">
        {/* Header / Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-teal-100 dark:border-teal-900/50 mb-3.5">
            <SmartClinicLogo className="w-11 h-11" glow={true} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Smart Clinic</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Role-Based Access Control • Live SMTP & SMS Security
          </p>
        </div>

        {/* Auth Gate Notification if Intercepted from 'Book Now' */}
        {pendingAction === 'book' && (
          <div className="mb-4 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Appointment Booking Gate:</strong> Please sign in or create an account to finalize your outpatient reservation. You will be redirected immediately.
            </span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* 4-Role Selector Tabs */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {(
              [
                { id: 'patient' as const, label: 'Patient', icon: UserRound },
                { id: 'doctor' as const, label: 'Doctor', icon: Stethoscope },
                { id: 'staff' as const, label: 'Staff', icon: Activity },
                { id: 'admin' as const, label: 'Admin', icon: ShieldCheck },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPrimaryRole(id);
                  setError('');
                  setOtpSent(false);
                  setAdmin2FaSent(false);
                  setMode('login');
                }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  primaryRole === id
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* PATIENT PORTAL CONTROLS */}
          {/* ========================================================================= */}
          {isPatient && (
            <div className="space-y-4 mb-5">
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                    mode === 'login' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setOtpSent(false); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'register' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Create Account
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setMethod('email'); setOtpSent(false); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    method === 'email'
                      ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Verification</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod('phone'); setOtpSent(false); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    method === 'phone'
                      ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile SMS OTP</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STAFF MANDATORY SUB-ROLE SELECTOR */}
          {/* ========================================================================= */}
          {isStaff && (
            <div className="mb-5 p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60">
              <label className="block text-xs font-bold text-teal-900 dark:text-teal-200 mb-1.5">
                Mandatory Staff Sub-Role
              </label>
              <p className="text-[11px] text-teal-700 dark:text-teal-300 mb-2.5">
                Select your clinical assignment. Strictly excludes Doctor and Admin roles.
              </p>
              <select
                value={staffSubRole}
                onChange={(e) => setStaffSubRole(e.target.value as StaffSubRole)}
                className="w-full rounded-xl border border-teal-300 dark:border-teal-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="nurse">Nurse — Outpatient Triage & Vitals Workbench</option>
                <option value="pharmacist">Pharmacist — Medication Dispensary & Inventory</option>
                <option value="receptionist">Receptionist — Intake, Appointments & Queue</option>
                <option value="lab_technician">Lab Technician — Diagnostic Pathology Lab</option>
              </select>
            </div>
          )}

          {/* ========================================================================= */}
          {/* DOCTOR DEDICATED PROVIDER NOTICE */}
          {/* ========================================================================= */}
          {isDoctor && (
            <div className="mb-5 p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex items-start gap-2.5">
              <Stethoscope className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-teal-900 dark:text-teal-200">Physician Provider Portal</p>
                <p className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">
                  Direct authentication routes straight to the Doctor Consultation Suite with SOAP notes, ICD-10 diagnostic coding, and e-prescribing.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ADMIN 2FA NOTICE */}
          {/* ========================================================================= */}
          {isAdmin && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900 dark:text-amber-200">Mandatory Administrator 2FA</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Admin access is strictly gated. Verification codes are dispatched directly to <strong className="font-mono text-amber-900 dark:text-amber-100">smartclinicrealacc@gmail.com</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* AUTHENTICATION FORM */}
          {/* ========================================================================= */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name for Patient Registration */}
            {isPatient && mode === 'register' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Vargas"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            {/* Email Field */}
            {(isDoctor || isStaff || isAdmin || (isPatient && method === 'email')) && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAdmin ? 'Administrator Account' : isDoctor ? 'Provider Work Email' : isStaff ? 'Staff Work Email' : 'Email Address'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    readOnly={isAdmin}
                    value={isAdmin ? 'smartclinicrealacc@gmail.com' : email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      isDoctor
                        ? 'maria.reyes@smartclinic.ph'
                        : isStaff
                        ? `${staffSubRole}@smartclinic.ph`
                        : 'you@example.com'
                    }
                    className={`flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 ${
                      isAdmin ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed font-medium' : ''
                    }`}
                  />
                  {isPatient && method === 'email' && (
                    <button
                      type="button"
                      onClick={handleSendPatientOtp}
                      disabled={loading}
                      className="shrink-0 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{otpSent ? 'Resend' : 'Send Code'}</span>
                    </button>
                  )}
                </div>
                {isPatient && method === 'email' && otpSent && (
                  <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    ✓ Security code dispatched from smartclinicrealacc@gmail.com. Check your inbox.
                  </p>
                )}
              </div>
            )}

            {/* Mobile Phone Field */}
            {isPatient && method === 'phone' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Number (Philippines)</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917XXXXXXX or +63917XXXXXXX"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendPatientOtp}
                    disabled={loading}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{otpSent ? 'Resend' : 'Send SMS OTP'}</span>
                  </button>
                </div>
                {otpSent && (
                  <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    ✓ 6-digit code dispatched via SMS. Enter it below to authenticate.
                  </p>
                )}
              </div>
            )}

            {/* Patient OTP Input */}
            {isPatient && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode('123456');
                      setOtpSent(true);
                    }}
                    className="text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Quick Test Code (123456)
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit code (e.g. 123456)"
                    className="w-full rounded-xl border border-teal-400 dark:border-teal-700 bg-teal-50/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2.5 text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {otpSent && (
                  <div className="p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        {isLiveDispatched ? (
                          'Code dispatched to your carrier / inbox.'
                        ) : (
                          <>
                            Active Verification Code: <strong className="font-mono text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-700">{otpCode || generatedCode || '123456'}</strong>
                          </>
                        )}
                      </span>
                    </div>
                    {(!otpCode || otpCode !== (generatedCode || '123456')) && (
                      <button
                        type="button"
                        onClick={() => setOtpCode(generatedCode || '123456')}
                        className="px-2 py-0.5 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] shrink-0 cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    )}
                  </div>
                )}

                {!isLiveDispatched && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    💡 Tip: Real carrier SMS & Email require Twilio / SMTP keys in <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">.env</code>. The system provides immediate code auto-fill or testing code <strong className="font-mono text-slate-700 dark:text-slate-300">123456</strong>.
                  </p>
                )}
              </div>
            )}

            {/* Password Field (for Doctor, Staff, Admin, or Patient Registration) */}
            {(isDoctor || isStaff || isAdmin || (isPatient && mode === 'register')) && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isDoctor ? 'Provider Password / License Pass' : isAdmin ? 'Administrator Master Password' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isAdmin ? 'SmartClinic@Admin2026' : '••••••••'}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            {/* Admin 2FA Code Input & Trigger */}
            {isAdmin && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200">Admin 2FA Security Code</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTwoFactorCode('123456');
                        setAdmin2FaSent(true);
                      }}
                      className="text-[11px] font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      Test Code (123456)
                    </button>
                    <button
                      type="button"
                      onClick={handleSendAdmin2FA}
                      disabled={loading}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition disabled:opacity-60"
                    >
                      <Send className="w-3 h-3" />
                      <span>{admin2FaSent ? 'Resend' : 'Send 2FA Code'}</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="Enter 6-digit code (e.g. 123456)"
                    className="w-full rounded-xl border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2.5 text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                {admin2FaSent && (
                  <div className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-center justify-between">
                    <span>
                      Active 2FA Code: <strong className="font-mono text-amber-700 dark:text-amber-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-700">{twoFactorCode || generatedCode || '123456'}</strong>
                    </span>
                    {(!twoFactorCode || twoFactorCode !== (generatedCode || '123456')) && (
                      <button
                        type="button"
                        onClick={() => setTwoFactorCode(generatedCode || '123456')}
                        className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Message Alert */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/25 transition cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span>Verifying credentials…</span>
              ) : (
                <>
                  <span>
                    {isPatient && mode === 'register'
                      ? 'Complete Patient Registration'
                      : isDoctor
                      ? 'Enter Consultation Suite'
                      : isStaff
                      ? `Access ${staffSubRole.replace('_', ' ').toUpperCase()} Workbench`
                      : isAdmin
                      ? 'Verify 2FA & Access Dashboard'
                      : 'Sign In to Health Portal'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts for Testing */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                1-Click Demo Accounts
              </p>
              <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                Universal Test Code: 123456
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setPrimaryRole('patient');
                  setMethod('email');
                  setEmail('elena.vargas@example.com');
                  setMode('login');
                  setOtpSent(true);
                  setOtpCode('123456');
                  setGeneratedCode('123456');
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Patient</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">elena.vargas@example.com</div>
                <div className="text-[9px] font-mono text-teal-600 dark:text-teal-400">Code: 123456</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setPrimaryRole('doctor');
                  setEmail('maria.reyes@smartclinic.ph');
                  setPassword('doctor123');
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Doctor (MD)</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">maria.reyes@smartclinic.ph</div>
                <div className="text-[9px] font-mono text-teal-600 dark:text-teal-400">Pass: doctor123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setPrimaryRole('staff');
                  setStaffSubRole('nurse');
                  setEmail('ana.villanueva@smartclinic.ph');
                  setPassword('nurse123');
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Nurse Triage</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">ana.villanueva@smartclinic.ph</div>
                <div className="text-[9px] font-mono text-teal-600 dark:text-teal-400">Pass: nurse123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setPrimaryRole('staff');
                  setStaffSubRole('pharmacist');
                  setEmail('pharmacy@smartclinic.ph');
                  setPassword('pharm123');
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Pharmacist</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">pharmacy@smartclinic.ph</div>
                <div className="text-[9px] font-mono text-teal-600 dark:text-teal-400">Pass: pharm123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setPrimaryRole('staff');
                  setStaffSubRole('receptionist');
                  setEmail('reception@smartclinic.ph');
                  setPassword('reception123');
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Receptionist</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">reception@smartclinic.ph</div>
                <div className="text-[9px] font-mono text-teal-600 dark:text-teal-400">Pass: reception123</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setPrimaryRole('admin');
                  setEmail('smartclinicrealacc@gmail.com');
                  setPassword('SmartClinic@Admin2026');
                  setTwoFactorCode('123456');
                  setAdmin2FaSent(true);
                  setGeneratedCode('123456');
                }}
                className="p-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/30 hover:border-amber-500 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">Admin 2FA</div>
                <div className="text-[9px] text-amber-700 dark:text-amber-300 truncate">smartclinicrealacc@gmail.com</div>
                <div className="text-[9px] font-mono text-amber-800 dark:text-amber-300">Pass: SmartClinic@Admin2026</div>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">
              Click any demo account above to auto-fill the login form, then click the submit button.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className="mt-4 w-full text-center text-xs text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition cursor-pointer"
          >
            ← Back to Smart Clinic Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
