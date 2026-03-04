import { http } from './http';
import type {
  ApiResponse,
  Image,
  CreateImageRequest,
  UpdateImageRequest,
} from './types';

export const storyboardService = {
  async getImages(projectId: number): Promise<Image[]> {
    const response = await http.get<ApiResponse<Image[]>>(`/api/projects/${projectId}/images`);
    return response.data.data;
  },

  async getImagesByScript(scriptId: number): Promise<Image[]> {
    const response = await http.get<ApiResponse<Image[]>>(`/api/scripts/${scriptId}/images`);
    return response.data.data;
  },

  async getImage(id: number): Promise<Image> {
    const response = await http.get<ApiResponse<Image>>(`/api/images/${id}`);
    return response.data.data;
  },

  async createImage(data: CreateImageRequest): Promise<Image> {
    const response = await http.post<ApiResponse<Image>>('/api/images', data);
    return response.data.data;
  },

  async updateImage(id: number, data: UpdateImageRequest): Promise<Image> {
    const response = await http.put<ApiResponse<Image>>(`/api/images/${id}`, data);
    return response.data.data;
  },

  async deleteImage(id: number): Promise<void> {
    await http.delete(`/api/images/${id}`);
  },

  async generateStoryboard(scriptId: number, config?: Record<string, unknown>): Promise<Image[]> {
    const response = await http.post<ApiResponse<Image[]>>(`/api/scripts/${scriptId}/storyboard/generate`, config);
    return response.data.data;
  },
};
