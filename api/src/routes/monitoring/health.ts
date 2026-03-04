import { Request, Response } from "express";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";
import type { HealthCheckResult } from "@/types/monitoring";

const startTime = Date.now();

interface CheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  usage?: number;
  message?: string;
}

async function checkDatabase(): Promise<CheckResult> {
  try {
    const start = Date.now();
    const db = (await import("@/utils")).default.db;

    // 简单的数据库查询测试
    await db.raw("SELECT 1");

    const latency = Date.now() - start;

    return {
      status: latency < 100 ? "healthy" : latency < 500 ? "degraded" : "unhealthy",
      latency,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: error instanceof Error ? error.message : "数据库连接失败",
    };
  }
}

function checkMemory(): CheckResult {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usage = (usedMem / totalMem) * 100;

  return {
    status: usage < 80 ? "healthy" : usage < 90 ? "degraded" : "unhealthy",
    usage: Math.round(usage * 100) / 100,
  };
}

function checkDisk(): CheckResult {
  try {
    const logDir = path.join(process.cwd(), "logs");

    if (!fs.existsSync(logDir)) {
      return { status: "healthy", usage: 0 };
    }

    // 计算日志目录大小
    let totalSize = 0;
    const files = fs.readdirSync(logDir);

    for (const file of files) {
      const filePath = path.join(logDir, file);
      const stats = fs.statSync(filePath);
      totalSize += stats.size;
    }

    // 转换为 MB
    const sizeMB = totalSize / (1024 * 1024);
    const maxSizeMB = 1000; // 假设最大 1GB
    const usage = (sizeMB / maxSizeMB) * 100;

    return {
      status: usage < 70 ? "healthy" : usage < 85 ? "degraded" : "unhealthy",
      usage: Math.round(usage * 100) / 100,
    };
  } catch (error) {
    return {
      status: "degraded",
      message: "无法检查磁盘使用情况",
    };
  }
}

export default async function healthCheck(req: Request, res: Response) {
  const checks: HealthCheckResult["checks"] = {};

  // 并行执行所有检查
  const [dbCheck, memCheck, diskCheck] = await Promise.all([
    checkDatabase(),
    Promise.resolve(checkMemory()),
    Promise.resolve(checkDisk()),
  ]);

  checks.database = dbCheck;
  checks.memory = memCheck;
  checks.disk = diskCheck;

  // 确定整体状态
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  for (const check of Object.values(checks)) {
    if (check.status === "unhealthy") {
      overallStatus = "unhealthy";
      break;
    } else if (check.status === "degraded" && overallStatus === "healthy") {
      overallStatus = "degraded";
    }
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 200 : 503;
  res.status(statusCode).json(result);
}
