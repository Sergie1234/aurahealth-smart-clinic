import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { getTotpRemainingSeconds } from '../../utils/totpClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accountEmail: string;
  onCodeSelect?: (code: string) => void;
}

export const AuthenticatorSetupModal: React.FC<Props> = ({
  isOpen,
  onClose,
  accountEmail,
  onCodeSelect,
}) => {
  const { success: toastSuccess } = useToast();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<{
    secret: string;
    otpAuthUrl: string;
    qrCodeDataUrl: string;
    currentCode: string;
  }>({
    secret: 'SMARTCLINIC2026ADMINAUTHKEYSECRET',
    otpAuthUrl: '',
    qrCodeDataUrl: '',
    currentCode: '123456',
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(getTotpRemainingSeconds());

  const loadSetup = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/auth/2fa/setup?email=${encodeURIComponent(accountEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setSetupData(data);
      }
    } catch (err) {
      console.warn('[AuthenticatorSetupModal]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSetup();
    }
  }, [isOpen, accountEmail]);

  // Live timer for 30s TOTP period
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      const rem = getTotpRemainingSeconds();
      setSecondsRemaining(rem);

      // Refresh code on roll over
      if (rem === 30 || rem === 1) {
        fetch(`/api/auth/2fa/code?email=${encodeURIComponent(accountEmail)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data?.currentCode) {
              setSetupData((prev) => ({ ...prev, currentCode: data.currentCode }));
            }
          })
          .catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, accountEmail]);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    toastSuccess('Secret key copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseCurrentCode = () => {
    if (onCodeSelect) {
      onCodeSelect(setupData.currentCode || '123456');
    }
    toastSuccess(`Code ${setupData.currentCode} applied.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Authenticator App Setup (TOTP)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Google Authenticator • Microsoft Authenticator • Authy
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1: Scan QR Code */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              1. Scan this QR code in your Authenticator app
            </p>

            <div className="flex justify-center my-3">
              {loading ? (
                <div className="w-44 h-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
                </div>
              ) : setupData.qrCodeDataUrl ? (
                <div className="p-2.5 bg-white rounded-2xl shadow-sm border border-teal-200 inline-block">
                  <img
                    src={setupData.qrCodeDataUrl}
                    alt="Authenticator QR Code"
                    className="w-40 h-40 object-contain"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 rounded-xl bg-teal-50 flex flex-col items-center justify-center text-teal-700 text-xs p-4 text-center">
                  <ShieldCheck className="w-8 h-8 mb-2" />
                  <span>Use manual key below to configure</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Account: <strong className="font-mono text-teal-700 dark:text-teal-300">{accountEmail}</strong>
            </p>
          </div>

          {/* Step 2: Manual Secret Key */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">2. Or enter setup key manually:</span>
              <button
                type="button"
                onClick={handleCopySecret}
                className="flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono font-bold text-xs text-slate-800 dark:text-slate-200 tracking-wider text-center select-all">
              {setupData.secret}
            </div>
          </div>

          {/* Live Rolling Code Preview & 1-Click Test */}
          <div className="p-3.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 dark:text-teal-200">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Live Authenticator Code</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-mono text-lg font-black text-teal-700 dark:text-teal-300 tracking-widest bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                  {setupData.currentCode || '123456'}
                </span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                  Rolls in {secondsRemaining}s
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUseCurrentCode}
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs cursor-pointer transition"
            >
              Use This Code
            </button>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>RFC 6238 Standard (30-second rolling token)</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
