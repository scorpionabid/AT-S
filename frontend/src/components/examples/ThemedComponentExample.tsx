/**
 * ATİS Themed Component Example
 * Theme system integration nümunələri və migration guide
 */

import React, { useState } from 'react';
import { useTheme } from '../../utils/theme/ThemeSystem';
import { useThemedStyles } from '../../utils/theme/ThemedStyleSystem';
import { ThemeToggle, ThemeSettings } from '../theme/ThemeToggle';
import { BaseModal } from '../base/BaseModal';
import { BaseForm, FormConfig } from '../base/BaseForm';

// Example 1: Simple themed component
export const ThemedCard: React.FC<{
  title: string;
  content: string;
  variant?: 'default' | 'elevated' | 'outlined';
  children?: React.ReactNode;
}> = ({ title, content, variant = 'default', children }) => {
  const styles = useThemedStyles();

  return (
    <div style={styles.card(variant)}>
      <h3 style={styles.text('lg', 'semibold')}>{title}</h3>
      <p style={styles.text('base', 'normal', 'secondary')}>{content}</p>
      {children}
    </div>
  );
};

// Example 2: Themed button component with all variants
export const ThemedButtonShowcase: React.FC = () => {
  const styles = useThemedStyles();

  const buttonVariants: Array<{ variant: Parameters<typeof styles.button>[0]; label: string }> = [
    { variant: 'primary', label: 'Primary' },
    { variant: 'secondary', label: 'Secondary' },
    { variant: 'danger', label: 'Danger' },
    { variant: 'success', label: 'Success' },
    { variant: 'warning', label: 'Warning' }
  ];

  return (
    <div style={styles.card()}>
      <h3 style={styles.text('lg', 'semibold')}>Button Variants</h3>
      <div style={{ 
        display: 'flex', 
        gap: styles.theme.spacing[3], 
        flexWrap: 'wrap',
        marginTop: styles.theme.spacing[4] 
      }}>
        {buttonVariants.map(({ variant, label }) => (
          <button key={variant} style={styles.button(variant)}>
            {label}
          </button>
        ))}
      </div>
      
      <h4 style={{
        ...styles.text('base', 'semibold'),
        marginTop: styles.theme.spacing[6],
        marginBottom: styles.theme.spacing[3]
      }}>
        Button Sizes
      </h4>
      <div style={{ display: 'flex', gap: styles.theme.spacing[3], alignItems: 'center' }}>
        <button style={styles.button('primary', 'sm')}>Small</button>
        <button style={styles.button('primary', 'md')}>Medium</button>
        <button style={styles.button('primary', 'lg')}>Large</button>
      </div>
    </div>
  );
};

