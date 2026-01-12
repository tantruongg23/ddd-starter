/**
 * Validation Utilities
 * 
 * Common validation functions for domain models and forms.
 * These are pure functions that can be used anywhere in the application.
 */

/**
 * Validation Result Interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Creates a successful validation result
 */
export function validResult(): ValidationResult {
  return { isValid: true, errors: [] };
}

/**
 * Creates a failed validation result
 */
export function invalidResult(...errors: string[]): ValidationResult {
  return { isValid: false, errors };
}

/**
 * Combines multiple validation results
 */
export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap(r => r.errors);
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================
// String Validators
// ============================================

/**
 * Checks if a string is not empty
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Checks if a string meets minimum length
 */
export function hasMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Checks if a string doesn't exceed maximum length
 */
export function hasMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Checks if a string is within length range
 */
export function isLengthInRange(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Checks if a string matches a regex pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

// ============================================
// Email Validators
// ============================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * Validates email with detailed result
 */
export function validateEmail(email: string): ValidationResult {
  if (!isNotEmpty(email)) {
    return invalidResult('Email is required');
  }
  if (!isValidEmail(email)) {
    return invalidResult('Invalid email format');
  }
  return validResult();
}

// ============================================
// Phone Validators
// ============================================

const PHONE_REGEX = /^\+?[\d\s-()]{10,}$/;

/**
 * Validates a phone number
 */
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

/**
 * Validates phone with detailed result
 */
export function validatePhone(phone: string): ValidationResult {
  if (!isNotEmpty(phone)) {
    return invalidResult('Phone number is required');
  }
  if (!isValidPhone(phone)) {
    return invalidResult('Invalid phone number format');
  }
  return validResult();
}

// ============================================
// Password Validators
// ============================================

/**
 * Password strength requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

/**
 * Validates a password against requirements
 */
export function validatePassword(
  password: string,
  requirements: Partial<PasswordRequirements> = {}
): ValidationResult {
  const reqs = { ...DEFAULT_PASSWORD_REQUIREMENTS, ...requirements };
  const errors: string[] = [];
  
  if (!isNotEmpty(password)) {
    return invalidResult('Password is required');
  }
  
  if (password.length < reqs.minLength) {
    errors.push(`Password must be at least ${reqs.minLength} characters`);
  }
  
  if (reqs.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (reqs.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (reqs.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (reqs.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors.length > 0 ? invalidResult(...errors) : validResult();
}

/**
 * Checks if passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

// ============================================
// Number Validators
// ============================================

/**
 * Checks if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Checks if a number is positive
 */
export function isPositive(value: number): boolean {
  return value > 0;
}

/**
 * Checks if a number is non-negative
 */
export function isNonNegative(value: number): boolean {
  return value >= 0;
}

/**
 * Checks if a number is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Checks if a value is a valid integer
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value);
}

// ============================================
// Credit Card Validators
// ============================================

/**
 * Validates a credit card number using Luhn algorithm
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validates CVV
 */
export function isValidCVV(cvv: string): boolean {
  const digits = cvv.replace(/\D/g, '');
  return digits.length >= 3 && digits.length <= 4;
}

/**
 * Validates expiration date
 */
export function isValidExpirationDate(month: number, year: number): boolean {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  if (year < currentYear) {
    return false;
  }
  
  if (year === currentYear && month < currentMonth) {
    return false;
  }
  
  return true;
}

// ============================================
// Address Validators
// ============================================

/**
 * Validates a US ZIP code
 */
export function isValidUSZipCode(zipCode: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zipCode);
}

/**
 * Validates a postal code based on country
 */
export function isValidPostalCode(postalCode: string, countryCode: string): boolean {
  const patterns: Record<string, RegExp> = {
    US: /^\d{5}(-\d{4})?$/,
    CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
    UK: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    DE: /^\d{5}$/,
    FR: /^\d{5}$/
  };
  
  const pattern = patterns[countryCode.toUpperCase()];
  return pattern ? pattern.test(postalCode) : true;
}

// ============================================
// Date Validators
// ============================================

/**
 * Checks if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date();
}

/**
 * Checks if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * Checks if a person is at least a certain age
 */
export function isMinimumAge(birthDate: Date, minimumAge: number): boolean {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= minimumAge;
}
