import { describe, it, expect, vi } from 'vitest';
import getConfig from '@/utils/getConfig';
import u from '@/utils';

vi.mock('@/utils', () => ({
  default: {
    db: vi.fn(),
  },
}));

describe('getConfig', () => {
  it('应该正确获取文本模型配置', async () => {
    const mockConfig = {
      model: 'gpt-4',
      apiKey: 'test-key',
      manufacturer: 'openAi',
      baseUrl: 'https://api.openai.com',
    };

    (u.db as any).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      modify: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(mockConfig),
    });

    const result = await getConfig('text');

    expect(result).toEqual({
      model: 'gpt-4',
      apiKey: 'test-key',
      manufacturer: 'openAi',
      baseURL: 'https://api.openai.com',
    });
  });

  it('应该正确获取图像模型配置', async () => {
    const mockConfig = {
      model: 'dall-e-3',
      apiKey: 'test-key',
      manufacturer: 'gemini',
      baseUrl: 'https://api.gemini.com',
    };

    (u.db as any).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      modify: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(mockConfig),
    });

    const result = await getConfig('image');

    expect(result).toEqual({
      model: 'dall-e-3',
      apiKey: 'test-key',
      manufacturer: 'gemini',
      baseURL: 'https://api.gemini.com',
    });
  });

  it('应该在配置不存在时抛出错误', async () => {
    (u.db as any).mockReturnValue({
      where: vi.fn().mockReturnThis(),
      modify: vi.fn().mockReturnThis(),
      first: vi.fn().mockResolvedValue(null),
    });

    await expect(getConfig('text')).rejects.toThrow('文本模型配置不存在');
  });

  it('应该支持按厂商筛选配置', async () => {
    const mockConfig = {
      model: 'deepseek-chat',
      apiKey: 'test-key',
      manufacturer: 'deepseek',
      baseUrl: 'https://api.deepseek.com',
    };

    let mockDb: {
      where: ReturnType<typeof vi.fn>;
      modify: ReturnType<typeof vi.fn>;
      first: ReturnType<typeof vi.fn>;
    };

    mockDb = {
      where: vi.fn().mockReturnThis(),
      modify: vi.fn((callback: (qb: { where: ReturnType<typeof vi.fn> }) => void) => {
        const qb = { where: vi.fn() };
        callback(qb);
        expect(qb.where).toHaveBeenCalledWith('manufacturer', 'deepseek');
        return mockDb;
      }),
      first: vi.fn().mockResolvedValue(mockConfig),
    };

    (u.db as any).mockReturnValue(mockDb);

    const result = await getConfig('text', 'deepseek');

    expect(result.manufacturer).toBe('deepseek');
  });
});
