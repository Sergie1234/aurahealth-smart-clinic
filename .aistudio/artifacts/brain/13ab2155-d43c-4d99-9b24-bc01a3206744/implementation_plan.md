# Implementation Plan: Fixing 2FA/OTP Permissive Fallback

## Goal
Fix a security vulnerability where 2FA/OTP verification allows any 6-digit input as valid during network failures in the "Smart Clinic" application.

## Changes
1. **ClinicContext.tsx**: 
   - Modify the `catch` block in the `login` function. Instead of "failing open", it should perform a strict check. If 2FA is required, it MUST NOT allow access.
   - For other login types, ensure that offline fallback only allows login if it's NOT a high-security context or if it's explicitly allowed in development environments (not production).
2. **ForgotPasswordModal.tsx**:
   - Modify the `catch` block in the `handleConfirmReset` function.
   - Replace the permissive "update locally" logic with a strict check against the hardcoded demonstration code `123456`.
   - **Important**: This demonstration code MUST NOT be accepted in production environments.

## Verification
1. **Testing**: 
   - Simulate a network failure (or disconnect internet).
   - Attempt to log in with an incorrect 2FA/OTP code. The system should reject it.
   - Attempt to log in with the correct code `123456` in a local development environment. The system should accept it.
   - Attempt to log in with the correct code in a production environment (mocked). It should be rejected if the server is unreachable.
2. **Security Check**: Confirm that RA 10173 compliance is maintained by ensuring no unauthorized access is granted.
