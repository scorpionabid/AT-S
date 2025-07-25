/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username format
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Get password strength score (0-4)
 */
export const getPasswordStrength = (password: string): number => {
  let score = 0;
  
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  
  return Math.min(score, 4);
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (score: number): string => {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return labels[Math.max(0, Math.min(score, 4))];
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (score: number): string => {
  const colors = ['#ff4444', '#ff8800', '#ffaa00', '#88cc00', '#44bb00'];
  return colors[Math.max(0, Math.min(score, 4))];
};

/**
 * Validate login input (username or email)
 */
export const isValidLoginInput = (input: string): boolean => {
  if (!input || input.length < 3) return false;
  
  // Check if it's a valid email or username
  return isValidEmail(input) || isValidUsername(input);
};

/**
 * Detect if input is email or username
 */
export const detectLoginType = (input: string): 'email' | 'username' => {
  return isValidEmail(input) ? 'email' : 'username';
};

/**
 * Validate password confirmation
 */
export const passwordsMatch = (password: string, confirmation: string): boolean => {
  return password === confirmation;
};

/**
 * Check if password is commonly used
 */
export const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', '12345678'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
};

/**
 * Generate password requirements text
 */
export const getPasswordRequirements = (): string[] => {
  return [
    'At least 8 characters long',
    'Contains at least one lowercase letter',
    'Contains at least one uppercase letter',
    'Contains at least one number',
    'Contains at least one special character (@$!%*?&)'
  ];
};

/**
 * Check password requirements
 */
export const checkPasswordRequirements = (password: string): {
  requirement: string;
  met: boolean;
}[] => {
  return [
    {
      requirement: 'At least 8 characters long',
      met: password.length >= 8
    },
    {
      requirement: 'Contains at least one lowercase letter',
      met: /[a-z]/.test(password)
    },
    {
      requirement: 'Contains at least one uppercase letter',
      met: /[A-Z]/.test(password)
    },
    {
      requirement: 'Contains at least one number',
      met: /\d/.test(password)
    },
    {
      requirement: 'Contains at least one special character',
      met: /[@$!%*?&]/.test(password)
    }
  ];
};

/**
 * Validate user input for security
 */
export const sanitizeUserInput = (input: string): string => {
  // Remove HTML tags and potentially dangerous characters
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .trim();
};

/**
 * Check if input contains potential XSS
 */
export const containsXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /alert\s*\(/i,
    /eval\s*\(/i
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};