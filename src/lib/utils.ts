import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export const SEGMENT_COLORS = [
  'bg-blue-50 border-blue-300',
  'bg-purple-50 border-purple-300',
  'bg-green-50 border-green-300',
  'bg-amber-50 border-amber-300',
  'bg-rose-50 border-rose-300',
  'bg-cyan-50 border-cyan-300',
  'bg-indigo-50 border-indigo-300',
  'bg-orange-50 border-orange-300',
];
