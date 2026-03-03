import { Request, Response, NextFunction } from "express";
import { ErrorCode, type ErrorResponse } from "@/types/monitoring";
import { AppError } from "@/types/AppError";
import logger from "@/logging/logger";

export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction): void {
  const requestId = (req as any).requestId || "unknown";

  // 记录错误日志
  logger.error(err.message, err, {
    requestId,
    route: req.path,
    method: req.method,
    userId: (req as any).user?.id,
  });

  // 构建错误响应
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "服务器内部错误";
  let details: string[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.code;
    code = ErrorCode[err.code] || "UNKNOWN_ERROR";
    message = err.message;
    details = err.details;
  } else if ((err as any).status) {
    statusCode = (err as any).status;
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  // 生产环境不返回堆栈信息
  if (process.env.NODE_ENV !== "prod" && err.stack) {
    (errorResponse.error as any).stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
}

export function notFoundHandler(req: Request, res: Response): void {
  const requestId = (req as any).requestId || "unknown";

  logger.warn("路由不存在", {
    requestId,
    route: req.path,
    method: req.method,
  });

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "请求的资源不存在",
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  res.status(404).json(errorResponse);
}
