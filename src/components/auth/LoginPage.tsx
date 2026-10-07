import React, { useState } from 'react';
import { useClinic, PrimaryAuthRole, StaffSubRole } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  User,
  Building2,
  Stethoscope,
  ShieldAlert,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Shield,
  Send,
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const {
    login,
    setActiveTab,
    simulateSendAdmin2FA,
    admin2FACode,
  } = useClinic();

  const [isDarkMode, setIsDarkMode] = useState(true);

  // 1. Strict 4-way Role Selector: 'patient' | 'staff' | 'doctor' | 'admin'
  const [selectedRole, setSelectedRole] = useState<PrimaryAuthRole>('patient');

  // Staff sub-role (Mandatory: Pharmacist, Nurse, Receptionist, Lab Tech)
  // STRICT CONSTRAINT: Do NOT include 'Doctor' or 'Admin'
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole>('nurse');

  // Form Fields
  const [email, setEmail] = useState('patient.vance@smartclinic.ph');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  // Admin 2FA Intercept State
  const [is2FAIntercepted, setIs2FAIntercepted] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [simulatedEmailNotification, setSimulatedEmailNotification] = useState<string | null>(null);

  // Status & Error handling
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle switching between the 4 unified roles
  const handleRoleSelect = (role: PrimaryAuthRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setIs2FAIntercepted(false);
    setTwoFactorCode('');
    setSimulatedEmailNotification(null);

    // Autofill demo emails for convenience
    switch (role) {
      case 'patient':
        setEmail('patient.vance@smartclinic.ph');
        break;
      case 'staff':
        setEmail(`${staffSubRole}@smartclinic.ph`);
        break;
      case 'doctor':
        setEmail('dr.sarahlin@smartclinic.ph');
        break;
      case 'admin':
        setEmail('admin.sterling@smartclinic.ph');
        break;
    }
  };

  const handleStaffSubRoleChange = (sub: StaffSubRole) => {
    setStaffSubRole(sub);
    setEmail(`${sub}@smartclinic.ph`);
  };

  // Mock Authentication Logic with Admin 2FA Interception
  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email address and password.');
      return;
    }

    // If Admin role: intercept login and display 2FA input field
    if (selectedRole === 'admin' && !is2FAIntercepted) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIs2FAIntercepted(true);

        // Simulate sending verification email from smartclinicrealacc@gmail.com
        const generatedCode = simulateSendAdmin2FA();
        setSimulatedEmailNotification(
          `New Message from: smartclinicrealacc@gmail.com\nSubject: Smart Clinic 2FA Passcode\nYour one-time authorization code is: ${generatedCode}`
        );
      }, 400);
      return;
    }

    // Submit full login credentials
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = login({
        primaryRole: selectedRole,
        subRole: selectedRole === 'staff' ? staffSubRole : undefined,
        email,
        password,
        twoFactorCode: selectedRole === 'admin' ? twoFactorCode : undefined,
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
      {/* 1. Header Bar */}
      <header
        className={`px-4 sm:px-8 py-3.5 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-[#0b1e27]/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
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
              Health Hub Access
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
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* 2. Main Authentication Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 my-auto relative">
        <div className="w-full max-w-lg relative z-10 space-y-4">
          {/* Card Header & Headline */}
          <div className="text-center space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono">
              Strict 4-Role Authentication
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Access Portal
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Strict role-based isolation for Patients, Staff, Physicians, and Administrators.
            </p>
          </div>

          {/* Unified Login Card */}
          <div
            className={`p-6 sm:p-7 rounded-3xl border transition shadow-2xl space-y-5 ${
              isDarkMode
                ? 'bg-[#0f2933]/95 border-teal-900/50 shadow-teal-950/50'
                : 'bg-white border-slate-200 shadow-slate-200'
            }`}
          >
            {/* 4-Way Role Switcher: Patient | Staff | Doctor | Admin */}
            <div className="p-1 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-4 gap-1">
              {/* 1. Patient */}
              <button
                type="button"
                onClick={() => handleRoleSelect('patient')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'patient'
                    ? 'bg-teal-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient</span>
              </button>

              {/* 2. Staff */}
              <button
                type="button"
                onClick={() => handleRoleSelect('staff')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'staff'
                    ? 'bg-teal-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Staff</span>
              </button>

              {/* 3. Doctor */}
              <button
                type="button"
                onClick={() => handleRoleSelect('doctor')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'doctor'
                    ? 'bg-teal-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>

              {/* 4. Admin */}
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-teal-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* If Staff: Mandatory Sub-Role Dropdown (Strict: NO Doctor, NO Admin) */}
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

            {/* Main Form */}
            <form onSubmit={handleSubmitCredentials} className="space-y-4 text-xs">
              {/* Standard Email / ID Field */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300 block">
                  {selectedRole === 'patient'
                    ? 'Patient Email or MRN Identifier'
                    : `${selectedRole.toUpperCase()} Professional Email`}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full bg-[#123440] border border-teal-800/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 transition"
                  />
                </div>
              </div>

              {/* Standard Password Field */}
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

              {/* Admin 2FA Intercept Section */}
              {selectedRole === 'admin' && is2FAIntercepted && (
                <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-700/60 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                    <KeyRound className="w-4 h-4 text-indigo-400" />
                    <span>Two-Factor Authentication (2FA) Required</span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    A secure verification passcode has been dispatched from{' '}
                    <span className="font-mono font-bold text-teal-300">smartclinicrealacc@gmail.com</span>{' '}
                    to your authorized inbox.
                  </p>

                  {/* 2FA Input Field */}
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                      Enter 6-Digit Passcode:
                    </label>
                    <input
                      type="text"
                      required
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="e.g. 842915"
                      maxLength={8}
                      className="w-full bg-[#0a232e] border border-indigo-500/80 rounded-xl px-3.5 py-2.5 text-center font-mono text-base tracking-widest text-teal-300 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Simulated Email Verification Helper */}
                  {simulatedEmailNotification && (
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-[10px] text-slate-300 font-mono space-y-1">
                      <div className="text-teal-400 font-bold flex items-center justify-between">
                        <span>Simulated Dispatch Received</span>
                        <button
                          type="button"
                          onClick={() => setTwoFactorCode(admin2FACode)}
                          className="text-xs text-amber-300 hover:underline cursor-pointer"
                        >
                          Autofill {admin2FACode}
                        </button>
                      </div>
                      <p className="text-slate-400 leading-tight whitespace-pre-wrap">
                        {simulatedEmailNotification}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => {
                        const newCode = simulateSendAdmin2FA();
                        setSimulatedEmailNotification(
                          `New Message from: smartclinicrealacc@gmail.com\nSubject: Smart Clinic 2FA Passcode\nYour one-time authorization code is: ${newCode}`
                        );
                      }}
                      className="text-teal-400 hover:underline cursor-pointer"
                    >
                      Resend code from smartclinicrealacc@gmail.com
                    </button>
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
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

              {/* Action Submit Button */}
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
                ) : selectedRole === 'admin' && !is2FAIntercepted ? (
                  <span>Verify Credentials & Request 2FA</span>
                ) : selectedRole === 'admin' && is2FAIntercepted ? (
                  <span>Confirm 2FA & Access Admin Dashboard</span>
                ) : (
                  <span>Sign In to {selectedRole.toUpperCase()} Dashboard</span>
                )}
              </button>
            </form>
          </div>

          {/* Security Compliance Trust Marks */}
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

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 text-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Reset Account Access</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {forgotEmailSent ? (
              <div className="p-4 rounded-xl bg-teal-950/50 border border-teal-800/80 text-teal-300 text-xs space-y-2">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Recovery Instructions Dispatched</span>
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  We have sent a secure temporary access link to <span className="font-mono font-semibold text-teal-200">{email}</span>. Please check your inbox and spam folder.
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
                  Enter your registered medical staff or patient email address. We will verify your identity according to Philippine Data Privacy standards and send recovery instructions.
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
