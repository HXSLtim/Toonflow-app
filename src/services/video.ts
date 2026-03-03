import { http } from './http';
import type {
  ApiResponse,
  Video,
  VideoConfig,
  CreateVideoRequest,
  UpdateVideoRequest,
  CreateVideoConfigRequest,
  UpdateVideoConfigRequest,
} from './types';

export const videoService = {
  // Videos
  async getVideos(projectId: number): Promise<Video[]> {
    const response = await http.get<ApiResponse<Video[]>>(`/api/projects/${projectId}/videos`);
    return response.data.data;
  },

  async getVideosByScript(scriptId: number): Promise<Video[]> {
    const response = await http.get<ApiResponse<Video[]>>(`/api/scripts/${scriptId}/videos`);
    return response.data.data;
  },

  async getVideo(id: number): Promise<Video> {
    const response = await http.get<ApiResponse<Video>>(`/api/videos/${id}`);
    return response.data.data;
  },

  async createVideo(data: CreateVideoRequest): Promise<Video> {
    const response = await http.post<ApiResponse<Video>>('/api/videos', data);
    return response.data.data;
  },

  async updateVideo(id: number, data: UpdateVideoRequest): Promise<Video> {
    const response = await http.put<ApiResponse<Video>>(`/api/videos/${id}`, data);
    return response.data.data;
  },

  async deleteVideo(id: number): Promise<void> {
    await http.delete(`/api/videos/${id}`);
  },

  async generateVideo(scriptId: number, config: CreateVideoConfigRequest): Promise<Video> {
    const response = await http.post<ApiResponse<Video>>(`/api/scripts/${scriptId}/video/generate`, config);
    return response.data.data;
  },

  async getVideoStatus(id: number): Promise<{ state: number; progress?: number }> {
    const response = await http.get<ApiResponse<{ state: number; progress?: number }>>(`/api/videos/${id}/status`);
    return response.data.data;
  },

  // Video Configs
  async getVideoConfigs(projectId: number): Promise<VideoConfig[]> {
    const response = await http.get<ApiResponse<VideoConfig[]>>(`/api/projects/${projectId}/video-configs`);
    return response.data.data;
  },

  async getVideoConfig(id: number): Promise<VideoConfig> {
    const response = await http.get<ApiResponse<VideoConfig>>(`/api/video-configs/${id}`);
    return response.data.data;
  },

  async createVideoConfig(data: CreateVideoConfigRequest): Promise<VideoConfig> {
    const response = await http.post<ApiResponse<VideoConfig>>('/api/video-configs', data);
    return response.data.data;
  },

  async updateVideoConfig(id: number, data: UpdateVideoConfigRequest): Promise<VideoConfig> {
    const response = await http.put<ApiResponse<VideoConfig>>(`/api/video-configs/${id}`, data);
    return response.data.data;
  },

  async deleteVideoConfig(id: number): Promise<void> {
    await http.delete(`/api/video-configs/${id}`);
  },
};
