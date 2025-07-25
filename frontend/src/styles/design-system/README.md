# ATİS Design System

**Version:** 1.0.0  
**Status:** Production Ready  
**Author:** ATİS Development Team  

## 📋 Overview

Unified design system for ATİS - Azərbaycan Təhsil İdarəetmə Sistemi. This design system provides consistent visual language, interaction patterns, and development standards across the entire application.

## 🎯 Goals

- **Consistency**: Unified visual language across all components
- **Efficiency**: Reduced development time with reusable tokens and components
- **Maintainability**: Single source of truth for design decisions
- **Accessibility**: WCAG 2.1 AA compliant design patterns
- **Performance**: Optimized CSS and minimal bundle impact

## 📁 Structure

```
design-system/
├── tokens.scss          # Master SCSS variables and functions
├── css-exports.css      # CSS custom properties (auto-generated)
├── index.ts            # TypeScript exports and utilities
└── README.md           # This documentation
```

## 🎨 Design Tokens

### Color System

```scss
// Primary colors (Azerbaijani flag inspired)
$color-primary-500: #0872e8;  // Main brand color
$color-primary-300: #7cbeff;  // Light variant
$color-primary-700: #0043a1;  // Dark variant

// Secondary colors (Green accents)
$color-secondary-500: #22c55e;

// Semantic colors
$color-success-500: #22c55e;
$color-warning-500: #f59e0b;
$color-error-500: #ef4444;
$color-info-500: #3b82f6;
```

### Typography

```scss
// Font families
$font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

// Font sizes (rem-based)
$font-size-xs: 0.75rem;     // 12px
$font-size-sm: 0.875rem;    // 14px
$font-size-base: 1rem;      // 16px
$font-size-lg: 1.125rem;    // 18px
$font-size-xl: 1.25rem;     // 20px

// Font weights
$font-weight-normal: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
```

### Spacing System

```scss
// 8px base spacing system
$space-1: 0.25rem;       // 4px
$space-2: 0.5rem;        // 8px
$space-3: 0.75rem;       // 12px
$space-4: 1rem;          // 16px
$space-6: 1.5rem;        // 24px
$space-8: 2rem;          // 32px
```

### Border Radius

```scss
$radius-sm: 0.25rem;      // 4px
$radius-default: 0.375rem; // 6px
$radius-md: 0.5rem;       // 8px
$radius-lg: 0.75rem;      // 12px
$radius-full: 9999px;     // Fully rounded
```

### Shadows

```scss
$shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
$shadow-default: 0 4px 6px -1px rgb(0 0 0 / 0.1);
$shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

## 🔧 Usage

### In SCSS Files

```scss
@use '../design-system/tokens' as *;

.my-component {
  background-color: $color-primary-500;
  padding: $space-4;
  border-radius: $radius-lg;
  box-shadow: $shadow-default;
}
```

### In CSS Files

```css
@import '../design-system/css-exports.css';

.my-component {
  background-color: var(--color-primary-500);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-default);
}
```

### In TypeScript/React

```typescript
import { designTokens, utils } from '../styles/design-system';

const buttonStyles = {
  backgroundColor: designTokens.colors.primary[500],
  padding: designTokens.spacing[4],
  borderRadius: designTokens.borderRadius.lg,
  fontSize: utils.getFontSize('base'),
};
```

## 🎯 Component Guidelines

### Button Component

```scss
.btn {
  // Base styles
  font-family: $font-family-base;
  font-weight: $font-weight-medium;
  border-radius: $radius-md;
  transition: $transition-default;
  cursor: pointer;
  
  // Sizes
  &--sm {
    font-size: $font-size-sm;
    padding: $space-1_5 $space-3;
  }
  
  &--md {
    font-size: $font-size-base;
    padding: $space-2 $space-4;
  }
  
  &--lg {
    font-size: $font-size-lg;
    padding: $space-2_5 $space-6;
  }
  
  // Variants
  &--primary {
    background-color: $interactive-primary;
    color: $text-inverse;
    border: 1px solid $interactive-primary;
    
    &:hover {
      background-color: $interactive-primary-hover;
      border-color: $interactive-primary-hover;
    }
    
    &:active {
      background-color: $interactive-primary-active;
      border-color: $interactive-primary-active;
    }
  }
  
  &--secondary {
    background-color: $interactive-secondary;
    color: $text-primary;
    border: 1px solid $border-primary;
    
    &:hover {
      background-color: $interactive-secondary-hover;
    }
  }
}
```

### Card Component

```scss
.card {
  background-color: $bg-surface;
  border: 1px solid $border-primary;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $space-6;
  
  &__header {
    margin-bottom: $space-4;
    padding-bottom: $space-4;
    border-bottom: 1px solid $border-primary;
  }
  
  &__title {
    font-size: $font-size-lg;
    font-weight: $font-weight-semibold;
    color: $text-primary;
    margin: 0;
  }
  
  &__content {
    color: $text-secondary;
    line-height: $line-height-relaxed;
  }
}
```

## 🎨 Theme System

### Light Theme (Default)

```scss
:root {
  --bg-primary: #{$color-neutral-50};
  --text-primary: #{$color-neutral-900};
  --border-primary: #{$color-neutral-200};
}
```

### Dark Theme

```scss
[data-theme="dark"] {
  --bg-primary: #{$color-neutral-900};
  --text-primary: #{$color-neutral-50};
  --border-primary: #{$color-neutral-700};
}
```

## 📱 Responsive Design

### Breakpoint System

```scss
$breakpoint-sm: 640px;   // Mobile
$breakpoint-md: 768px;   // Tablet
$breakpoint-lg: 1024px;  // Desktop
$breakpoint-xl: 1280px;  // Large Desktop
```

### Usage

```scss
.component {
  // Mobile-first approach
  padding: $space-4;
  
  @media (min-width: $breakpoint-md) {
    padding: $space-6;
  }
  
  @media (min-width: $breakpoint-lg) {
    padding: $space-8;
  }
}
```

## ♿ Accessibility

### Focus Management

```scss
.focus-visible:focus-visible {
  outline: 2px solid $border-focus;
  outline-offset: 2px;
}
```

### Screen Reader Support

```scss
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### High Contrast Mode

