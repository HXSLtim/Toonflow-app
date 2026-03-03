import { http } from './http';
import type {
  ApiResponse,
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
} from './types';

export const assetsService = {
  async getAssets(projectId: number): Promise<Asset[]> {
    const response = await http.get<ApiResponse<Asset[]>>(`/api/projects/${projectId}/assets`);
    return response.data.data;
  },

  async getAssetsByScript(scriptId: number): Promise<Asset[]> {
    const response = await http.get<ApiResponse<Asset[]>>(`/api/scripts/${scriptId}/assets`);
    return response.data.data;
  },

  async getAsset(id: number): Promise<Asset> {
    const response = await http.get<ApiResponse<Asset>>(`/api/assets/${id}`);
    return response.data.data;
  },

  async createAsset(data: CreateAssetRequest): Promise<Asset> {
    const response = await http.post<ApiResponse<Asset>>('/api/assets', data);
    return response.data.data;
  },

  async updateAsset(id: number, data: UpdateAssetRequest): Promise<Asset> {
    const response = await http.put<ApiResponse<Asset>>(`/api/assets/${id}`, data);
    return response.data.data;
  },

  async deleteAsset(id: number): Promise<void> {
    await http.delete(`/api/assets/${id}`);
  },

  async uploadAsset(projectId: number, file: File, metadata?: Partial<Asset>): Promise<Asset> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
    }

    const response = await http.post<ApiResponse<Asset>>(
      `/api/projects/${projectId}/assets/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async downloadAsset(id: number): Promise<Blob> {
    const response = await http.get<Blob>(`/api/assets/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
