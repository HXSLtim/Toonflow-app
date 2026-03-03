import fs from "fs";
import path from "path";
import { db } from "@/utils/db";

/**
 * 数据库备份恢复机制
 * 支持自动备份、手动备份、恢复、清理旧备份
 */

export interface BackupOptions {
  maxBackups?: number; // 保留的最大备份数量，默认 7
  backupDir?: string; // 备份目录，默认为数据库同级 backups 目录
}

/**
 * 获取数据库文件路径
 */
function getDbPath(): string {
  if (typeof process.versions?.electron !== "undefined") {
    const { app } = require("electron");
    const userDataDir: string = app.getPath("userData");
    return path.join(userDataDir, "db.sqlite");
  } else {
    return path.join(process.cwd(), "db.sqlite");
  }
}

/**
 * 获取备份目录路径
 */
function getBackupDir(customDir?: string): string {
  if (customDir) {
    return customDir;
  }
  const dbPath = getDbPath();
  return path.join(path.dirname(dbPath), "backups");
}

/**
 * 确保备份目录存在
 */
function ensureBackupDir(backupDir: string): void {
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
}

/**
 * 生成备份文件名
 */
function generateBackupFileName(): string {
  const timestamp = new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "");
  return `db_${timestamp}.sqlite`;
}

/**
 * 备份数据库
 * 使用 SQLite 的 VACUUM INTO 命令进行热备份（不锁表）
 */
export async function backupDatabase(options: BackupOptions = {}): Promise<string> {
  const backupDir = getBackupDir(options.backupDir);
  ensureBackupDir(backupDir);

  const backupFileName = generateBackupFileName();
  const backupPath = path.join(backupDir, backupFileName);

  try {
    console.log(`开始备份数据库到: ${backupPath}`);

    // 使用 VACUUM INTO 进行热备份
    await db.raw("VACUUM INTO ?", [backupPath]);

    console.log(`✓ 数据库备份成功: ${backupPath}`);

    // 清理旧备份
    const maxBackups = options.maxBackups ?? 7;
    await cleanOldBackups(backupDir, maxBackups);

    return backupPath;
  } catch (error) {
    console.error("数据库备份失败:", error);
    throw error;
  }
}

/**
 * 清理旧备份文件
 * 保留最近的 N 个备份
 */
export async function cleanOldBackups(backupDir: string, maxBackups: number): Promise<void> {
  try {
    if (!fs.existsSync(backupDir)) {
      return;
    }

    // 获取所有备份文件
    const files = fs
      .readdirSync(backupDir)
      .filter((file) => file.startsWith("db_") && file.endsWith(".sqlite"))
      .map((file) => ({
        name: file,
        path: path.join(backupDir, file),
        mtime: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.mtime - a.mtime); // 按修改时间降序排序

    // 删除超出数量的旧备份
    if (files.length > maxBackups) {
      const filesToDelete = files.slice(maxBackups);
      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        console.log(`✓ 删除旧备份: ${file.name}`);
      }
    }
  } catch (error) {
    console.error("清理旧备份失败:", error);
    throw error;
  }
}

/**
 * 恢复数据库
 * 从备份文件恢复数据库
 * 警告：此操作会覆盖当前数据库
 */
export async function restoreDatabase(backupPath: string): Promise<void> {
  const dbPath = getDbPath();

  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份文件不存在: ${backupPath}`);
    }

    console.log(`开始从备份恢复数据库: ${backupPath}`);

    // 在恢复前先备份当前数据库
    const emergencyBackupDir = path.join(path.dirname(dbPath), "emergency_backups");
    ensureBackupDir(emergencyBackupDir);
    const emergencyBackupPath = path.join(emergencyBackupDir, `emergency_${generateBackupFileName()}`);
    fs.copyFileSync(dbPath, emergencyBackupPath);
    console.log(`✓ 当前数据库已备份到: ${emergencyBackupPath}`);

    // 关闭数据库连接
    await db.destroy();

    // 恢复数据库文件
    fs.copyFileSync(backupPath, dbPath);

    console.log(`✓ 数据库恢复成功，请重启应用以重新初始化连接`);
  } catch (error) {
    console.error("数据库恢复失败:", error);
    throw error;
  }
}

/**
 * 列出所有备份文件
 */
export function listBackups(backupDir?: string): Array<{ name: string; path: string; size: number; mtime: Date }> {
  const dir = getBackupDir(backupDir);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.startsWith("db_") && file.endsWith(".sqlite"))
    .map((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
      };
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
}

/**
 * 定时备份任务（可选）
 * 需要配合 node-cron 使用
 */
export function scheduleBackup(cronExpression: string, options: BackupOptions = {}): void {
  try {
    // 动态导入 node-cron（如果项目中已安装）
    const cron = require("node-cron");

    cron.schedule(cronExpression, async () => {
      try {
        console.log("执行定时备份任务...");
        await backupDatabase(options);
      } catch (error) {
        console.error("定时备份失败:", error);
      }
    });

    console.log(`✓ 定时备份任务已启动: ${cronExpression}`);
  } catch (error) {
    console.warn("node-cron 未安装，跳过定时备份任务");
  }
}
