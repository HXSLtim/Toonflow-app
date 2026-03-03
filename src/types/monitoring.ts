// 监控和日志系统类型定义

export interface LogContext {
  requestId?: string;
  userId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
    requestId?: string;
    timestamp: string;
  };
}

export enum ErrorCode {
  // 客户端错误 4xx
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 422,

  // 服务端错误 5xx
  INTERNAL_ERROR = 500,
  DATABASE_ERROR = 501,
  AI_SERVICE_ERROR = 502,
  EXTERNAL_API_ERROR = 503,
}

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database?: { status: string; latency?: number };
    disk?: { status: string; usage?: number };
    memory?: { status: string; usage?: number };
  };
}
