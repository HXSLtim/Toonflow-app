import { http } from './http';
import type {
  ApiResponse,
  Config,
  CreateConfigRequest,
  UpdateConfigRequest,
} from './types';

type ModelType = 'text' | 'image' | 'video';

interface AiModelListItem {
  label: string;
  value: string;
}

interface AiModelMapItem {
  id: number;
  key: string;
  name: string;
  manufacturer: string;
  model: string;
}

const ensureModelType = (type?: string | null): ModelType => {
  if (type === 'image' || type === 'video') {
    return type;
  }
  return 'text';
};

export const configService = {
  async getConfigs(_userId?: number): Promise<Config[]> {
    void _userId;
    const response = await http.post<ApiResponse<Config[]>>('/setting/getSetting', {});
    return response.data.data;
  },

  async getConfig(id: number): Promise<Config> {
    const list = await configService.getConfigs();
    const target = list.find((item) => item.id === id);

    if (!target) {
      throw new Error(`未找到模型配置（ID: ${id}）`);
    }

    return target;
  },

  async createConfig(data: CreateConfigRequest): Promise<Config> {
    const payload = {
      type: ensureModelType(data.type ?? null),
      model: data.model ?? '',
      baseUrl: data.baseUrl ?? '',
      apiKey: data.apiKey ?? '',
      modelType: data.modelType ?? 'chat',
      manufacturer: data.manufacturer ?? 'custom',
    };

    await http.post('/setting/addModel', payload);

    const list = await configService.getConfigs();
    const candidates = list.filter(
      (item) => item.model === payload.model && item.baseUrl === payload.baseUrl && item.manufacturer === payload.manufacturer
    );

    return (
      [...candidates].sort((left, right) => (right.createTime ?? 0) - (left.createTime ?? 0))[0] ??
      {
        ...payload,
      }
    );
  },

  async updateConfig(id: number, data: UpdateConfigRequest): Promise<Config> {
    const existing = await configService.getConfig(id);
    const payload = {
      id,
      type: ensureModelType(data.type ?? existing.type ?? null),
      model: data.model ?? existing.model ?? '',
      baseUrl: data.baseUrl ?? existing.baseUrl ?? '',
      apiKey: data.apiKey ?? existing.apiKey ?? '',
      modelType: data.modelType ?? existing.modelType ?? 'chat',
      manufacturer: data.manufacturer ?? existing.manufacturer ?? 'custom',
    };

    await http.post('/setting/updateModel', payload);
    return configService.getConfig(id);
  },

  async deleteConfig(id: number): Promise<void> {
    await http.post('/setting/delModel', { id });
  },

  async testConfig(id: number): Promise<{ success: boolean; message?: string }> {
    void id;
    return {
      success: false,
      message: '当前后端暂未提供模型测试接口',
    };
  },

  async getAiModelList(type: ModelType): Promise<Record<string, AiModelListItem[]>> {
    const response = await http.post<ApiResponse<Record<string, AiModelListItem[]>>>('/setting/getAiModelList', {
      type,
    });
    return response.data.data;
  },

  async getAiModelMap(): Promise<AiModelMapItem[]> {
    const response = await http.post<ApiResponse<AiModelMapItem[]>>('/setting/getAiModelMap', {});
    return response.data.data;
  },
};
