export const monitoringConfig = {
  logging: {
    level: process.env.LOG_LEVEL || "info",
    maxFiles: 30, // 保留天数
    maxSize: 100 * 1024 * 1024, // 100MB
    dirname: "logs",
  },
  health: {
    enabled: true,
    path: "/health",
    checks: ["database", "disk", "memory"],
  },
  alerting: {
    enabled: process.env.ALERT_ENABLED === "true",
    rules: {
      errorRate: { threshold: 0.05, window: "5m" },
      responseTime: { threshold: 3000, percentile: 95 },
      aiFailureRate: { threshold: 0.1, window: "5m" },
    },
    channels: {
      webhook: process.env.ALERT_WEBHOOK_URL,
      email: process.env.ALERT_EMAIL,
    },
  },
};
