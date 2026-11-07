/**
 * Input normalization shared by public forms, checkout and the admin panel.
 * Pure functions only, safe to import from both server and client code.
 */

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Convert Persian/Arabic digits to ASCII digits. */
export function toEnDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const fa = FA_DIGITS.indexOf(ch);
    return String(fa >= 0 ? fa : AR_DIGITS.indexOf(ch));
  });
}

/**
 * Normalize an Iranian mobile number to the canonical `09xxxxxxxxx` form.
 * Accepts `09…`, `9…`, `+989…`, `00989…` and `989…`, with Persian digits,
 * spaces, dashes or parentheses. Returns null when it is not a valid mobile.
 */
export function normalizeMobile(input: string): string | null {
  let d = toEnDigits(String(input ?? '')).replace(/[\s\-()]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('0098')) d = d.slice(4);
  else if (d.startsWith('98') && d.length === 12) d = d.slice(2);
  if (d.length === 10 && d.startsWith('9')) d = `0${d}`;
  return /^09\d{9}$/.test(d) ? d : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate an Iranian national code (کد ملی) including its check digit. */
export function isValidNationalCode(input: string): boolean {
  const code = toEnDigits(input).trim();
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false;
  const digits = code.split('').map(Number);
  const sum = digits.slice(0, 9).reduce((acc, n, i) => acc + n * (10 - i), 0);
  const r = sum % 11;
  const check = digits[9];
  return r < 2 ? check === r : check === 11 - r;
}
