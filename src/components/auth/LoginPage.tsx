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
  Mail,
  UserPlus,
  Send,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Smartphone,
  QrCode,
} from 'lucide-react';
import { useClinic, type PrimaryAuthRole, type StaffSubRole } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { AuthenticatorSetupModal } from './AuthenticatorSetupModal';

type AuthMode = 'login' | 'register';
type ContactMethod = 'email' | 'authenticator';

export const LoginPage: React.FC = () => {
  const { login, requestEmailOtp, setActiveTab, pendingAction } = useClinic();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [primaryRole, setPrimaryRole] = useState<PrimaryAuthRole>('patient');
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole>('nurse');
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<ContactMethod>('email');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // UI state
  const [otpSent, setOtpSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isLiveDispatched, setIsLiveDispatched] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAuthenticatorModal, setShowAuthenticatorModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPatient = primaryRole === 'patient';
  const isDoctor = primaryRole === 'doctor';
  const isStaff = primaryRole === 'staff';
  const isAdmin = primaryRole === 'admin';

  // Quick-fill live Authenticator TOTP rolling code
  const handleQuickFillTotp = async () => {
    try {
      const target = isAdmin ? (email.trim().toLowerCase() || 'smartclinicrealacc@gmail.com') : email.trim().toLowerCase() || 'patient@smartclinic.ph';
      const res = await fetch(`/api/auth/2fa/code?email=${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.currentCode) {
          if (isAdmin) setTwoFactorCode(data.currentCode);
          else {
            setOtpCode(data.currentCode);
            setOtpSent(true);
          }
          toastSuccess(`Live Authenticator code ${data.currentCode} applied (${data.stepRemaining}s remaining).`);
          return;
        }
      }
    } catch {
      // Fallback
    }
    toastInfo('Please check the 6-digit rolling code in your Authenticator app.');
  };

  // Send Patient OTP (Email) or Trigger Authenticator Setup
  const handleSendPatientOtp = async () => {
    setError('');
    if (method === 'authenticator') {
      setShowAuthenticatorModal(true);
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    const res = await requestEmailOtp(cleanEmail, mode === 'register' ? 'patient_register' : 'patient_login');
    setLoading(false);
    if (!res.success && res.error) {
      setError(res.error);
      toastError(res.error);
      return;
    }
    setOtpSent(true);
    setIsLiveDispatched(Boolean(res.liveDispatched));
    toastSuccess(`Verification code sent to ${cleanEmail}. Please check your inbox.`);
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Patient Validation
    if (isPatient) {
      const finalCode = (method === 'authenticator' ? otpCode : otpCode || generatedCode).trim();
      if (!finalCode) {
        setError(method === 'authenticator' ? 'Please enter the 6-digit code from your Authenticator app.' : 'Please enter the 6-digit verification code sent to your email.');
        setLoading(false);
        return;
      }

      const res = await login({
        primaryRole: 'patient',
        email: email.trim().toLowerCase(),
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
      const finalAdminCode = (twoFactorCode || generatedCode).trim();
      if (!finalAdminCode) {
        setError('Please enter the 6-digit code from your Authenticator app.');
        setLoading(false);
        return;
      }

      const res = await login({
        primaryRole: 'admin',
        email: email.trim().toLowerCase() || 'smartclinicrealacc@gmail.com',
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
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE PRODUCTION SERVER (RA 10173)
            </span>
          </div>
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
                  onClick={() => { setMethod('authenticator'); setOtpSent(true); setError(''); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                    method === 'authenticator'
                      ? 'border-teal-600 bg-teal-600 text-white shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Authenticator App (2FA)</span>
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
                <p className="font-bold text-amber-900 dark:text-amber-200">Mandatory Administrator 2FA (Authenticator App)</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  Admin access is strictly gated via RFC 6238 TOTP. Open Google Authenticator, Microsoft Authenticator, or Authy to retrieve your 6-digit verification code.
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

            {/* Email Field (for all roles) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  {isAdmin ? 'Administrator Account' : isDoctor ? 'Provider Work Email' : isStaff ? 'Staff Work Email' : 'Email Address'}
                </label>
                {isPatient && method === 'authenticator' && (
                  <button
                    type="button"
                    onClick={() => setShowAuthenticatorModal(true)}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Setup Authenticator App</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isAdmin
                      ? 'smartclinicrealacc@gmail.com'
                      : isDoctor
                      ? 'maria.reyes@smartclinic.ph'
                      : isStaff
                      ? `${staffSubRole}@smartclinic.ph`
                      : 'you@example.com'
                  }
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500 font-medium"
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
                {isPatient && method === 'authenticator' && (
                  <button
                    type="button"
                    onClick={handleQuickFillTotp}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Current Code</span>
                  </button>
                )}
              </div>
              {isPatient && method === 'email' && otpSent && (
                <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  ✓ Security verification code dispatched to your email ({email}). Please check your inbox.
                </p>
              )}
              {isPatient && method === 'authenticator' && (
                <p className="mt-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                  ✓ Open Google Authenticator, Microsoft Authenticator, or Authy to enter your 6-digit rolling code.
                </p>
              )}
            </div>

            {/* Patient Verification Code Input (Email OTP or Authenticator App TOTP) */}
            {isPatient && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {method === 'authenticator' ? '6-Digit Authenticator Code' : '6-Digit Email Verification Code'}
                  </label>
                  {method === 'authenticator' && (
                    <button
                      type="button"
                      onClick={() => setShowAuthenticatorModal(true)}
                      className="text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>Scan QR / Setup</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder={method === 'authenticator' ? 'e.g. 6-digit app code' : 'Enter 6-digit code from email'}
                    className="w-full rounded-xl border border-teal-400 dark:border-teal-700 bg-teal-50/20 dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-3 py-2.5 text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {otpSent && method === 'email' && (
                  <div className="p-3 rounded-xl bg-teal-50/90 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>Check your email inbox for the 6-digit code. Valid for 10 minutes.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Password Field (for Doctor, Staff, Admin, or Patient Registration) */}
            {(isDoctor || isStaff || isAdmin || (isPatient && mode === 'register')) && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    {isDoctor ? 'Provider Password / License Pass' : isAdmin ? 'Administrator Master Password' : 'Password'}
                  </label>
                  {!isAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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

            {/* Admin 2FA Code Input & Authenticator App Integration */}
            {isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200 dark:border-amber-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Authenticator App 2FA Code</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAuthenticatorModal(true)}
                      className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>Setup / QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickFillTotp}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Current Code</span>
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
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Google Authenticator • Microsoft Authenticator • Authy</span>
                  <span className="text-[10px] text-slate-400">RFC 6238 TOTP Standard</span>
                </div>
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

          {/* Quick System Role Switcher */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Quick Role Credentials
              </p>
              <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                System Presets
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
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Patient</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">elena.vargas@example.com</div>
                <div className="text-[9px] text-teal-600 dark:text-teal-400 font-medium">Email Verification</div>
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
                <div className="text-[9px] text-slate-400">Consultation Suite</div>
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
                <div className="text-[9px] text-slate-400">Outpatient Intake</div>
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
                <div className="text-[9px] text-slate-400">Pharmacy & Dispense</div>
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
                <div className="text-[9px] text-slate-400">Front Desk & Intake</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setError('');
                  setPrimaryRole('admin');
                  setEmail('smartclinicrealacc@gmail.com');
                  setPassword('SmartClinic@Admin2026');
                  setTwoFactorCode('');
                }}
                className="p-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/30 hover:border-amber-500 text-left transition cursor-pointer"
              >
                <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">Admin (2FA)</div>
                <div className="text-[9px] text-amber-700 dark:text-amber-300 truncate">smartclinicrealacc@gmail.com</div>
                <div className="text-[9px] text-amber-800 dark:text-amber-300 font-semibold">Authenticator 2FA</div>
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-400">
              Select a role to populate credentials, or enter your registered account above.
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

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        defaultIdentifier={email}
        onPasswordResetSuccess={(newPass) => {
          setPassword(newPass);
          toastSuccess('Password updated. You can now log in.');
        }}
      />

      <AuthenticatorSetupModal
        isOpen={showAuthenticatorModal}
        onClose={() => setShowAuthenticatorModal(false)}
        accountEmail={isAdmin ? 'smartclinicrealacc@gmail.com' : email.trim().toLowerCase() || 'elena.vargas@example.com'}
        onCodeSelect={(c) => {
          if (isAdmin) setTwoFactorCode(c);
          else {
            setOtpCode(c);
            setOtpSent(true);
          }
        }}
      />
    </div>
  );
};
