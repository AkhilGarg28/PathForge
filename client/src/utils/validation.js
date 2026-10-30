export const validateName = (name) => {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 60) return 'Name must be at most 60 characters';
  return '';
};

export const validateEmail = (email) => {
  const trimmed = (email || '').trim();
  if (!trimmed) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) return 'Please provide a valid email';
  return '';
};

export const validatePassword = (password, isSignup = true) => {
  if (!password) return 'Password is required';
  if (!isSignup) return '';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return '';
};
