import { describe, it, expect } from 'vitest';
import { AppError } from '@/types/AppError';
import { ErrorCode } from '@/types/monitoring';

describe('AppError', () => {
  describe('构造函数', () => {
    it('应该创建基本的 AppError 实例', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, '请求参数错误');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(ErrorCode.BAD_REQUEST);
      expect(error.message).toBe('请求参数错误');
      expect(error.isOperational).toBe(true);
      expect(error.details).toBeUndefined();
    });

    it('应该创建带详细信息的 AppError', () => {
      const details = ['字段 email 无效', '字段 password 必填'];
      const error = new AppError(
        ErrorCode.VALIDATION_ERROR,
        '验证失败',
        details
      );

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('验证失败');
      expect(error.details).toEqual(details);
      expect(error.isOperational).toBe(true);
    });

    it('应该支持自定义 isOperational 标志', () => {
      const error = new AppError(
        ErrorCode.INTERNAL_ERROR,
        '系统错误',
        undefined,
        false
      );

      expect(error.isOperational).toBe(false);
    });

    it('应该捕获堆栈跟踪', () => {
      const error = new AppError(ErrorCode.NOT_FOUND, '资源未找到');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('错误代码', () => {
    it('应该支持客户端错误代码', () => {
      const errors = [
        new AppError(ErrorCode.BAD_REQUEST, '错误请求'),
        new AppError(ErrorCode.UNAUTHORIZED, '未授权'),
        new AppError(ErrorCode.FORBIDDEN, '禁止访问'),
        new AppError(ErrorCode.NOT_FOUND, '未找到'),
        new AppError(ErrorCode.VALIDATION_ERROR, '验证错误'),
      ];

      expect(errors[0].code).toBe(400);
      expect(errors[1].code).toBe(401);
      expect(errors[2].code).toBe(403);
      expect(errors[3].code).toBe(404);
      expect(errors[4].code).toBe(422);
    });

    it('应该支持服务端错误代码', () => {
      const errors = [
        new AppError(ErrorCode.INTERNAL_ERROR, '内部错误'),
        new AppError(ErrorCode.DATABASE_ERROR, '数据库错误'),
        new AppError(ErrorCode.AI_SERVICE_ERROR, 'AI 服务错误'),
        new AppError(ErrorCode.EXTERNAL_API_ERROR, '外部 API 错误'),
      ];

      expect(errors[0].code).toBe(500);
      expect(errors[1].code).toBe(501);
      expect(errors[2].code).toBe(502);
      expect(errors[3].code).toBe(503);
    });
  });

  describe('错误继承', () => {
    it('应该正确继承 Error 类', () => {
      const error = new AppError(ErrorCode.BAD_REQUEST, '测试错误');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
      expect(error.name).toBe('Error');
    });

    it('应该可以被 try-catch 捕获', () => {
      expect(() => {
        throw new AppError(ErrorCode.BAD_REQUEST, '测试错误');
      }).toThrow(AppError);

      expect(() => {
        throw new AppError(ErrorCode.BAD_REQUEST, '测试错误');
      }).toThrow('测试错误');
    });

    it('应该可以使用 instanceof 检查', () => {
      const error = new AppError(ErrorCode.NOT_FOUND, '未找到');
      const normalError = new Error('普通错误');

      expect(error instanceof AppError).toBe(true);
      expect(normalError instanceof AppError).toBe(false);
    });
  });

  describe('实际使用场景', () => {
    it('应该用于验证错误', () => {
      const error = new AppError(
        ErrorCode.VALIDATION_ERROR,
        '表单验证失败',
        ['用户名不能为空', '密码长度至少 6 位']
      );

      expect(error.code).toBe(422);
      expect(error.message).toBe('表单验证失败');
      expect(error.details).toHaveLength(2);
      expect(error.isOperational).toBe(true);
    });

    it('应该用于资源未找到错误', () => {
      const error = new AppError(
        ErrorCode.NOT_FOUND,
        '用户不存在',
        ['用户 ID: 123']
      );

      expect(error.code).toBe(404);
      expect(error.message).toBe('用户不存在');
    });

    it('应该用于权限错误', () => {
      const error = new AppError(
        ErrorCode.FORBIDDEN,
        '无权访问此资源'
      );

      expect(error.code).toBe(403);
      expect(error.isOperational).toBe(true);
    });

    it('应该用于数据库错误', () => {
      const error = new AppError(
        ErrorCode.DATABASE_ERROR,
        '数据库连接失败',
        ['连接超时'],
        false
      );

      expect(error.code).toBe(501);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('错误信息格式化', () => {
    it('应该支持 JSON 序列化', () => {
      const error = new AppError(
        ErrorCode.BAD_REQUEST,
        '请求错误',
        ['参数无效']
      );

      const json = JSON.stringify({
        code: error.code,
        message: error.message,
        details: error.details,
        isOperational: error.isOperational,
      });

      expect(json).toContain('400');
      expect(json).toContain('请求错误');
      expect(json).toContain('参数无效');
    });
  });
});
