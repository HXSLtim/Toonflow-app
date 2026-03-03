import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  batchExecute,
  batchExecuteAllSettled,
  retry,
  withTimeout,
} from '@/utils/concurrency';

describe('Concurrency Utils', () => {
  describe('batchExecute', () => {
    it('应该批量执行任务', async () => {
      const tasks = [1, 2, 3, 4, 5];
      const executor = vi.fn(async (task: number) => task * 2);

      const results = await batchExecute(tasks, executor);

      expect(results).toEqual([2, 4, 6, 8, 10]);
      expect(executor).toHaveBeenCalledTimes(5);
    });

    it('应该限制并发数量', async () => {
      const tasks = [1, 2, 3, 4, 5];
      let concurrent = 0;
      let maxConcurrent = 0;

      const executor = async (task: number) => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise(resolve => setTimeout(resolve, 50));
        concurrent--;
        return task * 2;
      };

      await batchExecute(tasks, executor, { concurrency: 2 });

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });

    it('应该调用进度回调', async () => {
      const tasks = [1, 2, 3];
      const onProgress = vi.fn();

      await batchExecute(tasks, async (task) => task * 2, { onProgress });

      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenCalledWith(1, 3);
      expect(onProgress).toHaveBeenCalledWith(2, 3);
      expect(onProgress).toHaveBeenCalledWith(3, 3);
    });

    it('应该在任务失败时调用错误回调', async () => {
      const tasks = [1, 2, 3];
      const onError = vi.fn();
      const executor = async (task: number) => {
        if (task === 2) throw new Error('Task 2 failed');
        return task * 2;
      };

      await expect(
        batchExecute(tasks, executor, { onError })
      ).rejects.toThrow('Task 2 failed');

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        2,
        1
      );
    });

    it('应该处理空任务数组', async () => {
      const results = await batchExecute([], async (task) => task);
      expect(results).toEqual([]);
    });
  });

  describe('batchExecuteAllSettled', () => {
    it('应该执行所有任务，即使部分失败', async () => {
      const tasks = [1, 2, 3, 4];
      const executor = async (task: number) => {
        if (task === 2) throw new Error('Task 2 failed');
        return task * 2;
      };

      const results = await batchExecuteAllSettled(tasks, executor);

      expect(results).toHaveLength(4);
      expect(results[0]).toEqual({ status: 'fulfilled', value: 2 });
      expect(results[1]).toEqual({ status: 'rejected', reason: expect.any(Error) });
      expect(results[2]).toEqual({ status: 'fulfilled', value: 6 });
      expect(results[3]).toEqual({ status: 'fulfilled', value: 8 });
    });

    it('应该调用进度回调', async () => {
      const tasks = [1, 2, 3];
      const onProgress = vi.fn();

      await batchExecuteAllSettled(tasks, async (task) => task * 2, { onProgress });

      expect(onProgress).toHaveBeenCalledTimes(3);
    });

    it('应该限制并发数量', async () => {
      const tasks = [1, 2, 3, 4, 5];
      let concurrent = 0;
      let maxConcurrent = 0;

      const executor = async (task: number) => {
        concurrent++;
        maxConcurrent = Math.max(maxConcurrent, concurrent);
        await new Promise(resolve => setTimeout(resolve, 50));
        concurrent--;
        return task * 2;
      };

      await batchExecuteAllSettled(tasks, executor, { concurrency: 2 });

      expect(maxConcurrent).toBeLessThanOrEqual(2);
    });
  });

  describe('retry', () => {
    it('应该在第一次成功时不重试', async () => {
      const fn = vi.fn(async () => 'success');

      const result = await retry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('应该在失败后重试', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Failed');
        return 'success';
      });

      const result = await retry(fn, { maxRetries: 3, delay: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('应该在达到最大重试次数后抛出错误', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Always fails');
      });

      await expect(
        retry(fn, { maxRetries: 2, delay: 10 })
      ).rejects.toThrow('Always fails');

      expect(fn).toHaveBeenCalledTimes(3); // 初始 + 2次重试
    });

    it('应该调用重试回调', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 2) throw new Error('Failed');
        return 'success';
      };
      const onRetry = vi.fn();

      await retry(fn, { maxRetries: 2, delay: 10, onRetry });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1);
    });

    it('应该使用指数退避', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Failed');
      });

      const startTime = Date.now();
      await expect(
        retry(fn, { maxRetries: 2, delay: 100, backoff: 2 })
      ).rejects.toThrow();
      const duration = Date.now() - startTime;

      // 第一次重试: 100ms, 第二次重试: 200ms, 总共至少 300ms
      expect(duration).toBeGreaterThanOrEqual(250);
    });
  });

  describe('withTimeout', () => {
    it('应该在超时前返回结果', async () => {
      const promise = new Promise<string>(resolve => {
        setTimeout(() => resolve('success'), 50);
      });

      const result = await withTimeout(promise, 200);
      expect(result).toBe('success');
    });

    it('应该在超时后抛出错误', async () => {
      const promise = new Promise<string>(resolve => {
        setTimeout(() => resolve('success'), 200);
      });

      await expect(
        withTimeout(promise, 50)
      ).rejects.toThrow('操作超时 (50ms)');
    });

    it('应该处理立即完成的 Promise', async () => {
      const promise = Promise.resolve('immediate');

      const result = await withTimeout(promise, 100);
      expect(result).toBe('immediate');
    });

    it('应该处理立即失败的 Promise', async () => {
      const promise = Promise.reject(new Error('immediate error'));

      await expect(
        withTimeout(promise, 100)
      ).rejects.toThrow('immediate error');
    });
  });
});
