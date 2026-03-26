import { useState, useRef, useCallback } from 'react';

const OTP_LENGTH = 6;

/**
 * Manages the 6-box TOTP input behaviour:
 * - Auto-focus next box on digit entry
 * - Backspace moves focus to previous box
 * - Paste fills all boxes at once
 * - Countdown timer with urgent state at ≤ 10 s
 */
export function useOtp(initialSeconds = 30) {
  const [digits, setDigits]     = useState(Array(OTP_LENGTH).fill(''));
  const [hasError, setHasError] = useState(false);
  const [seconds, setSeconds]   = useState(initialSeconds);
  const inputRefs               = useRef([]);
  const timerRef                = useRef(null);

  // Start / restart the countdown
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setSeconds(initialSeconds);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(timerRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  }, [initialSeconds]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (next[index]) {
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = '';
        setDigits(next);
        inputRefs.current[index - 1]?.focus();
      }
      setHasError(false);
    }
  }, [digits]);

  const handleInput = useCallback((index, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = digits.slice();
    next[index] = val;
    setDigits(next);
    setHasError(false);
    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }, []);

  const reset = useCallback(() => {
    setDigits(Array(OTP_LENGTH).fill(''));
    setHasError(false);
    inputRefs.current[0]?.focus();
  }, []);

  const triggerError = useCallback(() => {
    setHasError(true);
    reset();
  }, [reset]);

  const code         = digits.join('');
  const isComplete   = code.length === OTP_LENGTH;
  const isExpired    = seconds === 0;
  const isUrgent     = seconds <= 10 && !isExpired;

  return {
    digits,
    hasError,
    isComplete,
    isExpired,
    isUrgent,
    seconds,
    inputRefs,
    startTimer,
    handleKeyDown,
    handleInput,
    handlePaste,
    reset,
    triggerError,
    code,
  };
}
