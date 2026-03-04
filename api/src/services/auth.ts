import { http } from './http';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest } from './types';

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

  async getCurrentUser(): Promise<any> {
    const response = await http.get<ApiResponse<any>>('/api/auth/me');
    return response.data.data;
  },

  isAuthenticated(): boolean {
    return !!http.getToken();
  },
};
