import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

// 默认环境变量（当 env 文件不存在时自动创建）
const defaultEnvValues: Record<string, string> = {
  dev: `NODE_ENV=dev\nPORT=60000\nOSSURL=http://127.0.0.1:60000/\nJWT_SECRET=dev-secret-key-change-in-production-min-32-chars\nALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`,
  prod: `NODE_ENV=prod\nPORT=60000\nOSSURL=http://127.0.0.1:60000/\nJWT_SECRET=CHANGE_THIS_IN_PRODUCTION_MIN_32_CHARS\nALLOWED_ORIGINS=https://your-domain.com`,
};

// 加载环境变量（纯 Web 服务默认使用 dev）
const env = process.env.NODE_ENV ?? "dev";
if (!env) {
  console.log("[环境变量为空]");
  process.exit(1);
} else {
  const envDir = path.resolve("env");
  const envFilePath = path.join(envDir, `.env.${env}`);

  // 自动创建 env 目录和文件（.gitignore 可能忽略了这些文件）
  if (!existsSync(envDir)) {
    mkdirSync(envDir, { recursive: true });
  }
  if (!existsSync(envFilePath)) {
    const content = defaultEnvValues[env] ?? defaultEnvValues.prod;
    writeFileSync(envFilePath, content, "utf8");
    console.log(`[环境变量] 自动创建 ${envFilePath}`);
  }

  const text = readFileSync(envFilePath, "utf8");
  for (const line of text.split("\n")) {
    const idx = line.indexOf("=");
    if (idx > 0) process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  console.log(`[环境变量] ${env}`);

  // 验证必需的安全配置
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error("[安全错误] JWT_SECRET 必须至少 32 个字符");
    process.exit(1);
  }
  if (process.env.JWT_SECRET.includes("CHANGE_THIS") || process.env.JWT_SECRET.includes("dev-secret")) {
    console.warn("[安全警告] 生产环境请修改默认的 JWT_SECRET");
  }
}
