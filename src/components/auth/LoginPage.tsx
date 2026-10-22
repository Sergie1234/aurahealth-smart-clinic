/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TEMP RESTORE STUB — full LoginPage is being restored in follow-up.
 * This prevents the broken SEE_ARTIFACT placeholder from breaking the build.
 */
import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';

export const LoginPage: React.FC = () => {
  const { setActiveTab, login } = useClinic();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({
        primaryRole: 'patient',
        email: email.trim().toLowerCase(),
        password,
        method: 'email',
      });
      if (!res.success) setError(res.error || 'Sign-in failed');
    } catch (err: any) {
      setError(err?.message || 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Smart Clinic — Patient Sign In</h1>
        <p className="text-xs text-slate-500">Authenticator 2FA is not required for patients. Use Forgot Password on the full login once restored.</p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        />
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold disabled:opacity-60">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        <button type="button" onClick={() => setActiveTab('home')} className="w-full text-xs text-slate-500 hover:text-teal-600">
          ← Back to home
        </button>
      </form>
    </div>
  );
};
