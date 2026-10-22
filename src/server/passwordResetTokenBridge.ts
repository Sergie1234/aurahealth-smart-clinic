/**
 * Bridge helpers for Vercel-safe password reset.
 * Re-exported from verificationService for serverApp consumers.
 */
export {
  createPasswordResetToken,
  verifyPasswordResetToken,
  verificationService,
} from './services/verificationService';
