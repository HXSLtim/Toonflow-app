import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// 添加角色服化道
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    characterId: z.number(), // 关联的角色ID
    type: z.enum(["costume", "makeup", "prop"]), // 服装/化妆/道具
    name: z.string(),
    description: z.string(),
    imageBase64: z.string().optional(),
    episodes: z.array(z.number()).optional(), // 关联的剧集
    tags: z.array(z.string()).optional(), // 标签：如"正式"、"休闲"、"战斗"等
  }),
  async (req, res) => {
    const { projectId, characterId, type, name, description, imageBase64, episodes, tags } = req.body;

    try {
      // 验证项目和角色存在
      const project = await u.db("t_project").where("id", projectId).first();
      if (!project) {
        return res.status(404).send(error("项目不存在"));
      }

      const character = await u.db("t_assets")
        .where({ id: characterId, projectId, type: "role" })
        .first();
      if (!character) {
        return res.status(404).send(error("角色不存在"));
      }

      let imagePath = null;

      // 如果提供了图片，生成服化道图片
      if (imageBase64) {
        const apiConfig = await u.getPromptAi("assetsImage");

        const systemPrompt = `你是一个专业的服装/化妆/道具设计师。请根据角色特征和描述生成对应的${
          type === "costume" ? "服装" : type === "makeup" ? "化妆" : "道具"
        }设计图。`;

        const userPrompt = `
角色名称：${character.name}
角色描述：${character.intro}

${type === "costume" ? "服装" : type === "makeup" ? "化妆" : "道具"}名称：${name}
设计描述：${description}

画风风格：${project.artStyle || "未指定"}

请生成符合角色特征的${type === "costume" ? "服装" : type === "makeup" ? "化妆" : "道具"}设计图。`;

        const imageResult = await u.ai.image(
          {
            systemPrompt,
            prompt: userPrompt,
            imageBase64: imageBase64 ? [imageBase64] : [],
            size: "2K",
            aspectRatio: "1:1",
          },
          apiConfig
        );

        const match = imageResult.match(/base64,([A-Za-z0-9+/=]+)/);
        const buffer = Buffer.from(match && match.length >= 2 ? match[1]! : imageResult!, "base64");

        imagePath = `/${projectId}/costume/${type}/${uuidv4()}.jpg`;
        await u.oss.writeFile(imagePath, buffer);
      }

      // 保存服化道信息
      const [costumeId] = await u.db("t_assets").insert({
        projectId,
        name,
        intro: description,
        type: type === "costume" ? "服装" : type === "makeup" ? "化妆" : "道具",
        filePath: imagePath,
        remark: JSON.stringify({
          characterId,
          episodes: episodes || [],
          tags: tags || [],
        }),
        state: "completed",
      });

      return res.status(200).send(
        success({
          costumeId,
          imagePath: imagePath ? await u.oss.getFileUrl(imagePath) : null,
        })
      );
    } catch (e) {
      const msg = u.error(e).message || "添加服化道失败";
      return res.status(400).send(error(msg));
    }
  }
);
