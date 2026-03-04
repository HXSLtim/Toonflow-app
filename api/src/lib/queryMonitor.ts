import { Knex } from "knex";

/**
 * 数据库查询性能监控
 * 记录慢查询并输出警告
 */

interface QueryLog {
  sql: string;
  bindings?: any[];
  duration: number;
  timestamp: number;
}

const slowQueries: QueryLog[] = [];
const SLOW_QUERY_THRESHOLD = 1000; // 慢查询阈值：1秒
const MAX_SLOW_QUERIES = 100; // 最多保留的慢查询记录数

/**
 * 启用查询监控
 */
export function enableQueryMonitor(knex: Knex): void {
  knex
    .on("query", (query: any) => {
      query.__startTime = Date.now();
    })
    .on("query-response", (response: any, query: any) => {
      if (!query.__startTime) return;

      const duration = Date.now() - query.__startTime;

      // 记录慢查询
      if (duration > SLOW_QUERY_THRESHOLD) {
        const log: QueryLog = {
          sql: query.sql,
          bindings: query.bindings,
          duration,
          timestamp: Date.now(),
        };

        slowQueries.push(log);

        // 限制慢查询记录数量
        if (slowQueries.length > MAX_SLOW_QUERIES) {
          slowQueries.shift();
        }

        // 输出警告
        console.warn(`⚠️ 慢查询检测 (${duration}ms):`);
        console.warn(`   SQL: ${query.sql}`);
        if (query.bindings && query.bindings.length > 0) {
          console.warn(`   参数: ${JSON.stringify(query.bindings)}`);
        }
      }
    })
    .on("query-error", (error: any, query: any) => {
      console.error("❌ 查询错误:");
      console.error(`   SQL: ${query.sql}`);
      if (query.bindings && query.bindings.length > 0) {
        console.error(`   参数: ${JSON.stringify(query.bindings)}`);
      }
      console.error(`   错误: ${error.message}`);
    });

  console.log("✓ 数据库查询监控已启用");
}

/**
 * 获取慢查询记录
 */
export function getSlowQueries(): QueryLog[] {
  return [...slowQueries];
}

/**
 * 清空慢查询记录
 */
export function clearSlowQueries(): void {
  slowQueries.length = 0;
}

/**
 * 生成慢查询报告
 */
export function generateSlowQueryReport(): string {
  if (slowQueries.length === 0) {
    return "无慢查询记录";
  }

  const report = [
    "=== 慢查询报告 ===",
    `总数: ${slowQueries.length}`,
    `阈值: ${SLOW_QUERY_THRESHOLD}ms`,
    "",
  ];

  // 按耗时降序排序
  const sorted = [...slowQueries].sort((a, b) => b.duration - a.duration);

  sorted.forEach((log, index) => {
    report.push(`${index + 1}. 耗时: ${log.duration}ms`);
    report.push(`   时间: ${new Date(log.timestamp).toISOString()}`);
    report.push(`   SQL: ${log.sql}`);
    if (log.bindings && log.bindings.length > 0) {
      report.push(`   参数: ${JSON.stringify(log.bindings)}`);
    }
    report.push("");
  });

  return report.join("\n");
}

/**
 * 分析查询并提供优化建议
 */
export function analyzeQuery(sql: string): string[] {
  const suggestions: string[] = [];

  // 检查是否缺少 WHERE 条件
  if (sql.toLowerCase().includes("select") && !sql.toLowerCase().includes("where") && !sql.toLowerCase().includes("limit")) {
    suggestions.push("建议添加 WHERE 条件或 LIMIT 限制，避免全表扫描");
  }

  // 检查是否使用了 SELECT *
  if (sql.toLowerCase().includes("select *")) {
    suggestions.push("建议明确指定需要的列，避免使用 SELECT *");
  }

  // 检查是否缺少索引（简单判断）
  const whereMatch = sql.match(/where\s+(\w+)\s*=/i);
  if (whereMatch) {
    suggestions.push(`建议为字段 ${whereMatch[1]} 添加索引`);
  }

  // 检查是否使用了 OR 条件
  if (sql.toLowerCase().includes(" or ")) {
    suggestions.push("OR 条件可能导致索引失效，考虑使用 IN 或 UNION");
  }

  // 检查是否使用了函数
  if (sql.match(/where\s+\w+\s*\(/i)) {
    suggestions.push("WHERE 条件中使用函数会导致索引失效");
  }

  return suggestions;
}
