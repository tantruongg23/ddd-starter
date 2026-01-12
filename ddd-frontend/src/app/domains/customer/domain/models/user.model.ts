import { BaseEntity } from '@core/domain/base-entity';
import { Email } from '@core/domain/base-value-object';

/**
 * User Entity
 * 
 * Represents a customer/user in the system.
 */
export class User extends BaseEntity<string> {
  private _email: Email;
  private _firstName: string;
  private _lastName: string;
  private _phone: string | null;
  private _avatarUrl: string | null;
  private _roles: UserRole[];
  private _status: UserStatus;
  private _lastLoginAt: Date | null;
  private _emailVerified: boolean;

  private constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._email = props.email;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._phone = props.phone ?? null;
    this._avatarUrl = props.avatarUrl ?? null;
    this._roles = props.roles ?? [UserRole.CUSTOMER];
    this._status = props.status ?? UserStatus.ACTIVE;
    this._lastLoginAt = props.lastLoginAt ?? null;
    this._emailVerified = props.emailVerified ?? false;
  }

  /**
   * Factory method to create a User
   */
  static create(props: UserProps): User {
    return new User(props);
  }

  /**
   * Creates a User from a DTO
   */
  static fromDTO(dto: UserDTO): User {
    return new User({
      id: dto.id,
      email: Email.create(dto.email),
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      avatarUrl: dto.avatarUrl,
      roles: dto.roles as UserRole[],
      status: dto.status as UserStatus,
      lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
      emailVerified: dto.emailVerified,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : undefined,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined
    });
  }

  // Getters
  get email(): Email { return this._email; }
  get emailAddress(): string { return this._email.value; }
  get firstName(): string { return this._firstName; }
  get lastName(): string { return this._lastName; }
  get fullName(): string { return `${this._firstName} ${this._lastName}`; }
  get phone(): string | null { return this._phone; }
  get avatarUrl(): string | null { return this._avatarUrl; }
  get roles(): readonly UserRole[] { return this._roles; }
  get status(): UserStatus { return this._status; }
  get lastLoginAt(): Date | null { return this._lastLoginAt; }
  get emailVerified(): boolean { return this._emailVerified; }

  /**
   * Gets the user's initials
   */
  get initials(): string {
    return `${this._firstName.charAt(0)}${this._lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Checks if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this._roles.includes(role);
  }

  /**
   * Checks if user is an admin
   */
  get isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Checks if user is active
   */
  get isActive(): boolean {
    return this._status === UserStatus.ACTIVE;
  }

  /**
   * Converts to a DTO
   */
  toDTO(): UserDTO {
    return {
      id: this.id,
      email: this._email.value,
      firstName: this._firstName,
      lastName: this._lastName,
      phone: this._phone ?? undefined,
      avatarUrl: this._avatarUrl ?? undefined,
      roles: [...this._roles],
      status: this._status,
      lastLoginAt: this._lastLoginAt?.toISOString(),
      emailVerified: this._emailVerified,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString()
    };
  }
}

/**
 * User Properties Interface
 */
export interface UserProps {
  id: string;
  email: Email;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  roles?: UserRole[];
  status?: UserStatus;
  lastLoginAt?: Date | null;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User DTO for API communication
 */
export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  roles?: string[];
  status?: string;
  lastLoginAt?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User Roles
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SELLER = 'SELLER',
  SUPPORT = 'SUPPORT'
}

/**
 * User Status
 */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION'
}
