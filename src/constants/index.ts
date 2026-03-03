/**
 * 系统常量配置
 */

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  /** 默认端口号 */
  PORT: 60000,
  /** 默认用户 ID */
  DEFAULT_USER_ID: 1,
  /** 默认设置 ID */
  DEFAULT_SETTING_ID: 1,
  /** 默认 OSS URL */
  DEFAULT_OSS_URL: "http://127.0.0.1:60000/",
} as const;

/**
 * 文件大小限制
 */
export const FILE_SIZE_LIMITS = {
  /** 请求体大小限制（10MB） */
  REQUEST_BODY: "10mb",
  /** 日志文件最大大小（1GB） */
  LOG_FILE_MAX_SIZE: 1000 * 1024 * 1024,
} as const;

/**
 * 速率限制配置
 */
export const RATE_LIMIT_CONFIG = {
  /** 时间窗口（15分钟） */
  WINDOW_MS: 15 * 60 * 1000,
  /** 最大请求数 */
  MAX_REQUESTS: 100,
} as const;

/**
 * 数据库配置
 */
export const DATABASE_CONFIG = {
  /** 连接池最小连接数 */
  POOL_MIN: 1,
  /** 连接池最大连接数 */
  POOL_MAX: 5,
} as const;

/**
 * 图片尺寸配置
 */
export const IMAGE_CONFIG = {
  /** 默认视频比例 */
  DEFAULT_VIDEO_RATIO: "16:9",
  /** 默认图片尺寸 */
  DEFAULT_SIZE: "2K",
} as const;

/**
 * 认证白名单路径
 */
export const AUTH_WHITELIST = ["/other/login"] as const;

/**
 * 环境变量
 */
export const ENV_NAMES = {
  DEV: "dev",
  PROD: "prod",
} as const;
