import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useClinic, PrimaryAuthRole, StaffSubRole } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  User, Building2, Stethoscope, ShieldAlert, Eye, EyeOff, ArrowLeft,
  CheckCircle2, AlertTriangle, Shield, Phone, Mail,
} from 'lucide-react';

type AuthMode = 'signin' | 'register';
type PatientMethod = 'email' | 'phone';

export const LoginPage: React.FC = () => {
  const { login, registerPatient, requestOtp, setActiveTab, pendingBooking } = useClinic();
  const { isDark: isDarkMode } = useTheme();

  const [selectedRole, setSelectedRole] = useState<PrimaryAuthRole>('patient');
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole>('nurse');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [patientMethod, setPatientMethod] = useState<PatientMethod>('email');

  const [email, setEmail] = useState('elena.vargas@example.com');
  const [password, setPassword] = useState('password');
  const [phone, setPhone] = useState('+63 917 234 5678');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: PrimaryAuthRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setSuccessMessage(null);
    setAuthMode('signin');
    if (role === 'patient') {
      setEmail('elena.vargas@example.com');
      setPassword('password');
      setPhone('+63 917 234 5678');
    } else if (role === 'staff') {
      setEmail(`${staffSubRole}@smartclinic.ph`);
      setPassword('password');
    } else if (role === 'doctor') {
      setEmail('dr.sarahlin@smartclinic.ph');
      setPassword('password');
    } else {
      setEmail('smartclinicrealacc@gmail.com');
      setPassword('');
    }
  };

  const handleSendOtp = () => {
    setErrorMessage(null);
    const res = requestOtp(phone);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to send OTP');
      return;
    }
    setOtpSent(true);
    setDemoOtp(res.demoOtp || '123456');
    setSuccessMessage(`OTP sent to ${phone}. Demo code: ${res.demoOtp || '123456'}`);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === 'patient' && patientMethod === 'phone') {
        const res = login({ primaryRole: 'patient', method: 'phone', phone, otp });
        if (!res.success) setErrorMessage(res.error || 'Login failed');
        return;
      }
      const res = login({
        primaryRole: selectedRole,
        subRole: selectedRole === 'staff' ? staffSubRole : undefined,
        email,
        password,
        method: 'email',
      });
      if (!res.success) setErrorMessage(res.error || 'Login failed');
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = registerPatient({
        fullName: regName,
        email: regEmail || undefined,
        phone: regPhone || undefined,
        password: regPassword || undefined,
      });
      if (!res.success) setErrorMessage(res.error || 'Registration failed');
      else setSuccessMessage('Account created. You are now signed in.');
    }, 400);
  };

  const cardBg = isDarkMode ? 'bg-[#0b1e27]/95 border-slate-800' : 'bg-white border-slate-200 shadow-lg';
  const pageBg = isDarkMode ? 'bg-[#0b1e27] text-slate-100' : 'bg-slate-50 text-slate-900';
  const muted = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const inputCls = `w-full px-3 py-2 rounded-lg text-xs border ${
    isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
  } focus:outline-none focus:ring-2 focus:ring-teal-500/30`;

  return (
    <div className={`min-h-screen flex flex-col ${pageBg}`}>
      <div className="p-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <button onClick={() => setActiveTab('home')} className={`text-xs font-semibold flex items-center gap-1.5 hover:text-teal-400 transition cursor-pointer ${muted}`} type="button">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to home
        </button>
        <SmartClinicLogo className="w-8 h-8" />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className={`w-full max-w-md rounded-2xl border ${cardBg} overflow-hidden`}>
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-lg font-black tracking-tight">Smart Clinic Access</h1>
            <p className={`text-[11px] mt-1 ${muted}`}>
              {pendingBooking
                ? 'Sign in or create an account to continue booking. Patients only see their own record.'
                : 'Secure sign-in for patients, staff, doctors, and admin.'}
            </p>
            <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-medium ${muted}`}>
              <Shield className="w-3 h-3 text-teal-500" />
              Philippine Health Data Security · RA 10173
            </div>
          </div>

          <div className="p-4 grid grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-700">
            {([
              { role: 'patient' as const, icon: User, label: 'Patient' },
              { role: 'staff' as const, icon: Building2, label: 'Staff' },
              { role: 'doctor' as const, icon: Stethoscope, label: 'Doctor' },
              { role: 'admin' as const, icon: ShieldAlert, label: 'Admin' },
            ]).map(({ role, icon: Icon, label }) => (
              <button key={role} type="button" onClick={() => handleRoleSelect(role)} className={`flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-bold transition cursor-pointer border ${
                selectedRole === role
                  ? 'bg-teal-500/15 border-teal-500/40 text-teal-600 dark:text-teal-300'
                  : isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {selectedRole === 'patient' && (
            <div className="px-4 pt-3 flex gap-2">
              <button type="button" onClick={() => { setAuthMode('signin'); setErrorMessage(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer ${authMode === 'signin' ? 'bg-teal-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Sign In</button>
              <button type="button" onClick={() => { setAuthMode('register'); setErrorMessage(null); }} className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer ${authMode === 'register' ? 'bg-teal-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>Create Account</button>
            </div>
          )}

          <div className="p-4 space-y-3">
            {errorMessage && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />{successMessage}
              </div>
            )}

            {selectedRole === 'patient' && authMode === 'register' ? (
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Full name *</label>
                  <input required className={inputCls} value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Juan Dela Cruz" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Email (optional if phone provided)</label>
                  <input type="email" className={inputCls} value={regEmail} onChange={(e) => setRegEmail(e.target.value)} placeholder="you@email.com" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Phone (optional if email provided)</label>
                  <input className={inputCls} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+63 917 123 4567" />
                </div>
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Password (for email login)</label>
                  <input type="password" className={inputCls} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Create a password" />
                </div>
                <p className={`text-[10px] ${muted}`}>Provide at least an email or a phone number. After registration you only see your own record.</p>
                <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer disabled:opacity-60">
                  {isLoading ? 'Creating…' : 'Create account & continue'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-3">
                {selectedRole === 'patient' && (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => { setPatientMethod('email'); setOtpSent(false); }} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold cursor-pointer ${patientMethod === 'email' ? 'bg-teal-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <Mail className="w-3.5 h-3.5" /> Email
                    </button>
                    <button type="button" onClick={() => setPatientMethod('phone')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold cursor-pointer ${patientMethod === 'phone' ? 'bg-teal-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      <Phone className="w-3.5 h-3.5" /> Phone + OTP
                    </button>
                  </div>
                )}

                {selectedRole === 'staff' && (
                  <div>
                    <label className="text-[11px] font-semibold block mb-1">Staff role</label>
                    <select className={inputCls} value={staffSubRole} onChange={(e) => { setStaffSubRole(e.target.value as StaffSubRole); setEmail(`${e.target.value}@smartclinic.ph`); }}>
                      <option value="nurse">Nurse</option>
                      <option value="pharmacist">Pharmacist</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="lab_technician">Lab Technician</option>
                    </select>
                  </div>
                )}

                {selectedRole === 'patient' && patientMethod === 'phone' ? (
                  <>
                    <div>
                      <label className="text-[11px] font-semibold block mb-1">Mobile number *</label>
                      <input required className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 917 234 5678" />
                      <p className={`text-[10px] mt-1 ${muted}`}>Demo patient: +63 917 234 5678 (Elena Vargas)</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={handleSendOtp} className="px-3 py-2 rounded-lg text-[11px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 cursor-pointer">Send OTP</button>
                      {otpSent && demoOtp && <span className="text-[10px] self-center text-teal-600 dark:text-teal-300 font-semibold">Demo OTP: {demoOtp}</span>}
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold block mb-1">OTP code *</label>
                      <input required className={inputCls} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-[11px] font-semibold block mb-1">Email *</label>
                      <input required type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
                      {selectedRole === 'patient' && <p className={`text-[10px] mt-1 ${muted}`}>Demo: elena.vargas@example.com</p>}
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold block mb-1">Password *</label>
                      <div className="relative">
                        <input required type={showPassword ? 'text' : 'password'} className={`${inputCls} pr-9`} value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer disabled:opacity-60">
                  {isLoading ? 'Signing in…' : pendingBooking ? 'Sign in & book' : 'Sign in'}
                </button>

                {selectedRole === 'patient' && (
                  <p className={`text-center text-[10px] ${muted}`}>
                    No account?{' '}
                    <button type="button" onClick={() => setAuthMode('register')} className="text-teal-600 dark:text-teal-400 font-bold cursor-pointer">Create one</button>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
