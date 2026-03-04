import * as fs from "fs";
import * as path from "path";
import type { LogContext } from "@/types/monitoring";

type LogLevel = "error" | "warn" | "info" | "http" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  metadata?: Record<string, any>;
  stack?: string;
}

function getLogDir(): string {
  return path.join(process.cwd(), "logs");
}

const LOG_DIR = getLogDir();
const MAX_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_AGE_DAYS = 30;

class StructuredLogger {
  private streams: Map<string, fs.WriteStream> = new Map();
  private logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || "info";
  private context: LogContext = {};

  private levelPriority: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  };

  init(): this {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    this.cleanOldLogs();
    return this;
  }

  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  clearContext(): void {
    this.context = {};
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] <= this.levelPriority[this.logLevel];
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private getLogFileName(level: LogLevel): string {
    const date = new Date().toISOString().split("T")[0];
    return path.join(LOG_DIR, `${date}-${level}.log`);
  }

  private getStream(level: LogLevel): fs.WriteStream {
    const fileName = this.getLogFileName(level);
    let stream = this.streams.get(fileName);

    if (!stream || stream.destroyed) {
      stream = fs.createWriteStream(fileName, { flags: "a" });
      this.streams.set(fileName, stream);
    }

    this.checkRotate(fileName, stream);
    return stream;
  }

  private checkRotate(fileName: string, stream: fs.WriteStream): void {
    try {
      if (!fs.existsSync(fileName)) return;
      const stats = fs.statSync(fileName);

      if (stats.size >= MAX_SIZE) {
        stream.end();
        this.streams.delete(fileName);

        // 重命名为带时间戳的归档文件
        const timestamp = Date.now();
        const archiveName = fileName.replace(".log", `-${timestamp}.log`);
        fs.renameSync(fileName, archiveName);
      }
    } catch (err) {
      console.error("日志轮转失败:", err);
    }
  }

  private cleanOldLogs(): void {
    try {
      if (!fs.existsSync(LOG_DIR)) return;

      const files = fs.readdirSync(LOG_DIR);
      const now = Date.now();
      const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

      for (const file of files) {
        const filePath = path.join(LOG_DIR, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.error("清理旧日志失败:", err);
    }
  }

  private write(level: LogLevel, message: string, metadata?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      ...this.context,
      ...(metadata && { metadata }),
      ...(error?.stack && { stack: error.stack }),
    };

    const line = JSON.stringify(entry) + "\n";

    // 写入对应级别的日志文件
    const stream = this.getStream(level);
    stream.write(line);

    // error 和 warn 同时写入 error 日志
    if (level === "warn") {
      const errorStream = this.getStream("error");
      errorStream.write(line);
    }

    // 控制台输出（开发环境）
    if (process.env.NODE_ENV !== "prod") {
      const consoleMethod = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
      consoleMethod(`[${level.toUpperCase()}]`, message, metadata || "");
    }
  }

  error(message: string, error?: Error, metadata?: Record<string, any>): void {
    this.write("error", message, metadata, error);
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.write("warn", message, metadata);
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.write("info", message, metadata);
  }

  http(message: string, metadata?: Record<string, any>): void {
    this.write("http", message, metadata);
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.write("debug", message, metadata);
  }

  close(): void {
    const streams = Array.from(this.streams.values());
    for (const stream of streams) {
      stream.end();
    }
    this.streams.clear();
  }
}

const logger = new StructuredLogger().init();
export default logger;
