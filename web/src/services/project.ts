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
    const response = await http.post<ApiResponse<Project[]>>('/project/getProject', {});
    const list = Array.isArray(response.data.data) ? response.data.data : [];
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return {
      items,
      total: list.length,
      page,
      pageSize,
    };
  },

  async getProject(id: number): Promise<Project> {
    const response = await http.post<ApiResponse<Project[]>>('/project/getSingleProject', { id });
    const list = Array.isArray(response.data.data) ? response.data.data : [];
    const project = list[0];

    if (!project) {
      throw new Error(`未找到项目（ID: ${id}）`);
    }

    return project;
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    await http.post('/project/addProject', {
      name: data.name ?? '',
      intro: data.intro ?? '',
      type: data.type ?? '',
      artStyle: data.artStyle ?? '',
      videoRatio: data.videoRatio ?? '',
    });

    const refreshed = await projectService.getProjects({ page: 1, pageSize: 1000 });
    const candidates = refreshed.items.filter((project) => project.name === data.name);
    const sortedCandidates = [...candidates].sort((left, right) => {
      const leftTime = left.createTime ?? 0;
      const rightTime = right.createTime ?? 0;
      return rightTime - leftTime;
    });

    const createdProject =
      sortedCandidates[0] ??
      [...refreshed.items].sort((left, right) => {
        const leftTime = left.createTime ?? 0;
        const rightTime = right.createTime ?? 0;
        return rightTime - leftTime;
      })[0];

    if (!createdProject) {
      throw new Error('项目已创建，但刷新最新项目列表失败');
    }

    return createdProject;
  },

  async updateProject(id: number, data: UpdateProjectRequest): Promise<Project> {
    await http.post('/project/updateProject', {
      id,
      intro: data.intro,
      type: data.type,
      artStyle: data.artStyle,
      videoRatio: data.videoRatio,
    });

    return projectService.getProject(id);
  },

  async deleteProject(id: number): Promise<void> {
    await http.post('/project/delProject', { id });
  },

  async getUserProjects(userId: number, params?: PaginationParams): Promise<PaginatedResponse<Project>> {
    const response = await projectService.getProjects(params);
    return {
      ...response,
      items: response.items.filter((project) => (project.userId ?? 1) === userId),
    };
  },
};
