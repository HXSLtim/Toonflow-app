/**
 * 资产类型枚举
 */
export type AssetType = "role" | "scene" | "props" | "storyboard";

/**
 * Prompt 配置接口
 */
interface PromptConfig {
  artStyle?: string;
  name: string;
  prompt: string;
}

/**
 * 资产类型到中文名称的映射
 */
const ASSET_TYPE_NAMES: Record<AssetType, string> = {
  role: "角色",
  scene: "场景",
  props: "道具",
  storyboard: "分镜",
};

/**
 * 资产类型到 Prompt Code 的映射
 */
const ASSET_TYPE_PROMPT_CODES: Record<AssetType, string> = {
  role: "role-generateImage",
  scene: "scene-generateImage",
  props: "tool-generateImage",
  storyboard: "storyboard-generateImage",
};

/**
 * 构建资产生成的用户 Prompt
 * @param type 资产类型
 * @param config Prompt 配置
 * @returns 格式化的用户 Prompt
 */
export function buildAssetPrompt(type: AssetType, config: PromptConfig): string {
  const typeName = ASSET_TYPE_NAMES[type];
  const { artStyle, name, prompt } = config;

  const baseParams = `
    **基础参数：**
    - 画风风格: ${artStyle || "未指定"}

    **${typeName}设定：**
    - 名称:${name},
    - 提示词:${prompt},
  `;

  const instructions: Record<AssetType, string> = {
    role: `请根据以下参数生成角色标准四视图：${baseParams}\n    请严格按照系统规范生成人物角色四视图。`,
    scene: `请根据以下参数生成标准场景图：${baseParams}\n    请严格按照系统规范生成标准场景图。`,
    props: `请根据以下参数生成标准道具图：${baseParams}\n    请严格按照系统规范生成标准道具图。`,
    storyboard: `请根据以下参数生成标准分镜图：${baseParams}\n    请严格按照系统规范生成标准分镜图。`,
  };

  return instructions[type];
}

/**
 * 获取资产类型对应的 Prompt Code
 * @param type 资产类型
 * @returns Prompt Code
 */
export function getAssetPromptCode(type: AssetType): string {
  return ASSET_TYPE_PROMPT_CODES[type];
}

/**
 * 获取资产类型的中文名称
 * @param type 资产类型
 * @returns 中文名称
 */
export function getAssetTypeName(type: AssetType): string {
  return ASSET_TYPE_NAMES[type];
}

/**
 * 生成资产图片的文件路径
 * @param projectId 项目 ID
 * @param type 资产类型
 * @param filename 文件名（包含扩展名）
 * @returns 相对路径
 */
export function buildAssetImagePath(projectId: number, type: AssetType, filename: string): string {
  return `/${projectId}/${type}/${filename}`;
}
