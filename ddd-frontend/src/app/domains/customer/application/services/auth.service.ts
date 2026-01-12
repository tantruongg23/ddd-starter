import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, map, tap, catchError, switchMap } from 'rxjs';
import { ApiService } from '@core/infrastructure/api/api.service';
import { Result, DomainError } from '@core/domain/result';
import { AuthState } from '../state/auth.state';
import { User, UserDTO } from '../../domain/models/user.model';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthToken,
  AuthResponse,
  AuthTokenDTO
} from '../../domain/models/auth-credentials.model';

/**
 * Auth Application Service
 * 
 * Handles authentication operations and user session management.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly state = inject(AuthState);
  private readonly router = inject(Router);
  
  // ==========================================
  // State Accessors
  // ==========================================
  
  get isAuthenticated() { return this.state.isAuthenticated; }
  get isGuest() { return this.state.isGuest; }
  get currentUser() { return this.state.currentUser; }
  get displayName() { return this.state.displayName; }
  get initials() { return this.state.initials; }
  get email() { return this.state.email; }
  get avatarUrl() { return this.state.avatarUrl; }
  get isLoading() { return this.state.isLoading; }
  get error() { return this.state.error; }
  get isAdmin() { return this.state.isAdmin; }
  
  // ==========================================
  // Authentication Operations
  // ==========================================
  
  /**
   * Logs in a user with credentials
   */
  login(email: string, password: string, rememberMe: boolean = false): Observable<Result<User, DomainError>> {
    const credentials = LoginCredentials.create(email, password, rememberMe);
    
    // Validate credentials
    const validation = credentials.validate();
    if (!validation.isValid) {
      return of(Result.fail<User, DomainError>({
        code: 'VALIDATION_ERROR',
        message: validation.errors.join(', ')
      }));
    }
    
    this.state.setLoading(true);
    this.state.setError(null);
    
    return this.api.post<AuthResponse>('auth/login', credentials.toDTO()).pipe(
      map(result => {
        if (result.isSuccess) {
          const user = User.fromDTO(result.value.user);
          const token = AuthToken.fromDTO(result.value.token);
          this.state.setAuth(user, token);
          return Result.ok<User, DomainError>(user);
        }
        this.state.setError(result.error.message);
        return Result.fail<User, DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setError('Login failed. Please try again.');
        this.state.setLoading(false);
        return of(Result.fail<User, DomainError>({
          code: 'LOGIN_ERROR',
          message: 'Login failed'
        }));
      }),
      tap(() => this.state.setLoading(false))
    );
  }
  
  /**
   * Registers a new user
   */
  register(
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string,
    acceptTerms: boolean
  ): Observable<Result<User, DomainError>> {
    const credentials = RegisterCredentials.create({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      acceptTerms
    });
    
    // Validate credentials
    const validation = credentials.validate();
    if (!validation.isValid) {
      return of(Result.fail<User, DomainError>({
        code: 'VALIDATION_ERROR',
        message: validation.errors.join(', ')
      }));
    }
    
    this.state.setLoading(true);
    this.state.setError(null);
    
    return this.api.post<AuthResponse>('auth/register', credentials.toDTO()).pipe(
      map(result => {
        if (result.isSuccess) {
          const user = User.fromDTO(result.value.user);
          const token = AuthToken.fromDTO(result.value.token);
          this.state.setAuth(user, token);
          return Result.ok<User, DomainError>(user);
        }
        this.state.setError(result.error.message);
        return Result.fail<User, DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setError('Registration failed. Please try again.');
        this.state.setLoading(false);
        return of(Result.fail<User, DomainError>({
          code: 'REGISTER_ERROR',
          message: 'Registration failed'
        }));
      }),
      tap(() => this.state.setLoading(false))
    );
  }
  
  /**
   * Logs out the current user
   */
  logout(redirectTo: string = '/'): void {
    // Optionally notify the server
    this.api.post('auth/logout', {}).subscribe();
    
    // Clear local state
    this.state.clearAuth();
    
    // Redirect
    this.router.navigate([redirectTo]);
  }
  
  /**
   * Refreshes the authentication token
   */
  refreshToken(): Observable<Result<AuthToken, DomainError>> {
    const currentToken = this.state.token();
    if (!currentToken) {
      return of(Result.fail<AuthToken, DomainError>({
        code: 'NO_TOKEN',
        message: 'No token to refresh'
      }));
    }
    
    return this.api.post<AuthTokenDTO>('auth/refresh', {
      refreshToken: currentToken.refreshToken
    }).pipe(
      map(result => {
        if (result.isSuccess) {
          const token = AuthToken.fromDTO(result.value);
          this.state.updateToken(token);
          return Result.ok<AuthToken, DomainError>(token);
        }
        // Refresh failed, logout user
        this.logout('/auth/login');
        return Result.fail<AuthToken, DomainError>(result.error);
      }),
      catchError(error => {
        this.logout('/auth/login');
        return of(Result.fail<AuthToken, DomainError>({
          code: 'REFRESH_ERROR',
          message: 'Token refresh failed'
        }));
      })
    );
  }
  
  // ==========================================
  // Password Operations
  // ==========================================
  
  /**
   * Requests a password reset
   */
  requestPasswordReset(email: string): Observable<Result<void, DomainError>> {
    this.state.setLoading(true);
    
    return this.api.post<void>('auth/forgot-password', { email }).pipe(
      map(result => {
        if (result.isSuccess) {
          return Result.okVoid<DomainError>();
        }
        return Result.fail<void, DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setLoading(false);
        return of(Result.fail<void, DomainError>({
          code: 'RESET_ERROR',
          message: 'Failed to send reset email'
        }));
      }),
      tap(() => this.state.setLoading(false))
    );
  }
  
  /**
   * Resets password with token
   */
  resetPassword(token: string, newPassword: string): Observable<Result<void, DomainError>> {
    this.state.setLoading(true);
    
    return this.api.post<void>('auth/reset-password', { token, newPassword }).pipe(
      map(result => {
        if (result.isSuccess) {
          return Result.okVoid<DomainError>();
        }
        return Result.fail<void, DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setLoading(false);
        return of(Result.fail<void, DomainError>({
          code: 'RESET_ERROR',
          message: 'Failed to reset password'
        }));
      }),
      tap(() => this.state.setLoading(false))
    );
  }
  
  /**
   * Changes user's password
   */
  changePassword(currentPassword: string, newPassword: string): Observable<Result<void, DomainError>> {
    this.state.setLoading(true);
    
    return this.api.post<void>('auth/change-password', {
      currentPassword,
      newPassword
    }).pipe(
      map(result => {
        if (result.isSuccess) {
          return Result.okVoid<DomainError>();
        }
        return Result.fail<void, DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setLoading(false);
        return of(Result.fail<void, DomainError>({
          code: 'CHANGE_PASSWORD_ERROR',
          message: 'Failed to change password'
        }));
      }),
      tap(() => this.state.setLoading(false))
    );
  }
  
  // ==========================================
  // Profile Operations
  // ==========================================
  
  /**
   * Gets the current user's profile
   */
  getProfile(): Observable<Result<User, DomainError>> {
    this.state.setLoading(true);
    
    return this.api.get<UserDTO>('auth/profile').pipe(
      map(result => {
        if (result.isSuccess) {
          const user = User.fromDTO(result.value);
          this.state.updateUser(user);
          return Result.ok<User, DomainError>(user);
        }
        return Result.fail<User, DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setLoading(false);
        return of(Result.fail<User, DomainError>({
          code: 'PROFILE_ERROR',
          message: 'Failed to load profile'
        }));
      }),
      tap(() => this.state.setLoading(false))
    );
  }
  
  /**
   * Updates the current user's profile
   */
  updateProfile(data: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
  }>): Observable<Result<User, DomainError>> {
    this.state.setLoading(true);
    
    return this.api.patch<UserDTO>('auth/profile', data).pipe(
      map(result => {
        if (result.isSuccess) {
          const user = User.fromDTO(result.value);
          this.state.updateUser(user);
          return Result.ok<User, DomainError>(user);
        }
        return Result.fail<User, DomainError>(result.error);
      }),
      catchError(error => {
        this.state.setLoading(false);
        return of(Result.fail<User, DomainError>({
          code: 'UPDATE_ERROR',
          message: 'Failed to update profile'
        }));
      }),
      tap(() => this.state.setLoading(false))
    );
  }
}
