import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useClinic, PrimaryAuthRole, StaffSubRole } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  User,
  Building2,
  Stethoscope,
  ShieldAlert,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Shield,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setActiveTab } = useClinic();
  const { isDark: isDarkMode } = useTheme();

  const [selectedRole, setSelectedRole] = useState<PrimaryAuthRole>('patient');
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole>('nurse');

  const [email, setEmail] = useState('patient.vance@smartclinic.ph');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: PrimaryAuthRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setPassword('');

    switch (role) {
      case 'patient':
        setEmail('patient.vance@smartclinic.ph');
        setPassword('••••••••');
        break;
      case 'staff':
        setEmail(`${staffSubRole}@smartclinic.ph`);
        setPassword('••••••••');
        break;
      case 'doctor':
        setEmail('dr.sarahlin@smartclinic.ph');
        setPassword('••••••••');
        break;
      case 'admin':
        setEmail('smartclinicrealacc@gmail.com');
        setPassword('');
        break;
    }
  };

  const handleStaffSubRoleChange = (sub: StaffSubRole) => {
    setStaffSubRole(sub);
    setEmail(`${sub}@smartclinic.ph`);
  };

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = login({
        primaryRole: selectedRole,
        subRole: selectedRole === 'staff' ? staffSubRole : undefined,
        email,
        password,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 450);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-sans selection:bg-teal-500 selection:text-white ${
        isDarkMode ? 'bg-[#0b1e27] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <header
        className={`px-4 sm:px-8 py-3.5 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-[#0b1e27]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div onClick={() => setActiveTab('home')} className="flex items-center gap-3 cursor-pointer select-none">
          <SmartClinicLogo className="w-9 h-9" glow={true} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight leading-none">
                Smart <span className="text-teal-400">Clinic</span>
              </span>
            </div>
            <p className="text-[9px] tracking-wider uppercase font-semibold text-slate-400">Health Hub Access</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className={`text-xs font-semibold flex items-center gap-1.5 hover:text-teal-400 transition cursor-pointer ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to home</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto relative">
        <div className="w-full max-w-lg relative z-10 space-y-4">
          <div className="text-center space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono">
              Philippine Health Data Security & Encryption Standards
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Hospital Access Portal</h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Strict role-based isolation for Patients, Staff, Physicians, and Administrators.
            </p>
          </div>

          <div
            className={`p-6 sm:p-7 rounded-3xl border transition shadow-2xl space-y-5 ${
              isDarkMode
                ? 'bg-[#0f2933]/95 border-teal-900/50 shadow-teal-950/50'
                : 'bg-white border-slate-200 shadow-slate-200'
            }`}
          >
            <div className="p-1 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-4 gap-1">
              {([
                ['patient', User, 'Patient'],
                ['staff', Building2, 'Staff'],
                ['doctor', Stethoscope, 'Doctor'],
                ['admin', ShieldAlert, 'Admin'],
              ] as const).map(([role, Icon, label]) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                    selectedRole === role ? 'bg-teal-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {selectedRole === 'staff' && (
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-teal-950/30 border border-teal-800/40">
                <label className="text-xs font-bold text-teal-300 flex items-center justify-between">
                  <span>Mandatory Staff Sub-Role Menu:</span>
                  <span className="text-[10px] text-teal-400/80 font-mono">Strict Access</span>
                </label>
                <select
                  value={staffSubRole}
                  onChange={(e) => handleStaffSubRoleChange(e.target.value as StaffSubRole)}
                  className="w-full bg-[#123440] border border-teal-800/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer"
                >
                  <option value="nurse">Nurse (Outpatient Triage & Vitals)</option>
                  <option value="pharmacist">Pharmacist (Formulary & Dispensary)</option>
                  <option value="receptionist">Receptionist (Front Desk & Queue)</option>
                  <option value="lab_technician">Lab Technician (Diagnostic Assays)</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  Strict Constraint: Doctor and Admin access are segregated into separate root privileges.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmitCredentials} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">
                  {selectedRole === 'patient'
                    ? 'Patient Email or MRN Identifier'
                    : selectedRole === 'admin'
                    ? 'Authorized Admin Gmail'
                    : `${selectedRole.toUpperCase()} Professional Email`}
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full bg-[#123440] border border-teal-800/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-[#123440] border border-teal-800/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {selectedRole === 'admin' && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-teal-800/50 space-y-1.5 text-[11px] text-slate-300">
                  <p className="font-bold text-teal-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Access Gate</span>
                  </p>
                  <p>
                    Only <span className="font-mono text-teal-200">smartclinicrealacc@gmail.com</span> may sign in as Admin.
                  </p>
                  <p className="text-slate-400">
                    Password is required and verified on every attempt. Wrong email or password is always rejected.
                  </p>
                  <p className="font-mono text-[10px] text-amber-200/90 pt-0.5">Demo password: SmartClinic@Admin2026</p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-teal-400 focus:ring-teal-400 bg-slate-900 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotEmailSent(false);
                  }}
                  className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-teal-400 hover:bg-teal-300 text-slate-950 transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Validating credentials...</span>
                  </>
                ) : selectedRole === 'admin' ? (
                  <span>Sign In as Administrator</span>
                ) : (
                  <span>Sign In to {selectedRole.toUpperCase()} Dashboard</span>
                )}
              </button>
            </form>
          </div>

          <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/40 space-y-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 font-bold text-white">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Philippine Health Data Security & Encryption Standards</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>RA 10173 NPC Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>DOH-PHIE Certified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>256-bit AES Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                <span>PhilHealth Security Stds</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f2933] border border-teal-900/50 p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-2">Password Recovery</h3>
            {forgotEmailSent ? (
              <div className="space-y-2">
                <p className="text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Recovery Instructions Dispatched</span>
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We have sent a secure temporary access link to{' '}
                  <span className="font-mono font-semibold text-teal-200">{email}</span>. Please check your inbox and spam folder.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-3 w-full py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg text-xs cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Enter your registered medical staff or patient email address. Recovery follows Philippine Health Data Security & Encryption Standards (RA 10173).
                </p>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Registered Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400 text-xs"
                    placeholder="name@smartclinic.ph"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotEmailSent(true)}
                    className="flex-1 py-2 rounded-xl bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
