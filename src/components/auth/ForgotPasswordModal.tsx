import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Lock,
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  Smartphone,
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE_URL } from '../../lib/config';
import { validatePasswordStrength } from '../../utils/passwordValidation';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIdentifier?: string;
  onPasswordResetSuccess?: (newPass: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultIdentifier = '',
  onPasswordResetSuccess,
}) => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [recoveryMethod, setRecoveryMethod] = useState<'authenticator' | 'email'>('email');
  const [hasAuthenticatorAvailable, setHasAuthenticatorAvailable] = useState(false);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset modal state + detect Authenticator recovery when opened
  useEffect(() => {
    if (!isOpen) return;
    setStep('request');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setLoading(false);
    if (defaultIdentifier) setIdentifier(defaultIdentifier);

    const cleanId = (identifier || defaultIdentifier).trim().toLowerCase();
    if (cleanId && cleanId.includes('@')) {
      fetch(`${API_BASE_URL}/api/auth/password-reset/methods?email=${encodeURIComponent(cleanId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.hasAuthenticator) {
            setHasAuthenticatorAvailable(true);
            setRecoveryMethod('authenticator');
          } else {
            setHasAuthenticatorAvailable(false);
            setRecoveryMethod('email');
          }
        })
        .catch(() => {
          setHasAuthenticatorAvailable(false);
          setRecoveryMethod('email');
        });
    } else {
      setHasAuthenticatorAvailable(false);
      setRecoveryMethod('email');
    }
  }, [isOpen, defaultIdentifier]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen) return null;

  const handleSelectAuthenticator = () => {
    const cleanId = identifier.trim();
    if (!cleanId || !cleanId.includes('@')) {
      setError('Please enter your registered email address first.');
      return;
    }
    setError('');
    setRecoveryMethod('authenticator');
    setStep('confirm');
  };

  const handleSendEmailCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    const cleanId = identifier.trim();
    if (!cleanId || !cleanId.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      // SMTP delivery can take >4s; use 25s so real server errors surface instead of false timeouts
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(`${API_BASE_URL}/api/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, email: cleanId }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      setLoading(false);

      if (!res.ok || !data.success) {
        const msg =
          data.error ||
          (res.status === 429
            ? 'Too many requests. Wait a moment before requesting another code.'
            : 'Failed to dispatch password reset code. Check SMTP configuration or try again.');
        setError(msg);
        toastError(msg);
        return;
      }

      setRecoveryMethod('email');
      setStep('confirm');
      toastSuccess(
        `Password reset security code sent to ${data.destination || cleanId}. Check your inbox (and spam folder).`
      );
    } catch (err: any) {
      setLoading(false);
      const isAbort = err?.name === 'AbortError';
      const msg = isAbort
        ? 'Request timed out while contacting the mail server. Verify SMTP_APP_PASSWORD and try again.'
        : err?.message || 'Network error: Unable to reach the authentication server.';
      setError(msg);
      toastError(msg);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCode = code.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setError(
        recoveryMethod === 'authenticator'
          ? 'Please enter the 6-digit rolling code from your Authenticator app.'
          : 'Please enter the 6-digit password reset code sent to your email.'
      );
      return;
    }

    // High Security Password Strength Rule Enforcement
    const pwResult = validatePasswordStrength(newPassword);
    if (!pwResult.isValid) {
      setError(
        pwResult.errorMessage ||
          'Password does not meet high-security requirements. Please fulfill all rule requirements below.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(`${API_BASE_URL}/api/auth/password-reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim().toLowerCase(),
          code: cleanCode,
          newPassword,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      setLoading(false);

      if (!res.ok || !data.success) {
        const msg = data.error || 'Invalid or expired verification code. Request a new reset code.';
        setError(msg);
        toastError(msg);
        return;
      }

      toastSuccess('Password updated successfully! You can now log in with your new credentials.');
      if (onPasswordResetSuccess) {
        onPasswordResetSuccess(newPassword);
      }
      // Reset local modal state for next open
      setStep('request');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err: any) {
      setLoading(false);
      const isAbort = err?.name === 'AbortError';
      const msg = isAbort
        ? 'Request timed out. Please try again.'
        : err?.message || 'Verification failed: Cannot reach authentication server.';
      setError(msg);
      toastError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {step === 'request' ? 'Reset Account Password' : 'Create New Password'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {step === 'request'
                ? 'Select your secure account recovery pathway'
                : `Account: ${identifier}`}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-tight">{error}</span>
          </div>
        )}

        {step === 'request' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Account Email
              </label>
              <input
                type="email"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-xs focus:ring-2 focus:ring-teal-500"
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Choose your preferred recovery pathway below. Authenticator App is recommended if enabled.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Option 1: Authenticator App */}
              <button
                type="button"
                onClick={handleSelectAuthenticator}
                className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                  hasAuthenticatorAvailable
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 hover:bg-teal-50'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Use Authenticator App (2FA)
                    </span>
                    {hasAuthenticatorAvailable && (
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Instant recovery with your 6-digit rolling code from Google Authenticator, Microsoft Authenticator, or Authy.
                  </p>
                </div>
              </button>

              {/* Option 2: Email Reset Code */}
              <button
                type="button"
                disabled={loading}
                onClick={handleSendEmailCode}
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition cursor-pointer flex items-start gap-3 disabled:opacity-60"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                    {loading ? 'Sending reset code…' : 'Send Password Reset Code to Email'}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    Dispatches a dedicated one-time password reset code to your registered email inbox.
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            {/* Active Pathway Badge */}
            <div className="p-3 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 flex items-center justify-between text-xs text-teal-900 dark:text-teal-200">
              <div className="flex items-center gap-2 font-medium">
                {recoveryMethod === 'authenticator' ? (
                  <>
                    <Smartphone className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Recovery Method: <strong>Authenticator App (2FA)</strong></span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Reset code dispatched to: <strong>{identifier}</strong></span>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-[11px] font-bold text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* 6-Digit Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {recoveryMethod === 'authenticator'
                  ? '6-Digit Authenticator App Code'
                  : '6-Digit Email Reset Code'} *
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder={recoveryMethod === 'authenticator' ? 'Enter from Google Authenticator' : '123456'}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-xs font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-teal-500"
              />
              <p className="mt-1 text-[11px] text-slate-400 text-center">
                {recoveryMethod === 'authenticator'
                  ? 'Open your mobile Authenticator app and enter the 6-digit code.'
                  : 'Check your email inbox for the password reset security code.'}
              </p>
            </div>

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  New Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showNewPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create high-security password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-9 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Password Strength Checklist */}
              {newPassword && (
                <div className="mt-2.5">
                  <PasswordStrengthIndicator password={newPassword} />
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm New Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 pl-9 pr-9 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="flex-1 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-2 py-2 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition cursor-pointer disabled:opacity-60"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loading ? 'Updating Credentials…' : 'Save New Password'}</span>
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
            <ShieldCheck className="w-3 h-3 text-teal-600" />
            <span>Republic Act No. 10173 • High-Security PBKDF2 Credential Reset</span>
          </span>
        </div>
      </div>
    </div>
  );
};
