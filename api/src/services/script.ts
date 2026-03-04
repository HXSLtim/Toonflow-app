import { http } from './http';
import type {
  ApiResponse,
  Script,
  CreateScriptRequest,
  UpdateScriptRequest,
  Outline,
  CreateOutlineRequest,
  UpdateOutlineRequest,
  Novel,
  CreateNovelRequest,
  UpdateNovelRequest,
  Storyline,
  CreateStorylineRequest,
  UpdateStorylineRequest,
} from './types';

export const scriptService = {
  // Scripts
  async getScripts(projectId: number): Promise<Script[]> {
    const response = await http.get<ApiResponse<Script[]>>(`/api/projects/${projectId}/scripts`);
    return response.data.data;
  },

  async getScript(id: number): Promise<Script> {
    const response = await http.get<ApiResponse<Script>>(`/api/scripts/${id}`);
    return response.data.data;
  },

  async createScript(data: CreateScriptRequest): Promise<Script> {
    const response = await http.post<ApiResponse<Script>>('/api/scripts', data);
    return response.data.data;
  },

  async updateScript(id: number, data: UpdateScriptRequest): Promise<Script> {
    const response = await http.put<ApiResponse<Script>>(`/api/scripts/${id}`, data);
    return response.data.data;
  },

  async deleteScript(id: number): Promise<void> {
    await http.delete(`/api/scripts/${id}`);
  },

  // Outlines
  async getOutlines(projectId: number): Promise<Outline[]> {
    const response = await http.get<ApiResponse<Outline[]>>(`/api/projects/${projectId}/outlines`);
    return response.data.data;
  },

  async getOutline(id: number): Promise<Outline> {
    const response = await http.get<ApiResponse<Outline>>(`/api/outlines/${id}`);
    return response.data.data;
  },

  async createOutline(data: CreateOutlineRequest): Promise<Outline> {
    const response = await http.post<ApiResponse<Outline>>('/api/outlines', data);
    return response.data.data;
  },

  async updateOutline(id: number, data: UpdateOutlineRequest): Promise<Outline> {
    const response = await http.put<ApiResponse<Outline>>(`/api/outlines/${id}`, data);
    return response.data.data;
  },

  async deleteOutline(id: number): Promise<void> {
    await http.delete(`/api/outlines/${id}`);
  },

  // Novels
  async getNovels(projectId: number): Promise<Novel[]> {
    const response = await http.get<ApiResponse<Novel[]>>(`/api/projects/${projectId}/novels`);
    return response.data.data;
  },

  async getNovel(id: number): Promise<Novel> {
    const response = await http.get<ApiResponse<Novel>>(`/api/novels/${id}`);
    return response.data.data;
  },

  async createNovel(data: CreateNovelRequest): Promise<Novel> {
    const response = await http.post<ApiResponse<Novel>>('/api/novels', data);
    return response.data.data;
  },

  async updateNovel(id: number, data: UpdateNovelRequest): Promise<Novel> {
    const response = await http.put<ApiResponse<Novel>>(`/api/novels/${id}`, data);
    return response.data.data;
  },

  async deleteNovel(id: number): Promise<void> {
    await http.delete(`/api/novels/${id}`);
  },

  // Storylines
  async getStorylines(projectId: number): Promise<Storyline[]> {
    const response = await http.get<ApiResponse<Storyline[]>>(`/api/projects/${projectId}/storylines`);
    return response.data.data;
  },

  async getStoryline(id: number): Promise<Storyline> {
    const response = await http.get<ApiResponse<Storyline>>(`/api/storylines/${id}`);
    return response.data.data;
  },

  async createStoryline(data: CreateStorylineRequest): Promise<Storyline> {
    const response = await http.post<ApiResponse<Storyline>>('/api/storylines', data);
    return response.data.data;
  },

  async updateStoryline(id: number, data: UpdateStorylineRequest): Promise<Storyline> {
    const response = await http.put<ApiResponse<Storyline>>(`/api/storylines/${id}`, data);
    return response.data.data;
  },

  async deleteStoryline(id: number): Promise<void> {
    await http.delete(`/api/storylines/${id}`);
  },
};
