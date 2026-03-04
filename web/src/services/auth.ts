import { http } from './http';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest } from './types';
import type { t_user } from '@/types/database';

interface LegacyLoginResponse {
  token: string;
  id: number;
  name: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await http.post<ApiResponse<LegacyLoginResponse>>('/other/login', {
      username: data.name,
      password: data.password,
    });

    const payload = response.data.data;
    const normalizedToken = payload.token.startsWith('Bearer ')
      ? payload.token.slice('Bearer '.length)
      : payload.token;

    if (normalizedToken) {
      http.setToken(normalizedToken);
    }

    return {
      token: normalizedToken,
      user: {
        id: payload.id,
        name: payload.name,
      },
    };
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    void data;
    throw new Error('当前后端暂不支持注册功能');
  },

  async logout(): Promise<void> {
    http.clearToken();
  },

  async getCurrentUser(): Promise<t_user> {
    const response = await http.get<ApiResponse<t_user>>('/user/getUser');
    return response.data.data;
  },

  isAuthenticated(): boolean {
    return !!http.getToken();
  },
};
