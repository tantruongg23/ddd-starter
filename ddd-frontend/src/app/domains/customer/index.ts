/**
 * Customer Domain Public API
 * 
 * This bounded context handles customer and authentication functionality.
 */

// Domain Models
export * from './domain/models/user.model';
export * from './domain/models/auth-credentials.model';

// Application Services
export * from './application/state/auth.state';
export * from './application/services/auth.service';

// Presentation Components
export * from './presentation/pages/login/login.component';
export * from './presentation/pages/register/register.component';
export * from './presentation/pages/profile/profile.component';

// Routes
export * from './customer.routes';
