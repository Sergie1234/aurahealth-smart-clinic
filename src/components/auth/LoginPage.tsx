import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useClinic, PrimaryAuthRole, StaffSubRole } from '../../context/ClinicContext';
import { SmartClinicLogo } from '../common/SmartClinicLogo';
import {
  User, Building2, Stethoscope, ShieldAlert, Eye, EyeOff, ArrowLeft,
  AlertTriangle, Shield, Mail, Phone,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, setActiveTab, requestPhoneOtp, registerPatient, pendingAction, verifyPhoneOtp } = useClinic();
  const { isDark: isDarkMode } = useTheme();

  const [selectedRole, setSelectedRole] = useState<PrimaryAuthRole>('patient');
  const [staffSubRole, setStaffSubRole] = useState<StaffSubRole>('nurse');
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('patient.vance@smartclinic.ph');
  const [password, setPassword] = useState('password');
  const [phone, setPhone] = useState('+63 ');
  const [otpCode, setOtpCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: PrimaryAuthRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    setAuthMode('signin');
    setMethod('email');
    if (role === 'patient') {
      setEmail('patient.vance@smartclinic.ph');
      setPassword('password');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole !== 'patient') {
        if (!email || !password) {
          setErrorMessage('Please provide both email and password.');
          return;
        }
        const res = login({
          primaryRole: selectedRole,
          subRole: selectedRole === 'staff' ? staffSubRole : undefined,
          email,
          password,
        });
        if (!res.success) setErrorMessage(res.error || 'Login failed');
        return;
      }
      if (method === 'email') {
        if (authMode === 'register') {
          const res = registerPatient({ fullName, email, password });
          if (!res.success) setErrorMessage(res.error || 'Registration failed');
          return;
        }
        if (!email || !password) {
          setErrorMessage('Please provide both email and password.');
          return;
        }
        const res = login({ primaryRole: 'patient', email, password, method: 'email' });
        if (!res.success) setErrorMessage(res.error || 'Login failed');
        return;
      }
      const otpCheck = verifyPhoneOtp(phone, otpCode);
      if (!otpCheck.success) {
        setErrorMessage(otpCheck.error || 'Invalid OTP');
        return;
      }
      if (authMode === 'register') {
        const res = registerPatient({ fullName, phone, password: otpCode });
        if (!res.success) setErrorMessage(res.error || 'Registration failed');
        return;
      }
      const res = login({
        primaryRole: 'patient',
        email: phone,
        phone,
        twoFactorCode: otpCode,
        method: 'phone',
      });
      if (!res.success) setErrorMessage(res.error || 'Login failed');
    }, 350);
  };

  const sendOtp = () => {
    setErrorMessage(null);
    const res = requestPhoneOtp(phone);
    if (!res.success) {
      setErrorMessage(res.error || 'Could not send OTP');
      return;
    }
    setDemoCode(res.demoCode || null);
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
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </button>
        <SmartClinicLogo className="w-8 h-8" />
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className={`w-full max-w-md rounded-2xl border ${cardBg} overflow-hidden`}>
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-lg font-black tracking-tight">Smart Clinic Access</h1>
            <p className={`text-[11px] mt-1 ${muted}`}>
              {pendingAction === 'book'
                ? 'Sign in or create an account to open the appointment schedule form. You will only see your own record.'
                : 'Secure sign-in for patients, staff, doctors, and admin.'}
            </p>
            <div className={`mt-3 flex items-center gap-1.5 text-[10px] font-medium ${muted}`}>
              <Shield className="w-3 h-3 text-teal-500" /> Philippine Health Data Security · RA 10173
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
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {selectedRole === 'patient' && (
            <div className="px-4 pt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setAuthMode('signin')} className={`py-2 rounded-lg text-[11px] font-bold cursor-pointer ${authMode === 'signin' ? 'bg-teal-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                Sign in
              </button>
              <button type="button" onClick={() => setAuthMode('register')} className={`py-2 rounded-lg text-[11px] font-bold cursor-pointer ${authMode === 'register' ? 'bg-teal-600 text-white' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                Create account
              </button>
              <button type="button" onClick={() => setMethod('email')} className={`col-span-1 py-2 rounded-lg text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1 ${method === 'email' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                <Mail className="w-3 h-3" /> Email
              </button>
              <button type="button" onClick={() => setMethod('phone')} className={`col-span-1 py-2 rounded-lg text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1 ${method === 'phone' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                <Phone className="w-3 h-3" /> Phone + OTP
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {errorMessage && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{errorMessage}
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

            {selectedRole === 'patient' && authMode === 'register' && (
              <div>
                <label className="text-[11px] font-semibold block mb-1">Full name *</label>
                <input required className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Dela Cruz" />
              </div>
            )}

            {selectedRole === 'patient' && method === 'phone' ? (
              <>
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Mobile number *</label>
                  <input required className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 917 123 4567" />
                </div>
                <button type="button" onClick={sendOtp} className="px-3 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[11px] font-bold cursor-pointer">
                  Send OTP
                </button>
                {demoCode && (
                  <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-300">
                    Simulated SMS code: {demoCode}
                  </p>
                )}
                <div>
                  <label className="text-[11px] font-semibold block mb-1">OTP code *</label>
                  <input required inputMode="numeric" maxLength={6} className={inputCls} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="6-digit code" />
                </div>
                <p className={`text-[10px] ${muted}`}>No real SMS is sent in this demo. Use the code shown above to continue.</p>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[11px] font-semibold block mb-1">Email *</label>
                  <input required type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
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
              {isLoading
                ? 'Please wait…'
                : selectedRole === 'patient' && authMode === 'register'
                  ? 'Create account & continue'
                  : selectedRole === 'patient' && method === 'phone'
                    ? 'Verify & continue'
                    : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
