import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// 自动生成角色着装
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    characterId: z.number(),
    scriptId: z.number(),
    scene: z.string().optional(), // 场景描述
    mood: z.string().optional(), // 情绪/氛围
  }),
  async (req, res) => {
    const { projectId, characterId, scriptId, scene, mood } = req.body;

    try {
      // 获取项目、角色、剧本信息
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

      const script = await u.db("t_script").where("id", scriptId).first();
      if (!script) {
        return res.status(404).send(error("剧本不存在"));
      }

      // 获取该角色已有的服化道
      const existingCostumes = await u.db("t_assets")
        .where({ projectId })
        .whereIn("type", ["服装", "化妆", "道具"])
        .select("*");

      const characterCostumes = existingCostumes.filter((costume) => {
        try {
          const remark = JSON.parse(costume.remark || "{}");
          return remark.characterId === characterId;
        } catch {
          return false;
        }
      });

      const apiConfig = await u.getPromptAi("textParse");

      const systemPrompt = `你是一个专业的服装造型师和美术指导。请根据角色特征、剧本场景和情绪氛围，为角色设计合适的着装方案。`;

      const userPrompt = `
角色信息：
- 名称：${character.name}
- 描述：${character.intro}

剧本场景：
${script.content}

${scene ? `特定场景：${scene}` : ""}
${mood ? `情绪氛围：${mood}` : ""}

已有服化道库：
${JSON.stringify(
  characterCostumes.map((c) => ({
    name: c.name,
    type: c.type,
    description: c.intro,
  })),
  null,
  2
)}

请为该角色在此场景下设计着装方案，包括：
1. 服装选择（可从已有库中选择或设计新的）
2. 化妆风格
3. 必要的道具

请以JSON格式返回：
{
  "costume": {
    "useExisting": true/false,
    "existingId": 如果使用已有则填ID,
    "newDesign": {
      "name": "服装名称",
      "description": "详细描述",
      "imagePrompt": "图片生成提示词"
    }
  },
  "makeup": {
    "name": "化妆风格",
    "description": "详细描述"
  },
  "props": [
    {
      "name": "道具名称",
      "description": "详细描述"
    }
  ],
  "reasoning": "设计理由"
}`;

      const result = await u.ai.text.invoke(
        {
          system: systemPrompt,
          prompt: userPrompt,
        },
        apiConfig
      );

      const design = JSON.parse(result.text);

      // 如果需要生成新服装图片
      let costumeImagePath = null;
      if (!design.costume.useExisting && design.costume.newDesign) {
        const imageConfig = await u.getPromptAi("assetsImage");
        const imageResult = await u.ai.image(
          {
            systemPrompt: "你是一个专业的服装设计师，请生成符合描述的服装设计图。",
            prompt: design.costume.newDesign.imagePrompt,
            size: "2K",
            aspectRatio: "1:1",
          },
          imageConfig
        );

        const match = imageResult.match(/base64,([A-Za-z0-9+/=]+)/);
        const buffer = Buffer.from(match && match.length >= 2 ? match[1]! : imageResult!, "base64");

        costumeImagePath = `/${projectId}/costume/auto/${uuidv4()}.jpg`;
        await u.oss.writeFile(costumeImagePath, buffer);

        // 保存新服装到数据库
        const [newCostumeId] = await u.db("t_assets").insert({
          projectId,
          name: design.costume.newDesign.name,
          intro: design.costume.newDesign.description,
          type: "服装",
          filePath: costumeImagePath,
          remark: JSON.stringify({
            characterId,
            episodes: [],
            tags: ["自动生成"],
            scriptId,
          }),
          state: "completed",
        });

        design.costume.newId = newCostumeId;
      }

      return res.status(200).send(
        success({
          design,
          costumeImagePath: costumeImagePath ? await u.oss.getFileUrl(costumeImagePath) : null,
        })
      );
    } catch (e) {
      const msg = u.error(e).message || "生成着装方案失败";
      return res.status(400).send(error(msg));
    }
  }
);
