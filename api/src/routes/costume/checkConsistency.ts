import express from "express";
import u from "@/utils";
import { z } from "zod";
import { success, error } from "@/lib/responseFormat";
import { validateFields } from "@/middleware/middleware";

const router = express.Router();

// 检查服化道一致性
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    scriptId: z.number(),
    characterId: z.number(),
  }),
  async (req, res) => {
    const { projectId, scriptId, characterId } = req.body;

    try {
      // 获取剧本信息
      const script = await u.db("t_script").where("id", scriptId).first();
      if (!script) {
        return res.status(404).send(error("剧本不存在"));
      }

      // 获取角色信息
      const character = await u.db("t_assets")
        .where({ id: characterId, projectId, type: "role" })
        .first();
      if (!character) {
        return res.status(404).send(error("角色不存在"));
      }

      // 获取该角色的所有服化道
      const costumes = await u.db("t_assets")
        .where({ projectId })
        .whereIn("type", ["服装", "化妆", "道具"])
        .select("*");

      const characterCostumes = costumes.filter((costume) => {
        try {
          const remark = JSON.parse(costume.remark || "{}");
          return remark.characterId === characterId;
        } catch {
          return false;
        }
      });

      // 使用AI分析剧本中的服化道描述
      const apiConfig = await u.getPromptAi("textParse");

      const systemPrompt = `你是一个专业的影视制作顾问。请分析剧本中角色的服装、化妆和道具描述，检查是否与已有的服化道库一致。`;

      const costumeList = characterCostumes.map((c) => ({
        name: c.name,
        type: c.type,
        description: c.intro,
      }));

      const userPrompt = `
角色名称：${character.name}
剧本内容：
${script.content}

已有服化道库：
${JSON.stringify(costumeList, null, 2)}

请分析：
1. 剧本中提到的该角色的服装、化妆、道具
2. 是否与已有服化道库一致
3. 如有不一致或缺失，请指出并给出建议

请以JSON格式返回：
{
  "consistent": true/false,
  "issues": [{"type": "服装/化妆/道具", "description": "问题描述", "suggestion": "建议"}],
  "missing": [{"type": "服装/化妆/道具", "description": "缺失的服化道描述"}]
}`;

      const result = await u.ai.text.invoke(
        {
          system: systemPrompt,
          prompt: userPrompt,
        },
        apiConfig
      );

      const analysis = JSON.parse(result.text);

      return res.status(200).send(
        success({
          consistent: analysis.consistent,
          issues: analysis.issues || [],
          missing: analysis.missing || [],
          existingCostumes: costumeList,
        })
      );
    } catch (e) {
      const msg = u.error(e).message || "一致性检查失败";
      return res.status(400).send(error(msg));
    }
  }
);
