import { http } from './http';
import type {
  ApiResponse,
  Config,
  CreateConfigRequest,
  UpdateConfigRequest,
} from './types';

export const configService = {
  async getConfigs(userId?: number): Promise<Config[]> {
    const params = userId ? { userId } : undefined;
    const response = await http.get<ApiResponse<Config[]>>('/api/configs', { params });
    return response.data.data;
  },

  async getConfig(id: number): Promise<Config> {
    const response = await http.get<ApiResponse<Config>>(`/api/configs/${id}`);
    return response.data.data;
  },

  async createConfig(data: CreateConfigRequest): Promise<Config> {
    const response = await http.post<ApiResponse<Config>>('/api/configs', data);
    return response.data.data;
  },

  async updateConfig(id: number, data: UpdateConfigRequest): Promise<Config> {
    const response = await http.put<ApiResponse<Config>>(`/api/configs/${id}`, data);
    return response.data.data;
  },

  async deleteConfig(id: number): Promise<void> {
    await http.delete(`/api/configs/${id}`);
  },

  async testConfig(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await http.post<ApiResponse<{ success: boolean; message?: string }>>(
      `/api/configs/${id}/test`
    );
    return response.data.data;
  },
};
