/**
 * 通用类型定义
 */

/**
 * Outline 数据结构
 */
export interface OutlineItem {
  name: string;
  description?: string;
}

export interface OutlineData {
  chapterRange?: number[];
  characters?: OutlineItem[];
  props?: OutlineItem[];
  scenes?: OutlineItem[];
}

/**
 * 数据库查询结果类型
 */
export interface CountResult {
  total: number;
}

export interface MaxResult {
  max: number | null;
}

export interface MaxIdResult {
  maxId: number | null;
}

/**
 * 视频配置类型
 */
export interface VideoConfig {
  id: number;
  projectId?: number;
  scriptId?: number;
  manufacturer?: string;
  mode?: string;
  prompt?: string;
  images?: string;
  duration?: number;
  resolution?: string;
  startFrame?: string;
  endFrame?: string;
  audioEnabled?: number;
  aiConfigId?: number;
  selectedResultId?: number;
  createTime?: number;
  updateTime?: number;
}

/**
 * 错误类型
 */
export interface AppError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * 事件数据类型
 */
export type EventData = string | number | boolean | object | null | undefined;

/**
 * JSON 值类型
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export interface JsonObject {
  [key: string]: JsonValue;
}
export type JsonArray = JsonValue[];

/**
 * 数据库连接回调类型
 */
export type DbConnectionCallback = (err?: Error) => void;

/**
 * SQLite 连接类型
 */
export interface SqliteConnection {
  run(sql: string, callback: DbConnectionCallback): void;
}
