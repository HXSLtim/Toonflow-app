// 集成新日志和错误处理系统的示例代码
// 此文件展示如何修改 src/app.ts 以使用新系统

import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import buildRoute from "@/core";
import fs from "fs";
import path from "path";
import u from "@/utils";
import jwt from "jsonwebtoken";

// 导入新的日志和错误处理系统
import logger from "@/logging/logger";
import { requestLogger } from "@/middleware/requestLogger";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { AppError, ErrorCode } from "@/types/monitoring";

const app = express();
let server: ReturnType<typeof app.listen> | null = null;

export default async function startServe(randomPort: Boolean = false) {
  if (process.env.NODE_ENV == "dev") await buildRoute();

  expressWs(app);

  // 1. 添加请求日志中间件（在所有路由之前）
  app.use(requestLogger);

  // 原有中间件
  app.use(cors({ origin: "*" }));
  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: true, limit: "100mb" }));

  let rootDir: string;
  if (typeof process.versions?.electron !== "undefined") {
    const { app } = require("electron");
    const userDataDir: string = app.getPath("userData");
    rootDir = path.join(userDataDir, "uploads");
  } else {
    rootDir = path.join(process.cwd(), "uploads");
  }

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }
  logger.info("文件目录初始化", { rootDir });

  app.use(express.static(rootDir));

  // 2. 改进 token 验证中间件，使用新的错误处理
  app.use(async (req, res, next) => {
    try {
      const setting = await u.db("t_setting").where("id", 1).select("tokenKey").first();
      if (!setting) {
        throw new AppError(ErrorCode.INTERNAL_ERROR, "服务器未配置，请联系管理员");
      }

      const { tokenKey } = setting;
      const rawToken = req.headers.authorization || (req.query.token as string) || "";
      const token = rawToken.replace("Bearer ", "");

      // 白名单路径
      if (req.path === "/other/login" || req.path === "/health") {
        return next();
      }

      if (!token) {
        throw new AppError(ErrorCode.UNAUTHORIZED, "未提供 token");
      }

      try {
        const decoded = jwt.verify(token, tokenKey as string);
        (req as any).user = decoded;
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

  // 3. 使用新的 404 处理中间件（放在所有路由之后）
  app.use(notFoundHandler);

  // 4. 使用新的错误处理中间件（放在最后）
  app.use(errorHandler);

  const port = randomPort ? 0 : parseInt(process.env.PORT || "60000");
  return await new Promise((resolve, reject) => {
    server = app.listen(port, async (v) => {
      const address = server?.address();
      const realPort = typeof address === "string" ? address : address?.port;
      logger.info("服务启动成功", { port: realPort, env: process.env.NODE_ENV });
      console.log(`[服务启动成功]: http://localhost:${realPort}`);
      resolve(realPort);
    });
  });
}

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

const isElectron = typeof process.versions?.electron !== "undefined";
if (!isElectron) startServe();
