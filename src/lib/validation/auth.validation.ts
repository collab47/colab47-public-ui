const RFC_EMAIL_NO_CONSECUTIVE_DOTS = /^(?!.*\.\.)[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

export function validateName(value: string): string | undefined {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return 'Full name is required.';
  }
  if (normalized.length < 2) {
    return 'Full name must be at least 2 characters long.';
  }
  if (normalized.length > 100) {
    return 'Full name cannot exceed 100 characters.';
  }
  return undefined;
}

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (trimmed.length > 254) {
    return 'Email address cannot exceed 254 characters.';
  }
  if (trimmed.length < 6 || !RFC_EMAIL_NO_CONSECUTIVE_DOTS.test(trimmed)) {
    return 'That email does not look valid. Check for typos.';
  }
  return undefined;
}

export function validateLoginPassword(value: string): string | undefined {
  if (!value) {
    return 'Password is required.';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (value.length > 128) {
    return 'Password cannot exceed 128 characters.';
  }
  return undefined;
}

export function validateRegisterPassword(value: string): string | undefined {
  if (!value) {
    return 'Password is required.';
  }
  if (value.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (value.length > 128) {
    return 'Password cannot exceed 128 characters.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!/[a-z]/.test(value)) {
    return 'Password must include at least one lowercase letter.';
  }
  if (!/\d/.test(value)) {
    return 'Password must include at least one digit.';
  }
  if (!/[^A-Za-z0-9\s]/.test(value)) {
    return 'Password must include at least one special character.';
  }
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return undefined;
}
