import { Email } from '@core/domain/base-value-object';
import { validatePassword, validateEmail, isNotEmpty, ValidationResult } from '@core/utils/validators';

/**
 * Login Credentials Value Object
 */
export class LoginCredentials {
  private readonly _email: string;
  private readonly _password: string;
  private readonly _rememberMe: boolean;

  private constructor(email: string, password: string, rememberMe: boolean) {
    this._email = email;
    this._password = password;
    this._rememberMe = rememberMe;
  }

  static create(email: string, password: string, rememberMe: boolean = false): LoginCredentials {
    return new LoginCredentials(email.toLowerCase().trim(), password, rememberMe);
  }

  get email(): string { return this._email; }
  get password(): string { return this._password; }
  get rememberMe(): boolean { return this._rememberMe; }

  validate(): ValidationResult {
    const emailValidation = validateEmail(this._email);
    if (!emailValidation.isValid) return emailValidation;

    if (!isNotEmpty(this._password)) {
      return { isValid: false, errors: ['Password is required'] };
    }

    return { isValid: true, errors: [] };
  }

  toDTO(): LoginDTO {
    return {
      email: this._email,
      password: this._password,
      rememberMe: this._rememberMe
    };
  }
}

/**
 * Registration Credentials Value Object
 */
export class RegisterCredentials {
  private readonly _email: string;
  private readonly _password: string;
  private readonly _confirmPassword: string;
  private readonly _firstName: string;
  private readonly _lastName: string;
  private readonly _acceptTerms: boolean;

  private constructor(props: RegisterCredentialsProps) {
    this._email = props.email.toLowerCase().trim();
    this._password = props.password;
    this._confirmPassword = props.confirmPassword;
    this._firstName = props.firstName.trim();
    this._lastName = props.lastName.trim();
    this._acceptTerms = props.acceptTerms;
  }

  static create(props: RegisterCredentialsProps): RegisterCredentials {
    return new RegisterCredentials(props);
  }

  get email(): string { return this._email; }
  get password(): string { return this._password; }
  get confirmPassword(): string { return this._confirmPassword; }
  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get acceptTerms(): boolean { return this._acceptTerms; }

  validate(): ValidationResult {
    const errors: string[] = [];

    // Email validation
    const emailValidation = validateEmail(this._email);
    if (!emailValidation.isValid) {
      errors.push(...emailValidation.errors);
    }

    // Name validation
    if (!isNotEmpty(this._firstName)) {
      errors.push('First name is required');
    }
    if (!isNotEmpty(this._lastName)) {
      errors.push('Last name is required');
    }

    // Password validation
    const passwordValidation = validatePassword(this._password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    // Password match
    if (this._password !== this._confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Terms acceptance
    if (!this._acceptTerms) {
      errors.push('You must accept the terms and conditions');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toDTO(): RegisterDTO {
    return {
      email: this._email,
      password: this._password,
      firstName: this._firstName,
      lastName: this._lastName
    };
  }
}

/**
 * Auth Token Value Object
 */
export class AuthToken {
  private readonly _accessToken: string;
  private readonly _refreshToken: string;
  private readonly _expiresAt: Date;
  private readonly _tokenType: string;

  private constructor(props: AuthTokenProps) {
    this._accessToken = props.accessToken;
    this._refreshToken = props.refreshToken;
    this._expiresAt = props.expiresAt;
    this._tokenType = props.tokenType ?? 'Bearer';
  }

  static create(props: AuthTokenProps): AuthToken {
    return new AuthToken(props);
  }

  static fromDTO(dto: AuthTokenDTO): AuthToken {
    return new AuthToken({
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      expiresAt: new Date(dto.expiresAt),
      tokenType: dto.tokenType
    });
  }

  get accessToken(): string { return this._accessToken; }
  get refreshToken(): string { return this._refreshToken; }
  get expiresAt(): Date { return this._expiresAt; }
  get tokenType(): string { return this._tokenType; }

  /**
   * Checks if the token is expired
   */
  get isExpired(): boolean {
    return Date.now() >= this._expiresAt.getTime();
  }

  /**
   * Checks if the token will expire soon (within 5 minutes)
   */
  get isExpiringSoon(): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= this._expiresAt.getTime() - fiveMinutes;
  }

  /**
   * Gets the authorization header value
   */
  get authorizationHeader(): string {
    return `${this._tokenType} ${this._accessToken}`;
  }

  toDTO(): AuthTokenDTO {
    return {
      accessToken: this._accessToken,
      refreshToken: this._refreshToken,
      expiresAt: this._expiresAt.toISOString(),
      tokenType: this._tokenType
    };
  }
}

// DTOs
export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterCredentialsProps {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface AuthTokenProps {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType?: string;
}

export interface AuthTokenDTO {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType?: string;
}

/**
 * Auth Response from API
 */
export interface AuthResponse {
  user: import('./user.model').UserDTO;
  token: AuthTokenDTO;
}