// Example 3: Themed form with validation states
export const ThemedFormExample: React.FC = () => {
  const styles = useThemedStyles();
  const [formState, setFormState] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formState.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formState.password) {
      newErrors.password = 'Password is required';
    } else if (formState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      alert('Form submitted successfully!');
    }
  };

  return (
    <div style={styles.card()}>
      <h3 style={styles.text('lg', 'semibold')}>Themed Form Example</h3>
      
      <form onSubmit={handleSubmit} style={{ marginTop: styles.theme.spacing[4] }}>
        <div style={{ marginBottom: styles.theme.spacing[4] }}>
          <label style={{
            ...styles.text('sm', 'semibold'),
            display: 'block',
            marginBottom: styles.theme.spacing[2]
          }}>
            Email
          </label>
          <input
            type="email"
            value={formState.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            style={styles.input(errors.email ? 'error' : 'default')}
            placeholder="Enter your email"
          />
          {errors.email && (
            <div style={{
              ...styles.text('sm', 'normal'),
              color: styles.theme.colors.status.error,
              marginTop: styles.theme.spacing[1]
            }}>
              {errors.email}
            </div>
          )}
        </div>

        <div style={{ marginBottom: styles.theme.spacing[4] }}>
          <label style={{
            ...styles.text('sm', 'semibold'),
            display: 'block',
            marginBottom: styles.theme.spacing[2]
          }}>
            Password
          </label>
          <input
            type="password"
            value={formState.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            style={styles.input(errors.password ? 'error' : 'default')}
            placeholder="Enter your password"
          />
          {errors.password && (
            <div style={{
              ...styles.text('sm', 'normal'),
              color: styles.theme.colors.status.error,
              marginTop: styles.theme.spacing[1]
            }}>
              {errors.password}
            </div>
          )}
        </div>

        <div style={{ marginBottom: styles.theme.spacing[6] }}>
          <label style={{
            ...styles.text('sm', 'semibold'),
            display: 'block',
            marginBottom: styles.theme.spacing[2]
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={formState.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            style={styles.input(errors.confirmPassword ? 'error' : 'default')}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <div style={{
              ...styles.text('sm', 'normal'),
              color: styles.theme.colors.status.error,
              marginTop: styles.theme.spacing[1]
            }}>
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: styles.theme.spacing[3] }}>
          <button type="submit" style={styles.button('primary')}>
            Submit
          </button>
          <button 
            type="button" 
            style={styles.button('secondary')}
            onClick={() => {
              setFormState({ email: '', password: '', confirmPassword: '' });
              setErrors({});
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

// Example 4: Themed alert/notification system
export const ThemedAlertExample: React.FC = () => {
  const styles = useThemedStyles();

  const alerts: Array<{
    type: Parameters<typeof styles.alert>[0];
    title: string;
    message: string;
  }> = [
    {
      type: 'info',
      title: 'Information',
      message: 'This is an informational message.'
    },
    {
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully!'
    },
    {
      type: 'warning',
      title: 'Warning',
      message: 'Please review your input before proceeding.'
    },
    {
      type: 'error',
      title: 'Error',
      message: 'An error occurred while processing your request.'
    }
  ];

  return (
    <div style={styles.card()}>
      <h3 style={styles.text('lg', 'semibold')}>Alert Variants</h3>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: styles.theme.spacing[3],
        marginTop: styles.theme.spacing[4] 
      }}>
        {alerts.map(({ type, title, message }) => (
          <div key={type} style={styles.alert(type)}>
            <div style={styles.text('sm', 'semibold')}>{title}</div>
            <div style={styles.text('sm')}>{message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example 5: Themed badge showcase
export const ThemedBadgeExample: React.FC = () => {
  const styles = useThemedStyles();

  const badgeVariants: Array<{
    variant: Parameters<typeof styles.badge>[0];
    label: string;
  }> = [
    { variant: 'default', label: 'Default' },
    { variant: 'primary', label: 'Primary' },
    { variant: 'success', label: 'Success' },
    { variant: 'warning', label: 'Warning' },
    { variant: 'danger', label: 'Danger' }
  ];

  return (
    <div style={styles.card()}>
      <h3 style={styles.text('lg', 'semibold')}>Badge Variants</h3>
      
      <div style={{ marginTop: styles.theme.spacing[4] }}>
        <h4 style={styles.text('base', 'semibold')}>Small Badges</h4>
        <div style={{ 
          display: 'flex', 
          gap: styles.theme.spacing[2], 
          marginTop: styles.theme.spacing[2],
          flexWrap: 'wrap' 
        }}>
          {badgeVariants.map(({ variant, label }) => (
            <span key={`sm-${variant}`} style={styles.badge(variant, 'sm')}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: styles.theme.spacing[4] }}>
        <h4 style={styles.text('base', 'semibold')}>Medium Badges</h4>
        <div style={{ 
          display: 'flex', 
          gap: styles.theme.spacing[2], 
          marginTop: styles.theme.spacing[2],
          flexWrap: 'wrap' 
        }}>
          {badgeVariants.map(({ variant, label }) => (
            <span key={`md-${variant}`} style={styles.badge(variant, 'md')}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: styles.theme.spacing[4] }}>
        <h4 style={styles.text('base', 'semibold')}>Large Badges</h4>
        <div style={{ 
          display: 'flex', 
          gap: styles.theme.spacing[2], 
          marginTop: styles.theme.spacing[2],
          flexWrap: 'wrap' 
        }}>
          {badgeVariants.map(({ variant, label }) => (
            <span key={`lg-${variant}`} style={styles.badge(variant, 'lg')}>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main theme demo component
export const ThemeSystemDemo: React.FC = () => {
  const { theme } = useTheme();
  const styles = useThemedStyles();
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{
      backgroundColor: theme.colors.background.primary,
      minHeight: '100vh',
      padding: theme.spacing[6]
    }}>
      {/* Header with theme controls */}
      <div style={{
        ...styles.card('elevated'),
        marginBottom: theme.spacing[6],
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={styles.text('2xl', 'bold')}>ATİS Theme System Demo</h1>
          <p style={styles.text('base', 'normal', 'secondary')}>
            Complete theme system ilə dark/light mode switching
          </p>
        </div>
        <div style={{ display: 'flex', gap: theme.spacing[3], alignItems: 'center' }}>
          <ThemeToggle variant="compact" />
          <ThemeSettings />
        </div>
      </div>

      {/* Theme info card */}
      <ThemedCard
        title="Current Theme"
        content={`Mode: ${theme.mode}, Variant: Default`}
        variant="outlined"
      >
        <div style={{ 
          marginTop: theme.spacing[3],
          display: 'flex',
          gap: theme.spacing[2],
          flexWrap: 'wrap'
        }}>
          <span style={styles.badge('primary', 'sm')}>
            {theme.mode === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
          <span style={styles.badge('default', 'sm')}>
            Animations: {theme.animation.enabled ? 'On' : 'Off'}
          </span>
        </div>
      </ThemedCard>

      {/* Component examples grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: theme.spacing[6],
        marginTop: theme.spacing[6]
      }}>
        <ThemedButtonShowcase />
        <ThemedFormExample />
        <ThemedAlertExample />
        <ThemedBadgeExample />
      </div>

      {/* Modal example */}
      <div style={{
        ...styles.card(),
        marginTop: theme.spacing[6],
        textAlign: 'center'
      }}>
        <h3 style={styles.text('lg', 'semibold')}>Modal Example</h3>
        <p style={{
          ...styles.text('base', 'normal', 'secondary'),
          marginBottom: theme.spacing[4]
        }}>
          Themed modal with automatic dark/light mode support
        </p>
        <button
          onClick={() => setShowModal(true)}
          style={styles.button('primary')}
        >
          Open Themed Modal
        </button>
      </div>

      {/* Themed modal */}
      <BaseModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Themed Modal Example"
        size="md"
      >
        <div style={{ marginBottom: theme.spacing[4] }}>
          <p style={styles.text('base', 'normal', 'secondary')}>
            Bu modal automatic olaraq current theme-i istifadə edir və 
            dark/light mode switch zamanı öz style-larını update edir.
          </p>
        </div>
        
        <div style={styles.alert('info')}>
          <strong>Theme Features:</strong>
          <ul style={{ marginTop: theme.spacing[2], paddingLeft: theme.spacing[4] }}>
            <li>Automatic color scheme switching</li>
            <li>Consistent component styling</li>
            <li>Animation preferences</li>
            <li>Accessibility support</li>
          </ul>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: theme.spacing[3],
          marginTop: theme.spacing[6]
        }}>
          <button
            onClick={() => setShowModal(false)}
            style={styles.button('secondary')}
          >
            Close
          </button>
          <button
            onClick={() => setShowModal(false)}
            style={styles.button('primary')}
          >
            Got it
          </button>
        </div>
      </BaseModal>
    </div>
  );
};

export default {
  ThemedCard,
  ThemedButtonShowcase,
  ThemedFormExample,
  ThemedAlertExample,
  ThemedBadgeExample,
  ThemeSystemDemo
};