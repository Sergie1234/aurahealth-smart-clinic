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
} from 'lucide-react';
import { useClinic, type PrimaryAuthRole, type StaffSubRole } from '../../context/ClinicContext';

type AuthMode = 'login' | 'register';
type ContactMethod = 'email' | 'phone';

export const LoginPage: React.FC = () => {
  const { login, requestPhoneOtp, requestEmailOtp, setActiveTab } = useClinic();
  const [primaryRole, setPrimaryRole] = useState<PrimaryAuthRole>('patient');
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole>('nurse');
  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<ContactMethod>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isPatient = primaryRole === 'patient';
  const isAdmin = primaryRole === 'admin';
  const needsPassword = !isPatient || method === 'email' || mode === 'register';

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    const result = await requestPhoneOtp(phone);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Could not send OTP.');
      return;
    }
    setOtpSent(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isPatient && method === 'phone' && mode === 'login' && !otpSent) {
      setError('Request an OTP first.');
      setLoading(false);
      return;
    }

    const result = await login({
      primaryRole,
      email: method === 'email' ? email : phone,
      phone: method === 'phone' ? phone : undefined,
      password: needsPassword ? password : undefined,
      subRole: primaryRole === 'staff' ? staffSubRole : undefined,
      twoFactorCode: isAdmin ? twoFactorCode : method === 'phone' ? otpCode : undefined,
      method: isPatient ? method : 'email',
      fullName: mode === 'register' ? fullName : undefined,
      isRegister: isPatient && mode === 'register',
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Sign-in failed.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/30 mb-4">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Smart Clinic</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Secure access · Live Email & SMS OTP</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="grid grid-cols-3 gap-2 mb-6">
            {(
              [
                { id: 'patient' as const, label: 'Patient', icon: UserRound },
                { id: 'staff' as const, label: 'Staff', icon: Stethoscope },
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
              <button type="button" onClick={() => { setMode('register'); setError(''); setOtpSent(false); }} className={`flex-1 py-2 text-sm font-semibold rounded-lg border flex items-center justify-center gap-1.5 ${mode === 'register' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}><UserPlus className="w-3.5 h-3.5" /> Create account</button>
            </div>
          )}

          {isPatient && (
            <div className="flex gap-2 mb-5">
              <button type="button" onClick={() => { setMethod('email'); setOtpSent(false); setError(''); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border ${method === 'email' ? 'border-slate-900 dark:border-teal-500 bg-slate-900 dark:bg-teal-950 text-white dark:text-teal-200' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}><Mail className="w-3.5 h-3.5" /> Email</button>
              <button type="button" onClick={() => { setMethod('phone'); setError(''); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border ${method === 'phone' ? 'border-slate-900 dark:border-teal-500 bg-slate-900 dark:bg-teal-950 text-white dark:text-teal-200' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}><Phone className="w-3.5 h-3.5" /> Phone + OTP</button>
            </div>
          )}

          {primaryRole === 'staff' && (
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Staff role</label>
              <select value={staffSubRole} onChange={(e) => setStaffSubRole(e.target.value as StaffSubRole)} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm">
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="receptionist">Receptionist</option>
                <option value="lab_technician">Lab Technician</option>
              </select>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isPatient && mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Full name</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Dela Cruz" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm" />
              </div>
            )}

            {(!isPatient || method === 'email') && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Email</label>
                <input type="email" required={!isPatient || method === 'email'} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isAdmin ? 'smartclinicrealacc@gmail.com' : 'you@email.com'} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm" />
              </div>
            )}

            {isPatient && method === 'phone' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Mobile number</label>
                <div className="flex gap-2">
                  <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09XXXXXXXXX" className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm" />
                  {mode === 'login' && (
                    <button type="button" onClick={handleSendOtp} disabled={loading} className="shrink-0 px-3 py-2.5 rounded-xl bg-slate-900 dark:bg-teal-700 text-white text-xs font-semibold hover:opacity-90 disabled:opacity-60">
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  )}
                </div>
                {otpSent && (
                  <p className="mt-1.5 text-[11px] text-teal-600 dark:text-teal-400">OTP sent via SMS. Enter the 6-digit code from your phone.</p>
                )}
              </div>
            )}

            {isPatient && method === 'phone' && mode === 'login' && otpSent && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">OTP code</label>
                <input type="text" inputMode="numeric" required maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit code" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm font-mono tracking-widest" />
              </div>
            )}

            {needsPassword && !(isPatient && method === 'phone' && mode === 'login') && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{mode === 'register' ? 'Create password' : 'Password'}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required={needsPassword} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-10 pr-3 py-2.5 text-sm" />
                </div>
              </div>
            )}

            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Security code</label>
                <input type="text" required value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="Admin security code" className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm" />
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2.5 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-lg shadow-teal-600/25 disabled:opacity-60">
              {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <button type="button" onClick={() => setActiveTab('home')} className="mt-4 w-full text-center text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-400">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};
