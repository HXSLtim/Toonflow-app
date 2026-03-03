import { describe, it, expect } from 'vitest';
import { normalizeError, NormalizedError } from '@/utils/error';
import { AxiosError } from 'axios';

describe('normalizeError', () => {
  it('应该正确处理标准 Error 对象', () => {
    const error = new Error('测试错误');
    const normalized = normalizeError(error);

    expect(normalized.name).toBe('Error');
    expect(normalized.message).toBe('测试错误');
    expect(normalized.stack).toBeDefined();
  });

  it('应该正确处理带有 cause 的 Error', () => {
    const cause = new Error('原因错误');
    const error = new Error('主错误', { cause });
    const normalized = normalizeError(error);

    expect(normalized.message).toBe('主错误');
    expect(normalized.cause).toBeDefined();
    expect(normalized.cause?.message).toBe('原因错误');
  });

  it('应该正确处理 AxiosError', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Network Error',
      code: 'ECONNREFUSED',
      config: {
        url: 'https://api.example.com',
        method: 'GET',
      },
      response: {
        status: 500,
        data: {
          error: {
            message: 'Internal Server Error',
          },
        },
      },
      stack: 'Error stack',
    } as any;

    const normalized = normalizeError(axiosError);

    expect(normalized.name).toBe('AxiosError');
    expect(normalized.message).toBe('Internal Server Error');
    expect(normalized.status).toBe(500);
    expect(normalized.code).toBe('ECONNREFUSED');
    expect(normalized.meta?.url).toBe('https://api.example.com');
    expect(normalized.meta?.method).toBe('GET');
  });

  it('应该正确处理非 Error 对象', () => {
    const normalized = normalizeError('字符串错误');

    expect(normalized.name).toBe('UnknownError');
    expect(normalized.message).toBe('字符串错误');
  });

  it('应该正确处理 null 和 undefined', () => {
    const normalizedNull = normalizeError(null);
    const normalizedUndefined = normalizeError(undefined);

    expect(normalizedNull.name).toBe('UnknownError');
    expect(normalizedUndefined.name).toBe('UnknownError');
  });

  it('应该提取自定义属性到 meta', () => {
    class CustomError extends Error {
      code = 'CUSTOM_CODE';
      userId = 123;
    }

    const error = new CustomError('自定义错误');
    const normalized = normalizeError(error);

    expect(normalized.meta).toBeDefined();
    expect(normalized.meta?.code).toBe('CUSTOM_CODE');
    expect(normalized.meta?.userId).toBe(123);
  });
});