```scss
@media (prefers-contrast: high) {
  .btn {
    border: 2px solid;
  }
}
```

### Reduced Motion

```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🚀 Performance

### Bundle Optimization

- Tree-shakable TypeScript exports
- CSS custom properties for runtime theming
- Minimal CSS bundle with SCSS compilation
- Efficient selector specificity

### Loading Strategy

```typescript
// Lazy load design system utilities
const { utils } = await import('../styles/design-system');
```

## 🔄 Migration Guide

### From Legacy CSS

1. Replace hardcoded values with design tokens
2. Use semantic color names instead of hex values
3. Implement consistent spacing with the 8px grid system
4. Update component styles to use design system patterns

### Before (Legacy)

```css
.button {
  background-color: #0872e8;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
}
```

### After (Design System)

```scss
.button {
  background-color: $color-primary-500;
  padding: $space-3 $space-6;
  border-radius: $radius-md;
  font-size: $font-size-base;
}
```

## 🛠️ Development Workflow

### Adding New Tokens

1. Add SCSS variable to `tokens.scss`
2. Add CSS custom property to `css-exports.css`
3. Add TypeScript definition to `index.ts`
4. Update documentation

### Testing Design Changes

```bash
# SCSS compilation test
npm run build:css

# TypeScript type checking
npm run type-check

# Visual regression testing
npm run test:visual
```

## 📊 Token Reference

### Complete Color Palette

| Color | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|-------|----|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| Primary | #f0f7ff | #e0efff | #b9ddff | #7cbeff | #3b9eff | #0872e8 | #0056c7 | #0043a1 | #053984 | #0a306e | #071f47 |
| Secondary | #f0fdf4 | #dcfce7 | #bbf7d0 | #86efac | #4ade80 | #22c55e | #16a34a | #15803d | #166534 | #14532d | - |
| Neutral | #f8fafc | #f1f5f9 | #e2e8f0 | #cbd5e1 | #94a3b8 | #64748b | #475569 | #334155 | #1e293b | #0f172a | #020617 |

### Spacing Scale

| Token | Value | Pixels |
|-------|-------|---------|
| space-0 | 0 | 0px |
| space-px | 1px | 1px |
| space-0_5 | 0.125rem | 2px |
| space-1 | 0.25rem | 4px |
| space-2 | 0.5rem | 8px |
| space-3 | 0.75rem | 12px |
| space-4 | 1rem | 16px |
| space-6 | 1.5rem | 24px |
| space-8 | 2rem | 32px |
| space-12 | 3rem | 48px |
| space-16 | 4rem | 64px |

## 🤝 Contributing

1. Follow the established naming conventions
2. Maintain backwards compatibility
3. Add comprehensive documentation
4. Test across all supported browsers
5. Include accessibility considerations

## 📝 Changelog

### v1.0.0 (2025-07-12)
- Initial design system implementation
- Unified SCSS and CSS token system
- TypeScript utilities and type definitions
- Comprehensive documentation
- Accessibility compliance (WCAG 2.1 AA)
- Performance optimizations
- Dark mode support

---

**Maintained by:** ATİS Development Team  
**License:** Internal Use Only  
**Last Updated:** 2025-07-12