import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../application/services/auth.service';
import { AuthState } from '../../../application/state/auth.state';

/**
 * Profile Page Component
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    AvatarModule,
    MessageModule
  ],
  template: `
    <div class="profile-page">
      <div class="container">
        <header class="page-header animate-slide-up">
          <h1 class="page-title">My Profile</h1>
        </header>
        
        <div class="profile-layout">
          <!-- Profile Sidebar -->
          <aside class="profile-sidebar animate-slide-in stagger-1">
            <div class="profile-card">
              <p-avatar 
                [label]="initials()"
                [image]="avatarUrl() ?? undefined"
                size="xlarge"
                shape="circle"
                styleClass="profile-avatar"
              />
              <h3 class="profile-name">{{ displayName() }}</h3>
              <p class="profile-email">{{ email() }}</p>
              
              <button class="upload-btn">
                <i class="pi pi-camera"></i>
                Change Photo
              </button>
            </div>
            
            <nav class="profile-nav">
              <a class="nav-item active">
                <i class="pi pi-user"></i>
                Profile Information
              </a>
              <a class="nav-item">
                <i class="pi pi-shopping-bag"></i>
                Order History
              </a>
              <a class="nav-item">
                <i class="pi pi-map-marker"></i>
                Addresses
              </a>
              <a class="nav-item">
                <i class="pi pi-credit-card"></i>
                Payment Methods
              </a>
              <a class="nav-item">
                <i class="pi pi-lock"></i>
                Security
              </a>
            </nav>
          </aside>
          
          <!-- Profile Content -->
          <main class="profile-content animate-slide-up stagger-2">
            <p-tabs value="0">
              <p-tablist>
                <p-tab value="0">Personal Information</p-tab>
                <p-tab value="1">Security</p-tab>
              </p-tablist>
              <p-tabpanels>
                <p-tabpanel value="0">
                  @if (successMessage()) {
                    <p-message severity="success" [text]="successMessage()!" styleClass="success-message" />
                  }
                  @if (error()) {
                    <p-message severity="error" [text]="error()!" styleClass="error-message" />
                  }
                  
                  <form (ngSubmit)="updateProfile()" class="profile-form">
                    <div class="form-row">
                      <div class="form-field">
                        <label for="firstName">First Name</label>
                        <input 
                          id="firstName"
                          type="text" 
                          pInputText 
                          [(ngModel)]="firstName"
                          name="firstName"
                        />
                      </div>
                      <div class="form-field">
                        <label for="lastName">Last Name</label>
                        <input 
                          id="lastName"
                          type="text" 
                          pInputText 
                          [(ngModel)]="lastName"
                          name="lastName"
                        />
                      </div>
                    </div>
                    
                    <div class="form-field">
                      <label for="email">Email Address</label>
                      <input 
                        id="email"
                        type="email" 
                        pInputText 
                        [value]="email()"
                        disabled
                      />
                      <small class="field-hint">Email cannot be changed</small>
                    </div>
                    
                    <div class="form-field">
                      <label for="phone">Phone Number</label>
                      <input 
                        id="phone"
                        type="tel" 
                        pInputText 
                        [(ngModel)]="phone"
                        name="phone"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    
                    <div class="form-actions">
                      <p-button 
                        type="submit" 
                        label="Save Changes"
                        [loading]="isLoading()"
                      />
                    </div>
                  </form>
                </p-tabpanel>
                <p-tabpanel value="1">
                  <form (ngSubmit)="changePassword()" class="profile-form">
                    <div class="form-field">
                      <label for="currentPassword">Current Password</label>
                      <input 
                        id="currentPassword"
                        type="password" 
                        pInputText 
                        [(ngModel)]="currentPassword"
                        name="currentPassword"
                      />
                    </div>
                    
                    <div class="form-field">
                      <label for="newPassword">New Password</label>
                      <input 
                        id="newPassword"
                        type="password" 
                        pInputText 
                        [(ngModel)]="newPassword"
                        name="newPassword"
                      />
                    </div>
                    
                    <div class="form-field">
                      <label for="confirmNewPassword">Confirm New Password</label>
                      <input 
                        id="confirmNewPassword"
                        type="password" 
                        pInputText 
                        [(ngModel)]="confirmNewPassword"
                        name="confirmNewPassword"
                      />
                    </div>
                    
                    <div class="form-actions">
                      <p-button 
                        type="submit" 
                        label="Change Password"
                        [loading]="isLoading()"
                      />
                    </div>
                  </form>
                </p-tabpanel>
              </p-tabpanels>
            </p-tabs>
          </main>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      min-height: 100vh;
      background: var(--color-surface-alt);
      padding: 2rem 0 4rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
    }

    @media (max-width: 1024px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }
    }

    .profile-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .profile-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 2rem;
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    :host ::ng-deep .profile-avatar {
      width: 100px;
      height: 100px;
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .profile-name {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.25rem;
    }

    .profile-email {
      color: var(--color-text-secondary);
      font-size: 0.9375rem;
      margin: 0 0 1rem;
    }

    .upload-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .upload-btn:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }

    .profile-nav {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      color: var(--color-text-secondary);
      text-decoration: none;
      border-bottom: 1px solid var(--color-border);
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .nav-item:last-child {
      border-bottom: none;
    }

    .nav-item:hover {
      background: var(--color-surface-alt);
      color: var(--color-text-primary);
    }

    .nav-item.active {
      background: var(--color-surface-dark);
      color: var(--color-accent);
      font-weight: 500;
    }

    .profile-content {
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
    }

    :host ::ng-deep .success-message,
    :host ::ng-deep .error-message {
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      max-width: 600px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-field label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-primary);
    }

    .form-field input {
      width: 100%;
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .form-actions {
      padding-top: 0.5rem;
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly authState = inject(AuthState);
  
  // State selectors
  readonly displayName = this.authState.displayName;
  readonly email = this.authState.email;
  readonly initials = this.authState.initials;
  readonly avatarUrl = this.authState.avatarUrl;
  readonly isLoading = this.authState.isLoading;
  readonly error = this.authState.error;
  
  // Local state
  successMessage = signal<string | null>(null);
  
  // Form fields
  firstName = '';
  lastName = '';
  phone = '';
  
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';
  
  ngOnInit(): void {
    const user = this.authState.currentUser();
    if (user) {
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.phone = user.phone ?? '';
    }
  }
  
  updateProfile(): void {
    this.successMessage.set(null);
    
    this.authService.updateProfile({
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone
    }).subscribe(result => {
      if (result.isSuccess) {
        this.successMessage.set('Profile updated successfully!');
        setTimeout(() => this.successMessage.set(null), 3000);
      }
    });
  }
  
  changePassword(): void {
    if (this.newPassword !== this.confirmNewPassword) {
      return;
    }
    
    this.successMessage.set(null);
    
    this.authService.changePassword(this.currentPassword, this.newPassword)
      .subscribe(result => {
        if (result.isSuccess) {
          this.successMessage.set('Password changed successfully!');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
          setTimeout(() => this.successMessage.set(null), 3000);
        }
      });
  }
}
