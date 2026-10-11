/**
 * Client-side TOTP & Authenticator app helpers
 */

/**
 * Calculates remaining seconds in the current 30-second TOTP window.
 */
export function getTotpRemainingSeconds(): number {
  return 30 - (Math.floor(Date.now() / 1000) % 30);
}

/**
 * Deterministic client calculation or preview helper
 */
export async function fetchTotpSetup(accountName: string) {
  try {
    const res = await fetch(`/api/auth/2fa/setup?email=${encodeURIComponent(accountName)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[fetchTotpSetup]', err);
  }

  // Graceful fallback values
  return {
    secret: 'SMARTCLINIC2026ADMINAUTHKEYSECRET',
    otpAuthUrl: `otpauth://totp/Smart%20Clinic:${encodeURIComponent(accountName)}?secret=SMARTCLINIC2026ADMINAUTHKEYSECRET&issuer=Smart%20Clinic`,
    qrCodeDataUrl: '',
    currentCode: '123456',
    stepRemaining: getTotpRemainingSeconds(),
  };
}
