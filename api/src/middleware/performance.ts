import { Request, Response, NextFunction } from "express";
import metrics from "@/monitoring/metrics";

export function performanceMonitoring(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // 监听响应完成
  res.on("finish", () => {
    const duration = (Date.now() - startTime) / 1000; // 转换为秒
    const route = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode.toString();

    // 记录 HTTP 请求指标
    metrics.inc("http_requests_total", { method, route, status });
    metrics.observe("http_request_duration_seconds", duration, { method, route });
  });

  next();
}
