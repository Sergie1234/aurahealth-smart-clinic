import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import { UserRole } from '../../types/clinic';
import {
  Lock,
  Mail,
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  Sun,
  Moon,
  AlertCircle,
  Building2,
  User,
  KeyRound,
  Stethoscope,
  HeartPulse
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { setActiveTab, switchRole, users } = useClinic();
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Auth Mode: Patient vs Staff/Provider
  const [authType, setAuthType] = useState<'patient' | 'staff'>('staff');
  const [staffRole, setStaffRole] = useState<UserRole>('doctor');

  // Form Fields
  const [emailOrId, setEmailOrId] = useState('staff@smartclinic.test');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleRoleTypeChange = (type: 'patient' | 'staff') => {
    setAuthType(type);
    if (type === 'patient') {
      setEmailOrId('patient@smartclinic.test');
      setPassword('••••••••');
    } else {
      setEmailOrId(
        staffRole === 'doctor'
          ? 'sarah.lin@smartclinic.ph'
          : `${staffRole}@smartclinic.ph`
      );
      setPassword('••••••••');
    }
  };

  const handleStaffRoleSelect = (role: UserRole) => {
    setStaffRole(role);
    setEmailOrId(`${role}@smartclinic.ph`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (authType === 'patient') {
        switchRole('patient');
      } else {
        switchRole(staffRole);
      }
      // Navigate straight to dashboard
      setActiveTab('dashboard');
    }, 450);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 font-sans selection:bg-teal-500 selection:text-white ${
        isDarkMode
          ? 'bg-[#0b1e27] text-slate-100'
          : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* 1. Header Bar */}
      <header
        className={`px-4 sm:px-8 py-3.5 border-b flex items-center justify-between ${
          isDarkMode
            ? 'bg-[#0b1e27]/90 border-slate-800'
            : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <SmartClinicLogo className="w-9 h-9" glow={true} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight leading-none">
                Smart <span className="text-teal-400">Clinic</span>
              </span>
            </div>
            <p className="text-[9px] tracking-wider uppercase font-semibold text-slate-400">
              Health Hub
            </p>
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

          {/* Theme Toggle (matching screenshot) */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark mode</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Centered Authentication Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto relative">
        {/* Soft Background Radial Light */}
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-4">
          {/* Headline & Explanatory Copy */}
          <div className="text-center space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono">
              Secure Sign In
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Patients, clinic staff and administrators all sign in here. The system sends you to the right dashboard based on your role.
            </p>
          </div>

          {/* Authentication Card */}
          <div
            className={`p-6 sm:p-7 rounded-3xl border transition shadow-2xl space-y-5 ${
              isDarkMode
                ? 'bg-[#0f2933]/95 border-teal-900/50 shadow-teal-950/50'
                : 'bg-white border-slate-200 shadow-slate-200'
            }`}
          >
            {/* Role Switcher Tabs (Patient vs Staff/Provider) */}
            <div className="p-1 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleRoleTypeChange('patient')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authType === 'patient'
                    ? 'bg-teal-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient Login</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTypeChange('staff')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authType === 'staff'
                    ? 'bg-teal-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Staff / Provider</span>
              </button>
            </div>

            {/* If Staff: Quick Provider Role Selector */}
            {authType === 'staff' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">
                  Select Clinical Department / Position:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { role: 'doctor' as UserRole, label: 'Doctor / MD' },
                    { role: 'nurse' as UserRole, label: 'Nurse' },
                    { role: 'receptionist' as UserRole, label: 'Receptionist' },
                    { role: 'pharmacist' as UserRole, label: 'Pharmacist' },
                    { role: 'lab_technician' as UserRole, label: 'Lab Tech' },
                    { role: 'admin' as UserRole, label: 'Director / Admin' },
                  ].map((item) => (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => handleStaffRoleSelect(item.role)}
                      className={`px-2 py-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                        staffRole === item.role
                          ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Email / ID Field */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">
                  {authType === 'patient' ? 'Patient ID / Email address' : 'Staff Email address'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    placeholder={
                      authType === 'patient'
                        ? 'e.g. PAT-2026-001 or patient@smartclinic.ph'
                        : 'e.g. staff@smartclinic.test'
                    }
                    className="w-full bg-[#123440] border border-teal-800/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
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
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Show Password */}
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
                  onClick={() => setShowForgotNotice(true)}
                  className="text-teal-400 hover:underline cursor-pointer"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl font-bold text-sm bg-teal-400 hover:bg-teal-300 text-slate-950 transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>
            </form>

            {/* Registration Prompt */}
            <div className="pt-2 text-center text-xs text-slate-400 border-t border-teal-900/40">
              <span>No account yet? </span>
              <button
                onClick={() => {
                  switchRole('patient');
                  setActiveTab('dashboard');
                }}
                className="text-teal-400 hover:underline font-semibold cursor-pointer"
              >
                Register as a patient.
              </button>
            </div>
          </div>

          {/* 3. Philippine Security & Medical Encryption Trust Marks */}
          <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-800/40 space-y-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-2 font-bold text-white">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Philippine Medical Cloud Security & Encryption</span>
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
            <p className="text-[10px] text-slate-400 leading-tight">
              Patient health identifiers and electronic medical records are encrypted end-to-end under Philippine National Privacy Commission guidelines.
            </p>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotNotice && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 text-xs text-slate-200">
              <div className="flex items-center gap-2.5 text-white font-bold text-sm">
                <KeyRound className="w-5 h-5 text-teal-400" />
                <span>Reset Credentials</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                For security reasons under the Philippine Data Privacy Act, patient and provider password resets require two-factor identity verification through your registered clinic mobile number or hospital IT desk.
              </p>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
                Hospital Helpdesk: (02) 8888-7627 (Ext. 104)
              </div>
              <button
                onClick={() => setShowForgotNotice(false)}
                className="w-full py-2.5 rounded-xl font-bold bg-teal-400 text-slate-950 hover:bg-teal-300 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
