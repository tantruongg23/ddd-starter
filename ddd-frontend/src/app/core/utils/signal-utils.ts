import { Signal, WritableSignal, signal, computed, effect, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Signal Utilities
 * 
 * Utility functions for working with Angular Signals.
 * Provides patterns for state management, async operations, and computed values.
 */

/**
 * Creates a signal with history tracking
 */
export function signalWithHistory<T>(initialValue: T, maxHistory: number = 10): {
  value: WritableSignal<T>;
  history: Signal<T[]>;
  undo: () => void;
  redo: () => void;
  canUndo: Signal<boolean>;
  canRedo: Signal<boolean>;
} {
  const _value = signal<T>(initialValue);
  const _history = signal<T[]>([initialValue]);
  const _historyIndex = signal<number>(0);
  
  return {
    value: _value,
    history: _history.asReadonly(),
    
    canUndo: computed(() => _historyIndex() > 0),
    canRedo: computed(() => _historyIndex() < _history().length - 1),
    
    undo: () => {
      const index = _historyIndex();
      if (index > 0) {
        _historyIndex.set(index - 1);
        _value.set(_history()[index - 1]);
      }
    },
    
    redo: () => {
      const index = _historyIndex();
      const history = _history();
      if (index < history.length - 1) {
        _historyIndex.set(index + 1);
        _value.set(history[index + 1]);
      }
    }
  };
}

/**
 * Creates a debounced signal
 */
export function debouncedSignal<T>(
  source: Signal<T>,
  delayMs: number = 300
): Signal<T> {
  const debouncedValue = signal<T>(untracked(() => source()));
  
  effect(() => {
    const value = source();
    const timeoutId = setTimeout(() => {
      debouncedValue.set(value);
    }, delayMs);
    
    return () => clearTimeout(timeoutId);
  });
  
  return debouncedValue.asReadonly();
}

/**
 * Async State Interface
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Creates an async state signal
 */
export function asyncSignal<T>(initialData: T | null = null): {
  state: Signal<AsyncState<T>>;
  setLoading: () => void;
  setData: (data: T) => void;
  setError: (error: string) => void;
  reset: () => void;
} {
  const _state = signal<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null
  });
  
  return {
    state: _state.asReadonly(),
    
    setLoading: () => {
      _state.update(s => ({ ...s, loading: true, error: null }));
    },
    
    setData: (data: T) => {
      _state.set({ data, loading: false, error: null });
    },
    
    setError: (error: string) => {
      _state.update(s => ({ ...s, loading: false, error }));
    },
    
    reset: () => {
      _state.set({ data: initialData, loading: false, error: null });
    }
  };
}

/**
 * Creates a toggle signal
 */
export function toggleSignal(initialValue: boolean = false): {
  value: Signal<boolean>;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
} {
  const _value = signal(initialValue);
  
  return {
    value: _value.asReadonly(),
    toggle: () => _value.update(v => !v),
    setTrue: () => _value.set(true),
    setFalse: () => _value.set(false)
  };
}

/**
 * Creates a counter signal
 */
export function counterSignal(initialValue: number = 0): {
  value: Signal<number>;
  increment: (amount?: number) => void;
  decrement: (amount?: number) => void;
  reset: () => void;
  set: (value: number) => void;
} {
  const _value = signal(initialValue);
  
  return {
    value: _value.asReadonly(),
    increment: (amount = 1) => _value.update(v => v + amount),
    decrement: (amount = 1) => _value.update(v => v - amount),
    reset: () => _value.set(initialValue),
    set: (value: number) => _value.set(value)
  };
}

/**
 * Creates a list signal with common operations
 */
export function listSignal<T>(initialItems: T[] = []): {
  items: Signal<T[]>;
  count: Signal<number>;
  isEmpty: Signal<boolean>;
  add: (item: T) => void;
  addMany: (items: T[]) => void;
  remove: (predicate: (item: T) => boolean) => void;
  update: (predicate: (item: T) => boolean, updater: (item: T) => T) => void;
  clear: () => void;
  set: (items: T[]) => void;
} {
  const _items = signal<T[]>(initialItems);
  
  return {
    items: _items.asReadonly(),
    count: computed(() => _items().length),
    isEmpty: computed(() => _items().length === 0),
    
    add: (item: T) => _items.update(items => [...items, item]),
    
    addMany: (newItems: T[]) => _items.update(items => [...items, ...newItems]),
    
    remove: (predicate: (item: T) => boolean) => {
      _items.update(items => items.filter(item => !predicate(item)));
    },
    
    update: (predicate: (item: T) => boolean, updater: (item: T) => T) => {
      _items.update(items => 
        items.map(item => predicate(item) ? updater(item) : item)
      );
    },
    
    clear: () => _items.set([]),
    
    set: (items: T[]) => _items.set(items)
  };
}

/**
 * Creates a map signal
 */
export function mapSignal<K, V>(initialEntries: [K, V][] = []): {
  entries: Signal<Map<K, V>>;
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
  delete: (key: K) => void;
  has: (key: K) => boolean;
  clear: () => void;
  size: Signal<number>;
} {
  const _map = signal<Map<K, V>>(new Map(initialEntries));
  
  return {
    entries: _map.asReadonly(),
    size: computed(() => _map().size),
    
    get: (key: K) => _map().get(key),
    
    set: (key: K, value: V) => {
      _map.update(map => {
        const newMap = new Map(map);
        newMap.set(key, value);
        return newMap;
      });
    },
    
    delete: (key: K) => {
      _map.update(map => {
        const newMap = new Map(map);
        newMap.delete(key);
        return newMap;
      });
    },
    
    has: (key: K) => _map().has(key),
    
    clear: () => _map.set(new Map())
  };
}

/**
 * Creates a form state signal
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

export function formSignal<T extends Record<string, unknown>>(initialValues: T): {
  state: Signal<FormState<T>>;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setError: <K extends keyof T>(field: K, error: string | null) => void;
  setTouched: <K extends keyof T>(field: K) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
  getFieldState: <K extends keyof T>(field: K) => Signal<{
    value: T[K];
    error: string | null;
    touched: boolean;
  }>;
} {
  const _state = signal<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isDirty: false,
    isSubmitting: false
  });
  
  return {
    state: _state.asReadonly(),
    
    setValue: <K extends keyof T>(field: K, value: T[K]) => {
      _state.update(s => ({
        ...s,
        values: { ...s.values, [field]: value },
        isDirty: true
      }));
    },
    
    setError: <K extends keyof T>(field: K, error: string | null) => {
      _state.update(s => {
        const errors = { ...s.errors };
        if (error) {
          errors[field] = error;
        } else {
          delete errors[field];
        }
        return {
          ...s,
          errors,
          isValid: Object.keys(errors).length === 0
        };
      });
    },
    
    setTouched: <K extends keyof T>(field: K) => {
      _state.update(s => ({
        ...s,
        touched: { ...s.touched, [field]: true }
      }));
    },
    
    setSubmitting: (submitting: boolean) => {
      _state.update(s => ({ ...s, isSubmitting: submitting }));
    },
    
    reset: () => {
      _state.set({
        values: initialValues,
        errors: {},
        touched: {},
        isValid: true,
        isDirty: false,
        isSubmitting: false
      });
    },
    
    getFieldState: <K extends keyof T>(field: K) => {
      return computed(() => {
        const s = _state();
        return {
          value: s.values[field],
          error: (s.errors[field] as string) ?? null,
          touched: s.touched[field] ?? false
        };
      });
    }
  };
}
