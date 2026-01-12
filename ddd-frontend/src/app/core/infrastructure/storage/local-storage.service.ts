import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Local Storage Service
 * 
 * Provides a type-safe wrapper around browser localStorage.
 * Handles SSR scenarios and provides JSON serialization/deserialization.
 * 
 * Features:
 * - Type-safe get/set operations
 * - Automatic JSON serialization
 * - SSR-safe (checks for browser environment)
 * - Expiration support
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser: boolean;
  private readonly prefix = 'ddd_';

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Stores a value in localStorage
   */
  set<T>(key: string, value: T, expirationMinutes?: number): void {
    if (!this.isBrowser) return;

    const storageKey = this.getKey(key);
    const item: StorageItem<T> = {
      value,
      timestamp: Date.now(),
      expiration: expirationMinutes ? Date.now() + expirationMinutes * 60 * 1000 : undefined
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      console.error('LocalStorage set error:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.clearExpired();
        // Retry once after clearing
        try {
          localStorage.setItem(storageKey, JSON.stringify(item));
        } catch {
          console.error('LocalStorage still full after clearing expired items');
        }
      }
    }
  }

  /**
   * Retrieves a value from localStorage
   */
  get<T>(key: string): T | null {
    if (!this.isBrowser) return null;

    const storageKey = this.getKey(key);
    const itemStr = localStorage.getItem(storageKey);
    
    if (!itemStr) return null;

    try {
      const item: StorageItem<T> = JSON.parse(itemStr);
      
      // Check expiration
      if (item.expiration && Date.now() > item.expiration) {
        this.remove(key);
        return null;
      }
      
      return item.value;
    } catch {
      // If parsing fails, try returning raw value
      return itemStr as unknown as T;
    }
  }

  /**
   * Removes a value from localStorage
   */
  remove(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.getKey(key));
  }

  /**
   * Checks if a key exists in localStorage
   */
  has(key: string): boolean {
    if (!this.isBrowser) return false;
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  /**
   * Clears all items with the app prefix
   */
  clear(): void {
    if (!this.isBrowser) return;
    
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clears expired items
   */
  clearExpired(): void {
    if (!this.isBrowser) return;

    const keysToRemove: string[] = [];
    const now = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(this.prefix)) continue;

      try {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) continue;

        const item: StorageItem<unknown> = JSON.parse(itemStr);
        if (item.expiration && now > item.expiration) {
          keysToRemove.push(key);
        }
      } catch {
        // Invalid item, remove it
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Gets all keys with the app prefix
   */
  keys(): string[] {
    if (!this.isBrowser) return [];

    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }

  /**
   * Gets the prefixed storage key
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

/**
 * Storage Item Interface
 */
interface StorageItem<T> {
  value: T;
  timestamp: number;
  expiration?: number;
}
