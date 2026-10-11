import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => faDigits[Number(d)]);
}

export function formatPrice(value: number): string {
  return toFa(value.toLocaleString('en-US'));
}

export function discountPercent(price: number, original?: number) {
  if (!original || original <= price) return null;
  return Math.round(((original - price) / original) * 100);
}
