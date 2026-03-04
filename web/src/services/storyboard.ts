import { http } from './http';
import type {
  ApiResponse,
  Image,
  CreateImageRequest,
  UpdateImageRequest,
} from './types';

export const storyboardService = {
  async getImages(projectId: number): Promise<Image[]> {
    const response = await http.post<ApiResponse<Image[]>>('/assets/getAssets', {
      projectId,
      type: '分镜',
    });
    return response.data.data;
  },

  async getImagesByScript(scriptId: number, projectId?: number): Promise<Image[]> {
    if (!projectId) {
      throw new Error(`按脚本查询分镜需要 projectId（scriptId=${scriptId}）`);
    }

    const response = await http.post<ApiResponse<Image[]>>('/storyboard/getStoryboard', {
      scriptId,
      projectId,
    });
    return response.data.data;
  },

  async getImage(id: number): Promise<Image> {
    throw new Error(`当前后端不支持按 ID(${id}) 单独查询分镜`);
  },

  async createImage(data: CreateImageRequest): Promise<Image> {
    const payloadData = data as CreateImageRequest & {
      name?: string;
      intro?: string;
      prompt?: string;
      remark?: string;
      episode?: string;
    };

    await http.post('/assets/addAssets', {
      projectId: payloadData.projectId,
      scriptId: payloadData.scriptId ?? null,
      name: payloadData.name ?? '新分镜',
      intro: payloadData.intro ?? '',
      type: payloadData.type ?? '分镜',
      prompt: payloadData.prompt ?? '',
      remark: payloadData.remark ?? null,
      episode: payloadData.episode ?? null,
    });

    return data as Image;
  },

  async updateImage(id: number, data: UpdateImageRequest): Promise<Image> {
    const payloadData = data as UpdateImageRequest & {
      name?: string;
      intro?: string;
      prompt?: string;
      videoPrompt?: string;
      remark?: string;
      duration?: number | string;
    };

    const payload = {
      id,
      name: payloadData.name ?? '分镜',
      intro: payloadData.intro ?? '',
      type: payloadData.type ?? '分镜',
      prompt: payloadData.prompt ?? '',
      videoPrompt: payloadData.videoPrompt ?? null,
      remark: payloadData.remark ?? null,
      duration: Number(payloadData.duration ?? 3),
    };

    await http.post('/assets/updateAssets', payload);
    return payload as Image;
  },

  async deleteImage(id: number): Promise<void> {
    await http.post('/storyboard/delStoryboard', { id });
  },

  async generateStoryboard(scriptId: number, config?: Record<string, unknown>): Promise<Image[]> {
    const response = await http.post<ApiResponse<Image[]>>('/storyboard/generateStoryboardApi', {
      scriptId,
      ...(config ?? {}),
    });
    return response.data.data;
  },
};
