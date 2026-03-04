import { db } from "./db";
interface AiConfig {
  model?: string;
  apiKey: string;
  baseURL?: string;
  manufacturer: string;
}

const PROMPT_AI_CACHE_TTL_MS = 30 * 1000;
const promptAiCache = new Map<string, { value: AiConfig | {}; expiresAt: number }>();
const isTestEnv = process.env.NODE_ENV === "test";

export function invalidatePromptAiCache(): void {
  promptAiCache.clear();
}

export default async function getPromptAi(key: string): Promise<AiConfig | {}> {
  if (!isTestEnv) {
    const cached = promptAiCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
  }

  const aiConfigData = await db("t_aiModelMap")
    .leftJoin("t_config", "t_config.id", "t_aiModelMap.configId")
    .where("t_aiModelMap.key", key)
    .select("t_config.model", "t_config.apiKey", "t_config.baseUrl as baseURL", "t_config.manufacturer")
    .first();

  if (aiConfigData) {
    const value = aiConfigData as AiConfig;
    if (!isTestEnv) {
      promptAiCache.set(key, {
        value,
        expiresAt: Date.now() + PROMPT_AI_CACHE_TTL_MS,
      });
    }
    return value;
  }

  const emptyValue = {};
  if (!isTestEnv) {
    promptAiCache.set(key, {
      value: emptyValue,
      expiresAt: Date.now() + PROMPT_AI_CACHE_TTL_MS,
    });
  }
  return emptyValue;
}
