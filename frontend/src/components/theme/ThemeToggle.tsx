/**
 * ATİS Theme Toggle Component
 * Dark/Light mode switching ilə user-friendly theme controls
 */

import React, { useState } from 'react';
import { useTheme, themeVariants, ThemeVariant } from '../../utils/theme/ThemeSystem';
import { StyleSystem } from '../../utils/StyleSystem';

// Simple icon components
const SunIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);

const MoonIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const AutoIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <path d="M8 21l4-4 4 4"/>
  </svg>
);

const SettingsIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

// Quick theme toggle button
interface ThemeToggleProps {
  variant?: 'button' | 'icon' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'button',
  size = 'md',
  showLabel = true,
  className = '',
  style = {}
}) => {
  const { theme, config, toggleTheme, isDark, isLight, isAuto } = useTheme();

  const iconSize = { sm: 16, md: 20, lg: 24 }[size];
  
  const buttonStyle = {
    ...StyleSystem.button('secondary'),
    backgroundColor: theme.colors.background.secondary,
    borderColor: theme.colors.border.default,
    color: theme.colors.text.primary,
    transition: theme.animation.enabled ? theme.animation.duration.colors : 'none',
    ...style
  };

  const getCurrentIcon = () => {
    if (isAuto) return <AutoIcon size={iconSize} />;
    if (isDark) return <MoonIcon size={iconSize} />;
    return <SunIcon size={iconSize} />;
  };

  const getCurrentLabel = () => {
    if (isAuto) return 'Auto';
    if (isDark) return 'Dark';
    return 'Light';
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        style={{
          ...buttonStyle,
          padding: theme.spacing[2],
          minWidth: 'auto'
        }}
        className={className}
        title={`Current: ${getCurrentLabel()}`}
      >
        {getCurrentIcon()}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        style={{
          ...buttonStyle,
          padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
          fontSize: theme.typography.fontSize.sm,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[1]
        }}
        className={className}
      >
        {getCurrentIcon()}
        {showLabel && <span>{getCurrentLabel()}</span>}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      style={{
        ...buttonStyle,
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing[2]
      }}
      className={className}
    >
      {getCurrentIcon()}
      {showLabel && <span>{getCurrentLabel()} Theme</span>}
    </button>
  );
};

