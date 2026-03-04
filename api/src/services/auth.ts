import { http } from './http';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest } from './types';
import type { t_user } from '@/types/database';

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await http.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
    const result = response.data.data;
    if (result.token) {
      http.setToken(result.token);
    }
    return result;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await http.post<ApiResponse<LoginResponse>>('/api/auth/register', data);
    const result = response.data.data;
    if (result.token) {
      http.setToken(result.token);
    }
    return result;
  },

  async logout(): Promise<void> {
    http.clearToken();
  },

  async getCurrentUser(): Promise<t_user> {
    const response = await http.get<ApiResponse<t_user>>('/api/auth/me');
    return response.data.data;
  },

  isAuthenticated(): boolean {
    return !!http.getToken();
  },
};
