import { Request, Response } from "express";
import metrics from "@/monitoring/metrics";
import * as os from "os";

export default function metricsEndpoint(req: Request, res: Response) {
  // 更新系统指标
  const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
  metrics.set("process_cpu_usage", Math.round(cpuUsage * 100) / 100);

  const memUsage = process.memoryUsage();
  metrics.set("process_memory_usage_bytes", memUsage.rss);
  metrics.set("nodejs_heap_size_bytes", memUsage.heapUsed);

  // 导出 Prometheus 格式
  const output = metrics.export();

  res.set("Content-Type", "text/plain; version=0.0.4");
  res.send(output);
}
