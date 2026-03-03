import path from "path";

/**
 * 纯 Web 服务模式固定返回 false，保留函数用于兼容旧调用
 */
export function isElectronEnvironment(): boolean {
  return false;
}

/**
 * 获取用户数据目录路径
 * 纯 Web 服务模式：返回当前工作目录
 */
export function getUserDataDir(): string {
  return process.cwd();
}

/**
 * 获取指定子目录的完整路径
 * @param subDir 子目录名称（如 "uploads", "logs", "env"）
 */
export function getSubDir(subDir: string): string {
  return path.join(getUserDataDir(), subDir);
}

/**
 * 获取数据库文件路径
 */
export function getDbPath(): string {
  return path.join(getUserDataDir(), "db.sqlite");
}

/**
 * 获取上传文件目录路径
 */
export function getUploadsDir(): string {
  return getSubDir("uploads");
}

/**
 * 获取日志目录路径
 */
export function getLogsDir(): string {
  return getSubDir("logs");
}

/**
 * 获取环境变量目录路径
 */
export function getEnvDir(): string {
  return getSubDir("env");
}
