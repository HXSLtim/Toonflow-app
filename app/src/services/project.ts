import { http } from './http';
import type {
  ApiResponse,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  PaginationParams,
  PaginatedResponse,
} from './types';

export const projectService = {
  async getProjects(params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    const response = await http.get<ApiResponse<PaginatedResponse<Project>>>('/api/projects', { params });
    return response.data.data;
  },

  async getProject(id: number): Promise<Project> {
    const response = await http.get<ApiResponse<Project>>(`/api/projects/${id}`);
    return response.data.data;
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await http.post<ApiResponse<Project>>('/api/projects', data);
    return response.data.data;
  },

  async updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
    const response = await http.put<ApiResponse<Project>>(`/api/projects/${id}`, data);
    return response.data.data;
  },

  async deleteProject(id: number): Promise<void> {
    await http.delete(`/api/projects/${id}`);
  },

  async getUserProjects(userId: number, params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    const response = await http.get<ApiResponse<PaginatedResponse<Project>>>(`/api/users/${userId}/projects`, { params });
    return response.data.data;
  },
};