// Advanced theme settings panel
interface ThemeSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ThemeSettingsPanel: React.FC<ThemeSettingsPanelProps> = ({
  isOpen,
  onClose,
  className = '',
  style = {}
}) => {
  const { 
    theme, 
    config, 
    setThemeMode, 
    setThemeVariant, 
    updateCustomizations,
    isDark,
    isLight,
    isAuto
  } = useTheme();

  if (!isOpen) return null;

  const panelStyle = {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    backgroundColor: theme.colors.background.elevated,
    borderRadius: theme.borderRadius.lg,
    boxShadow: `0 20px 25px -5px ${theme.colors.shadow.strong}`,
    border: `1px solid ${theme.colors.border.default}`,
    padding: theme.spacing[6],
    minWidth: '400px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    ...style
  };

  const overlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.overlay,
    zIndex: 999
  };

  const sectionStyle = {
    marginBottom: theme.spacing[6]
  };

  const labelStyle = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    display: 'block'
  };

  const buttonGroupStyle = {
    display: 'flex',
    gap: theme.spacing[2],
    flexWrap: 'wrap' as const
  };

  const optionButtonStyle = (isActive: boolean) => ({
    ...StyleSystem.button(isActive ? 'primary' : 'secondary'),
    backgroundColor: isActive 
      ? theme.colors.interactive.primary 
      : theme.colors.background.secondary,
    color: isActive 
      ? theme.colors.text.inverse 
      : theme.colors.text.primary,
    borderColor: isActive 
      ? theme.colors.interactive.primary 
      : theme.colors.border.default,
    fontSize: theme.typography.fontSize.sm,
    padding: `${theme.spacing[2]} ${theme.spacing[3]}`
  });

  return (
    <>
      {/* Overlay */}
      <div style={overlayStyle} onClick={onClose} />
      
      {/* Panel */}
      <div style={panelStyle} className={className}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing[6]
        }}>
          <h2 style={{
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: 0
          }}>
            Theme Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: theme.typography.fontSize.xl,
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              padding: theme.spacing[1]
            }}
          >
            ×
          </button>
        </div>

        {/* Theme Mode */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Theme Mode</label>
          <div style={buttonGroupStyle}>
            <button
              onClick={() => setThemeMode('light')}
              style={optionButtonStyle(isLight)}
            >
              <SunIcon size={16} /> Light
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              style={optionButtonStyle(isDark)}
            >
              <MoonIcon size={16} /> Dark
            </button>
            <button
              onClick={() => setThemeMode('auto')}
              style={optionButtonStyle(isAuto)}
            >
              <AutoIcon size={16} /> Auto
            </button>
          </div>
        </div>

        {/* Color Variant */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Color Theme</label>
          <div style={buttonGroupStyle}>
            {Object.entries(themeVariants).map(([key, variant]) => (
              <button
                key={key}
                onClick={() => setThemeVariant(key as ThemeVariant)}
                style={{
                  ...optionButtonStyle(config.variant === key),
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2]
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: variant.primary,
                  borderRadius: '50%'
                }} />
                {variant.name}
              </button>
            ))}
          </div>
        </div>

        {/* Border Radius */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Border Radius</label>
          <div style={buttonGroupStyle}>
            {['sharp', 'normal', 'rounded'].map((radius) => (
              <button
                key={radius}
                onClick={() => updateCustomizations({ borderRadius: radius as any })}
                style={optionButtonStyle(config.customizations?.borderRadius === radius)}
              >
                {radius.charAt(0).toUpperCase() + radius.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Density */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Spacing Density</label>
          <div style={buttonGroupStyle}>
            {['compact', 'normal', 'comfortable'].map((density) => (
              <button
                key={density}
                onClick={() => updateCustomizations({ density: density as any })}
                style={optionButtonStyle(config.customizations?.density === density)}
              >
                {density.charAt(0).toUpperCase() + density.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Settings */}
        <div style={sectionStyle}>
          <label style={labelStyle}>Animation</label>
          <div style={buttonGroupStyle}>
            <button
              onClick={() => updateCustomizations({ animations: true })}
              style={optionButtonStyle(config.customizations?.animations === true)}
            >
              Enabled
            </button>
            <button
              onClick={() => updateCustomizations({ animations: false })}
              style={optionButtonStyle(config.customizations?.animations === false)}
            >
              Disabled
            </button>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: theme.spacing[3],
          marginTop: theme.spacing[8],
          paddingTop: theme.spacing[6],
          borderTop: `1px solid ${theme.colors.border.muted}`
        }}>
          <button
            onClick={() => {
              // Reset to defaults
              setThemeMode('auto');
              setThemeVariant('default');
              updateCustomizations({
                borderRadius: 'normal',
                density: 'normal',
                animations: true,
                reducedMotion: false
              });
            }}
            style={{
              ...StyleSystem.button('secondary'),
              backgroundColor: theme.colors.background.secondary,
              color: theme.colors.text.primary,
              borderColor: theme.colors.border.default
            }}
          >
            Reset
          </button>
          <button
            onClick={onClose}
            style={{
              ...StyleSystem.button('primary'),
              backgroundColor: theme.colors.interactive.primary,
              color: theme.colors.text.inverse
            }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};

// Theme settings trigger
export const ThemeSettings: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
}> = ({ size = 'md', variant = 'icon' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const iconSize = { sm: 16, md: 20, lg: 24 }[size];

  const buttonStyle = {
    ...StyleSystem.button('secondary'),
    backgroundColor: theme.colors.background.secondary,
    borderColor: theme.colors.border.default,
    color: theme.colors.text.primary,
    padding: variant === 'icon' ? theme.spacing[2] : `${theme.spacing[2]} ${theme.spacing[3]}`,
    minWidth: variant === 'icon' ? 'auto' : undefined
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={buttonStyle}
        title="Theme Settings"
      >
        <SettingsIcon size={iconSize} />
        {variant === 'button' && <span style={{ marginLeft: theme.spacing[2] }}>Settings</span>}
      </button>

      <ThemeSettingsPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default {
  ThemeToggle,
  ThemeSettingsPanel,
  ThemeSettings
};