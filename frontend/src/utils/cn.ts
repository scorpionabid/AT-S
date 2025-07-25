// ====================
// Class Name Utility
// Tailwind className concatenation with clsx
// ====================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind classes intelligently
 * 
 * @param inputs - Class names, conditionals, or arrays
 * @returns Merged class string
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': true })
 * // Returns: 'px-4 py-2 bg-blue-500 text-white'
 * 
 * @example
 * cn('px-4', 'px-6') // Tailwind conflict resolution
 * // Returns: 'px-6' (last one wins)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}