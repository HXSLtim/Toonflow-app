import u from "@/utils";

type AIType = "text" | "image" | "video";

interface BaseConfig {
  model: string;
  apiKey: string;
  manufacturer: string;
}

interface TextResData extends BaseConfig {
  baseURL: string;
  manufacturer: "deepseek" | "openAi" | "doubao" | "other";
}

// 图像模型配置接口
interface ImageResData extends BaseConfig {
  manufacturer: "gemini" | "volcengine" | "kling" | "vidu" | "runninghub" | "apimart" | "other";
}

interface VideoResData extends BaseConfig {
  baseURL: string;
  manufacturer: "openAi" | "volcengine" | "runninghub" | "apimart" | "confyUI";
}

type ResDataMap = {
  text: TextResData;
  image: ImageResData;
  video: VideoResData;
};

const errorMessages: Record<AIType, string> = {
  text: "文本模型配置不存在",
  image: "图像模型配置不存在",
  video: "视频模型配置不存在",
};

const needBaseURL: AIType[] = ["text", "video", "image"];
const CONFIG_CACHE_TTL_MS = 30 * 1000;
const configCache = new Map<string, { value: BaseConfig | (BaseConfig & { baseURL: string }); expiresAt: number }>();
const isTestEnv = process.env.NODE_ENV === "test";

export function invalidateConfigCache(): void {
  configCache.clear();
}

export default async function getConfig<T extends AIType>(aiType: T, manufacturer?: string): Promise<ResDataMap[T]> {
  const cacheKey = `${aiType}:${manufacturer ?? "*"}`;
  if (!isTestEnv) {
    const cached = configCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as ResDataMap[T];
    }
  }

  const config = await u
    .db("t_config")
    .where("type", aiType)
    .modify((qb) => {
      if (manufacturer) {
        qb.where("manufacturer", manufacturer);
      }
    })
    .first();

  if (!config) throw new Error(errorMessages[aiType]);

  const result: BaseConfig = {
    model: config?.model ?? "",
    apiKey: config?.apiKey ?? "",
    manufacturer: config?.manufacturer ?? "",
  };

  if (needBaseURL.includes(aiType)) {
    const value = { ...result, baseURL: config.baseUrl } as ResDataMap[T];
    if (!isTestEnv) {
      configCache.set(cacheKey, {
        value,
        expiresAt: Date.now() + CONFIG_CACHE_TTL_MS,
      });
    }
    return value;
  }

  const value = result as ResDataMap[T];
  if (!isTestEnv) {
    configCache.set(cacheKey, {
      value,
      expiresAt: Date.now() + CONFIG_CACHE_TTL_MS,
    });
  }
  return value;
}
