/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Stethoscope,
  UserRound,
  ShieldCheck,
  ArrowRight,
  Lock,
  AlertCircle,
  UserPlus,
  KeyRound,
  CheckCircle2,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useClinic, type PrimaryAuthRole, type StaffSubRole } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { AuthenticatorSetupModal } from './AuthenticatorSetupModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { validatePasswordStrength } from '../../utils/passwordValidation';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

type AuthMode = 'login' | 'register';

export const LoginPage: React.FC = () => {
  const { login, setActiveTab, pendingAction } = useClinic();
  const { success: toastSuccess, error: toastError } = useToast();

  const [primaryRole, setPrimaryRole] = useState<PrimaryAuthRole>('patient');
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole>('nurse');
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [enablePatient2Fa, setEnablePatient2Fa] = useState(false);
  const [justResetPassword, setJustResetPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showAuthenticatorModal, setShowAuthenticatorModal] = useState(false);
  const [hasAgreedPrivacy, setHasAgreedPrivacy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [isCaptchaChecking, setIsCaptchaChecking] = useState(false);

  const isPatient = primaryRole === 'patient';
  const isDoctor = primaryRole === 'doctor';
  const isStaff = primaryRole === 'staff';
  const isAdmin = primaryRole === 'admin';

  // NEVER probe 2FA for patients. Authenticator field is admin-only (or staff/doctor after requires2FA).
  useEffect(() => {
    if (primaryRole === 'patient' || justResetPassword) {
      setEnablePatient2Fa(false);
      setTwoFactorCode('');
      return;
    }
    if (primaryRole === 'admin') {
      setEnablePatient2Fa(false);
      return;
    }
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setEnablePatient2Fa(false);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/auth/2fa/status?email=${encodeURIComponent(clean)}`)
        .then((res) => res.json())
        .then((d) => {
          if (justResetPassword || primaryRole === 'patient') {
            setEnablePatient2Fa(false);
            return;
          }
          setEnablePatient2Fa(Boolean(d?.enabled));
        })
        .catch(() => setEnablePatient2Fa(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [email, primaryRole, justResetPassword]);

  const handleCaptchaClick = () => {
    if (isCaptchaVerified || isCaptchaChecking) return;
    setIsCaptchaChecking(true);
    setTimeout(() => {
      setIsCaptchaChecking(false);
      setIsCaptchaVerified(true);
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isPatient) {
      if (mode === 'register') {
        if (!fullName.trim() || fullName.trim().length < 2) {
          setError('Full name is required.');
          setLoading(false);
          return;
        }
        const pwCheck = validatePasswordStrength(password);
        if (!pwCheck.isValid) {
          setError(pwCheck.errorMessage || 'Password does not meet security requirements.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (!hasAgreedPrivacy) {
          setError('Please agree to the privacy policy.');
          setLoading(false);
          return;
        }
        const res = await login({
          primaryRole: 'patient',
          email: email.trim().toLowerCase(),
          password,
          fullName: fullName.trim(),
          isRegister: true,
          method: 'email',
        });
        setLoading(false);
        if (!res.success) {
          setError(res.error || 'Registration failed.');
          toastError(res.error || 'Registration failed.');
          return;
        }
        toastSuccess('Account created. Welcome to Smart Clinic.');
        return;
      }

      // Patient login — NO authenticator required
      if (!isCaptchaVerified) {
        setError('Please complete the security check (I am not a robot).');
        setLoading(false);
        return;
      }
      if (!password) {
        setError('Please enter your account password.');
        setLoading(false);
        return;
      }
      const res = await login({
        primaryRole: 'patient',
        email: email.trim().toLowerCase(),
        password,
        method: 'email',
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid email or password.');
        toastError(res.error || 'Invalid email or password.');
        return;
      }
      toastSuccess(
        pendingAction === 'book'
          ? 'Authenticated! Opening appointment scheduler…'
          : 'Welcome to your Smart Clinic Health Portal.'
      );
      return;
    }

    if (isDoctor) {
      const res = await login({
        primaryRole: 'doctor',
        email: email || 'maria.reyes@smartclinic.ph',
        password: password || 'doctor123',
        twoFactorCode: twoFactorCode.trim() || undefined,
      });
      setLoading(false);
      if (!res.success) {
        if (res.requires2FA) {
          setEnablePatient2Fa(true);
          setError(res.error || 'Authenticator 2FA is active. Enter the 6-digit code from your app.');
          return;
        }
        setError(res.error || 'Doctor authentication failed.');
        toastError(res.error || 'Doctor authentication failed.');
        return;
      }
      toastSuccess('Provider authenticated.');
      return;
    }

    if (isStaff) {
      const res = await login({
        primaryRole: 'staff',
        email: email || `${staffSubRole}@smartclinic.ph`,
        password: password || 'staff123',
        subRole: staffSubRole,
        twoFactorCode: twoFactorCode.trim() || undefined,
      });
      setLoading(false);
      if (!res.success) {
        if (res.requires2FA) {
          setEnablePatient2Fa(true);
          setError(res.error || 'Authenticator 2FA is active. Enter the 6-digit code from your app.');
          return;
        }
        setError(res.error || 'Staff authentication failed.');
        toastError(res.error || 'Staff authentication failed.');
        return;
      }
      toastSuccess('Staff authenticated.');
      return;
    }

    if (isAdmin) {
      const finalAdminCode = twoFactorCode.trim();
      if (!finalAdminCode || finalAdminCode.length !== 6) {
        setError('Please enter the 6-digit code from your Authenticator app.');
        setLoading(false);
        return;
      }
      const res = await login({
        primaryRole: 'admin',
        email: email.trim().toLowerCase() || 'smartclinicrealacc@gmail.com',
        password,
        twoFactorCode: finalAdminCode,
      });
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Admin authentication failed.');
        toastError(res.error || 'Admin authentication failed.');
        return;
      }
      toastSuccess('Admin authenticated.');
      return;
    }

    setLoading(false);
    setError('Unknown role.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30 mb-4">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Clinic</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Secure access · Outpatient portal</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="grid grid-cols-4 gap-2 mb-6">
            {(
              [
                { id: 'patient' as const, label: 'Patient', icon: UserRound },
                { id: 'doctor' as const, label: 'Doctor', icon: Stethoscope },
                { id: 'staff' as const, label: 'Staff', icon: KeyRound },
                { id: 'admin' as const, label: 'Admin', icon: ShieldCheck },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setPrimaryRole(id);
                  setError('');
                  setTwoFactorCode('');
                  setEnablePatient2Fa(false);
                  setJustResetPassword(false);
                  setMode('login');
                }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                  primaryRole === id
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {isPatient && (
            <div className="flex gap-2 mb-5">
              <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${mode === 'login' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>Sign in</button>
              <button type="button" onClick={() => { setMode('register'); setError(''); }} className={`flex-1 py-2 text-sm font-semibold rounded-lg border flex items-center justify-center gap-1.5 ${mode === 'register' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}><UserPlus className="w-3.5 h-3.5" /> Register</button>
            </div>
          )}

          {isStaff && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Staff role</label>
              <select value={staffSubRole} onChange={(e) => setStaffSubRole(e.target.value as StaffSubRole)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm">
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="receptionist">Receptionist</option>
                <option value="lab_technician">Lab Technician</option>
              </select>
            </div>
          )}

          {isAdmin && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold">Mandatory Administrator 2FA (Authenticator App)</p>
              <p className="mt-1 opacity-90">Enter the 6-digit code from Google Authenticator, Microsoft Authenticator, or Authy.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isPatient && mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Dela Cruz" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isAdmin ? 'smartclinicrealacc@gmail.com' : 'you@email.com'} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500">{mode === 'register' ? 'Create password' : 'Password'}</label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="text-[11px] text-teal-600 cursor-pointer">{showLoginPassword ? 'Hide' : 'Show'}</button>
                  {!isAdmin && mode === 'login' && (
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="text-[11px] font-medium text-teal-600 hover:underline cursor-pointer">Forgot password?</button>
                  )}
                </div>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showLoginPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-3 py-2.5 text-sm" />
              </div>
              {mode === 'register' && password && <div className="mt-2"><PasswordStrengthIndicator password={password} /></div>}
            </div>

            {isPatient && mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirm password</label>
                <input type={showRegisterConfirmPassword ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm" />
                <label className="mt-3 flex items-start gap-2 text-[11px] text-slate-500">
                  <input type="checkbox" checked={hasAgreedPrivacy} onChange={(e) => setHasAgreedPrivacy(e.target.checked)} className="mt-0.5" />
                  <span>I agree to the <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-teal-600 underline">Privacy Policy (RA 10173)</button></span>
                </label>
              </div>
            )}

            {isPatient && mode === 'login' && (
              <div className={`rounded-xl border p-3 ${isCaptchaVerified ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
                <button type="button" onClick={handleCaptchaClick} className="flex items-center gap-3 w-full text-left cursor-pointer">
                  <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center ${isCaptchaVerified ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                    {isCaptchaChecking ? <span className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /> : isCaptchaVerified ? <CheckCircle2 className="w-4 h-4" /> : null}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">I&apos;m not a robot</span>
                </button>
              </div>
            )}

            {/* 2FA: Admin always; Staff/Doctor only when required. NEVER for patients. */}
            {((isAdmin && !justResetPassword) || ((isDoctor || isStaff) && enablePatient2Fa && !justResetPassword)) && (
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-800/60 border border-amber-200 dark:border-amber-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    <span>Authenticator App 2FA Code</span>
                  </label>
                  {isAdmin && (
                    <button type="button" onClick={() => setShowAuthenticatorModal(true)} className="text-[11px] font-bold text-teal-600 cursor-pointer">Setup QR</button>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit code"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono tracking-widest text-center"
                />
                <p className="text-[10px] text-slate-500">Google Authenticator · Microsoft Authenticator · Authy</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/25 transition cursor-pointer disabled:opacity-60">
              {loading ? 'Processing...' : (<><span>{isPatient && mode === 'register' ? 'Create Patient Account' : isAdmin ? 'Verify 2FA & Access Dashboard' : 'Sign In'}</span><ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <button type="button" onClick={() => setActiveTab('home')} className="mt-4 w-full text-center text-xs text-slate-400 hover:text-teal-600 transition cursor-pointer">
            ← Back to Smart Clinic Homepage
          </button>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        defaultIdentifier={email}
        onPasswordResetSuccess={(newPass, resetEmail) => {
          if (resetEmail) setEmail(resetEmail);
          setPassword(newPass);
          setTwoFactorCode('');
          setEnablePatient2Fa(false);
          setShowAuthenticatorModal(false);
          setJustResetPassword(true);
          setError('');
          window.setTimeout(() => setJustResetPassword(false), 60000);
          toastSuccess('Password updated successfully! Please sign in with your new credentials.');
        }}
      />

      <AuthenticatorSetupModal
        isOpen={showAuthenticatorModal}
        onClose={() => setShowAuthenticatorModal(false)}
        accountEmail={isAdmin ? 'smartclinicrealacc@gmail.com' : email.trim().toLowerCase() || 'elena.vargas@example.com'}
      />

      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAgree={() => {
          setHasAgreedPrivacy(true);
          toastSuccess('Agreed to Philippine Medical Privacy Policy (RA 10173).');
        }}
      />
    </div>
  );
};
