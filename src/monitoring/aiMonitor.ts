import metrics from "@/monitoring/metrics";
import logger from "@/logging/logger";

interface AICallOptions {
  provider: string;
  model: string;
  operation: string;
}

interface AICallResult {
  success: boolean;
  duration: number;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  error?: Error;
}

export async function monitorAICall<T>(
  options: AICallOptions,
  fn: () => Promise<T>,
): Promise<T> {
  const { provider, model, operation } = options;
  const startTime = Date.now();

  try {
    const result = await fn();
    const duration = (Date.now() - startTime) / 1000;

    // 记录成功的 AI 调用
    metrics.inc("ai_calls_total", { provider, model, status: "success" });
    metrics.observe("ai_call_duration_seconds", duration, { provider, model });

    // 如果结果包含 token 信息，记录 token 消耗
    if (result && typeof result === "object" && "usage" in result) {
      const usage = (result as any).usage;
      if (usage?.promptTokens) {
        metrics.inc("ai_tokens_total", { provider, model, type: "prompt" }, usage.promptTokens);
      }
      if (usage?.completionTokens) {
        metrics.inc("ai_tokens_total", { provider, model, type: "completion" }, usage.completionTokens);
      }
      if (usage?.totalTokens) {
        metrics.inc("ai_tokens_total", { provider, model, type: "total" }, usage.totalTokens);
      }
    }

    logger.info("AI 调用成功", {
      provider,
      model,
      operation,
      duration: Math.round(duration * 1000),
    });

    return result;
  } catch (error) {
    const duration = (Date.now() - startTime) / 1000;

    // 记录失败的 AI 调用
    metrics.inc("ai_calls_total", { provider, model, status: "error" });
    metrics.observe("ai_call_duration_seconds", duration, { provider, model });

    logger.error("AI 调用失败", error as Error, {
      provider,
      model,
      operation,
      duration: Math.round(duration * 1000),
    });

    throw error;
  }
}
