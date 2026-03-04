import { http } from './http';
import { scriptService } from './script';
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
    const scripts = await scriptService.getScripts(projectId);
    const results = await Promise.all(
      scripts
        .filter((script) => typeof script.id === 'number')
        .map((script) => this.getVideosByScript(script.id as number))
    );

    return results.flat();
  },

  async getVideosByScript(scriptId: number): Promise<Video[]> {
    const response = await http.post<ApiResponse<Video[]>>('/video/getVideo', { scriptId });
    return response.data.data;
  },

  async getVideo(id: number): Promise<Video> {
    throw new Error(`当前后端不支持按 ID(${id}) 单独查询视频`);
  },

  async createVideo(data: CreateVideoRequest): Promise<Video> {
    const payloadData = data as CreateVideoRequest & {
      type?: string;
      filePath?: string[];
      duration?: number;
      prompt?: string;
      resolution?: string;
    };

    await http.post('/video/addVideo', {
      scriptId: payloadData.scriptId,
      type: payloadData.type ?? 'doubao',
      resolution: payloadData.resolution ?? '1080p',
      filePath: payloadData.filePath ?? [],
      duration: payloadData.duration ?? 5,
      prompt: payloadData.prompt ?? '',
    });

    return {
      scriptId: payloadData.scriptId,
      resolution: payloadData.resolution,
      prompt: payloadData.prompt,
      time: payloadData.duration,
    } as Video;
  },

  async updateVideo(id: number, data: UpdateVideoRequest): Promise<Video> {
    const payloadData = data as UpdateVideoRequest & {
      filePath?: string;
      storyboardImgs?: string[];
      model?: string;
      time?: number;
      resolution?: string;
      prompt?: string;
    };

    await http.post('/video/saveVideo', {
      id,
      filePath: payloadData.filePath ?? '',
      storyboardImgs: payloadData.storyboardImgs ?? [],
      prompt: payloadData.prompt ?? '',
      model: payloadData.model ?? '',
      time: payloadData.time ?? 5,
      resolution: payloadData.resolution ?? '1080p',
    });

    return {
      id,
      ...payloadData,
    } as Video;
  },

  async deleteVideo(id: number): Promise<void> {
    throw new Error(`当前后端不支持按 videoId(${id}) 直接删除视频`);
  },

  async generateVideo(scriptId: number, config: CreateVideoConfigRequest): Promise<Video> {
    const response = await http.post<ApiResponse<Video>>('/video/generateVideo', {
      scriptId,
      ...(config as Record<string, unknown>),
    });
    return response.data.data;
  },

  async getVideoStatus(id: number): Promise<{ state: number; progress?: number }> {
    const videos = await this.getVideosByScript(id);
    const current = videos.find((video) => video.id === id);
    return {
      state: current?.state ?? 0,
    };
  },

  // Video Configs
  async getVideoConfigs(projectId: number): Promise<VideoConfig[]> {
    const scripts = await scriptService.getScripts(projectId);
    const firstScriptId = scripts.find((script) => typeof script.id === 'number')?.id;

    if (!firstScriptId) {
      return [];
    }

    return this.getVideoConfigsByScript(firstScriptId as number);
  },

  async getVideoConfigsByScript(scriptId: number): Promise<VideoConfig[]> {
    const response = await http.post<ApiResponse<VideoConfig[]>>('/video/getVideoConfigs', {
      scriptId,
    });
    return response.data.data;
  },

  async getVideoConfig(id: number): Promise<VideoConfig> {
    throw new Error(`当前后端不支持按 ID(${id}) 单独查询视频配置`);
  },

  async createVideoConfig(data: CreateVideoConfigRequest): Promise<VideoConfig> {
    const payload = data as CreateVideoConfigRequest & {
      configId?: number;
      mode?: 'startEnd' | 'multi' | 'single' | 'text' | '';
      startFrame?: Record<string, unknown> | null;
      endFrame?: Record<string, unknown> | null;
      images?: Record<string, unknown>[];
      resolution?: string;
      duration?: number;
      prompt?: string;
      audioEnabled?: boolean;
    };

    const response = await http.post<ApiResponse<{ data: VideoConfig }>>('/video/addVideoConfig', {
      scriptId: payload.scriptId,
      projectId: payload.projectId,
      configId: payload.configId ?? payload.aiConfigId,
      mode: payload.mode ?? '',
      startFrame: payload.startFrame ?? null,
      endFrame: payload.endFrame ?? null,
      images: payload.images ?? [],
      resolution: payload.resolution ?? '1080p',
      duration: payload.duration ?? 5,
      prompt: payload.prompt ?? '',
      audioEnabled: payload.audioEnabled ?? false,
    });

    return response.data.data.data;
  },

  async updateVideoConfig(id: number, data: UpdateVideoConfigRequest): Promise<VideoConfig> {
    const payload = data as UpdateVideoConfigRequest & {
      selectedResultId?: number | null;
      startFrame?: Record<string, unknown> | null;
      endFrame?: Record<string, unknown> | null;
      images?: Record<string, unknown>[];
      resolution?: string;
      duration?: number;
      prompt?: string;
      audioEnabled?: boolean;
    };

    const response = await http.post<ApiResponse<{ data: VideoConfig }>>('/video/upDateVideoConfig', {
      id,
      resolution: payload.resolution,
      duration: payload.duration,
      prompt: payload.prompt,
      selectedResultId: payload.selectedResultId,
      startFrame: payload.startFrame,
      endFrame: payload.endFrame,
      images: payload.images,
      audioEnabled: payload.audioEnabled,
    });

    return response.data.data.data;
  },

  async deleteVideoConfig(id: number): Promise<void> {
    await http.post('/video/deleteVideoConfig', { id });
  },
};
