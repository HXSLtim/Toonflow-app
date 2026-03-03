import "./err";
import "./env";
import express, { Request, Response, NextFunction } from "express";
import expressWs from "express-ws";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import buildRoute from "@/core";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

// 新的日志和错误处理系统
import logger from "@/logging/logger";
import { requestLogger } from "@/middleware/requestLogger";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { AppError } from "@/types/AppError";
import { ErrorCode } from "@/types/monitoring";
import { performanceMonitoring } from "@/middleware/performance";
import alertManager from "@/monitoring/alerting";

const app = express();
let server: ReturnType<typeof app.listen> | null = null;

export default async function startServe(randomPort: Boolean = false) {
  if (process.env.NODE_ENV == "dev") await buildRoute();

  expressWs(app);

  // 请求日志中间件（生成 requestId 和上下文追踪）
  app.use(requestLogger);

  // 性能监控中间件（记录 HTTP 请求指标）
  app.use(performanceMonitoring);

  // HTTP 请求日志（开发环境）
  if (process.env.NODE_ENV !== "prod") {
    app.use(morgan("dev"));
  }

  // 修复 1: CORS 配置 - 只允许白名单域名
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  app.use(cors({
    origin: (origin, callback) => {
      // 允许无 origin 的请求（如 Postman、curl）
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    maxAge: 86400
  }));

  // 修复 2: 请求大小限制调整为 10MB
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 修复 3: 全局速率限制
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制100个请求
    message: { message: '请求过于频繁，请稍后再试' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  const rootDir = path.join(process.cwd(), "uploads");

  // 确保 uploads 目录存在
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  logger.info("文件目录初始化", { rootDir });

  app.use(express.static(rootDir));

  // 修复 4: JWT 认证中间件 - 使用环境变量中的 JWT_SECRET
  app.use(async (req, res, next) => {
    try {
      // 白名单路径
      if (req.path === "/other/login" || req.path === "/health" || req.path === "/metrics") {
        return next();
      }

      // 从 header 或 query 参数获取 token
      const rawToken = req.headers.authorization || (req.query.token as string) || "";
      const token = rawToken.replace("Bearer ", "");

      if (!token) {
        throw new AppError(ErrorCode.UNAUTHORIZED, "未提供 token");
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
      } catch (err) {
        throw new AppError(ErrorCode.UNAUTHORIZED, "无效的 token");
      }
    } catch (error) {
      next(error);
    }
  });

  const router = await import("@/router");
  await router.default(app);

  // 404 处理（使用新的中间件）
  app.use(notFoundHandler);

  // 错误处理（使用新的中间件）
  app.use(errorHandler);

  const port = randomPort ? 0 : parseInt(process.env.PORT || "60000");
  return await new Promise((resolve, reject) => {
    server = app.listen(port, async (v) => {
      const address = server?.address();
      const realPort = typeof address === "string" ? address : address?.port;
      logger.info("服务启动成功", {
        port: realPort,
        env: process.env.NODE_ENV || "development"
      });
      console.log(`[服务启动成功]: http://localhost:${realPort}`);

      // 启动告警监控（生产环境）
      if (process.env.NODE_ENV === "prod" && process.env.ALERT_ENABLED === "true") {
        alertManager.startMonitoring(60000); // 每分钟检查一次
      }

      resolve(realPort);
    });
  });
}

// 支持await关闭
export function closeServe(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err?: Error) => {
        if (err) return reject(err);
        logger.info("服务已关闭");
        console.log("[服务已关闭]");
        logger.close(); // 关闭日志系统
        resolve();
      });
    } else {
      resolve();
    }
  });
}

startServe();
