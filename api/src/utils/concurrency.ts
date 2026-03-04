import pLimit from "p-limit";

/**
 * 并发控制工具
 * 用于限制 AI 调用、文件处理等并发操作
 */

// 图片生成并发限制（同时最多 3 个）
export const imageGenerationLimit = pLimit(3);

// 视频生成并发限制（同时最多 2 个）
export const videoGenerationLimit = pLimit(2);

// 文件处理并发限制（同时最多 5 个）
export const fileProcessingLimit = pLimit(5);

// 数据库操作并发限制（同时最多 10 个）
export const dbOperationLimit = pLimit(10);

/**
 * 批量执行任务，带并发控制
 * @param tasks 任务数组
 * @param limit 并发限制
 * @param onProgress 进度回调
 */
export async function batchExecute<T, R>(
  tasks: T[],
  executor: (task: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
    onError?: (error: Error, task: T, index: number) => void;
  } = {}
): Promise<R[]> {
  const { concurrency = 3, onProgress, onError } = options;
  const limit = pLimit(concurrency);

  let completed = 0;
  const total = tasks.length;

  const promises = tasks.map((task, index) =>
    limit(async () => {
      try {
        const result = await executor(task, index);
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
        return result;
      } catch (error) {
        completed++;
        if (onError) {
          onError(error as Error, task, index);
        }
        if (onProgress) {
          onProgress(completed, total);
        }
        throw error;
      }
    })
  );

  return Promise.all(promises);
}

/**
 * 批量执行任务，允许部分失败
 * @param tasks 任务数组
 * @param executor 执行函数
 * @param options 选项
 */
export async function batchExecuteAllSettled<T, R>(
  tasks: T[],
  executor: (task: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<Array<{ status: "fulfilled"; value: R } | { status: "rejected"; reason: any }>> {
  const { concurrency = 3, onProgress } = options;
  const limit = pLimit(concurrency);

  let completed = 0;
  const total = tasks.length;

  const promises = tasks.map((task, index) =>
    limit(async () => {
      try {
        const result = await executor(task, index);
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
        return { status: "fulfilled" as const, value: result };
      } catch (error) {
        completed++;
        if (onProgress) {
          onProgress(completed, total);
        }
        return { status: "rejected" as const, reason: error };
      }
    })
  );

  return Promise.all(promises);
}

/**
 * 重试机制
 * @param fn 要执行的函数
 * @param options 重试选项
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = 2, onRetry } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt);

        if (onRetry) {
          onRetry(lastError, attempt + 1);
        }

        console.log(`重试 ${attempt + 1}/${maxRetries}，等待 ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError!;
}

/**
 * 超时控制
 * @param promise 要执行的 Promise
 * @param timeoutMs 超时时间（毫秒）
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`操作超时 (${timeoutMs}ms)`)), timeoutMs)),
  ]);
}
