import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 格式类型定义
export type FormatType = "novel" | "screenplay" | "comic" | "game" | "auto";

// 解析结果接口
interface ParseResult {
  format: FormatType;
  content: {
    title?: string;
    characters: Array<{ name: string; description: string }>;
    scenes: Array<{ name: string; description: string }>;
    dialogues: Array<{ character: string; text: string; scene?: string }>;
    actions: Array<{ description: string; scene?: string }>;
  };
}

// 多格式文本解析
export default router.post(
  "/",
  validateFields({
    text: z.string().min(1),
    format: z.enum(["novel", "screenplay", "comic", "game", "auto"]).default("auto"),
    projectId: z.number(),
  }),
  async (req, res) => {
    const { text, format, projectId } = req.body;

    try {
      const apiConfig = await u.getPromptAi("textParse");

      const systemPrompt = `你是一个专业的文本格式解析专家。你需要识别并解析不同格式的文本内容，包括：
1. 小说格式：叙事性文本，包含对话、场景描述、心理活动
2. 剧本格式：标准影视剧本，包含场景标注、人物对白、动作描述
3. 漫画脚本：分镜描述、对话框、画面构图说明
4. 游戏对话文本：角色对话树、选项分支、场景触发

请将文本解析为结构化数据，提取角色、场景、对话和动作信息。`;

      const userPrompt = `请解析以下${format === "auto" ? "文本（自动识别格式）" : format + "格式文本"}：

${text}

请以JSON格式返回解析结果，包含：
- format: 识别出的格式类型
- content: 包含 title, characters, scenes, dialogues, actions 的结构化数据`;

      const result = await u.ai.text.invoke(
        {
          system: systemPrompt,
          prompt: userPrompt,
        },
        apiConfig
      );

      const parseResult: ParseResult = JSON.parse(result.text);

      // 保存解析结果到数据库
      const [novelId] = await u.db("t_novel").insert({
        projectId,
        chapter: parseResult.content.title || "未命名章节",
        chapterData: JSON.stringify(parseResult),
        createTime: Date.now(),
      });

      return res.status(200).send(
        success({
          novelId,
          format: parseResult.format,
          data: parseResult.content,
        })
      );
    } catch (e) {
      const msg = u.error(e).message || "文本解析失败";
      return res.status(400).send(error(msg));
    }
  }
);
