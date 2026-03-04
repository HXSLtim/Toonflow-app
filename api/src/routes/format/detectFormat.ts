import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 自动识别文本格式
export default router.post(
  "/",
  validateFields({
    text: z.string().min(1),
  }),
  async (req, res) => {
    const { text } = req.body;

    try {
      const apiConfig = await u.getPromptAi("textParse");

      const systemPrompt = `你是一个文本格式识别专家。请识别给定文本的格式类型。`;

      const userPrompt = `请识别以下文本的格式类型：

${text.substring(0, 2000)} ${text.length > 2000 ? "..." : ""}

可能的格式类型：
1. novel - 小说格式（叙事性文本，包含对话、场景描述、心理活动）
2. screenplay - 剧本格式（标准影视剧本，包含场景标注、人物对白、动作描述）
3. comic - 漫画脚本（分镜描述、对话框、画面构图说明）
4. game - 游戏对话文本（角色对话树、选项分支、场景触发）

请以JSON格式返回：
{
  "format": "识别出的格式类型",
  "confidence": 0-1之间的置信度,
  "features": ["识别依据的特征1", "特征2", ...],
  "suggestion": "处理建议"
}`;

      const result = await u.ai.text.invoke(
        {
          system: systemPrompt,
          prompt: userPrompt,
        },
        apiConfig
      );

      const detection = JSON.parse(result.text);

      return res.status(200).send(success(detection));
    } catch (e) {
      const msg = u.error(e).message || "格式识别失败";
      return res.status(400).send(error(msg));
    }
  }
);
