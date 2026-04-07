import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { EthDateTime } from 'ethiopian-date';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  try {
    const ethDate = EthDateTime.fromJSDate(d);
    return `${ethDate.day}/${ethDate.month}/${ethDate.year} (EC) ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  } catch (e) {
    return d.toLocaleDateString();
  }
}

export function toEthiopian(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  try {
    const ethDate = EthDateTime.fromJSDate(d);
    return `${ethDate.day}/${ethDate.month}/${ethDate.year}`;
  } catch (e) {
    return '';
  }
}
