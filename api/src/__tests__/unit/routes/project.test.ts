import { describe, it, expect, vi, beforeEach } from 'vitest';
import express, { Express } from 'express';
import request from 'supertest';
import getProjectRoute from '@/routes/project/getProject';
import addProjectRoute from '@/routes/project/addProject';
import u from '@/utils';

vi.mock('@/utils', () => ({
  default: {
    db: vi.fn(),
  },
}));

vi.mock('@/lib/responseFormat', () => ({
  success: (data: any) => ({ success: true, data }),
}));

describe('Project Routes', () => {
  let app: Express;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
  });

  describe('GET /project/getProject', () => {
    it('应该返回所有项目列表', async () => {
      const mockProjects = [
        {
          id: 1,
          name: '测试项目1',
          intro: '项目简介1',
          type: '短剧',
          artStyle: '写实',
          videoRatio: '16:9',
        },
        {
          id: 2,
          name: '测试项目2',
          intro: '项目简介2',
          type: '漫剧',
          artStyle: '动漫',
          videoRatio: '9:16',
        },
      ];

      (u.db as any).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockProjects),
      });

      app.use('/project/getProject', getProjectRoute);

      const response = await request(app)
        .post('/project/getProject')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockProjects);
      expect(u.db).toHaveBeenCalledWith('t_project');
    });

    it('应该处理空项目列表', async () => {
      (u.db as any).mockReturnValue({
        select: vi.fn().mockResolvedValue([]),
      });

      app.use('/project/getProject', getProjectRoute);

      const response = await request(app)
        .post('/project/getProject')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('应该处理数据库错误', async () => {
      (u.db as any).mockReturnValue({
        select: vi.fn().mockRejectedValue(new Error('Database error')),
      });

      app.use('/project/getProject', getProjectRoute);

      await request(app)
        .post('/project/getProject')
        .expect(500);
    });
  });

  describe('POST /project/addProject', () => {
    it('应该成功创建新项目', async () => {
      const newProject = {
        name: '新项目',
        intro: '项目简介',
        type: '短剧',
        artStyle: '写实',
        videoRatio: '16:9',
      };

      (u.db as any).mockReturnValue({
        insert: vi.fn().mockResolvedValue([1]),
      });

      app.use('/project/addProject', addProjectRoute);

      const response = await request(app)
        .post('/project/addProject')
        .send(newProject)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('新增项目成功');
      expect(u.db).toHaveBeenCalledWith('t_project');
    });

    it('应该验证必填字段', async () => {
      app.use('/project/addProject', addProjectRoute);

      const response = await request(app)
        .post('/project/addProject')
        .send({
          name: '测试项目',
          // 缺少其他必填字段
        })
        .expect(400);

      expect(response.body.message).toBe('参数错误');
      expect(response.body.errors).toBeDefined();
    });

    it('应该接受有效的空字符串（Zod 默认行为）', async () => {
      (u.db as any).mockReturnValue({
        insert: vi.fn().mockResolvedValue([1]),
      });

      app.use('/project/addProject', addProjectRoute);

      const response = await request(app)
        .post('/project/addProject')
        .send({
          name: '',
          intro: '',
          type: '',
          artStyle: '',
          videoRatio: '',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('应该处理数据库插入错误', async () => {
      (u.db as any).mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('Insert failed')),
      });

      app.use('/project/addProject', addProjectRoute);

      await request(app)
        .post('/project/addProject')
        .send({
          name: '测试项目',
          intro: '简介',
          type: '短剧',
          artStyle: '写实',
          videoRatio: '16:9',
        })
        .expect(500);
    });
  });
});
