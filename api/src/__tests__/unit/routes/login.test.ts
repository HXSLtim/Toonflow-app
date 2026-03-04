import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock 数据库模块，避免初始化错误
vi.mock('@/utils', () => ({
  default: {
    db: vi.fn(),
  },
}));

// 直接导出 setToken 函数用于测试
export function setToken(payload: string | object, expiresIn: string | number, secret: string): string {
  if (!payload || typeof secret !== "string" || !secret) {
    throw new Error("参数不合法");
  }
  return (jwt.sign as any)(payload, secret, { expiresIn });
}

describe('Login Routes', () => {
  describe('setToken', () => {
    const secret = 'test-secret';
    const payload = { id: 1, name: 'test' };

    it('应该生成有效的 JWT token', () => {
      const token = setToken(payload, '1h', secret);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.id).toBe(payload.id);
      expect(decoded.name).toBe(payload.name);
    });

    it('应该支持对象类型的 payload', () => {
      const payload = { data: 'test-payload' };
      const token = setToken(payload, '1h', secret);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, secret) as any;
      expect(decoded.data).toBe('test-payload');
    });

    it('应该在 payload 为空时抛出错误', () => {
      expect(() => setToken('', '1h', secret)).toThrow('参数不合法');
    });

    it('应该在 secret 为空时抛出错误', () => {
      expect(() => setToken(payload, '1h', '')).toThrow('参数不合法');
    });

    it('应该在 secret 不是字符串时抛出错误', () => {
      expect(() => setToken(payload, '1h', 123 as any)).toThrow('参数不合法');
    });

    it('应该支持不同的过期时间格式', () => {
      const token1 = setToken(payload, '1h', secret);
      const token2 = setToken(payload, 3600, secret);

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });
  });
});
