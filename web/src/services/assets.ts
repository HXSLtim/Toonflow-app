import { http } from './http';
import type {
  ApiResponse,
  Asset,
  CreateAssetRequest,
  UpdateAssetRequest,
} from './types';

type AssetType = '角色' | '场景' | '道具' | '分镜';

const toDataUrl = async (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('读取文件内容失败'));
      }
    };
    reader.onerror = () => reject(new Error('读取文件内容失败'));
    reader.readAsDataURL(file);
  });

export const assetsService = {
  async getAssets(projectId: number, type: AssetType = '角色'): Promise<Asset[]> {
    const response = await http.post<ApiResponse<Asset[]>>('/assets/getAssets', {
      projectId,
      type,
    });
    return response.data.data;
  },

  async getAssetsByScript(scriptId: number, projectId?: number): Promise<Asset[]> {
    if (!projectId) {
      throw new Error(`按脚本查询资产需要 projectId（scriptId=${scriptId}）`);
    }

    const assetTypes: AssetType[] = ['角色', '场景', '道具', '分镜'];
    const lists = await Promise.all(assetTypes.map((type) => assetsService.getAssets(projectId, type)));

    return lists
      .flat()
      .filter((item) => (item.scriptId ?? null) === scriptId);
  },

  async getAsset(id: number): Promise<Asset> {
    const response = await http.post<ApiResponse<{ id: number; filePath: string; scriptId: number; state: string }>>(
      '/assets/getImage',
      { assetsId: id }
    );

    const item = response.data.data;
    return {
      id: item.id,
      filePath: item.filePath,
      scriptId: item.scriptId,
      state: item.state,
      type: '分镜',
    };
  },

  async createAsset(data: CreateAssetRequest): Promise<Asset> {
    const payload = data as CreateAssetRequest & {
      name?: string;
      intro?: string;
      prompt?: string;
      remark?: string;
      episode?: string;
    };

    await http.post('/assets/addAssets', {
      projectId: payload.projectId,
      scriptId: payload.scriptId ?? null,
      name: payload.name ?? '新资产',
      intro: payload.intro ?? '',
      type: payload.type ?? '角色',
      prompt: payload.prompt ?? '',
      remark: payload.remark ?? null,
      episode: payload.episode ?? null,
    });

    return payload as Asset;
  },

  async updateAsset(id: number, data: UpdateAssetRequest): Promise<Asset> {
    const payload = data as UpdateAssetRequest & {
      name?: string;
      intro?: string;
      prompt?: string;
      videoPrompt?: string;
      remark?: string;
      duration?: number | string;
      type?: string;
    };

    const requestBody = {
      id,
      name: payload.name ?? '资产',
      intro: payload.intro ?? '',
      type: payload.type ?? '角色',
      prompt: payload.prompt ?? '',
      videoPrompt: payload.videoPrompt ?? null,
      remark: payload.remark ?? null,
      duration: String(payload.duration ?? 3),
    };

    await http.post('/assets/updateAssets', requestBody);
    return requestBody as Asset;
  },

  async deleteAsset(id: number): Promise<void> {
    await http.post('/assets/delAssets', { id });
  },

  async uploadAsset(projectId: number, file: File, metadata?: Partial<Asset>): Promise<Asset> {
    const base64 = await toDataUrl(file);
    const assetId = metadata?.id;

    if (!assetId) {
      throw new Error('上传资产图片需要已存在的资产 ID');
    }

    await http.post('/assets/saveAssets', {
      id: assetId,
      projectId,
      base64,
      prompt: (metadata as { prompt?: string } | undefined)?.prompt ?? '',
    });

    return assetsService.getAsset(assetId);
  },

  async downloadAsset(id: number): Promise<Blob> {
    const asset = await assetsService.getAsset(id);
    if (!asset.filePath) {
      throw new Error(`资产（ID: ${id}）没有可下载文件`);
    }

    const response = await fetch(asset.filePath);
    if (!response.ok) {
      throw new Error('下载资产失败');
    }

    return response.blob();
  },
};
