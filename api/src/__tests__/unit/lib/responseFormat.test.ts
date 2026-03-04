import { describe, it, expect } from 'vitest';
import { success, error, ApiResponse } from '@/lib/responseFormat';

describe('Response Format', () => {
  describe('success', () => {
    it('应该返回成功响应，使用默认值', () => {
      const response = success();

      expect(response).toEqual({
        code: 200,
        data: null,
        message: '成功',
      });
    });

    it('应该返回成功响应，带数据', () => {
      const data = { id: 1, name: 'test' };
      const response = success(data);

      expect(response).toEqual({
        code: 200,
        data,
        message: '成功',
      });
    });

    it('应该返回成功响应，带自定义消息', () => {
      const response = success(null, '操作成功');

      expect(response).toEqual({
        code: 200,
        data: null,
        message: '操作成功',
      });
    });

    it('应该返回成功响应，带数据和自定义消息', () => {
      const data = { userId: 123 };
      const response = success(data, '用户创建成功');

      expect(response).toEqual({
        code: 200,
        data,
        message: '用户创建成功',
      });
    });

    it('应该处理不同类型的数据', () => {
      expect(success('string')).toEqual({
        code: 200,
        data: 'string',
        message: '成功',
      });

      expect(success(123)).toEqual({
        code: 200,
        data: 123,
        message: '成功',
      });

      expect(success([1, 2, 3])).toEqual({
        code: 200,
        data: [1, 2, 3],
        message: '成功',
      });

      expect(success(true)).toEqual({
        code: 200,
        data: true,
        message: '成功',
      });
    });
  });

  describe('error', () => {
    it('应该返回错误响应，使用默认值', () => {
      const response = error();

      expect(response).toEqual({
        code: 400,
        data: null,
        message: '',
      });
    });

    it('应该返回错误响应，带消息', () => {
      const response = error('用户不存在');

      expect(response).toEqual({
        code: 400,
        data: null,
        message: '用户不存在',
      });
    });

    it('应该返回错误响应，带数据', () => {
      const data = { field: 'email', error: 'invalid' };
      const response = error('验证失败', data);

      expect(response).toEqual({
        code: 400,
        data,
        message: '验证失败',
      });
    });

    it('应该处理不同类型的错误数据', () => {
      expect(error('错误', 'error-string')).toEqual({
        code: 400,
        data: 'error-string',
        message: '错误',
      });

      expect(error('错误', 404)).toEqual({
        code: 400,
        data: 404,
        message: '错误',
      });

      expect(error('错误', ['error1', 'error2'])).toEqual({
        code: 400,
        data: ['error1', 'error2'],
        message: '错误',
      });
    });
  });

  describe('ApiResponse 类型', () => {
    it('应该正确推断泛型类型', () => {
      interface User {
        id: number;
        name: string;
      }

      const userResponse: ApiResponse<User | null> = success({ id: 1, name: 'test' });
      expect(userResponse.data).toEqual({ id: 1, name: 'test' });

      const errorResponse: ApiResponse<null> = error('错误');
      expect(errorResponse.data).toBeNull();
    });
  });
});
