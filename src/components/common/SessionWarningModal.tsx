import React from 'react';
import { Clock } from 'lucide-react';
import { useClinic } from '../../context/ClinicContext';

export const SessionWarningModal: React.FC = () => {
  const { showSessionWarning, sessionSecondsRemaining, resetSessionTimer, logout, language } = useClinic();
  if (!showSessionWarning) return null;

  const mins = Math.floor(sessionSecondsRemaining / 60);
  const secs = sessionSecondsRemaining % 60;
  const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-amber-400 max-w-md w-full p-6 space-y-5 text-center font-sans text-slate-800 dark:text-slate-100">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {language === 'fil' ? '⚠️ Babala sa Pag-expire ng Sesyon' : '⚠️ Session Expiration Warning'}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {language === 'fil'
              ? `Mag-e-expire ang iyong secure medical session sa loob ng `
              : `Your secure clinical session will expire in `}
            <strong className="text-amber-600 dark:text-amber-400 font-bold text-sm">{timeStr}</strong>
            {language === 'fil' ? ` dahil sa kawalan ng aktibidad.` : ` due to inactivity.`}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={resetSessionTimer}
            className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-teal-900/20 transition cursor-pointer"
          >
            {language === 'fil' ? 'Manatiling Nakalog-in' : 'Stay Logged In'}
          </button>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition cursor-pointer"
          >
            {language === 'fil' ? 'Mag-logout' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  );
};
