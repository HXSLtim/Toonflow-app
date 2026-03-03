import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateFields } from '@/middleware/middleware';

describe('validateFields middleware', () => {
  let mockNext: NextFunction;
  let mockRes: Response;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNext = vi.fn() as NextFunction;
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
  });

  it('应该通过有效的 body 数据验证', () => {
    const middleware = validateFields({
      name: z.string(),
      age: z.number(),
    });

    const mockReq = {
      body: { name: '张三', age: 25 },
    } as Request;

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('应该拒绝无效的 body 数据', () => {
    const middleware = validateFields({
      name: z.string(),
      age: z.number(),
    });

    const mockReq = {
      body: { name: '张三', age: '不是数字' },
    } as Request;

    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    const jsonCall = (mockRes.json as any).mock.calls[0][0];
    expect(jsonCall.message).toBe('参数错误');
    expect(jsonCall.errors).toBeInstanceOf(Array);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('应该验证 query 参数', () => {
    const middleware = validateFields(
      {
        page: z.string(),
        limit: z.string(),
      },
      'query'
    );

    const mockReq = {
      query: { page: '1', limit: '10' },
    } as unknown as Request;

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('应该验证 params 参数', () => {
    const middleware = validateFields(
      {
        id: z.string(),
      },
      'params'
    );

    const mockReq = {
      params: { id: '123' },
    } as unknown as Request;

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('应该处理缺失的必填字段', () => {
    const middleware = validateFields({
      name: z.string(),
      email: z.string().email(),
    });

    const mockReq = {
      body: { name: '张三' },
    } as Request;

    middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalled();
    const jsonCall = (mockRes.json as any).mock.calls[0][0];
    expect(jsonCall.message).toBe('参数错误');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('应该处理复杂的验证规则', () => {
    const middleware = validateFields({
      username: z.string().min(3).max(20),
      password: z.string().min(6),
      age: z.number().min(18).max(100),
      email: z.string().email(),
    });

    const mockReq = {
      body: {
        username: 'user123',
        password: 'pass123',
        age: 25,
        email: 'user@example.com',
      },
    } as Request;

    middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
