import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "@/logging/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const requestId = uuidv4();
  const startTime = Date.now();

  // 将 requestId 附加到请求对象
  (req as any).requestId = requestId;

  // 设置日志上下文
  logger.setContext({
    requestId,
    route: req.path,
    method: req.method,
    userId: (req as any).user?.id,
  });

  // 监听响应完成
  res.on("finish", () => {
    const duration = Date.now() - startTime;

    logger.http("HTTP 请求", {
      statusCode: res.statusCode,
      duration,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });

    // 清除日志上下文
    logger.clearContext();
  });

  next();
}
