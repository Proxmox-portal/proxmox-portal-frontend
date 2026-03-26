import { useState, useCallback } from 'react';

// ── Validation rules ──────────────────────────────────────────────────────────

export const validators = {
  required: (value) =>
    !value || !value.toString().trim() ? 'Ce champ est requis.' : null,

  email: (value) =>
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? 'Adresse email invalide.'
      : null,

  minLength: (min) => (value) =>
    value && value.length < min
      ? `Minimum ${min} caractères requis.`
      : null,

  password: (value) => {
    if (!value) return 'Ce champ est requis.';
    if (value.length < 8) return 'Minimum 8 caractères.';
    if (!/[A-Z]/.test(value)) return 'Au moins une majuscule.';
    if (!/[0-9]/.test(value)) return 'Au moins un chiffre.';
    if (!/[^a-zA-Z0-9]/.test(value)) return 'Au moins un caractère spécial.';
    return null;
  },

  confirmPassword: (original) => (value) =>
    value !== original ? 'Les mots de passe ne correspondent pas.' : null,

  username: (value) => {
    if (!value || !value.trim()) return 'Ce champ est requis.';
    if (value.length < 3) return 'Minimum 3 caractères.';
    if (!/^[a-z0-9_-]+$/.test(value))
      return 'Lettres minuscules, chiffres, tirets et underscores uniquement.';
    return null;
  },
};

// ── Password strength ─────────────────────────────────────────────────────────

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', level: '' };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Faible',  level: 'weak'   };
  if (score <= 3) return { score, label: 'Moyen',   level: 'medium' };
  return           { score, label: 'Fort',    level: 'strong' };
}

// ── useForm hook ──────────────────────────────────────────────────────────────

/**
 * @param {Object} initialValues  - { fieldName: initialValue }
 * @param {Object} validationRules - { fieldName: [validatorFn, ...] }
 */
export function useForm(initialValues, validationRules = {}) {
  const [values, setValues]   = useState(initialValues);
  const [errors, setErrors]   = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }, [validationRules]);

  const handleChange = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const validateAll = useCallback(() => {
    const newErrors = {};
    let valid = true;
    Object.keys(validationRules).forEach((name) => {
      const error = validateField(name, values[name]);
      if (error) { newErrors[name] = error; valid = false; }
    });
    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    return valid;
  }, [values, validationRules, validateField]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, handleChange, handleBlur, validateAll, reset };
}
