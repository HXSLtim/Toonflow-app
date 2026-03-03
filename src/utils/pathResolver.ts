import path from "path";

/**
 * 判断是否在 Electron 环境中运行
 */
export function isElectronEnvironment(): boolean {
  return typeof process.versions?.electron !== "undefined";
}

/**
 * 获取用户数据目录路径
 * - Electron 环境：返回 userData 目录
 * - 非 Electron 环境：返回当前工作目录
 */
export function getUserDataDir(): string {
  if (isElectronEnvironment()) {
    const { app } = require("electron");
    return app.getPath("userData");
  }
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
