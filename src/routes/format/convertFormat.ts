import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 格式转换
export default router.post(
  "/",
  validateFields({
    novelId: z.number(),
    targetFormat: z.enum(["novel", "screenplay", "comic", "game"]),
  }),
  async (req, res) => {
    const { novelId, targetFormat } = req.body;

    try {
      const novel = await u.db("t_novel").where("id", novelId).first();
      if (!novel) {
        return res.status(404).send(error("文本不存在"));
      }

      if (typeof novel.chapterData !== "string" || novel.chapterData.length === 0) {
        return res.status(400).send(error("文本内容为空，无法转换格式"));
      }

      const sourceData = JSON.parse(novel.chapterData);
      const apiConfig = await u.getPromptAi("textParse");

      const formatDescriptions = {
        novel: "小说格式：叙事性文本，包含细腻的心理描写和场景描述",
        screenplay: "剧本格式：标准影视剧本，包含场景标注(INT./EXT.)、人物对白、动作描述",
        comic: "漫画脚本：分镜描述、对话框内容、画面构图和视觉效果说明",
        game: "游戏对话文本：角色对话、选项分支、场景触发条件",
      };

      const systemPrompt = `你是一个专业的文本格式转换专家。请将给定的结构化内容转换为指定格式。`;

      const formatKey = targetFormat as keyof typeof formatDescriptions;

      const userPrompt = `请将以下内容转换为${formatDescriptions[formatKey]}：

源格式：${sourceData.format}
源内容：
${JSON.stringify(sourceData.content, null, 2)}

请输出转换后的文本内容。`;

      const result = await u.ai.text.invoke(
        {
          system: systemPrompt,
          prompt: userPrompt,
        },
        apiConfig
      );

      const convertedText = result.text;

      // 保存转换结果
      const [newNovelId] = await u.db("t_novel").insert({
        projectId: novel.projectId,
        chapter: `${novel.chapter} (转换为${formatKey})`,
        chapterData: JSON.stringify({
          format: formatKey,
          originalId: novelId,
          content: convertedText,
        }),
        createTime: Date.now(),
      });

      return res.status(200).send(
        success({
          novelId: newNovelId,
          format: formatKey,
          content: convertedText,
        })
      );
    } catch (e) {
      const msg = u.error(e).message || "格式转换失败";
      return res.status(400).send(error(msg));
    }
  }
);
