/**
 * Auth API — Authentication operations
 */
import { pb, apiCall } from './client';

export interface LoginResult {
  token:  string;
  record: Record<string, unknown>;
}

export const authApi = {
  /** Email + password login */
  async login(email: string, password: string): Promise<LoginResult> {
    return apiCall(
      () => pb.collection('users').authWithPassword(email, password),
      'auth.login',
    );
  },

  /** Register a new user */
  async register(email: string, password: string, name: string): Promise<Record<string, unknown>> {
    return apiCall(
      () => pb.collection('users').create({
        email, password, passwordConfirm: password, name, role: 'student',
      }),
      'auth.register',
    );
  },

  /** Refresh current session */
  async refresh(): Promise<LoginResult> {
    return apiCall(
      () => pb.collection('users').authRefresh(),
      'auth.refresh',
    );
  },

  /** Sign out */
  logout(): void {
    pb.authStore.clear();
  },

  /** Current auth state */
  get isAuthenticated(): boolean { return pb.authStore.isValid; },
  get currentUser() { return pb.authStore.record; },
  get currentToken(): string { return pb.authStore.token; },
};
