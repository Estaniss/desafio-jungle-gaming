
import { api } from './api';
import type {
  ApiResponse,
  AuthSession,
  LoginPayload,
  RegisterPayload,
  User,
} from '../types/api';
import { useAuthStore } from '../stores/auth-store';
import { disconnectRealtime } from './realtime';

const TOKEN_KEY = 'kurio-access-token';

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    const response = await api.post<ApiResponse<AuthSession>>(
      '/auth/login',
      payload,
    );

    const session = response.data.data;

    localStorage.setItem(TOKEN_KEY, session.accessToken);
    useAuthStore.getState().setUser(session.user);

    const { connectRealtime } = await import('./realtime');
    connectRealtime(session.accessToken);

    return session.user;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const response = await api.post<ApiResponse<AuthSession>>(
      '/auth/register',
      payload,
    );

    const session = response.data.data;

    localStorage.setItem(TOKEN_KEY, session.accessToken);
    useAuthStore.getState().setUser(session.user);

    const { connectRealtime } = await import('./realtime');
    connectRealtime(session.accessToken);

    return session.user;
  },

  async restoreSession(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      useAuthStore.getState().clearSession();
      return null;
    }

    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');

      const user = response.data.data;

      useAuthStore.getState().setUser(user);

      const { connectRealtime } = await import('./realtime');
      connectRealtime(token);

      return user;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      disconnectRealtime();
      useAuthStore.getState().clearSession();

      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      disconnectRealtime();
      useAuthStore.getState().clearSession();
    }
  },
};
