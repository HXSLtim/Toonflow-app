/**
 * 性能监控工具
 */

interface ApiMetric {
  path: string;
  method: string;
  duration: number;
  timestamp: number;
  statusCode: number;
}

interface DbMetric {
  query: string;
  duration: number;
  timestamp: number;
}

interface AiMetric {
  type: "image" | "video" | "text";
  model: string;
  duration: number;
  success: boolean;
  timestamp: number;
}

class PerformanceMonitor {
  private apiMetrics: ApiMetric[] = [];
  private dbMetrics: DbMetric[] = [];
  private aiMetrics: AiMetric[] = [];
  private maxMetrics = 1000; // 最多保留 1000 条记录

  // 记录 API 调用
  recordApiCall(path: string, method: string, duration: number, statusCode: number) {
    this.apiMetrics.push({
      path,
      method,
      duration,
      statusCode,
      timestamp: Date.now(),
    });

    // 限制数组大小
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics.shift();
    }

    // 慢请求告警
    if (duration > 1000) {
      console.warn(`⚠️  慢请求: ${method} ${path} - ${duration}ms`);
    }
  }

  // 记录数据库查询
  recordDbQuery(query: string, duration: number) {
    this.dbMetrics.push({
      query: query.substring(0, 200), // 只保留前 200 个字符
      duration,
      timestamp: Date.now(),
    });

    if (this.dbMetrics.length > this.maxMetrics) {
      this.dbMetrics.shift();
    }

    // 慢查询告警
    if (duration > 100) {
      console.warn(`⚠️  慢查询: ${query.substring(0, 100)} - ${duration}ms`);
    }
  }

  // 记录 AI 调用
  recordAiCall(type: "image" | "video" | "text", model: string, duration: number, success: boolean) {
    this.aiMetrics.push({
      type,
      model,
      duration,
      success,
      timestamp: Date.now(),
    });

    if (this.aiMetrics.length > this.maxMetrics) {
      this.aiMetrics.shift();
    }

    // AI 调用失败告警
    if (!success) {
      console.warn(`⚠️  AI 调用失败: ${type} - ${model}`);
    }
  }

  // 获取 API 性能统计
  getApiStats(minutes: number = 5) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.apiMetrics.filter((m) => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return null;
    }

    const durations = recentMetrics.map((m) => m.duration).sort((a, b) => a - b);
    const total = recentMetrics.length;
    const errors = recentMetrics.filter((m) => m.statusCode >= 400).length;

    return {
      total,
      errors,
      errorRate: (errors / total) * 100,
      avg: durations.reduce((a, b) => a + b, 0) / total,
      p50: durations[Math.floor(total * 0.5)],
      p95: durations[Math.floor(total * 0.95)],
      p99: durations[Math.floor(total * 0.99)],
      min: durations[0],
      max: durations[total - 1],
    };
  }

  // 获取数据库性能统计
  getDbStats(minutes: number = 5) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.dbMetrics.filter((m) => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return null;
    }

    const durations = recentMetrics.map((m) => m.duration);
    const slowQueries = recentMetrics.filter((m) => m.duration > 100).length;

    return {
      total: recentMetrics.length,
      slowQueries,
      slowQueryRate: (slowQueries / recentMetrics.length) * 100,
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      max: Math.max(...durations),
    };
  }

  // 获取 AI 调用统计
  getAiStats(minutes: number = 5) {
    const cutoff = Date.now() - minutes * 60 * 1000;
    const recentMetrics = this.aiMetrics.filter((m) => m.timestamp > cutoff);

    if (recentMetrics.length === 0) {
      return null;
    }

    const byType = {
      image: recentMetrics.filter((m) => m.type === "image"),
      video: recentMetrics.filter((m) => m.type === "video"),
      text: recentMetrics.filter((m) => m.type === "text"),
    };

    const stats: any = {};

    for (const [type, metrics] of Object.entries(byType)) {
      if (metrics.length === 0) continue;

      const durations = metrics.map((m) => m.duration);
      const successful = metrics.filter((m) => m.success).length;

      stats[type] = {
        total: metrics.length,
        successful,
        failed: metrics.length - successful,
        successRate: (successful / metrics.length) * 100,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        max: Math.max(...durations),
      };
    }

    return stats;
  }

  // 获取内存使用情况
  getMemoryStats() {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024), // MB
    };
  }

  // 获取完整报告
  getReport(minutes: number = 5) {
    return {
      timestamp: new Date().toISOString(),
      period: `${minutes} minutes`,
      api: this.getApiStats(minutes),
      database: this.getDbStats(minutes),
      ai: this.getAiStats(minutes),
      memory: this.getMemoryStats(),
    };
  }

  // 清空所有指标
  clear() {
    this.apiMetrics = [];
    this.dbMetrics = [];
    this.aiMetrics = [];
  }
}

// 全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 性能计时器辅助函数
export function createTimer() {
  const start = Date.now();
  return {
    end: () => Date.now() - start,
  };
}

// Express 中间件：记录 API 性能
export function performanceMiddleware(req: any, res: any, next: any) {
  const timer = createTimer();

  // 监听响应完成
  res.on("finish", () => {
    const duration = timer.end();
    performanceMonitor.recordApiCall(req.path, req.method, duration, res.statusCode);
  });

  next();
}
