# Sidebar Component

A responsive and accessible sidebar navigation component with collapsible functionality, dark mode support, and keyboard navigation.

## Features

- **Responsive Design**: Adapts to different screen sizes with mobile-first approach
- **Collapsible**: Can be toggled between expanded and collapsed states
- **Dark Mode**: Full support for light and dark themes
- **Accessible**: Keyboard navigable and screen reader friendly
- **Customizable**: Flexible props for different use cases
- **Performance**: Optimized with React.memo and useCallback

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | `''` | Additional CSS classes for the root element |
| `variant` | 'modern' \| 'classic' | 'modern' | Visual style variant |
| `theme` | 'light' \| 'dark' | 'auto' | Color theme (auto uses system preference) |

## Keyboard Navigation

- **Tab**: Navigate between focusable elements
- **Enter/Space**: Activate focused element
- **Escape**: Close any open dropdown menus
- **Arrow Up/Down**: Navigate menu items when a menu is open
- **Home/End**: Jump to first/last menu item

## Accessibility

- **ARIA Attributes**: Proper roles, labels, and states for screen readers
- **Focus Management**: Traps focus within open menus
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: Meets WCAG 2.1 AA standards

## Usage

```tsx
import { Sidebar } from './Sidebar';

function App() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="content">
        {/* Your main content */}
      </main>
    </div>
  );
}
```

## Customization

### Styling

Use the following CSS variables to customize the appearance:

```css
:root {
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 70px;
  --sidebar-bg: #ffffff;
  --sidebar-text: #1f2937;
  --sidebar-hover-bg: #f3f4f6;
  --sidebar-active-bg: #e5e7eb;
  --sidebar-border: #e5e7eb;
}

.dark {
  --sidebar-bg: #1f2937;
  --sidebar-text: #f9fafb;
  --sidebar-hover-bg: #374151;
  --sidebar-active-bg: #4b5563;
  --sidebar-border: #374151;
}
```

### Theming

The sidebar automatically inherits the theme from the `LayoutContext`. You can control it programmatically:

```tsx
import { useLayout } from '../../contexts/LayoutContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useLayout();
  
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    </button>
  );
}
```

## Best Practices

1. **Keep Navigation Items Concise**: Use clear, short labels for menu items
2. **Limit Nesting**: Avoid more than two levels of nested menus
3. **Icons**: Use consistent icon sizes (16-20px recommended)
4. **Performance**: For large navigation structures, consider virtualizing the list
5. **Testing**: Always test with keyboard and screen readers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 12+)
- Chrome for Android

## License

MIT
