import { describe, it, expect, vi, beforeEach } from 'vitest';
import Storyboard from '@/agents/storyboard/index';
import u from '@/utils';

vi.mock('@/utils', () => ({
  default: {
    db: vi.fn(),
    uuid: vi.fn(() => 'test-uuid'),
    oss: {
      writeFile: vi.fn(),
      getFileUrl: vi.fn((path) => `https://oss.example.com/${path}`),
    },
    ai: {
      text: {
        stream: vi.fn(),
      },
    },
    getPromptAi: vi.fn(),
  },
}));

describe('Storyboard Agent', () => {
  let storyboard: Storyboard;
  const projectId = 1;
  const scriptId = 1;

  beforeEach(() => {
    storyboard = new Storyboard(projectId, scriptId);
    vi.clearAllMocks();
  });

  describe('初始化', () => {
    it('应该正确初始化 Storyboard 实例', () => {
      expect(storyboard).toBeDefined();
      expect(storyboard.emitter).toBeDefined();
      expect(storyboard.history).toEqual([]);
    });

    it('应该有正确的 projectId 和 scriptId', () => {
      expect((storyboard as any).projectId).toBe(projectId);
      expect((storyboard as any).scriptId).toBe(scriptId);
    });
  });

  describe('事件系统', () => {
    it('应该能够触发和监听事件', async () => {
      const testData = { test: 'data' };

      const eventPromise = new Promise((resolve) => {
        storyboard.emitter.once('testEvent', resolve);
      });

      (storyboard as any).emit('testEvent', testData);

      const receivedData = await eventPromise;
      expect(receivedData).toEqual(testData);
    });

    it('应该在更新片段时触发 segmentsUpdated 事件', async () => {
      const segments = [
        { index: 1, description: '测试片段1' },
        { index: 2, description: '测试片段2' },
      ];

      const eventPromise = new Promise((resolve) => {
        storyboard.emitter.on('segmentsUpdated', resolve);
      });

      await (storyboard as any).updateSegments.execute({ segments });

      const emittedData = await eventPromise;
      expect(emittedData).toEqual(segments);
    });
  });

  describe('片段管理', () => {
    it('应该能够更新片段数据', async () => {
      const segments = [
        { index: 1, description: '片段1', emotion: '紧张', action: '奔跑' },
        { index: 2, description: '片段2', emotion: '平静', action: '对话' },
      ];

      const result = await (storyboard as any).updateSegments.execute({ segments });

      expect(result).toContain('成功存储 2 个片段');
      expect(storyboard.getSegmentsData()).toEqual(segments);
    });

    it('应该能够获取片段数据', async () => {
      const segments = [{ index: 1, description: '测试片段' }];
      await (storyboard as any).updateSegments.execute({ segments });

      const result = await (storyboard as any).getSegments.execute({});

      expect(result).toContain('测试片段');
    });

    it('应该在没有片段时返回提示信息', async () => {
      const result = await (storyboard as any).getSegments.execute({});

      expect(result).toContain('暂无片段数据');
    });
  });

  describe('分镜管理', () => {
    beforeEach(async () => {
      // 先添加片段数据
      const segments = [
        { index: 1, description: '片段1' },
        { index: 2, description: '片段2' },
      ];
      await (storyboard as any).updateSegments.execute({ segments });
    });

    it('应该能够添加分镜', async () => {
      const shots = [
        {
          segmentIndex: 1,
          prompts: ['镜头1提示词', '镜头2提示词'],
          assetsTags: [
            { type: 'role' as const, text: '主角' },
            { type: 'scene' as const, text: '教室' },
          ],
        },
      ];

      const result = await (storyboard as any).addShots.execute({ shots });

      expect(result).toContain('已添加');
      expect(storyboard.getShotsData()).toHaveLength(1);
    });

    it('应该跳过已存在的分镜', async () => {
      const shots = [
        {
          segmentIndex: 1,
          prompts: ['镜头1'],
          assetsTags: [],
        },
      ];

      await (storyboard as any).addShots.execute({ shots });
      const result = await (storyboard as any).addShots.execute({ shots });

      expect(result).toContain('已存在分镜被跳过');
      expect(storyboard.getShotsData()).toHaveLength(1);
    });

    it('应该能够更新分镜', async () => {
      const shots = [
        {
          segmentIndex: 1,
          prompts: ['原始提示词'],
          assetsTags: [],
        },
      ];

      await (storyboard as any).addShots.execute({ shots });
      const shotId = storyboard.getShotsData()[0].id;

      const result = await (storyboard as any).updateShots.execute({
        shotId,
        prompts: ['更新后的提示词'],
      });

      expect(result).toContain('已更新分镜');
      expect(storyboard.getShotsData()[0].cells[0].prompt).toBe('更新后的提示词');
    });

    it('应该能够删除分镜', async () => {
      const shots = [
        {
          segmentIndex: 1,
          prompts: ['镜头1'],
          assetsTags: [],
        },
      ];

      await (storyboard as any).addShots.execute({ shots });
      const shotId = storyboard.getShotsData()[0].id;

      const result = await (storyboard as any).deleteShots.execute({ shotIds: [shotId] });

      expect(result).toContain('已删除分镜');
      expect(storyboard.getShotsData()).toHaveLength(0);
    });

    it('应该在删除不存在的分镜时返回提示', async () => {
      const result = await (storyboard as any).deleteShots.execute({ shotIds: [999] });

      expect(result).toContain('不存在');
    });
  });

  describe('数据访问器', () => {
    it('应该能够获取片段数据', async () => {
      const segments = [{ index: 1, description: '测试' }];
      await (storyboard as any).updateSegments.execute({ segments });

      const data = storyboard.getSegmentsData();

      expect(data).toEqual(segments);
    });

    it('应该能够获取分镜数据', async () => {
      const segments = [{ index: 1, description: '片段1' }];
      await (storyboard as any).updateSegments.execute({ segments });

      const shots = [
        {
          segmentIndex: 1,
          prompts: ['镜头1'],
          assetsTags: [],
        },
      ];
      await (storyboard as any).addShots.execute({ shots });

      const data = storyboard.getShotsData();

      expect(data).toHaveLength(1);
      expect(data[0].segmentId).toBe(1);
    });
  });
});
