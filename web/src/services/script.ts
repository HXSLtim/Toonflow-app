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
    const response = await http.post<ApiResponse<Script[]>>('/outline/getPartScript', { projectId });
    return response.data.data;
  },

  async getScript(id: number): Promise<Script> {
    throw new Error(`当前后端不支持按 ID(${id}) 单独查询脚本，请先加载项目脚本列表`);
  },

  async createScript(data: CreateScriptRequest): Promise<Script> {
    void data;
    throw new Error('当前后端不支持直接新建脚本，请先创建大纲并生成脚本');
  },

  async updateScript(id: number, data: UpdateScriptRequest): Promise<Script> {
    const content = data.content ?? '';
    await http.post('/outline/updateScript', {
      id,
      content,
    });

    return {
      id,
      content,
    };
  },

  async deleteScript(id: number): Promise<void> {
    throw new Error(`当前后端不支持删除脚本（scriptId=${id}）`);
  },

  // Outlines
  async getOutlines(projectId: number): Promise<Outline[]> {
    const response = await http.post<ApiResponse<Outline[]>>('/outline/getOutline', { projectId });
    return response.data.data;
  },

  async getOutline(id: number): Promise<Outline> {
    throw new Error(`当前后端不支持按 ID(${id}) 单独查询大纲，请先按项目查询大纲`);
  },

  async createOutline(data: CreateOutlineRequest): Promise<Outline> {
    const payload = {
      projectId: data.projectId,
      data: data.data ?? '',
    };

    await http.post('/outline/addOutline', payload);
    const latest = await scriptService.getOutlines(data.projectId ?? 0);
    return latest[latest.length - 1] ?? payload;
  },

  async updateOutline(id: number, data: UpdateOutlineRequest): Promise<Outline> {
    const payload = {
      id,
      data: data.data ?? '',
    };

    await http.post('/outline/updateOutline', payload);
    return payload;
  },

  async deleteOutline(id: number): Promise<void> {
    throw new Error(`当前后端删除大纲需要 projectId（outlineId=${id}），请使用 deleteOutlineWithProject`);
  },

  async deleteOutlineWithProject(id: number, projectId: number): Promise<void> {
    await http.post('/outline/delOutline', {
      id,
      projectId,
    });
  },

  // Novels
  async getNovels(projectId: number): Promise<Novel[]> {
    const response = await http.post<ApiResponse<Novel[]>>('/novel/getNovel', { projectId });
    return response.data.data;
  },

  async getNovel(id: number): Promise<Novel> {
    throw new Error(`当前后端不支持按 ID(${id}) 单独查询原文，请先按项目查询原文`);
  },

  async createNovel(data: CreateNovelRequest): Promise<Novel> {
    const payload = {
      projectId: data.projectId,
      data: [
        {
          index: (data as { index?: number }).index ?? 1,
          reel: data.reel ?? '',
          chapter: data.chapter ?? '',
          chapterData: data.chapterData ?? '',
        },
      ],
    };

    await http.post('/novel/addNovel', payload);
    const latest = await scriptService.getNovels(data.projectId ?? 0);
    return latest[latest.length - 1] ?? (payload.data[0] as Novel);
  },

  async updateNovel(id: number, data: UpdateNovelRequest): Promise<Novel> {
    const payload = {
      id,
      index: (data as { index?: number | string }).index ?? 1,
      reel: data.reel ?? '',
      chapter: data.chapter ?? '',
      chapterData: data.chapterData ?? '',
    };

    await http.post('/novel/updateNovel', payload);
    return payload as Novel;
  },

  async deleteNovel(id: number): Promise<void> {
    await http.post('/novel/delNovel', { id });
  },

  // Storylines
  async getStorylines(projectId: number): Promise<Storyline[]> {
    const response = await http.post<ApiResponse<Storyline | null>>('/outline/getStoryline', { projectId });
    const storyline = response.data.data;
    return storyline ? [storyline] : [];
  },

  async getStoryline(id: number): Promise<Storyline> {
    throw new Error(`当前后端不支持按 ID(${id}) 单独查询故事线，请先按项目查询故事线`);
  },

  async createStoryline(data: CreateStorylineRequest): Promise<Storyline> {
    const payload = {
      projectId: data.projectId,
      content: data.content ?? '',
    };

    await http.post('/outline/updateStoryline', payload);
    const latest = await scriptService.getStorylines(data.projectId ?? 0);
    return latest[0] ?? (payload as Storyline);
  },

  async updateStoryline(id: number, data: UpdateStorylineRequest): Promise<Storyline> {
    const projectId = (data as UpdateStorylineRequest & { projectId?: number }).projectId;
    if (!projectId) {
      throw new Error(`更新故事线缺少 projectId（storylineId=${id}）`);
    }

    const payload = {
      projectId,
      content: data.content ?? '',
    };

    await http.post('/outline/updateStoryline', payload);
    return {
      id,
      ...payload,
    } as Storyline;
  },

  async deleteStoryline(id: number): Promise<void> {
    throw new Error(`当前后端不支持按 ID(${id}) 删除故事线，请改用 updateStoryline 清空内容`);
  },
};
