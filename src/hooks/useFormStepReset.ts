/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';

export interface UseFormStepResetOptions<TStep extends string | number, TData = Record<string, any>> {
  initialStep: TStep;
  /** Optional initial step form data */
  initialData?: TData;
  /** Optional callback fired when step transitions occur */
  onStepChange?: (fromStep: TStep, toStep: TStep) => void;
  /** Optional callback fired when form is completely reset */
  onReset?: () => void;
}

/**
 * useFormStepReset
 * 
 * A reusable hook designed to eliminate stale form state, unwanted browser autofill bleed,
 * and input element reuse across steps, auth modes, and verification methods.
 */
export function useFormStepReset<TStep extends string | number, TData = Record<string, any>>({
  initialStep,
  initialData,
  onStepChange,
  onReset,
}: UseFormStepResetOptions<TStep, TData>) {
  const [currentStep, setCurrentStep] = useState<TStep>(initialStep);
  const [formData, setFormData] = useState<TData>((initialData || {}) as TData);
  // Monotonically increasing mount counter to guarantee fresh keys on back/reset
  const [lifecycleVersion, setLifecycleVersion] = useState<number>(0);
  const previousStepRef = useRef<TStep>(initialStep);

  /**
   * Transition to a new step. If moving backwards or branching,
   * caller can pass custom clean-up actions or data overrides.
   */
  const goToStep = useCallback(
    (nextStep: TStep, dataOverrides?: Partial<TData>) => {
      const prev = currentStep;
      previousStepRef.current = prev;
      setCurrentStep(nextStep);
      setLifecycleVersion((v) => v + 1);

      if (dataOverrides) {
        setFormData((current) => ({
          ...current,
          ...dataOverrides,
        }));
      }

      if (onStepChange) {
        onStepChange(prev, nextStep);
      }
    },
    [currentStep, onStepChange]
  );

  /**
   * Cleanly reset specific keys or all keys back to initial/clean state
   */
  const resetFields = useCallback((keysToReset?: Array<keyof TData>) => {
    setLifecycleVersion((v) => v + 1);
    if (!keysToReset || keysToReset.length === 0) {
      setFormData((initialData || {}) as TData);
    } else {
      setFormData((current) => {
        const next = { ...current };
        keysToReset.forEach((key) => {
          delete next[key];
        });
        return next;
      });
    }
  }, [initialData]);

  /**
   * Complete reset of the entire multi-step form flow
   */
  const resetAll = useCallback(() => {
    setCurrentStep(initialStep);
    setFormData((initialData || {}) as TData);
    setLifecycleVersion((v) => v + 1);
    previousStepRef.current = initialStep;
    if (onReset) {
      onReset();
    }
  }, [initialStep, initialData, onReset]);

  /**
   * Helper to update specific field values safely
   */
  const setFieldValue = useCallback(<K extends keyof TData>(field: K, value: TData[K]) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  /**
   * Generates a unique key for DOM inputs based on current step, lifecycle version,
   * and field identifier to prevent React DOM reuse and browser autofill bleed.
   */
  const getFieldKey = useCallback(
    (fieldIdentifier: string, branchQualifier?: string) => {
      const branch = branchQualifier ? `-${branchQualifier}` : '';
      return `field-${currentStep}${branch}-${fieldIdentifier}-${lifecycleVersion}`;
    },
    [currentStep, lifecycleVersion]
  );

  /**
   * Generates production-safe security props for inputs (TOTP codes, OTPs, new passwords)
   * to guarantee browsers do not mistakenly autofill old credentials across steps.
   */
  const getSecureInputProps = useCallback(
    (
      fieldIdentifier: string,
      type: 'password' | 'code' | 'email' | 'text',
      options?: {
        branchQualifier?: string;
        isNewPassword?: boolean;
        disableAutofill?: boolean;
      }
    ) => {
      const key = getFieldKey(fieldIdentifier, options?.branchQualifier);
      const isNew = options?.isNewPassword;
      const disableAutofill = options?.disableAutofill ?? true;

      let autoCompleteValue = 'off';
      if (type === 'password') {
        autoCompleteValue = isNew ? 'new-password' : 'current-password';
      } else if (type === 'code') {
        autoCompleteValue = 'one-time-code';
      } else if (type === 'email') {
        autoCompleteValue = disableAutofill ? 'off' : 'email';
      }

      return {
        key,
        autoComplete: autoCompleteValue,
        autoCorrect: 'off' as const,
        autoCapitalize: 'none' as const,
        spellCheck: false,
        'data-step-lifecycle': `${currentStep}-${lifecycleVersion}`,
      };
    },
    [getFieldKey, currentStep, lifecycleVersion]
  );

  return {
    currentStep,
    previousStep: previousStepRef.current,
    formData,
    setFormData,
    setFieldValue,
    goToStep,
    resetFields,
    resetAll,
    getFieldKey,
    getSecureInputProps,
    lifecycleVersion,
  };
}
