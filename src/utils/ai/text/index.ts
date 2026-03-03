import u from "@/utils";
import { generateText, streamText, Output, stepCountIs, ModelMessage, LanguageModel, Tool, GenerateTextResult } from "ai";
import { wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "@ai-sdk/devtools";
import { parse } from "best-effort-json-parser";
import { getModelList } from "./modelList";
import { z } from "zod";
import { OpenAIProvider } from "@ai-sdk/openai";

interface AIInput<T extends Record<string, z.ZodTypeAny> | undefined = undefined> {
  system?: string;
  tools?: Record<string, Tool>;
  maxStep?: number;
  output?: T;
  prompt?: string;
  messages?: Array<ModelMessage>;
  timeout?: number; // 超时时间（毫秒）
  retries?: number; // 重试次数
}

interface AIConfig {
  model?: string;
  apiKey?: string;
  baseURL?: string;
  manufacturer?: string;
  fallbackModels?: string[]; // 降级模型列表
}

const buildOptions = async <T extends Record<string, z.ZodTypeAny> | undefined>(
  input: AIInput<T>,
  config: AIConfig = {}
) => {
  if (!config || !config?.model || !config?.apiKey || !config?.manufacturer) throw new Error("请检查模型配置是否正确");
  const { model, apiKey, baseURL, manufacturer } = { ...config };
  let owned;
  const modelList = await getModelList();
  if (manufacturer == "other") {
    owned = modelList.find((m) => m.manufacturer === manufacturer);
  } else {
    owned = modelList.find((m) => m.model === model && m.manufacturer === manufacturer);
    if (!owned) owned = modelList.find((m) => m.manufacturer === manufacturer);
  }
  if (!owned) throw new Error("不支持的厂商");

  const modelInstance = owned.instance({ apiKey, baseURL: baseURL!, name: "xixixi" });

  const maxStep = input.maxStep ?? (input.tools ? Object.keys(input.tools).length * 5 : undefined);
  const outputBuilders: Record<string, (schema: T) => unknown> = {
    schema: (s) => {
      return Output.object({ schema: z.object(s as Record<string, z.ZodTypeAny>) });
    },
    object: () => {
      const jsonSchemaPrompt = `\n请按照以下 JSON Schema 格式返回结果:\n${JSON.stringify(
        z.toJSONSchema(z.object(input.output as Record<string, z.ZodTypeAny>)),
        null,
        2,
      )}\n只返回结果，不要将Schema返回。`;
      input.system = (input.system ?? "") + jsonSchemaPrompt;
      // return Output.json();
    },
  };

  const output = input.output ? (outputBuilders[owned.responseFormat]?.(input.output) ?? null) : null;
  const chatModelManufacturer = ["volcengine", "other", "openai", "modelScope","grsai"];
  const modelFn = chatModelManufacturer.includes(owned.manufacturer) ? (modelInstance as OpenAIProvider).chat(model!) : modelInstance(model!);

  return {
    config: {
      model: modelFn as LanguageModel,
      ...(input.system && { system: input.system }),
      ...(input.prompt ? { prompt: input.prompt } : { messages: input.messages! }),
      ...(input.tools && owned.tool && { tools: input.tools }),
      ...(maxStep && { stopWhen: stepCountIs(maxStep) }),
      ...(output && { output }),
    },
    responseFormat: owned.responseFormat,
  };
};

type InferOutput<T> = T extends Record<string, z.ZodTypeAny> ? z.infer<z.ZodObject<T>> : GenerateTextResult<Record<string, Tool>, never>;

// 模型降级配置
const FALLBACK_MODELS: Record<string, string[]> = {
  'claude-opus-4-5': ['gpt-4o', 'gemini-2.5-pro', 'deepseek-chat'],
  'claude-sonnet-4-5': ['gpt-4o-mini', 'gemini-2.0-flash', 'deepseek-chat'],
  'gpt-4o': ['claude-sonnet-4-5', 'gemini-2.5-pro', 'deepseek-chat'],
  'gpt-4o-mini': ['claude-sonnet-4-5', 'gemini-2.0-flash', 'deepseek-chat'],
  'gemini-2.5-pro': ['claude-opus-4-5', 'gpt-4o', 'deepseek-chat'],
  'gemini-2.0-flash': ['gpt-4o-mini', 'deepseek-chat'],
  'deepseek-chat': ['gpt-4o-mini', 'gemini-2.0-flash'],
};

// 重试逻辑（简化版，不依赖 p-retry）
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === retries) {
        throw lastError;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // 指数退避：1s, 2s, 4s
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// 超时包装器
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI 调用超时（${timeoutMs}ms）`)), timeoutMs)
    )
  ]);
}

const ai = Object.create({}) as {
  invoke<T extends Record<string, z.ZodTypeAny> | undefined = undefined>(input: AIInput<T>, config?: AIConfig): Promise<InferOutput<T>>;
  stream(input: AIInput, config?: AIConfig): Promise<ReturnType<typeof streamText>>;
};

ai.invoke = async (input: AIInput<any>, config: AIConfig) => {
  const retries = input.retries ?? 3;
  const timeout = input.timeout ?? 5 * 60 * 1000; // 默认 5 分钟
  const fallbackModels = config.fallbackModels ?? FALLBACK_MODELS[config.model!] ?? [];

  // 构建模型尝试列表：主模型 + 降级模型
  const modelsToTry = [config.model!, ...fallbackModels];

  let lastError: Error;

  for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
    const currentModel = modelsToTry[modelIndex];
    const currentConfig = { ...config, model: currentModel };

    try {
      // 带重试和超时的调用
      const result = await retryWithBackoff(
        async () => {
          const options = await buildOptions(input, currentConfig);
          return await withTimeout(generateText(options.config), timeout);
        },
        retries,
        (attempt, error) => {
          console.log(`[AI] 模型 ${currentModel} 第 ${attempt} 次重试，原因: ${error.message}`);
        }
      );

      // 处理响应格式
      if (result) {
        const options = await buildOptions(input, currentConfig);

        if (options.responseFormat === "object" && input.output) {
          const pattern = /{[^{}]*}|{(?:[^{}]*|{[^{}]*})*}/g;
          const jsonLikeTexts = Array.from(result.text.matchAll(pattern), (m) => m[0]);
          const res = jsonLikeTexts.map((jsonText) => parse(jsonText));
          return res[0];
        }

        if (options.responseFormat === "schema" && input.output) {
          return JSON.parse(result.text);
        }

        return result;
      }
    } catch (error) {
      lastError = error as Error;

      // 如果不是最后一个模型，尝试降级
      if (modelIndex < modelsToTry.length - 1) {
        console.log(`[AI] 模型 ${currentModel} 失败，切换到降级模型 ${modelsToTry[modelIndex + 1]}`);
        continue;
      }

      // 所有模型都失败了
      throw new Error(`所有模型调用失败。最后错误: ${lastError.message}`);
    }
  }

  throw lastError!;
};

ai.stream = async (input: AIInput, config: AIConfig) => {
  const timeout = input.timeout ?? 5 * 60 * 1000;
  const options = await buildOptions(input, config);

  // 流式调用暂不支持降级，但支持超时
  return await withTimeout(streamText(options.config), timeout);
};

export default ai;
