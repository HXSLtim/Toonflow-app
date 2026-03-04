// Prometheus 指标收集器
// 使用简单的内存存储，避免引入额外依赖

interface Metric {
  name: string;
  type: "counter" | "gauge" | "histogram";
  help: string;
  value: number | Map<string, number>;
  labels?: string[];
}

class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();

  // 注册指标
  register(name: string, type: Metric["type"], help: string, labels?: string[]): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        type,
        help,
        value: type === "histogram" ? new Map() : 0,
        labels,
      });
    }
  }

  // 增加计数器
  inc(name: string, labels?: Record<string, string>, value: number = 1): void {
    const metric = this.metrics.get(name);
    if (!metric) return;

    if (labels && metric.labels) {
      const key = this.getLabelKey(labels);
      if (metric.value instanceof Map) {
        metric.value.set(key, (metric.value.get(key) || 0) + value);
      }
    } else {
      if (typeof metric.value === "number") {
        metric.value += value;
      }
    }
  }

  // 设置仪表盘值
  set(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric) return;

    if (labels && metric.labels) {
      const key = this.getLabelKey(labels);
      if (metric.value instanceof Map) {
        metric.value.set(key, value);
      }
    } else {
      metric.value = value;
    }
  }

  // 观察直方图值
  observe(name: string, value: number, labels?: Record<string, string>): void {
    const metric = this.metrics.get(name);
    if (!metric || metric.type !== "histogram") return;

    const key = labels ? this.getLabelKey(labels) : "default";
    if (metric.value instanceof Map) {
      const bucket = this.getBucket(value);
      const bucketKey = `${key}_${bucket}`;
      metric.value.set(bucketKey, (metric.value.get(bucketKey) || 0) + 1);
    }
  }

  // 获取标签键
  private getLabelKey(labels: Record<string, string>): string {
    return Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(",");
  }

  // 获取直方图桶
  private getBucket(value: number): string {
    const buckets = [0.1, 0.5, 1, 2, 5, 10];
    for (const bucket of buckets) {
      if (value <= bucket) return bucket.toString();
    }
    return "+Inf";
  }

  // 导出 Prometheus 格式
  export(): string {
    let output = "";

    for (const metric of this.metrics.values()) {
      output += `# HELP ${metric.name} ${metric.help}\n`;
      output += `# TYPE ${metric.name} ${metric.type}\n`;

      if (metric.value instanceof Map) {
        for (const [key, value] of metric.value.entries()) {
          if (metric.type === "histogram") {
            const [labels, bucket] = key.split("_");
            output += `${metric.name}_bucket{${labels},le="${bucket}"} ${value}\n`;
          } else {
            output += `${metric.name}{${key}} ${value}\n`;
          }
        }
      } else {
        output += `${metric.name} ${metric.value}\n`;
      }

      output += "\n";
    }

    return output;
  }

  // 重置所有指标
  reset(): void {
    for (const metric of this.metrics.values()) {
      if (metric.value instanceof Map) {
        metric.value.clear();
      } else {
        metric.value = 0;
      }
    }
  }
}

// 全局指标收集器实例
const metrics = new MetricsCollector();

// 注册默认指标
metrics.register("http_requests_total", "counter", "Total HTTP requests", ["method", "route", "status"]);
metrics.register("http_request_duration_seconds", "histogram", "HTTP request latency", ["method", "route"]);
metrics.register("ai_calls_total", "counter", "Total AI calls", ["provider", "model", "status"]);
metrics.register("ai_call_duration_seconds", "histogram", "AI call latency", ["provider", "model"]);
metrics.register("ai_tokens_total", "counter", "Total AI tokens consumed", ["provider", "model", "type"]);
metrics.register("process_cpu_usage", "gauge", "Process CPU usage percentage");
metrics.register("process_memory_usage_bytes", "gauge", "Process memory usage in bytes");
metrics.register("nodejs_heap_size_bytes", "gauge", "Node.js heap size in bytes");

export default metrics;
