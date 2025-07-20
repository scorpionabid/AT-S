// ====================
// ATİS Tailwind CSS Bundle Optimization Configuration
// Production-ready configuration with advanced optimizations
// ====================

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Exclude test files from production builds
    "!./src/**/*.test.{js,ts,jsx,tsx}",
    "!./src/**/*.spec.{js,ts,jsx,tsx}",
    "!./src/**/*.stories.{js,ts,jsx,tsx}",
  ],
  
  // Aggressive production optimizations
  corePlugins: {
    preflight: true,
    // Disable unused features for smaller bundle
    container: false,
    accessibility: false,
  },
  
  // Minimal safelist for production
  safelist: [
    // Only critical dynamic classes
    'animate-spin',
    'animate-pulse',
    
    // Essential size patterns
    {
      pattern: /^(w|h)-(4|5|6|8|12|16)$/,
      variants: ['sm', 'md', 'lg'],
    },
    
    // Core color patterns
    {
      pattern: /^(bg|text|border)-(primary|success|warning|error)-(500|600)$/,
    },
  ],
  
  darkMode: ['class', '[data-theme="dark"]'],
  
  theme: {
    // Minimal color palette for production
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      
      primary: {
        50: '#f0f7ff',
        100: '#e0efff',
        200: '#b9ddff',
        300: '#7cbeff',
        400: '#3b9eff',
        500: '#0872e8',
        600: '#0056c7',
        700: '#0043a1',
        800: '#053984',
        900: '#0a306e',
        DEFAULT: '#0872e8',
      },
      neutral: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        DEFAULT: '#64748b',
      },
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        DEFAULT: '#22c55e',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        DEFAULT: '#f59e0b',
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        DEFAULT: '#ef4444',
      },
      info: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        DEFAULT: '#3b82f6',
      },
    },
    
    // Optimized spacing scale
    spacing: {
      px: '1px',
      0: '0',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
      40: '10rem',
      48: '12rem',
      56: '14rem',
      64: '16rem',
      80: '20rem',
      96: '24rem',
    },
    
    // Essential typography
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      DEFAULT: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      full: '9999px',
    },
    
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      none: 'none',
      
      // Semantic shadows
      card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      'card-elevated': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    
    zIndex: {
      auto: 'auto',
      0: '0',
      10: '10',
      20: '20',
      30: '30',
      40: '40',
      50: '50',
      dropdown: '1000',
      'modal-backdrop': '1040',
      modal: '1060',
      toast: '1090',
    },
    
    transitionDuration: {
      75: '75ms',
      100: '100ms',
      150: '150ms',
      200: '200ms',
      300: '300ms',
      500: '500ms',
    },
    
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    
    extend: {
      maxWidth: {
        'container': '1440px',
      },
    },
  },
  
  plugins: [
    // Minimal plugin for essential components only
    function({ addBase, addComponents, addUtilities, theme }) {
      // Essential base styles only
      addBase({
        ':root': {
          '--color-primary': theme('colors.primary.500'),
          '--color-neutral': theme('colors.neutral.500'),
          '--color-success': theme('colors.success.500'),
          '--color-warning': theme('colors.warning.500'),
          '--color-error': theme('colors.error.500'),
        },
      });
      
      // Essential components only
      addComponents({
        '.btn': {
          '@apply px-4 py-2 rounded-md font-medium transition-colors duration-200': {},
        },
        '.btn-primary': {
          '@apply bg-primary-500 text-white hover:bg-primary-600': {},
        },
        '.card': {
          '@apply bg-white rounded-lg shadow-card border border-neutral-200': {},
        },
      });
      
      // Essential utilities only
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
      });
    },
  ],
};