import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { User, UserDTO, UserRole } from '../../domain/models/user.model';
import { AuthToken, AuthTokenDTO } from '../../domain/models/auth-credentials.model';
import { LocalStorageService } from '@core/infrastructure/storage/local-storage.service';
import { environment } from '@env';

const TOKEN_KEY = environment.auth.tokenKey;
const REFRESH_TOKEN_KEY = environment.auth.refreshTokenKey;
const USER_KEY = 'current_user';

/**
 * Auth State
 * 
 * Signal-based state management for authentication.
 * Handles user session and authentication tokens.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthState {
  private readonly storageService = inject(LocalStorageService);
  
  // ==========================================
  // State Signals
  // ==========================================
  
  private readonly _currentUser = signal<User | null>(null);
  private readonly _token = signal<AuthToken | null>(null);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _isInitialized = signal<boolean>(false);
  
  // ==========================================
  // Public Read-only Selectors
  // ==========================================
  
  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();
  
  // ==========================================
  // Computed Selectors
  // ==========================================
  
  /**
   * Whether the user is authenticated
   */
  readonly isAuthenticated = computed(() => {
    const user = this._currentUser();
    const token = this._token();
    return user !== null && token !== null && !token.isExpired;
  });
  
  /**
   * Whether the user is a guest (not authenticated)
   */
  readonly isGuest = computed(() => !this.isAuthenticated());
  
  /**
   * User's display name
   */
  readonly displayName = computed(() => {
    const user = this._currentUser();
    return user?.fullName ?? 'Guest';
  });
  
  /**
   * User's initials
   */
  readonly initials = computed(() => {
    const user = this._currentUser();
    return user?.initials ?? '?';
  });
  
  /**
   * User's email address
   */
  readonly email = computed(() => {
    const user = this._currentUser();
    return user?.emailAddress ?? '';
  });
  
  /**
   * User's avatar URL or null
   */
  readonly avatarUrl = computed(() => {
    const user = this._currentUser();
    return user?.avatarUrl ?? null;
  });
  
  /**
   * User's roles
   */
  readonly roles = computed(() => {
    const user = this._currentUser();
    return user?.roles ?? [];
  });
  
  /**
   * Whether user is admin
   */
  readonly isAdmin = computed(() => {
    const user = this._currentUser();
    return user?.isAdmin ?? false;
  });
  
  /**
   * Access token for API calls
   */
  readonly accessToken = computed(() => {
    const token = this._token();
    return token?.accessToken ?? null;
  });
  
  /**
   * Whether token needs refresh
   */
  readonly needsTokenRefresh = computed(() => {
    const token = this._token();
    return token?.isExpiringSoon ?? false;
  });
  
  constructor() {
    // Initialize auth state from storage
    this.initializeFromStorage();
    
    // Persist changes to storage
    effect(() => {
      const user = this._currentUser();
      const token = this._token();
      
      if (user && token) {
        this.persistToStorage(user, token);
      }
    });
  }
  
  // ==========================================
  // Actions (State Mutators)
  // ==========================================
  
  /**
   * Sets the authenticated user and token
   */
  setAuth(user: User, token: AuthToken): void {
    this._currentUser.set(user);
    this._token.set(token);
    this._error.set(null);
  }
  
  /**
   * Updates the current user
   */
  updateUser(user: User): void {
    this._currentUser.set(user);
  }
  
  /**
   * Updates the auth token
   */
  updateToken(token: AuthToken): void {
    this._token.set(token);
  }
  
  /**
   * Clears the authentication state (logout)
   */
  clearAuth(): void {
    this._currentUser.set(null);
    this._token.set(null);
    this._error.set(null);
    this.clearStorage();
  }
  
  /**
   * Sets loading state
   */
  setLoading(loading: boolean): void {
    this._isLoading.set(loading);
  }
  
  /**
   * Sets error state
   */
  setError(error: string | null): void {
    this._error.set(error);
    this._isLoading.set(false);
  }
  
  /**
   * Checks if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this._currentUser()?.hasRole(role) ?? false;
  }
  
  /**
   * Checks if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const user = this._currentUser();
    if (!user) return false;
    return roles.some(role => user.hasRole(role));
  }
  
  // ==========================================
  // Storage Operations
  // ==========================================
  
  private initializeFromStorage(): void {
    const tokenDTO = this.storageService.get<AuthTokenDTO>(TOKEN_KEY);
    const userDTO = this.storageService.get<UserDTO>(USER_KEY);
    
    if (tokenDTO && userDTO) {
      try {
        const token = AuthToken.fromDTO(tokenDTO);
        const user = User.fromDTO(userDTO);
        
        if (!token.isExpired) {
          this._currentUser.set(user);
          this._token.set(token);
        } else {
          // Token expired, clear storage
          this.clearStorage();
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        this.clearStorage();
      }
    }
    
    this._isInitialized.set(true);
  }
  
  private persistToStorage(user: User, token: AuthToken): void {
    this.storageService.set(TOKEN_KEY, token.toDTO());
    this.storageService.set(REFRESH_TOKEN_KEY, token.refreshToken);
    this.storageService.set(USER_KEY, user.toDTO());
  }
  
  private clearStorage(): void {
    this.storageService.remove(TOKEN_KEY);
    this.storageService.remove(REFRESH_TOKEN_KEY);
    this.storageService.remove(USER_KEY);
  }
}
