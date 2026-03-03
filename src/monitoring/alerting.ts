import axios from "axios";
import logger from "@/logging/logger";
import { monitoringConfig } from "@/config/monitoring";

interface AlertRule {
  name: string;
  condition: () => boolean | Promise<boolean>;
  message: string;
  severity: "info" | "warning" | "critical";
}

interface AlertChannel {
  type: "webhook" | "email";
  url?: string;
  email?: string;
}

class AlertManager {
  private rules: AlertRule[] = [];
  private channels: AlertChannel[] = [];
  private alertHistory: Map<string, number> = new Map();
  private cooldownMs = 5 * 60 * 1000; // 5 分钟冷却期

  constructor() {
    this.initializeChannels();
  }

  private initializeChannels(): void {
    if (monitoringConfig.alerting.channels.webhook) {
      this.channels.push({
        type: "webhook",
        url: monitoringConfig.alerting.channels.webhook,
      });
    }

    if (monitoringConfig.alerting.channels.email) {
      this.channels.push({
        type: "email",
        email: monitoringConfig.alerting.channels.email,
      });
    }
  }

  registerRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  async checkRules(): Promise<void> {
    if (!monitoringConfig.alerting.enabled) return;

    for (const rule of this.rules) {
      try {
        const shouldAlert = await rule.condition();

        if (shouldAlert) {
          await this.sendAlert(rule);
        }
      } catch (error) {
        logger.error("告警规则检查失败", error as Error, { rule: rule.name });
      }
    }
  }

  private async sendAlert(rule: AlertRule): Promise<void> {
    const now = Date.now();
    const lastAlert = this.alertHistory.get(rule.name);

    // 检查冷却期
    if (lastAlert && now - lastAlert < this.cooldownMs) {
      return;
    }

    this.alertHistory.set(rule.name, now);

    const alertMessage = {
      title: `[${rule.severity.toUpperCase()}] ${rule.name}`,
      message: rule.message,
      timestamp: new Date().toISOString(),
      severity: rule.severity,
    };

    logger.warn("触发告警", alertMessage);

    // 发送到所有通道
    for (const channel of this.channels) {
      try {
        if (channel.type === "webhook" && channel.url) {
          await this.sendWebhook(channel.url, alertMessage);
        } else if (channel.type === "email" && channel.email) {
          await this.sendEmail(channel.email, alertMessage);
        }
      } catch (error) {
        logger.error("发送告警失败", error as Error, { channel: channel.type });
      }
    }
  }

  private async sendWebhook(url: string, message: any): Promise<void> {
    // 企业微信格式
    if (url.includes("qyapi.weixin.qq.com")) {
      await axios.post(url, {
        msgtype: "markdown",
        markdown: {
          content: `## ${message.title}\n\n${message.message}\n\n时间: ${message.timestamp}`,
        },
      });
    }
    // 钉钉格式
    else if (url.includes("oapi.dingtalk.com")) {
      await axios.post(url, {
        msgtype: "markdown",
        markdown: {
          title: message.title,
          text: `## ${message.title}\n\n${message.message}\n\n时间: ${message.timestamp}`,
        },
      });
    }
    // 通用 Webhook
    else {
      await axios.post(url, message);
    }
  }

  private async sendEmail(email: string, message: any): Promise<void> {
    // 邮件发送需要配置 SMTP，这里仅记录日志
    logger.info("邮件告警", { email, message });
  }

  startMonitoring(intervalMs: number = 60000): void {
    setInterval(() => {
      this.checkRules();
    }, intervalMs);

    logger.info("告警监控已启动", { interval: intervalMs });
  }
}

// 全局告警管理器实例
const alertManager = new AlertManager();

// 注册默认告警规则
// 这些规则需要根据实际指标数据来实现
// 示例：错误率告警
alertManager.registerRule({
  name: "高错误率告警",
  condition: async () => {
    // TODO: 实现错误率检查逻辑
    // 从 metrics 中获取错误率数据
    return false;
  },
  message: "过去 5 分钟内错误率超过 5%",
  severity: "warning",
});

export default alertManager;
